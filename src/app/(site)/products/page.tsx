import type { Metadata } from "next";
import { Text } from "@/cms/Text";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { Reveal } from "@/components/fx/Reveal";
import { BlockSlot } from "@/components/sections/BlockSlot";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHead } from "@/components/sections/SectionHead";
import { PipelineSection, SolutionCount, SolutionsGrid } from "@/components/sections/SolutionsGrid";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Section } from "@/components/ui/Primitives";
import { getSiteBundle } from "@/server/cache";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  const title = text["ex.solutions.meta.title"] || CONTENT_DEFAULTS["ex.solutions.meta.title"];
  const description = text["ex.solutions.meta.description"] || CONTENT_DEFAULTS["ex.solutions.meta.description"];
  return {
    title,
    description,
    alternates: { canonical: "/products" },
    openGraph: { title, description, url: "/products" },
  };
}

export default function EnterpriseSolutionsPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="products" background="dark-hero-04" />
        <div className="ax-container relative pb-12 pt-[128px] md:pb-14 md:pt-[152px]">
          <Reveal trigger="load" direction="fade" duration={0.6}>
            <EyebrowPill>
              <Text id="ex.solutions.eyebrow" />
            </EyebrowPill>
          </Reveal>
          <Reveal trigger="load" delay={0.06}>
            <h1 className="ax-display ax-text-balance mt-7 max-w-4xl text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.05]">
              <Text id="ex.solutions.title" />
            </h1>
          </Reveal>
          <Reveal trigger="load" delay={0.12}>
            <p className="ax-text-pretty mt-6 max-w-[44rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
              <Text id="ex.solutions.body" />
            </p>
          </Reveal>
          <Reveal trigger="load" delay={0.18}>
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-4 py-2 text-[13.5px] font-semibold text-[var(--ax-ink)]">
              <span className="size-1.5 rounded-full bg-[var(--ax-success)]" />
              <SolutionCount />
            </p>
          </Reveal>
        </div>
      </section>

      <BlockSlot page="products" slot="after-hero" />

      <Section className="pt-4">
        <SolutionsGrid which="active" />
      </Section>

      <PipelineSection>
        <Section>
          <SectionHead
            eyebrow={<Text id="ex.solutions.pipeline.eyebrow" />}
            title={<Text id="ex.solutions.pipeline.title" />}
            description={<Text id="ex.solutions.pipeline.body" />}
          />
          <SolutionsGrid which="pipeline" className="mt-12" />
        </Section>
      </PipelineSection>

      <BlockSlot page="products" slot="before-cta" />

      <CTASection
        eyebrow={<Text id="ex.home.contact.eyebrow" />}
        title={<Text id="ex.home.contact.title" />}
        accent=""
        description={<Text id="ex.home.contact.body" />}
        primaryLabel={<Text id="ex.home.contact.primary" />}
        primaryHref="/contact"
        secondaryLabel={<Text id="ex.product.pricing.button" />}
        secondaryHref="/contact?proposal=1"
      />
    </>
  );
}
