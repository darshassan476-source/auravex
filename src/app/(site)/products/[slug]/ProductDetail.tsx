"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCms, useText } from "@/cms/CmsProvider";
import { useProduct } from "@/cms/useProduct";
import { demoUrl } from "@/components/cards/ProductCard";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { Reveal } from "@/components/fx/Reveal";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
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

  return (
    <>
      {/* 1–3. Name, category, headline — and the two primary actions */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="product-detail" background="dark-hero-02" />
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

      {/* 4. Overview (with verified adoption figures, when there are any) */}
      <Block title={t.overview}>
        <p className="ax-text-pretty max-w-3xl text-[16px] leading-[1.8] text-[var(--ax-ink-muted)]">{product.description}</p>
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
      <ListBlock title={t.problems} items={product.problems} icon="target" />

      {/* 6. Main capabilities */}
      {product.features.length > 0 && (
        <Block title={t.capabilities}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {product.features.map((f) => (
              <div key={f.title} className="ax-glass flex flex-col gap-3 rounded-2xl p-6">
                <span className="grid size-10 place-items-center rounded-xl" style={{ background: `${product.accent}1f`, color: product.accent }}>
                  <Icon name={f.icon} className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className="text-[16.5px] font-semibold text-[var(--ax-ink)]">{f.title}</h3>
                <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">{f.description}</p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* 7. Available modules */}
      <ModuleBlock title={t.modules} modules={product.modules} />

      {/* 8. AI capabilities */}
      <ListBlock title={t.ai} items={product.aiCapabilities} icon="sparkles" />

      {/* 9–12. Workflows, deployment, integrations, industries */}
      <Block>
        <div className="grid gap-10 lg:grid-cols-2">
          <Column title={t.workflows} items={product.workflows} />
          <Column title={t.deployment} items={product.deployment?.map((d) => DEPLOYMENT_LABELS[d])} />
          <Column title={t.integrations} items={product.integrations} />
          <Column title={t.industries} items={product.industries} />
        </div>
      </Block>

      {/* 13. Optional additional modules */}
      <ModuleBlock title={t.optional} modules={[...(product.optionalModules ?? []), ...(product.aiEnhancements ?? [])]} />

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
      <ListBlock title={t.customization} items={product.customization} icon="settings" />

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
            <div className="flex flex-col items-start gap-5 rounded-2xl border border-[var(--ax-line)] p-7 md:flex-row md:items-center md:justify-between md:p-9">
              <div>
                <p className="text-[18px] font-semibold text-[var(--ax-ink)]">
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
    </>
  );
}

function Block({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("py-10 md:py-12", className)}>
      <div className="ax-container">
        {title && <h2 className="mb-7 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-[-0.015em] text-[var(--ax-ink)]">{title}</h2>}
        {children}
      </div>
    </section>
  );
}

function ListBlock({ title, items, icon }: { title: string; items?: string[]; icon: string }) {
  if (!items?.length) return null;
  return (
    <Block title={title}>
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 rounded-xl border border-[var(--ax-line)] p-4 text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
            <Icon name={icon} className="mt-0.5 size-4 shrink-0 text-[var(--ax-accent-soft)]" strokeWidth={2} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Block>
  );
}

function ModuleBlock({ title, modules }: { title: string; modules?: { id: string; name: string; description: string }[] }) {
  if (!modules?.length) return null;
  return (
    <Block title={title}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <div key={m.id + m.name} className="rounded-xl border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-5">
            <p className="text-[15px] font-semibold text-[var(--ax-ink)]">{m.name}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ax-ink-muted)]">{m.description}</p>
          </div>
        ))}
      </div>
    </Block>
  );
}

function Column({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="mb-4 text-[19px] font-semibold text-[var(--ax-ink)]">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
            <Icon name="check" className="mt-1 size-3.5 shrink-0 text-[var(--ax-success)]" strokeWidth={2.4} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
