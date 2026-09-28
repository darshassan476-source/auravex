import { BlockSlot } from "@/components/sections/BlockSlot";
import { CaseStudyMetrics } from "@/components/sections/CaseStudyMetrics";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHead } from "@/components/sections/SectionHead";
import { FloatingCard } from "@/components/showcase/FloatingCard";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { Button } from "@/components/ui/Button";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Primitives";
import { CASE_STUDIES, WORK_HERO_STATS } from "@/data/caseStudies";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Case studies and measurable results from enterprise platforms AURAVEX has designed, built and scaled.",
};

export default function OurWorkPage() {
  return (
    <>
      {/* ================= Hero ================= */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="our-work" background="dark-hero-06" />

        <div className="ax-container relative pb-14 pt-[128px] md:pb-16 md:pt-[152px]">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade" duration={0.6}>
                <EyebrowPill>Success Stories</EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 text-[clamp(2.7rem,5.6vw,4.7rem)] leading-[1.02]">
                  Real Outcomes
                  <br />
                  for a Smarter <span className="ax-gradient-text">Tomorrow.</span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[34rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  See how leading real estate and construction enterprises use AURAVEX to
                  streamline operations, unlock insights, and build what&rsquo;s next —
                  faster, smarter, and at scale.
                </p>
              </Reveal>

              <Reveal trigger="load" delay={0.22}>
                <Button href="#case-studies" size="lg" icon="arrow-right" className="mt-9">
                  View All Case Studies
                </Button>
              </Reveal>

              {/* Figures with vertical rules, as in the reference */}
              <Reveal trigger="load" delay={0.3}>
                <div className="mt-12 flex flex-wrap items-center">
                  {WORK_HERO_STATS.map((stat, i) => (
                    <div
                      key={stat.label}
                      className={`flex flex-col gap-1 pr-10 ${
                        i > 0 ? "border-l border-[var(--ax-line)] pl-10" : ""
                      }`}
                    >
                      <span className="ax-display ax-gradient-text text-[clamp(1.9rem,3.4vw,2.6rem)] leading-none">
                        {stat.value}
                      </span>
                      <span className="text-[12px] text-[var(--ax-ink-muted)]">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Outcome callouts */}
            <Reveal trigger="load" direction="left" delay={0.12}>
              <div className="relative hidden min-h-[340px] lg:block">
                <FloatingCard
                  icon="chart"
                  title="Higher Productivity"
                  delay={0.5}
                  className="absolute left-[4%] top-0 w-[212px]"
                />
                <FloatingCard
                  icon="settings"
                  title="Smarter Operations"
                  delay={0.62}
                  className="absolute left-[24%] top-[42%] w-[212px]"
                />
                <FloatingCard
                  icon="users"
                  title="Stronger Business Outcomes"
                  delay={0.74}
                  className="absolute right-0 top-[76%] w-[228px]"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlockSlot page="our-work" slot="after-hero" />

      {/* ================= Case studies ================= */}
      <Section id="case-studies" className="pt-6">
        <SectionHead
          eyebrow="Featured Case Studies"
          title={<>Transformation in</>}
          accent="Action."
          description="From complex developments to large-scale operations, explore how our customers turn challenges into measurable growth with AURAVEX."
          action={
            <Button href="/contact" variant="outline" icon="arrow-right" magnetic={false}>
              More Success Stories
            </Button>
          }
        />

        <RevealGroup className="mt-12 grid gap-4 xl:grid-cols-3" stagger={0.1}>
          {CASE_STUDIES.map((study) => (
            <RevealItem key={study.id} className="h-full">
              <Link
                href={`/our-work/${study.slug}`}
                className="ax-focus group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-6 transition-all duration-500 hover:border-[var(--ax-line-strong)] hover:shadow-[0_30px_90px_-36px_rgba(var(--ax-glow),0.55)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-12 size-64 opacity-50 blur-[70px] transition-opacity duration-700 group-hover:opacity-80"
                  style={{ background: "radial-gradient(circle, rgba(var(--ax-glow),0.42), transparent 70%)" }}
                />

                <div className="relative flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-ink-muted)]">
                    <span className="size-1.5 rounded-full bg-[var(--ax-accent)]" />
                    {study.index}
                  </span>
                  <span className="shrink-0 rounded-full border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)] px-2.5 py-1 text-[10px] font-medium text-[var(--ax-ink-muted)]">
                    {study.sector}
                  </span>
                </div>

                <h3 className="relative ax-display text-[21px] leading-[1.15] text-[var(--ax-ink)]">
                  {study.title}
                </h3>

                <p className="relative ax-text-pretty text-[12.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                  {study.summary}
                </p>

                {/* Metrics */}
                <div className="relative grid grid-cols-3 gap-3 border-t border-[var(--ax-line)] pt-4">
                  <CaseStudyMetrics study={study} variant="cells" />
                </div>

                {/* Timeline row */}
                <div className="relative grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-[var(--ax-line)] pt-4 sm:grid-cols-4 xl:grid-cols-2">
                  {study.timeline.map((phase) => (
                    <div key={phase.phase} className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-[var(--ax-ink)]">
                        <span className="size-1 shrink-0 rounded-full bg-[var(--ax-accent)]" />
                        <span className="truncate">{phase.phase}</span>
                      </span>
                      <span className="pl-2.5 text-[10px] text-[var(--ax-ink-dim)]">
                        {phase.duration}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Testimonial */}
                <div className="relative mt-auto flex items-start gap-3 border-t border-[var(--ax-line)] pt-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[11px] font-bold text-white">
                    {study.testimonial.author
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="ax-text-pretty text-[11.5px] italic leading-relaxed text-[var(--ax-ink-muted)]">
                      &ldquo;{study.testimonial.quote}&rdquo;
                    </span>
                    <span className="text-[10.5px] text-[var(--ax-ink-dim)]">
                      — {study.testimonial.author}, {study.testimonial.role}
                    </span>
                  </span>
                  <Icon
                    name="message"
                    className="size-4 shrink-0 text-[var(--ax-accent)] opacity-40"
                    strokeWidth={1.8}
                  />
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <BlockSlot page="our-work" slot="before-cta" />

      <CTASection
        eyebrow="Your turn"
        title="Let's put your numbers on"
        accent="this page."
        primaryLabel="Request a Demo"
        secondaryLabel="Explore products"
        secondaryHref="/products"
      />
    </>
  );
}
