import { col, logActivity, now, uid } from "@/server/db";
import { fail, json, readJson, str, withUser } from "@/server/http";
import { linkFromRow, listLinks } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROUPS = new Set(["Social", "Product", "Resource"]);

function validUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" || u.protocol === "mailto:";
  } catch {
    return false;
  }
}

export const GET = withUser(async () => json({ links: await listLinks() }));

/** A new tracked destination; its share address becomes /go/<id>. */
export const POST = withUser(async (request, user) => {
  const body = await readJson<{ label?: unknown; url?: unknown; group?: unknown }>(request, 10_000);
  const label = str(body.label, 80);
  const url = str(body.url, 2_000);
  const group = GROUPS.has(String(body.group)) ? String(body.group) : "Resource";

  if (label.length < 2) return fail(400, "Give the link a name.");
  if (!validUrl(url)) return fail(400, "Enter a full address, starting with https://.");

  const id = uid("l");
  const row = { _id: id, id, label, url, grp: group, clicks: 0, created_at: now() };
  await (await col("links")).insertOne(row);
  await logActivity(user.name, "create", "added the link", label);

  return json(linkFromRow(row), { status: 201 });
});
