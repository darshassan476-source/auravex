"use client";

import type { CSSProperties } from "react";
import { useCms, useText } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { productImage } from "@/components/cards/ProductCard";
import { SuiteSchematic } from "@/components/showcase/ProductSchematic";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { LaptopFrame } from "@/components/showcase/LaptopFrame";
import { isActive } from "@/data/products";
import { Button } from "../ui/Button";
import { EyebrowPill } from "../ui/EyebrowPill";
import { Icon } from "../ui/Icon";

/** Load-triggered entrance: CSS only, so it paints with the background. */
const rise = (delay: number) => ({
  className: "ax-rv ax-rv-up",
  style: { "--ax-rv-delay": `${delay}s` } as CSSProperties,
});

const PILLAR_ICONS = ["layers", "brain", "settings", "link"] as const;

/**
 * Homepage hero: the positioning statement on the left, a real product screen
 * on the right, and four plain statements of what Auravex does underneath —
 * no counters, no floating claims.
 */
export function HomeHero() {
  const { state } = useCms();
  const catalogue = useCatalogue();
  const uploaded = state.heroImageId
    ? state.media.find((m) => m.id === state.heroImageId)?.src
    : undefined;
  // An uploaded hero image wins; otherwise the first active product's own screen.
  const lead = catalogue.filter(isActive).find((p) => productImage(p));
  const screen = uploaded ?? (lead ? productImage(lead) : undefined);

  const eyebrow = useText("ex.hero.eyebrow");
  const title = useText("ex.hero.title");
  const accent = useText("ex.hero.accent");
  const body = useText("ex.hero.body");
  const primary = useText("ex.hero.primary");
  const secondary = useText("ex.hero.secondary");
  const pillars = [
    useText("ex.hero.pillar.1"),
    useText("ex.hero.pillar.2"),
    useText("ex.hero.pillar.3"),
    useText("ex.hero.pillar.4"),
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop page="home" background="dark-hero-01" />

      <div className="ax-container relative pt-[120px] md:pt-[148px]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
          <div className="flex flex-col items-start">
            <div {...rise(0)}>
              <EyebrowPill>{eyebrow}</EyebrowPill>
            </div>

            <h1
              {...rise(0.08)}
              className="ax-rv ax-rv-up ax-display ax-text-balance mt-7 text-[clamp(2.5rem,4.4vw,4.4rem)] leading-[1.04]"
            >
              {title} <span className="ax-gradient-text">{accent}</span>
            </h1>

            <p
              {...rise(0.16)}
              className="ax-rv ax-rv-up ax-text-pretty mt-6 max-w-[36rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)] md:text-[17px]"
            >
              {body}
            </p>

            <div {...rise(0.24)} className="ax-rv ax-rv-up mt-9 flex flex-wrap items-center gap-3.5">
              <Button href="/products" size="lg" icon="arrow-right">
                {primary}
              </Button>
              <Button href="/contact" size="lg" variant="outline" magnetic={false}>
                {secondary}
              </Button>
            </div>
          </div>

          <div
            className="ax-rv ax-rv-up relative"
            style={{ "--ax-rv-delay": "0.2s", "--ax-rv-dur": "0.9s" } as CSSProperties}
          >
            <div className="mx-auto lg:max-w-[640px] 2xl:max-w-[720px]">
              <LaptopFrame>
                {screen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={screen}
                    alt={lead && !uploaded ? `${lead.name} — application screen` : "Auravex enterprise software"}
                    className="aspect-[16/10] w-full object-cover object-top"
                  />
                ) : (
                  <div className="aspect-[16/10] w-full">
                    <SuiteSchematic products={catalogue.filter(isActive)} />
                  </div>
                )}
              </LaptopFrame>
            </div>
          </div>
        </div>

        <ul
          {...rise(0.4)}
          className="ax-rv ax-rv-up relative mt-14 grid grid-cols-1 gap-y-5 border-t border-[var(--ax-line)] py-8 sm:grid-cols-2 md:mt-20 lg:grid-cols-4 lg:gap-y-0"
        >
          {pillars.map((label, i) => (
            <li
              key={PILLAR_ICONS[i]}
              className={[
                "flex items-center gap-3.5 lg:px-7",
                i > 0 ? "lg:border-l lg:border-[var(--ax-line)]" : "lg:pl-0",
              ].join(" ")}
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
                style={{
                  background: "linear-gradient(145deg, rgba(var(--ax-glow),0.2), rgba(var(--ax-glow),0.04))",
                  boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.2)",
                }}
              >
                <Icon name={PILLAR_ICONS[i]} className="size-[18px]" strokeWidth={1.8} />
              </span>
              <span className="text-[14px] font-medium leading-snug text-[var(--ax-ink)]">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
