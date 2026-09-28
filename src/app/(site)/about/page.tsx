import { BlockSlot } from "@/components/sections/BlockSlot";
import type { Metadata } from "next";
import { ProofFigures } from "@/components/sections/ProofFigures";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { AmbientField } from "@/components/sections/AmbientField";
import { CTASection } from "@/components/sections/CTASection";
import { ClientMarquee } from "@/components/sections/ClientMarquee";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { Button } from "@/components/ui/Button";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Icon } from "@/components/ui/Icon";
import {
  Eyebrow,
  Hairline,
  Section,
  SectionHeading,
  Tag,
} from "@/components/ui/Primitives";
import { SITE, TECH_STACK } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "The team, the method and the mission behind AURAVEX — an engineering studio building intelligent software for enterprises across MENA.",
};

const PRINCIPLES = [
  {
    icon: "target",
    title: "Start with the number",
    body: "Before a single screen is designed we agree what success looks like numerically, and who owns that number after we leave.",
  },
  {
    icon: "layers",
    title: "Build it to be replaced",
    body: "Every layer is independently deployable. If you outgrow a decision we made, you swap that layer — not the platform.",
  },
  {
    icon: "shield",
    title: "Own your own data",
    body: "Your data stays yours, in your cloud, under your keys. No lock-in disguised as a managed service.",
  },
  {
    icon: "zap",
    title: "Ship in weeks, not quarters",
    body: "Discovery is two weeks because we already know the sector. First production release lands inside the first quarter.",
  },
  {
    icon: "users",
    title: "One team, not a handoff chain",
    body: "The engineers in discovery are the engineers in production. Nothing is thrown over a wall to a delivery unit you never met.",
  },
  {
    icon: "activity",
    title: "Observable by default",
    body: "If it runs in production it emits metrics, traces and logs from day one. You should never need to ask us whether something is working.",
  },
];

const METHOD = [
  {
    phase: "01",
    title: "Discovery",
    duration: "2 weeks",
    body: "We map the workflow as it actually runs — including the spreadsheets and the WhatsApp groups nobody mentions in the kickoff.",
  },
  {
    phase: "02",
    title: "Architecture",
    duration: "2 weeks",
    body: "Data model, integration contracts and the deployment topology, agreed and signed off before implementation starts.",
  },
  {
    phase: "03",
    title: "Build",
    duration: "8–12 weeks",
    body: "Two-week increments, each one deployed to a live environment your team can use. No big-bang reveal at the end.",
  },
  {
    phase: "04",
    title: "Scale",
    duration: "Ongoing",
    body: "Rollout, training and the operational handover — or we keep running it for you. Both are supported paths.",
  },
];

const SECURITY = [
  { icon: "lock", label: "SSO & SCIM", detail: "SAML, OIDC and directory sync on every platform." },
  { icon: "shield", label: "Role-based access", detail: "Field-level permissions with a full audit trail." },
  { icon: "database", label: "Data residency", detail: "Deployed in your region, in your cloud account." },
  { icon: "scan", label: "Continuous scanning", detail: "Dependency, container and secret scanning in CI." },
  { icon: "cloud", label: "Encrypted throughout", detail: "TLS 1.3 in transit, AES-256 at rest, keys you hold." },
  { icon: "file", label: "Audit exports", detail: "Immutable event history, exportable on demand." },
];

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
                <EyebrowPill>About {SITE.name}</EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 text-[clamp(2.3rem,3.9vw,3.4rem)] leading-[1.05]">
                  An Engineering Studio for
                  <br />
                  Software That{" "}
                  <span className="ax-gradient-text">Has to Work.</span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[34rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  {SITE.description} We are a small senior team based in {SITE.location},
                  building the platforms enterprises run their operations on.
                </p>
              </Reveal>

              <Reveal trigger="load" delay={0.22}>
                <div className="mt-9 flex flex-wrap items-center gap-3.5">
                  <Button href="/contact" size="lg" icon="arrow-right">
                    Work with us
                  </Button>
                  <Button href="/our-work" size="lg" variant="outline" magnetic={false}>
                    See the results
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
                    Senior Team.
                    <br />
                    Sector Depth.
                    <br />
                    Measured Outcomes.
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
              <Eyebrow withRule>The mission</Eyebrow>
              <h2 className="ax-display ax-text-balance text-[clamp(1.9rem,3.8vw,3rem)]">
                Software for a <span className="ax-gradient-text">brighter tomorrow.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.08}>
            <div className="flex flex-col gap-5 text-[15.5px] leading-relaxed text-[var(--ax-ink-muted)]">
              <p className="ax-text-pretty">
                Most enterprise software fails quietly. It gets bought, rolled out, half-adopted,
                and two years later the team is back in spreadsheets because the platform never
                quite fit how the work actually happens.
              </p>
              <p className="ax-text-pretty">
                We started AURAVEX to build the other kind — systems shaped around real operations,
                deployed fast enough that they still match the business when they land, and
                architected so they keep matching it as the business changes.
              </p>
              <p className="ax-text-pretty">
                That means fewer clients, deeper sector knowledge and senior engineers on every
                engagement. It is a deliberately unscalable model, and it is why the numbers on our
                case studies look the way they do.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ============ Principles ============ */}
      <Section className="ax-halo relative isolate overflow-hidden">
        <AmbientField background="dark-hero-02" />

        <SectionHeading
          eyebrow="How we work"
          title="Six commitments we make"
          accent="on every engagement."
          description="These are not values on a wall. Each one shows up as a clause in the statement of work."
        />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {PRINCIPLES.map((principle, i) => (
            <RevealItem key={principle.title}>
              <div className="ax-glass ax-edge-light group flex h-full flex-col gap-4 rounded-2xl p-7 transition-colors duration-500 hover:border-[var(--ax-line-strong)]">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:scale-110">
                    <Icon name={principle.icon} className="size-5" strokeWidth={1.7} />
                  </span>
                  <span className="font-mono text-[11px] text-[var(--ax-ink-dim)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold text-[var(--ax-ink)]">{principle.title}</h3>
                <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                  {principle.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* ============ Method ============ */}
      <Section>
        <SectionHeading
          eyebrow="The method"
          title="Four phases, and you can"
          accent="use it from week four."
          description="Nothing is hidden until launch day. Every increment ships to an environment your team can log into."
        />

        <RevealGroup className="mt-14 flex flex-col gap-3" stagger={0.1}>
          {METHOD.map((phase) => (
            <RevealItem key={phase.phase} direction="left">
              <div className="ax-glass ax-edge-light grid items-start gap-5 rounded-2xl p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10">
                <span className="ax-display text-[36px] leading-none text-[rgba(var(--ax-glow),0.35)] md:text-[44px]">
                  {phase.phase}
                </span>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[18px] font-semibold text-[var(--ax-ink)]">{phase.title}</h3>
                  <p className="ax-text-pretty max-w-2xl text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                    {phase.body}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.08)] px-4 py-1.5 font-mono text-[11.5px] text-[var(--ax-accent-soft)]">
                  {phase.duration}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <ClientMarquee label="Organisations we build for" />

      {/* ============ Stack ============ */}
      <Section id="stack">
        <SectionHeading
          eyebrow="Technology"
          title="The stack we"
          accent="stand behind."
          description="Chosen for a ten-year horizon, not a launch demo. Typed end to end, observable in production, and yours to take over whenever you want it."
        />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {TECH_STACK.map((group) => (
            <RevealItem key={group.group}>
              <div className="ax-glass ax-edge-light flex h-full flex-col gap-4 rounded-2xl p-6">
                <h3 className="ax-eyebrow text-[var(--ax-ink)]">{group.group}</h3>
                <Hairline />
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Tag>{item}</Tag>
                    </li>
                  ))}
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
          eyebrow="Security"
          title="Built for procurement"
          accent="from day one."
          description="Every platform ships with the controls enterprise security teams ask for — because we have answered those questionnaires enough times to design around them."
        />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {SECURITY.map((item) => (
            <RevealItem key={item.label}>
              <div className="ax-glass ax-edge-light flex h-full items-start gap-4 rounded-2xl p-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
                  <Icon name={item.icon} className="size-[18px]" strokeWidth={1.7} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[14.5px] font-semibold text-[var(--ax-ink)]">{item.label}</h3>
                  <p className="text-[12.5px] leading-relaxed text-[var(--ax-ink-dim)]">
                    {item.detail}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <BlockSlot page="about" slot="before-cta" />

      <CTASection
        eyebrow="Get in touch"
        title="Tell us what you are"
        accent="trying to build."
        primaryLabel="Start a conversation"
        secondaryLabel="Read case studies"
        secondaryHref="/our-work"
      />
    </>
  );
}
