"use client";

import { useText } from "./CmsProvider";

/**
 * One admin-editable string, usable from server components.
 *
 * Copy lives in the client store, but most pages are server-rendered, so this
 * is the boundary: `<Text id="home.hero.body" />` renders the override when
 * there is one and the built-in default otherwise.
 *
 * Newlines in the stored value are honoured, which is how the two-line section
 * headings stay two lines after they have been edited.
 */
export function Text({ id, className }: { id: string; className?: string }) {
  const value = useText(id);
  if (!value.includes("\n")) return <span className={className}>{value}</span>;
  return <span className={`whitespace-pre-line ${className ?? ""}`}>{value}</span>;
}

/** The raw string, for places that need text rather than an element. */
export function useCopy(id: string) {
  return useText(id);
}
