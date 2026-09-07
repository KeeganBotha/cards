import type { CardTileDto } from "../_data/cards.provider";
import { CardTile } from "./CardTile";

// Server component: two columns on mobile, more from md:. Empty states are
// invitations, and differ for "no cards yet" vs "nothing matched" (UI.md §9).
export function CardGrid({ cards, query }: { cards: CardTileDto[]; query: string }) {
  if (cards.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-input px-4 py-10 text-center text-muted-foreground">
        {query
          ? `No cards match “${query}”.`
          : "No cards yet — add your first loyalty card and it'll be ready at the till."}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <li key={card.id}>
          <CardTile card={card} />
        </li>
      ))}
    </ul>
  );
}
