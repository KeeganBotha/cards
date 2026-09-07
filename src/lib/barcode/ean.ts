/**
 * EAN-13 / EAN-8 / UPC-A module encoders. Output is a string of '1' (bar) and '0'
 * (space), one character per module. Pure functions — no React, no DOM.
 * Ported from the CardCrate mobile app (already proven against the till).
 */

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];

/** Parity pattern for EAN-13 left half, indexed by the first (implicit) digit. L = odd, G = even. */
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

const GUARD = '101';
const CENTRE = '01010';

function digitsOf(code: string, length: number, name: string): number[] {
  if (!/^\d+$/.test(code) || code.length !== length) {
    throw new Error(`${name} needs exactly ${length} digits`);
  }
  return [...code].map(Number);
}

/**
 * GS1 modulo-10 check digit for the payload digits (without the check digit).
 * Weights alternate 3,1,3,1… starting from the rightmost payload digit — this
 * single rule covers EAN-13, EAN-8 and UPC-A.
 */
export function eanCheckDigit(payload: string): number {
  if (!/^\d+$/.test(payload)) throw new Error('check digit needs digits only');
  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    const digit = Number(payload[payload.length - 1 - i]);
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}

export function encodeEan13(code: string): string {
  const d = digitsOf(code, 13, 'EAN-13');
  const parity = PARITY[d[0]!]!;
  let out = GUARD;
  for (let i = 1; i <= 6; i++) {
    out += (parity[i - 1] === 'L' ? L : G)[d[i]!]!;
  }
  out += CENTRE;
  for (let i = 7; i <= 12; i++) out += R[d[i]!]!;
  return out + GUARD; // 95 modules
}

export function encodeEan8(code: string): string {
  const d = digitsOf(code, 8, 'EAN-8');
  let out = GUARD;
  for (let i = 0; i < 4; i++) out += L[d[i]!]!;
  out += CENTRE;
  for (let i = 4; i < 8; i++) out += R[d[i]!]!;
  return out + GUARD; // 67 modules
}

/** UPC-A is EAN-13 with an implicit leading 0. */
export function encodeUpcA(code: string): string {
  digitsOf(code, 12, 'UPC-A');
  return encodeEan13(`0${code}`);
}
