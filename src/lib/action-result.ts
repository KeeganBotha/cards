// The canonical return shape for ALL server actions (PATTERNS.md §4).
// Expected errors are values, never throws; forms consume via useActionState.
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
