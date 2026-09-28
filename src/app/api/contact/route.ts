import { col, now, uid } from "@/server/db";
import { fail, guarded, isEmail, json, readJson, str, throttle } from "@/server/http";
import { notifyOperator } from "@/server/mail";
import { broadcast } from "@/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A visitor's enquiry becomes a thread in the portal inbox. */
export const POST = guarded(async (request) => {
  if (!throttle(request, "contact", 6, 60, 10 * 60_000)) {
    return fail(429, "Too many messages from this connection. Please try again later.");
  }
  const body = await readJson<Record<string, unknown>>(request, 20_000);
  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();
  const company = str(body.company, 120) || null;
  const subject = str(body.subject, 160) || null;
  const message = str(body.body, 5_000);

  if (name.length < 2) return fail(400, "Please tell us your name.");
  if (!isEmail(email)) return fail(400, "That email address does not look right.");
  if (message.length < 10) return fail(400, "Please say a little more about what you need.");

  const threadId = uid("t");
  const at = now();
  await (await col("threads")).insertOne({
    _id: threadId,
    id: threadId,
    name,
    email,
    company,
    subject,
    unread: 1,
    archived: 0,
    status: "new",
    created_at: at,
  });
  const messageId = uid("m");
  await (await col("messages")).insertOne({
    _id: messageId,
    id: messageId,
    thread_id: threadId,
    sender: "them",
    body: message,
    at,
  });

  // Tell the operator; neither channel is allowed to fail the request.
  void broadcast({
    title: `New enquiry from ${name}`,
    body: [company, subject].filter(Boolean).join(" · ") || message.slice(0, 120),
    url: "/admin/messages",
    tag: threadId,
  }).catch(() => undefined);
  void notifyOperator({
    subject: `New enquiry from ${name}${company ? ` (${company})` : ""}`,
    text: `${name} <${email}>\n${subject ? `Interest: ${subject}\n` : ""}\n${message}`,
  });

  return json({ id: threadId }, { status: 201 });
});
