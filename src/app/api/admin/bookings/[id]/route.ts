import { col, logActivity } from "@/server/db";
import { fail, json, readJson, withUser } from "@/server/http";
import { bookingFromRow } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const STATUSES = new Set(["pending", "confirmed", "done", "cancelled"]);

export const PATCH = withUser<Ctx>(async (request, user, { params }) => {
  const { id } = await params;
  const body = await readJson<{ status?: unknown; remindMinutes?: unknown }>(request, 4_000);

  const bookings = await col("bookings");
  const existing = await bookings.findOne({ _id: id });
  if (!existing) return fail(404, "That booking no longer exists.");

  if (typeof body.status === "string" && STATUSES.has(body.status)) {
    await bookings.updateOne({ _id: id }, { $set: { status: body.status } });
    await logActivity(user.name, "update", `marked the demo ${body.status}:`, String(existing.name));
  }
  if (typeof body.remindMinutes === "number" && Number.isFinite(body.remindMinutes)) {
    const minutes = Math.max(0, Math.min(7 * 24 * 60, Math.round(body.remindMinutes)));
    // A new lead time re-arms a reminder that has already fired.
    await bookings.updateOne({ _id: id }, { $set: { remind_minutes: minutes, reminded_at: null } });
  }

  return json(bookingFromRow((await bookings.findOne({ _id: id }))!));
});

export const DELETE = withUser<Ctx>(async (_request, user, { params }) => {
  const { id } = await params;
  const row = await (await col("bookings")).findOneAndDelete({ _id: id });
  if (!row) return fail(404, "That booking no longer exists.");
  await logActivity(user.name, "delete", "deleted the demo booking for", String(row.name ?? id));
  return json({ ok: true });
});
