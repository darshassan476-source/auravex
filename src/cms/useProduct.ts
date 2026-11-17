"use client";

import { useMemo } from "react";
import { PRODUCTS, normalizeStatus } from "@/data/products";
import { byOrder, mergeCatalogue } from "@/lib/catalogue";
import type { MediaItem, ProductOverride } from "@/lib/cms";
import type { Product, ProductCategory, ProductStatus } from "@/lib/types";
import { useCms } from "./CmsProvider";

export interface ResolvedProduct extends Product {
  /** URL of an uploaded image, when the admin has set one. */
  imageSrc?: string;
  /** Every uploaded screen, in the order the portal put them. */
  imageSrcs?: string[];
  hidden?: boolean;
  /** Created in the portal rather than bundled with the site. */
  custom?: boolean;
}

/**
 * A product with the admin's edits applied.
 *
 * Only changed fields are stored, so anything untouched still comes from the
 * bundled record — or, for a product created in the portal, from the record
 * the portal saved — and keeps working if the override is later removed.
 */
export function resolveProduct(
  product: Product,
  patch: ProductOverride | undefined,
  media: MediaItem[],
  custom = false,
): ResolvedProduct {
  if (!patch) return { ...product, status: normalizeStatus(product.status), custom };
  return {
    ...product,
    ...pickDefined(patch, ENTERPRISE_KEYS),
    name: patch.name ?? product.name,
    tagline: patch.tagline ?? product.tagline,
    summary: patch.summary ?? product.summary,
    description: patch.description ?? product.description,
    accent: patch.accent ?? product.accent,
    status: normalizeStatus((patch.status as ProductStatus) ?? product.status),
    metrics: patch.metrics ?? product.metrics,
    sector: patch.sector ?? product.sector,
    category: (patch.category as ProductCategory) ?? product.category,
    icon: patch.icon ?? product.icon,
    tags: patch.tags ?? product.tags,
    stack: patch.stack ?? product.stack,
    year: patch.year ?? product.year,
    featured: patch.featured ?? product.featured,
    links: patch.links ? { ...product.links, ...patch.links } : product.links,
    demoNote: patch.demoNote ?? product.demoNote,
    imageSrc: screenSrcs(patch, media)[0],
    imageSrcs: screenSrcs(patch, media),
    video: patch.videoId
      ? {
          id: patch.videoId,
          type: "video",
          src:
            media.find((m) => m.id === patch.videoId)?.src ??
            `/api/media/${patch.videoId}`,
          poster: patch.posterId
            ? (media.find((m) => m.id === patch.posterId)?.src ??
              `/api/media/${patch.posterId}`)
            : undefined,
          alt: `${patch.name ?? product.name} — launch film`,
        }
      : product.video,
    hidden: patch.hidden,
    custom,
  };
}

/** Override fields copied across as-is when the portal has set them. */
const ENTERPRISE_KEYS = [
  "features",
  "problems",
  "modules",
  "aiCapabilities",
  "workflows",
  "deployment",
  "integrations",
  "industries",
  "optionalModules",
  "aiEnhancements",
  "voiceAI",
  "customization",
  "preview",
  "order",
  "demoPublic",
] as const satisfies readonly (keyof ProductOverride & keyof Product)[];

function pickDefined(patch: ProductOverride, keys: readonly (keyof ProductOverride)[]): Partial<Product> {
  const out: Record<string, unknown> = {};
  for (const key of keys) if (patch[key] !== undefined) out[key] = patch[key];
  return out as Partial<Product>;
}

/**
 * The screens set on a product, resolved to URLs. `imageIds` is the list the
 * portal edits; `imageId` is what a single-image product (and everything
 * written before galleries existed) still carries, so it leads when the list
 * is empty. Ids whose media has gone are dropped rather than left to 404.
 */
function screenSrcs(patch: ProductOverride, media: MediaItem[]): string[] {
  const ids = patch.imageIds?.length
    ? patch.imageIds
    : patch.imageId
      ? [patch.imageId]
      : [];
  return ids
    .map((id) => media.find((m) => m.id === id)?.src)
    .filter((src): src is string => Boolean(src));
}

export function useProduct(product: Product): ResolvedProduct {
  const { state, ready } = useCms();
  if (!ready) return product;
  const custom = !PRODUCTS.some((p) => p.slug === product.slug);
  return resolveProduct(
    product,
    state.products[product.slug],
    state.media,
    custom,
  );
}

/** Same resolution, for a list. Hidden products are dropped. */
export function useProducts(products: Product[]): ResolvedProduct[] {
  const { state, ready } = useCms();
  if (!ready) return products;
  return products
    .map((p) =>
      resolveProduct(
        p,
        state.products[p.slug],
        state.media,
        state.customProducts.some((c) => c.slug === p.slug),
      ),
    )
    .filter((p) => !p.hidden);
}

/**
 * The whole catalogue: the bundled products plus everything created in the
 * portal, each with its edits applied. Hidden ones are left out unless asked
 * for, which the portal does so they can be un-hidden.
 */
export function useCatalogue(
  options: { includeHidden?: boolean } = {},
): ResolvedProduct[] {
  const { state, ready } = useCms();
  const { includeHidden = false } = options;
  return useMemo(() => {
    const overrides = ready ? state.products : {};
    const custom = ready ? state.customProducts : [];
    const builtIn = new Set(PRODUCTS.map((p) => p.slug));
    const all = byOrder(
      mergeCatalogue(PRODUCTS, custom).map((p) =>
        resolveProduct(p, overrides[p.slug], state.media, !builtIn.has(p.slug)),
      ),
    );
    return includeHidden ? all : all.filter((p) => !p.hidden);
  }, [ready, state.products, state.customProducts, state.media, includeHidden]);
}
