"use client";

import { useMemo } from "react";
import { INDUSTRIES, SOLUTION_FILTERS, SOLUTIONS } from "@/data/solutions";
import type { Industry, Solution } from "@/lib/types";
import { useCms } from "./CmsProvider";
import { CONTENT_DEFAULTS } from "./contentSchema";

/** A solution with its portal copy applied. `category` is the editable label; `categoryId` is what filters use. */
export interface EditableSolution extends Solution {
  categoryId: string;
}

function useLookup() {
  const { state, ready } = useCms();
  return useMemo(() => {
    const text = ready ? state.text : {};
    return (id: string) => text[id] ?? CONTENT_DEFAULTS[id] ?? "";
  }, [state.text, ready]);
}

/** The Solutions filter rail: stable ids with their portal labels. */
export function useSolutionFilters(): { id: string; label: string }[] {
  const t = useLookup();
  return useMemo(
    () => SOLUTION_FILTERS.map((f, i) => ({ id: f.id, label: t(`solutions.filters.${i + 1}.label`) })),
    [t],
  );
}

/**
 * SOLUTIONS with every visible string read from the portal: name, description,
 * category tag, checklist and card figures. Ids, slugs and icons are unchanged.
 */
export function useSolutions(): EditableSolution[] {
  const t = useLookup();
  return useMemo(
    () =>
      SOLUTIONS.map((s, i) => {
        const p = `solutions.list.${i + 1}`;
        const filterIndex = SOLUTION_FILTERS.findIndex((f) => f.id === s.category);
        return {
          ...s,
          categoryId: s.category,
          category: filterIndex >= 0 ? t(`solutions.filters.${filterIndex + 1}.label`) : s.category,
          name: t(`${p}.name`),
          description: t(`${p}.description`),
          bullets: s.bullets.map((_, j) => t(`${p}.bullets.${j + 1}.text`)),
          stats: s.stats.map((stat, j) => {
            const delta = t(`${p}.stats.${j + 1}.delta`);
            return {
              ...stat,
              label: t(`${p}.stats.${j + 1}.label`),
              value: t(`${p}.stats.${j + 1}.value`),
              delta: delta || undefined,
            };
          }),
        };
      }),
    [t],
  );
}

/** INDUSTRIES with names, descriptions, outcomes and figures read from the portal. */
export function useIndustries(): Industry[] {
  const t = useLookup();
  return useMemo(
    () =>
      INDUSTRIES.map((ind, i) => {
        const p = `industries.list.${i + 1}`;
        return {
          ...ind,
          name: t(`${p}.name`),
          description: t(`${p}.description`),
          outcomes: ind.outcomes.map((_, j) => t(`${p}.outcomes.${j + 1}.text`)),
          stat: { ...ind.stat, label: t(`${p}.stat.label`), value: t(`${p}.stat.value`) },
        };
      }),
    [t],
  );
}
