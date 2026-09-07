"use client";

import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  label?: string;
  disabled?: boolean;
  containerClassName?: string;
};

// Controlled RHF field for boolean values rendered as a checkbox. Binds to
// the enclosing <FormProvider> (UI.md §7).
export function RHFCheckbox({
  name,
  label,
  disabled,
  containerClassName,
}: Props) {
  const id = useId();
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-2", containerClassName)}>
          <div className="flex items-center gap-2">
            <Checkbox
              id={id}
              ref={field.ref}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
            />
            {label && <Label htmlFor={id}>{label}</Label>}
          </div>
          {fieldState.error?.message && (
            <p className="text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
