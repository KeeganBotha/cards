import { verifySession, getSessionUser } from "@/lib/server/session";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "./_components/SignOutButton";

// The authenticated app shell (SPEC "Routes & screens"): one feature, so the
// header carries no nav — title, who is signed in, theme, sign out. Cards has
// no settings page in v1 (nothing to set).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession(); // fail fast (UX) — the real gate is in the service
  const user = await getSessionUser(); // cheap: memoized session, no extra query

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Cards
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
