import { LoadMore } from "@/components/LoadMore";
import { listCards } from "../_data/cards.service";
import { CardGrid } from "./CardGrid";

// Async section (UI.md §6): the data fetch lives INSIDE the Suspense boundary
// so the page shell (heading, Add card, search box) never waits on it.
export async function CardGridSection({ query, limit }: { query: string; limit: number }) {
  const { cards, totalCount } = await listCards({ query, limit });
  return (
    <div className="flex flex-col gap-6">
      <CardGrid cards={cards} query={query} />
      <LoadMore limit={limit} shownCount={cards.length} totalCount={totalCount} />
    </div>
  );
}
