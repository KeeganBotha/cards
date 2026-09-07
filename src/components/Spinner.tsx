import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// The loading indicator for page/section loads (UI.md §6): used as every
// Suspense fallback and inside loading.tsx files. Server-compatible (no
// interactivity). Skeletons are banned in app code.
export function Spinner({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn("flex items-center justify-center py-10", className)}
    >
      <Loader2
        aria-hidden="true"
        className="size-5 animate-spin text-muted-foreground"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
