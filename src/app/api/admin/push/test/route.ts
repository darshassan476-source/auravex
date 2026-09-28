import { json, withUser } from "@/server/http";
import { broadcast, sweepReminders } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sends a test notification to every subscribed browser and runs a sweep. */
export const POST = withUser(async (_request, user) => {
  const result = await broadcast({
    title: "Reminders are working",
    body: `${user.name}, this browser will be told before every demo.`,
    url: "/admin/bookings",
    tag: "test",
  });
  await sweepReminders();
  return json(result);
});
