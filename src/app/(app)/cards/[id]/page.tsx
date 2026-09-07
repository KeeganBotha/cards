import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { verifySession } from "@/lib/server/session";
import { buttonVariants } from "@/components/ui/button";
import { FORMAT_LABELS } from "@/lib/barcode/format";
import { cn } from "@/lib/utils";
import { Barcode } from "../_components/Barcode";
import { DeleteCardButton } from "../_components/DeleteCardButton";
import { MarkCardUsed } from "../_components/MarkCardUsed";
import { QrCode } from "../_components/QrCode";
import { tileClass } from "../_components/tile-colors";
import { WakeLock } from "../_components/WakeLock";
import { getCard } from "../_data/cards.service";
import { cardIdParamSchema } from "../_data/cards.schemas";

// Show mode (SPEC rule 2): black-on-white symbol on a plain white panel, wake
// lock held, number as selectable text fallback. Opening it counts as use
// (rule 4) via the MarkCardUsed leaf. Someone else's id → notFound (rule 9).
export default async function ShowCardPage({ params }: PageProps<"/cards/[id]">) {
  await verifySession(); // fail fast (UX) — the real gate is in the service

  // Route params are client input (PATTERNS.md §3): parse before any service.
  const { id } = await params;
  const parsed = cardIdParamSchema.safeParse(id);
  if (!parsed.success) notFound();

  const card = await getCard(parsed.data);
  if (!card) notFound();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/cards"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
        >
          <ArrowLeft aria-hidden="true" />
          Wallet
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/cards/${card.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            aria-label="Edit card"
          >
            <Pencil />
          </Link>
          <DeleteCardButton id={card.id} storeName={card.storeName} />
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <h1
          className={cn(
            "px-6 py-5 text-2xl font-semibold tracking-tight",
            tileClass(card.color),
          )}
        >
          {card.storeName}
        </h1>
        <div className="flex flex-col items-center gap-5 bg-barcode-paper px-6 py-8">
          {card.format === "QR" ? (
            <QrCode value={card.code} />
          ) : (
            <Barcode code={card.code} format={card.format} />
          )}
          <p className="select-all break-all text-center font-mono text-xl tracking-widest text-barcode-ink">
            {card.code}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-1 text-center text-sm text-muted-foreground">
        <p>{FORMAT_LABELS[card.format]}</p>
        <p>If the scanner struggles, turn your screen brightness up.</p>
      </div>

      <WakeLock />
      <MarkCardUsed id={card.id} />
    </div>
  );
}
