"use client";

import { useText } from "@/cms/CmsProvider";
import { Icon } from "@/components/ui/Icon";

/** Email and location under the contact hero; client-side because the mailto link needs the edited address. */
export function ContactLines() {
  const email = useText("site.email");
  const location = useText("site.location");
  return (
    <div className="mt-10 flex flex-col gap-2 text-[13px] text-[var(--ax-ink-muted)]">
      <a
        href={`mailto:${email}`}
        className="ax-focus inline-flex w-fit items-center gap-2 transition-colors hover:text-[var(--ax-accent-soft)]"
      >
        <Icon name="mail" className="size-4" strokeWidth={1.8} />
        {email}
      </a>
      <span className="inline-flex items-center gap-2">
        <Icon name="globe" className="size-4" strokeWidth={1.8} />
        {location}
      </span>
    </div>
  );
}
