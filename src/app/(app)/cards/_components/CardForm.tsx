"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { RHFCheckbox } from "@/components/RHFCheckbox";
import { RHFInput } from "@/components/RHFInput";
import { createCard, updateCard } from "../actions";
import { AUTO, cardFormSchema, resolveFormat } from "../_data/cards.schemas";
import type { CardDto } from "../_data/cards.provider";
import { CodeHint } from "./CodeHint";
import { RHFColorPicker } from "./RHFColorPicker";
import { RHFFormatPicker } from "./RHFFormatPicker";
import { cn } from "@/lib/utils";

type FormInput = z.input<typeof cardFormSchema>;
type FormOutput = z.output<typeof cardFormSchema>;

type Props = { mode: "create" } | { mode: "edit"; card: CardDto };

// The one card form, shared by /cards/new and /cards/[id]/edit. Canonical RHF
// pattern (UI.md §7). Edit pre-fills the STORED format (Auto would re-infer,
// Decision 4) — the user picks Auto deliberately.
export function CardForm(props: Props) {
  const router = useRouter();
  const editing = props.mode === "edit";
  const card = editing ? props.card : null;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      storeName: card?.storeName ?? "",
      code: card?.code ?? "",
      format: card?.format ?? AUTO,
      color: card?.color ?? null,
      allowDuplicate: false,
    },
  });
  const {
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = form;

  // Digits-only keyboard once the resolved format is a GS1 one (SPEC /cards/new).
  const code = useWatch({ control, name: "code" });
  const choice = useWatch({ control, name: "format" });
  const numeric = resolveFormat(choice, code) !== "CODE128" && resolveFormat(choice, code) !== "QR";
  // Rule 6: the checkbox exists only after the server has refused a duplicate.
  const showAllowDuplicate = !!errors.allowDuplicate;

  const onSubmit = handleSubmit(async (data) => {
    const result = card ? await updateCard({ id: card.id, ...data }) : await createCard(data);
    if (result.ok) {
      toast.success(card ? "Card updated" : "Card added");
      router.push(card ? `/cards/${card.id}` : "/cards");
      return;
    }
    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        setError(field as keyof FormInput, { type: "server", message: messages[0] });
      }
    } else {
      setError("root", { type: "server", message: result.message });
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <RHFInput
          name="storeName"
          label="Store"
          placeholder="e.g. Woolworths"
          autoComplete="off"
          maxLength={60}
        />
        <div className="space-y-2">
          <RHFInput
            name="code"
            label="Card number"
            placeholder="The number printed under the barcode"
            inputMode={numeric ? "numeric" : "text"}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <CodeHint codeName="code" formatName="format" />
        </div>
        <RHFFormatPicker name="format" codeName="code" label="Barcode type" />
        <RHFColorPicker name="color" label="Tile colour" />
        {showAllowDuplicate && (
          <RHFCheckbox name="allowDuplicate" label={card ? "Save anyway" : "Add anyway"} />
        )}
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            href={card ? `/cards/${card.id}` : "/cards"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : card ? "Save changes" : "Save card"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
