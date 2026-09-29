import { BlockSlot } from "@/components/sections/BlockSlot";
import type { Metadata } from "next";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { CTASection } from "@/components/sections/CTASection";
import { TrustBar } from "@/components/sections/TrustBar";
import { Reveal } from "@/components/fx/Reveal";
import { LogoMark } from "@/components/layout/Logo";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Section } from "@/components/ui/Primitives";
import { Text } from "@/cms/Text";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { getCatalogue, getSiteBundle } from "@/server/cache";
import { HeroCard } from "./HeroCard";
import { ProductExplorer } from "./ProductExplorer";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  return {
    title: text["products.meta.title"] || CONTENT_DEFAULTS["products.meta.title"],
    description: text["products.meta.description"] || CONTENT_DEFAULTS["products.meta.description"],
  };
}

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
                <EyebrowPill><Text id="products.hero.eyebrow" /></EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 text-[clamp(2.6rem,5.2vw,4.4rem)] leading-[1.03]">
                  <Text id="products.hero.title" />{" "}
                  <span className="ax-gradient-text"><Text id="products.hero.accent" /></span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[36rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  <Text id="products.hero.body" />
                </p>
              </Reveal>
            </div>

            {/* Callouts + brand plinth */}
            <Reveal trigger="load" direction="left" delay={0.12}>
              <div className="relative hidden min-h-[320px] lg:block">
                <HeroCard
                  icon="chart"
                  titleId="products.hero.card1"
                  delay={0.5}
                  className="absolute left-0 top-2 w-[236px]"
                />
                <HeroCard
                  icon="users"
                  titleId="products.hero.card2"
                  delay={0.62}
                  className="absolute left-[8%] top-[38%] w-[248px]"
                />
                <HeroCard
                  icon="globe"
                  titleId="products.hero.card3"
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
                      <Text id="site.name" />
                    </span>
                    <span className="text-[7.5px] font-medium uppercase tracking-[0.22em] text-[var(--ax-ink-dim)]">
                      <Text id="site.tagline" />
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
        eyebrow={<Text id="products.cta.eyebrow" />}
        title={<Text id="products.cta.title" />}
        accent={<Text id="products.cta.accent" />}
        description={<Text id="products.cta.body" />}
        primaryLabel={<Text id="products.cta.primary" />}
        secondaryLabel={<Text id="products.cta.secondary" />}
        secondaryHref="/about"
      />
    </>
  );
}
