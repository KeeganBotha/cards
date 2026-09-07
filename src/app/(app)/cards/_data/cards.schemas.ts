import { z } from "zod";
import {
  BARCODE_FORMATS,
  FIXED_DIGITS,
  FORMAT_LABELS,
  inferFormat,
  type BarcodeFormat,
} from "@/lib/barcode/format";

// One schema, two jobs (UI.md §7): react-hook-form validates with it client-
// side via zodResolver, and the action safeParses the payload server-side —
// the real gate (PATTERNS.md §3). Never redefine validation inline.

// Mirrors the Prisma `CardColor` enum by value; the provider passes it through.
export const CARD_COLORS = [
  "RED", "ORANGE", "YELLOW", "GREEN", "TEAL",
  "BLUE", "INDIGO", "PURPLE", "PINK", "SLATE",
] as const;
export const cardColorSchema = z.enum(CARD_COLORS);
export type CardColor = z.infer<typeof cardColorSchema>;

/** What the format picker holds: a concrete format, or "Auto" (SPEC rule 1). */
export const AUTO = "AUTO" as const;
export const FORMAT_CHOICES = [AUTO, ...BARCODE_FORMATS] as const;
export const formatChoiceSchema = z.enum(FORMAT_CHOICES);
export type FormatChoice = z.infer<typeof formatChoiceSchema>;

/** "Auto" resolves through the one inference implementation (rule 1). */
export function resolveFormat(choice: FormatChoice, code: string): BarcodeFormat {
  return choice === AUTO ? inferFormat(code) : choice;
}

/** SPEC rule 5 — per-format code validation; messages name the format. */
export function codeErrorFor(code: string, format: BarcodeFormat): string | null {
  switch (format) {
    case "EAN13":
    case "EAN8":
    case "UPCA": {
      const n = FIXED_DIGITS[format];
      return new RegExp(`^\\d{${n}}$`).test(code)
        ? null
        : `${FORMAT_LABELS[format]} codes are exactly ${n} digits.`;
    }
    case "CODE128":
      return /^[\x20-\x7E]+$/.test(code)
        ? null
        : "Code 128 codes can only use letters, numbers and standard symbols.";
    case "QR":
      return null; // any non-empty text
  }
}

export const cardFormSchema = z
  .object({
    storeName: z
      .string()
      .trim()
      .min(1, "Enter the store's name.")
      .max(60, "Store names are at most 60 characters."),
    code: z
      .string()
      .trim()
      .min(1, "Enter the number printed under the barcode.")
      .max(200, "Card numbers are at most 200 characters."),
    // The form ALWAYS submits both code and format (rule 5); on edit, "Auto"
    // re-infers from the code (Decision 4, 2026-09-07).
    format: formatChoiceSchema,
    // null in → null out (idempotent, UI.md §7); null = the default slate tile.
    color: cardColorSchema.nullable(),
    // Rule 6: revealed as "Add anyway" after a duplicate refusal.
    allowDuplicate: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const message = codeErrorFor(data.code, resolveFormat(data.format, data.code));
    if (message) ctx.addIssue({ code: "custom", path: ["code"], message });
  });

export const createCardSchema = cardFormSchema;
export const updateCardSchema = cardFormSchema.safeExtend({ id: z.uuid() });
export const cardIdSchema = z.object({ id: z.uuid() });

// Route params and search params are client input too (PATTERNS.md §3).
export const cardIdParamSchema = z.uuid();

// ?q= — garbage never throws; over-long input is clipped rather than rejected.
export const searchQuerySchema = z.string().trim().max(60).catch("");
