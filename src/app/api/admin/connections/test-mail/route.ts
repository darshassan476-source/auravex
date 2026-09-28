import { mailSettings } from "@/server/appSecrets";
import { fail, isEmail, json, readJson, str, withUser } from "@/server/http";
import { sendMail } from "@/server/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sends one test message through the configured server, and says exactly what happened. */
export const POST = withUser(async (request, user) => {
  const body = await readJson<{ to?: unknown }>(request, 2_000).catch(() => ({}) as { to?: unknown });
  const to = str(body.to, 200) || (await mailSettings()).adminEmail || user.email;
  if (!isEmail(to)) return fail(400, "Give an address to send the test to.");
  const result = await sendMail({ to, subject: "AURAVEX test email", text: "Email delivery from your AURAVEX portal works. Replies to visitors and your own notifications will be sent this way." });
  return json({ ok: result.sent, to, reason: result.sent ? undefined : result.reason });
});
