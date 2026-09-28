import { flushSiteChanges, rememberOrigin } from "./siteTag";
import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser, type SessionUser } from "./auth";

/** JSON response with sane defaults. */
export function json(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, { ...init, headers: { "Cache-Control": "no-store", ...(init.headers ?? {}) } });
}

export function fail(status: number, message: string) {
  return json({ error: message }, { status });
}

/**
 * Reads a body as text, stopping — and refusing — the moment it passes
 * `maxBytes`, so a chunked upload cannot fill memory before the check.
 */
export async function readBody(request: Request, maxBytes: number): Promise<string> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw fail(413, "Request body is too large.");
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw fail(413, "Request body is too large.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Parses a JSON object body; anything else is a 4xx, never a crash. */
export async function readJson<T>(request: Request, maxBytes = 1_000_000): Promise<T> {
  const type = request.headers.get("content-type") ?? "";
  if (!/^application\/json\b/i.test(type)) {
    throw fail(415, "Send the body as application/json.");
  }
  const text = await readBody(request, maxBytes);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw fail(400, "Body must be valid JSON.");
  }
  // Every handler destructures fields, so `null`, numbers and arrays are refused here.
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw fail(400, "Body must be a JSON object.");
  }
  return parsed as T;
}

type Handler<Ctx> = (request: Request, user: SessionUser, ctx: Ctx) => Promise<Response> | Response;

/**
 * Wraps an admin route: verifies the session, then runs the handler. A thrown
 * `Response` (from `fail`) is returned as-is; anything else becomes a 500 with
 * the message logged, not leaked.
 *
 * An account still on the seeded demo password may do nothing except change
 * it — the one route that passes `whileMustChange`.
 */
export function withUser<Ctx = unknown>(handler: Handler<Ctx>, options: { whileMustChange?: boolean } = {}) {
  return async (request: Request, ctx: Ctx): Promise<Response> => {
    try {
      rememberOrigin(request);
      flushSiteChanges();
      if (isCrossSite(request)) return fail(403, "Cross-site requests are not accepted.");
      const user = await requireUser();
      if (user.mustChange && !options.whileMustChange) {
        return json({ error: "Change the demo password first.", mustChange: true }, { status: 403 });
      }
      return await handler(request, user, ctx);
    } catch (error) {
      if (error instanceof Response) return error;
      console.error("[api]", error);
      return fail(500, "Something went wrong on the server.");
    }
  };
}

/** Same, for public routes — no session, same error discipline. */
export function guarded<Ctx = unknown>(
  handler: (request: Request, ctx: Ctx) => Promise<Response> | Response,
) {
  return async (request: Request, ctx: Ctx): Promise<Response> => {
    try {
      rememberOrigin(request);
      flushSiteChanges();
      return await handler(request, ctx);
    } catch (error) {
      if (error instanceof Response) return error;
      console.error("[api]", error);
      return fail(500, "Something went wrong on the server.");
    }
  };
}

/** Hosts named in AURAVEX_ALLOWED_ORIGINS (e.g. the Netlify site) that proxy to this API. */
function allowedOrigins() {
  const list = process.env.AURAVEX_ALLOWED_ORIGINS?.split(",") ?? [];
  return new Set(
    list
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        try {
          return new URL(entry.includes("://") ? entry : `https://${entry}`).host;
        } catch {
          return entry;
        }
      }),
  );
}

/**
 * Belt and braces over the SameSite cookie: a browser that says the request
 * came from another site is refused before the session is even looked at.
 */
function isCrossSite(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    // The frontend deployment proxies the API here from its own origin.
    if (allowedOrigins().has(host)) return false;
    return host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

/**
 * The caller's address as far as it can be known. Forwarding headers are
 * only believed when AURAVEX_TRUST_PROXY=1 says a proxy in front sets them;
 * otherwise anyone could pick their own address.
 */
export function clientAddress(request: Request) {
  if (process.env.AURAVEX_TRUST_PROXY === "1") {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      // Each trusted proxy appends the address it saw; earlier hops are hearsay.
      // AURAVEX_PROXY_HOPS counts the trusted proxies (2 behind Netlify + Render).
      const hops = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
      const trusted = Math.max(1, Number(process.env.AURAVEX_PROXY_HOPS) || 1);
      if (hops.length) return hops[Math.max(0, hops.length - trusted)];
    }
    const real = request.headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return "direct";
}

/**
 * A privacy-preserving visitor key: the address is hashed with the day, so
 * repeat views on one day group together and nothing identifies a person
 * across days.
 */
export function visitorHash(request: Request) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${clientAddress(request)}|${day}|auravex`).digest("hex").slice(0, 24);
}

/* ---------------- Rate limiting ---------------- */

/**
 * A public-route throttle that knows whether it can tell callers apart.
 * Behind a trusted proxy each address gets `perClient`; reached directly,
 * every caller looks the same, so one shared window of `shared` applies
 * instead of punishing all visitors with a single client's budget.
 */
export function throttle(request: Request, bucket: string, perClient: number, shared: number, windowMs: number) {
  const known = clientAddress(request) !== "direct";
  return rateLimit(bucket, known ? visitorHash(request) : "*", known ? perClient : shared, windowMs);
}

declare global {
  var __auravexBuckets: Map<string, { count: number; resetAt: number }> | undefined;
}

const buckets = () => (globalThis.__auravexBuckets ??= new Map());
const MAX_BUCKETS = 10_000;

/**
 * Fixed-window counter: `max` hits per `windowMs` for `bucket:key`. Returns
 * false once the window is full. With `consume` false it only asks whether
 * the window has room, so a caller can count failures alone. Expired windows
 * are swept as they are met, and the table is capped so it cannot grow
 * without bound.
 */
export function rateLimit(bucket: string, key: string, max: number, windowMs: number, consume = true): boolean {
  const table = buckets();
  const nowMs = Date.now();
  const id = `${bucket}:${key}`;
  const entry = table.get(id);

  if (!entry || entry.resetAt <= nowMs) {
    if (!consume) return true;
    if (table.size >= MAX_BUCKETS) {
      for (const [k, v] of table) if (v.resetAt <= nowMs) table.delete(k);
      if (table.size >= MAX_BUCKETS) table.clear();
    }
    table.set(id, { count: 1, resetAt: nowMs + windowMs });
    return true;
  }
  if (!consume) return entry.count < max;
  entry.count += 1;
  return entry.count <= max;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL.test(value.trim());
}

export function str(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
