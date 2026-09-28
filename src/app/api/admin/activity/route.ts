import { col } from "@/server/db";
import { json, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The portal's own audit trail, newest first. */
export const GET = withUser(async (request) => {
  const url = new URL(request.url);
  const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get("limit")) || 200));

  const activity = await col("activity");
  const [rows, total] = await Promise.all([
    activity.find({}).sort({ at: -1, _id: -1 }).limit(limit).toArray(),
    activity.countDocuments({}),
  ]);
  const entries = rows.map((row) => ({
    id: String(row._id),
    at: String(row.at),
    actor: String(row.actor),
    kind: String(row.kind) as "create" | "update" | "delete" | "publish" | "login",
    action: String(row.action),
    target: String(row.target),
  }));

  return json({ entries, total });
});
