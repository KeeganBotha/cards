import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/server/auth";

// External endpoint (OAuth callbacks) — the one legitimate route-handler use
// per PATTERNS.md §8. Better Auth verifies state/signatures internally.
export const { GET, POST } = toNextJsHandler(auth);
