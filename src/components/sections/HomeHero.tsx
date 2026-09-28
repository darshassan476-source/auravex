"use client";

import type { CSSProperties } from "react";
import { useCms, useText } from "@/cms/CmsProvider";
import { FloatingCard } from "@/components/showcase/FloatingCard";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { LaptopFrame } from "@/components/showcase/LaptopFrame";
import { MapScreen } from "@/components/showcase/interfaces/MapScreen";
import { CAPABILITY_STRIP } from "@/data/site";
import { Button } from "../ui/Button";
import { EyebrowPill } from "../ui/EyebrowPill";
import { Icon } from "../ui/Icon";

/**
 * Homepage hero, composed to reference 1: copy column on the left, device
 * mockup on the right with glass callouts overlapping it, capability strip
 * with vertical dividers along the bottom edge.
 *
 * Pass `image` through to HeroBackdrop once a hero photograph exists.
 */

/** Load-triggered entrance: CSS only, so it paints with the background. */
const rise = (delay: number) => ({
  className: "ax-rv ax-rv-up",
  style: { "--ax-rv-delay": `${delay}s` } as CSSProperties,
});

export function HomeHero() {
  const { state } = useCms();
  const heroImage = state.heroImageId
    ? state.media.find((m) => m.id === state.heroImageId)?.src
    : undefined;

  // Named up front rather than called inline: these are hooks, and reading
  // them in one place keeps that obvious.
  const eyebrow = useText("home.hero.eyebrow");
  const titleA = useText("home.hero.titleA");
  const titleB = useText("home.hero.titleB");
  const accent = useText("home.hero.accent");
  const body = useText("home.hero.body");
  const primaryCta = useText("home.hero.primaryCta");
  const secondaryCta = useText("home.hero.secondaryCta");

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackdrop page="home" background="dark-hero-01" />

      <div className="ax-container relative pb-0 pt-[128px] md:pt-[152px]">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1.12fr)] lg:gap-12">
          {/* ================= Copy ================= */}
          <div className="flex flex-col items-start">
            <div {...rise(0)}>
              <EyebrowPill>{eyebrow}</EyebrowPill>
            </div>

            <h1
              {...rise(0.08)}
              className="ax-rv ax-rv-up ax-display mt-7 text-[clamp(2.6rem,3.6vw,4.2rem)] leading-[1.04]"
            >
              {titleA}
              <br />
              {titleB}{" "}
              <span className="ax-gradient-text">{accent}</span>
            </h1>

            <p
              {...rise(0.16)}
              className="ax-rv ax-rv-up ax-text-pretty mt-6 max-w-[34rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)] md:text-[17px]"
            >
              {body}
            </p>

            <div {...rise(0.24)} className="ax-rv ax-rv-up mt-9 flex flex-wrap items-center gap-3.5">
              <Button href="/products" size="lg" icon="arrow-right">
                {primaryCta}
              </Button>
              <Button href="/contact" size="lg" variant="outline" magnetic={false}>
                {secondaryCta}
              </Button>
            </div>
          </div>

          {/* ================= Product visual ================= */}
          <div
            className="ax-rv ax-rv-up relative"
            style={{ "--ax-rv-delay": "0.22s", "--ax-rv-dur": "0.9s" } as CSSProperties}
          >
            {/* Capped so the callouts sit beside the device, not over its data */}
            <div className="lg:max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px]">
              <LaptopFrame>
                {heroImage ? (
                  // Whatever is uploaded sits on the screen, inside the bezel.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImage}
                    alt=""
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <MapScreen />
                )}
              </LaptopFrame>
            </div>

            {/* Callouts overlapping the device, as in the reference */}
            <FloatingCard
              icon="sparkles"
              title="AI Insights"
              body="Identify high-value investments and opportunities with AI."
              delay={0.85}
              className="absolute -left-12 top-[42%] hidden xl:block"
            />
            <FloatingCard
              icon="settings"
              title="Automate Operations"
              body="Reduce costs and increase efficiency."
              delay={0.98}
              className="absolute right-0 top-[16%] hidden lg:block"
            />
            <FloatingCard
              icon="chart"
              title="Predict Growth"
              body="Turn data into smarter decisions."
              delay={1.1}
              className="absolute right-0 top-[50%] hidden lg:block"
            />
          </div>
        </div>

        {/* ================= Capability strip ================= */}
        <div
          {...rise(0.5)}
          className="ax-rv ax-rv-up relative mt-16 grid grid-cols-2 gap-y-7 border-t border-[var(--ax-line)] py-8 md:mt-20 md:grid-cols-4 md:gap-y-0"
        >
          {CAPABILITY_STRIP.map((item, i) => (
            <div
              key={item.label}
              className={cnDivider(i)}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(var(--ax-glow),0.22), rgba(var(--ax-glow),0.05))",
                  boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.22)",
                }}
              >
                <Icon name={item.icon} className="size-[18px]" strokeWidth={1.8} />
              </span>
              <span className="whitespace-pre-line text-[13.5px] font-medium leading-tight text-[var(--ax-ink)]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Vertical rules between capability items, matching the reference strip. */
function cnDivider(index: number) {
  return [
    "flex items-center gap-3.5 px-0 md:px-7",
    index > 0 ? "md:border-l md:border-[var(--ax-line)]" : "",
    index === 0 ? "md:pl-0" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
