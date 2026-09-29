"use client";

import { useCms } from "./CmsProvider";
import { CONTENT_DEFAULTS } from "./contentSchema";

/**
 * A numbered list of editable items, read in one go: the counterpart of
 * `listFields`. Each item carries the requested keys, overridden in the
 * portal or at their shipped defaults.
 */
export function useTextList<K extends string>(prefix: string, count: number, keys: readonly K[]): Record<K, string>[] {
  const { state, ready } = useCms();
  return Array.from({ length: count }, (_, i) => {
    const item = {} as Record<K, string>;
    for (const key of keys) {
      const id = `${prefix}.${i + 1}.${key}`;
      const fallback = CONTENT_DEFAULTS[id] ?? "";
      item[key] = ready ? (state.text[id] ?? fallback) : fallback;
    }
    return item;
  });
}
