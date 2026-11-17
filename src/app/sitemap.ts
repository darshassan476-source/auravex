import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";
import { getCatalogue, getSiteBundle } from "@/server/cache";

// Rebuilt at most hourly, so new products appear without a deploy.
export const revalidate = 3600;

const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products", priority: 0.9, changeFrequency: "weekly" },
  { path: "/industries", priority: 0.7, changeFrequency: "monthly" },
  { path: "/updates", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = PAGES.map((page) => ({
    url: `${SITE_URL}${page.path === "/" ? "" : page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  try {
    const [catalogue, bundle] = await Promise.all([getCatalogue(), getSiteBundle()]);
    const overrides = bundle.products ?? {};
    for (const product of catalogue) {
      // Products hidden in the portal are not public, so they are not listed.
      if (overrides[product.slug]?.hidden) continue;
      entries.push({
        url: `${SITE_URL}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // The store is unreachable: the fixed pages are still a valid sitemap.
  }

  return entries;
}
