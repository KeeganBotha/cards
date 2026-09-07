"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import * as cardsService from "./_data/cards.service";
import type { SaveCardResult } from "./_data/cards.service";
import { cardIdSchema, createCardSchema, updateCardSchema } from "./_data/cards.schemas";

// Thin entry points for MUTATIONS only (reads go through the page → service).
// Input arrives as an untrusted payload (every action is a public HTTP
// endpoint): safeParse FIRST → call ONE service → return ActionResult.
// Unexpected errors are logged server-side; the client only ever sees a
// generic message (PATTERNS.md §4). unstable_rethrow lets the redirect from
// verifySession() escape the catch.

const GENERIC_ERROR = "Something went wrong on our side — try again.";
const CHECK_FIELDS = "Check the highlighted fields.";
const GONE = "That card no longer exists.";

// A card shows in the wallet and on its own page — refresh the app shell.
function revalidateCardSurfaces() {
  revalidatePath("/", "layout");
}

function fromSaveResult(result: SaveCardResult): ActionResult<{ id: string }> {
  switch (result.kind) {
    case "saved":
      revalidateCardSurfaces();
      return { ok: true, data: { id: result.id } };
    case "duplicate":
      // Rule 6: the refusal lands on `code`; the allowDuplicate error is the
      // form's cue to reveal the "Add anyway" checkbox.
      return {
        ok: false,
        message: CHECK_FIELDS,
        fieldErrors: {
          code: [`You already have this number saved as ${result.storeName}.`],
          allowDuplicate: ["Tick this to save it as well."],
        },
      };
    case "notFound":
      return { ok: false, message: GONE };
  }
}

export async function createCard(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: CHECK_FIELDS, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    return fromSaveResult(await cardsService.createCard(parsed.data));
  } catch (error) {
    unstable_rethrow(error);
    console.error("createCard failed:", error);
    return { ok: false, message: GENERIC_ERROR };
  }
}

export async function updateCard(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateCardSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: CHECK_FIELDS, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  try {
    const { id, ...data } = parsed.data;
    return fromSaveResult(await cardsService.updateCard(id, data));
  } catch (error) {
    unstable_rethrow(error);
    console.error("updateCard failed:", error);
    return { ok: false, message: GENERIC_ERROR };
  }
}

export async function deleteCard(input: unknown): Promise<ActionResult<null>> {
  const parsed = cardIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: GONE };
  try {
    const found = await cardsService.removeCard(parsed.data.id);
    if (!found) return { ok: false, message: GONE };
  } catch (error) {
    unstable_rethrow(error);
    console.error("deleteCard failed:", error);
    return { ok: false, message: GENERIC_ERROR };
  }
  revalidateCardSurfaces();
  return { ok: true, data: null };
}

/** Rule 4 — fired once when show mode opens. The wallet reorders; nothing to show the user. */
export async function markCardUsed(input: unknown): Promise<ActionResult<null>> {
  const parsed = cardIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: GONE };
  try {
    const found = await cardsService.markCardUsed(parsed.data.id);
    if (!found) return { ok: false, message: GONE };
  } catch (error) {
    unstable_rethrow(error);
    console.error("markCardUsed failed:", error);
    return { ok: false, message: GENERIC_ERROR };
  }
  revalidatePath("/cards");
  return { ok: true, data: null };
}
