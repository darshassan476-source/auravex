import { col, database, type CollectionName } from "@/server/db";
import { json, withUser } from "@/server/http";
import { aiKey } from "@/server/appSecrets";
import { mailConfigured } from "@/server/mail";
import { subscriptionCount } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** What is connected and what is not — the honest version of "all systems operational". */
export const GET = withUser(async () => {
  const count = async (name: CollectionName) => (await col(name)).estimatedDocumentCount();

  const db = await database();
  let dbBytes = 0;
  try {
    const stats = await db.command({ dbStats: 1 });
    dbBytes = Number(stats.dataSize ?? 0) + Number(stats.indexSize ?? 0);
  } catch {
    /* the account may not be allowed to run dbStats */
  }
  const [sum] = await (await col("media"))
    .aggregate<{ n: number }>([{ $group: { _id: null, n: { $sum: "$size" } } }])
    .toArray();

  const [ai, mail, subscriptions, media, visits, threads, bookings, jobs, sessions] = await Promise.all([
    aiKey(),
    mailConfigured(),
    subscriptionCount(),
    count("media"),
    count("visits"),
    count("threads"),
    count("bookings"),
    count("ai_jobs"),
    count("sessions"),
  ]);

  return json({
    ai: Boolean(ai),
    mail,
    push: { subscriptions },
    counts: { media, visits, threads, bookings, jobs, sessions },
    storage: { dataDir: `MongoDB · ${db.databaseName}`, dbBytes, mediaBytes: Number(sum?.n ?? 0) },
    node: process.version,
    uptimeSeconds: Math.round(process.uptime()),
  });
});
