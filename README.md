# Cards

A loyalty-card wallet: each card is a store name plus the number under its
barcode, and at the till the app draws that number as a full-width, scannable
barcode or QR code. Cards live in your account, so they follow you to any
phone or browser. App #3 of the personal suite and the web successor to the
CardCrate mobile app — it mirrors the
[Journal](https://github.com/KeeganBotha/journal) repo's structure and
conventions.

## Stack

Next.js (App Router) · TypeScript · Tailwind + shadcn/ui · Postgres + Prisma ·
Better Auth (Google OAuth) · Zod · react-hook-form

## Getting started

1. **Env vars** — copy `.env.example` to `.env` and fill it in:
   - `DATABASE_URL` — a Postgres connection string (local Postgres or a free
     [Prisma Postgres](https://console.prisma.io) database)
   - `DIRECT_DATABASE_URL` — optional non-pooled URL for migrations
     (falls back to `DATABASE_URL`)
   - `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
   - `BETTER_AUTH_URL` — `http://localhost:3000` in development
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — an OAuth client from
     [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
     with `http://localhost:3000/api/auth/callback/google` as an authorized
     redirect URI
2. `npm install`
3. `npm run db:migrate` — applies migrations and generates the Prisma client
4. `npm run dev`

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server |
| `npm run check` | route typegen + eslint + tsc (CI runs this on every push/PR) |
| `npm run build` | prisma generate → migrate deploy → next build (what Vercel runs) |
| `npm run db:migrate` | create/apply migrations in development |
| `npm run db:studio` | browse the database |
| `node scripts/generate-icons.mjs` | re-render the suite icon (the CardCrate crate, `scripts/icon-source.png`) to `public/icons`, `src/app/apple-icon.png`, `src/app/icon.png` |

## Structure

Every feature follows action → service → provider; providers are the only
files that touch the database, and every query is scoped to the session's
user. Feature folders live under `src/app/(app)/<feature>/` with `_data/`
(schemas, service, provider) and `_components/`; shared components live in
`src/components/`. ESLint enforces the boundaries: `process.env` is only
readable in `src/lib/server/config.ts`, and the Prisma client is only
importable from providers.

The full conventions (architecture, security, UI) and the app spec live in
project docs kept outside the repo.

## Deployment

Pushing `main` deploys via Vercel's Git integration: the build regenerates the
Prisma client and applies pending migrations against the production database.
After a schema change, restart your local dev server — a running server keeps
the previously generated Prisma client in memory.
