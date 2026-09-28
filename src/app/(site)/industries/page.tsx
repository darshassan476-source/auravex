import { BlockSlot } from "@/components/sections/BlockSlot";
import type { Metadata } from "next";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { TiltCard } from "@/components/fx/TiltCard";
import { AmbientField } from "@/components/sections/AmbientField";
import { CTASection } from "@/components/sections/CTASection";
import { ClientMarquee } from "@/components/sections/ClientMarquee";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { Button } from "@/components/ui/Button";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Icon } from "@/components/ui/Icon";
import { Delta, Hairline, Section, SectionHeading } from "@/components/ui/Primitives";
import { INDUSTRIES } from "@/data/solutions";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Built for the sectors we know deeply — real estate development, construction, hospitality, asset management, retail and government.",
};

const DEPTH_POINTS = [
  {
    icon: "target",
    title: "We already speak the language",
    body: "No six-week onboarding to explain what a variation order or a handover snag list is. Domain fluency is the starting position, not the deliverable.",
  },
  {
    icon: "shield",
    title: "Compliance is designed in",
    body: "Audit trails, role-based access and data residency are architectural decisions made before the first screen, not retrofitted after procurement asks.",
  },
  {
    icon: "network",
    title: "Your existing systems stay",
    body: "We integrate with the ERP, the finance stack and the legacy tools your teams already trust. Replacement is a choice, never a prerequisite.",
  },
];

export default function IndustriesPage() {
  return (
    <>
      {/* ================= Hero ================= */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="industries" background="dark-hero-03" />

        <div className="ax-container relative pb-14 pt-[128px] md:pb-16 md:pt-[152px]">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade" duration={0.6}>
                <EyebrowPill>Industries</EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 text-[clamp(2.3rem,3.9vw,3.4rem)] leading-[1.05]">
                  Deep in a Few Sectors,
                  <br />
                  Not Shallow in{" "}
                  <span className="ax-gradient-text">All of Them.</span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[34rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  We have chosen to know a small number of industries properly. That is
                  why our discovery phase takes two weeks instead of two quarters.
                </p>
              </Reveal>

              <Reveal trigger="load" delay={0.22}>
                <div className="mt-9 flex flex-wrap items-center gap-3.5">
                  <Button href="/contact" size="lg" icon="arrow-right">
                    Talk to a specialist
                  </Button>
                  <Button href="/our-work" size="lg" variant="outline" magnetic={false}>
                    See sector results
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Sector figures, panelled over the environment as in reference 2 */}
            <Reveal trigger="load" direction="left" delay={0.12}>
              <div className="flex flex-col items-end gap-8">
                <div className="ax-glass-strong ax-edge-light w-full max-w-[330px] rounded-2xl p-5">
                  <div className="flex flex-col gap-4">
                    {INDUSTRIES.slice(0, 4).map((industry) => (
                      <div key={industry.id} className="flex items-center gap-3.5">
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(var(--ax-glow),0.26), rgba(var(--ax-glow),0.07))",
                            boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.26)",
                          }}
                        >
                          <Icon name={industry.icon} className="size-[18px]" strokeWidth={1.8} />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="ax-display text-[21px] leading-none text-[var(--ax-ink)]">
                            {industry.stat.value}
                          </span>
                          <span className="mt-1 truncate text-[11.5px] text-[var(--ax-ink-muted)]">
                            {industry.stat.label}
                          </span>
                          <span className="truncate text-[10.5px] text-[var(--ax-ink-dim)]">
                            {industry.name}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden flex-col items-end gap-3 text-right xl:flex">
                  <p className="ax-display text-[20px] leading-tight text-[var(--ax-ink)]">
                    Six Sectors.
                    <br />
                    One Standard
                    <br />
                    of Delivery.
                  </p>
                  <span className="h-px w-24 bg-[var(--ax-line-strong)]" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlockSlot page="industries" slot="after-hero" />

      {/* ============ Industry grid ============ */}
      <Section className="pt-4">
        <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {INDUSTRIES.map((industry, i) => (
            <RevealItem key={industry.id}>
              <TiltCard className="h-full" intensity={5}>
                <article
                  id={industry.slug}
                  className="ax-glass ax-edge-light group flex h-full scroll-mt-32 flex-col gap-5 rounded-2xl p-7 transition-all duration-500 hover:border-[var(--ax-line-strong)] hover:ax-glow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:scale-110">
                      <Icon name={industry.icon} className="size-[22px]" strokeWidth={1.7} />
                    </span>
                    <span className="font-mono text-[11px] text-[var(--ax-ink-dim)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <h2 className="text-[19px] font-semibold leading-snug text-[var(--ax-ink)]">
                      {industry.name}
                    </h2>
                    <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                      {industry.description}
                    </p>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {industry.outcomes.map((outcome) => (
                      <li
                        key={outcome}
                        className="flex items-center gap-2 text-[12.5px] text-[var(--ax-ink-dim)]"
                      >
                        <Icon
                          name="check"
                          className="size-3.5 shrink-0 text-[var(--ax-accent)]"
                          strokeWidth={2.6}
                        />
                        {outcome}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-[var(--ax-line)] pt-5">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-baseline gap-2">
                        <span className="ax-display ax-gradient-text text-[26px]">
                          {industry.stat.value}
                        </span>
                        {industry.stat.delta && (
                          <Delta value={industry.stat.delta} trend={industry.stat.trend} />
                        )}
                      </span>
                      <span className="text-[11px] text-[var(--ax-ink-dim)]">
                        {industry.stat.label}
                      </span>
                    </div>

                    <Icon
                      name="arrow-up-right"
                      className="size-5 shrink-0 text-[var(--ax-ink-dim)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-[var(--ax-accent-soft)]"
                      strokeWidth={2}
                    />
                  </div>
                </article>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <ClientMarquee label="Sectors we operate in every day" />

      {/* ============ Why depth matters ============ */}
      <Section className="ax-halo relative isolate overflow-hidden">
        <AmbientField background="dark-hero-01" />

        <SectionHeading
          eyebrow="Why it matters"
          title="Sector depth is what makes"
          accent="the timeline believable."
          description="Generalist vendors spend the first quarter learning your business. We spend it building."
        />

        <RevealGroup className="mt-14 grid gap-5 md:grid-cols-3" stagger={0.1}>
          {DEPTH_POINTS.map((point) => (
            <RevealItem key={point.title}>
              <div className="ax-glass ax-edge-light flex h-full flex-col gap-4 rounded-2xl p-7">
                <span className="grid size-11 place-items-center rounded-xl border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.12)] text-[var(--ax-accent-soft)]">
                  <Icon name={point.icon} className="size-5" strokeWidth={1.7} />
                </span>
                <Hairline />
                <h3 className="text-[17px] font-semibold text-[var(--ax-ink)]">{point.title}</h3>
                <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                  {point.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <BlockSlot page="industries" slot="before-cta" />

      <CTASection
        eyebrow="Your sector"
        title="Not seeing your industry"
        accent="on the list?"
        description="The pattern underneath is usually the same: fragmented data, manual coordination and decisions made on stale numbers. Tell us how it shows up in your world."
        primaryLabel="Start a conversation"
        secondaryLabel="Browse solutions"
        secondaryHref="/solutions"
      />
    </>
  );
}
