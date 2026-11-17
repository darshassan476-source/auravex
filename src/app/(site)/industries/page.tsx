import type { Metadata } from "next";
import { Reveal } from "@/components/fx/Reveal";
import { BlockSlot } from "@/components/sections/BlockSlot";
import { CTASection } from "@/components/sections/CTASection";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { Button } from "@/components/ui/Button";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Section } from "@/components/ui/Primitives";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { Text } from "@/cms/Text";
import { getSiteBundle } from "@/server/cache";
import { IndustryList } from "./IndustryList";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  const title = text["ex.industries.meta.title"] || CONTENT_DEFAULTS["ex.industries.meta.title"];
  const description = text["ex.industries.meta.description"] || CONTENT_DEFAULTS["ex.industries.meta.description"];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/industries" },
    openGraph: { title, description, url: "/industries" },
  };
}

export default function IndustriesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="industries" background="dark-hero-03" />

        <div className="ax-container relative pb-14 pt-[128px] md:pb-16 md:pt-[152px]">
          <div className="flex max-w-3xl flex-col items-start">
            <Reveal trigger="load" direction="fade" duration={0.6}>
              <EyebrowPill>
                <Text id="ex.industries.eyebrow" />
              </EyebrowPill>
            </Reveal>

            <Reveal trigger="load" delay={0.06}>
              <h1 className="ax-display ax-text-balance mt-7 text-[clamp(2.3rem,4.4vw,3.8rem)] leading-[1.05]">
                <Text id="ex.industries.title" />{" "}
                <span className="ax-gradient-text">
                  <Text id="ex.industries.accent" />
                </span>
              </h1>
            </Reveal>

            <Reveal trigger="load" delay={0.14}>
              <p className="ax-text-pretty mt-6 max-w-[40rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                <Text id="ex.industries.body" />
              </p>
            </Reveal>

            <Reveal trigger="load" delay={0.22}>
              <div className="mt-9 flex flex-wrap items-center gap-3.5">
                <Button href="/products" size="lg" icon="arrow-right">
                  <Text id="ex.home.solutions.button" />
                </Button>
                <Button href="/contact" size="lg" variant="outline" magnetic={false}>
                  <Text id="ex.home.contact.primary" />
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlockSlot page="industries" slot="after-hero" />

      <Section className="pt-4">
        <IndustryList />
      </Section>

      <BlockSlot page="industries" slot="before-cta" />

      <CTASection
        eyebrow={<Text id="ex.industries.eyebrow" />}
        title={<Text id="ex.industries.cta.title" />}
        accent={<Text id="ex.industries.cta.accent" />}
        description={<Text id="ex.industries.cta.body" />}
        primaryLabel={<Text id="ex.home.contact.primary" />}
        secondaryLabel={<Text id="ex.home.solutions.button" />}
      />
    </>
  );
}
