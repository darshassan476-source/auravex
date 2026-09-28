import { PERSONAS, type AuditPersona } from "@/lib/aiJobs";
import { createWatch, listCredentials, listWatches } from "@/server/ai";
import { logActivity } from "@/server/db";
import { fail, json, readJson, str, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withUser(async () => json({ watches: await listWatches() }));

/** Starts watching a product: it is audited every `hours` hours, and you hear when the verdict moves. */
export const POST = withUser(async (request, user) => {
  const body = await readJson<{ name?: unknown; url?: unknown; credentialId?: unknown; persona?: unknown; hours?: unknown }>(request, 5_000);
  const url = str(body.url, 500);
  if (!/^https?:\/\//i.test(url)) return fail(400, "Give the product's address, starting with https://.");
  const credentialId = typeof body.credentialId === "string" && body.credentialId ? body.credentialId.slice(0, 64) : undefined;
  if (credentialId && !(await listCredentials()).some((c) => c.id === credentialId)) return fail(400, "That credential no longer exists.");
  const persona = (PERSONAS.some((p) => p.value === body.persona) ? body.persona : "first-time") as AuditPersona;
  const hours = Math.min(24 * 30, Math.max(1, Math.round(Number(body.hours) || 168)));
  if ((await listWatches()).length >= 20) return fail(400, "Twenty products are already being watched; remove one first.");
  const name = str(body.name, 80) || url.replace(/^https?:\/\//, "").slice(0, 60);
  const watch = await createWatch({ name, url, credentialId, persona, hours });
  await logActivity(user.name, "create", "started watching a product", name);
  return json(watch, { status: 201 });
});
