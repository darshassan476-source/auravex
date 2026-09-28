import { revalidateTag } from "next/cache";
import { SITE_TAG } from "@/server/cache";
import { allSettings, logActivity } from "@/server/db";
import { json, readJson, withUser } from "@/server/http";
import { applySettings, listMedia, SETTING_KEYS } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withUser(async () => {
  const [stored, media] = await Promise.all([allSettings(), listMedia()]);
  const settings = Object.fromEntries(
    SETTING_KEYS.filter((k) => k in stored).map((k) => [k, stored[k]]),
  );
  return json({ settings, media });
});

/** Partial update: only the keys present in the body are written. */
export const PUT = withUser(async (request, user) => {
  const patch = await readJson<Record<string, unknown>>(request, 4_000_000);
  const applied = await applySettings(patch);
  if (applied.length) {
    await logActivity(user.name, "publish", "changed", applied.join(", "));
    revalidateTag(SITE_TAG);
  }
  return json({ applied });
});
