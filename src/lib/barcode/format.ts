// Barcode format vocabulary shared by the Zod schema, the encoders and the UI.
// String literals identical to the Prisma `BarcodeFormat` enum, so values flow
// between the two without a mapping — but this file never imports Prisma
// (PATTERNS.md §1: the generated client stays inside providers).

export const BARCODE_FORMATS = ["CODE128", "EAN13", "EAN8", "UPCA", "QR"] as const;
export type BarcodeFormat = (typeof BARCODE_FORMATS)[number];
export type LinearFormat = Exclude<BarcodeFormat, "QR">;

/** Display names — shared by pickers, hints, labels and error messages. */
export const FORMAT_LABELS: Record<BarcodeFormat, string> = {
  CODE128: "Code 128",
  EAN13: "EAN-13",
  EAN8: "EAN-8",
  UPCA: "UPC-A",
  QR: "QR",
};

/** Exact digit count for the fixed-length GS1 formats. */
export const FIXED_DIGITS: Record<Exclude<LinearFormat, "CODE128">, number> = {
  EAN13: 13,
  EAN8: 8,
  UPCA: 12,
};

/**
 * SPEC rule 1 — format inference. After trimming, a digits-only code of length
 * 13 → EAN13, 12 → UPCA, 8 → EAN8; anything else → CODE128. The one
 * implementation: the service uses it to resolve "Auto"; the form uses it for
 * the live "Auto (EAN-13)" hint.
 */
export function inferFormat(code: string): BarcodeFormat {
  const trimmed = code.trim();
  if (/^\d+$/.test(trimmed)) {
    if (trimmed.length === 13) return "EAN13";
    if (trimmed.length === 12) return "UPCA";
    if (trimmed.length === 8) return "EAN8";
  }
  return "CODE128";
}
