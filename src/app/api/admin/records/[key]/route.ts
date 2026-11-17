import { revalidateTag } from "next/cache";
import { SITE_TAG } from "@/server/cache";
import { logActivity } from "@/server/db";
import { fail, json, readJson, withUser } from "@/server/http";
import { isRecordKey, readRecords, writeRecords } from "@/server/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ key: string }> };

/** The full private list: customers, adoption figures, pricing or updates. Signed-in only. */
export const GET = withUser<Ctx>(async (_request, _user, ctx) => {
  const { key } = await ctx.params;
  if (!isRecordKey(key)) return fail(404, "Unknown record list.");
  return json({ items: await readRecords(key) });
});

/** Replaces the list. Every item is checked before anything is written. */
export const PUT = withUser<Ctx>(async (request, user, ctx) => {
  const { key } = await ctx.params;
  if (!isRecordKey(key)) return fail(404, "Unknown record list.");
  const body = await readJson<{ items: unknown }>(request, 2_000_000);
  await writeRecords(key, body.items);
  await logActivity(user.name, "update", "changed", key);
  revalidateTag(SITE_TAG);
  return json({ ok: true });
});
