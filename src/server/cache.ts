import "server-only";
import { unstable_cache } from "next/cache";
import { EMPTY_CMS } from "@/lib/cms";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/lib/types";
import { fullCatalogue, publicBundle } from "./site";

/**
 * The content the pages are rendered from, cached under one tag.
 *
 * Pages stay static — fast to serve and cheap to prefetch — and every admin
 * write calls `siteChanged()`, so the next request after an edit renders
 * fresh. At build time, when the database may be out of reach, the empty
 * store is used rather than failing the build.
 */
import { SITE_TAG } from "./siteTag";
export { SITE_TAG };

/**
 * Only a build may fall back to defaults. At run time the database is remote,
 * and a cached fallback would keep serving blank content long after a brief
 * network failure; throwing leaves nothing in the cache, so the next request retries.
 */
const building = () => process.env.NEXT_PHASE === "phase-production-build";

/**
 * A frontend-only deployment (Netlify) has no database of its own: it sets
 * AURAVEX_BACKEND_URL and reads the same public bundle visitors' browsers
 * read, from the backend. Pages then refresh on a timer rather than on the
 * backend's edit signal, which cannot reach this process; the browser still
 * merges the live bundle after load, so an edit shows at once regardless.
 */
const BACKEND = process.env.AURAVEX_BACKEND_URL?.replace(/\/+$/, "");
const REMOTE_REVALIDATE = 60;

type PublicBundle = Awaited<ReturnType<typeof publicBundle>>;

async function remoteBundle(): Promise<PublicBundle> {
  const res = await fetch(`${BACKEND}/api/site`, {
    headers: { accept: "application/json" },
    cache: "no-store",
    // A sleeping free-tier backend can take most of a minute to wake.
    signal: AbortSignal.timeout(building() ? 20_000 : 60_000),
  });
  if (!res.ok) throw new Error(`backend answered ${res.status} for /api/site`);
  return (await res.json()) as PublicBundle;
}

const readBundle = () => (BACKEND ? remoteBundle() : publicBundle());
const readCatalogue = async (): Promise<Product[]> => {
  if (!BACKEND) return fullCatalogue();
  const list = (await remoteBundle()).customProducts;
  return [...PRODUCTS, ...(Array.isArray(list) ? (list as Product[]) : [])];
};
const cacheOptions = { tags: [SITE_TAG], ...(BACKEND ? { revalidate: REMOTE_REVALIDATE } : {}) };

export const getSiteBundle = unstable_cache(
  async () => {
    try {
      return await readBundle();
    } catch (error) {
      if (!building()) throw error;
      console.error("[site] bundle unavailable, rendering defaults:", error);
      const empty: Partial<typeof EMPTY_CMS> = { ...EMPTY_CMS };
      delete empty.visits;
      delete empty.threads;
      delete empty.bookings;
      return empty as Omit<typeof EMPTY_CMS, "visits" | "threads" | "bookings">;
    }
  },
  ["site-bundle"],
  cacheOptions,
);

export const getCatalogue = unstable_cache(
  async (): Promise<Product[]> => {
    try {
      return await readCatalogue();
    } catch (error) {
      if (!building()) throw error;
      return PRODUCTS;
    }
  },
  ["site-catalogue"],
  cacheOptions,
);

/**
 * A product by slug, found even when it was published after the cached
 * catalogue was read: a miss in the cache is checked against the live store
 * before the page gives up with a 404, so a new product's page works at once.
 */
export async function findProduct(slug: string): Promise<Product | undefined> {
  const cached = (await getCatalogue()).find((p) => p.slug === slug);
  if (cached) return cached;
  try {
    return (await readCatalogue()).find((p) => p.slug === slug);
  } catch {
    return undefined;
  }
}
