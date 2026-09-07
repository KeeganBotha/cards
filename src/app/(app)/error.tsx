"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Route-segment boundary for unexpected errors (PATTERNS.md §4): services and
// providers throw, this catches. Expected errors never reach here — they are
// ActionResult values.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-sm text-muted-foreground">
        The page hit an unexpected error. Your data is safe — try again, and if
        it keeps happening, sign out and back in.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
