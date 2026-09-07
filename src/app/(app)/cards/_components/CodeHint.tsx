"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { TriangleAlert } from "lucide-react";
import { expectedCheckDigit } from "@/lib/barcode/check-digit";
import { resolveFormat, type FormatChoice } from "../_data/cards.schemas";

// Rule 7: a wrong GS1 check digit warns and names the expected digit; the save
// still proceeds. Silent while the length is wrong or for Code 128 / QR.
export function CodeHint({ codeName, formatName }: { codeName: string; formatName: string }) {
  const { control } = useFormContext();
  const code = (useWatch({ control, name: codeName }) as string | undefined) ?? "";
  const choice = (useWatch({ control, name: formatName }) as FormatChoice | undefined) ?? "AUTO";
  const expected = expectedCheckDigit(code, resolveFormat(choice, code));
  if (expected === null) return null;

  return (
    <p role="status" className="flex items-start gap-2 text-sm text-warning">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>
        The last digit doesn&apos;t match the checksum (expected {expected}). Some
        stores issue numbers that ignore it, so you can still save this one.
      </span>
    </p>
  );
}
