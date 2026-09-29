"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AX_EASE } from "@/components/fx/Reveal";
import { MiniDevice } from "@/components/showcase/MiniDevice";
import { FilterPills, type FilterOption } from "@/components/ui/FilterPills";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/cms/Text";
import { useSolutionFilters, useSolutions } from "@/cms/useSolutions";

const DEVICE_VARIANT: Record<string, "dashboard" | "table" | "flow" | "map"> = {
  "Real Estate": "map",
  Operations: "flow",
  Analytics: "dashboard",
  "Customer Experience": "table",
  "Custom Development": "flow",
};

/**
 * Solutions grid from reference 2: filter rail above two-column cards that
 * carry copy and a checklist on the left, a product shot on the right.
 */
export function SolutionGrid() {
  const solutions = useSolutions();
  const filters = useSolutionFilters();
  const allId = filters[0].id;
  const [filter, setFilter] = useState<string>(allId);

  const options: FilterOption[] = useMemo(
    () =>
      filters.map(({ id, label }) => ({
        id,
        label,
        count:
          id === allId
            ? solutions.length
            : solutions.filter((s) => s.categoryId === id).length,
      })).filter((o) => o.count > 0),
    [solutions, filters, allId],
  );

  const results = useMemo(
    () =>
      filter === allId
        ? solutions
        : solutions.filter((s) => s.categoryId === filter),
    [solutions, filter, allId],
  );

  return (
    <div className="flex flex-col gap-12">
      <FilterPills
        options={options}
        value={filter}
        onChange={setFilter}
        layoutId="solution-filter"
      />

      <motion.div layout className="grid gap-4 xl:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {results.map((solution) => (
            <motion.article
              key={solution.id}
              id={solution.slug}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: AX_EASE }}
              className="group relative scroll-mt-32 overflow-hidden rounded-2xl border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] transition-all duration-500 hover:border-[var(--ax-line-strong)] hover:shadow-[0_30px_90px_-36px_rgba(var(--ax-glow),0.55)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-12 top-0 h-full w-2/3 opacity-60 blur-[70px] transition-opacity duration-700 group-hover:opacity-90"
                style={{ background: "radial-gradient(60% 55% at 70% 45%, rgba(var(--ax-glow),0.42), transparent 72%)" }}
              />

              <div className="relative grid gap-6 p-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-center md:p-7">
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex items-start gap-3.5">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(var(--ax-glow),0.26), rgba(var(--ax-glow),0.07))",
                        boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.26)",
                      }}
                    >
                      <Icon name={solution.icon} className="size-5" strokeWidth={1.8} />
                    </span>

                    <div className="flex min-w-0 flex-col gap-1.5">
                      <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.015em] text-[var(--ax-ink)]">
                        {solution.name}
                      </h2>
                      <p className="ax-text-pretty text-[13px] leading-relaxed text-[var(--ax-ink-muted)]">
                        {solution.description}
                      </p>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {solution.bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2.5 text-[12.5px] text-[var(--ax-ink-muted)]"
                      >
                        <Icon
                          name="check-circle"
                          className="size-4 shrink-0 text-[var(--ax-accent)]"
                          strokeWidth={2}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/products/${solution.slug}`}
                    className="ax-focus mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(var(--ax-glow),0.9)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <Text id="solutions.card.button" />
                    <Icon name="arrow-right" className="size-3.5" strokeWidth={2.4} />
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  <MiniDevice
                    accent="var(--ax-accent)"
                    seed={solution.slug}
                    variant={DEVICE_VARIANT[solution.categoryId] ?? "dashboard"}
                  />

                  <div className="flex items-center gap-3">
                    {solution.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-2.5 py-2"
                      >
                        <span className="truncate text-[9.5px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">
                          {stat.label}
                        </span>
                        <span className="flex items-baseline gap-1.5">
                          <span className="truncate text-[14px] font-semibold text-[var(--ax-ink)]">
                            {stat.value}
                          </span>
                          {stat.delta && (
                            <span className="shrink-0 text-[10px] font-semibold text-[var(--ax-success)]">
                              {stat.delta}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
