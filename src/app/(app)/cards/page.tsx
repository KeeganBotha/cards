import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { verifySession } from "@/lib/server/session";
import { limitParamSchema } from "@/lib/pagination";
import { Spinner } from "@/components/Spinner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { searchQuerySchema } from "./_data/cards.schemas";
import { CardGridSection } from "./_components/CardGridSection";
import { CardSearchForm } from "./_components/CardSearchForm";

// The Wallet (SPEC "Routes & screens"): search + Add card in the header (not
// a FAB — same as mobile), then the tile grid, most recently used first.
export default async function CardsPage({ searchParams }: PageProps<"/cards">) {
  await verifySession(); // fail fast (UX) — the real gate is in the service
  const params = await searchParams;
  // searchParams are client input (PATTERNS.md §3): both parsers .catch() → never throw.
  const query = searchQuerySchema.parse(params.q);
  const limit = limitParamSchema.parse(params.limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wallet</h1>
        <Link href="/cards/new" className={cn(buttonVariants())}>
          <Plus aria-hidden="true" />
          Add card
        </Link>
      </div>
      <CardSearchForm query={query} />
      {/* key on the query only: a new search swaps the grid for the spinner,
          while Load more (a limit change) keeps the loaded tiles visible and
          streams the longer grid in — its pending state lives on the button. */}
      <Suspense key={query} fallback={<Spinner />}>
        <CardGridSection query={query} limit={limit} />
      </Suspense>
    </div>
  );
}
