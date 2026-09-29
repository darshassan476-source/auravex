"use client";

import type { ComponentProps } from "react";
import { ClientMarquee } from "@/components/sections/ClientMarquee";
import { FloatingCard } from "@/components/showcase/FloatingCard";
import { useText } from "./CmsProvider";

/** Replaces `{key}` placeholders in an editable string. */
export function fillTemplate(value: string, vars?: Record<string, string>) {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

/** An editable string with `{name}`-style placeholders filled in, for server components. */
export function TemplateText({ id, vars }: { id: string; vars: Record<string, string> }) {
  return <>{fillTemplate(useText(id), vars)}</>;
}

/**
 * FloatingCard whose title / body come from the portal. A literal `title` or
 * `body` wins over its id (case-study data already has its own editor).
 */
export function TextFloatingCard({
  titleId,
  title,
  bodyId,
  body,
  vars,
  ...rest
}: Omit<ComponentProps<typeof FloatingCard>, "title" | "body"> & {
  titleId?: string;
  title?: string;
  bodyId?: string;
  body?: string;
  vars?: Record<string, string>;
}) {
  const titleText = useText(titleId ?? "");
  const bodyText = useText(bodyId ?? "");
  return (
    <FloatingCard
      {...rest}
      title={title ?? fillTemplate(titleText, vars)}
      body={body ?? (bodyId ? fillTemplate(bodyText, vars) : undefined)}
    />
  );
}

/** The sector marquee with an editable heading. */
export function TextMarquee({ id }: { id: string }) {
  return <ClientMarquee label={useText(id)} />;
}
