"use client";

import Link from "next/link";
import { useText } from "@/cms/CmsProvider";
import { useProduct } from "@/cms/useProduct";
import { demoUrl } from "@/components/cards/ProductCard";
import { Reveal } from "@/components/fx/Reveal";
import { partnerHue } from "@/components/showcase/ProductAura";
import { ProductShowcase } from "@/components/showcase/ProductShowcase";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Primitives";
import { categoryLabel } from "@/data/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * One product, given the whole width of the page: its number, name and
 * promise on one side, the product itself — in its own colours — on the
 * other. Consecutive stages swap sides.
 */
export function ProductStage({ product: source, index }: { product: Product; index: number }) {
  const product = useProduct(source);
  const demo = demoUrl(product);
  const explore = useText("ex.card.explore");
  const demoLabel = useText("ex.card.demo");
  const flip = index % 2 === 1;
  const partner = partnerHue(product.slug, product.accent);
  const modules = (product.modules ?? []).slice(0, 5);

  return (
    <article className="relative isolate overflow-hidden py-16 md:py-24">
      {/* The product's colour washing across its own band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(60% 70% at ${flip ? "20%" : "80%"} 50%, ${product.accent}0f, transparent 70%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${product.accent}33, transparent)` }}
      />

      <div className="ax-container">
        <div
          className={cn(
            "grid items-center gap-10 lg:gap-16",
            flip ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
          )}
        >
          <Reveal direction={flip ? "left" : "right"} className={cn("relative", flip && "lg:order-2")}>
            <span
              aria-hidden
              className="pointer-events-none absolute -top-14 left-0 select-none text-[clamp(6rem,14vw,11rem)] font-bold leading-none tracking-[-0.06em] opacity-[0.07]"
              style={{ color: product.accent }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="relative flex flex-wrap items-center gap-3">
              <span
                className="grid size-11 place-items-center rounded-2xl"
                style={{
                  background: `linear-gradient(140deg, ${product.accent}, ${partner})`,
                  boxShadow: `0 12px 30px -10px ${product.accent}`,
                }}
              >
                <Icon name={product.icon} className="size-5 text-white" strokeWidth={2} />
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: product.accent }}>
                {product.sector || categoryLabel(product.category)}
              </span>
              {product.status !== "available" && <StatusBadge status={product.status} />}
            </div>

            <h2 className="ax-display relative mt-6 text-[clamp(2.3rem,4.6vw,3.9rem)] leading-[1.02]">
              <Link href={`/products/${product.slug}`} className="ax-focus hover:opacity-90">
                {product.name}
              </Link>
            </h2>
            <p
              className="ax-text-balance relative mt-4 bg-clip-text text-[clamp(1.1rem,1.7vw,1.35rem)] font-medium leading-snug text-transparent"
              style={{ backgroundImage: `linear-gradient(95deg, var(--ax-ink), ${product.accent} 70%, ${partner})` }}
            >
              {product.tagline}
            </p>
            <p className="ax-text-pretty relative mt-5 max-w-[34rem] text-[15px] leading-[1.75] text-[var(--ax-ink-muted)]">
              {product.summary}
            </p>

            {modules.length > 0 && (
              <ul className="relative mt-7 flex max-w-[36rem] flex-wrap gap-2">
                {modules.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-full border px-3 py-1.5 text-[12.5px] text-[var(--ax-ink)]"
                    style={{ borderColor: `${product.accent}44`, background: `${product.accent}12` }}
                  >
                    {m.name}
                  </li>
                ))}
              </ul>
            )}

            <div className="relative mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={`/products/${product.slug}`}
                className="ax-focus group inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold text-white transition-shadow"
                style={{
                  background: `linear-gradient(110deg, ${product.accent}, ${partner})`,
                  boxShadow: `0 14px 40px -14px ${product.accent}`,
                }}
              >
                {explore}
                <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
              </Link>
              {demo && (
                <a
                  href={demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ax-focus inline-flex h-12 items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-6 text-[14px] font-semibold text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.1)]"
                >
                  {demoLabel}
                  <Icon name="external-link" className="size-4" strokeWidth={2} />
                  <span className="sr-only">(opens {product.name} in a new tab)</span>
                </a>
              )}
            </div>
          </Reveal>

          <Reveal direction={flip ? "right" : "left"} delay={0.1} className={cn(flip && "lg:order-1")}>
            <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden className="block">
              <ProductShowcase product={product} />
            </Link>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
