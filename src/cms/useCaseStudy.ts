"use client";

import { useCms } from "./CmsProvider";
import type { CaseStudy } from "@/lib/types";

export interface ResolvedCaseStudy extends CaseStudy {
  hidden?: boolean;
}

/**
 * A case study with the portal's edits applied — title, summary and the
 * three headline figures. Only changed fields are stored, so reverting
 * restores the bundled record rather than a copy of it.
 */
export function useCaseStudy(study: CaseStudy): ResolvedCaseStudy {
  const { state, ready } = useCms();
  if (!ready) return study;
  const patch = state.caseStudies[study.slug];
  if (!patch) return study;
  return {
    ...study,
    title: patch.title ?? study.title,
    summary: patch.summary ?? study.summary,
    metrics: patch.metrics ?? study.metrics,
    hidden: patch.hidden,
  };
}

/** Same resolution for a list; hidden studies are dropped. */
export function useCaseStudies(list: CaseStudy[]): ResolvedCaseStudy[] {
  const { state, ready } = useCms();
  if (!ready) return list;
  return list
    .map((study) => {
      const patch = state.caseStudies[study.slug];
      if (!patch) return study as ResolvedCaseStudy;
      return {
        ...study,
        title: patch.title ?? study.title,
        summary: patch.summary ?? study.summary,
        metrics: patch.metrics ?? study.metrics,
        hidden: patch.hidden,
      } satisfies ResolvedCaseStudy;
    })
    .filter((s) => !s.hidden);
}
