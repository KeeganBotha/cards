import "server-only";
import { verifySession } from "@/lib/server/session";
import * as cardsProvider from "./cards.provider";
import type { CardDto, CardListDto } from "./cards.provider";
import { resolveFormat, type CardColor, type FormatChoice } from "./cards.schemas";

// Business logic layer. Every function verifies the session as its FIRST
// statement and never accepts identity from the caller (PATTERNS.md §2).

export type CardInput = {
  storeName: string;
  code: string;
  format: FormatChoice;
  color: CardColor | null;
  allowDuplicate: boolean;
};

/** Expected outcomes of a save, modeled as values (PATTERNS.md §4). */
export type SaveCardResult =
  | { kind: "saved"; id: string }
  | { kind: "duplicate"; storeName: string }
  | { kind: "notFound" };

/** Returns null when this user has no such card (expected). */
export async function getCard(id: string): Promise<CardDto | null> {
  const scope = await verifySession();
  return cardsProvider.findCardById(scope, id);
}

/**
 * Rule 1: "Auto" is resolved here, once. Rule 6: a code the user already has
 * is refused with the other card's store name unless allowDuplicate is set.
 */
export async function createCard(input: CardInput): Promise<SaveCardResult> {
  const scope = await verifySession();
  if (!input.allowDuplicate) {
    const dup = await cardsProvider.findDuplicateByCode(scope, input.code);
    if (dup) return { kind: "duplicate", storeName: dup.storeName };
  }
  const { id } = await cardsProvider.createCard(scope, {
    storeName: input.storeName,
    code: input.code,
    format: resolveFormat(input.format, input.code),
    color: input.color,
  });
  return { kind: "saved", id };
}

/** Editing without changing the code never trips the duplicate check (rule 6). */
export async function updateCard(id: string, input: CardInput): Promise<SaveCardResult> {
  const scope = await verifySession();
  if (!input.allowDuplicate) {
    const dup = await cardsProvider.findDuplicateByCode(scope, input.code, id);
    if (dup) return { kind: "duplicate", storeName: dup.storeName };
  }
  const found = await cardsProvider.updateCard(scope, id, {
    storeName: input.storeName,
    code: input.code,
    format: resolveFormat(input.format, input.code),
    color: input.color,
  });
  return found ? { kind: "saved", id } : { kind: "notFound" };
}

/** Hard delete (Decision 1). Returns false when no such card (expected). */
export async function removeCard(id: string): Promise<boolean> {
  const scope = await verifySession();
  return cardsProvider.deleteCard(scope, id);
}

/** Rule 4: opening show mode is what counts as use. */
export async function markCardUsed(id: string): Promise<boolean> {
  const scope = await verifySession();
  return cardsProvider.touchCardUsed(scope, id);
}

export async function listCards(options: {
  query: string;
  limit: number;
}): Promise<CardListDto> {
  const scope = await verifySession();
  return cardsProvider.findCards(scope, options);
}
