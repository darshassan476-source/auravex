import { changePassword, cookieOptions, createSession, findUserByEmail, verifyPassword } from "@/server/auth";
import { logActivity } from "@/server/db";
import { fail, json, readJson, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withUser(async (request, user) => {
  // The one admin action allowed while the demo password is still in force.
  const body = await readJson<{ current?: unknown; next?: unknown }>(request, 10_000);
  const current = typeof body.current === "string" ? body.current : "";
  const next = typeof body.next === "string" ? body.next : "";

  if (next.length < 10) return fail(400, "Use at least 10 characters.");
  if (next === current) return fail(400, "Choose a password you have not used here.");

  const row = await findUserByEmail(user.email);
  if (!row || !verifyPassword(current, String(row.password_hash))) {
    return fail(401, "The current password is wrong.");
  }

  await changePassword(user.id, next);
  await logActivity(user.name, "update", "changed the password for", user.email);

  // Every session was just revoked, including this one: issue a fresh one so
  // the device that changed the password stays signed in.
  const session = await createSession(user.id, request.headers.get("user-agent"));
  const response = json({ ok: true });
  response.cookies.set({ ...cookieOptions(session.expires, request), value: session.id });
  return response;
}, { whileMustChange: true });
