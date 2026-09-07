"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LIMIT_STEP } from "@/lib/pagination";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// "Load more" as a plain link: the visible count lives in the URL (?limit=,
// UI.md §8) so the grown list is shareable and back/forward just work. Client
// leaf — needs the current URL to preserve the other search params (filter).
export function LoadMore({
  limit,
  shownCount,
  totalCount,
}: {
  limit: number;
  shownCount: number;
  totalCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (shownCount >= totalCount) return null;

  const params = new URLSearchParams(searchParams);
  params.set("limit", String(limit + LIMIT_STEP));
  const remaining = totalCount - shownCount;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* scroll={false}: the list grows in place — no jump to the top. */}
      <Link
        href={`${pathname}?${params.toString()}`}
        scroll={false}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <LoadMoreLabel remaining={remaining} />
      </Link>
      <p className="text-xs text-muted-foreground">
        Showing {shownCount} of {totalCount}
      </p>
    </div>
  );
}

// Inside the Link so useLinkStatus can show pending state on the button
// itself — the already-loaded rows stay put while the longer list streams in.
function LoadMoreLabel({ remaining }: { remaining: number }) {
  const { pending } = useLinkStatus();
  if (pending) {
    return (
      <>
        <Loader2 aria-hidden="true" className="animate-spin" />
        Loading…
      </>
    );
  }
  return <>Load {Math.min(LIMIT_STEP, remaining)} more</>;
}
