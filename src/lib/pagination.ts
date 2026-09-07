import { z } from "zod";

// How many more rows each "Load more" click reveals (and the initial count).
export const LIMIT_STEP = 10;

// Shared parser for the ?limit= search param (client input, PATTERNS.md §3).
// Garbage, zero, negatives, floats, or anything past the server cap → the
// default; never throws. The cap means a crafted URL can't request the world.
export const limitParamSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .catch(LIMIT_STEP);
