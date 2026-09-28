import { getJob, replyToJob } from "@/server/ai";
import { fail, json, readJson, str, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Answers a question the agent asked, or asks a site-edit job for more on top
 * of what it did; either way the job carries on in the same conversation.
 */
export const POST = withUser<{ params: Promise<{ id: string }> }>(async (request, _user, { params }) => {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return fail(404, "No such job.");
  const asked = job.state === "review" && !!job.question;
  const continuable = (job.kind === "site-edit" || job.kind === "copy-rewrite") && (job.state === "review" || job.state === "done");
  if (!asked && !continuable) return fail(409, "That job cannot be continued.");

  const body = await readJson<{ message?: unknown }>(request, 20_000);
  const message = str(body.message, 5_000);
  if (message.length < 1) return fail(400, "Write an answer first.");

  const updated = await replyToJob(id, message);
  if (!updated) return fail(409, "That job cannot be continued right now.");
  return json(updated);
});
