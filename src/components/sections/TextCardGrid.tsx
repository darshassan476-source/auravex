"use client";

import { useTextList } from "@/cms/useTextList";
import { RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * A grid of icon cards whose titles and texts are admin-editable list fields
 * (`<prefix>.<n>.title` / `.body`). Only the icons come from code.
 */
export function TextCardGrid({
  prefix,
  icons,
  columns = 4,
  numbered = false,
}: {
  prefix: string;
  icons: readonly string[];
  columns?: 2 | 3 | 4;
  /** Shows 01, 02… beside the icon, for sequences such as delivery steps. */
  numbered?: boolean;
}) {
  const items = useTextList(prefix, icons.length, ["title", "body"] as const);
  return (
    <RevealGroup
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
      )}
      stagger={0.07}
    >
      {items.map((item, i) => (
        <RevealItem key={i}>
          <div className="ax-glass flex h-full flex-col gap-4 rounded-2xl p-6 md:p-7">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-[rgba(var(--ax-glow),0.1)] text-[var(--ax-accent-soft)] ring-1 ring-inset ring-[rgba(var(--ax-glow),0.22)]">
                <Icon name={icons[i]} className="size-5" strokeWidth={1.7} />
              </span>
              {numbered && (
                <span className="font-mono text-[12px] text-[var(--ax-ink-dim)]">{String(i + 1).padStart(2, "0")}</span>
              )}
            </div>
            <h3 className="text-[16.5px] font-semibold text-[var(--ax-ink)]">{item.title}</h3>
            <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">{item.body}</p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
