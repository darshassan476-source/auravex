import { col, now, uid } from "@/server/db";
import { fail, guarded, isEmail, json, readJson, str, throttle } from "@/server/http";
import { notifyOperator } from "@/server/mail";
import { broadcast } from "@/server/push";
import type { EnquiryDetails } from "@/lib/enterprise";

const list = (v: unknown, max = 30) =>
  Array.isArray(v) ? v.filter((s) => typeof s === "string").slice(0, max).map((s) => str(s, 120)).filter(Boolean) : undefined;
const count = (v: unknown) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 && n <= 1_000_000 ? n : undefined;
};

/** Keeps only the known enquiry fields, each trimmed to size. */
function cleanDetails(raw: unknown): EnquiryDetails | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const d = raw as Record<string, unknown>;
  const out: EnquiryDetails = {
    path: d.path === "configure" ? "configure" : "consult",
    country: str(d.country, 80) || undefined,
    industry: str(d.industry, 120) || undefined,
    productSlug: /^[a-z0-9-]{1,80}$/.test(String(d.productSlug ?? "")) ? String(d.productSlug) : undefined,
    productName: str(d.productName, 120) || undefined,
    modules: list(d.modules),
    aiEnhancements: list(d.aiEnhancements),
    voiceAI: d.voiceAI === true || undefined,
    departments: count(d.departments),
    users: count(d.users),
    integrations: str(d.integrations, 2000) || undefined,
    workflows: str(d.workflows, 3000) || undefined,
    deployment: str(d.deployment, 60) || undefined,
    meetingRequested: d.meetingRequested === true || undefined,
    meetingTimes: str(d.meetingTimes, 500) || undefined,
    commercialProposal: d.commercialProposal === true || undefined,
  };
  return Object.fromEntries(
    Object.entries(out).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)),
  ) as EnquiryDetails;
}

/** The enquiry as plain text, for the inbox and the operator's email. */
function describe(d: EnquiryDetails): string {
  const lines = [
    d.path === "configure" ? "Configured solution enquiry" : "Direct consultation request",
    d.productName && `Product: ${d.productName}`,
    d.country && `Country: ${d.country}`,
    d.industry && `Industry: ${d.industry}`,
    d.modules?.length && `Optional modules: ${d.modules.join(", ")}`,
    d.aiEnhancements?.length && `AI enhancements: ${d.aiEnhancements.join(", ")}`,
    d.voiceAI && "Voice-to-voice AI: requested",
    d.departments && `Departments: ${d.departments}`,
    d.users && `Approximate users: ${d.users}`,
    d.deployment && `Deployment: ${d.deployment}`,
    d.integrations && `Integrations: ${d.integrations}`,
    d.workflows && `Custom workflows: ${d.workflows}`,
    d.commercialProposal && "Commercial proposal requested",
    d.meetingRequested && `Meeting requested${d.meetingTimes ? ` — preferred times: ${d.meetingTimes}` : ""}`,
  ];
  return lines.filter(Boolean).join(NL);
}

const NL = String.fromCharCode(10);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A visitor's enquiry becomes a thread in the portal inbox. */
export const POST = guarded(async (request) => {
  if (!throttle(request, "contact", 6, 60, 10 * 60_000)) {
    return fail(429, "Too many messages from this connection. Please try again later.");
  }
  const body = await readJson<Record<string, unknown>>(request, 20_000);
  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();
  const company = str(body.company, 120) || null;
  const subject = str(body.subject, 160) || null;
  const notes = str(body.body, 5_000);
  const details = cleanDetails(body.details);

  if (name.length < 2) return fail(400, "Please tell us your name.");
  if (!isEmail(email)) return fail(400, "That email address does not look right.");
  if (details && !company) return fail(400, "Please tell us your company name.");
  // A structured enquiry says enough by itself; a plain message needs some substance.
  if (!details && notes.length < 10) return fail(400, "Please say a little more about what you need.");
  const message = details
    ? [describe(details), notes && `Notes:${NL}${notes}`].filter(Boolean).join(NL + NL)
    : notes;

  const threadId = uid("t");
  const at = now();
  await (await col("threads")).insertOne({
    _id: threadId,
    id: threadId,
    name,
    email,
    company,
    subject,
    unread: 1,
    archived: 0,
    status: "new",
    created_at: at,
    ...(details ? { details: JSON.stringify(details) } : {}),
  });
  const messageId = uid("m");
  await (await col("messages")).insertOne({
    _id: messageId,
    id: messageId,
    thread_id: threadId,
    sender: "them",
    body: message,
    at,
  });

  // Tell the operator; neither channel is allowed to fail the request.
  void broadcast({
    title: details?.meetingRequested ? `Meeting request from ${name}` : `New enquiry from ${name}`,
    body: [company, subject].filter(Boolean).join(" · ") || message.slice(0, 120),
    url: "/admin/messages",
    tag: threadId,
  }).catch(() => undefined);
  void notifyOperator({
    subject: `New enquiry from ${name}${company ? ` (${company})` : ""}`,
    text: `${name} <${email}>\n${subject ? `Interest: ${subject}\n` : ""}\n${message}`,
  });

  return json({ id: threadId }, { status: 201 });
});
