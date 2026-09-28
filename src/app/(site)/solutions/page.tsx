import { BlockSlot } from "@/components/sections/BlockSlot";
import type { Metadata } from "next";
import { Reveal } from "@/components/fx/Reveal";
import { CTASection } from "@/components/sections/CTASection";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Primitives";
import { SOLUTION_HERO_STATS, SOLUTIONS } from "@/data/solutions";
import { SolutionGrid } from "./SolutionGrid";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Outcome-led software for real business problems — property operations, workflow automation, analytics, customer experience and custom platforms.",
};

export default function SolutionsPage() {
  return (
    <>
      {/* ================= Hero ================= */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="solutions" background="dark-hero-05" />

        <div className="ax-container relative pb-14 pt-[128px] md:pb-16 md:pt-[152px]">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade" duration={0.6}>
                <EyebrowPill>Our Solutions</EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 text-[clamp(2.6rem,5.4vw,4.5rem)] leading-[1.03]">
                  Software Built Around
                  <br />
                  Real <span className="ax-gradient-text">Business Outcomes.</span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[34rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  A powerful suite of enterprise software solutions designed for the real
                  estate and urban economy — helping you automate, connect and grow with
                  confidence.
                </p>
              </Reveal>
            </div>

            {/* Stats panel overlaying the environment, as in reference 2 */}
            <Reveal trigger="load" direction="left" delay={0.12}>
              <div className="flex flex-col items-end gap-8">
                <div className="ax-glass-strong ax-edge-light w-full max-w-[330px] rounded-2xl p-5">
                  <div className="flex flex-col gap-4">
                    {SOLUTION_HERO_STATS.map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3.5">
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(var(--ax-glow),0.26), rgba(var(--ax-glow),0.07))",
                            boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.26)",
                          }}
                        >
                          <Icon name={stat.icon} className="size-[18px]" strokeWidth={1.8} />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="ax-display text-[21px] leading-none text-[var(--ax-ink)]">
                            {stat.value}
                          </span>
                          <span className="mt-1 truncate text-[11.5px] text-[var(--ax-ink-muted)]">
                            {stat.label}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden flex-col items-end gap-3 text-right xl:flex">
                  <p className="ax-display text-[20px] leading-tight text-[var(--ax-ink)]">
                    One Platform.
                    <br />A Smarter
                    <br />
                    Enterprise Future.
                  </p>
                  <span className="h-px w-24 bg-[var(--ax-line-strong)]" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlockSlot page="solutions" slot="after-hero" />

      {/* ================= Grid ================= */}
      <Section className="pt-2">
        <SolutionGrid solutions={SOLUTIONS} />
      </Section>

      <BlockSlot page="solutions" slot="before-cta" />

      <CTASection
        eyebrow="Next step"
        title="Bring us the number you"
        accent="cannot move."
        primaryLabel="Book a discovery call"
        secondaryLabel="Browse industries"
        secondaryHref="/industries"
      />
    </>
  );
}
