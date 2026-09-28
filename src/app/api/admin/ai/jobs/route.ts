import { ACTIVE_KINDS, MODEL_RATES, PERSONAS, type AuditPersona, type JobKind, type JobOptions } from "@/lib/aiJobs";
import { createJob, listCredentials, listJobs, listWatches, runQueuedJobs, studioStatus } from "@/server/ai";
import { logActivity } from "@/server/db";
import { fail, json, readJson, str, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A product lives on the public internet. The server's own machine and
 * network — and a cloud's metadata service above all — are not products,
 * and a browsing agent is never pointed at them unless the operator says so
 * (AURAVEX_ALLOW_INTERNAL_URLS=1, for a product running on the same box).
 */
function productHostAllowed(url: string) {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^\[|\]$/g, "");
  } catch {
    return false;
  }
  if (host === "metadata.google.internal" || host === "metadata" || /^169\.254\./.test(host) || host.startsWith("fd00:ec2")) return false;
  if (process.env.AURAVEX_ALLOW_INTERNAL_URLS === "1") return true;
  if (host === "localhost" || host.endsWith(".localhost") || host === "::1" || host === "0.0.0.0" || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host)) return false;
  if (/^(fc|fd)[0-9a-f]{2}:/.test(host) || host.startsWith("fe80:")) return false;
  return true;
}

export const GET = withUser(async () => {
  const [status, jobs, credentials, watches] = await Promise.all([studioStatus(), listJobs(), listCredentials(), listWatches()]);
  return json({ jobs, configured: status.provider !== "none", status, credentials, watches });
});

/** Queues a job and starts the runner; the job's progress is polled via GET. */
export const POST = withUser(async (request, user) => {
  const body = await readJson<{ kind?: unknown; title?: unknown; prompt?: unknown; model?: unknown; options?: Record<string, unknown> }>(
    request,
    50_000,
  );
  const kind = String(body.kind) as JobKind;
  if (!ACTIVE_KINDS.includes(kind)) return fail(400, "Unknown job kind.");

  const prompt = str(body.prompt, 20_000);
  const model = String(body.model ?? "claude-sonnet-5");
  if (!Object.hasOwn(MODEL_RATES, model)) return fail(400, "Unknown model.");

  const raw = body.options && typeof body.options === "object" ? body.options : {};
  const options: JobOptions = {};
  if (typeof raw.url === "string") options.url = raw.url.trim().slice(0, 500);
  if (typeof raw.credentialId === "string" && raw.credentialId) options.credentialId = raw.credentialId.slice(0, 64);
  if (raw.resolution === "4k" || raw.resolution === "1080p") options.resolution = raw.resolution;
  if (typeof raw.seconds === "number" && Number.isFinite(raw.seconds)) options.seconds = Math.min(60, Math.max(20, Math.round(raw.seconds)));
  if (typeof raw.productSlug === "string" && raw.productSlug) options.productSlug = raw.productSlug.slice(0, 80);
  if (typeof raw.musicMediaId === "string" && raw.musicMediaId) options.musicMediaId = raw.musicMediaId.slice(0, 64);
  if (raw.style === "showroom" || raw.style === "studio" || raw.style === "recording") options.style = raw.style;
  if (typeof raw.plateId === "string" && /^[a-z0-9-]{1,40}$/i.test(raw.plateId)) options.plateId = raw.plateId;
  if (PERSONAS.some((p) => p.value === raw.persona)) options.persona = raw.persona as AuditPersona;

  if (kind === "site-edit" && prompt.length < 4) return fail(400, "Say what you want changed.");
  if (kind !== "site-edit" && !/^https?:\/\//i.test(options.url ?? "")) return fail(400, "Give the product's address, starting with https://.");
  if (kind !== "site-edit" && !productHostAllowed(options.url ?? "")) return fail(400, "That address is inside this server's own network, not a product on the internet. Set AURAVEX_ALLOW_INTERNAL_URLS=1 if the product really runs there.");
  if (options.credentialId && !(await listCredentials()).some((c) => c.id === options.credentialId)) return fail(400, "That credential no longer exists.");

  const title =
    str(body.title, 120) ||
    (kind === "site-edit" ? prompt.slice(0, 72) : `${kind === "product-video" ? "Film" : kind === "product-audit" ? "Audit" : "Import"}: ${(options.url ?? "").replace(/^https?:\/\//, "").slice(0, 60)}`);
  const job = await createJob({ kind, title, prompt, model, options });
  await logActivity(user.name, "create", "queued the AI job", title);

  // Not awaited: the request returns at once and the runner carries on.
  void runQueuedJobs().catch((error) => console.error("[ai]", error));

  return json(job, { status: 201 });
});
