import { BlockSlot } from "@/components/sections/BlockSlot";
import type { Metadata } from "next";
import { FloatingCard } from "@/components/showcase/FloatingCard";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { CTASection } from "@/components/sections/CTASection";
import { TrustBar } from "@/components/sections/TrustBar";
import { Reveal } from "@/components/fx/Reveal";
import { LogoMark } from "@/components/layout/Logo";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Section } from "@/components/ui/Primitives";
import { SITE } from "@/data/site";
import { getCatalogue } from "@/server/cache";
import { ProductExplorer } from "./ProductExplorer";

export const metadata: Metadata = {
  title: "Products",
  description:
    "The full AURAVEX product portfolio — AI engines, enterprise platforms, automation suites and developer tooling, all in production.",
};

export default async function ProductsPage() {
  return (
    <>
      {/* ================= Hero ================= */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="products" background="dark-hero-04" />

        <div className="ax-container relative pb-16 pt-[128px] md:pb-20 md:pt-[152px]">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade" duration={0.6}>
                <EyebrowPill>Our Work / Product Gallery</EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 text-[clamp(2.6rem,5.2vw,4.4rem)] leading-[1.03]">
                  Software Experiences
                  <br />
                  Designed to <span className="ax-gradient-text">Impress.</span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[36rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  From real estate and hospitality to enterprise operations, we design and
                  build intelligent software products that solve complex challenges and
                  deliver measurable impact.
                </p>
              </Reveal>
            </div>

            {/* Callouts + brand plinth */}
            <Reveal trigger="load" direction="left" delay={0.12}>
              <div className="relative hidden min-h-[320px] lg:block">
                <FloatingCard
                  icon="chart"
                  title="Real Businesses. Real Impact."
                  delay={0.5}
                  className="absolute left-0 top-2 w-[236px]"
                />
                <FloatingCard
                  icon="users"
                  title="Built in Collaboration. For a Global Future."
                  delay={0.62}
                  className="absolute left-[8%] top-[38%] w-[248px]"
                />
                <FloatingCard
                  icon="globe"
                  title="Enterprise Software That Scales."
                  delay={0.74}
                  className="absolute left-0 top-[74%] w-[236px]"
                />

                {/* Illuminated brand block, as on the plinth in the reference */}
                <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 xl:block">
                  <div className="ax-glass-strong relative flex h-[188px] w-[236px] flex-col items-center justify-center gap-3 rounded-2xl">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-6 -bottom-5 h-10 rounded-[50%] opacity-70 blur-2xl"
                      style={{ background: "rgba(var(--ax-glow),0.55)" }}
                    />
                    <LogoMark className="size-11" />
                    <span className="text-[17px] font-semibold tracking-[0.26em] text-[var(--ax-ink)]">
                      AURAVEX
                    </span>
                    <span className="text-[7.5px] font-medium uppercase tracking-[0.22em] text-[var(--ax-ink-dim)]">
                      {SITE.tagline}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlockSlot page="products" slot="after-hero" />

      {/* ================= Gallery ================= */}
      <Section className="pt-2">
        <ProductExplorer products={await getCatalogue()} />
      </Section>

      <TrustBar />

      <BlockSlot page="products" slot="before-cta" />

      <CTASection
        eyebrow="Not on the list?"
        title="Most of our best work started as"
        accent="something that did not exist."
        description="If your problem does not map onto any of these, that is usually the sign it is worth building properly. Tell us what you are up against."
        primaryLabel="Start a conversation"
        secondaryLabel="See how we work"
        secondaryHref="/about"
      />
    </>
  );
}
