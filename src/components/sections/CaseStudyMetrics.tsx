"use client";

import { useCaseStudy } from "@/cms/useCaseStudy";
import type { CaseStudy } from "@/lib/types";

/**
 * A case study's headline figures, read through the store so they can be
 * replaced from the portal.
 *
 * `cells` returns only the figure cells, so it can sit inside whatever grid
 * the surrounding card already draws. `hero` is the ruled row under the
 * case-study headline.
 */
export function CaseStudyMetrics({
  study: source,
  variant = "cells",
  limit,
}: {
  study: CaseStudy;
  variant?: "cells" | "hero";
  /** Show only the first N figures. */
  limit?: number;
}) {
  const study = useCaseStudy(source);
  const metrics = study.metrics
    .filter((m) => m.value.trim() && m.label.trim())
    .slice(0, limit ?? undefined);

  if (variant === "hero") {
    return (
      <div className="mt-11 flex flex-wrap items-center gap-x-10 gap-y-6">
        {metrics.map((metric, i) => (
          <div
            key={`${metric.label}-${i}`}
            className={
              i === 0
                ? "flex flex-col gap-1"
                : "flex flex-col gap-1 border-l border-[var(--ax-line-strong)] pl-10"
            }
          >
            <span className="ax-display text-[clamp(1.7rem,2.6vw,2.2rem)] leading-none text-[var(--ax-ink)]">
              {metric.value}
            </span>
            <span className="text-[12px] text-[var(--ax-ink-muted)]">{metric.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {metrics.map((metric, i) => (
        <div key={`${metric.label}-${i}`} className="flex flex-col gap-1">
          <span className="ax-display ax-gradient-text text-[clamp(1.5rem,2.6vw,2.1rem)]">
            {metric.value}
          </span>
          <span className="text-[11.5px] leading-snug text-[var(--ax-ink-dim)]">
            {metric.label}
          </span>
        </div>
      ))}
    </>
  );
}

/** One editable text field of a case study. */
export function CaseStudyText({
  study: source,
  field,
}: {
  study: CaseStudy;
  field: "title" | "summary";
}) {
  const study = useCaseStudy(source);
  return <>{study[field]}</>;
}
