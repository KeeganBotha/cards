import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export type SessionScope = {
  userId: string;
  role: "user";
};

const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/**
 * The security gate (PATTERNS.md §2): every service touching protected data
 * calls this as its first statement. Identity comes from the session only —
 * never as a parameter from the caller. Redirects when unauthenticated.
 */
export const verifySession = cache(async (): Promise<SessionScope> => {
  const session = await getSession();
  if (!session) redirect("/login");
  return { userId: session.user.id, role: "user" };
});

/** Session without the redirect — for public pages deciding where to send the visitor. */
export const getOptionalSession = cache(async () => getSession());

/** Display DTO for the signed-in user. Never use for authorization decisions. */
export const getSessionUser = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  const { name, email, image } = session.user;
  return { name, email, image: image ?? null };
});
