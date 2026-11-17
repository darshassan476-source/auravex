"use client";

import Link from "next/link";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useCms, useText } from "@/cms/CmsProvider";
import { useProduct } from "@/cms/useProduct";
import { demoUrl } from "@/components/cards/ProductCard";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { Reveal } from "@/components/fx/Reveal";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { BrowserFrame } from "@/components/showcase/BrowserFrame";
import { ProductAura, partnerHue } from "@/components/showcase/ProductAura";
import { productScreens } from "@/components/showcase/ProductShowcase";
import { ProductVisual } from "@/components/showcase/ProductVisual";
import { Button } from "@/components/ui/Button";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Primitives";
import { DEPLOYMENT_LABELS, categoryLabel } from "@/data/products";
import { DEPLOYMENT_STATUS_LABELS, PRICE_LINES } from "@/lib/enterprise";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A product page in the fixed seventeen-part order: identity and actions,
 * overview, problems, capabilities, modules, AI, workflows, deployment,
 * integrations, industries, optional modules, verified customers,
 * customisation, commercial information and "Customize Your Solution".
 * Sections with nothing in them are left out rather than padded.
 */
export function ProductDetail({ product: source }: { product: Product }) {
  const product = useProduct(source);
  const { state } = useCms();
  const demo = demoUrl(product);

  const customers = state.publicCustomers.filter((c) => c.productSlug === product.slug);
  const figures = state.publicAdoption.filter((f) => f.productSlug === product.slug);
  const pricing = state.publicPricing.find((p) => p.productSlug === product.slug);
  const previewImages = (product.preview?.imageIds ?? [])
    .map((id) => state.media.find((m) => m.id === id)?.src)
    .filter((s): s is string => Boolean(s));

  const t = {
    back: useText("ex.product.back"),
    overview: useText("ex.product.overview"),
    problems: useText("ex.product.problems"),
    capabilities: useText("ex.product.capabilities"),
    modules: useText("ex.product.modules"),
    ai: useText("ex.product.ai"),
    workflows: useText("ex.product.workflows"),
    deployment: useText("ex.product.deployment"),
    integrations: useText("ex.product.integrations"),
    industries: useText("ex.product.industries"),
    optional: useText("ex.product.optional"),
    customers: useText("ex.product.customers"),
    customization: useText("ex.product.customization"),
    demo: useText("ex.product.demo"),
    consult: useText("ex.product.consult"),
    noDemo: useText("ex.product.noDemo"),
    requestDemo: useText("ex.product.requestDemo"),
    pricingTitle: useText("ex.product.pricing.title"),
    pricingBody: useText("ex.product.pricing.body"),
    pricingButton: useText("ex.product.pricing.button"),
    devLabel: useText("ex.product.dev.label"),
    devBody: useText("ex.product.dev.body"),
    upcomingLabel: useText("ex.product.upcoming.label"),
    unavailableLabel: useText("ex.product.unavailable.label"),
    unavailableBody: useText("ex.product.unavailable.body"),
    previewRequest: useText("ex.product.preview.request"),
    previewView: useText("ex.product.preview.view"),
    previewRelease: useText("ex.product.preview.release"),
    adoption: useText("ex.product.adoption"),
    cfgTitle: useText("ex.cfg.title"),
    cfgBody: useText("ex.cfg.body"),
  };

  const notReady = product.status === "development" || product.status === "upcoming" || product.status === "preview";
  const previewLink = product.preview?.public && product.preview.url ? product.preview.url : undefined;

  const partner = partnerHue(product.slug, product.accent);
  const screens = productScreens(product);
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  return (
    <AccentContext.Provider value={{ accent: product.accent, partner }}>
      {/* 1–3. Name, category, headline — and the two primary actions */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="product-detail" background="dark-hero-02" />
        <ProductAura slug={product.slug} accent={product.accent} intensity={0.55} />
        <div className="ax-container relative pb-14 pt-[122px] md:pb-16 md:pt-[146px]">
          <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-[12.5px] text-[var(--ax-ink-dim)]">
            <Link href="/products" className="ax-focus inline-flex items-center gap-1.5 hover:text-[var(--ax-ink-muted)]">
              <Icon name="arrow-left" className="size-3.5" strokeWidth={2.2} />
              {t.back}
            </Link>
            <Icon name="chevron-right" className="size-3.5" strokeWidth={2.2} />
            <span className="text-[var(--ax-ink-muted)]">{product.name}</span>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
            <div className="flex flex-col items-start">
              <Reveal trigger="load" direction="fade">
                <div className="flex flex-wrap items-center gap-3">
                  <EyebrowPill>{product.sector || categoryLabel(product.category)}</EyebrowPill>
                  {product.status !== "available" && <StatusBadge status={product.status} />}
                </div>
              </Reveal>
              <Reveal trigger="load" delay={0.06}>
                <h1 className="ax-display mt-6 text-[clamp(2.5rem,5vw,4.2rem)] leading-[1.02]">{product.name}</h1>
              </Reveal>
              <Reveal trigger="load" delay={0.1}>
                <p className="ax-text-balance mt-4 text-[clamp(1.15rem,1.8vw,1.45rem)] font-medium leading-snug text-[var(--ax-ink)]">
                  {product.tagline}
                </p>
              </Reveal>
              <Reveal trigger="load" delay={0.14}>
                <p className="ax-text-pretty mt-5 max-w-[36rem] text-[15.5px] leading-[1.75] text-[var(--ax-ink-muted)]">
                  {product.summary}
                </p>
              </Reveal>

              {notReady && (
                <Reveal trigger="load" delay={0.18}>
                  <div className="mt-7 max-w-[36rem] rounded-2xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/8 p-5">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--ax-warning)]">
                      {product.status === "upcoming" ? t.upcomingLabel : t.devLabel}
                    </p>
                    <p className="ax-text-pretty mt-2 text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
                      {product.preview?.description || t.devBody}
                    </p>
                    {product.preview?.expectedRelease && (
                      <p className="mt-2 text-[13px] text-[var(--ax-ink)]">
                        {t.previewRelease}: {product.preview.expectedRelease}
                      </p>
                    )}
                  </div>
                </Reveal>
              )}
              {product.status === "unavailable" && (
                <p className="mt-7 max-w-[36rem] rounded-2xl border border-[var(--ax-line-strong)] p-5 text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
                  <strong className="mb-1 block text-[var(--ax-ink)]">{t.unavailableLabel}</strong>
                  {t.unavailableBody}
                </p>
              )}

              <Reveal trigger="load" delay={0.22}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {demo && (
                    <Button href={demo} external size="lg" icon="external-link">
                      {t.demo}
                    </Button>
                  )}
                  {notReady &&
                    (previewLink ? (
                      <Button href={previewLink} external size="lg" icon="external-link">
                        {t.previewView}
                      </Button>
                    ) : (
                      <Button href="#configure" size="lg" icon="arrow-right">
                        {t.previewRequest}
                      </Button>
                    ))}
                  <Button href="#configure" size="lg" variant="outline" magnetic={false}>
                    {t.consult}
                  </Button>
                </div>
                {demo && product.demoNote && (
                  <p className="mt-3 max-w-[36rem] text-[12.5px] text-[var(--ax-ink-dim)]">{product.demoNote}</p>
                )}
                {!demo && !notReady && <p className="mt-3 text-[12.5px] text-[var(--ax-ink-dim)]">{t.noDemo}</p>}
              </Reveal>
            </div>

            <Reveal trigger="load" direction="left" delay={0.12}>
              <ProductVisual product={product} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* The product itself, screen by screen */}
      {screens.length > 0 && <ScreenTour screens={screens} address={product.name} name={product.name} />}

      {/* 4. Overview (with verified adoption figures, when there are any) */}
      <Block title={t.overview} n={next()}>
        <p className="ax-text-pretty max-w-4xl text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.75] text-[var(--ax-ink)] opacity-85">{product.description}</p>
        {figures.length > 0 && (
          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={t.adoption}>
            {figures.map((f) => (
              <div key={f.id} className="rounded-2xl border border-[var(--ax-line)] p-5">
                <dd className="text-[30px] font-semibold tabular-nums text-[var(--ax-ink)]">
                  {f.value.toLocaleString("en-US")}
                  {f.suffix}
                </dd>
                <dt className="mt-1 text-[13px] text-[var(--ax-ink-muted)]">{f.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </Block>

      {/* 5. Business problems */}
      {product.problems?.length ? <ListBlock title={t.problems} items={product.problems} icon="target" n={next()} /> : null}

      {/* 6. Main capabilities */}
      {product.features.length > 0 && (
        <Block title={t.capabilities} n={next()}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {product.features.map((f, i) => (
              <div
                key={f.title}
                className={cn(
                  "group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--ax-line-strong)]",
                  i === 0 && "md:col-span-2 xl:row-span-2 xl:justify-end",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute rounded-full blur-[60px] transition-opacity duration-500",
                    i === 0 ? "-right-10 -top-10 size-72 opacity-40" : "-right-12 -top-12 size-40 opacity-0 group-hover:opacity-40",
                  )}
                  style={{ background: i % 2 ? partner : product.accent }}
                />
                {i === 0 && screens.length > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(screens[1] ?? screens[0]).src}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="pointer-events-none relative -mx-7 -mt-7 mb-2 block w-[calc(100%+3.5rem)] max-w-none object-cover object-top opacity-90 transition-transform duration-700 group-hover:scale-[1.02] xl:max-h-[260px]"
                    style={{
                      maskImage: "linear-gradient(180deg, black 45%, transparent)",
                      WebkitMaskImage: "linear-gradient(180deg, black 45%, transparent)",
                    }}
                  />
                )}
                <span
                  className={cn("relative grid place-items-center rounded-2xl text-white", i === 0 ? "size-14" : "size-11")}
                  style={{
                    background: `linear-gradient(140deg, ${product.accent}, ${partner})`,
                    boxShadow: `0 12px 30px -12px ${product.accent}`,
                  }}
                >
                  <Icon name={f.icon} className={i === 0 ? "size-6" : "size-5"} strokeWidth={1.9} />
                </span>
                <h3
                  className={cn(
                    "relative font-semibold tracking-[-0.01em] text-[var(--ax-ink)]",
                    i === 0 ? "mt-2 text-[clamp(1.4rem,2.2vw,1.9rem)]" : "text-[17px]",
                  )}
                >
                  {f.title}
                </h3>
                <p
                  className={cn(
                    "ax-text-pretty relative leading-relaxed text-[var(--ax-ink-muted)]",
                    i === 0 ? "max-w-xl text-[15.5px]" : "text-[13.5px]",
                  )}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* 7. Available modules */}
      {product.modules?.length ? <ModuleBlock title={t.modules} modules={product.modules} n={next()} /> : null}

      {/* 8. AI capabilities */}
      {product.aiCapabilities?.length ? <AIBlock title={t.ai} items={product.aiCapabilities} slug={product.slug} n={next()} /> : null}

      {/* 9–12. Workflows, deployment, integrations, industries */}
      <Block>
        <div className="grid gap-4 md:grid-cols-2">
          <Column title={t.workflows} items={product.workflows} icon="workflow" />
          <Column title={t.deployment} items={product.deployment?.map((d) => DEPLOYMENT_LABELS[d])} icon="cloud" />
          <Column title={t.integrations} items={product.integrations} icon="link" />
          <Column title={t.industries} items={product.industries} icon="building" />
        </div>
      </Block>

      {/* 13. Optional additional modules */}
      {product.optionalModules?.length || product.aiEnhancements?.length ? (
        <ModuleBlock
          title={t.optional}
          modules={[...(product.optionalModules ?? []), ...(product.aiEnhancements ?? [])]}
          n={next()}
        />
      ) : null}

      {/* 14. Verified customer deployments only */}
      {customers.length > 0 && (
        <Block title={t.customers}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((c) => {
              const logo = c.logoId ? state.media.find((m) => m.id === c.logoId)?.src : undefined;
              return (
                <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--ax-line)] p-6">
                  <div className="flex items-center gap-3">
                    {logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={`${c.name} logo`} className="h-9 w-auto max-w-[120px] object-contain" />
                    )}
                    <p className="text-[16px] font-semibold text-[var(--ax-ink)]">{c.name}</p>
                  </div>
                  <p className="text-[13px] text-[var(--ax-ink-muted)]">
                    {[c.country, c.industry].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-[12.5px] font-medium text-[var(--ax-accent-soft)]">
                    {DEPLOYMENT_STATUS_LABELS[c.status]}
                    {c.deploymentDate ? ` · ${c.deploymentDate}` : ""}
                  </p>
                  {c.description && <p className="text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">{c.description}</p>}
                  {c.modules && <p className="text-[12.5px] text-[var(--ax-ink-dim)]">Modules: {c.modules.join(", ")}</p>}
                </div>
              );
            })}
          </div>
        </Block>
      )}

      {/* 15. Customisation options */}
      {product.customization?.length ? <ListBlock title={t.customization} items={product.customization} icon="settings" n={next()} /> : null}

      {previewImages.length > 0 && notReady && (
        <Block title={t.previewView}>
          <div className="grid gap-4 md:grid-cols-2">
            {previewImages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={`${product.name} preview ${i + 1}`} className="rounded-2xl border border-[var(--ax-line)]" />
            ))}
          </div>
        </Block>
      )}

      {/* Commercial information */}
      <Block>
        <div className="flex flex-col gap-6 rounded-2xl border border-[var(--ax-line-strong)] bg-[var(--ax-bg-elevated)] p-7 md:flex-row md:items-center md:justify-between md:p-9">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-ink-dim)]">{t.pricingTitle}</p>
            <p className="mt-2 text-[19px] font-semibold text-[var(--ax-ink)]">{t.pricingBody}</p>
            {pricing && (
              <dl className="mt-5 grid gap-x-8 gap-y-2 text-[13.5px] sm:grid-cols-2">
                {PRICE_LINES.filter((l) => pricing.lines[l.key]?.trim()).map((l) => (
                  <div key={l.key} className="flex justify-between gap-4 border-b border-[var(--ax-line)] py-1.5">
                    <dt className="text-[var(--ax-ink-muted)]">{l.label}</dt>
                    <dd className="text-right text-[var(--ax-ink)]">
                      {pricing.currency} {pricing.lines[l.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <Button href={`/contact?product=${product.slug}&proposal=1`} size="lg" icon="arrow-right" className="shrink-0">
            {t.pricingButton}
          </Button>
        </div>
      </Block>

      {/* 16. Customize Your Solution / Request a consultation */}
      <section id="configure" className="scroll-mt-24 py-14 md:py-20">
        <div className="ax-container">
          <h2 className="ax-display text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.08]">{t.cfgTitle}</h2>
          <p className="ax-text-pretty mt-4 max-w-3xl text-[15px] leading-relaxed text-[var(--ax-ink-muted)]">{t.cfgBody}</p>
          <div className="mt-10">
            <EnquiryForm fixedProduct={product} />
          </div>
        </div>
      </section>

      {/* 17. Quick Demo */}
      {demo && (
        <section className="pb-20">
          <div className="ax-container">
            <div
              className="relative flex flex-col items-start gap-5 overflow-hidden rounded-3xl border border-white/10 p-8 md:flex-row md:items-center md:justify-between md:p-12"
              style={{
                background: `linear-gradient(120deg, ${product.accent}33, transparent 60%), linear-gradient(300deg, ${partner}26, transparent 60%), var(--ax-bg-elevated)`,
              }}
            >
              <div>
                <p className="text-[clamp(1.4rem,2.4vw,2rem)] font-semibold tracking-[-0.02em] text-[var(--ax-ink)]">
                  {t.demo}: {product.name}
                </p>
                {product.demoNote && <p className="mt-1.5 text-[13.5px] text-[var(--ax-ink-muted)]">{product.demoNote}</p>}
              </div>
              <Button href={demo} external icon="external-link">
                {t.demo}
              </Button>
            </div>
          </div>
        </section>
      )}
    </AccentContext.Provider>
  );
}

const AccentContext = createContext({ accent: "#6366f1", partner: "#22d3ee" });

function Block({ title, n, children, className }: { title?: string; n?: string; children: ReactNode; className?: string }) {
  const { accent } = useContext(AccentContext);
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="ax-container">
        {title && (
          <div className="mb-9 flex items-baseline gap-4">
            {n && (
              <span className="font-mono text-[13px] font-semibold tracking-[0.1em]" style={{ color: accent }}>
                {n}
              </span>
            )}
            <h2 className="ax-display text-[clamp(1.8rem,3.2vw,2.7rem)] leading-[1.08]">{title}</h2>
            <span
              aria-hidden
              className="ml-2 hidden h-px flex-1 self-center sm:block"
              style={{ background: `linear-gradient(90deg, ${accent}55, transparent)` }}
            />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function ListBlock({ title, items, icon, n }: { title: string; items?: string[]; icon: string; n?: string }) {
  const { accent } = useContext(AccentContext);
  if (!items?.length) return null;
  return (
    <Block title={title} n={n}>
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-4 rounded-2xl border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-5 text-[14.5px] leading-relaxed text-[var(--ax-ink-muted)] transition-colors hover:border-[var(--ax-line-strong)]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: `${accent}1f`, color: accent }}>
              <Icon name={icon} className="size-4" strokeWidth={2} />
            </span>
            <span className="pt-1">{item}</span>
          </li>
        ))}
      </ul>
    </Block>
  );
}

function ModuleBlock({
  title,
  modules,
  n,
}: {
  title: string;
  modules?: { id: string; name: string; description: string }[];
  n?: string;
}) {
  const { accent, partner } = useContext(AccentContext);
  if (!modules?.length) return null;
  return (
    <Block title={title} n={n}>
      <div className="grid gap-px overflow-hidden rounded-3xl border border-[var(--ax-line)] bg-[var(--ax-line)] sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m, i) => (
          <div
            key={m.id + m.name}
            className="group relative bg-[var(--ax-bg-elevated)] p-6 transition-colors duration-300 hover:bg-[var(--ax-bg)]"
          >
            <span
              aria-hidden
              className="absolute inset-y-6 left-0 w-[2px] origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
              style={{ background: `linear-gradient(${accent}, ${partner})` }}
            />
            <span className="font-mono text-[11.5px] font-semibold" style={{ color: accent }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-2 text-[16px] font-semibold text-[var(--ax-ink)]">{m.name}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">{m.description}</p>
          </div>
        ))}
      </div>
    </Block>
  );
}

function AIBlock({ title, items, slug, n }: { title: string; items: string[]; slug: string; n?: string }) {
  const { accent } = useContext(AccentContext);
  return (
    <section className="py-12 md:py-16">
      <div className="ax-container">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#060914] p-7 md:p-14">
          <ProductAura slug={slug} accent={accent} intensity={0.9} className="-z-10" />
          <div className="flex items-baseline gap-4">
            {n && (
              <span className="font-mono text-[13px] font-semibold tracking-[0.1em]" style={{ color: accent }}>
                {n}
              </span>
            )}
            <h2 className="flex items-center gap-3 text-[clamp(1.8rem,3.2vw,2.7rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-white">
              <Icon name="sparkles" className="size-7 shrink-0" strokeWidth={1.8} style={{ color: accent }} />
              {title}
            </h2>
          </div>
          <ul className="mt-10 grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <li
                key={item}
                className="flex gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-[14.5px] leading-relaxed text-white/80 backdrop-blur"
              >
                <Icon name="check-circle" className="mt-0.5 size-5 shrink-0" strokeWidth={2} style={{ color: accent }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Column({ title, items, icon }: { title: string; items?: string[]; icon: string }) {
  const { accent } = useContext(AccentContext);
  if (!items?.length) return null;
  return (
    <div className="rounded-3xl border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-7">
      <h2 className="mb-5 flex items-center gap-3 text-[19px] font-semibold text-[var(--ax-ink)]">
        <span className="grid size-9 place-items-center rounded-xl" style={{ background: `${accent}1f`, color: accent }}>
          <Icon name={icon} className="size-[18px]" strokeWidth={2} />
        </span>
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
            <Icon name="check" className="mt-1 size-3.5 shrink-0" strokeWidth={2.6} style={{ color: accent }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The product's real screens, large, with their captions as tabs. */
function ScreenTour({
  screens,
  address,
  name,
}: {
  screens: { src: string; alt: string }[];
  address?: string;
  name: string;
}) {
  const { accent, partner } = useContext(AccentContext);
  const [i, setI] = useState(0);
  const current = screens[Math.min(i, screens.length - 1)];
  const caption = (alt: string) => alt.replace(`${name} — `, "");
  return (
    <section className="relative overflow-x-clip py-12 md:py-20">
      <div className="ax-container">
        {screens.length > 1 && (
          <div role="tablist" aria-label={`${name} screens`} className="mb-8 flex flex-wrap justify-center gap-2">
            {screens.map((s, k) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={k === i}
                onClick={() => setI(k)}
                className="ax-focus rounded-full border px-4 py-2 text-[13px] font-medium transition-all"
                style={
                  k === i
                    ? { borderColor: "transparent", color: "#fff", background: `linear-gradient(110deg, ${accent}, ${partner})` }
                    : { borderColor: "var(--ax-line-strong)", color: "var(--ax-ink-muted)" }
                }
              >
                {caption(s.alt)}
              </button>
            ))}
          </div>
        )}
        <div className="relative mx-auto max-w-6xl">
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -bottom-10 top-10 -z-10 rounded-full opacity-40 blur-[90px]"
            style={{ background: `linear-gradient(90deg, ${accent}, ${partner})` }}
          />
          <BrowserFrame address={address} accent={accent}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.src}
              src={current.src}
              alt={current.alt}
              className="block w-full"
              style={{ animation: "ax-pop 0.5s ease both" }}
            />
          </BrowserFrame>
          {screens.length === 1 && (
            <p className="mt-5 text-center text-[13px] text-[var(--ax-ink-dim)]">{caption(current.alt)}</p>
          )}
        </div>
      </div>
    </section>
  );
}
