"use client";

import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * The small glass callouts that overlap the hero device in every reference:
 * rounded icon tile, bold short title, one or two muted lines.
 */
export function FloatingCard({
  icon,
  title,
  body,
  delay = 0,
  className,
}: {
  icon: string;
  title: string;
  body?: string;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      style={{ "--ax-rv-delay": `${delay}s` } as CSSProperties}
      className={cn(
        "ax-rv ax-rv-up ax-glass-strong ax-edge-light w-[196px] rounded-2xl p-3.5",
        "shadow-[0_24px_70px_-24px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
          style={{
            background: "linear-gradient(145deg, rgba(var(--ax-glow),0.28), rgba(var(--ax-glow),0.08))",
            boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.30)",
          }}
        >
          <Icon name={icon} className="size-[17px]" strokeWidth={1.9} />
        </span>

        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] font-semibold leading-tight text-[var(--ax-ink)]">
            {title}
          </span>
          {body && (
            <span className="text-[11px] leading-snug text-[var(--ax-ink-dim)]">{body}</span>
          )}
        </div>
      </div>
    </div>
  );
}
