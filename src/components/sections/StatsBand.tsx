"use client";

import { useProof } from "@/cms/useProof";
import { CountUp, parseFigure } from "../fx/CountUp";
import { RevealGroup, RevealItem } from "../fx/Reveal";

/**
 * Headline proof numbers — counted up as the band enters the viewport.
 * The figures come from the store, so they are edited in the portal rather
 * than in this file.
 */
export function StatsBand() {
  const proof = useProof();

  return (
    <section className="relative py-16 md:py-20">
      <div className="ax-container">
        <RevealGroup className="grid gap-8 md:grid-cols-3 md:gap-6">
          {proof.map((stat) => {
            const figure = parseFigure(stat.value);
            return (
              <RevealItem key={stat.label}>
                <div className="ax-glass ax-edge-light flex h-full flex-col gap-2 rounded-2xl px-7 py-8">
                  <span className="ax-display ax-gradient-text text-[clamp(2.4rem,4.6vw,3.4rem)]">
                    <CountUp
                      value={figure.value}
                      decimals={figure.decimals}
                      prefix={figure.prefix}
                      suffix={figure.suffix}
                    />
                  </span>
                  <span className="text-[14.5px] font-semibold text-[var(--ax-ink)]">
                    {stat.label}
                  </span>
                  <span className="text-[12.5px] text-[var(--ax-ink-dim)]">{stat.sub}</span>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
