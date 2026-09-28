import { col } from "@/server/db";
import { json, withUser } from "@/server/http";
import { mailConfigured } from "@/server/mail";
import { threadsFromRows } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withUser(async () => {
  const rows = await (await col("threads")).find({}).sort({ created_at: -1 }).limit(500).toArray();
  return json({ threads: await threadsFromRows(rows), mail: await mailConfigured() });
});
