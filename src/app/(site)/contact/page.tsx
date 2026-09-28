import { BlockSlot } from "@/components/sections/BlockSlot";
import type { Metadata } from "next";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { Icon } from "@/components/ui/Icon";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Section, SectionHeading } from "@/components/ui/Primitives";
import { PROCESS_STEPS, SITE } from "@/data/site";
import { DemoPanel } from "./DemoPanel";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a demo or book a discovery call with AURAVEX. We reply within one working day.",
};

const TRUST = [
  { icon: "building", label: "Enterprise\nFocus" },
  { icon: "shield", label: "Trusted\nBy Leaders" },
  { icon: "globe", label: "Global Expertise\nwith Local Insight" },
];

const FAQS = [
  {
    q: "What happens after I submit this?",
    a: "A senior engineer reads it — not a sales development rep. You get a reply within one working day with a proposed time and a short agenda based on what you wrote.",
  },
  {
    q: "Do I need to know what I want built?",
    a: "No. Most engagements start from a problem, not a specification. If you can describe what is costing you time or money, that is enough to have a useful first call.",
  },
  {
    q: "Will the demo be generic?",
    a: "No. We build the walkthrough around your sector and, where you are comfortable sharing it, your own data shape. Thirty minutes, no slide deck.",
  },
  {
    q: "What does an engagement typically cost?",
    a: "A first production release usually lands between $50K and $250K depending on integration surface. We give a fixed number after discovery, not before.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ================= Hero + panel ================= */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="contact" background="dark-hero-02" />

        <div className="ax-container relative pb-16 pt-[128px] md:pb-20 md:pt-[152px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
            {/* Copy */}
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade" duration={0.6}>
                <EyebrowPill>Let&rsquo;s Connect</EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 text-[clamp(2.6rem,5.4vw,4.4rem)] leading-[1.03]">
                  Let&rsquo;s Build Your
                  <br />
                  Next Digital
                  <br />
                  <span className="ax-gradient-text">Advantage.</span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[32rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  Talk to our experts and see how AURAVEX can help you automate operations,
                  unlock new opportunities, and build a more connected enterprise.
                </p>
              </Reveal>

              <Reveal trigger="load" delay={0.22}>
                <div className="mt-10 flex flex-wrap items-center gap-x-9 gap-y-5">
                  {TRUST.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span
                        className="grid size-10 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(var(--ax-glow),0.24), rgba(var(--ax-glow),0.06))",
                          boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.24)",
                        }}
                      >
                        <Icon name={item.icon} className="size-[18px]" strokeWidth={1.8} />
                      </span>
                      <span className="whitespace-pre-line text-[12.5px] font-medium leading-tight text-[var(--ax-ink)]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal trigger="load" delay={0.3}>
                <div className="mt-10 flex flex-col gap-2 text-[13px] text-[var(--ax-ink-muted)]">
                  <a
                    href={`mailto:${SITE.email}`}
                    className="ax-focus inline-flex w-fit items-center gap-2 transition-colors hover:text-[var(--ax-accent-soft)]"
                  >
                    <Icon name="mail" className="size-4" strokeWidth={1.8} />
                    {SITE.email}
                  </a>
                  <span className="inline-flex items-center gap-2">
                    <Icon name="globe" className="size-4" strokeWidth={1.8} />
                    {SITE.location}
                  </span>
                </div>
              </Reveal>
            </div>

            {/* The glowing split panel from the reference */}
            <Reveal trigger="load" direction="left" delay={0.12}>
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-4 rounded-[32px] opacity-70 blur-3xl"
                  style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(var(--ax-glow),0.35), transparent 72%)" }}
                />

                <div className="ax-glass-strong relative overflow-hidden rounded-[24px] ring-1 ring-[rgba(var(--ax-glow),0.35)]">
                  <DemoPanel />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlockSlot page="contact" slot="after-hero" />

      {/* ================= Process ================= */}
      <Section className="pt-4">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            <EyebrowPill trail={false}>From Conversation to Impact</EyebrowPill>
            <h2 className="ax-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08]">
              A Simple Process.
              <br />
              Real Business <span className="ax-gradient-text">Outcomes.</span>
            </h2>
            <p className="ax-text-pretty max-w-md text-[14.5px] leading-relaxed text-[var(--ax-ink-muted)]">
              Get from idea to implementation with a clear, streamlined journey — designed
              for enterprise teams.
            </p>
          </div>

          <RevealGroup className="grid gap-8 sm:grid-cols-3" stagger={0.12}>
            {PROCESS_STEPS.map((step, i) => (
              <RevealItem key={step.step}>
                <div className="relative flex flex-col gap-4">
                  {/* Dotted connector between nodes */}
                  {i < PROCESS_STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[60px] top-[27px] hidden h-px w-[calc(100%-32px)] sm:block"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, var(--ax-line-strong) 0 4px, transparent 4px 9px)",
                      }}
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <span className="relative grid size-[54px] shrink-0 place-items-center rounded-full border border-[rgba(var(--ax-glow),0.45)] bg-[var(--ax-bg)] text-[var(--ax-accent-soft)]">
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full opacity-70 blur-md"
                        style={{ background: "rgba(var(--ax-glow),0.18)" }}
                      />
                      <Icon name={step.icon} className="relative size-5" strokeWidth={1.8} />
                    </span>
                    <span className="font-mono text-[13px] text-[var(--ax-ink-dim)]">
                      {step.step}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-[16px] font-semibold text-[var(--ax-ink)]">{step.title}</h3>
                    <p className="ax-text-pretty text-[13px] leading-relaxed text-[var(--ax-ink-muted)]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* ================= FAQ ================= */}
      <Section className="pt-0">
        <SectionHeading eyebrow="Before you write" title="The questions we get" accent="every time." />

        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2" stagger={0.08}>
          {FAQS.map((faq) => (
            <RevealItem key={faq.q}>
              <div className="ax-glass flex h-full flex-col gap-3 rounded-2xl p-7">
                <h3 className="flex items-start gap-2.5 text-[16px] font-semibold text-[var(--ax-ink)]">
                  <Icon
                    name="message"
                    className="mt-0.5 size-4 shrink-0 text-[var(--ax-accent)]"
                    strokeWidth={2}
                  />
                  {faq.q}
                </h3>
                <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                  {faq.a}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
