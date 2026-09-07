import { notFound } from "next/navigation";
import { verifySession } from "@/lib/server/session";
import { CardForm } from "../../_components/CardForm";
import { getCard } from "../../_data/cards.service";
import { cardIdParamSchema } from "../../_data/cards.schemas";

export default async function EditCardPage({ params }: PageProps<"/cards/[id]/edit">) {
  await verifySession(); // fail fast (UX) — the real gate is in the service

  const { id } = await params;
  const parsed = cardIdParamSchema.safeParse(id);
  if (!parsed.success) notFound();

  const card = await getCard(parsed.data);
  if (!card) notFound();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit card</h1>
      <CardForm key={card.id} mode="edit" card={card} />
    </div>
  );
}
