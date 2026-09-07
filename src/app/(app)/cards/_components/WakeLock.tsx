"use client";

import { useEffect } from "react";

// Rule 2: hold a Screen Wake Lock while show mode is open so the screen doesn't
// dim mid-checkout. Re-acquired when the tab comes back (the OS releases it on
// hide), released on leave. Failure is silent — unsupported browsers just dim.
export function WakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) await sentinel.release();
      } catch {
        // Low battery, permission policy, unsupported: nothing to do.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, []);
  return null;
}
