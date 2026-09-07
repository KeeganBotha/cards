"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BarcodeFormat } from "@/lib/barcode/format";
import { AUTO, codeErrorFor, type FormatChoice } from "../_data/cards.schemas";

// Progressive camera scanning (SPEC "Scan"): only where the native
// BarcodeDetector exists (Chromium as of writing). Where it is missing the Add
// page simply has no scan button; manual entry stays the primary path
// everywhere. No scanner library (Decision log, 2026-09-07).

/** BarcodeDetector format names → ours. Anything else resolves through Auto. */
const DETECTOR_FORMATS: Record<string, BarcodeFormat> = {
  ean_13: "EAN13",
  ean_8: "EAN8",
  upc_a: "UPCA",
  code_128: "CODE128",
  qr_code: "QR",
};
const WANTED = Object.keys(DETECTOR_FORMATS);
const DETECT_EVERY_MS = 150;

export type ScanHit = { code: string; format: FormatChoice };

/** The picker choice for a detection: the reported type, or Auto if the digits don't fit it. */
export function choiceForDetection(rawValue: string, detectorFormat: string): FormatChoice {
  const format = DETECTOR_FORMATS[detectorFormat];
  if (!format || codeErrorFor(rawValue, format)) return AUTO;
  return format;
}

type Status = "idle" | "starting" | "scanning" | "blocked" | "unavailable";

export function BarcodeScanner({ onHit }: { onHit: (hit: ScanHit) => void }) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Feature detection runs on the client only, so the server never renders the
  // button (no hydration mismatch) and Safari never sees it.
  useEffect(() => {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) return;
    let cancelled = false;
    BarcodeDetector.getSupportedFormats()
      .then((formats) => {
        if (!cancelled && formats.some((f) => WANTED.includes(f))) setSupported(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const stop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Camera + detection loop live for as long as status is "scanning".
  useEffect(() => {
    if (status !== "starting") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStatus("scanning");

        const detector = new BarcodeDetector({ formats: WANTED });
        const tick = async () => {
          if (cancelled) return;
          try {
            if (video.readyState >= 2) {
              const [hit] = await detector.detect(video);
              if (hit?.rawValue) {
                stop();
                setStatus("idle");
                onHit({
                  code: hit.rawValue.trim(),
                  format: choiceForDetection(hit.rawValue.trim(), hit.format),
                });
                return;
              }
            }
          } catch {
            // A frame that can't be decoded is not an error — try the next one.
          }
          timer = setTimeout(tick, DETECT_EVERY_MS);
        };
        void tick();
      } catch (error) {
        if (cancelled) return;
        const name = error instanceof DOMException ? error.name : "";
        setStatus(name === "NotAllowedError" || name === "SecurityError" ? "blocked" : "unavailable");
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stop();
    };
    // onHit is a stable callback from the form; status is the only trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!supported) return null;

  const open = status === "starting" || status === "scanning";

  return (
    <div className="flex flex-col gap-2">
      {!open && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setStatus("starting")}
          className="w-full sm:w-auto"
        >
          <Camera aria-hidden="true" />
          Scan a barcode
        </Button>
      )}
      {open && (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Mirrored playback would flip 1D codes; keep the natural orientation.
              aspect-[4/3]: the common phone camera sensor ratio, so the preview
              shows the full frame the detector sees. */}
          <video
            ref={videoRef}
            muted
            playsInline
            aria-label="Camera preview"
            className="aspect-[4/3] w-full bg-muted object-cover"
          />
          <div className="flex items-center justify-between gap-3 p-3">
            <p className="text-sm text-muted-foreground">
              {status === "starting"
                ? "Starting the camera…"
                : "Point the camera at the barcode. The number fills in on the first read."}
            </p>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Close camera"
              onClick={() => setStatus("idle")}
            >
              <X />
            </Button>
          </div>
        </div>
      )}
      {status === "blocked" && (
        <p className="text-sm text-muted-foreground">
          Camera access was blocked. Allow it in your browser settings to scan, or type the number
          below.
        </p>
      )}
      {status === "unavailable" && (
        <p className="text-sm text-muted-foreground">
          No camera could be started on this device. Type the number below instead.
        </p>
      )}
    </div>
  );
}
