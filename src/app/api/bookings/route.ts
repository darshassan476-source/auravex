import { col, now, uid } from "@/server/db";
import { fail, guarded, isEmail, json, readJson, str, throttle } from "@/server/http";
import { notifyOperator } from "@/server/mail";
import { broadcast } from "@/server/push";
import { bookingFromRow } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{1,2}:\d{2}\s?(AM|PM)$/i;

/** A demo slot chosen on the contact page. */
export const POST = guarded(async (request) => {
  if (!throttle(request, "bookings", 6, 60, 10 * 60_000)) {
    return fail(429, "Too many bookings from this connection. Please try again later.");
  }
  const body = await readJson<Record<string, unknown>>(request, 10_000);
  const name = str(body.name, 120) || "Website visitor";
  const email = str(body.email, 200).toLowerCase();
  const company = str(body.company, 120) || null;
  const subject = str(body.subject, 160) || null;
  const date = str(body.date, 10);
  const time = str(body.time, 10).toUpperCase();
  const notes = str(body.notes, 2_000) || null;

  // A date must survive a round trip: "2026-02-31" parses, but not as itself.
  const real = DATE.test(date) && !Number.isNaN(Date.parse(date)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
  if (!real) return fail(400, "Pick a valid date.");
  if (!TIME.test(time)) return fail(400, "Pick a valid time slot.");
  if (email && !isEmail(email)) return fail(400, "That email address does not look right.");

  const id = uid("b");
  const row = {
    _id: id,
    id,
    name,
    email,
    company,
    subject,
    date,
    time,
    status: "pending",
    notes,
    remind_minutes: 30,
    reminded_at: null,
    created_at: now(),
  };
  await (await col("bookings")).insertOne(row);

  void broadcast({
    title: `New demo booked: ${name}`,
    body: [company, `${date} at ${time}`].filter(Boolean).join(" · "),
    url: "/admin/bookings",
    tag: id,
  }).catch(() => undefined);
  void notifyOperator({
    subject: `Demo booked by ${name} for ${date} ${time}`,
    text: `${name}${email ? ` <${email}>` : ""}\n${company ? `Company: ${company}\n` : ""}${subject ? `Interest: ${subject}\n` : ""}Slot: ${date} at ${time}`,
  });

  return json(bookingFromRow(row), { status: 201 });
});
