"use client";

import type { ReactNode } from "react";
import { useText } from "@/cms/CmsProvider";

/** A mailto link to the editable `site.email`, showing the address unless children are given. */
export function SiteEmailLink({ className, children }: { className?: string; children?: ReactNode }) {
  const email = useText("site.email");
  return (
    <a href={`mailto:${email}`} className={className}>
      {children}
      {email}
    </a>
  );
}
