import { fail, json, readJson, withUser } from "@/server/http";
import {
  addSubscription,
  isUsableSubscription,
  removeSubscription,
  subscriptionCount,
  vapid,
  type PushSubscriptionJson,
} from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withUser(async () =>
  json({ publicKey: (await vapid()).publicKey, subscriptions: await subscriptionCount() }),
);

/** Registers this browser to receive reminders when the site is closed. */
export const POST = withUser(async (request) => {
  const body = await readJson<{ subscription?: Partial<PushSubscriptionJson> }>(request, 10_000);
  const sub = body.subscription;
  if (!isUsableSubscription(sub)) return fail(400, "That is not a push subscription.");
  await addSubscription({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
  return json({ ok: true, subscriptions: await subscriptionCount() });
});

export const DELETE = withUser(async (request) => {
  const body = await readJson<{ endpoint?: unknown }>(request, 10_000);
  if (typeof body.endpoint !== "string") return fail(400, "Missing endpoint.");
  await removeSubscription(body.endpoint);
  return json({ ok: true, subscriptions: await subscriptionCount() });
});
