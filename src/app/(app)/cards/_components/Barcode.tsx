import { tryEncodeLinear } from "@/lib/barcode";
import type { LinearFormat } from "@/lib/barcode/format";
import { UnencodableNotice } from "./UnencodableNotice";

/**
 * Full-width linear barcode. One SVG unit per module, stretched horizontally
 * with preserveAspectRatio="none", so bars stay proportional at any width.
 * Pure encoders → renders on the server, no client JS to show a card.
 * Ink/paper are the `barcode-*` tokens (black on white in BOTH themes).
 */
export function Barcode({ code, format }: { code: string; format: LinearFormat }) {
  const encoded = tryEncodeLinear(code, format);
  if (!encoded) return <UnencodableNotice />;

  return (
    <svg
      role="img"
      aria-label={`Barcode for ${code}`}
      className="h-36 w-full"
      viewBox={`0 0 ${encoded.modules} 1`}
      preserveAspectRatio="none"
    >
      {encoded.bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={0}
          width={bar.width}
          height={1}
          className="fill-barcode-ink"
        />
      ))}
    </svg>
  );
}
