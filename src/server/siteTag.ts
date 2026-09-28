import "server-only";
import { revalidateTag } from "next/cache";
import { latestUpdate } from "./site";

/**
 * How the rendered site learns that its content changed.
 *
 * Pages are cached under one tag. Inside a request, `revalidateTag` is enough:
 * Next applies it as the response goes out. The AI job runner is different —
 * it carries on long after the request that queued it has finished, and a tag
 * pushed then is never applied (and at boot there is no request at all). So a
 * change from anywhere first raises a flag, and every request that follows
 * pays it off before doing its own work.
 */
export const SITE_TAG = "site";

declare global {
  var __auravexSiteDirty: boolean | undefined;
  var __auravexOrigin: string | undefined;
}

/** Where this server answers, learned from the requests it serves; used only to call itself. */
export function rememberOrigin(request: Request) {
  if (globalThis.__auravexOrigin) return;
  try {
    globalThis.__auravexOrigin = new URL(request.url).origin;
  } catch {
    /* an odd URL is no reason to fail a request */
  }
}

/** The address the runner reaches this server on: the local port first, the served origin otherwise. */
function selfAddress(): string | null {
  if (process.env.PORT) return `http://127.0.0.1:${process.env.PORT}`;
  return globalThis.__auravexOrigin ?? null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Raises the flag and has this server pay it off inside a real request. */
async function flushThroughRequest() {
  siteChanged();
  const base = selfAddress();
  if (base) {
    try {
      const res = await fetch(`${base}/api/site`, { signal: AbortSignal.timeout(5000), headers: { "cache-control": "no-cache" } });
      await res.arrayBuffer();
    } catch {
      /* the next visitor's request applies it instead */
    }
  }
  await sleep(400);
}

export interface PageCheck {
  /** A page that must show the change, e.g. "/products/acme". */
  path: string;
  /** Text the fresh page must contain, beyond the update stamp. */
  expect?: string;
}

/** Whether a rendered page carries the site's latest update stamp (and the expected text). */
async function pageIsFresh(base: string, check: PageCheck): Promise<boolean> {
  try {
    const res = await fetch(`${base}${check.path}`, { signal: AbortSignal.timeout(20_000), headers: { "cache-control": "no-cache" } });
    const html = await res.text();
    const stamp = await latestUpdate();
    // The content bundle is embedded in every page as escaped JSON, stamp included.
    const stamped = !stamp || html.includes(`\\"updatedAt\\":\\"${stamp}\\"`);
    return stamped && (!check.expect || html.includes(check.expect));
  } catch {
    return true; // unreachable pages are not this function's problem
  }
}

/**
 * For the job runner, which lives outside any request: makes the change
 * visible on the rendered pages before the job is shown as finished. The
 * flag is paid off through a real request, and the pages named are then
 * fetched to confirm they carry the change; a page that rendered stale in
 * the meantime is refreshed again, so a visitor never meets the old copy.
 */
export async function refreshSite(verify: PageCheck[] = []) {
  await flushThroughRequest();
  const base = selfAddress();
  if (!base || !verify.length) return;
  for (let attempt = 0; attempt < 4; attempt++) {
    const results = await Promise.all(verify.map((check) => pageIsFresh(base, check)));
    if (results.every(Boolean)) return;
    await flushThroughRequest();
  }
  console.warn("[site] a page still showed stale content after four refreshes:", verify.map((v) => v.path).join(", "));
}

/** Marks the site stale; effective now if inside a request, otherwise on the next one. */
export function siteChanged() {
  globalThis.__auravexSiteDirty = true;
  try {
    revalidateTag(SITE_TAG);
  } catch {
    /* no request context (boot-time runner): the next request applies it */
  }
}

/** Called at the top of every API request: applies a change raised outside a request. */
export function flushSiteChanges() {
  if (!globalThis.__auravexSiteDirty) return;
  globalThis.__auravexSiteDirty = false;
  try {
    revalidateTag(SITE_TAG);
  } catch {
    globalThis.__auravexSiteDirty = true;
  }
}
