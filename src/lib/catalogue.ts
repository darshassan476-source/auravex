import type { Product } from "./types";

/** Bundled first, then the portal's own; a portal record that reuses a bundled slug is ignored. */
export function mergeCatalogue(bundled: Product[], custom: Product[]): Product[] {
  const taken = new Set(bundled.map((p) => p.slug));
  return [...bundled, ...custom.filter((p) => p && typeof p.slug === "string" && !taken.has(p.slug))];
}

/** Listing order: the portal's `order` when set, otherwise the catalogue order. */
export function byOrder<T extends Pick<Product, "order">>(list: T[]): T[] {
  return list
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (a.p.order ?? 100 + a.i) - (b.p.order ?? 100 + b.i))
    .map(({ p }) => p);
}
