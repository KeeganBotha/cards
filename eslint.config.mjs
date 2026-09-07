import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client — vendor output, never linted.
    "src/generated/**",
  ]),

  // ——— Boundary rules (PATTERNS.md §1, §6). Root-level tooling files
  // (next.config.ts, prisma7.config.ts) are outside src/ and thus exempt. ———

  // process.env is readable ONLY in src/lib/server/config.ts.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/server/config.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "process.env is only allowed in src/lib/server/config.ts (PATTERNS.md §6). Import `config` from there instead.",
        },
      ],
    },
  },

  // The Prisma client and the db handle are importable ONLY from providers
  // (`_data/*.provider.ts`), db.ts itself, and auth.ts (Better Auth's adapter
  // needs the handle). Everything above a provider never sees ORM calls.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/**/_data/*.provider.ts",
      "src/lib/server/db.ts",
      "src/lib/server/auth.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/generated/prisma", "@/generated/prisma/*", "@prisma/*"],
              message:
                "Prisma is only importable in _data/*.provider.ts and src/lib/server/db.ts (PATTERNS.md §1).",
            },
            {
              group: ["@/lib/server/db"],
              message:
                "The db handle is only importable in _data/*.provider.ts (PATTERNS.md §1). Go through a service.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
