"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signIn = async () => {
    setPending(true);
    setErrorMessage(null);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    // Success navigates away; only an error keeps us on this page.
    if (error) {
      setErrorMessage("Could not start Google sign-in — try again.");
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={signIn} disabled={pending}>
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </Button>
      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
