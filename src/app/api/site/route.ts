import { revalidateTag } from "next/cache";
import { seedAdmin } from "@/server/auth";
import { SITE_TAG } from "@/server/cache";
import { guarded, json } from "@/server/http";
import { ensureSweeper } from "@/server/push";
import { publicBundle } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

declare global {
  var __auravexBootRevalidated: boolean | undefined;
}

/**
 * Everything a visitor's browser needs to render the edited site.
 * ETag'd on the last edit, so an unchanged site costs a 304.
 *
 * Every page asks for this once after loading, so it is also where a fresh
 * process drops the pages it inherited from the build: the first call after
 * a start marks the cached bundle stale, and the next render reads the live
 * database instead of whatever the build machine had.
 */
export const GET = guarded(async (request) => {
  await seedAdmin();
  ensureSweeper();
  if (!globalThis.__auravexBootRevalidated) {
    globalThis.__auravexBootRevalidated = true;
    revalidateTag(SITE_TAG);
  }

  const bundle = await publicBundle();
  const etag = `"${bundle.updatedAt ?? "0"}-${bundle.media.length}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }
  return json(bundle, { headers: { ETag: etag, "Cache-Control": "no-cache" } });
});
