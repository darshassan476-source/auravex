import { col } from "@/server/db";
import { json, withUser } from "@/server/http";
import { bookingFromRow } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withUser(async () => {
  const rows = await (await col("bookings")).find({}).sort({ date: 1, time: 1 }).limit(1000).toArray();
  return json({ bookings: rows.map(bookingFromRow) });
});
