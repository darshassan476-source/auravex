import { col } from "@/server/db";
import { json, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Visits in the last `days` (default 30, max 365), oldest first. */
export const GET = withUser(async (request) => {
  const url = new URL(request.url);
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days")) || 30));
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();

  const collection = await col("visits");
  const [rows, total] = await Promise.all([
    collection
      .find({ at: { $gte: cutoff } }, { projection: { at: 1, path: 1, source: 1, device: 1 } })
      .sort({ at: 1 })
      .limit(20000)
      .toArray(),
    collection.countDocuments({}),
  ]);
  const visits = rows.map((row) => ({
    at: String(row.at),
    path: String(row.path),
    source: String(row.source),
    device: String(row.device) as "desktop" | "tablet" | "mobile",
  }));

  return json({ visits, total, days });
});

export const DELETE = withUser(async () => {
  await (await col("visits")).deleteMany({});
  return json({ ok: true });
});
