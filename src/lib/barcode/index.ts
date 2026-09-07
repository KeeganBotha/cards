import { encodeCode128 } from "./code128";
import { encodeEan13, encodeEan8, encodeUpcA } from "./ean";
import type { LinearFormat } from "./format";

/**
 * Module string ('1' bar / '0' space) for a linear barcode. QR is rendered by a
 * dedicated component and is not handled here. Throws on codes that cannot be encoded.
 */
export function encodeLinear(code: string, format: LinearFormat): string {
  switch (format) {
    case "EAN13":
      return encodeEan13(code);
    case "EAN8":
      return encodeEan8(code);
    case "UPCA":
      return encodeUpcA(code);
    case "CODE128":
      return encodeCode128(code);
  }
}

export type Bar = { x: number; width: number };

/** Collapse a module string into [x, width] runs of bars — one <rect> each. */
export function barsOf(modules: string): Bar[] {
  const bars: Bar[] = [];
  let i = 0;
  while (i < modules.length) {
    if (modules[i] === "1") {
      const start = i;
      while (i < modules.length && modules[i] === "1") i++;
      bars.push({ x: start, width: i - start });
    } else {
      i++;
    }
  }
  return bars;
}

/**
 * Bars for rendering, or null when the code cannot be encoded (SPEC rule 8 —
 * the encoder is the last line; the caller degrades to text).
 */
export function tryEncodeLinear(
  code: string,
  format: LinearFormat,
): { modules: number; bars: Bar[] } | null {
  try {
    const modules = encodeLinear(code, format);
    return { modules: modules.length, bars: barsOf(modules) };
  } catch {
    return null;
  }
}
