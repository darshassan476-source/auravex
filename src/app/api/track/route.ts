import { col, now } from "@/server/db";
import { guarded, json, readJson, str, throttle, visitorHash } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEVICES = new Set(["desktop", "tablet", "mobile"]);
const KEEP_DAYS = 180;

/** One page view. Stores a path, a source and a device — nothing personal. */
export const POST = guarded(async (request) => {
  const who = visitorHash(request);
  if (!throttle(request, "track", 120, 5000, 60_000)) return json({ ok: false });
  const body = await readJson<{ path?: unknown; source?: unknown; device?: unknown }>(request, 4_000);
  const path = str(body.path, 300);
  const source = str(body.source, 120) || "direct";
  const device = DEVICES.has(String(body.device)) ? String(body.device) : "desktop";

  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
    return json({ ok: false });
  }

  const visits = await col("visits");
  await visits.insertOne({
    at: now(),
    path,
    source,
    device,
    ua: str(request.headers.get("user-agent"), 300) || null,
    ip_hash: who,
  });

  // Trim the log now and then, so it never grows without bound.
  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString();
    await visits.deleteMany({ at: { $lt: cutoff } });
  }

  return json({ ok: true });
});
