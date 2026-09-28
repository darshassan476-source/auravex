"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AX_EASE } from "@/components/fx/Reveal";
import { MiniDevice } from "@/components/showcase/MiniDevice";
import { FilterPills, type FilterOption } from "@/components/ui/FilterPills";
import { Icon } from "@/components/ui/Icon";
import { PRODUCT_FILTERS } from "@/data/products";
import type { Product, ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryFilter = ProductCategory | "all";

type DeviceVariant = "dashboard" | "table" | "flow" | "map" | "kiosk" | "console";

/**
 * One look per product, matched to the interface its detail page shows.
 * Keying this by category meant nine cards drew from four pictures, so the
 * gallery looked like the same screenshot repeated.
 */
const DEVICE_BY_SLUG: Record<string, DeviceVariant> = {
  "real-estate-os": "map",
  "business-intelligence": "dashboard",
  "operations-suite": "flow",
  "crm-lead-flow": "table",
  "visitor-experience": "kiosk",
  "custom-platforms": "console",
  "aurora-ai-engine": "dashboard",
  "forge-devkit": "console",
  "atlas-site-builder": "flow",
};

const DEVICE_BY_CATEGORY: Record<string, DeviceVariant> = {
  enterprise: "map",
  automation: "flow",
  saas: "table",
  ai: "dashboard",
  "web-apps": "kiosk",
  "developer-tools": "console",
};

/**
 * The product gallery from reference 8: a filter rail above a grid of cards
 * that pair copy on the left with a device shot on the right.
 */
export function ProductExplorer({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<CategoryFilter>("all");

  const options: FilterOption[] = useMemo(
    () =>
      PRODUCT_FILTERS.map((filter) => ({
        id: filter.id,
        label: filter.label,
        icon: filter.icon,
        count:
          filter.id === "all"
            ? products.length
            : products.filter((p) => p.category === filter.id).length,
      })).filter((option) => option.count > 0),
    [products],
  );

  const results = useMemo(
    () =>
      category === "all" ? products : products.filter((p) => p.category === category),
    [products, category],
  );

  return (
    <div className="flex flex-col gap-12">
      <FilterPills
        options={options}
        value={category}
        onChange={(id) => setCategory(id as CategoryFilter)}
        layoutId="product-gallery-filter"
      />

      <motion.div layout className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: AX_EASE }}
            >
              <GalleryCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function GalleryCard({ product }: { product: Product }) {
  const href = product.links.caseStudy ?? `/products/${product.slug}`;
  const cta = product.links.caseStudy ? "View Case Study" : "Explore Product";

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-[var(--ax-line)]",
        "bg-[var(--ax-bg-elevated)] transition-all duration-500",
        "hover:border-[var(--ax-line-strong)] hover:shadow-[0_30px_90px_-36px_rgba(var(--ax-glow),0.6)]",
      )}
    >
      {/* Accent wash behind the device */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-0 h-full w-2/3 opacity-60 blur-[60px] transition-opacity duration-700 group-hover:opacity-90"
        style={{ background: `radial-gradient(60% 55% at 70% 40%, ${product.accent}4d, transparent 72%)` }}
      />

      <div className="relative flex h-full flex-col gap-5 p-6">
        {/* Sector row */}
        <div className="flex items-center gap-2.5">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg"
            style={{
              background: `linear-gradient(145deg, ${product.accent}42, ${product.accent}12)`,
              boxShadow: `inset 0 0 0 1px ${product.accent}4d`,
            }}
          >
            <Icon
              name={product.icon}
              className="size-4"
              strokeWidth={1.9}
              style={{ color: product.accent }}
            />
          </span>
          <span className="truncate text-[12px] text-[var(--ax-ink-muted)]">{product.sector}</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] sm:items-start">
          <div className="flex min-w-0 flex-col gap-3.5">
            <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.015em] text-[var(--ax-ink)]">
              {product.name}
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)] px-2 py-[3px] text-[10.5px] font-medium text-[var(--ax-ink-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="ax-text-pretty text-[13px] leading-relaxed text-[var(--ax-ink-muted)]">
              {product.summary}
            </p>

            <Link
              href={href}
              className="ax-focus mt-auto inline-flex w-fit items-center gap-1.5 pt-1 text-[12.5px] font-semibold text-[var(--ax-accent-soft)] transition-colors hover:text-[var(--ax-accent)]"
            >
              {cta}
              <Icon
                name="arrow-right"
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.4}
              />
            </Link>
          </div>

          {/* Device shot */}
          <div className="relative pt-1 transition-transform duration-[900ms] ease-out group-hover:-translate-y-1">
            <MiniDevice
              accent={product.accent}
              seed={product.slug}
              variant={
                DEVICE_BY_SLUG[product.slug] ??
                DEVICE_BY_CATEGORY[product.category] ??
                "dashboard"
              }
            />
          </div>
        </div>

        {/* Circular arrow, as in the reference */}
        <Link
          href={`/products/${product.slug}`}
          aria-label={`Open ${product.name}`}
          className={cn(
            "ax-focus absolute bottom-5 right-5 grid size-10 place-items-center rounded-full",
            "border border-[var(--ax-line-strong)] text-[var(--ax-ink)] backdrop-blur",
            "transition-all duration-400 group-hover:border-transparent",
            "group-hover:bg-[var(--ax-accent)] group-hover:text-white",
          )}
        >
          <Icon
            name="arrow-right"
            className="size-4 transition-transform duration-400 group-hover:translate-x-0.5"
            strokeWidth={2.1}
          />
        </Link>
      </div>
    </article>
  );
}
