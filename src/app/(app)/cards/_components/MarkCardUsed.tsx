"use client";

import { useEffect } from "react";
import { markCardUsed } from "../actions";

// Rule 4: opening show mode sets lastUsedAt. Fired once from this client leaf
// so the page itself stays a plain server component (reads never mutate).
// Renders nothing; the outcome is invisible to the user, so errors are dropped.
export function MarkCardUsed({ id }: { id: string }) {
  useEffect(() => {
    void markCardUsed({ id }).catch(() => {});
  }, [id]);
  return null;
}
