import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { bool, col, now, uid } from "./db";

/**
 * Sessions and passwords.
 *
 * Passwords are scrypt-hashed with a per-user salt. Sessions are random ids
 * stored server-side and sent as an httpOnly cookie, so the browser never
 * holds anything a script could read. Expiry is enforced on every lookup.
 */

export const SESSION_COOKIE = "ax_session";
const SESSION_DAYS = 30;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChange: boolean;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/**
 * The first account. Taken from ADMIN_EMAIL / ADMIN_PASSWORD when set;
 * otherwise the demo credentials, flagged so the portal insists on a change.
 */
export async function seedAdmin() {
  const users = await col("users");
  if ((await users.countDocuments({}, { limit: 1 })) > 0) {
    await resetFromEnv();
    return;
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@auravex.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "auravex2024";
  const demo = !process.env.ADMIN_PASSWORD;

  const id = uid("u");
  try {
    await users.insertOne({
      _id: id,
      id,
      email,
      name: "Admin",
      role: "owner",
      password_hash: hashPassword(password),
      must_change: bool(demo),
      created_at: now(),
    });
  } catch (error) {
    // Two first requests raced; the unique email index let exactly one through.
    if ((error as { code?: number }).code === 11000) return;
    throw error;
  }

  if (demo) {
    console.warn(
      "[auth] No ADMIN_PASSWORD set — created the admin account with the demo password. Change it before going live.",
    );
  }
}

/**
 * Recovery for a lost password: with ADMIN_RESET=1 the account named by
 * ADMIN_EMAIL takes ADMIN_PASSWORD on start, every session is dropped, and
 * a warning asks for the flag to be removed again. Runs once per process.
 */
let resetDone = false;
async function resetFromEnv() {
  if (resetDone || process.env.ADMIN_RESET !== "1" || !process.env.ADMIN_PASSWORD) return;
  resetDone = true;
  const email = (process.env.ADMIN_EMAIL ?? "admin@auravex.com").trim().toLowerCase();
  const user = await (await col("users")).findOne({ email });
  if (!user) {
    console.warn(`[auth] ADMIN_RESET=1 but no account matches ${email}; nothing reset.`);
    return;
  }
  await changePassword(String(user.id), process.env.ADMIN_PASSWORD);
  console.warn(`[auth] Password for ${email} reset from .env. Remove ADMIN_RESET now.`);
}

/** True while the only account is still on the seeded demo password. */
export async function demoAccountActive() {
  const users = await col("users");
  const [n, m] = await Promise.all([
    users.countDocuments({}),
    users.countDocuments({ must_change: 1 }),
  ]);
  return n === 1 && m === 1;
}

export async function findUserByEmail(email: string) {
  return (await col("users")).findOne(
    { email: email.trim().toLowerCase() },
    { projection: { id: 1, email: 1, name: 1, role: 1, password_hash: 1, must_change: 1 } },
  );
}

export async function createSession(userId: string, ua: string | null, days = SESSION_DAYS) {
  const id = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + days * 86_400_000).toISOString();
  await (await col("sessions")).insertOne({
    _id: id,
    id,
    user_id: userId,
    expires_at: expires,
    created_at: now(),
    ua,
  });
  return { id, expires };
}

export async function destroySession(id: string) {
  await (await col("sessions")).deleteOne({ _id: id });
}

export async function sessionUser(sessionId: string | undefined): Promise<SessionUser | null> {
  if (!sessionId) return null;
  const session = await (await col("sessions")).findOne({ _id: sessionId });
  if (!session) return null;

  if (String(session.expires_at) < now()) {
    await destroySession(sessionId);
    return null;
  }

  const user = await (await col("users")).findOne({ _id: String(session.user_id) });
  if (!user) {
    // The account is gone; its sessions go with it, as the SQLite cascade did.
    await destroySession(sessionId);
    return null;
  }

  return {
    id: String(user.id),
    email: String(user.email),
    name: String(user.name),
    role: String(user.role),
    mustChange: Number(user.must_change) === 1,
  };
}

export async function changePassword(userId: string, password: string) {
  await (await col("users")).updateOne(
    { _id: userId },
    { $set: { password_hash: hashPassword(password), must_change: 0 } },
  );
  // Every other session is invalidated — a changed password should log
  // out any device that knew the old one.
  await (await col("sessions")).deleteMany({ user_id: userId });
}

/**
 * The session cookie. `Secure` follows the connection the request came in
 * on: an https deployment gets it, a plain-http LAN address does not — a
 * Secure cookie over http would be silently dropped by the browser and every
 * sign-in would appear to succeed and then vanish. With `persistent` false the
 * cookie lasts for the browser session only ("keep me signed in" unticked).
 */
export function cookieOptions(expires: string, request: Request, persistent = true) {
  let https = false;
  try {
    https = new URL(request.url).protocol === "https:";
  } catch {
    /* unreadable url — treat as http */
  }
  if (process.env.AURAVEX_TRUST_PROXY === "1" && request.headers.get("x-forwarded-proto") === "https") {
    https = true;
  }
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: https,
    path: "/",
    ...(persistent ? { expires: new Date(expires) } : {}),
  };
}

/** The user for the current request, or a 401 thrown as a Response. */
export async function requireUser(): Promise<SessionUser> {
  const jar = await cookies();
  const user = await sessionUser(jar.get(SESSION_COOKIE)?.value);
  if (!user) {
    throw new Response(JSON.stringify({ error: "Not signed in." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

export async function currentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  return sessionUser(jar.get(SESSION_COOKIE)?.value);
}
