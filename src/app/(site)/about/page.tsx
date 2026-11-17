import type { Metadata } from "next";
import { Reveal } from "@/components/fx/Reveal";
import { BlockSlot } from "@/components/sections/BlockSlot";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHead } from "@/components/sections/SectionHead";
import { TextCardGrid } from "@/components/sections/TextCardGrid";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { Button } from "@/components/ui/Button";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Section } from "@/components/ui/Primitives";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { Text } from "@/cms/Text";
import { ABOUT_BUILD, ABOUT_DELIVERY, ABOUT_READINESS } from "@/data/aboutCopy";
import { getSiteBundle } from "@/server/cache";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  const title = text["ex.about.meta.title"] || CONTENT_DEFAULTS["ex.about.meta.title"];
  const description = text["ex.about.meta.description"] || CONTENT_DEFAULTS["ex.about.meta.description"];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/about" },
    openGraph: { title, description, url: "/about" },
  };
}

const icons = (list: readonly { icon: string }[]) => list.map((item) => item.icon);

export default function AboutPage() {
  return (
    <>
      {/* ================= Hero ================= */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="about" background="dark-hero-05" />

        <div className="ax-container relative pb-16 pt-[128px] md:pb-20 md:pt-[152px]">
          <div className="flex max-w-3xl flex-col items-start">
            <Reveal trigger="load" direction="fade" duration={0.6}>
              <EyebrowPill>
                <Text id="ex.about.eyebrow" />
              </EyebrowPill>
            </Reveal>

            <Reveal trigger="load" delay={0.06}>
              <h1 className="ax-display ax-text-balance mt-7 text-[clamp(2.3rem,4.4vw,3.8rem)] leading-[1.05]">
                <Text id="ex.about.title" />{" "}
                <span className="ax-gradient-text">
                  <Text id="ex.about.accent" />
                </span>
              </h1>
            </Reveal>

            <Reveal trigger="load" delay={0.14}>
              <p className="ax-text-pretty mt-6 max-w-[40rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)] md:text-[17px]">
                <Text id="ex.about.body" />
              </p>
            </Reveal>

            <Reveal trigger="load" delay={0.22}>
              <div className="mt-9 flex flex-wrap items-center gap-3.5">
                <Button href="/products" size="lg" icon="arrow-right">
                  <Text id="ex.about.build.button" />
                </Button>
                <Button href="/contact" size="lg" variant="outline" magnetic={false}>
                  <Text id="ex.about.cta.primary" />
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlockSlot page="about" slot="after-hero" />

      {/* ================= What we build ================= */}
      <Section className="pt-6">
        <SectionHead
          eyebrow={<Text id="ex.about.build.eyebrow" />}
          title={<Text id="ex.about.build.title" />}
          description={<Text id="ex.about.build.body" />}
          action={
            <Button href="/products" variant="outline" icon="arrow-right" magnetic={false}>
              <Text id="ex.about.build.button" />
            </Button>
          }
        />
        <div className="mt-12">
          <TextCardGrid prefix="ex.about.build" icons={icons(ABOUT_BUILD)} columns={4} />
        </div>
      </Section>

      {/* ================= How we deliver ================= */}
      <Section className="pt-6">
        <SectionHead
          eyebrow={<Text id="ex.about.delivery.eyebrow" />}
          title={<Text id="ex.about.delivery.title" />}
          description={<Text id="ex.about.delivery.body" />}
        />
        <div className="mt-12">
          <TextCardGrid prefix="ex.about.delivery" icons={icons(ABOUT_DELIVERY)} columns={4} numbered />
        </div>
      </Section>

      {/* ================= Enterprise readiness ================= */}
      <Section className="pt-6">
        <SectionHead
          eyebrow={<Text id="ex.about.ready.eyebrow" />}
          title={<Text id="ex.about.ready.title" />}
          description={<Text id="ex.about.ready.body" />}
        />
        <div className="mt-12">
          <TextCardGrid prefix="ex.about.ready" icons={icons(ABOUT_READINESS)} columns={4} />
        </div>
      </Section>

      <BlockSlot page="about" slot="before-cta" />

      <CTASection
        eyebrow={<Text id="ex.about.cta.eyebrow" />}
        title={<Text id="ex.about.cta.title" />}
        accent={<Text id="ex.about.cta.accent" />}
        description={<Text id="ex.about.cta.body" />}
        primaryLabel={<Text id="ex.about.cta.primary" />}
        primaryHref="/contact"
        secondaryLabel={<Text id="ex.about.cta.secondary" />}
        secondaryHref="/products"
      />
    </>
  );
}
