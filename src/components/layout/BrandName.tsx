"use client";

import { useText } from "@/cms/CmsProvider";

/** The company name as typed in Settings, for places that are otherwise server-rendered. */
export function BrandName() {
  return <>{useText("site.name")}</>;
}
