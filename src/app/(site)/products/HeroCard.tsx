"use client";

import type { ComponentProps } from "react";
import { useText } from "@/cms/CmsProvider";
import { FloatingCard } from "@/components/showcase/FloatingCard";

/** A hero callout whose title is editable copy (FloatingCard takes a plain string). */
export function HeroCard({ titleId, ...props }: Omit<ComponentProps<typeof FloatingCard>, "title"> & { titleId: string }) {
  return <FloatingCard {...props} title={useText(titleId)} />;
}
