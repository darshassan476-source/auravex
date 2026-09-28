import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { ProductVisual } from "@/components/showcase/ProductVisual";
import { ProductActions } from "./ProductActions";
import { ProductOverview } from "./ProductOverview";
import { BlockSlot } from "@/components/sections/BlockSlot";
import { CaseStudyMetrics } from "@/components/sections/CaseStudyMetrics";
import { ProductMetrics } from "@/components/sections/ProductMetrics";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  Eyebrow,
  Hairline,
  Section,
  SectionHeading,
  Tag,
} from "@/components/ui/Primitives";
import { CASE_STUDIES } from "@/data/caseStudies";
import { PRODUCTS, getProduct } from "@/data/products";
import { getCatalogue } from "@/server/cache";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug) ?? (await getCatalogue()).find((p) => p.slug === slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.summary,
    openGraph: {
      title: `${product.name} — ${product.tagline}`,
      description: product.summary,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Bundled products are known at build time; ones created in the portal come from the tagged cache.
  const product = getProduct(slug) ?? (await getCatalogue()).find((p) => p.slug === slug);
  if (!product) notFound();

  const related = PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.category === product.category,
  ).slice(0, 3);

  const fallbackRelated = PRODUCTS.filter((p) => p.slug !== product.slug && p.featured).slice(0, 3);
  const suggestions = related.length >= 2 ? related : fallbackRelated;

  const caseStudy = CASE_STUDIES.find((c) => c.productSlug === product.slug);

  return (
    <>
      {/* ============ Hero ============ */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="product-detail" background="dark-hero-02" />

        <div className="ax-container relative pb-14 pt-[122px] md:pb-16 md:pt-[146px]">
          {/* Breadcrumb */}
          <Reveal trigger="load" direction="fade" duration={0.6}>
            <nav className="mb-7 flex items-center gap-2 text-[12.5px] text-[var(--ax-ink-dim)]">
              <Link
                href="/products"
                className="ax-focus inline-flex items-center gap-1.5 transition-colors hover:text-[var(--ax-ink-muted)]"
              >
                <Icon name="arrow-left" className="size-3.5" strokeWidth={2.2} />
                Products
              </Link>
              <Icon name="chevron-right" className="size-3.5" strokeWidth={2.2} />
              <span className="text-[var(--ax-ink-muted)]">{product.name}</span>
            </nav>
          </Reveal>

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10">
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade">
                <EyebrowPill>{product.name}</EyebrowPill>
              </Reveal>

              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-7 max-w-[15ch] text-[clamp(2.4rem,4.8vw,4rem)] leading-[1.04]">
                  {product.tagline.split(" ").slice(0, -2).join(" ")}{" "}
                  <span className="ax-gradient-text">
                    {product.tagline.split(" ").slice(-2).join(" ")}
                  </span>
                </h1>
              </Reveal>

              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-6 max-w-[34rem] text-[15.5px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  {product.description}
                </p>
              </Reveal>

              <Reveal trigger="load" delay={0.22}>
                <ProductActions product={product} />
              </Reveal>

              {/* Capability strip drawn from the product's own features */}
              <Reveal trigger="load" delay={0.3}>
                <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-5">
                  {product.features.slice(0, 4).map((feature) => (
                    <div key={feature.title} className="flex items-center gap-2.5">
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-lg"
                        style={{
                          background: `linear-gradient(145deg, ${product.accent}3d, ${product.accent}0f)`,
                          boxShadow: `inset 0 0 0 1px ${product.accent}45`,
                        }}
                      >
                        <Icon
                          name={feature.icon}
                          className="size-4"
                          strokeWidth={1.9}
                          style={{ color: product.accent }}
                        />
                      </span>
                      <span className="max-w-[11ch] text-[12.5px] font-medium leading-tight text-[var(--ax-ink)]">
                        {feature.title}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Product surface */}
            <Reveal trigger="load" direction="left" delay={0.12}>
              <ProductVisual product={product} />
            </Reveal>
          </div>
        </div>
      </section>

      <ProductMetrics product={product} />

      <BlockSlot page="product-detail" slot="after-hero" />

      {/* ============ Overview (reference 3) ============ */}
      <ProductOverview product={product} />

      {/* ============ Architecture ============ */}
      <Section className="relative overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
            <Eyebrow withRule>Architecture</Eyebrow>
            <h2 className="ax-display ax-text-balance text-[clamp(1.9rem,3.8vw,3rem)]">
              Four layers, <span className="ax-gradient-text">one contract.</span>
            </h2>
            <p className="ax-text-pretty text-[15px] leading-relaxed text-[var(--ax-ink-muted)]">
              Each layer is independently deployable and independently replaceable. You are
              never locked into a vendor decision we made on your behalf.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <span className="ax-eyebrow">Stack</span>
              <div className="flex flex-wrap gap-2">
                {product.stack.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
            </div>
          </div>

          <RevealGroup className="flex flex-col gap-3" stagger={0.1}>
            {product.architecture.map((layer, i) => (
              <RevealItem key={layer.layer} direction="left">
                <div className="ax-glass ax-edge-light relative flex flex-col gap-3 rounded-2xl p-6 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="flex items-center gap-3 text-[16px] font-semibold text-[var(--ax-ink)]">
                      <span className="font-mono text-[11px] text-[var(--ax-accent-soft)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {layer.layer}
                    </h3>
                    <Icon
                      name="layers"
                      className="size-4 shrink-0 text-[var(--ax-ink-dim)]"
                      strokeWidth={1.8}
                    />
                  </div>

                  <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                    {layer.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {layer.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-[rgba(var(--ax-glow),0.10)] px-2 py-1 font-mono text-[10.5px] text-[var(--ax-ink-dim)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* ============ Timeline ============ */}
      <Section>
        <SectionHeading
          align="center"
          eyebrow="Delivery"
          title="From first call to"
          accent="measured impact."
        />

        <RevealGroup className="relative mt-16 grid gap-5 md:grid-cols-4" stagger={0.11}>
          <span
            aria-hidden
            className="absolute inset-x-8 top-[26px] hidden h-px bg-[linear-gradient(90deg,transparent,var(--ax-line-strong),var(--ax-line-strong),transparent)] md:block"
          />
          {product.timeline.map((phase, i) => (
            <RevealItem key={phase.phase}>
              <div className="relative flex flex-col items-center gap-4 text-center">
                <span className="relative grid size-[52px] place-items-center rounded-full border border-[var(--ax-line-strong)] bg-[var(--ax-bg)] font-mono text-[13px] font-semibold text-[var(--ax-accent-soft)]">
                  {String(i + 1).padStart(2, "0")}
                  <span className="absolute inset-0 rounded-full ring-1 ring-[rgba(var(--ax-glow),0.25)]" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[15px] font-semibold text-[var(--ax-ink)]">{phase.phase}</h3>
                  <span className="text-[12px] font-medium text-[var(--ax-accent-soft)]">
                    {phase.duration}
                  </span>
                  {phase.detail && (
                    <p className="text-[12.5px] leading-snug text-[var(--ax-ink-dim)]">
                      {phase.detail}
                    </p>
                  )}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* ============ Linked case study ============ */}
      {caseStudy && (
        <Section className="pt-0">
          <Reveal direction="scale">
            <Link
              href={`/our-work/${caseStudy.slug}`}
              className="ax-glass-strong ax-edge-light ax-focus group flex flex-col gap-7 rounded-[24px] p-8 transition-all duration-500 hover:border-[var(--ax-line-strong)] hover:ax-glow-md md:flex-row md:items-center md:gap-12 md:p-12"
            >
              <div className="flex flex-1 flex-col gap-4">
                <Eyebrow>{caseStudy.index}</Eyebrow>
                <h3 className="ax-display ax-text-balance text-[clamp(1.5rem,2.8vw,2.2rem)]">
                  {caseStudy.title}
                </h3>
                <p className="ax-text-pretty max-w-xl text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
                  {caseStudy.summary}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-8">
                <CaseStudyMetrics study={caseStudy} variant="cells" limit={2} />
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--ax-line-strong)] text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:translate-x-1">
                  <Icon name="arrow-right" className="size-5" strokeWidth={2} />
                </span>
              </div>
            </Link>
          </Reveal>
        </Section>
      )}

      {/* ============ Related ============ */}
      {suggestions.length > 0 && (
        <Section className="pt-0">
          <Hairline className="mb-14" />
          <SectionHeading
            eyebrow="Keep exploring"
            title="Often deployed"
            accent="alongside."
            action={
              <Button href="/products" variant="ghost" icon="arrow-right">
                All products
              </Button>
            }
          />

          <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {suggestions.map((item) => (
              <RevealItem key={item.id}>
                <ProductCard product={item} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      )}

      <BlockSlot page="product-detail" slot="before-cta" />

      <CTASection
        title={`See ${product.name} running on`}
        accent="your data."
        description="We will walk through the platform with your workflows in it — not a generic sandbox. Thirty minutes, no slide deck."
        secondaryLabel="Compare products"
        secondaryHref="/products"
      />
    </>
  );
}
