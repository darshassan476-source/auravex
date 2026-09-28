"use client";

import { useProof, useSectors } from "@/cms/useProof";
import { useText } from "@/cms/CmsProvider";
import { Reveal } from "../fx/Reveal";
import { Icon } from "../ui/Icon";

const STAT_ICONS = ["users", "chart", "shield"];

/**
 * The band that closes the product gallery in reference 8. The reference shows
 * client wordmarks there; we show the sectors we build for instead, because we
 * are not going to print companies' names as customers when they are not.
 */
export function TrustBar() {
  const proof = useProof();
  const sectors = useSectors();
  const heading = useText("sectors.label");

  return (
    <section className="relative py-14">
      <div className="ax-container">
        <Reveal direction="scale">
          <div className="ax-glass ax-edge-light grid gap-10 rounded-2xl px-7 py-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:items-center xl:gap-14 xl:px-10">
            {/* Clients */}
            <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
              <p className="shrink-0 whitespace-pre-line text-[10.5px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-[var(--ax-ink-dim)]">
                {heading}
              </p>

              <div className="ax-mask-edges relative w-full min-w-0 flex-1 overflow-hidden">
                <div className="flex w-max animate-[marquee_42s_linear_infinite] items-center gap-10 pr-10">
                  {[...sectors, ...sectors].map((sector, i) => (
                    <span
                      key={`${sector}-${i}`}
                      className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[14px] font-medium text-[var(--ax-ink-muted)] transition-colors duration-300 hover:text-[var(--ax-ink)]"
                    >
                      <span className="size-1 rounded-full bg-[var(--ax-accent)] opacity-60" />
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Figures */}
            <div className="grid min-w-0 gap-6 border-t border-[var(--ax-line)] pt-8 sm:grid-cols-3 xl:border-l xl:border-t-0 xl:pl-12 xl:pt-0">
              {proof.map((stat, i) => (
                <div key={stat.label} className="flex items-start gap-3">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(var(--ax-glow),0.22), rgba(var(--ax-glow),0.05))",
                      boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.22)",
                    }}
                  >
                    <Icon name={STAT_ICONS[i]} className="size-4" strokeWidth={1.9} />
                  </span>

                  <span className="flex min-w-0 flex-col">
                    <span className="ax-display text-[22px] leading-none text-[var(--ax-ink)]">
                      {stat.value}
                    </span>
                    <span className="mt-1.5 text-[11.5px] font-medium leading-snug text-[var(--ax-ink-muted)]">
                      {stat.label}
                    </span>
                    <span className="text-[10.5px] leading-snug text-[var(--ax-ink-dim)]">
                      {stat.sub}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
