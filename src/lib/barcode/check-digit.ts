import { eanCheckDigit } from "./ean";
import { FIXED_DIGITS, type BarcodeFormat } from "./format";

/**
 * SPEC rule 7 — check-digit warning. For EAN13/EAN8/UPCA with the right digit
 * count, returns the expected GS1 mod-10 check digit when the last digit is
 * wrong; otherwise null (right digit, wrong length, or a format without one).
 * The caller only ever warns — the code is stored and drawn exactly as typed.
 */
export function expectedCheckDigit(code: string, format: BarcodeFormat): number | null {
  if (format === "CODE128" || format === "QR") return null;
  const length = FIXED_DIGITS[format];
  const trimmed = code.trim();
  if (!/^\d+$/.test(trimmed) || trimmed.length !== length) return null;
  const expected = eanCheckDigit(trimmed.slice(0, -1));
  return expected === Number(trimmed[length - 1]) ? null : expected;
}
