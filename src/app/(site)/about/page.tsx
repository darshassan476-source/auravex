import { BlockSlot } from "@/components/sections/BlockSlot";
import type { Metadata } from "next";
import { ProofFigures } from "@/components/sections/ProofFigures";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { AmbientField } from "@/components/sections/AmbientField";
import { CTASection } from "@/components/sections/CTASection";
import { ClientMarquee } from "@/components/sections/ClientMarquee";
import { StackTags } from "@/components/sections/StackTags";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { Button } from "@/components/ui/Button";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Icon } from "@/components/ui/Icon";
import {
  Eyebrow,
  Hairline,
  Section,
  SectionHeading,
} from "@/components/ui/Primitives";
import { Text } from "@/cms/Text";
import { ABOUT_METHOD, ABOUT_PRINCIPLES, ABOUT_SECURITY } from "@/data/aboutCopy";
import { TECH_STACK } from "@/data/site";
import { getSiteBundle } from "@/server/cache";

const META_TITLE = "About";
const META_DESCRIPTION =
  "The team, the method and the mission behind AURAVEX — an engineering studio building intelligent software for enterprises across MENA.";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  return {
    title: text["about.meta.title"] || META_TITLE,
    description: text["about.meta.description"] || META_DESCRIPTION,
  };
}

export default function AboutPage() {
  return (
    <>
      {/* ================= Hero ================= */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="about" background="dark-hero-05" />

        <div className="ax-container relative pb-14 pt-[128px] md:pb-16 md:pt-[152px]">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade" duration={0.6}>
                <EyebrowPill>
                  <Text id="about.hero.eyebrow" /> <Text id="site.name" />
                </EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 text-[clamp(2.3rem,3.9vw,3.4rem)] leading-[1.05]">
                  <Text id="about.hero.title" />{" "}
                  <span className="ax-gradient-text">
                    <Text id="about.hero.accent" />
                  </span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[34rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  <Text id="site.description" /> <Text id="about.hero.introBefore" />{" "}
                  <Text id="site.location" />
                  <Text id="about.hero.introAfter" />
                </p>
              </Reveal>

              <Reveal trigger="load" delay={0.22}>
                <div className="mt-9 flex flex-wrap items-center gap-3.5">
                  <Button href="/contact" size="lg" icon="arrow-right">
                    <Text id="about.hero.primaryCta" />
                  </Button>
                  <Button href="/our-work" size="lg" variant="outline" magnetic={false}>
                    <Text id="about.hero.secondaryCta" />
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Proof figures, panelled over the environment */}
            <Reveal trigger="load" direction="left" delay={0.12}>
              <div className="flex flex-col items-end gap-8">
                <div className="ax-glass-strong ax-edge-light w-full max-w-[330px] rounded-2xl p-6">
                  <ProofFigures />
                </div>

                <div className="hidden flex-col items-end gap-3 text-right xl:flex">
                  <p className="ax-display text-[20px] leading-tight text-[var(--ax-ink)]">
                    <Text id="about.hero.statement" />
                  </p>
                  <span className="h-px w-24 bg-[var(--ax-line-strong)]" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlockSlot page="about" slot="after-hero" />

      {/* ============ Mission ============ */}
      <Section className="pt-4">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal direction="right">
            <div className="flex flex-col gap-6">
              <Eyebrow withRule>
                <Text id="about.mission.eyebrow" />
              </Eyebrow>
              <h2 className="ax-display ax-text-balance text-[clamp(1.9rem,3.8vw,3rem)]">
                <Text id="about.mission.title" />{" "}
                <span className="ax-gradient-text">
                  <Text id="about.mission.accent" />
                </span>
              </h2>
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.08}>
            <div className="flex flex-col gap-5 text-[15.5px] leading-relaxed text-[var(--ax-ink-muted)]">
              <p className="ax-text-pretty">
                <Text id="about.mission.p1" />
              </p>
              <p className="ax-text-pretty">
                <Text id="about.mission.p2" />
              </p>
              <p className="ax-text-pretty">
                <Text id="about.mission.p3" />
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============ Principles ============ */}
      <Section className="ax-halo relative isolate overflow-hidden">
        <AmbientField background="dark-hero-02" />

        <SectionHeading
          eyebrow={<Text id="about.principles.eyebrow" />}
          title={<Text id="about.principles.title" />}
          accent={<Text id="about.principles.accent" />}
          description={<Text id="about.principles.description" />}
        />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {ABOUT_PRINCIPLES.map((principle, i) => (
            <RevealItem key={principle.icon}>
              <div className="ax-glass ax-edge-light group flex h-full flex-col gap-4 rounded-2xl p-7 transition-colors duration-500 hover:border-[var(--ax-line-strong)]">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:scale-110">
                    <Icon name={principle.icon} className="size-5" strokeWidth={1.7} />
                  </span>
                  <span className="font-mono text-[11px] text-[var(--ax-ink-dim)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold text-[var(--ax-ink)]">
                  <Text id={`about.principles.${i + 1}.title`} />
                </h3>
                <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                  <Text id={`about.principles.${i + 1}.body`} />
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* ============ Method ============ */}
      <Section>
        <SectionHeading
          eyebrow={<Text id="about.method.eyebrow" />}
          title={<Text id="about.method.title" />}
          accent={<Text id="about.method.accent" />}
          description={<Text id="about.method.description" />}
        />

        <RevealGroup className="mt-14 flex flex-col gap-3" stagger={0.1}>
          {ABOUT_METHOD.map((phase, i) => (
            <RevealItem key={phase.phase} direction="left">
              <div className="ax-glass ax-edge-light grid items-start gap-5 rounded-2xl p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10">
                <span className="ax-display text-[36px] leading-none text-[rgba(var(--ax-glow),0.35)] md:text-[44px]">
                  {phase.phase}
                </span>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[18px] font-semibold text-[var(--ax-ink)]">
                    <Text id={`about.method.${i + 1}.title`} />
                  </h3>
                  <p className="ax-text-pretty max-w-2xl text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                    <Text id={`about.method.${i + 1}.body`} />
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.08)] px-4 py-1.5 font-mono text-[11.5px] text-[var(--ax-accent-soft)]">
                  <Text id={`about.method.${i + 1}.duration`} />
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <ClientMarquee label={<Text id="about.marquee.label" />} />

      {/* ============ Stack ============ */}
      <Section id="stack">
        <SectionHeading
          eyebrow={<Text id="home.stack.eyebrow" />}
          title={<Text id="about.stack.title" />}
          accent={<Text id="about.stack.accent" />}
          description={<Text id="about.stack.description" />}
        />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {TECH_STACK.map((group, i) => (
            <RevealItem key={group.group}>
              <div className="ax-glass ax-edge-light flex h-full flex-col gap-4 rounded-2xl p-6">
                <h3 className="ax-eyebrow text-[var(--ax-ink)]">
                  <Text id={`stack.${i + 1}.title`} />
                </h3>
                <Hairline />
                <ul className="flex flex-wrap gap-2">
                  <StackTags index={i + 1} />
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* ============ Security ============ */}
      <Section id="security" className="ax-halo relative isolate overflow-hidden">
        <AmbientField background="dark-hero-06" />

        <SectionHeading
          eyebrow={<Text id="about.security.eyebrow" />}
          title={<Text id="about.security.title" />}
          accent={<Text id="about.security.accent" />}
          description={<Text id="about.security.description" />}
        />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {ABOUT_SECURITY.map((item, i) => (
            <RevealItem key={item.icon}>
              <div className="ax-glass ax-edge-light flex h-full items-start gap-4 rounded-2xl p-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
                  <Icon name={item.icon} className="size-[18px]" strokeWidth={1.7} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[14.5px] font-semibold text-[var(--ax-ink)]">
                    <Text id={`about.security.${i + 1}.label`} />
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--ax-ink-dim)]">
                    <Text id={`about.security.${i + 1}.detail`} />
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <BlockSlot page="about" slot="before-cta" />

      <CTASection
        eyebrow={<Text id="about.cta.eyebrow" />}
        title={<Text id="about.cta.title" />}
        accent={<Text id="about.cta.accent" />}
        primaryLabel={<Text id="about.cta.primary" />}
        secondaryLabel={<Text id="about.cta.secondary" />}
        secondaryHref="/our-work"
      />
    </>
  );
}
