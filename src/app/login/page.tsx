import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/server/session";
import { GoogleSignInButton } from "./_components/GoogleSignInButton";

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session) redirect("/");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Cards
        </h1>
        <p className="text-muted-foreground">
          Sign in to open your wallet — your cards follow you to every device.
        </p>
      </div>
      <GoogleSignInButton />
    </main>
  );
}
