"use client";

import Link from "next/link";
import { useText } from "@/cms/CmsProvider";
import { useProduct } from "@/cms/useProduct";
import { AbstractArt, type ArtVariant } from "@/components/showcase/AbstractArt";
import { categoryLabel } from "@/data/products";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "../ui/Icon";
import { StatusBadge } from "../ui/Primitives";

const ART_BY_CATEGORY: Record<string, ArtVariant> = {
  sustainability: "waves",
  "document-management": "facade",
  "ai-agents": "mesh",
  "enterprise-management": "skyline",
  "business-intelligence": "mesh",
  construction: "skyline",
};

/** The first screen to show for a product: an uploaded one, else a bundled screenshot. */
export function productImage(product: Product & { imageSrc?: string }): string | undefined {
  return product.imageSrc ?? product.gallery?.find((g) => g.type === "image")?.src;
}

/** Whether the Quick Demo can be offered: a public address, on a product people can use. */
export function demoUrl(product: Product): string | undefined {
  const url = product.links.demo;
  if (!url || product.demoPublic === false) return undefined;
  if (product.status === "development" || product.status === "upcoming" || product.status === "unavailable") return undefined;
  return url;
}

/**
 * An Enterprise Solutions card: the product's own screen (or generated art
 * until one is uploaded), category, name, summary, status when it is not
 * generally available, and two actions — the product page and, when a public
 * demo exists, Quick Demo in a new tab.
 */
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
  const product = useProduct(source);
  const image = productImage(product);
  const demo = demoUrl(product);
  const explore = useText("ex.card.explore");
  const demoLabel = useText("ex.card.demo");
  const href = `/products/${product.slug}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl",
        "border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)]",
        "transition-[border-color,box-shadow] duration-500 hover:border-[var(--ax-line-strong)]",
        "hover:shadow-[0_28px_80px_-36px_rgba(var(--ax-glow),0.5)]",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b border-[var(--ax-line)] bg-[var(--ax-bg)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${product.name} — application screen`}
            loading="lazy"
            className="size-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <AbstractArt
            variant={ART_BY_CATEGORY[product.category] ?? "waves"}
            accent={product.accent}
            seed={product.slug}
          />
        )}
        {product.status !== "available" && (
          <StatusBadge status={product.status} className="absolute left-4 top-4 bg-[var(--ax-bg)]/85 backdrop-blur" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-accent-soft)]">
          {product.sector || categoryLabel(product.category)}
        </p>
        <h3 className="mt-2.5 text-[20px] font-semibold leading-tight tracking-[-0.01em] text-[var(--ax-ink)]">
          <Link
            href={href}
            prefetch={preview ? false : undefined}
            className="ax-focus after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>
        <p className="ax-text-pretty mt-3 text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
          {product.summary}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ax-ink)]">
            {explore}
            <Icon
              name="arrow-right"
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2.2}
            />
          </span>
          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              className="ax-focus relative z-10 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-accent-soft)]"
            >
              {demoLabel}
              <Icon name="external-link" className="size-3.5" strokeWidth={2} />
              <span className="sr-only">(opens {product.name} in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
