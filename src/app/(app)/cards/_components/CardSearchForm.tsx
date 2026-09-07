import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Server component: search is a READ, so it is a GET form writing ?q= to the
// URL (PATTERNS.md §1 — never a Server Action for reads; UI.md §8 — shareable
// state lives in the URL). No client JS needed.
export function CardSearchForm({ query }: { query: string }) {
  return (
    <form action="/cards" method="get" role="search" className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor="card-search" className="sr-only">
          Search cards
        </Label>
        <Input
          id="card-search"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by store"
          maxLength={60}
          autoComplete="off"
        />
      </div>
      <Button type="submit" variant="outline" aria-label="Search">
        <Search />
      </Button>
      {query && (
        <Link
          href="/cards"
          aria-label="Clear search"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <X />
        </Link>
      )}
    </form>
  );
}
