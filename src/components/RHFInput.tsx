"use client";

import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Input> & {
  name: string;
  label?: string;
  containerClassName?: string;
};

// Shared RHF field: label + input + error, bound to the enclosing
// <FormProvider> (UI.md §7). Feature forms compose these instead of
// hand-wiring register/aria-invalid/error per field.
export function RHFInput({
  name,
  label,
  containerClassName,
  id,
  ...inputProps
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const message =
    typeof error?.message === "string" ? error.message : undefined;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <Input
        id={inputId}
        aria-invalid={!!error}
        {...inputProps}
        {...register(name)}
      />
      {message && <p className="text-sm text-destructive">{message}</p>}
    </div>
  );
}
