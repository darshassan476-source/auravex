import { approveJob, deleteJob, discardJob, getJob } from "@/server/ai";
import { logActivity } from "@/server/db";
import { fail, json, readJson, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withUser<Ctx>(async (_request, _user, { params }) => {
  const { id } = await params;
  const job = await getJob(id);
  return job ? json(job) : fail(404, "No such job.");
});

/** Approve or discard a job that is waiting for review. */
export const PATCH = withUser<Ctx>(async (request, user, { params }) => {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return fail(404, "No such job.");
  if (job.state !== "review") {
    return fail(409, "Only a job waiting for review can be approved or discarded.");
  }

  const body = await readJson<{ decision?: unknown }>(request, 2_000);
  if (body.decision !== "approve" && body.decision !== "discard") {
    return fail(400, "Decision must be approve or discard.");
  }

  // Discard genuinely puts the site back: every job keeps a ledger of what it changed.
  const updated = body.decision === "approve" ? await approveJob(id) : await discardJob(id);
  await logActivity(user.name, "update", `${body.decision === "approve" ? "approved" : "discarded"} the AI job`, job.title);
  return json(updated);
});

export const DELETE = withUser<Ctx>(async (_request, user, { params }) => {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return fail(404, "No such job.");
  // A job that has not written anything for ten minutes is stuck, not busy.
  const stale = Date.now() - Date.parse(job.updatedAt ?? job.createdAt) > 10 * 60_000;
  if (job.state === "running" && !stale) return fail(409, "Wait for the job to finish first.");
  await deleteJob(id);
  await logActivity(user.name, "delete", "deleted the AI job", job.title);
  return json({ ok: true });
});
