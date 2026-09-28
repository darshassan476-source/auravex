import { deleteWatch, listWatches, runWatch } from "@/server/ai";
import { logActivity } from "@/server/db";
import { fail, json, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Audit it now rather than waiting for the schedule. */
export const POST = withUser<Ctx>(async (_request, user, { params }) => {
  const { id } = await params;
  const job = await runWatch(id);
  if (!job) return fail(404, "No such watch.");
  await logActivity(user.name, "create", "ran a watched audit now", job.title);
  return json(job, { status: 201 });
});

export const DELETE = withUser<Ctx>(async (_request, user, { params }) => {
  const { id } = await params;
  const watch = (await listWatches()).find((w) => w.id === id);
  if (!watch || !(await deleteWatch(id))) return fail(404, "No such watch.");
  await logActivity(user.name, "delete", "stopped watching a product", watch.name);
  return json({ ok: true });
});
