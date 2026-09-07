"use client";

import { useId } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BARCODE_FORMATS, FORMAT_LABELS, inferFormat } from "@/lib/barcode/format";
import { AUTO } from "../_data/cards.schemas";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  /** Field holding the card number — drives the live "Auto (EAN-13)" label (rule 1). */
  codeName: string;
  label?: string;
  containerClassName?: string;
};

// Controller-bound segmented control (UI.md §7): Auto + the five formats.
// Auto shows what it would resolve to right now; the service resolves it for
// real on save with the same helper.
export function RHFFormatPicker({ name, codeName, label, containerClassName }: Props) {
  const labelId = useId();
  const { control } = useFormContext();
  const code = useWatch({ control, name: codeName }) as string | undefined;
  const inferred = FORMAT_LABELS[inferFormat(code ?? "")];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-2", containerClassName)}>
          {label && <Label id={labelId}>{label}</Label>}
          <ToggleGroup
            variant="outline"
            spacing={0}
            aria-labelledby={label ? labelId : undefined}
            aria-invalid={!!fieldState.error}
            value={field.value ? [field.value] : []}
            // Single-select that can't be emptied: ignore a re-press of the active item.
            onValueChange={(groupValue) => {
              if (groupValue[0]) field.onChange(groupValue[0]);
            }}
            onBlur={field.onBlur}
            className="w-full flex-wrap"
          >
            <ToggleGroupItem value={AUTO} className="flex-1">
              Auto ({inferred})
            </ToggleGroupItem>
            {BARCODE_FORMATS.map((format) => (
              <ToggleGroupItem key={format} value={format} className="flex-1">
                {FORMAT_LABELS[format]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {fieldState.error?.message && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
