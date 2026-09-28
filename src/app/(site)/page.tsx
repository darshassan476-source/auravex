import Link from "next/link";
import { Text } from "@/cms/Text";
import { BlockSlot } from "@/components/sections/BlockSlot";
import { CaseStudyMetrics } from "@/components/sections/CaseStudyMetrics";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { CTASection } from "@/components/sections/CTASection";
import { HomeHero } from "@/components/sections/HomeHero";
import { ProductCarousel } from "@/components/sections/ProductCarousel";
import { SectionHead } from "@/components/sections/SectionHead";
import { TrustBar } from "@/components/sections/TrustBar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Hairline, Section, Tag } from "@/components/ui/Primitives";
import { CASE_STUDIES } from "@/data/caseStudies";
import { PRODUCTS } from "@/data/products";
import { PROCESS_STEPS, TECH_STACK } from "@/data/site";
import { SOLUTIONS } from "@/data/solutions";

export default function HomePage() {
  // The reference gallery shows these four, in this order.
  const PORTFOLIO_SLUGS = [
    "real-estate-os",
    "business-intelligence",
    "operations-suite",
    "custom-platforms",
  ];
  const portfolio = PORTFOLIO_SLUGS.map(
    (slug) => PRODUCTS.find((p) => p.slug === slug)!,
  ).filter(Boolean);
  const lead = CASE_STUDIES[0];

  return (
    <>
      <HomeHero />

      <BlockSlot page="home" slot="after-hero" />

      {/* ================= Product portfolio ================= */}
      <Section id="products" className="pt-16 md:pt-20">
        <SectionHead
          eyebrow={<Text id="home.portfolio.eyebrow" />}
          title={<Text id="home.portfolio.title" />}
          accent={<Text id="home.portfolio.accent" />}
          description={<Text id="home.portfolio.body" />}
          action={
            <Button href="/products" variant="outline" icon="arrow-right" magnetic={false}>
              View All Products
            </Button>
          }
        />

        <Reveal className="mt-12">
          <ProductCarousel products={portfolio} />
        </Reveal>
      </Section>

      <TrustBar />

      {/* ================= Solutions ================= */}
      <Section className="pt-6">
        <SectionHead
          eyebrow={<Text id="home.solutions.eyebrow" />}
          title={<Text id="home.solutions.title" />}
          accent={<Text id="home.solutions.accent" />}
          description="A powerful suite of enterprise software solutions designed for the real estate and urban economy — helping you automate, connect and grow with confidence."
          action={
            <Button href="/solutions" variant="outline" icon="arrow-right" magnetic={false}>
              All Solutions
            </Button>
          }
        />

        <RevealGroup className="mt-12 grid gap-4 lg:grid-cols-2" stagger={0.08}>
          {SOLUTIONS.slice(0, 4).map((solution) => (
            <RevealItem key={solution.id}>
              <Link
                href={`/solutions#${solution.slug}`}
                className="ax-glass ax-focus group flex h-full items-start gap-5 rounded-2xl p-6 transition-all duration-500 hover:border-[var(--ax-line-strong)] md:p-7"
              >
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(var(--ax-glow),0.24), rgba(var(--ax-glow),0.06))",
                    boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.24)",
                  }}
                >
                  <Icon name={solution.icon} className="size-5" strokeWidth={1.8} />
                </span>

                <span className="flex min-w-0 flex-1 flex-col gap-3">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="text-[18px] font-semibold text-[var(--ax-ink)]">
                      {solution.name}
                    </span>
                    <Tag>{solution.category}</Tag>
                  </span>

                  <span className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                    {solution.description}
                  </span>

                  <span className="mt-1 flex flex-col gap-1.5">
                    {solution.bullets.map((bullet) => (
                      <span
                        key={bullet}
                        className="flex items-center gap-2 text-[12.5px] text-[var(--ax-ink-dim)]"
                      >
                        <Icon
                          name="check-circle"
                          className="size-3.5 shrink-0 text-[var(--ax-accent)]"
                          strokeWidth={2.1}
                        />
                        {bullet}
                      </span>
                    ))}
                  </span>

                  <span className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--ax-accent-soft)]">
                    Explore Solution
                    <Icon
                      name="arrow-right"
                      className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2.3}
                    />
                  </span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* ================= Featured case study ================= */}
      <Section className="pt-6">
        <SectionHead
          eyebrow={<Text id="home.work.eyebrow" />}
          title={<Text id="home.work.title" />}
          accent={<Text id="home.work.accent" />}
          description="From complex developments to large-scale operations, explore how our customers turn challenges into measurable growth with AURAVEX."
          action={
            <Button href="/our-work" variant="outline" icon="arrow-right" magnetic={false}>
              More Success Stories
            </Button>
          }
        />

        <Reveal className="mt-12">
          <Link
            href={`/our-work/${lead.slug}`}
            className="ax-glass ax-focus group grid overflow-hidden rounded-2xl transition-all duration-500 hover:border-[var(--ax-line-strong)] lg:grid-cols-[1.35fr_1fr]"
          >
            <div className="flex flex-col gap-6 p-8 md:p-11">
              <div className="flex flex-wrap items-center gap-3">
                <EyebrowPill trail={false}>{lead.index}</EyebrowPill>
                <Tag>{lead.sector}</Tag>
              </div>

              <h3 className="ax-display ax-text-balance max-w-2xl text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.08]">
                {lead.title}
              </h3>

              <p className="ax-text-pretty max-w-xl text-[14.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                {lead.summary}
              </p>

              <div className="mt-2 grid grid-cols-3 gap-6 border-t border-[var(--ax-line)] pt-6">
                <CaseStudyMetrics study={lead} variant="cells" />
              </div>

              {/* Timeline, as printed across the reference case-study cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {lead.timeline.map((phase) => (
                  <div key={phase.phase} className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--ax-ink)]">
                      <span className="size-1.5 rounded-full bg-[var(--ax-accent)]" />
                      {phase.phase}
                    </span>
                    <span className="pl-3 text-[11px] text-[var(--ax-ink-dim)]">
                      {phase.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative flex flex-col justify-between gap-8 border-t border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] p-8 md:p-11 lg:border-l lg:border-t-0">
              <Icon
                name="message"
                className="size-6 text-[var(--ax-accent-soft)] opacity-70"
                strokeWidth={1.7}
              />

              <blockquote className="ax-text-pretty text-[16px] leading-relaxed text-[var(--ax-ink)]">
                &ldquo;{lead.testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[12px] font-bold text-white">
                  {lead.testimonial.author
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[var(--ax-ink)]">
                    {lead.testimonial.author}
                  </span>
                  <span className="text-[11.5px] text-[var(--ax-ink-dim)]">
                    {lead.testimonial.role}
                  </span>
                </span>
              </div>
            </aside>
          </Link>
        </Reveal>
      </Section>

      {/* ================= Process ================= */}
      <Section className="pt-6">
        <SectionHead
          eyebrow={<Text id="home.process.eyebrow" />}
          title={<Text id="home.process.title" />}
          accent={<Text id="home.process.accent" />}
          description="Get from idea to implementation with a clear, streamlined journey — designed for enterprise teams."
        />

        <RevealGroup className="mt-14 grid gap-10 md:grid-cols-3" stagger={0.12}>
          {PROCESS_STEPS.map((step, i) => (
            <RevealItem key={step.step}>
              <div className="relative flex flex-col gap-5">
                {/* Connector, as drawn between the reference process nodes */}
                {i < PROCESS_STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[76px] top-[31px] hidden h-px w-[calc(100%-46px)] bg-[linear-gradient(90deg,var(--ax-line-strong),transparent)] md:block"
                  />
                )}

                <div className="flex items-center gap-4">
                  <span className="relative grid size-[62px] shrink-0 place-items-center rounded-full border border-[var(--ax-line-strong)] bg-[var(--ax-bg)] text-[var(--ax-accent-soft)]">
                    <span className="absolute inset-0 rounded-full bg-[rgba(var(--ax-glow),0.10)] blur-md" />
                    <Icon name={step.icon} className="relative size-6" strokeWidth={1.7} />
                  </span>
                  <span className="font-mono text-[13px] text-[var(--ax-ink-dim)]">{step.step}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[18px] font-semibold text-[var(--ax-ink)]">{step.title}</h3>
                  <p className="ax-text-pretty max-w-[34ch] text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                    {step.body}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* ================= Stack ================= */}
      <Section id="stack" className="pt-6">
        <SectionHead
          eyebrow={<Text id="home.stack.eyebrow" />}
          title={<Text id="home.stack.title" />}
          accent={<Text id="home.stack.accent" />}
          description="Typed end to end, observable in production, and yours to take over whenever you want it."
        />

        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
          {TECH_STACK.map((group) => (
            <RevealItem key={group.group}>
              <div className="ax-glass flex h-full flex-col gap-4 rounded-2xl p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ax-ink)]">
                  {group.group}
                </h3>
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

      <BlockSlot page="home" slot="before-cta" />

      <CTASection />
    </>
  );
}
