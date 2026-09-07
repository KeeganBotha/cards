/**
 * Code 128 encoder (Code Set B for printable ASCII, Code Set C for even-length digit-only
 * strings). Output: '1'/'0' module string. Pure function. Ported from the CardCrate mobile app.
 */

/** Bar/space widths for values 0–106 (6 widths summing to 11; STOP has 7 summing to 13). */
export const CODE128_PATTERNS: readonly string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

export const START_B = 104;
export const START_C = 105;
export const STOP = 106;

function widthsToModules(widths: string): string {
  let out = '';
  [...widths].forEach((w, i) => {
    out += (i % 2 === 0 ? '1' : '0').repeat(Number(w));
  });
  return out;
}

/** Symbol values (start code + data) for `text`, choosing Set C for even-length digit runs. */
export function code128Values(text: string): number[] {
  if (text.length === 0) throw new Error('Code 128 needs at least one character');
  if (/^\d+$/.test(text) && text.length % 2 === 0) {
    const values = [START_C];
    for (let i = 0; i < text.length; i += 2) values.push(Number(text.slice(i, i + 2)));
    return values;
  }
  const values = [START_B];
  for (const ch of text) {
    const c = ch.charCodeAt(0);
    if (c < 32 || c > 126) throw new Error('Code 128 supports printable ASCII only');
    values.push(c - 32);
  }
  return values;
}

/** Modulo-103 checksum over start code (weight 1) and data (weights 1..n). */
export function code128Checksum(values: number[]): number {
  let sum = values[0]!;
  for (let i = 1; i < values.length; i++) sum += values[i]! * i;
  return sum % 103;
}

export function encodeCode128(text: string): string {
  const values = code128Values(text);
  const all = [...values, code128Checksum(values), STOP];
  return all.map((v) => widthsToModules(CODE128_PATTERNS[v]!)).join('');
}
