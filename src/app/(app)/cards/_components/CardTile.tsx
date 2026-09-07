import Link from "next/link";
import type { CardTileDto } from "../_data/cards.provider";
import { tileClass } from "./tile-colors";
import { cn } from "@/lib/utils";

// A coloured card-shaped tile: store name only, two lines max. Tapping opens
// show mode. Server component — nothing interactive beyond the link.
// aspect-[1.6]: the SPEC's tile ratio (a real card is ~1.586). ring-[3px] is
// the focus ring shadcn's own Button uses, kept identical for consistency.
export function CardTile({ card }: { card: CardTileDto }) {
  return (
    <Link
      href={`/cards/${card.id}`}
      className={cn(
        "flex aspect-[1.6] items-end rounded-xl p-3 shadow-sm transition-shadow outline-none hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50",
        tileClass(card.color),
      )}
    >
      <span className="line-clamp-2 text-base font-semibold leading-tight break-words">
        {card.storeName}
      </span>
    </Link>
  );
}
