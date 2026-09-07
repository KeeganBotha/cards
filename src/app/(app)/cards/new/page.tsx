import { verifySession } from "@/lib/server/session";
import { CardForm } from "../_components/CardForm";

export default async function NewCardPage() {
  await verifySession(); // fail fast (UX) — the real gate is in the service

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add card</h1>
      <CardForm mode="create" />
    </div>
  );
}
