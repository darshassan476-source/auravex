"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useText } from "@/cms/CmsProvider";
import { demoUrl } from "@/components/cards/ProductCard";
import { partnerHue } from "@/components/showcase/ProductAura";
import { ProductShowcase } from "@/components/showcase/ProductShowcase";
import { Icon } from "@/components/ui/Icon";
import { categoryLabel } from "@/data/products";
import { cn } from "@/lib/utils";
import { useSolutions } from "./SolutionsGrid";

const DWELL_MS = 7000;

/**
 * The home page's solutions: every product named down one side, and the
 * chosen one on stage in its own colours. It moves on by itself until the
 * visitor takes over.
 */
export function SolutionsShowcase({ className }: { className?: string }) {
  const { active } = useSolutions();
  const [current, setCurrent] = useState(0);
  const [held, setHeld] = useState(false);
  const explore = useText("ex.card.explore");
  const demoLabel = useText("ex.card.demo");
  const empty = useText("ex.solutions.empty");

  const count = active.length;
  useEffect(() => {
    if (held || count < 2) return;
    const t = window.setTimeout(() => setCurrent((c) => (c + 1) % count), DWELL_MS);
    return () => window.clearTimeout(t);
  }, [current, held, count]);

  if (count === 0) return <p className="py-12 text-center text-[15px] text-[var(--ax-ink-muted)]">{empty}</p>;

  const index = Math.min(current, count - 1);
  const product = active[index];
  const demo = demoUrl(product);
  const partner = partnerHue(product.slug, product.accent);

  return (
    <div
      className={cn("grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:gap-12", className)}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
    >
      <div role="tablist" aria-label="Enterprise solutions" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {active.map((p, i) => {
          const on = i === index;
          const accent = p.accent;
          return (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setCurrent(i)}
              className={cn(
                "ax-focus group relative flex shrink-0 items-center gap-3.5 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-500 lg:w-full",
                on
                  ? "border-transparent bg-[var(--ax-bg-elevated)]"
                  : "border-[var(--ax-line)] hover:border-[var(--ax-line-strong)]",
              )}
              style={on ? { boxShadow: `inset 0 0 0 1px ${accent}66, 0 20px 50px -30px ${accent}` } : undefined}
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-xl transition-colors"
                style={{ background: on ? accent : `${accent}22`, color: on ? "#fff" : accent }}
              >
                <Icon name={p.icon} className="size-[18px]" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-[15px] font-semibold text-[var(--ax-ink)]">{p.name}</span>
                <span className="hidden truncate text-[12px] text-[var(--ax-ink-dim)] lg:block">
                  {p.sector || categoryLabel(p.category)}
                </span>
              </span>
              {on && !held && count > 1 && (
                <span
                  key={`bar-${index}`}
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[2px] origin-left"
                  style={{
                    width: "100%",
                    background: accent,
                    animation: `ax-progress ${DWELL_MS}ms linear forwards`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        key={product.slug}
        className="relative overflow-hidden rounded-[28px] border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)]"
        style={{ animation: "ax-pop 0.6s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <ProductShowcase product={product} size="md" className="pt-2" />
        <div className="relative z-10 flex flex-col gap-5 border-t border-[var(--ax-line)] bg-[var(--ax-bg-elevated)]/80 p-6 backdrop-blur md:flex-row md:items-end md:justify-between md:p-8">
          <div className="min-w-0">
            <h3 className="text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-[-0.02em] text-[var(--ax-ink)]">{product.name}</h3>
            <p
              className="mt-1.5 bg-clip-text text-[15px] font-medium text-transparent"
              style={{ backgroundImage: `linear-gradient(95deg, var(--ax-ink-muted), ${product.accent})` }}
            >
              {product.tagline}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <Link
              href={`/products/${product.slug}`}
              className="ax-focus inline-flex h-11 items-center gap-2 rounded-full px-5 text-[13.5px] font-semibold text-white"
              style={{ background: `linear-gradient(110deg, ${product.accent}, ${partner})` }}
            >
              {explore}
              <Icon name="arrow-right" className="size-4" strokeWidth={2.2} />
            </Link>
            {demo && (
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                className="ax-focus inline-flex h-11 items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-5 text-[13.5px] font-semibold text-[var(--ax-ink)] hover:bg-[rgba(var(--ax-glow),0.1)]"
              >
                {demoLabel}
                <Icon name="external-link" className="size-4" strokeWidth={2} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
