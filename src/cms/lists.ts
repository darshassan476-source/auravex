import type { ContentField } from "./contentSchema";

/**
 * Registry fields for a numbered list of editable items — FAQs, principles,
 * menu links — built from the array the page already renders, so the
 * defaults are the shipped copy word for word.
 *
 *   listFields("about.principles", "Principle", PRINCIPLES, [
 *     { key: "title", label: "title" },
 *     { key: "body", label: "text", long: true },
 *   ])
 *
 * gives `about.principles.1.title`, `about.principles.1.body`, … Read them
 * back with `useTextList("about.principles", PRINCIPLES.length, ["title", "body"])`.
 */
export function listFields<T extends object>(
  prefix: string,
  noun: string,
  items: readonly T[],
  keys: readonly { key: keyof T & string; label: string; long?: boolean; hint?: string }[],
): ContentField[] {
  return items.flatMap((item, i) =>
    keys.map(({ key, label, long, hint }) => ({
      id: `${prefix}.${i + 1}.${key}`,
      label: `${noun} ${i + 1} — ${label}`,
      value: String((item as Record<string, unknown>)[key] ?? ""),
      ...(long ? { long } : {}),
      ...(hint ? { hint } : {}),
    })),
  );
}
