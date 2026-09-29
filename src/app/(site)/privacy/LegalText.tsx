"use client";

import { useText } from "@/cms/CmsProvider";

/** A legal paragraph; `{email}` becomes the company email from Brand settings. */
export function LegalText({ id }: { id: string }) {
  const value = useText(id);
  const email = useText("site.email");
  return <>{value.replace(/\{email\}/g, email)}</>;
}
