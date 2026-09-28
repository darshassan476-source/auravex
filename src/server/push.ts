import "server-only";
import webpush from "web-push";
import { col, getSetting, now, setSetting, uid } from "./db";

/**
 * Web Push for booking reminders.
 *
 * This is the piece the browser alone could not do: a reminder that reaches
 * the operator when the site — and the browser — are closed. The server holds
 * VAPID keys and every subscription, sweeps the bookings once a minute, and
 * pushes to each subscription when a slot's lead time has arrived.
 *
 * Keys are generated on first use and kept in `settings`, so nothing has to
 * be configured before this works. Setting VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
 * in the environment overrides them.
 */

interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

export async function vapid(): Promise<VapidKeys> {
  const fromEnv =
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
      ? { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY }
      : null;
  if (fromEnv) return fromEnv;

  const stored = await getSetting<VapidKeys | null>("vapid", null);
  if (stored?.publicKey && stored.privateKey) return stored;

  const generated = webpush.generateVAPIDKeys();
  await setSetting("vapid", generated);
  return generated;
}

async function configure() {
  const keys = await vapid();
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@auravex.com",
    keys.publicKey,
    keys.privateKey,
  );
}

export interface PushSubscriptionJson {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Decoded length of a base64url string, or -1 when it is not base64url. */
function decodedLength(value: string) {
  if (!/^[A-Za-z0-9_-]+=*$/.test(value)) return -1;
  return Buffer.from(value, "base64url").length;
}

/** A subscription the push service could actually address: a P-256 point and a 16-byte auth secret. */
export function isUsableSubscription(sub: Partial<PushSubscriptionJson> | undefined): sub is PushSubscriptionJson {
  if (!sub?.endpoint || typeof sub.endpoint !== "string") return false;
  try {
    if (new URL(sub.endpoint).protocol !== "https:") return false;
  } catch {
    return false;
  }
  const p256dh = sub.keys?.p256dh;
  const auth = sub.keys?.auth;
  return (
    typeof p256dh === "string" &&
    typeof auth === "string" &&
    decodedLength(p256dh) === 65 &&
    decodedLength(auth) === 16
  );
}

export async function addSubscription(sub: PushSubscriptionJson) {
  const id = uid("ps");
  await (await col("push_subscriptions")).updateOne(
    { endpoint: sub.endpoint },
    {
      $set: { keys: JSON.stringify(sub.keys) },
      $setOnInsert: { _id: id, id, endpoint: sub.endpoint, created_at: now() },
    },
    { upsert: true },
  );
}

export async function removeSubscription(endpoint: string) {
  await (await col("push_subscriptions")).deleteOne({ endpoint });
}

export async function subscriptionCount() {
  return (await col("push_subscriptions")).countDocuments({});
}

async function allSubscriptions(): Promise<PushSubscriptionJson[]> {
  const rows = await (await col("push_subscriptions")).find({}).toArray();
  return rows.map((row) => ({ endpoint: String(row.endpoint), keys: JSON.parse(String(row.keys)) }));
}

/** Sends one payload to every subscriber, dropping endpoints that are gone. */
export async function broadcast(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  const subs = await allSubscriptions();
  if (subs.length === 0) return { sent: 0, dropped: 0 };
  await configure();

  let sent = 0;
  let dropped = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 60 * 60 });
        sent += 1;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        // 404/410 mean the browser unsubscribed; no status means the record
        // itself is unusable (bad keys). Either way it must not be kept.
        if (status === 404 || status === 410 || status === undefined) {
          await removeSubscription(sub.endpoint);
          dropped += 1;
          if (status === undefined) console.error("[push] dropped an unusable subscription:", (error as Error).message);
        } else {
          console.error("[push]", status, (error as Error).message);
        }
      }
    }),
  );
  return { sent, dropped };
}

/**
 * The zone bookings are made in. Slots are stored as a date and a wall-clock
 * time, so the server has to know whose clock that is: AURAVEX_TIMEZONE (an
 * IANA name such as Asia/Dubai), falling back to the machine's own zone.
 */
export function operatorZone(): string {
  const wanted = process.env.AURAVEX_TIMEZONE?.trim();
  if (wanted) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: wanted });
      return wanted;
    } catch {
      console.warn(`[push] AURAVEX_TIMEZONE "${wanted}" is not a valid zone; using the server's.`);
    }
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Milliseconds the zone is ahead of UTC at a given instant. */
function offsetAt(ts: number, zone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ts));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wall = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
  return wall - ts;
}

/**
 * "2026-09-30" + "10:00 AM" → the instant that wall-clock time occurs in the
 * operator's zone. Two passes settle the offset across a DST change.
 */
export function slotTime(date: string, time: string, zone = operatorZone()): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  let hours = 9;
  let minutes = 0;
  if (match) {
    hours = Number(match[1]) % 12;
    minutes = Number(match[2]);
    if (/pm/i.test(match[3])) hours += 12;
  }
  const [y, m, d] = date.split("-").map(Number);
  const wall = Date.UTC(y, (m ?? 1) - 1, d ?? 1, hours, minutes, 0, 0);
  let instant = wall;
  for (let i = 0; i < 2; i++) instant = wall - offsetAt(instant, zone);
  return instant;
}

/**
 * One pass over upcoming bookings. Anything whose lead time has arrived and
 * has not been reminded gets one push, and is marked so it never fires twice.
 */
export async function sweepReminders() {
  // One sweep at a time: the minute timer and a manual test must not overlap.
  if (globalThis.__auravexSweeping) return;
  globalThis.__auravexSweeping = true;
  try {
    const bookings = await col("bookings");
    const rows = await bookings
      .find({ reminded_at: null, status: { $in: ["pending", "confirmed"] } })
      .toArray();

    const current = Date.now();
    const zone = operatorZone();
    for (const row of rows) {
      const slot = slotTime(String(row.date), String(row.time), zone);
      const fireAt = slot - Number(row.remind_minutes) * 60_000;
      // Never nag about something more than six hours in the past.
      if (fireAt > current || slot < current - 6 * 3_600_000) continue;

      // Claim the row before sending, so nothing else can send it too.
      const claimed = await bookings.updateOne(
        { _id: String(row.id), reminded_at: null },
        { $set: { reminded_at: now() } },
      );
      if (!claimed.modifiedCount) continue;

      await broadcast({
        title: `Demo with ${row.name} in ${row.remind_minutes} minutes`,
        body: [row.company, row.subject, `${row.date} at ${row.time}`].filter(Boolean).join(" · "),
        url: "/admin/bookings",
        tag: String(row.id),
      });
    }
  } finally {
    globalThis.__auravexSweeping = false;
  }
}

declare global {
  var __auravexSweeper: ReturnType<typeof setInterval> | undefined;
  var __auravexSweeping: boolean | undefined;
}

/** Expired sessions are dropped on the same beat as the reminder sweep. */
async function housekeeping() {
  await (await col("sessions")).deleteMany({ expires_at: { $lt: now() } });
}

/** Starts the once-a-minute sweep, once per process. */
export function ensureSweeper() {
  if (globalThis.__auravexSweeper) return;
  globalThis.__auravexSweeper = setInterval(() => {
    sweepReminders().catch((error) => console.error("[push] sweep failed", error));
    housekeeping().catch((error) => console.error("[db] housekeeping failed", error));
  }, 60_000);
  // Do not keep the process alive on our account.
  globalThis.__auravexSweeper.unref?.();
}
