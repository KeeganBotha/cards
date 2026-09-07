import { z } from "zod";

// How many more cards each "Load more" click reveals (and the initial count).
// 12 fills the 2-, 3- and 4-column wallet grid with complete rows.
export const LIMIT_STEP = 12;

// Shared parser for the ?limit= search param (client input, PATTERNS.md §3).
// Garbage, zero, negatives, floats, or anything past the server cap → the
// default; never throws. The cap means a crafted URL can't request the world.
export const limitParamSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .catch(LIMIT_STEP);
