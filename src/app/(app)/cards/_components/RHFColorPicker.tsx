"use client";

import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CARD_COLORS, type CardColor } from "../_data/cards.schemas";
import { COLOR_LABELS, TILE_CLASS } from "./tile-colors";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  label?: string;
  containerClassName?: string;
};

// Controller-bound colour swatches (UI.md §7): ten 44px buttons in a radio
// group. Value is a CardColor or null; pressing the selected swatch clears it
// back to null (the default slate tile).
export function RHFColorPicker({ name, label, containerClassName }: Props) {
  const labelId = useId();
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = (field.value ?? null) as CardColor | null;
        return (
          <div className={cn("space-y-2", containerClassName)}>
            {label && <Label id={labelId}>{label}</Label>}
            <div
              role="radiogroup"
              aria-labelledby={label ? labelId : undefined}
              aria-invalid={!!fieldState.error}
              className="flex flex-wrap gap-2"
            >
              {CARD_COLORS.map((color) => {
                const selected = value === color;
                return (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={COLOR_LABELS[color]}
                    onClick={() => field.onChange(selected ? null : color)}
                    onBlur={field.onBlur}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-lg border border-border text-tile-foreground transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      TILE_CLASS[color],
                      selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                    )}
                  >
                    {selected && <Check aria-hidden="true" className="size-5" />}
                  </button>
                );
              })}
            </div>
            {fieldState.error?.message && (
              <p className="text-sm text-destructive">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
