import "server-only";
import type { ContentBlockParam, MessageParam, Tool, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages/messages";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PRODUCTS } from "@/data/products";
import { SITE } from "@/data/site";
import {
  costOf,
  PERSONAS,
  type AiWatch,
  type AuditPersona,
  type AuditChecks,
  type AuditIssue,
  type AuditReport,
  type AuditScore,
  type FilmStyle,
  type AiJob,
  type CredentialSummary,
  type JobArtifacts,
  type JobKind,
  type JobOptions,
  type JobState,
  type JobStep,
  type StudioStatus,
} from "@/lib/aiJobs";
import type { Product } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Browser, FatalError, chromePath, type Digest, type Evidence, type PageFacts } from "./agent/browser";
import { provider, providerName, type CompleteRequest, type ToolCall } from "./agent/model";
import { Ledger, catalogue, siteOverview, siteTools } from "./agent/siteTools";
import { DATA_DIR, col, getSetting, logActivity, now, uid } from "./db";
import { ffmpegPath, fontFiles, renderFilm, type Resolution } from "./film/render";
import { totalSeconds, type Shot, type StageManifest } from "./film/stage";
import { notifyOperator } from "./mail";
import { broadcast } from "./push";
import { classifyField, seal, unseal } from "./secrets";
import { applySettings, deleteMedia, mediaLocalPath, saveMedia } from "./site";
import { refreshSite, siteChanged } from "./siteTag";

/**
 * The job runner behind AI Studio.
 *
 * Three kinds of work, all recorded step by step as they happen:
 *
 *   site-edit      — the model works the site's own tools (copy, backgrounds,
 *                    colours, products, blocks). Every write is ledgered, so
 *                    Discard puts the site back exactly.
 *   product-video  — the browser agent signs in with a stored credential,
 *                    walks the product and captures its real screens; the
 *                    model writes the shot list; the film is composed on a
 *                    photographed set and encoded at 1080p or 4K.
 *   product-import — the same walk, ending in a catalogue entry with the
 *                    captured screens as its images.
 */

const FILM_DIR = path.join(DATA_DIR, "films");
const SITE_DOMAIN = "auravex.com";

/* ---------------- Rows ---------------- */

const parse = <T>(value: unknown, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
};

export function jobFromRow(row: Record<string, unknown>): AiJob {
  const conversation = parse<MessageParam[]>(row.conversation, []);
  return {
    id: String(row.id),
    kind: String(row.kind) as JobKind,
    title: String(row.title),
    prompt: String(row.prompt),
    state: String(row.state) as JobState,
    model: String(row.model),
    tokens: {
      input: Number(row.tokens_in),
      output: Number(row.tokens_out),
      cached: Number(row.tokens_cached) || undefined,
    },
    // Priced from the stored usage at today's rates, so a rate correction reaches old jobs too.
    cost: costOf(String(row.model), { input: Number(row.tokens_in) || 0, output: Number(row.tokens_out) || 0, cached: Number(row.tokens_cached) || 0 }),
    steps: parse<JobStep[]>(row.steps, []),
    output: row.output ? parse<AiJob["output"]>(row.output, undefined) : undefined,
    error: row.error ? String(row.error) : undefined,
    createdAt: String(row.created_at),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    finishedAt: row.finished_at ? String(row.finished_at) : undefined,
    options: row.options ? parse<JobOptions>(row.options, {}) : undefined,
    artifacts: row.artifacts ? parse<JobArtifacts>(row.artifacts, {}) : undefined,
    question: row.question ? String(row.question) : undefined,
    turns: conversation.filter((m) => m.role === "assistant").length || undefined,
  };
}

export async function listJobs(): Promise<AiJob[]> {
  const rows = await (await col("ai_jobs")).find({}).sort({ created_at: -1 }).limit(200).toArray();
  return rows.map(jobFromRow);
}

export async function getJob(id: string): Promise<AiJob | null> {
  const row = await (await col("ai_jobs")).findOne({ _id: id });
  return row ? jobFromRow(row) : null;
}

export async function createJob(input: { kind: JobKind; title: string; prompt: string; model: string; options?: JobOptions }): Promise<AiJob> {
  const id = uid("j");
  await (await col("ai_jobs")).insertOne({
    _id: id,
    id,
    kind: input.kind,
    title: input.title,
    prompt: input.prompt,
    state: "queued",
    model: input.model,
    tokens_in: 0,
    tokens_out: 0,
    tokens_cached: 0,
    cost: 0,
    steps: "[]",
    output: null,
    error: null,
    options: JSON.stringify(input.options ?? {}),
    conversation: null,
    ledger: null,
    artifacts: null,
    question: null,
    created_at: now(),
    updated_at: null,
    finished_at: null,
  });
  return (await getJob(id))!;
}

export async function setJobState(id: string, state: JobState) {
  const at = now();
  const finished = state === "done" || state === "failed" || state === "discarded";
  await (await col("ai_jobs")).updateOne({ _id: id }, { $set: { state, updated_at: at, ...(finished ? { finished_at: at } : {}) } });
}

export async function deleteJob(id: string) {
  await (await col("ai_jobs")).deleteOne({ _id: id });
  removeWorkDir(id);
}

/** The scratch space a browsing job films in; the media library keeps what matters. */
function removeWorkDir(id: string) {
  try {
    rmSync(path.join(FILM_DIR, id), { recursive: true, force: true });
  } catch {
    /* a locked file is tidied on the next delete */
  }
}

async function patchJob(id: string, patch: Record<string, string | number | null>) {
  if (!Object.keys(patch).length) return;
  await (await col("ai_jobs")).updateOne({ _id: id }, { $set: { ...patch, updated_at: now() } });
}

/** Puts the site back to what it was before the job, where nothing else has changed it since. */
async function revertJob(id: string): Promise<{ restored: boolean; kept: string[] }> {
  const row = await (await col("ai_jobs")).findOne({ _id: id }, { projection: { ledger: 1 } });
  const ledger = Ledger.read(parse<unknown>(row?.ledger, null));
  if (!ledger) return { restored: false, kept: [] };
  const result = await Ledger.revert(ledger);
  await patchJob(id, { ledger: null });
  if (result.restored.length) siteChanged();
  return { restored: result.restored.length > 0, kept: result.kept };
}

const keptNote = (kept: string[]) => (kept.length ? ` ${kept.join(", ")} changed again after this job, so that was left as it is now.` : "");

/** Puts back everything a job changed, drops what it published, then marks it discarded. */
export async function discardJob(id: string): Promise<AiJob | null> {
  const job = await getJob(id);
  if (!job) return null;
  const undone = await revertJob(id);
  // Media the job made only exists because of the job; a discarded job leaves none behind.
  const made = [job.artifacts?.videoId, job.artifacts?.posterId, ...(job.artifacts?.screens ?? []).map((s) => s.id)].filter(Boolean) as string[];
  for (const mediaId of made) await deleteMedia(mediaId);
  if (made.length) {
    // The panel must not point at media or pages that no longer exist.
    const rest: JobArtifacts = { changes: job.artifacts?.changes, seconds: job.artifacts?.seconds, width: job.artifacts?.width, height: job.artifacts?.height };
    if (job.kind === "product-video") rest.productSlug = job.artifacts?.productSlug;
    await patchJob(id, { artifacts: JSON.stringify(rest) });
    siteChanged();
  }
  if (undone.kept.length && job.output) {
    await patchJob(id, { output: JSON.stringify({ ...job.output, summary: `${job.output.summary}${keptNote(undone.kept)}` }) });
  }
  await patchJob(id, { question: null });
  await setJobState(id, "discarded");
  return getJob(id);
}

export async function approveJob(id: string): Promise<AiJob | null> {
  // Kept means kept: what the job changed so far is no longer its to undo.
  await patchJob(id, { question: null, ledger: null });
  await setJobState(id, "done");
  return getJob(id);
}

/** Answers the agent's question; the job re-enters the queue and continues. */
export async function replyToJob(id: string, message: string): Promise<AiJob | null> {
  const jobs = await col("ai_jobs");
  const row = await jobs.findOne({ _id: id }, { projection: { conversation: 1 } });
  if (!row) return null;
  const conversation = parse<MessageParam[]>(row.conversation, []);
  conversation.push({ role: "user", content: message });
  // One reply at a time: the job must still be waiting when the reply lands, or it is refused.
  const changed = await jobs.updateOne(
    { _id: id, state: { $in: ["review", "done"] } },
    { $set: { conversation: JSON.stringify(conversation), question: null, state: "queued", updated_at: now() } },
  );
  if (!changed.matchedCount) return null;
  void runQueuedJobs().catch((error) => console.error("[ai]", error));
  return getJob(id);
}

/* ---------------- Credentials ---------------- */

export async function listCredentials(): Promise<CredentialSummary[]> {
  const rows = await (await col("credentials"))
    .find({}, { projection: { id: 1, name: 1, host: 1, field_names: 1, created_at: 1, last_used_at: 1 } })
    .sort({ created_at: -1 })
    .toArray();
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    host: String(row.host),
    fields: parse<string[]>(row.field_names, []),
    createdAt: String(row.created_at),
    lastUsedAt: row.last_used_at ? String(row.last_used_at) : undefined,
  }));
}

export async function createCredential(input: { name: string; host: string; fields: Record<string, string> }): Promise<CredentialSummary> {
  const id = uid("c");
  await (await col("credentials")).insertOne({
    _id: id,
    id,
    name: input.name,
    host: input.host,
    field_names: JSON.stringify(Object.keys(input.fields)),
    sealed: seal(JSON.stringify(input.fields)),
    created_at: now(),
    last_used_at: null,
  });
  return (await listCredentials()).find((c) => c.id === id)!;
}

export async function deleteCredential(id: string): Promise<boolean> {
  return (await (await col("credentials")).deleteOne({ _id: id })).deletedCount > 0;
}

async function openCredential(id: string): Promise<{ fields: Record<string, string>; names: string[]; host: string }> {
  const credentials = await col("credentials");
  const row = await credentials.findOne({ _id: id }, { projection: { sealed: 1, host: 1 } });
  if (!row) throw new Error("That credential no longer exists.");
  await credentials.updateOne({ _id: id }, { $set: { last_used_at: now() } });
  const fields = JSON.parse(unseal(String(row.sealed))) as Record<string, string>;
  return { fields, names: Object.keys(fields), host: String(row.host ?? "") };
}

/** app.example.com -> example.com; app.example.co.uk -> example.co.uk; an IP or bare name is itself. */
function registrableDomain(host: string): string {
  if (/^[\d.]+$/.test(host) || host.includes(":")) return host;
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  const secondLevel = /^(co|com|org|net|gov|edu|ac)$/.test(parts[parts.length - 2]) && parts[parts.length - 1].length === 2;
  return parts.slice(secondLevel ? -3 : -2).join(".");
}

/* ---------------- Status ---------------- */

export async function studioStatus(): Promise<StudioStatus> {
  let chrome = false;
  let ffmpeg = false;
  try {
    chromePath();
    chrome = true;
  } catch {
    /* absent */
  }
  try {
    ffmpegPath();
    ffmpeg = true;
  } catch {
    /* absent */
  }
  return { provider: await providerName(), chrome, ffmpeg };
}

/* ---------------- Running ---------------- */

declare global {
  var __auravexAiBusy: boolean | undefined;
}

/** Runs queued jobs one at a time; safe to call from any request. */
export async function runQueuedJobs() {
  if (globalThis.__auravexAiBusy) return;
  globalThis.__auravexAiBusy = true;
  try {
    const jobs = await col("ai_jobs");
    for (;;) {
      const next = await jobs.find({ state: "queued" }).sort({ created_at: 1 }).limit(1).next();
      if (!next) break;
      await runJob(jobFromRow(next));
    }
  } finally {
    globalThis.__auravexAiBusy = false;
  }
}

/**
 * After a restart nothing is running any more, whatever the rows say. Jobs
 * caught mid-flight are failed with a plain reason; queued ones are resumed.
 */
export async function recoverInterruptedJobs() {
  const jobs = await col("ai_jobs");
  const running = await jobs.find({ state: "running" }, { projection: { id: 1 } }).toArray();
  for (const row of running) {
    const undone = await revertJob(String(row.id));
    await jobs.updateOne(
      { _id: String(row.id) },
      {
        $set: {
          state: "failed",
          error: `Interrupted by a server restart.${undone.restored ? ` Its changes were put back.${keptNote(undone.kept)}` : ""} Run it again.`,
          finished_at: now(),
          updated_at: now(),
        },
      },
    );
  }
  globalThis.__auravexAiBusy = false;
  void runQueuedJobs().catch((error) => console.error("[ai]", error));
}

class Steps {
  private list: JobStep[];
  private started = 0;
  /** Writes land in the order they were made, even when a caller does not wait for one. */
  private writing: Promise<void> = Promise.resolve();
  constructor(private id: string, existing: JobStep[] = []) {
    this.list = existing;
  }
  begin(label: string) {
    this.list.push({ label, state: "running" });
    this.started = Date.now();
    return this.flush();
  }
  detail(text: string) {
    const last = this.list[this.list.length - 1];
    if (last) last.detail = text;
    return this.flush();
  }
  done(detail?: string) {
    const last = this.list[this.list.length - 1];
    if (last) {
      last.state = "done";
      if (detail !== undefined) last.detail = detail;
      last.seconds = Math.max(1, Math.round((Date.now() - this.started) / 1000));
    }
    return this.flush();
  }
  fail(detail: string) {
    const last = this.list[this.list.length - 1];
    if (last && last.state === "running") {
      last.state = "failed";
      last.detail = detail;
    } else {
      this.list.push({ label: "Stopped", state: "failed", detail });
    }
    return this.flush();
  }
  private flush(): Promise<void> {
    const steps = JSON.stringify(this.list);
    const write = this.writing.then(() => patchJob(this.id, { steps }));
    this.writing = write.catch(() => undefined);
    return write;
  }
}

/** Pulls the first JSON object out of a model reply, tolerating prose around it. */
function extractJson<T>(text: string): T | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/** Images are dropped from the stored transcript; they are large and only the model needed them. */
function slim(messages: MessageParam[]): MessageParam[] {
  return messages.map((m) => {
    if (typeof m.content === "string") return m;
    return {
      ...m,
      content: m.content.map((block) => {
        if (block.type === "tool_result" && Array.isArray(block.content)) {
          return { ...block, content: block.content.filter((c) => c.type === "text") };
        }
        return block;
      }) as ContentBlockParam[],
    };
  });
}

interface AgentRun {
  job: AiJob;
  task: CompleteRequest["task"];
  system: string;
  messages: MessageParam[];
  tools: Tool[];
  run: (call: ToolCall) => Promise<string | ContentBlockParam[]>;
  maxTurns: number;
  record: (usage: { input: number; output: number; cached: number }) => Promise<void>;
}

/** The loop every agent shares: ask the model, do what it asked, tell it what happened. */
async function runAgent(a: AgentRun): Promise<{ text: string; messages: MessageParam[]; finished: boolean }> {
  const p = await provider();
  for (let turn = 0; turn < a.maxTurns; turn++) {
    const res = await p.complete({ model: a.job.model, system: a.system, messages: a.messages, tools: a.tools, task: a.task, session: a.job.id });
    await a.record(res.usage);
    if (res.calls.length === 0) {
      // Its closing words (often a question) stay in the transcript, so a reply resumes in context.
      if (res.text.trim()) a.messages.push({ role: "assistant", content: res.content });
      return { text: res.text, messages: a.messages, finished: false };
    }

    // The turn goes back exactly as it came: the API requires its own blocks (thinking included) intact.
    a.messages.push({ role: "assistant", content: res.content });

    const results: ToolResultBlockParam[] = [];
    let finished = false;
    for (const call of res.calls) {
      let content: string | ContentBlockParam[];
      let isError = false;
      try {
        content = await a.run(call);
      } catch (error) {
        // The browser going away is not something the model can work around.
        if (error instanceof FatalError) throw error;
        content = `Error: ${error instanceof Error ? error.message : String(error)}`;
        isError = true;
      }
      results.push({
        type: "tool_result",
        tool_use_id: call.id,
        content: typeof content === "string" ? content : (content as ToolResultBlockParam["content"]),
        ...(isError ? { is_error: true } : {}),
      });
      if (call.name === "finish") finished = true;
    }
    a.messages.push({ role: "user", content: results });
    if (finished) return { text: res.text, messages: a.messages, finished: true };
  }
  throw new Error(`The agent used all ${a.maxTurns} turns without finishing.`);
}

async function runJob(job: AiJob) {
  await setJobState(job.id, "running");
  await patchJob(job.id, { error: null });
  // A job resuming after a question keeps the steps it already has.
  const steps = new Steps(job.id, job.turns ? job.steps : []);
  const base = { input: job.tokens.input ?? 0, output: job.tokens.output ?? 0, cached: job.tokens.cached ?? 0 };
  let input = 0;
  let output = 0;
  let cached = 0;
  const record = async (u: { input: number; output: number; cached: number }) => {
    input += u.input;
    output += u.output;
    cached += u.cached;
    await patchJob(job.id, {
      tokens_in: base.input + input,
      tokens_out: base.output + output,
      tokens_cached: base.cached + cached,
      cost: costOf(job.model, { input: base.input + input, output: base.output + output, cached: base.cached + cached }),
    });
  };

  try {
    if (job.kind === "site-edit" || job.kind === "copy-rewrite") await runSiteEdit(job, steps, record);
    else if (job.kind === "product-audit") await runProductAudit(job, steps, record);
    else if (job.kind === "product-video") await runProductVideo(job, steps, record);
    else if (job.kind === "product-import") await runProductImport(job, steps, record);
    else throw new Error("This kind of job is no longer offered.");
  } catch (error) {
    let message = error instanceof Error ? error.message : String(error);
    const undone = await revertJob(job.id);
    if (undone.restored) message += ` The changes it had made were put back.${keptNote(undone.kept)}`;
    await steps.fail(message);
    await patchJob(job.id, { error: message });
    await setJobState(job.id, "failed");
  }
}

/* ---------------- Site changes ---------------- */

const SITE_SYSTEM = `You operate the AURAVEX website for its owner through tools. You change copy, backgrounds, colours, products and page blocks on request.
Rules:
- Read the overview first if you need ids; act with tools, do not describe what you would do.
- Change only what was asked. Keep the site's voice: confident, plain, no hype, no invented facts, names or numbers.
- If the request is ambiguous in a way that would change the result, ask one short question instead of guessing (reply with text only, no tool calls).
- When finished, reply with one or two sentences saying exactly what changed. The owner can revert the whole job with one click.`;

async function runSiteEdit(job: AiJob, steps: Steps, record: AgentRun["record"]) {
  await steps.begin("Read the site");
  const overview = await siteOverview();
  await steps.done(`${(await catalogue()).length} products, ${overview.split("\n").length} lines of context`);

  // Earlier runs of this conversation are kept apart from this run's own entries,
  // so a continuation that fails can undo only what it did.
  const row = await (await col("ai_jobs")).findOne({ _id: job.id }, { projection: { ledger: 1, conversation: 1 } });
  const previous = (Ledger.read(parse<unknown>(row?.ledger, null))?.entries ?? []).filter((e) => e.sub);
  const ledger = new Ledger();
  const stored = async () => JSON.stringify({ v: 2, entries: [...previous, ...(await ledger.record()).entries] });
  const messages = parse<MessageParam[]>(row?.conversation, []);
  if (messages.length === 0) messages.push({ role: "user", content: job.prompt });

  const { tools, run } = siteTools(ledger);
  await steps.begin("Work the site");
  let calls = 0;
  let result: Awaited<ReturnType<typeof runAgent>>;
  try {
    result = await runAgent({
      job,
      task: "site",
      system: `${SITE_SYSTEM}\n\nSITE OVERVIEW\n${overview}`,
      messages,
      tools,
      maxTurns: 12,
      record,
      run: async (call) => {
        calls += 1;
        try {
          return await run(call.name, call.input);
        } finally {
          // Saved after every call, so an interrupted job can still be put back.
          await patchJob(job.id, { ledger: await stored() });
          await steps.detail(`${calls} tool call${calls === 1 ? "" : "s"} · last: ${call.name}`);
        }
      },
    });
  } catch (error) {
    if (!previous.length) throw error;
    // A continuation that fails undoes only its own work; the earlier turns stay as they were,
    // still waiting for Keep or Discard, and the owner is told what stopped.
    const message = error instanceof Error ? error.message : String(error);
    await Ledger.revert({ v: 2, entries: (await ledger.record()).entries });
    await patchJob(job.id, { ledger: JSON.stringify({ v: 2, entries: previous }), error: `${message} Your earlier changes are still in place.` });
    await refreshSite();
    await steps.fail(message);
    await setJobState(job.id, "review");
    return;
  }
  await steps.done(ledger.touched.length ? `${ledger.touched.length} change${ledger.touched.length === 1 ? "" : "s"}` : "no changes");

  await patchJob(job.id, { conversation: JSON.stringify(slim(result.messages)), ledger: await stored() });

  const earlier = job.artifacts?.changes ?? [];
  const asked = /\?\s*$/.test(result.text.trim());

  if (ledger.touched.length) {
    await refreshSite([{ path: "/" }]);
    await patchJob(job.id, {
      output: JSON.stringify({ kind: "patch", summary: result.text || `${ledger.touched.length} change(s) applied.` }),
      artifacts: JSON.stringify({ changes: [...earlier, ...ledger.touched] } satisfies JobArtifacts),
      question: null,
    });
    await setJobState(job.id, "review");
    return;
  }

  if (previous.length) {
    // Nothing changed this run, but earlier turns' changes are still live and waiting for Keep or Discard.
    const summary = [job.output?.kind === "patch" ? job.output.summary : "", result.text].filter(Boolean).join("\n\n");
    await patchJob(job.id, {
      output: JSON.stringify({ kind: "patch", summary: summary || `${earlier.length} change(s) applied.` }),
      question: asked ? result.text : null,
    });
    await setJobState(job.id, "review");
    return;
  }

  // The whole conversation changed nothing: either the agent needs an answer, or there was nothing to do.
  await patchJob(job.id, {
    output: JSON.stringify({ kind: "text", summary: result.text || "Nothing needed changing." }),
    question: asked ? result.text : null,
  });
  await setJobState(job.id, asked ? "review" : "done");
}

/* ---------------- Browsing ---------------- */

const BROWSE_SYSTEM = `You are exploring a web product through a browser so it can be filmed and catalogued. You see the page as a numbered list of controls plus its text (and a screenshot when available).
Work like this:
1. navigate to the product. If a sign-in form is shown and credential fields are available, fill them with type_secret (you never see the values) and submit.
2. Walk the main screens a real user works in: the overview or dashboard first, then two to five distinct sections (navigation links, tabs). Skip settings, billing, profile and sign-out.
3. On each distinct screen, once it has loaded and looks complete, call capture_screen with a short human label ("Overview", "Pipeline", "Reports"). Capture 3 to 6 screens in total. Use record_scroll on one or two long screens.
4. Never press anything destructive (delete, remove, pay, cancel). Never leave the product's own site. Do not fill forms other than sign-in.
5. When you have enough, call finish with a two-sentence summary of what the product does, as seen.
Be economical: read_page after every navigation or click; do not screenshot repeatedly.`;

interface BrowseCapture {
  label: string;
  file: string;
  kind: "screen" | "clip";
  frames?: { file: string; at: number }[];
  width: number;
  height: number;
}

/** What an audit walk measured on one captured screen. */
interface PageRecord {
  label: string;
  screen: number;
  facts: PageFacts;
  evidence: Evidence;
  mobile?: { overflows: boolean; file: string };
}

interface WalkNote {
  severity: AuditIssue["severity"];
  area: string;
  title: string;
  detail: string;
  screen: number;
}

const PERSONA_GUIDE: Record<AuditPersona, { walk: string; judge: string }> = {
  "first-time": { walk: "You know nothing about this product. Notice everything that is unexplained, every label you had to guess at, and whether the first screen tells you what to do.", judge: "Weigh clarity and onboarding most: could a stranger get value in the first five minutes?" },
  power: { walk: "You will use this all day. Notice slow screens, extra clicks, missing keyboard paths, inconsistent controls and anything that would wear on you by the hundredth time.", judge: "Weigh speed, consistency and efficiency most; forgive missing hand-holding." },
  mobile: { walk: "You are on a phone. Every screen matters at phone width: cut-off content, tiny targets, sideways scrolling, menus that do not open.", judge: "Weigh the phone-width checks most; a screen that overflows or hides its main action on a phone is a high finding." },
  buyer: { walk: "You are deciding whether to buy. Notice trust signals, polish, completeness, empty states, placeholder text, broken links and anything that looks unfinished.", judge: "Weigh completeness, polish and trust most; unfinished corners count against publishing." },
  accessibility: { walk: "You rely on the keyboard and a screen reader. Notice unlabeled fields, images without alt text, missing headings, poor contrast, focus that is lost, and controls that only work with a mouse.", judge: "Weigh accessibility most; unlabeled fields and missing headings on core screens are high findings." },
};

const personaOf = (job: AiJob): AuditPersona => (PERSONAS.some((p) => p.value === job.options?.persona) ? (job.options!.persona as AuditPersona) : "first-time");

const AUDIT_WALK_SYSTEM = `You are exploring a web product through a browser as a careful first-time user, to judge whether it is ready to be shown to customers. You see the page as a numbered list of controls plus its text (and a screenshot when available).
Work like this:
1. navigate to the product. If a sign-in form is shown and credential fields are available, fill them with type_secret (you never see the values) and submit.
2. Visit every distinct section a user would work in: the overview, each navigation link and tab, settings and account pages, any search or filter (type a harmless word into a search box), and look for empty states, error states and help. Up to twelve screens.
3. On each distinct screen, once it has loaded, call capture_screen with a short human label. Use record_scroll once on a long screen.
4. As you go, call note_issue for anything a customer would notice: confusing labels, dead ends, broken links, layout faults, slow screens, missing feedback, inconsistent controls, anything unsafe. Be specific and say where.
5. Never press anything destructive (delete, remove, pay, cancel, sign out). Never leave the product's own site. Do not create, edit or submit records other than a search.
6. When you have seen it all, call finish with a summary of what the product does and how it felt to use.
Be economical: read_page after every navigation or click; do not screenshot repeatedly.`;

async function browseProduct(job: AiJob, steps: Steps, record: AgentRun["record"], dir: string, scale: number, mode: "film" | "audit" = "film") {
  const auditing = mode === "audit";
  const persona = personaOf(job);
  const mobileEvery = auditing && persona === "mobile";
  const url = String(job.options?.url ?? "").trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("Give the product's address, starting with http:// or https://.");
  const host = new URL(url).hostname.toLowerCase();

  let credential: { fields: Record<string, string>; names: string[]; host: string } | null = null;
  if (job.options?.credentialId) credential = await openCredential(job.options.credentialId);

  // The product's own site: its host, its sibling hosts (app. and auth. under one domain)
  // and the host the credential was filed under. Anything else is refused at the network.
  const allowHosts = [...new Set([host, registrableDomain(host), credential?.host.toLowerCase() ?? ""].filter(Boolean))];

  await steps.begin("Open the product");
  const browser = new Browser({ width: 1440, height: 900, scale: 1, allowHosts });
  await browser.launch();
  try {
    // Reached first by hand: an address that does not answer fails here, plainly, not after a walk.
    await browser.navigate(url);
  } catch (error) {
    await browser.close();
    throw error;
  }
  await steps.done(`Chrome, ${host}`);

  const captures: BrowseCapture[] = [];
  const screensDir = path.join(dir, "screens");
  mkdirSync(screensDir, { recursive: true });
  let lastDigest: Digest | null = null;
  const real = (await providerName()) === "anthropic";

  const tools: Tool[] = [
    { name: "navigate", description: "Open an address on the product's site.", input_schema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } },
    { name: "read_page", description: "The current page: title, address, numbered controls and visible text.", input_schema: { type: "object", properties: {} } },
    { name: "click", description: "Click control #ref from read_page.", input_schema: { type: "object", properties: { ref: { type: "string" } }, required: ["ref"] } },
    { name: "type", description: "Type into field #ref (replacing its contents); submit presses Enter afterwards.", input_schema: { type: "object", properties: { ref: { type: "string" }, text: { type: "string" }, submit: { type: "boolean" } }, required: ["ref", "text"] } },
    { name: "type_secret", description: "Type a stored credential into field #ref without seeing it. `field` is one of the credential field names, or 'username' / 'password' to pick by role.", input_schema: { type: "object", properties: { ref: { type: "string" }, field: { type: "string" } }, required: ["ref", "field"] } },
    { name: "scroll", description: "Scroll the page: down, up, top or bottom.", input_schema: { type: "object", properties: { direction: { type: "string", enum: ["down", "up", "top", "bottom"] } }, required: ["direction"] } },
    { name: "wait", description: "Wait for the page to settle, up to 8 seconds.", input_schema: { type: "object", properties: { seconds: { type: "number" } } } },
    { name: "capture_screen", description: "Save the current screen for the film, with a short label.", input_schema: { type: "object", properties: { label: { type: "string" } }, required: ["label"] } },
    { name: "record_scroll", description: "Record a smooth scroll down the current screen (2–5 seconds) as a moving clip.", input_schema: { type: "object", properties: { label: { type: "string" }, seconds: { type: "number" } }, required: ["label"] } },
    { name: "finish", description: "Stop browsing. success=false if you could not get in.", input_schema: { type: "object", properties: { summary: { type: "string" }, success: { type: "boolean" } }, required: ["summary", "success"] } },
    ...(auditing
      ? [{ name: "note_issue", description: "Record something a customer would notice on the current screen: a fault, a confusion, a risk. severity is critical, high, medium or low.", input_schema: { type: "object" as const, properties: { severity: { type: "string", enum: ["critical", "high", "medium", "low"] }, area: { type: "string", description: "Navigation, Forms, Mobile, Content, Performance, Accessibility, Reliability, Onboarding, Security or similar" }, title: { type: "string" }, detail: { type: "string" } }, required: ["severity", "area", "title", "detail"] } }]
      : []),
  ];
  const pages: PageRecord[] = [];
  const notes: WalkNote[] = [];
  const screenLimit = auditing ? 12 : 8;

  const digestBlock = async (): Promise<ContentBlockParam[]> => {
    lastDigest = await browser.digest();
    const blocks: ContentBlockParam[] = [{ type: "text", text: Browser.describe(lastDigest) }];
    if (real) {
      const shot = await browser.screenshot("jpeg", 62);
      blocks.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: shot.toString("base64") } });
    }
    return blocks;
  };

  const opening = [
    auditing ? "Audit mode: judge the product as a customer would, and record what you notice." : "",
    `Product URL: ${url}`,
    credential ? `Credential fields available: ${credential.names.join(", ")} (typed by the browser on request)` : "No credential provided: explore what is reachable without signing in.",
    job.prompt ? `Owner's notes: ${job.prompt}` : "",
  ].filter(Boolean).join("\n");

  let summary = "";
  let success = true;
  await steps.begin("Walk the product");
  let actions = 0;
  try {
    const ended = await runAgent({
      job,
      task: "browse",
      system: auditing ? `${AUDIT_WALK_SYSTEM}\n\nWHO YOU ARE: ${PERSONA_GUIDE[persona].walk}` : BROWSE_SYSTEM,
      messages: [{ role: "user", content: opening }],
      tools,
      maxTurns: auditing ? 45 : 30,
      record,
      run: async (call) => {
        actions += 1;
        const i = call.input;
        switch (call.name) {
          case "navigate":
            await browser.navigate(String(i.url));
            await steps.detail(`${actions} actions · opened ${String(i.url).slice(0, 60)}`);
            return `Opened ${await browser.url()}`;
          case "read_page":
            return digestBlock();
          case "click": {
            const label = await browser.click(String(i.ref));
            await steps.detail(`${actions} actions · clicked "${label.slice(0, 40)}"`);
            return `Clicked "${label}". Now at ${await browser.url()}.${browser.takeBlocked()} Call read_page to see the result.`;
          }
          case "type": {
            const label = await browser.type(String(i.ref), String(i.text ?? ""), Boolean(i.submit));
            return `Typed into "${label}".${browser.takeBlocked()}`;
          }
          case "type_secret": {
            if (!credential) throw new Error("No credential is attached to this job.");
            const want = String(i.field ?? "");
            const name =
              credential.names.find((n) => n.toLowerCase() === want.toLowerCase()) ??
              credential.names.find((n) => classifyField(n) === want) ??
              (want === "username" ? credential.names.find((n) => classifyField(n) === "other") : undefined);
            if (!name) throw new Error(`No credential field matches "${want}". Available: ${credential.names.join(", ")}.`);
            // A password only ever goes into a password box, where neither the page text nor a screenshot can show it.
            const secret = classifyField(name) === "password";
            const label = await browser.type(String(i.ref), credential.fields[name], false, { passwordOnly: secret });
            await steps.detail(`${actions} actions · filled ${name}`);
            return `Typed the stored ${name} into "${label}".`;
          }
          case "scroll":
            await browser.scroll((i.direction as "down" | "up" | "top" | "bottom") ?? "down");
            return "Scrolled.";
          case "wait":
            await new Promise((r) => setTimeout(r, Math.min(8000, Math.max(300, Number(i.seconds ?? 1) * 1000))));
            return "Waited.";
          case "capture_screen": {
            if (captures.filter((c) => c.kind === "screen").length >= screenLimit) return "Enough screens captured; call finish.";
            const label = uniqueLabel(String(i.label ?? `Screen ${captures.length + 1}`).slice(0, 40), captures);
            const file = path.join(screensDir, `screen-${captures.length + 1}.png`);
            writeFileSync(file, await browser.capture(scale, "png"));
            captures.push({ label, file, kind: "screen", width: 1440 * scale, height: 900 * scale });
            if (auditing) {
              // Measure the screen while it is in front of us: facts, errors, and a phone-width look at the first few.
              const facts = await browser.inspect();
              const evidence = browser.drainEvidence();
              const page: PageRecord = { label, screen: captures.length, facts, evidence };
              if (pages.length < 4 || mobileEvery) {
                const m = await browser.mobileCheck();
                const mobileFile = path.join(screensDir, `mobile-${captures.length}.jpg`);
                writeFileSync(mobileFile, m.shot);
                page.mobile = { overflows: m.overflows, file: mobileFile };
              }
              pages.push(page);
            }
            await steps.detail(`${actions} actions · captured "${label}"`);
            return `Captured screen ${captures.length}: ${label}.`;
          }
          case "note_issue": {
            const severity = (["critical", "high", "medium", "low"].includes(String(i.severity)) ? String(i.severity) : "medium") as AuditIssue["severity"];
            notes.push({ severity, area: String(i.area ?? "General").slice(0, 40), title: String(i.title ?? "").slice(0, 120), detail: String(i.detail ?? "").slice(0, 600), screen: captures.length });
            await steps.detail(`${actions} actions · noted "${String(i.title ?? "").slice(0, 40)}"`);
            return `Noted (${severity}).`;
          }
          case "record_scroll": {
            const seconds = Math.min(5, Math.max(2, Number(i.seconds ?? 3)));
            const label = uniqueLabel(String(i.label ?? "Scroll").slice(0, 40), captures);
            const frames = await browser.recordScroll(seconds, scale);
            if (frames.length < 4) return "The page did not scroll enough to record; captured nothing.";
            const clipDir = path.join(dir, `clip-${captures.length + 1}`);
            mkdirSync(clipDir, { recursive: true });
            const saved = frames.map((f, k) => {
              const file = path.join(clipDir, `f-${String(k).padStart(4, "0")}.jpg`);
              writeFileSync(file, f.data);
              return { file, at: f.at };
            });
            captures.push({ label, file: saved[0].file, kind: "clip", frames: saved, width: 1440 * scale, height: 900 * scale });
            await steps.detail(`${actions} actions · recorded "${label}" (${frames.length} frames)`);
            return `Recorded ${frames.length} frames over ${seconds}s as "${label}".`;
          }
          case "finish":
            summary = String(i.summary ?? "");
            success = i.success !== false;
            return "Finished.";
          default:
            return `Unknown tool ${call.name}.`;
        }
      },
    });
    // Stopping with words instead of `finish` usually means it hit a wall; keep its explanation.
    if (!ended.finished && !summary) summary = ended.text.trim();
  } finally {
    await browser.close();
  }
  if (!success) throw new Error(summary || "The agent could not get into the product.");
  if (captures.length === 0) throw new Error(summary ? `The walk ended without a capture: ${summary}` : "The walk ended without capturing a single screen.");
  await steps.done(`${captures.filter((c) => c.kind === "screen").length} screens, ${captures.filter((c) => c.kind === "clip").length} clips`);

  return { captures, summary, digest: lastDigest as Digest | null, url, host, pages, notes };
}

/* ---------------- Product audit ---------------- */

const AUDIT_DIMENSIONS: { key: string; label: string; measured: boolean }[] = [
  { key: "usability", label: "Usability", measured: false },
  { key: "clarity", label: "Clarity", measured: false },
  { key: "navigation", label: "Navigation", measured: false },
  { key: "onboarding", label: "Onboarding", measured: false },
  { key: "consistency", label: "Consistency", measured: false },
  { key: "errorHandling", label: "Error handling", measured: false },
  { key: "content", label: "Content", measured: false },
  { key: "mobile", label: "Mobile", measured: true },
  { key: "performance", label: "Performance", measured: true },
  { key: "accessibility", label: "Accessibility", measured: true },
  { key: "seo", label: "SEO", measured: true },
  { key: "reliability", label: "Reliability", measured: true },
];

const AUDIT_REPORT_SYSTEM = `You write the audit report for a web product after a careful first-time walk through it. You are given what the walker saw and noted, and hard measurements made on each screen.
Reply with ONLY a JSON object:
{"summary": string (2–4 sentences: what the product does and how it felt to use), "readiness": "ready"|"review"|"not-ready", "scores": [{"key": one of usability|clarity|navigation|onboarding|consistency|errorHandling|content|mobile|performance|accessibility|seo|reliability, "score": 0-100, "reasons": [string, ...] (1–3 short, specific sentences citing what was seen)}], "issues": [{"severity": "critical"|"high"|"medium"|"low", "area": string, "title": string (max 10 words), "detail": string (one or two sentences, specific, say where), "screen": number (the screen it was seen on, from the list, or 0)}], "recommended": [string, ...] (3–6 short actions, most valuable first)}.
Rules: every score needs reasons grounded in the evidence; the measured dimensions (mobile, performance, accessibility, seo, reliability) come with a measured baseline you may move by at most 15 points with a reason; "critical" is reserved for data loss, broken sign-in or a customer-facing error on a core screen; "not-ready" only with a critical issue; no invented facts.`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The measurable half of the audit: numbers from the walk, and what they imply. */
function measure(pages: PageRecord[], brokenLinks: number, linksChecked: number) {
  const loads = pages.map((p) => p.facts.loadMs).filter((n): n is number => typeof n === "number" && n > 0);
  const avgLoad = loads.length ? loads.reduce((a, b) => a + b, 0) / loads.length : 0;
  const mobileChecked = pages.filter((p) => p.mobile).length;
  const mobileOverflow = pages.filter((p) => p.mobile?.overflows).length;
  const consolePages = pages.filter((p) => p.evidence.consoleErrors.length).length;
  const failedPages = pages.filter((p) => p.evidence.failedRequests.length).length;
  const checks: AuditChecks = {
    screens: pages.length,
    pages: new Set(pages.map((p) => p.facts.url)).size,
    consoleErrors: pages.reduce((a, p) => a + p.evidence.consoleErrors.length, 0),
    failedRequests: pages.reduce((a, p) => a + p.evidence.failedRequests.length, 0),
    brokenLinks,
    linksChecked,
    slowPages: loads.filter((n) => n > 3000).length,
    mobileOverflow,
    mobileChecked,
    missingAlt: pages.reduce((a, p) => a + p.facts.imagesWithoutAlt, 0),
    unlabeledFields: pages.reduce((a, p) => a + p.facts.unlabeledFields, 0),
    missingMeta: pages.filter((p) => !p.facts.title || !p.facts.description).length,
    insecureLinks: pages.reduce((a, p) => a + p.facts.insecureLinks, 0),
  };
  const noH1 = pages.filter((p) => p.facts.h1Count === 0).length;
  const noLang = pages.some((p) => !p.facts.lang);
  const baseline: Record<string, { score: number; facts: string[] }> = {
    mobile: {
      score: mobileChecked === 0 ? 75 : mobileOverflow ? clamp(88 - 14 * mobileOverflow, 45, 100) : 92,
      facts: [mobileChecked ? `${mobileOverflow} of ${mobileChecked} screens checked overflow sideways at 390px.` : "No screen could be checked at phone width."],
    },
    performance: {
      score: !loads.length ? 80 : avgLoad <= 1500 ? 95 : avgLoad <= 3000 ? 85 : avgLoad <= 5000 ? 70 : 55,
      facts: [loads.length ? `Screens finished loading in ${Math.round(avgLoad)} ms on average; ${checks.slowPages} took over 3 s.` : "Load times could not be measured."],
    },
    accessibility: {
      score: clamp(96 - 3 * pages.filter((p) => p.facts.imagesWithoutAlt).length - 4 * pages.filter((p) => p.facts.unlabeledFields).length - 5 * noH1 - (noLang ? 8 : 0), 40, 100),
      facts: [
        `${checks.missingAlt} image(s) without alt text, ${checks.unlabeledFields} form field(s) without a label, across ${pages.length} screens.`,
        ...(noH1 ? [`${noH1} screen(s) have no main heading.`] : []),
        ...(noLang ? ["The page does not declare its language."] : []),
      ],
    },
    seo: {
      score: clamp(95 - 8 * pages.filter((p) => !p.facts.title).length - 6 * pages.filter((p) => !p.facts.description).length - 4 * pages.filter((p) => !p.facts.hasViewportMeta).length - (pages.some((p) => p.facts.hasCanonical) ? 0 : 3), 40, 100),
      facts: [`${pages.filter((p) => !p.facts.title).length} screen(s) without a title, ${pages.filter((p) => !p.facts.description).length} without a description.`],
    },
    reliability: {
      score: clamp(98 - 12 * consolePages - 8 * failedPages - 5 * Math.min(brokenLinks, 6), 35, 100),
      facts: [
        `${checks.consoleErrors} console error(s) on ${consolePages} screen(s); ${checks.failedRequests} failed request(s) on ${failedPages}.`,
        ...(linksChecked ? [`${brokenLinks} of ${linksChecked} internal links checked were broken.`] : []),
      ],
    },
  };
  return { checks, baseline };
}

/** Follows the product's own internal links from the server; 404s and dead hosts count, sign-in walls do not. */
async function checkLinks(pages: PageRecord[], host: string): Promise<{ checked: number; broken: string[] }> {
  const links = [...new Set(pages.flatMap((p) => p.facts.internalLinks))].filter((u) => {
    try {
      return new URL(u).hostname.toLowerCase() === host;
    } catch {
      return false;
    }
  }).slice(0, 40);
  const broken: string[] = [];
  await Promise.all(
    links.map(async (u) => {
      try {
        const res = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(8000), headers: { "user-agent": "AURAVEX audit" } });
        await res.body?.cancel();
        if (res.status === 404 || res.status === 410 || res.status >= 500) broken.push(`${u} (${res.status})`);
      } catch {
        broken.push(`${u} (no answer)`);
      }
    }),
  );
  return { checked: links.length, broken };
}

function normaliseAudit(raw: unknown, walk: { pages: PageRecord[]; notes: WalkNote[]; captures: BrowseCapture[]; summary: string }, measured: ReturnType<typeof measure>, screens: { src: string; label: string }[]): AuditReport {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const given = new Map<string, { score: number; reasons: string[] }>();
  for (const s of Array.isArray(r.scores) ? r.scores : []) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const key = String(o.key ?? "");
    const score = Number(o.score);
    if (!AUDIT_DIMENSIONS.some((d) => d.key === key) || !Number.isFinite(score)) continue;
    given.set(key, { score: clamp(Math.round(score), 0, 100), reasons: (Array.isArray(o.reasons) ? o.reasons : []).map(String).filter(Boolean).slice(0, 3) });
  }
  const scores: AuditScore[] = AUDIT_DIMENSIONS.map((d) => {
    const g = given.get(d.key);
    const base = measured.baseline[d.key];
    if (base) {
      // Measured dimensions: the numbers rule, the model may nudge them with a reason.
      const score = g ? clamp(g.score, base.score - 15, base.score + 15) : base.score;
      return { key: d.key, label: d.label, score, reasons: [...base.facts, ...(g?.reasons ?? [])].slice(0, 4) };
    }
    return { key: d.key, label: d.label, score: g?.score ?? 75, reasons: g?.reasons.length ? g.reasons : ["Not enough was seen to say more."] };
  });
  const screenSrc = (n: unknown) => {
    const i = Number(n);
    return Number.isFinite(i) && i >= 1 && i <= screens.length ? screens[i - 1].src : undefined;
  };
  const severities: AuditIssue["severity"][] = ["critical", "high", "medium", "low"];
  const issues: AuditIssue[] = [];
  for (const it of Array.isArray(r.issues) ? r.issues : []) {
    if (!it || typeof it !== "object") continue;
    const o = it as Record<string, unknown>;
    const severity = severities.includes(o.severity as AuditIssue["severity"]) ? (o.severity as AuditIssue["severity"]) : "medium";
    const title = String(o.title ?? "").trim().slice(0, 120);
    if (!title) continue;
    issues.push({ severity, area: String(o.area ?? "General").slice(0, 40), title, detail: String(o.detail ?? "").slice(0, 600), screen: screenSrc(o.screen) });
  }
  // The walker's own notes are evidence too; keep any the report left out.
  for (const n of walk.notes) {
    if (issues.some((i) => i.title.toLowerCase() === n.title.toLowerCase())) continue;
    issues.push({ severity: n.severity, area: n.area, title: n.title, detail: n.detail, screen: screenSrc(n.screen) });
  }
  // Measured faults always appear, whatever the model wrote.
  const m = measured.checks;
  if (m.mobileOverflow && !issues.some((i) => /overflow/i.test(i.title + i.detail))) {
    const p = walk.pages.find((x) => x.mobile?.overflows);
    issues.push({ severity: "high", area: "Mobile", title: "A screen overflows sideways on a phone", detail: `${p?.label ?? "A screen"} is wider than a 390px screen, so part of it is cut off or needs sideways scrolling.`, screen: screenSrc(p?.screen) });
  }
  if (m.brokenLinks && !issues.some((i) => /broken link/i.test(i.title))) {
    issues.push({ severity: m.brokenLinks > 2 ? "high" : "medium", area: "Reliability", title: `${m.brokenLinks} broken internal link${m.brokenLinks === 1 ? "" : "s"}`, detail: "Links inside the product answered 404, 410, a server error or nothing at all." });
  }
  if (m.consoleErrors && !issues.some((i) => /console/i.test(i.title + i.detail))) {
    const p = walk.pages.find((x) => x.evidence.consoleErrors.length);
    issues.push({ severity: "medium", area: "Reliability", title: "Errors in the browser console", detail: `${m.consoleErrors} error(s) while using the product, first on ${p?.label ?? "a screen"}: ${p?.evidence.consoleErrors[0] ?? ""}`.slice(0, 600), screen: screenSrc(p?.screen) });
  }
  issues.sort((a, b) => severities.indexOf(a.severity) - severities.indexOf(b.severity));
  const critical = issues.some((i) => i.severity === "critical");
  const high = issues.some((i) => i.severity === "high");
  const asked = String(r.readiness ?? "");
  const readiness: AuditReport["readiness"] = critical ? "not-ready" : high ? "review" : asked === "review" ? "review" : "ready";
  const map = walk.captures.filter((c) => c.kind === "screen").map((c, i) => `${i + 1}. ${c.label}${walk.pages[i] ? ` — ${walk.pages[i].facts.url.replace(/^https?:\/\//, "")}` : ""}`);
  return {
    readiness,
    summary: String(r.summary ?? walk.summary).slice(0, 900),
    scores,
    issues: issues.slice(0, 40),
    recommended: (Array.isArray(r.recommended) ? r.recommended : []).map(String).filter(Boolean).slice(0, 8),
    checks: m,
    map,
  };
}

async function runProductAudit(job: AiJob, steps: Steps, record: AgentRun["record"]) {
  const dir = path.join(FILM_DIR, job.id);
  mkdirSync(dir, { recursive: true });
  chromePath();
  const walk = await browseProduct(job, steps, record, dir, 1, "audit");

  await steps.begin("Check the pages");
  const links = await checkLinks(walk.pages, walk.host);
  const measured = measure(walk.pages, links.broken.length, links.checked);
  await steps.done(`${walk.pages.length} screens measured, ${links.checked} links followed, ${measured.checks.mobileChecked} phone-width checks`);

  await steps.begin("Write the audit");
  const name = walk.digest?.title.split(/[|·—-]/)[0].trim() || walk.host;
  const pageLines = walk.pages.map((p) => {
    const f = p.facts;
    return `${p.screen}. ${p.label} — ${f.url}\n   title: ${f.title ? `"${f.title}"` : "none"}; description: ${f.description ? "yes" : "none"}; h1: ${f.h1Count}; images without alt: ${f.imagesWithoutAlt}/${f.images}; unlabeled fields: ${f.unlabeledFields}/${f.fields}; load: ${f.loadMs ?? "?"} ms; words: ${f.wordCount}${p.mobile ? `; phone width: ${p.mobile.overflows ? "OVERFLOWS" : "fits"}` : ""}${p.evidence.consoleErrors.length ? `; console errors: ${p.evidence.consoleErrors.slice(0, 2).join(" | ")}` : ""}${p.evidence.failedRequests.length ? `; failed requests: ${p.evidence.failedRequests.slice(0, 3).map((x) => `${x.status} ${x.url}`).join(", ")}` : ""}`;
  });
  const persona = personaOf(job);
  const personaLabel = PERSONAS.find((p) => p.value === persona)?.label ?? "First-time customer";
  const context = [
    `Product: ${name}`,
    `Address: ${walk.url}`,
    `Audited as: ${personaLabel}. ${PERSONA_GUIDE[persona].judge}`,
    `What the walker said at the end: ${walk.summary}`,
    "",
    "Screens seen, with measurements:",
    ...pageLines,
    "",
    `Console errors: ${measured.checks.consoleErrors}`,
    `Failed requests: ${measured.checks.failedRequests}`,
    `Broken internal links: ${links.broken.length} of ${links.checked} checked${links.broken.length ? ` (${links.broken.slice(0, 5).join("; ")})` : ""}`,
    `Pages overflowing on a phone: ${measured.checks.mobileOverflow} of ${measured.checks.mobileChecked} checked`,
    "",
    "Measured baselines (move by at most 15 with a reason): " + Object.entries(measured.baseline).map(([k, v]) => `${k} ${v.score}`).join(", "),
    "",
    walk.notes.length ? "What the walker noted:" : "The walker noted nothing.",
    ...walk.notes.map((n) => `- [${n.severity}] ${n.area}: ${n.title} — ${n.detail} (screen ${n.screen})`),
    job.prompt ? `\nOwner's notes: ${job.prompt}` : "",
  ].filter((l) => l !== undefined).join("\n");
  const res = await (await provider()).complete({ model: job.model, system: AUDIT_REPORT_SYSTEM, messages: [{ role: "user", content: context }], tools: [], task: "audit", session: `${job.id}:audit` });
  await record(res.usage);
  const raw = extractJson<Record<string, unknown>>(res.text);
  if (!raw) throw new Error("The model did not return a usable audit report.");
  await steps.done("report written");

  await steps.begin("Publish");
  const screens: { id: string; src: string; label: string }[] = [];
  for (const c of walk.captures.filter((x) => x.kind === "screen")) {
    const item = await saveMedia({ name: `${name} — audit: ${c.label}`, mime: "image/png", bytes: readFileSync(c.file), width: c.width, height: c.height });
    screens.push({ id: item.id, src: item.src, label: c.label });
  }
  for (const p of walk.pages) {
    if (!p.mobile || !existsSync(p.mobile.file)) continue;
    const item = await saveMedia({ name: `${name} — audit, phone: ${p.label}`, mime: "image/jpeg", bytes: readFileSync(p.mobile.file), width: 780, height: 1688 });
    screens.push({ id: item.id, src: item.src, label: `${p.label} (phone)` });
  }
  const audit = normaliseAudit(raw, walk, measured, screens);
  audit.persona = personaLabel;
  const counts = { critical: audit.issues.filter((i) => i.severity === "critical").length, high: audit.issues.filter((i) => i.severity === "high").length };
  const verdict = audit.readiness === "ready" ? "Ready to publish" : audit.readiness === "review" ? "Review required before publishing" : "Not ready to publish";
  await patchJob(job.id, {
    artifacts: JSON.stringify({ screens, audit } satisfies JobArtifacts),
    output: JSON.stringify({ kind: "audit", summary: `${verdict} · ${audit.issues.length} finding${audit.issues.length === 1 ? "" : "s"}${counts.critical ? `, ${counts.critical} critical` : ""}${counts.high ? `, ${counts.high} high` : ""} · ${audit.checks.screens} screens, ${audit.checks.linksChecked} links checked` }),
  });
  await steps.done(verdict);
  await setJobState(job.id, "done");
  removeWorkDir(job.id);
  if (job.options?.watchId) await settleWatch(job, audit, verdict, name);
}

/* ---------------- Watches: audits on a schedule, alerts when the verdict moves ---------------- */

function watchFromRow(row: Record<string, unknown>): AiWatch {
  const hours = Number(row.hours) || 168;
  const last = row.last_run_at ? String(row.last_run_at) : undefined;
  return {
    id: String(row.id),
    name: String(row.name),
    url: String(row.url),
    credentialId: row.credential_id ? String(row.credential_id) : undefined,
    persona: (PERSONAS.some((p) => p.value === row.persona) ? row.persona : "first-time") as AuditPersona,
    hours,
    createdAt: String(row.created_at),
    lastRunAt: last,
    lastJobId: row.last_job_id ? String(row.last_job_id) : undefined,
    lastVerdict: row.last_verdict ? (String(row.last_verdict) as AiWatch["lastVerdict"]) : undefined,
    lastOverall: row.last_overall === null || row.last_overall === undefined ? undefined : Number(row.last_overall),
    lastCritical: row.last_critical === null || row.last_critical === undefined ? undefined : Number(row.last_critical),
    nextRunAt: new Date((last ? Date.parse(last) : Date.parse(String(row.created_at))) + hours * 3_600_000).toISOString(),
  };
}

export async function listWatches(): Promise<AiWatch[]> {
  const rows = await (await col("ai_watches")).find({}).sort({ created_at: -1 }).toArray();
  return rows.map(watchFromRow);
}

export async function createWatch(input: { name: string; url: string; credentialId?: string; persona: AuditPersona; hours: number }): Promise<AiWatch> {
  const id = uid("w");
  await (await col("ai_watches")).insertOne({
    _id: id,
    id,
    name: input.name,
    url: input.url,
    credential_id: input.credentialId ?? null,
    persona: input.persona,
    hours: input.hours,
    created_at: now(),
    last_run_at: null,
    last_job_id: null,
    last_verdict: null,
    last_overall: null,
    last_critical: null,
  });
  return (await listWatches()).find((w) => w.id === id)!;
}

export async function deleteWatch(id: string): Promise<boolean> {
  return (await (await col("ai_watches")).deleteOne({ _id: id })).deletedCount > 0;
}

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Queues the watch's audit now, unless one is already on its way. */
export async function runWatch(id: string): Promise<AiJob | null> {
  const watch = (await listWatches()).find((w) => w.id === id);
  if (!watch) return null;
  const pending = await (await col("ai_jobs")).findOne(
    { state: { $in: ["queued", "running"] }, options: { $regex: escapeRegex(`"watchId":"${id}"`) } },
    { projection: { id: 1 } },
  );
  if (pending) return getJob(String(pending.id));
  const job = await createJob({
    kind: "product-audit",
    title: `Audit: ${watch.name}`,
    prompt: "",
    model: "claude-sonnet-5",
    options: { url: watch.url, credentialId: watch.credentialId, persona: watch.persona, watchId: id },
  });
  await (await col("ai_watches")).updateOne({ _id: id }, { $set: { last_run_at: now(), last_job_id: job.id } });
  void runQueuedJobs().catch((error) => console.error("[ai]", error));
  return job;
}

/** Called on a timer: every watch that is due gets its audit queued. */
export async function sweepWatches(): Promise<number> {
  const due = (await listWatches()).filter((w) => Date.parse(w.nextRunAt ?? "") <= Date.now());
  for (const w of due) await runWatch(w.id);
  return due.length;
}

/** The audit is in: remember it on the watch, and speak up if the verdict moved. */
async function settleWatch(job: AiJob, audit: AuditReport, verdict: string, name: string) {
  const id = String(job.options?.watchId);
  const watch = (await listWatches()).find((w) => w.id === id);
  if (!watch) return;
  const overall = Math.round(audit.scores.reduce((a, s) => a + s.score, 0) / Math.max(1, audit.scores.length));
  const critical = audit.issues.filter((i) => i.severity === "critical").length;
  await (await col("ai_watches")).updateOne(
    { _id: id },
    { $set: { last_run_at: now(), last_job_id: job.id, last_verdict: audit.readiness, last_overall: overall, last_critical: critical } },
  );
  const first = watch.lastVerdict === undefined;
  const moved = !first && (watch.lastVerdict !== audit.readiness || Math.abs((watch.lastOverall ?? overall) - overall) >= 10 || (watch.lastCritical ?? 0) !== critical);
  if (!moved) return;
  const body = `${name}: ${verdict.toLowerCase()} (was ${watch.lastVerdict}), overall ${overall} (was ${watch.lastOverall ?? "?"}), ${critical} critical.`;
  await logActivity("AI Studio", "update", "audit verdict changed", body).catch((error) => console.error("[ai]", error));
  await broadcast({ title: "Audit verdict changed", body, url: "/admin/ai", tag: `watch-${id}` }).catch(() => undefined);
  await notifyOperator({ subject: `Audit verdict changed: ${name}`, text: `${body}\n\nOpen the studio to read the report.` }).catch(() => undefined);
}

/* ---------------- Product film ---------------- */

interface PlanShot {
  kind: "title" | "screen" | "clip" | "outro";
  seconds: number;
  label?: string;
  caption?: string;
  sub?: string;
}

const PLAN_SYSTEM = `You are the director of a 30–60 second launch film for a software product. The film shows the product's real screens inside a laptop on a photographed set, with short captions.
Reply with ONLY a JSON object: {"logline": string, "shots": [{"kind": "title"|"screen"|"clip"|"outro", "seconds": number, "label": string (the exact capture label, for screen/clip), "caption": string (max 6 words), "sub": string (max 12 words)}]}.
Rules: start with a title shot (caption = product name, sub = a one-line promise), then every captured screen and clip once each in a sensible order (4–7 seconds each), end with an outro (caption = a call to action, sub = the website). Captions state what the screen lets a team do; plain words, no hype, no invented numbers.`;

/** The staging the owner asked for, by option or by the words they used. */
function filmStyle(job: AiJob): FilmStyle {
  const wanted = job.options?.style;
  if (wanted === "studio" || wanted === "recording" || wanted === "showroom") return wanted;
  const text = job.prompt.toLowerCase();
  if (/screen ?record|recording|screencast|full[- ]frame|no laptop|just the screen/.test(text)) return "recording";
  if (/studio|floating|spotlight|dark set/.test(text)) return "studio";
  return "showroom";
}

/** The photographed set behind a showroom film: the plate the owner picked, or the default room. */
function filmPlate(job: AiJob): string {
  const id = String(job.options?.plateId ?? "").replace(/[^a-z0-9-]/gi, "");
  const file = id ? path.join(process.cwd(), "public", "backgrounds", `${id}.jpg`) : "";
  return pathToFileURL(file && existsSync(file) ? file : path.join(process.cwd(), "public", "backgrounds", "dark-hero-02.jpg")).href;
}

async function runProductVideo(job: AiJob, steps: Steps, record: AgentRun["record"]) {
  const resolution: Resolution = job.options?.resolution === "4k" ? "4k" : "1080p";
  const style = filmStyle(job);
  const scale = resolution === "4k" ? 2 : 1;
  const target = Math.min(60, Math.max(20, Number(job.options?.seconds ?? 40)));
  const dir = path.join(FILM_DIR, job.id);
  mkdirSync(dir, { recursive: true });
  // Both are needed at the end; better to hear now than after a long walk.
  chromePath();
  ffmpegPath();

  const product = job.options?.productSlug ? (await catalogue()).find((p) => p.slug === job.options?.productSlug) : undefined;
  const walk = await browseProduct(job, steps, record, dir, scale);

  await steps.begin("Write the shot list");
  const name = product?.name ?? (walk.digest?.title.split(/[|·—-]/)[0].trim() || walk.host);
  const listing = walk.captures.map((c) => `- ${c.kind} "${c.label}"`).join("\n");
  const planRes = await (await provider()).complete({
    model: job.model,
    system: PLAN_SYSTEM,
    messages: [{ role: "user", content: `Product: ${name}\nWhat it does, as seen: ${walk.summary}\nWebsite: ${SITE_DOMAIN}\nCaptures, in the order they were taken:\n${listing}\nTarget length: ${target} seconds.` }],
    tools: [],
    task: "plan",
    session: `${job.id}:plan`,
  });
  await record(planRes.usage);
  const plan = extractJson<{ logline?: string; shots?: unknown }>(planRes.text);
  const planned = Array.isArray(plan?.shots) ? (plan.shots.filter((s) => s && typeof s === "object") as PlanShot[]) : [];
  const shots = normalisePlan(planned, walk.captures, name, target);
  await steps.done(`${shots.length} shots, ${totalSeconds(shots)}s`);

  await steps.begin(`Render the film (${resolution}, ${style})`);
  const fps = 30;
  const manifest: StageManifest = {
    width: 1920,
    height: 1080,
    fps,
    style,
    product: { name, tagline: product?.tagline ?? walk.summary.split(/(?<=\.)\s/)[0].slice(0, 90), accent: product?.accent ?? "#3b82f6" },
    brand: SITE.name,
    tagline: SITE_DOMAIN,
    plate: filmPlate(job),
    fonts: fontFiles(),
    shots: shots.map((s) => toStageShot(s, walk.captures, fps)),
  };
  const music = job.options?.musicMediaId ? await mediaLocalPath(job.options.musicMediaId) : undefined;
  const rendered = await renderFilm({
    dir,
    manifest,
    resolution,
    music,
    // Not waited for: the writes still land in order, and a failed one is only a missed progress line.
    onProgress: (fraction, note) => void steps.detail(`${Math.round(fraction * 100)}% · ${note ?? ""}`).catch((error) => console.error("[ai]", error)),
  });
  await steps.done(`${rendered.width}×${rendered.height}, ${rendered.seconds}s, ${rendered.frames} frames`);

  await steps.begin("Publish");
  const video = await saveMedia({ name: `${name} — launch film (${resolution})`, mime: "video/mp4", bytes: readFileSync(rendered.file), width: rendered.width, height: rendered.height });
  const poster = await saveMedia({ name: `${name} — film poster`, mime: "image/jpeg", bytes: readFileSync(rendered.poster), width: rendered.width, height: rendered.height });
  const screens: { id: string; src: string; label: string }[] = [];
  for (const c of walk.captures.filter((x) => x.kind === "screen")) {
    const item = await saveMedia({ name: `${name} — ${c.label}`, mime: "image/png", bytes: readFileSync(c.file), width: c.width, height: c.height });
    screens.push({ id: item.id, src: item.src, label: c.label });
  }

  const artifacts: JobArtifacts = {
    videoId: video.id,
    videoSrc: video.src,
    posterId: poster.id,
    posterSrc: poster.src,
    seconds: rendered.seconds,
    width: rendered.width,
    height: rendered.height,
    screens,
    productSlug: product?.slug,
  };
  if (product) {
    const products = await getSetting<Record<string, Record<string, unknown>>>("products", {});
    const previous = products[product.slug] ?? {};
    const override = { ...previous, videoId: video.id, posterId: poster.id, ...(previous.imageId ? {} : { imageId: screens[0]?.id }) };
    await patchJob(job.id, { ledger: JSON.stringify({ v: 2, entries: [{ key: "products", sub: product.slug, before: products[product.slug], after: override }] }) });
    await applySettings({ products: { ...products, [product.slug]: override } });
    await refreshSite([{ path: `/products/${product.slug}`, expect: video.src }]);
  }
  await patchJob(job.id, {
    artifacts: JSON.stringify(artifacts),
    output: JSON.stringify({ kind: "video", summary: `${rendered.seconds}s · ${rendered.width}×${rendered.height}${product ? ` · attached to ${product.name}` : ""}` }),
  });
  await steps.done(product ? `Attached to ${product.name}` : "In the media library");
  await setJobState(job.id, "done");
  removeWorkDir(job.id);
}

/** "Overview", then "Overview 2": a second capture under the same name still makes the film. */
function uniqueLabel(label: string, captures: BrowseCapture[]): string {
  const taken = new Set(captures.map((c) => c.label.toLowerCase()));
  if (!taken.has(label.toLowerCase())) return label;
  for (let n = 2; ; n++) {
    const candidate = `${label.slice(0, 36)} ${n}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}

function normalisePlan(planned: PlanShot[], captures: BrowseCapture[], name: string, target: number): PlanShot[] {
  const byLabel = new Map(captures.map((c) => [c.label.toLowerCase(), c]));
  const used = new Set<string>();
  const shots: PlanShot[] = [];
  const clamp = (v: unknown, lo: number, hi: number, d: number) => (Number.isFinite(Number(v)) && v !== undefined ? Math.min(hi, Math.max(lo, Number(v))) : d);

  const title = planned.find((s) => s.kind === "title");
  shots.push({ kind: "title", seconds: clamp(title?.seconds, 3, 6, 4), caption: (title?.caption || name).slice(0, 60), sub: (title?.sub || "A closer look").slice(0, 90) });

  for (const s of planned) {
    if (s.kind !== "screen" && s.kind !== "clip") continue;
    const cap = byLabel.get(String(s.label ?? "").toLowerCase());
    if (!cap || used.has(cap.label)) continue;
    used.add(cap.label);
    shots.push({ kind: cap.kind, seconds: clamp(s.seconds, 3, 8, 5), label: cap.label, caption: (s.caption || cap.label).slice(0, 48), sub: (s.sub || "").slice(0, 90) });
  }
  // Anything the director skipped still belongs in the film.
  for (const cap of captures) {
    if (used.has(cap.label)) continue;
    shots.push({ kind: cap.kind, seconds: 5, label: cap.label, caption: cap.label, sub: "" });
  }

  const outro = planned.find((s) => s.kind === "outro");
  shots.push({ kind: "outro", seconds: clamp(outro?.seconds, 3, 6, 4), caption: (outro?.caption || "Book a walkthrough").slice(0, 40), sub: (outro?.sub || SITE_DOMAIN).slice(0, 60) });

  // Scale the middle to hit the target length, within each shot's sensible range.
  const fixed = shots[0].seconds + shots[shots.length - 1].seconds;
  const middle = shots.slice(1, -1);
  const current = middle.reduce((a, s) => a + s.seconds, 0);
  if (middle.length && current > 0) {
    const factor = Math.max(0.6, Math.min(1.6, (target - fixed) / current));
    for (const s of middle) s.seconds = Math.round(Math.min(8, Math.max(3, s.seconds * factor)) * 2) / 2;
  }
  return shots;
}

function toStageShot(shot: PlanShot, captures: BrowseCapture[], fps: number): Shot {
  const cap = shot.label ? captures.find((c) => c.label === shot.label) : undefined;
  if (shot.kind === "clip" && cap?.frames?.length) {
    // Resample the recording to exactly one frame per output frame.
    const n = Math.round(shot.seconds * fps);
    const span = cap.frames[cap.frames.length - 1].at || 1;
    const frames: string[] = [];
    for (let i = 0; i < n; i++) {
      const at = (i / Math.max(1, n - 1)) * span;
      let best = cap.frames[0];
      for (const f of cap.frames) if (Math.abs(f.at - at) < Math.abs(best.at - at)) best = f;
      frames.push(pathToFileURL(best.file).href);
    }
    return { kind: "clip", seconds: shot.seconds, caption: shot.caption, sub: shot.sub, frames };
  }
  if ((shot.kind === "screen" || shot.kind === "clip") && cap) {
    return { kind: "screen", seconds: shot.seconds, caption: shot.caption, sub: shot.sub, image: pathToFileURL(cap.file).href };
  }
  return { kind: shot.kind === "outro" ? "outro" : "title", seconds: shot.seconds, caption: shot.caption, sub: shot.sub };
}

/* ---------------- Product import ---------------- */

const IMPORT_SYSTEM = `You write the catalogue entry for a software product from what a browser agent saw of it. Reply with ONLY a JSON object:
{"name": string, "tagline": string (max 8 words), "summary": string (one sentence), "description": string (2–3 sentences), "category": "ai"|"saas"|"web-apps"|"automation"|"developer-tools"|"enterprise", "sector": string (max 3 words), "features": [{"title": string, "description": string, "icon": "grid"|"layers"|"chart"|"users"|"workflow"|"shield"|"database"|"zap"}] (3–5 items), "stack": [string] (only what is evident), "tags": [string] (3–5)}.
Plain, specific, no hype, and nothing you did not see evidence for.`;

async function runProductImport(job: AiJob, steps: Steps, record: AgentRun["record"]) {
  const dir = path.join(FILM_DIR, job.id);
  mkdirSync(dir, { recursive: true });
  const walk = await browseProduct(job, steps, record, dir, 1);

  await steps.begin("Draft the catalogue entry");
  const context = [
    `Page title: ${walk.digest?.title ?? walk.host}`,
    `Address: ${walk.url}`,
    `What the agent saw: ${walk.summary}`,
    `Visible text on the last screen: ${(walk.digest?.text ?? "").slice(0, 1200)}`,
    `Screens captured: ${walk.captures.map((c) => c.label).join(", ")}`,
    job.prompt ? `Owner's notes: ${job.prompt}` : "",
  ].filter(Boolean).join("\n");
  const res = await (await provider()).complete({ model: job.model, system: IMPORT_SYSTEM, messages: [{ role: "user", content: context }], tools: [], task: "import", session: `${job.id}:import` });
  await record(res.usage);
  const draft = extractJson<Partial<Product> & { features?: Product["features"] }>(res.text);
  if (!draft?.name) throw new Error("The model did not return a usable catalogue entry.");
  await steps.done(String(draft.name));

  await steps.begin("Add to the catalogue");
  const base = slugify(String(draft.name)) || slugify(walk.host) || "imported-product";
  let slug = base;
  const existing = await catalogue();
  for (let n = 2; existing.some((p) => p.slug === slug); n++) slug = `${base}-${n}`;

  const screens: { id: string; src: string; label: string; width: number; height: number }[] = [];
  for (const c of walk.captures.filter((x) => x.kind === "screen")) {
    const item = await saveMedia({ name: `${draft.name} — ${c.label}`, mime: "image/png", bytes: readFileSync(c.file), width: c.width, height: c.height });
    screens.push({ id: item.id, src: item.src, label: c.label, width: c.width, height: c.height });
  }

  const categories = ["ai", "saas", "web-apps", "automation", "developer-tools", "enterprise"] as const;
  const category = categories.includes(draft.category as (typeof categories)[number]) ? (draft.category as Product["category"]) : "saas";
  const product: Product = {
    id: `custom-${slug}`,
    slug,
    name: String(draft.name).slice(0, 60),
    tagline: String(draft.tagline ?? "").slice(0, 90),
    category,
    sector: String(draft.sector ?? "Software").slice(0, 40),
    status: "live",
    summary: String(draft.summary ?? "").slice(0, 240),
    description: String(draft.description ?? "").slice(0, 600),
    icon: "box",
    accent: PRODUCTS[existing.length % PRODUCTS.length]?.accent ?? "#3b82f6",
    tags: (Array.isArray(draft.tags) ? draft.tags : []).map(String).slice(0, 6),
    features: (Array.isArray(draft.features) ? draft.features : []).slice(0, 5).map((f) => ({
      title: String(f?.title ?? "").slice(0, 40),
      description: String(f?.description ?? "").slice(0, 160),
      icon: String(f?.icon ?? "grid"),
    })),
    stack: (Array.isArray(draft.stack) ? draft.stack : []).map(String).slice(0, 8),
    metrics: [],
    architecture: [],
    timeline: [],
    gallery: screens.map((s) => ({ id: s.id, type: "image" as const, src: s.src, alt: s.label, width: s.width, height: s.height })),
    links: { demo: walk.url },
    featured: false,
    year: String(new Date().getFullYear()),
    views: 0,
  };

  const custom = await getSetting<Product[]>("customProducts", []);
  const overrides = await getSetting<Record<string, Record<string, unknown>>>("products", {});
  const override = { ...(overrides[slug] ?? {}), imageId: screens[0]?.id };
  await patchJob(job.id, {
    ledger: JSON.stringify({
      v: 2,
      entries: [
        { key: "customProducts", sub: slug, before: undefined, after: product },
        { key: "products", sub: slug, before: overrides[slug], after: override },
      ],
    }),
  });
  await applySettings({
    customProducts: [...(Array.isArray(custom) ? custom : []), product],
    products: { ...overrides, [slug]: override },
  });
  // The new page must exist and the listing must show it before the job is shown as done.
  await refreshSite([{ path: `/products/${slug}`, expect: `<title>${product.name}` }, { path: "/products", expect: `/products/${slug}` }]);
  await steps.done(`/products/${slug}`);

  await patchJob(job.id, {
    artifacts: JSON.stringify({ productSlug: slug, screens: screens.map((s) => ({ id: s.id, src: s.src, label: s.label })), changes: [`Created ${product.name} at /products/${slug}`] } satisfies JobArtifacts),
    output: JSON.stringify({ kind: "patch", summary: `${product.name} is live at /products/${slug} with ${screens.length} real screen${screens.length === 1 ? "" : "s"}. Approve to keep it, Discard to remove it.` }),
  });
  await setJobState(job.id, "review");
}
