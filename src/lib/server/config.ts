import "server-only";
import { z } from "zod";

// The ONLY file allowed to touch process.env (PATTERNS.md §6).
// Validated once at startup — a missing or malformed variable fails fast here.
// The six-variable minimum (SPEC "Env"): no VAPID, no cron secret, no timezone.
// DIRECT_DATABASE_URL is consumed only by prisma7.config.ts (migrations).

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const config = parsed.data;
