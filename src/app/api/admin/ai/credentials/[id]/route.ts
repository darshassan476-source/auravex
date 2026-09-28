import { deleteCredential, listCredentials } from "@/server/ai";
import { logActivity } from "@/server/db";
import { fail, json, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DELETE = withUser<{ params: Promise<{ id: string }> }>(async (_request, user, { params }) => {
  const { id } = await params;
  const existing = (await listCredentials()).find((c) => c.id === id);
  if (!existing || !(await deleteCredential(id))) return fail(404, "That credential no longer exists.");
  await logActivity(user.name, "delete", "removed a credential", existing.name);
  return json({ ok: true });
});
