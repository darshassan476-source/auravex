"use client";

import { useProof } from "@/cms/useProof";
import { CountUp, parseFigure } from "../fx/CountUp";

/**
 * The three headline figures as a stacked column — the About hero panel.
 * Shares one source with the homepage band, so editing a number in the portal
 * changes it everywhere it appears.
 */
export function ProofFigures() {
  const proof = useProof();

  return (
    <div className="flex flex-col gap-6">
      {proof.map((stat) => {
        const figure = parseFigure(stat.value);
        return (
          <div key={stat.label} className="flex flex-col gap-1.5">
            <span className="ax-display ax-gradient-text text-[30px] leading-none">
              <CountUp
                value={figure.value}
                decimals={figure.decimals}
                prefix={figure.prefix}
                suffix={figure.suffix}
              />
            </span>
            <span className="text-[13px] font-medium text-[var(--ax-ink)]">{stat.label}</span>
            <span className="text-[11.5px] text-[var(--ax-ink-dim)]">{stat.sub}</span>
          </div>
        );
      })}
    </div>
  );
}
