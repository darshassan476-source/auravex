import { bool, col, logActivity } from "@/server/db";
import { fail, json, readJson, withUser } from "@/server/http";
import { threadFromRow } from "@/server/site";

const STAGES = new Set(["new", "contacted", "qualified", "in-progress", "closed"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withUser<Ctx>(async (request, user, { params }) => {
  const { id } = await params;
  const body = await readJson<{ unread?: unknown; archived?: unknown; status?: unknown }>(request, 4_000);

  const threads = await col("threads");
  const row = await threads.findOne({ _id: id });
  if (!row) return fail(404, "That conversation no longer exists.");

  if (typeof body.unread === "boolean") {
    await threads.updateOne({ _id: id }, { $set: { unread: bool(body.unread) } });
  }
  if (typeof body.archived === "boolean") {
    await threads.updateOne({ _id: id }, { $set: { archived: bool(body.archived) } });
    await logActivity(user.name, "update", body.archived ? "archived the conversation with" : "restored the conversation with", String(row.name));
  }
  if (typeof body.status === "string" && STAGES.has(body.status)) {
    await threads.updateOne({ _id: id }, { $set: { status: body.status } });
    await logActivity(user.name, "update", `moved the lead to ${body.status}:`, String(row.name));
  }

  return json(await threadFromRow((await threads.findOne({ _id: id }))!));
});

export const DELETE = withUser<Ctx>(async (_request, user, { params }) => {
  const { id } = await params;
  const row = await (await col("threads")).findOneAndDelete({ _id: id });
  if (!row) return fail(404, "That conversation no longer exists.");
  // SQLite cascaded this through the foreign key; here it is explicit.
  await (await col("messages")).deleteMany({ thread_id: id });
  await logActivity(user.name, "delete", "deleted the conversation with", String(row.name ?? id));
  return json({ ok: true });
});
