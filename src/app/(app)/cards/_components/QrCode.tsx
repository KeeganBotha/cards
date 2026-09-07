import QRCode from "qrcode";
import { UnencodableNotice } from "./UnencodableNotice";

const QUIET_ZONE = 4; // modules of white around the symbol, per the QR spec

/**
 * Square QR sized to its container (max 20rem, like the mobile app's 320px).
 * `qrcode` only computes the module matrix (ECC level M); the SVG is ours, so
 * this renders on the server like the linear Barcode.
 */
export function QrCode({ value }: { value: string }) {
  let size: number;
  let path: string;
  try {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
    size = modules.size;
    const cells: string[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (modules.get(y, x)) cells.push(`M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z`);
      }
    }
    path = cells.join("");
  } catch {
    return <UnencodableNotice />;
  }

  const extent = size + QUIET_ZONE * 2;
  return (
    <svg
      role="img"
      aria-label={`QR code for ${value}`}
      className="mx-auto aspect-square w-full max-w-xs"
      viewBox={`0 0 ${extent} ${extent}`}
      shapeRendering="crispEdges"
    >
      <path d={path} className="fill-barcode-ink" />
    </svg>
  );
}
