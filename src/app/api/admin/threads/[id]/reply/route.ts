import { col, logActivity, now, uid } from "@/server/db";
import { fail, json, readJson, str, withUser } from "@/server/http";
import { sendMail } from "@/server/mail";
import { threadFromRow } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The operator's reply. Always stored; also emailed to the visitor when an
 * SMTP transport is configured, and the response says which happened.
 */
export const POST = withUser<{ params: Promise<{ id: string }> }>(
  async (request, user, { params }) => {
    const { id } = await params;
    const body = await readJson<{ body?: unknown }>(request, 20_000);
    const text = str(body.body, 10_000);
    if (!text) return fail(400, "Write something first.");

    const threads = await col("threads");
    const thread = await threads.findOne({ _id: id });
    if (!thread) return fail(404, "That conversation no longer exists.");

    const messageId = uid("m");
    await (await col("messages")).insertOne({
      _id: messageId,
      id: messageId,
      thread_id: id,
      sender: "me",
      body: text,
      at: now(),
    });
    // A first reply moves a fresh lead to "contacted" without a second click.
    await threads.updateOne({ _id: id }, [
      {
        $set: {
          unread: 0,
          status: { $cond: [{ $eq: [{ $ifNull: ["$status", "new"] }, "new"] }, "contacted", "$status"] },
        },
      },
    ]);
    await logActivity(user.name, "update", "replied to", String(thread.name));

    const mail = await sendMail({
      to: String(thread.email),
      subject: `Re: ${String(thread.subject ?? "Your enquiry")} — ${user.name}`,
      text,
    });

    return json({
      thread: await threadFromRow((await threads.findOne({ _id: id }))!),
      mail,
    });
  },
);
