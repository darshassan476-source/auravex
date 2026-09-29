import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { AmbientField } from "@/components/sections/AmbientField";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { BlockSlot } from "@/components/sections/BlockSlot";
import {
  CaseStudyMetrics,
  CaseStudyText,
} from "@/components/sections/CaseStudyMetrics";
import { Icon } from "@/components/ui/Icon";
import { MockScreen } from "@/components/ui/MockScreen";
import { ProductVisual } from "@/components/showcase/ProductVisual";
import {
  Eyebrow,
  Hairline,
  Pill,
  Section,
  SectionHeading,
} from "@/components/ui/Primitives";
import { CASE_STUDIES, getCaseStudy } from "@/data/caseStudies";
import { getProduct } from "@/data/products";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { TemplateText, TextFloatingCard } from "@/cms/sectorsWorkClient";
import { Text } from "@/cms/Text";
import { getSiteBundle } from "@/server/cache";

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) {
    const text = (await getSiteBundle()).text ?? {};
    return { title: text["casestudy.meta.notfound"] || CONTENT_DEFAULTS["casestudy.meta.notfound"] };
  }

  return {
    title: study.title,
    description: study.summary,
    openGraph: { title: study.title, description: study.summary },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const product = study.productSlug ? getProduct(study.productSlug) : undefined;
  const accent = product?.accent ?? "#3b82f6";

  const index = CASE_STUDIES.findIndex((c) => c.slug === study.slug);
  const next = CASE_STUDIES[(index + 1) % CASE_STUDIES.length];

  return (
    <>
      {/* ============ Hero ============ */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="case-study" background="dark-hero-03" />

        <div className="ax-container relative pb-14 pt-[122px] md:pb-16 md:pt-[146px]">
          <Reveal trigger="load" direction="fade" duration={0.6}>
            <nav className="mb-7 flex items-center gap-2 text-[12.5px] text-[var(--ax-ink-dim)]">
              <Link
                href="/our-work"
                className="ax-focus inline-flex items-center gap-1.5 transition-colors hover:text-[var(--ax-ink-muted)]"
              >
                <Icon
                  name="arrow-left"
                  className="size-3.5"
                  strokeWidth={2.2}
                />
                <Text id="casestudy.breadcrumb" />
              </Link>
              <Icon
                name="chevron-right"
                className="size-3.5"
                strokeWidth={2.2}
              />
              <span className="text-[var(--ax-ink-muted)]">{study.index}</span>
            </nav>
          </Reveal>

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade">
                <div className="flex flex-wrap items-center gap-3">
                  <EyebrowPill>{study.index}</EyebrowPill>
                  <Pill icon="building">{study.sector}</Pill>
                </div>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display ax-text-balance mt-7 max-w-[20ch] text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1.04]">
                  <CaseStudyText study={study} field="title" />
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[36rem] text-[15.5px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  <CaseStudyText study={study} field="summary" />
                </p>
              </Reveal>

              <Reveal trigger="load" delay={0.22}>
                <div className="mt-9 flex flex-wrap items-center gap-3.5">
                  <Button href="/contact" size="lg" icon="arrow-right">
                    <Text id="casestudy.hero.primary" />
                  </Button>
                  {product && (
                    <Button
                      href={`/products/${product.slug}`}
                      size="lg"
                      variant="outline"
                      magnetic={false}
                    >
                      <TemplateText id="casestudy.hero.product" vars={{ name: product.name }} />
                    </Button>
                  )}
                </div>
              </Reveal>

              {/* Figures with vertical rules, as printed under the reference-4 hero */}
              <Reveal trigger="load" delay={0.3}>
                <CaseStudyMetrics study={study} variant="hero" />
              </Reveal>
            </div>

            {/* Outcome callouts over the environment */}
            <div className="relative hidden min-h-[380px] lg:block">
              <TextFloatingCard
                icon="trending"
                title={study.metrics[0]?.label}
                titleId="casestudy.hero.card1"
                body={study.metrics[0]?.value}
                delay={0.3}
                className="absolute left-0 top-4"
              />
              <TextFloatingCard
                icon="settings"
                titleId="casestudy.hero.card2"
                body={
                  study.timeline[0]
                    ? `${study.timeline[0].phase} · ${study.timeline[0].duration}`
                    : undefined
                }
                delay={0.42}
                className="absolute left-24 top-[150px]"
              />
              <TextFloatingCard
                icon="users"
                titleId="casestudy.hero.card3"
                {...(product
                  ? { bodyId: "casestudy.hero.card3body", vars: { name: product.name } }
                  : { body: study.sector })}
                delay={0.54}
                className="absolute right-0 top-[280px]"
              />
            </div>
          </div>
        </div>
      </section>

      <BlockSlot page="case-study" slot="after-hero" />

      {/* ============ Challenge / approach ============ */}
      <Section className="pt-6">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal direction="right">
            <div className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
              <Eyebrow withRule>
                <Text id="casestudy.challenge.eyebrow" />
              </Eyebrow>
              <h2 className="ax-display ax-text-balance text-[clamp(1.8rem,3.4vw,2.6rem)]">
                <Text id="casestudy.challenge.title" />{" "}
                <span className="ax-gradient-text">
                  <Text id="casestudy.challenge.accent" />
                </span>
              </h2>
              <p className="ax-text-pretty text-[15px] leading-relaxed text-[var(--ax-ink-muted)]">
                {study.challenge}
              </p>

              <div className="pt-4">
                <MockScreen
                  seed={study.id}
                  accent={accent}
                  label={study.sector}
                  variant="insights"
                />
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Eyebrow withRule>
              <Text id="casestudy.approach.eyebrow" />
            </Eyebrow>

            <RevealGroup className="flex flex-col gap-3" stagger={0.1}>
              {study.approach.map((step, i) => (
                <RevealItem key={step} direction="left">
                  <div className="ax-glass ax-edge-light flex items-start gap-5 rounded-2xl p-6 md:p-7">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.10)] font-mono text-[12px] font-semibold text-[var(--ax-accent-soft)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="ax-text-pretty text-[14.5px] leading-relaxed text-[var(--ax-ink)]">
                      {step}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Timeline */}
            <Reveal delay={0.15}>
              <div className="ax-glass-strong ax-edge-light mt-6 flex flex-col gap-5 rounded-2xl p-7">
                <span className="ax-eyebrow">
                  <Text id="casestudy.timeline.label" />
                </span>
                <Hairline />
                <div className="flex flex-col gap-4">
                  {study.timeline.map((phase, i) => (
                    <div key={phase.phase} className="flex items-center gap-4">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[var(--ax-line)] font-mono text-[10px] text-[var(--ax-ink-dim)]">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-[13.5px] text-[var(--ax-ink-muted)]">
                        {phase.phase}
                      </span>
                      <span className="font-mono text-[11.5px] text-[var(--ax-accent-soft)]">
                        {phase.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ============ Testimonial ============ */}
      <Section className="ax-halo relative isolate overflow-hidden py-16 md:py-24">
        <AmbientField background="dark-hero-04" />

        <Reveal direction="scale">
          <figure className="ax-glass-strong ax-edge-light mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-[28px] px-8 py-14 text-center md:px-16">
            <span className="grid size-12 place-items-center rounded-full border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.12)] text-[var(--ax-accent-soft)]">
              <Icon name="message" className="size-5" strokeWidth={1.7} />
            </span>

            <blockquote className="ax-display ax-text-balance text-[clamp(1.3rem,2.8vw,2.1rem)] leading-snug text-[var(--ax-ink)]">
              &ldquo;{study.testimonial.quote}&rdquo;
            </blockquote>

            <figcaption className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[var(--ax-ink)]">
                {study.testimonial.author}
              </span>
              <span className="text-[12.5px] text-[var(--ax-ink-dim)]">
                {study.testimonial.role}
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </Section>

      {/* ============ Platform behind it ============ */}
      {product && (
        <Section className="pt-0">
          <SectionHeading
            eyebrow={<Text id="casestudy.platform.eyebrow" />}
            title={<Text id="casestudy.platform.title" />}
            accent={<Text id="casestudy.platform.accent" />}
            action={
              <Button
                href={`/products/${product.slug}`}
                variant="secondary"
                icon="arrow-right"
              >
                <TemplateText id="casestudy.platform.button" vars={{ name: product.name }} />
              </Button>
            }
          />

          <Reveal className="mt-12">
            <div className="ax-glass ax-edge-light grid gap-8 rounded-[24px] p-8 md:grid-cols-[1fr_1.1fr] md:gap-12 md:p-11">
              <div className="flex flex-col gap-5">
                <span
                  className="grid size-12 place-items-center rounded-xl border border-[var(--ax-line)]"
                  style={{
                    background: `linear-gradient(140deg, ${accent}33, transparent 70%)`,
                  }}
                >
                  <Icon
                    name={product.icon}
                    className="size-[22px]"
                    strokeWidth={1.7}
                    style={{ color: accent }}
                  />
                </span>
                <h3 className="ax-display text-[clamp(1.4rem,2.6vw,2rem)]">
                  {product.name}
                </h3>
                <p className="ax-text-pretty text-[14.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                  {product.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.stack.slice(0, 6).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-[rgba(var(--ax-glow),0.10)] px-2 py-1 font-mono text-[10.5px] text-[var(--ax-ink-dim)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <ProductVisual product={product} className="self-center" />
            </div>
          </Reveal>
        </Section>
      )}

      {/* ============ Next case study ============ */}
      {next.slug !== study.slug && (
        <Section className="pt-0">
          <Hairline className="mb-12" />
          <Reveal>
            <Link
              href={`/our-work/${next.slug}`}
              className="ax-focus group flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-12"
            >
              <div className="flex flex-col gap-3">
                <span className="ax-eyebrow">
                  <Text id="casestudy.next.label" />
                </span>
                <h3 className="ax-display ax-text-balance max-w-2xl text-[clamp(1.5rem,3vw,2.4rem)] transition-colors duration-300 group-hover:text-[var(--ax-accent-soft)]">
                  {next.title}
                </h3>
              </div>
              <span className="grid size-14 shrink-0 place-items-center rounded-full border border-[var(--ax-line-strong)] text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:translate-x-2">
                <Icon name="arrow-right" className="size-6" strokeWidth={1.8} />
              </span>
            </Link>
          </Reveal>
        </Section>
      )}

      <BlockSlot page="case-study" slot="before-cta" />

      <CTASection
        eyebrow={<Text id="casestudy.cta.eyebrow" />}
        title={<Text id="casestudy.cta.title" />}
        accent={<Text id="casestudy.cta.accent" />}
        primaryLabel={<Text id="casestudy.cta.primary" />}
        secondaryLabel={<Text id="casestudy.cta.secondary" />}
        secondaryHref="/our-work"
      />
    </>
  );
}
