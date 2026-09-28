import { col, logActivity } from "@/server/db";
import { fail, json, readJson, str, withUser } from "@/server/http";
import { linkFromRow } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const GROUPS = new Set(["Social", "Product", "Resource"]);

export const PATCH = withUser<Ctx>(async (request, user, { params }) => {
  const { id } = await params;
  const links = await col("links");
  const row = await links.findOne({ _id: id });
  if (!row) return fail(404, "That link no longer exists.");

  const body = await readJson<{ label?: unknown; url?: unknown; group?: unknown; resetClicks?: unknown }>(
    request,
    10_000,
  );

  const label = body.label === undefined ? String(row.label) : str(body.label, 80);
  const url = body.url === undefined ? String(row.url) : str(body.url, 2_000);
  const group = body.group === undefined ? String(row.grp) : GROUPS.has(String(body.group)) ? String(body.group) : String(row.grp);
  if (label.length < 2) return fail(400, "Give the link a name.");
  try {
    const parsed = new URL(url);
    if (!["https:", "http:", "mailto:"].includes(parsed.protocol)) throw new Error();
  } catch {
    return fail(400, "Enter a full address, starting with https://.");
  }

  await links.updateOne(
    { _id: id },
    { $set: { label, url, grp: group, ...(body.resetClicks === true ? { clicks: 0 } : {}) } },
  );
  await logActivity(user.name, "update", "edited the link", label);

  return json(linkFromRow((await links.findOne({ _id: id }))!));
});

export const DELETE = withUser<Ctx>(async (_request, user, { params }) => {
  const { id } = await params;
  const row = await (await col("links")).findOneAndDelete({ _id: id });
  if (!row) return fail(404, "That link no longer exists.");
  await logActivity(user.name, "delete", "removed the link", String(row.label ?? id));
  return json({ ok: true });
});
