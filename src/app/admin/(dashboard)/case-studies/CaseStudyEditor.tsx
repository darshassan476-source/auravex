"use client";

import { useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import { CASE_STUDIES } from "@/data/caseStudies";
import type { ProductMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

const INPUT =
  "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
  "px-3.5 py-2.5 text-[13.5px] text-[var(--ax-ink)] outline-none transition-colors duration-300 " +
  "placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

/**
 * Edit the case studies: headline, summary, the three figures, and whether
 * each one is shown. The figures ship as illustrative placeholders; this is
 * where they become real.
 */
export function CaseStudyEditor() {
  const { state, error, setCaseStudy, resetCaseStudy } = useCms();
  const [slug, setSlug] = useState(CASE_STUDIES[0].slug);

  const base = CASE_STUDIES.find((c) => c.slug === slug) ?? CASE_STUDIES[0];
  const patch = state.caseStudies[slug] ?? {};
  const edited = Object.values(patch).some((v) => v !== undefined);

  const value = {
    title: patch.title ?? base.title,
    summary: patch.summary ?? base.summary,
    metrics: patch.metrics ?? base.metrics,
    hidden: patch.hidden ?? false,
  };

  function setMetric(i: number, field: keyof ProductMetric, v: string) {
    const next = value.metrics.map((m, idx) => (idx === i ? { ...m, [field]: v } : m));
    setCaseStudy(slug, { metrics: next });
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 px-4 py-3 text-[12.5px] text-[var(--ax-warning)]">
          <Icon name="bell" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error}
        </p>
      )}

      <Panel title="Case studies" description="Pick one to edit. Changes show on the site immediately.">
        <div className="flex flex-wrap gap-2">
          {CASE_STUDIES.map((c) => {
            const active = c.slug === slug;
            const changed = Boolean(state.caseStudies[c.slug]);
            const hidden = state.caseStudies[c.slug]?.hidden;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setSlug(c.slug)}
                className={cn(
                  "ax-focus inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all duration-300",
                  active
                    ? "border-transparent bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                    : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
                  hidden && !active && "opacity-50",
                )}
              >
                <span className="font-mono text-[10px] opacity-70">{c.index.replace("CASE STUDY ", "")}</span>
                {c.sector}
                {changed && (
                  <span className={cn("size-1.5 rounded-full", active ? "bg-white/80" : "bg-[var(--ax-accent)]")} />
                )}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title={`Editing — ${base.index}`}
        description={edited ? "This case study has local edits." : "Showing the built-in record."}
        action={
          edited ? (
            <button
              type="button"
              onClick={() => resetCaseStudy(slug)}
              className="ax-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
            >
              <Icon name="x" className="size-3.5" strokeWidth={2.4} />
              Revert all
            </button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">Headline</span>
            <input
              className={INPUT}
              value={value.title}
              onChange={(e) => setCaseStudy(slug, { title: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">Summary</span>
            <textarea
              rows={3}
              className={cn(INPUT, "resize-y")}
              value={value.summary}
              onChange={(e) => setCaseStudy(slug, { summary: e.target.value })}
            />
          </label>

          <div className="flex flex-col gap-3">
            <span className="flex items-baseline gap-2">
              <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">Headline figures</span>
              <span className="text-[11px] text-[var(--ax-ink-dim)]">Shown on the card, the detail page and the homepage.</span>
            </span>
            <div className="grid gap-3 md:grid-cols-3">
              {value.metrics.map((metric, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl border border-[var(--ax-line)] p-3">
                  <input
                    className={cn(INPUT, "ax-display text-[20px]")}
                    value={metric.value}
                    onChange={(e) => setMetric(i, "value", e.target.value)}
                    placeholder="62%"
                    aria-label={`Figure ${i + 1}`}
                  />
                  <input
                    className={INPUT}
                    value={metric.label}
                    onChange={(e) => setMetric(i, "label", e.target.value)}
                    placeholder="Less manual work"
                    aria-label={`Figure ${i + 1} label`}
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-[var(--ax-line)] p-3.5">
            <Toggle
              checked={!value.hidden}
              label={value.hidden ? "Show on the site" : "Hide from the site"}
              onChange={(next) => setCaseStudy(slug, { hidden: !next })}
            />
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold text-[var(--ax-ink)]">
                {value.hidden ? "Hidden from the site" : "Visible on the site"}
              </span>
              <span className="text-[11.5px] text-[var(--ax-ink-dim)]">
                Hidden case studies leave the Our Work page and the homepage.
              </span>
            </span>
          </label>
        </div>
      </Panel>
    </div>
  );
}
