import "server-only";
import { db } from "@/lib/server/db";
import type { SessionScope } from "@/lib/server/session";
import type { BarcodeFormat } from "@/lib/barcode/format";
import type { CardColor } from "./cards.schemas";

// The ONLY file that touches the card table. Every function takes the session
// scope as its required first parameter and bakes ownerId into the query —
// reads AND writes, the lastUsedAt touch and the duplicate lookup included
// (PATTERNS.md §2, SPEC rule 9). Explicit select allowlist, never raw rows.

const cardSelect = {
  id: true,
  storeName: true,
  code: true,
  format: true,
  color: true,
  lastUsedAt: true,
} as const;

const tileSelect = {
  id: true,
  storeName: true,
  color: true,
} as const;

export type CardDto = {
  id: string;
  storeName: string;
  code: string;
  format: BarcodeFormat;
  color: CardColor | null;
  lastUsedAt: Date | null;
};

export type CardTileDto = {
  id: string;
  storeName: string;
  color: CardColor | null;
};

export type CardListDto = {
  cards: CardTileDto[];
  totalCount: number;
};

export type CardWrite = {
  storeName: string;
  code: string;
  format: BarcodeFormat;
  color: CardColor | null;
};

export async function findCardById(
  scope: SessionScope,
  id: string,
): Promise<CardDto | null> {
  return db.card.findFirst({
    where: { id, ownerId: scope.userId },
    select: cardSelect,
  });
}

/**
 * SPEC rule 6 — another of this user's cards with the same code (any format),
 * excluding the card being edited. Returns only what the message needs.
 */
export async function findDuplicateByCode(
  scope: SessionScope,
  code: string,
  excludeId?: string,
): Promise<{ storeName: string } | null> {
  return db.card.findFirst({
    where: {
      ownerId: scope.userId,
      code,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { storeName: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createCard(
  scope: SessionScope,
  data: CardWrite,
): Promise<{ id: string }> {
  return db.card.create({
    data: {
      ownerId: scope.userId,
      storeName: data.storeName,
      code: data.code,
      format: data.format,
      color: data.color,
    },
    select: { id: true },
  });
}

// updateMany/deleteMany so a miss (not yours, or gone — indistinguishable by
// design) is a count of 0, not a thrown error.
export async function updateCard(
  scope: SessionScope,
  id: string,
  data: CardWrite,
): Promise<boolean> {
  const { count } = await db.card.updateMany({
    where: { id, ownerId: scope.userId },
    data: {
      storeName: data.storeName,
      code: data.code,
      format: data.format,
      color: data.color,
    },
  });
  return count > 0;
}

export async function deleteCard(scope: SessionScope, id: string): Promise<boolean> {
  const { count } = await db.card.deleteMany({
    where: { id, ownerId: scope.userId },
  });
  return count > 0;
}

/** SPEC rule 4 — show mode is what counts as "use". */
export async function touchCardUsed(scope: SessionScope, id: string): Promise<boolean> {
  const { count } = await db.card.updateMany({
    where: { id, ownerId: scope.userId },
    data: { lastUsedAt: new Date() },
  });
  return count > 0;
}

// List reads are always capped (PATTERNS.md §5). `limit` arrives already
// parsed and capped by the shared limitParamSchema. Search is a
// case-insensitive `contains` on storeName only. Order per rule 4.
export async function findCards(
  scope: SessionScope,
  options: { query: string; limit: number },
): Promise<CardListDto> {
  const where = {
    ownerId: scope.userId,
    ...(options.query && {
      storeName: { contains: options.query, mode: "insensitive" as const },
    }),
  };
  const [cards, totalCount] = await Promise.all([
    db.card.findMany({
      where,
      select: tileSelect,
      orderBy: [
        { lastUsedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      take: options.limit,
    }),
    db.card.count({ where }),
  ]);
  return { cards, totalCount };
}
