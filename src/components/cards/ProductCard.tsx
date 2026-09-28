"use client";

import Link from "next/link";
import { useProduct } from "@/cms/useProduct";
import { TiltCard } from "@/components/fx/TiltCard";
import { AbstractArt, type ArtVariant } from "@/components/showcase/AbstractArt";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "../ui/Icon";

/**
 * Portfolio card, matching the reference anatomy: artwork filling the upper
 * right, icon tile top-left, title, short description, and a circular arrow
 * button pinned bottom-right that fills on hover.
 */

const ART_BY_CATEGORY: Record<string, ArtVariant> = {
  enterprise: "skyline",
  "web-apps": "facade",
  saas: "facade",
  ai: "mesh",
  automation: "waves",
  "developer-tools": "mesh",
};

export function ProductCard({
  product: source,
  className,
  preview = false,
}: {
  product: Product;
  className?: string;
  /** A draft being edited: its page may not exist yet, so it is never prefetched. */
  preview?: boolean;
}) {
  // Admin edits — copy, accent and an uploaded image — applied on top of the
  // bundled record.
  const product = useProduct(source);
  const variant = ART_BY_CATEGORY[product.category] ?? "waves";

  return (
    <TiltCard className={cn("h-full", className)} intensity={5}>
    <Link
      href={`/products/${product.slug}`}
      prefetch={preview ? false : undefined}
      className={cn(
        "group relative flex min-h-[232px] flex-col overflow-hidden rounded-2xl",
        "border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)]",
        "transition-all duration-500 hover:border-[var(--ax-line-strong)]",
        "hover:shadow-[0_28px_80px_-32px_rgba(var(--ax-glow),0.55)]",
        "ax-focus h-full",
      )}
    >
      {/* Artwork */}
      <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]">
        {product.imageSrc ? (
          <>
            {/* An uploaded photograph replaces the generated artwork. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageSrc} alt="" className="size-full object-cover" />
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,15,0.25),rgba(4,7,15,0.82))]"
            />
          </>
        ) : (
          <AbstractArt variant={variant} accent={product.accent} seed={product.slug} />
        )}
      </div>

      {/* Scrim between the artwork and the copy — without it the description
          sits on whatever tone the generated art happens to have there. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--ax-card-scrim)" }}
      />

      {/* Accent bloom on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-0 blur-[60px] transition-opacity duration-700 group-hover:opacity-50"
        style={{ background: `radial-gradient(60% 100% at 30% 100%, ${product.accent}, transparent 70%)` }}
      />

      <div className="relative flex flex-1 flex-col p-6">
        <span
          className="grid size-10 place-items-center rounded-xl transition-transform duration-500 group-hover:scale-110"
          style={{
            background: `linear-gradient(145deg, ${product.accent}3d, ${product.accent}0f)`,
            boxShadow: `inset 0 0 0 1px ${product.accent}45`,
          }}
        >
          <Icon
            name={product.icon}
            className="size-[19px]"
            strokeWidth={1.8}
            style={{ color: product.accent }}
          />
        </span>

        <h3 className="mt-5 text-[19px] font-semibold leading-tight tracking-[-0.01em] text-[var(--ax-ink)]">
          {product.name}
        </h3>

        <p className="ax-text-pretty mt-2.5 max-w-[26ch] text-[13px] leading-relaxed text-[var(--ax-ink-muted)]">
          {product.summary}
        </p>

        {/* Circular arrow, bottom-right */}
        <span
          className={cn(
            "mt-auto ml-auto grid size-10 shrink-0 place-items-center rounded-full",
            "border border-[var(--ax-line-strong)] text-[var(--ax-ink)]",
            "transition-all duration-400 group-hover:border-transparent",
            "group-hover:bg-[var(--ax-accent)] group-hover:text-white",
          )}
        >
          <Icon
            name="arrow-right"
            className="size-4 transition-transform duration-400 group-hover:translate-x-0.5"
            strokeWidth={2.1}
          />
        </span>
      </div>
    </Link>
    </TiltCard>
  );
}
