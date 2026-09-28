import { cookieOptions, createSession, findUserByEmail, seedAdmin, verifyPassword } from "@/server/auth";
import { logActivity } from "@/server/db";
import { clientAddress, fail, guarded, json, rateLimit, readJson, str, visitorHash } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Guessing is throttled three ways, none of which a client can dodge by
 * changing headers: per client, per account, and across the whole server.
 * Only failures count, so signing in often is never penalised.
 */
const WINDOW = 15 * 60_000;
const PER_CLIENT = 8;
// Reached directly, every caller shares one client window; keep it wider.
const SHARED_CLIENTS = 40;
// Wider than the per-client limit on purpose: a stranger must not be able
// to lock the operator out with a dozen wrong guesses.
const PER_ACCOUNT = 30;
const GLOBAL = 200;

export const POST = guarded(async (request) => {
  await seedAdmin();

  const body = await readJson<{ email?: unknown; password?: unknown; remember?: unknown }>(request, 10_000);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const remember = body.remember !== false;
  if (!email || !password) return fail(400, "Email and password are required.");

  const who = visitorHash(request);
  const perClient = clientAddress(request) === "direct" ? SHARED_CLIENTS : PER_CLIENT;
  const room =
    rateLimit("login:client", who, perClient, WINDOW, false) &&
    rateLimit("login:account", email, PER_ACCOUNT, WINDOW, false) &&
    rateLimit("login:all", "*", GLOBAL, WINDOW, false);
  if (!room) return fail(429, "Too many attempts. Try again in a few minutes.");

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, String(user.password_hash))) {
    rateLimit("login:client", who, perClient, WINDOW);
    rateLimit("login:account", email, PER_ACCOUNT, WINDOW);
    rateLimit("login:all", "*", GLOBAL, WINDOW);
    // A small constant delay makes timing uninformative.
    await new Promise((resolve) => setTimeout(resolve, 350));
    return fail(401, "Those credentials do not match an account.");
  }

  const session = await createSession(String(user.id), request.headers.get("user-agent"), remember ? 30 : 1);
  await logActivity(String(user.name), "login", "signed in from", str(request.headers.get("user-agent"), 80) || "an unknown browser");
  const response = json({
    user: {
      id: String(user.id),
      email: String(user.email),
      name: String(user.name),
      role: String(user.role),
      mustChange: Number(user.must_change) === 1,
    },
  });
  response.cookies.set({ ...cookieOptions(session.expires, request, remember), value: session.id });
  return response;
});
