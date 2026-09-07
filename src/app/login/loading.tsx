import { Spinner } from "@/components/Spinner";

// Route-level fallback for initial navigation (UI.md §6): just a spinner.
export default function LoginLoading() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      <Spinner />
    </main>
  );
}
