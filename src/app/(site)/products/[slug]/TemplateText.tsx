"use client";

import { useText } from "@/cms/CmsProvider";

/** Replaces `{key}` placeholders in an editable template with runtime values. */
export function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/** An editable string with `{name}`-style placeholders, filled in on render. */
export function TemplateText({ id, values }: { id: string; values: Record<string, string> }) {
  return <>{fillTemplate(useText(id), values)}</>;
}
