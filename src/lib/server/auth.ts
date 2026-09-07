import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { config } from "./config";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
});
