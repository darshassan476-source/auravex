"use client";

import { useText } from "./CmsProvider";

export interface ProofFigure {
  /** The figure exactly as typed, e.g. "50+" or "AED 12.4B". */
  value: string;
  label: string;
  sub: string;
}

/**
 * The three headline figures, read from the store.
 *
 * They ship as placeholders. Keeping them here rather than hard-coded means
 * replacing them with real numbers is a typing job in the portal, not a code
 * change — which is the only reason it is acceptable to ship placeholders at
 * all.
 */
export function useProof(): ProofFigure[] {
  const v1 = useText("proof.1.value");
  const l1 = useText("proof.1.label");
  const s1 = useText("proof.1.sub");
  const v2 = useText("proof.2.value");
  const l2 = useText("proof.2.label");
  const s2 = useText("proof.2.sub");
  const v3 = useText("proof.3.value");
  const l3 = useText("proof.3.label");
  const s3 = useText("proof.3.sub");

  return [
    { value: v1, label: l1, sub: s1 },
    { value: v2, label: l2, sub: s2 },
    { value: v3, label: l3, sub: s3 },
  ];
}

/** The sector band, in order, with blanks dropped. */
export function useSectors(): string[] {
  const a = useText("sectors.1");
  const b = useText("sectors.2");
  const c = useText("sectors.3");
  const d = useText("sectors.4");
  const e = useText("sectors.5");
  const f = useText("sectors.6");
  return [a, b, c, d, e, f].map((s) => s.trim()).filter(Boolean);
}
