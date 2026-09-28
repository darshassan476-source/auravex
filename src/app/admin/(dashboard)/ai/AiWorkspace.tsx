"use client";

import { BACKGROUND_IDS, HERO_BACKGROUNDS } from "@/data/backgrounds";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { BarList, DonutChart, type Point } from "@/components/admin/Charts";
import { HeatGrid, RadialGauge, StackedArea, StepRail } from "@/components/admin/GaugeCharts";
import { Panel } from "@/components/admin/Primitives";
import { CountUp } from "@/components/fx/CountUp";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Sparkline } from "@/components/ui/Primitives";
import { api, errorMessage } from "@/lib/api";
import {
  ACTIVE_KINDS,
  FILM_STYLES,
  PERSONAS,
  type AiWatch,
  type AuditPersona,
  type AuditReport,
  type FilmStyle,
  JOB_ICONS,
  JOB_LABELS,
  MODEL_RATES,
  STATE_LABELS,
  STATE_TONE,
  type AiJob,
  type CredentialSummary,
  type JobKind,
  type Resolution,
  type StudioStatus,
} from "@/lib/aiJobs";
import { cn } from "@/lib/utils";

const MODELS = Object.keys(MODEL_RATES).map((id) => ({ value: id, label: id }));
const KINDS = ACTIVE_KINDS.map((id) => ({ value: id, label: JOB_LABELS[id] }));
const LENGTHS = [20, 30, 40, 50, 60].map((s) => ({ value: String(s), label: `${s} seconds` }));
/** What a job of each kind usually costs at list price, so nobody is surprised. */
const TYPICAL_COST: Record<string, string> = {
  "site-edit": "usually under $0.10",
  "product-audit": "usually $0.30 – $1.50, depending on how many screens it finds",
  "product-video": "usually $0.20 – $0.80 for the walk and the shot list; the render itself is free",
  "product-import": "usually $0.15 – $0.60",
};
const SETS = BACKGROUND_IDS.filter((id) => HERO_BACKGROUNDS[id].mode === "dark").map((id) => ({ value: id, label: HERO_BACKGROUNDS[id].label }));
const SEVERITY_TONE: Record<string, string> = { critical: "var(--ax-danger)", high: "var(--ax-danger)", medium: "var(--ax-warning)", low: "var(--ax-ink-dim)" };
const READINESS: Record<AuditReport["readiness"], { label: string; tone: string }> = {
  ready: { label: "Ready to publish", tone: "var(--ax-success)" },
  review: { label: "Review before publishing", tone: "var(--ax-warning)" },
  "not-ready": { label: "Not ready to publish", tone: "var(--ax-danger)" },
};

/** A soft monthly ceiling, so spend has something to read against. */
const BUDGET = 40;

const QUICK_ASKS: { kind: JobKind; text: string }[] = [
  { kind: "site-edit", text: "Make the homepage headline warmer without losing its meaning." },
  { kind: "site-edit", text: "The Solutions page reads too corporate. Warm it up." },
  { kind: "site-edit", text: "Hide Custom Platforms from the catalogue for now." },
  { kind: "site-edit", text: "Give the Contact page the daylight atrium background." },
];

const FIELD =
  "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-3.5 py-2.5 text-[13px] text-[var(--ax-ink)] outline-none transition-colors placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

function relative(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

const dayKey = (iso: string) => iso.slice(0, 10);

interface JobsResponse {
  jobs: AiJob[];
  configured: boolean;
  status: StudioStatus;
  credentials: CredentialSummary[];
  watches?: AiWatch[];
}

/**
 * AI Studio.
 *
 * Three kinds of work: change the site through its own tools (every change
 * reversible), film a product through a real browser, or import one into the
 * catalogue. Jobs run on the server and are polled while in flight, so every
 * step, token and frame count is what actually happened.
 */
export function AiWorkspace() {
  const { state } = useCms();
  const catalogue = useCatalogue({ includeHidden: true });

  const [jobs, setJobs] = useState<AiJob[]>([]);
  const [status, setStatus] = useState<StudioStatus | null>(null);
  const [credentials, setCredentials] = useState<CredentialSummary[]>([]);
  const [watches, setWatches] = useState<AiWatch[]>([]);
  const [persona, setPersona] = useState<AuditPersona>("first-time");
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [model, setModel] = useState("claude-sonnet-5");
  const [kind, setKind] = useState<JobKind>("site-edit");
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [seconds, setSeconds] = useState("40");
  const [style, setStyle] = useState<FilmStyle | "">("");
  const [plateId, setPlateId] = useState("dark-hero-02");
  const [musicId, setMusicId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await api<JobsResponse>("/api/admin/ai/jobs");
    setJobs((prev) => {
      // A job created after this poll left keeps its place until the next answer has it.
      const known = new Set(data.jobs.map((j) => j.id));
      const fresh = prev.filter((j) => !known.has(j.id) && Date.now() - Date.parse(j.createdAt) < 10_000);
      return [...fresh, ...data.jobs];
    });
    setStatus(data.status);
    setCredentials(data.credentials);
    setWatches(data.watches ?? []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load().catch((e) => {
      setNotice(errorMessage(e));
      setLoaded(true);
    });
  }, [load]);

  // Poll while something is in flight, so progress is visible as it happens.
  const inFlight = jobs.some((j) => j.state === "queued" || j.state === "running");
  useEffect(() => {
    if (!inFlight) return;
    const timer = setInterval(() => load().catch(() => undefined), 2000);
    return () => clearInterval(timer);
  }, [inFlight, load]);

  const active = jobs.find((j) => j.id === activeId) ?? jobs[0] ?? null;
  const running =
    jobs.find((j) => j.state === "running") ?? jobs.find((j) => j.state === "queued") ?? jobs.find((j) => j.state === "review");

  const totals = useMemo(() => {
    const input = jobs.reduce((a, j) => a + j.tokens.input, 0);
    const output = jobs.reduce((a, j) => a + j.tokens.output, 0);
    const cached = jobs.reduce((a, j) => a + (j.tokens.cached ?? 0), 0);
    const cost = jobs.reduce((a, j) => a + j.cost, 0);
    const done = jobs.filter((j) => j.state === "done").length;
    const finished = jobs.filter((j) => j.state === "done" || j.state === "failed").length;
    return { input, output, cached, cost, done, finished };
  }, [jobs]);

  const usage = useMemo(() => {
    const days = 14;
    const labels: string[] = [];
    const input: number[] = [];
    const output: number[] = [];
    const byDay = new Map<string, { input: number; output: number }>();
    jobs.forEach((j) => {
      const k = dayKey(j.createdAt);
      const cur = byDay.get(k) ?? { input: 0, output: 0 };
      byDay.set(k, { input: cur.input + j.tokens.input, output: cur.output + j.tokens.output });
    });
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
      labels.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
      const bucket = byDay.get(dayKey(d.toISOString()));
      input.push(bucket?.input ?? 0);
      output.push(bucket?.output ?? 0);
    }
    return { labels, input, output };
  }, [jobs]);

  const heat = useMemo(() => {
    const counts = new Map<string, number>();
    jobs.forEach((j) => counts.set(dayKey(j.createdAt), (counts.get(dayKey(j.createdAt)) ?? 0) + 1));
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(Date.now() - (27 - i) * 86_400_000);
      return { day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: counts.get(dayKey(d.toISOString())) ?? 0 };
    });
  }, [jobs]);

  const byKind = useMemo<Point[]>(() => {
    const counts = new Map<JobKind, number>();
    jobs.forEach((j) => counts.set(j.kind, (counts.get(j.kind) ?? 0) + 1));
    return [...counts.entries()].map(([k, value]) => ({ label: JOB_LABELS[k], value }));
  }, [jobs]);

  const spend = useMemo<Point[]>(
    () => [...jobs].filter((j) => j.cost > 0).sort((a, b) => b.cost - a.cost).slice(0, 8).map((j) => ({ label: j.title, value: Math.round(j.cost * 100) })),
    [jobs],
  );

  const successRate = totals.finished ? Math.round((totals.done / totals.finished) * 100) : 0;
  const cacheRate = totals.input ? Math.round((totals.cached / totals.input) * 100) : 0;

  const music = state.media.filter((m) => m.mime?.startsWith("audio/"));
  const browsing = kind !== "site-edit";
  const canRun = browsing ? /^https?:\/\/\S+/i.test(url.trim()) : prompt.trim().length >= 4;

  async function run() {
    if (!canRun || submitting) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const options = browsing
        ? {
            url: url.trim(),
            credentialId: credentialId || undefined,
            ...(kind === "product-video"
              ? { resolution, seconds: Number(seconds), productSlug: productSlug || undefined, musicMediaId: musicId || undefined, style: style || undefined, plateId }
              : {}),
            ...(kind === "product-audit" ? { persona } : {}),
          }
        : {};
      const job = await api<AiJob>("/api/admin/ai/jobs", { body: { kind, prompt: prompt.trim(), model, options } });
      setJobs((prev) => [job, ...prev]);
      setActiveId(job.id);
      setPrompt("");
    } catch (e) {
      setNotice(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function decide(id: string, decision: "approve" | "discard") {
    try {
      const job = await api<AiJob>(`/api/admin/ai/jobs/${id}`, { method: "PATCH", body: { decision } });
      setJobs((prev) => prev.map((j) => (j.id === id ? job : j)));
    } catch (e) {
      setNotice(errorMessage(e));
    }
  }

  async function watch(job: AiJob, hours: number) {
    try {
      const w = await api<AiWatch>("/api/admin/ai/watches", { body: { name: job.title.replace(/^Audit: /, ""), url: job.options?.url, credentialId: job.options?.credentialId, persona: job.options?.persona ?? "first-time", hours } });
      setWatches((prev) => [w, ...prev.filter((x) => x.id !== w.id)]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not start watching.");
    }
  }
  async function unwatch(id: string) {
    try {
      await api(`/api/admin/ai/watches/${id}`, { method: "DELETE" });
      setWatches((prev) => prev.filter((w) => w.id !== id));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not stop watching.");
    }
  }
  async function runWatchNow(id: string) {
    try {
      const job = await api<AiJob>(`/api/admin/ai/watches/${id}`, { method: "POST" });
      setJobs((prev) => (prev.some((j) => j.id === job.id) ? prev : [job, ...prev]));
      setActiveId(job.id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not run the audit.");
    }
  }

  async function reply(id: string, message: string) {
    try {
      const job = await api<AiJob>(`/api/admin/ai/jobs/${id}/reply`, { body: { message } });
      setJobs((prev) => prev.map((j) => (j.id === id ? job : j)));
    } catch (e) {
      setNotice(errorMessage(e));
    }
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/ai/jobs/${id}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setActiveId(null);
    } catch (e) {
      setNotice(errorMessage(e));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ============ What is connected ============ */}
      {status && (status.provider === "none" || !status.chrome || !status.ffmpeg || status.provider === "mock") && (
        <div className="flex flex-col gap-2">
          {status.provider === "none" && (
            <Note tone="warning">
              <strong className="text-[var(--ax-ink)]">No model connected.</strong> Add{" "}
              <code className="font-mono text-[11px] text-[var(--ax-ink)]">ANTHROPIC_API_KEY</code> to{" "}
              <code className="font-mono text-[11px] text-[var(--ax-ink)]">.env</code> and restart the server; until then every job stops with that message.
            </Note>
          )}
          {status.provider === "mock" && (
            <Note tone="accent">
              <strong className="text-[var(--ax-ink)]">Scripted stand-in model.</strong> The server is running with{" "}
              <code className="font-mono text-[11px] text-[var(--ax-ink)]">AI_PROVIDER=mock</code>: the browser, film and site tools are real, the decisions are scripted for testing.
            </Note>
          )}
          {!status.chrome && <Note tone="warning">Google Chrome was not found, so products cannot be walked or filmed. Install Chrome or set <code className="font-mono text-[11px]">CHROME_PATH</code>.</Note>}
          {!status.ffmpeg && <Note tone="warning">ffmpeg is missing, so films cannot be encoded. Run <code className="font-mono text-[11px]">npm install</code> again or set <code className="font-mono text-[11px]">FFMPEG_PATH</code>.</Note>}
        </div>
      )}
      {notice && (
        <Note tone="danger">
          <Icon name="x" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.6} />
          {notice}
        </Note>
      )}

      {/* ============ Live band ============ */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel
          title={running ? (running.state === "review" ? "Waiting for you" : "Running now") : "Nothing running"}
          description={running?.title ?? "Ask for something and it will appear here."}
          action={running && <StateChip state={running.state} pulse={running.state === "running"} />}
        >
          {running ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-6">
                <RadialGauge
                  value={running.steps.filter((s) => s.state === "done").length}
                  max={Math.max(1, running.steps.length)}
                  size={128}
                  tone={STATE_TONE[running.state]}
                  pulse={running.state === "running"}
                  label={`${running.steps.filter((s) => s.state === "done").length}/${Math.max(1, running.steps.length)}`}
                  caption="steps complete"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  {running.steps.length ? <StepRail steps={running.steps} /> : <p className="text-[12.5px] text-[var(--ax-ink-dim)]">Starting…</p>}
                  {running.steps.length > 0 && running.steps[running.steps.length - 1].detail && (
                    <p className="truncate font-mono text-[11px] text-[var(--ax-ink-dim)]">{running.steps[running.steps.length - 1].detail}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniStat label="Elapsed" value={`${running.steps.reduce((a, s) => a + (s.seconds ?? 0), 0)}s`} tone="var(--ax-accent)" />
                <MiniStat label="Tokens" value={(running.tokens.input + running.tokens.output).toLocaleString()} tone="var(--ax-violet)" />
                <MiniStat label="Cost" value={`$${running.cost.toFixed(3)}`} tone="var(--ax-cyan)" />
              </div>
            </div>
          ) : (
            <Empty>{loaded ? "No active job." : "Loading…"}</Empty>
          )}
        </Panel>

        <Panel title="All time" description={`Soft ceiling $${BUDGET}.`}>
          <div className="flex flex-wrap items-center justify-around gap-4">
            <RadialGauge value={Math.min(BUDGET, totals.cost)} max={BUDGET} size={118} tone="var(--ax-accent)" label={`$${totals.cost.toFixed(2)}`} caption={`of $${BUDGET}`} />
            <RadialGauge value={successRate} size={118} tone="var(--ax-success)" label={`${successRate}%`} caption="finished clean" />
            <RadialGauge value={cacheRate} size={118} tone="var(--ax-cyan)" label={`${cacheRate}%`} caption="from cache" />
          </div>
        </Panel>
      </div>

      {/* ============ Counters ============ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BigStat icon="arrow-right" label="Input tokens" value={totals.input} series={usage.input.map((v) => v / 1000)} tone="var(--ax-accent)" />
        <BigStat icon="arrow-left" label="Output tokens" value={totals.output} series={usage.output.map((v) => v / 1000)} tone="var(--ax-violet)" />
        <BigStat icon="activity" label="Jobs run" value={jobs.length} series={heat.slice(-14).map((h) => h.value)} tone="var(--ax-cyan)" />
        <BigStat icon="chart" label="Spend" value={totals.cost} prefix="$" decimals={2} series={[...jobs].reverse().map((j) => j.cost * 100)} tone="var(--ax-success)" />
      </div>

      {/* ============ Composer ============ */}
      <Panel
        title="Ask the AI"
        description={
          kind === "site-edit"
            ? "Say what should change. It is applied straight away and can be put back with one click."
            : kind === "product-audit"
              ? "The agent signs in and uses the product like a careful first-time customer: every section, search, settings, phone width, links, errors. It comes back with scores, evidence and a verdict on whether it is ready to publish."
              : kind === "product-video"
                ? "The agent signs in, walks the product, captures its real screens and composes a film in the style you choose."
                : "The agent signs in, walks the product and writes its catalogue entry with real screens as the images."
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => setKind(k.value)}
                className={cn(
                  "ax-focus inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                  kind === k.value
                    ? "border-transparent bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                    : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
                )}
              >
                <Icon name={JOB_ICONS[k.value]} className="size-3.5" strokeWidth={2.1} />
                {k.label}
              </button>
            ))}
            <div className="ml-auto">
              <Select label="Model" value={model} onChange={setModel} options={MODELS} className="w-[190px]" size="sm" />
            </div>
          </div>

          {browsing && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Product address</span>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://app.example.com/" type="url" className={FIELD} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Sign-in credential</span>
                <Select
                  label="Credential"
                  value={credentialId}
                  onChange={setCredentialId}
                  options={[{ value: "", label: "None — explore what is public" }, ...credentials.map((c) => ({ value: c.id, label: `${c.name}${c.host ? ` · ${c.host}` : ""}` }))]}
                />
              </label>
              {kind === "product-audit" && (
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Audit as</span>
                  <Select label="Persona" value={persona} onChange={(v) => setPersona(v as AuditPersona)} options={PERSONAS.map((pp) => ({ value: pp.value, label: `${pp.label} — ${pp.hint}` }))} />
                </label>
              )}
              {kind === "product-video" && (
                <>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Attach the film to</span>
                    <Select
                      label="Product"
                      value={productSlug}
                      onChange={setProductSlug}
                      options={[{ value: "", label: "Media library only" }, ...catalogue.map((p) => ({ value: p.slug, label: p.name }))]}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Resolution</span>
                    <Select label="Resolution" value={resolution} onChange={(v) => setResolution(v as Resolution)} options={[{ value: "1080p", label: "1080p · Full HD" }, { value: "4k", label: "4K · 3840 × 2160" }]} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Length</span>
                    <Select label="Length" value={seconds} onChange={setSeconds} options={LENGTHS} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Style</span>
                    <Select label="Style" value={style} onChange={(v) => setStyle(v as FilmStyle | "")} options={[{ value: "", label: "From your words (showroom unless you say otherwise)" }, ...FILM_STYLES.map((s) => ({ value: s.value, label: `${s.label} — ${s.hint}` }))]} />
                  </label>
                  {style !== "recording" && (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Set</span>
                      <Select label="Set" value={plateId} onChange={setPlateId} options={SETS} />
                    </label>
                  )}
                  <label className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Music bed</span>
                    <Select
                      label="Music"
                      value={musicId}
                      onChange={setMusicId}
                      options={[{ value: "", label: music.length ? "None" : "None — upload an MP3 or WAV in the Media Library to use one" }, ...music.map((m) => ({ value: m.id, label: m.name }))]}
                    />
                  </label>
                </>
              )}
            </div>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void run();
              }
            }}
            rows={browsing ? 2 : 3}
            placeholder={
              kind === "site-edit"
                ? "e.g. The homepage headline is too aggressive. Make it warmer without losing the meaning.  (Ctrl+Enter to run)"
                : "Notes for the agent, optional — which screens matter most, what to avoid."
            }
            className="ax-focus w-full resize-y rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-4 py-3 text-[13.5px] leading-relaxed text-[var(--ax-ink)] outline-none transition-colors placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {!browsing &&
                QUICK_ASKS.map((ask) => (
                  <button
                    key={ask.text}
                    type="button"
                    onClick={() => setPrompt(ask.text)}
                    className="ax-focus inline-flex items-center gap-1.5 rounded-full border border-[var(--ax-line)] px-2.5 py-1.5 text-[11px] text-[var(--ax-ink-muted)] transition-colors hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]"
                  >
                    <Icon name="sparkles" className="size-3 text-[var(--ax-accent-soft)]" strokeWidth={2.2} />
                    {ask.text.length > 44 ? `${ask.text.slice(0, 43)}…` : ask.text}
                  </button>
                ))}
              {browsing && (
                <span className="text-[11.5px] text-[var(--ax-ink-dim)]">
                  Read-only by design: the agent never presses delete, pay or cancel, never leaves the product&apos;s site, and never sees the credential values.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={run}
              disabled={submitting || !canRun}
              className="ax-focus inline-flex items-center gap-2 rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Queuing…" : kind === "product-video" ? "Film it" : kind === "product-import" ? "Import it" : kind === "product-audit" ? "Audit it" : "Run"}
            </button>
            <span className="text-[11px] text-[var(--ax-ink-dim)]">{TYPICAL_COST[kind]}</span>
            <button type="button" className="hidden" aria-hidden="true" tabIndex={-1}>
              <Icon name="arrow-right" className="size-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </Panel>

      {/* ============ Credentials ============ */}
      {watches.length > 0 && (
        <Panel title="Watched products" description="Audited again on a schedule; you are told when the verdict moves.">
          <ul className="flex flex-col gap-2">
            {watches.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ax-line)] px-3.5 py-3">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[12.5px] font-semibold text-[var(--ax-ink)]">{w.name}</span>
                  <span className="truncate text-[11px] text-[var(--ax-ink-dim)]">{w.url} · every {w.hours >= 24 ? `${Math.round(w.hours / 24)} day${w.hours >= 48 ? "s" : ""}` : `${w.hours} h`} · as {PERSONAS.find((pp) => pp.value === w.persona)?.label ?? w.persona}</span>
                  <span className="text-[11px] text-[var(--ax-ink-muted)]">
                    {w.lastVerdict ? `${READINESS[w.lastVerdict].label} · ${w.lastOverall ?? "?"} of 100 · ${new Date(w.lastRunAt ?? "").toLocaleString()}` : w.lastJobId ? "First audit running" : `First audit ${new Date(w.nextRunAt ?? "").toLocaleString()}`}
                  </span>
                </span>
                <span className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => runWatchNow(w.id)} className="ax-focus rounded-full border border-[var(--ax-line-strong)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)]">Audit now</button>
                  <button type="button" onClick={() => unwatch(w.id)} className="ax-focus rounded-full border border-[var(--ax-line-strong)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-danger)]">Stop</button>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <CredentialVault
        credentials={credentials}
        onChange={(list) => {
          setCredentials(list);
          // A credential removed from the vault cannot stay selected in the composer.
          if (credentialId && !list.some((c) => c.id === credentialId)) setCredentialId("");
        }}
        onError={setNotice}
      />

      {/* ============ Usage ============ */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Token use" description="Input and output, stacked, last fortnight.">
          {loaded ? (
            <StackedArea labels={usage.labels} series={[{ label: "Input", tone: "var(--ax-accent)", points: usage.input }, { label: "Output", tone: "var(--ax-violet)", points: usage.output }]} />
          ) : (
            <Empty>Loading…</Empty>
          )}
        </Panel>
        <Panel title="Jobs by type">{byKind.length ? <DonutChart data={byKind} centreLabel="jobs" size={150} /> : <Empty>No jobs yet.</Empty>}</Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Activity" description="Jobs per day, last four weeks.">{loaded ? <HeatGrid values={heat} columns={14} /> : <Empty>Loading…</Empty>}</Panel>
        <Panel title="Spend by job" description="US cents.">{spend.length ? <BarList data={spend} unit="¢" /> : <Empty>Nothing billed yet.</Empty>}</Panel>
      </div>

      {/* ============ Jobs ============ */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Panel title="Jobs" description="Newest first." padded={false}>
          {jobs.length === 0 ? (
            <Empty>{loaded ? "Run a job and it will be listed here." : "Loading…"}</Empty>
          ) : (
            <ul>
              {jobs.map((job) => {
                const done = job.steps.filter((s) => s.state === "done").length;
                return (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(job.id)}
                      className={cn(
                        "ax-focus flex w-full items-center gap-3 border-b border-[var(--ax-line)] p-4 text-left transition-colors last:border-0",
                        active && job.id === active.id ? "bg-[rgba(var(--ax-glow),0.10)]" : "hover:bg-[rgba(var(--ax-glow),0.05)]",
                      )}
                    >
                      <RadialGauge value={done} max={Math.max(1, job.steps.length)} size={38} thickness={12} tone={STATE_TONE[job.state]} />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-[12.5px] font-medium text-[var(--ax-ink)]">{job.title}</span>
                        <span className="flex items-center gap-1.5 text-[10.5px] text-[var(--ax-ink-dim)]">
                          <Icon name={JOB_ICONS[job.kind]} className="size-3 shrink-0" strokeWidth={2} style={{ color: STATE_TONE[job.state] }} />
                          <span style={{ color: STATE_TONE[job.state] }}>{STATE_LABELS[job.state]}</span>· {relative(job.createdAt)} · ${job.cost.toFixed(2)}
                        </span>
                      </span>
                      <Sparkline series={job.steps.length ? job.steps.map((s) => s.seconds ?? 2) : [1, 1]} gradientId={`spark-${job.id}`} stroke={STATE_TONE[job.state]} className="h-7 w-14 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {active ? (
          <JobDetail job={active} onDecide={decide} onDelete={remove} onReply={reply} onWatch={watch} watched={watches.some((w) => w.url === active.options?.url && w.persona === (active.options?.persona ?? "first-time"))} />
        ) : (
          <Panel title="Job detail">
            <Empty>Select a job to see its steps, tokens and result.</Empty>
          </Panel>
        )}
      </div>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Note({ tone, children }: { tone: "warning" | "accent" | "danger"; children: React.ReactNode }) {
  const styles = {
    warning: "border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 text-[var(--ax-ink-muted)]",
    accent: "border-[var(--ax-accent)]/30 bg-[rgba(var(--ax-glow),0.07)] text-[var(--ax-ink-muted)]",
    danger: "border-[var(--ax-danger)]/35 bg-[var(--ax-danger)]/10 text-[var(--ax-danger)]",
  }[tone];
  return <p className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-2.5 text-[12px] leading-relaxed", styles)}>{children}</p>;
}

function StateChip({ state, pulse = false }: { state: AiJob["state"]; pulse?: boolean }) {
  return (
    <span
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]"
      style={{
        color: STATE_TONE[state],
        borderColor: `color-mix(in srgb, ${STATE_TONE[state]} 40%, transparent)`,
        background: `color-mix(in srgb, ${STATE_TONE[state]} 12%, transparent)`,
      }}
    >
      <span className={cn("size-1.5 rounded-full bg-current", pulse && "animate-pulse")} />
      {STATE_LABELS[state]}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-[12.5px] text-[var(--ax-ink-dim)]">{children}</p>;
}

function BigStat({ icon, label, value, series, tone, prefix = "", suffix = "", decimals }: { icon: string; label: string; value: number; series: number[]; tone: string; prefix?: string; suffix?: string; decimals?: number }) {
  return (
    <div className="ax-glass ax-edge-light relative flex flex-col gap-3 overflow-hidden rounded-2xl p-5">
      <span className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}>
          <Icon name={icon} className="size-4" strokeWidth={2} />
        </span>
        <span className="text-[12px] text-[var(--ax-ink-muted)]">{label}</span>
      </span>
      <span className="ax-display text-[28px] leading-none text-[var(--ax-ink)]">
        <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </span>
      <Sparkline series={series.length > 1 ? series : [0, 0]} gradientId={`big-${label.replace(/\s/g, "")}`} stroke={tone} className="h-9 w-full" />
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex items-center gap-2.5 rounded-xl border border-[var(--ax-line)] px-3 py-2.5">
      <span className="h-7 w-1 rounded-full" style={{ background: tone }} />
      <span className="flex flex-col">
        <span className="ax-display text-[17px] leading-none text-[var(--ax-ink)]">{value}</span>
        <span className="mt-0.5 text-[10.5px] text-[var(--ax-ink-dim)]">{label}</span>
      </span>
    </span>
  );
}

/** Stored sign-ins for the browser agent. Values are sealed on the server and never come back. */
function CredentialVault({ credentials, onChange, onError }: { credentials: CredentialSummary[]; onChange: (list: CredentialSummary[]) => void; onError: (m: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("name", name);
      form.append("host", host);
      const created = await api<CredentialSummary>("/api/admin/ai/credentials", { form });
      onChange([created, ...credentials]);
      setName("");
      setHost("");
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/ai/credentials/${id}`, { method: "DELETE" });
      onChange(credentials.filter((c) => c.id !== id));
      setConfirming(null);
    } catch (e) {
      onError(errorMessage(e));
    }
  }

  return (
    <Panel
      title="Sign-in credentials"
      description="A small file (.env, JSON or key: value lines) the agent may type into a sign-in form. Sealed on the server; the model only ever sees the field names."
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Northwind staging" className={FIELD} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Product host (optional)</span>
            <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="app.example.com" className={FIELD} />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="ax-focus inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-4 py-2.5 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] disabled:opacity-50"
          >
            <Icon name="lock" className="size-3.5" strokeWidth={2.1} />
            {busy ? "Sealing…" : "Add credentials file"}
          </button>
          <input ref={fileRef} type="file" hidden accept=".env,.txt,.json,text/plain,application/json" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
        </div>
        <p className="text-[11.5px] leading-relaxed text-[var(--ax-ink-dim)]">
          Use a staging or read-only account wherever you can: the agent is careful, but it is still an automated visitor with whatever rights that account has.
        </p>
        {credentials.length > 0 && (
          <ul className="flex flex-col divide-y divide-[var(--ax-line)] rounded-xl border border-[var(--ax-line)]">
            {credentials.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Icon name="lock" className="size-4 shrink-0 text-[var(--ax-accent-soft)]" strokeWidth={2} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-medium text-[var(--ax-ink)]">{c.name}{c.host ? <span className="text-[var(--ax-ink-dim)]"> · {c.host}</span> : null}</span>
                  <span className="truncate font-mono text-[10.5px] text-[var(--ax-ink-dim)]">
                    {c.fields.join(", ")}{c.lastUsedAt ? ` · last used ${relative(c.lastUsedAt)} ago` : ""}
                  </span>
                </span>
                {confirming === c.id ? (
                  <button type="button" onClick={() => remove(c.id)} className="ax-focus rounded-lg bg-[var(--ax-danger)]/14 px-2.5 py-1 text-[10.5px] font-semibold text-[var(--ax-danger)]">Confirm</button>
                ) : (
                  <button type="button" onClick={() => setConfirming(c.id)} aria-label={`Delete ${c.name}`} className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[var(--ax-danger)]/12 hover:text-[var(--ax-danger)]">
                    <Icon name="trash" className="size-4" strokeWidth={1.9} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

function JobDetail({ job, onDecide, onDelete, onReply, onWatch, watched }: { job: AiJob; onDecide: (id: string, d: "approve" | "discard") => void; onDelete: (id: string) => void; onReply: (id: string, message: string) => void; onWatch: (job: AiJob, hours: number) => void; watched: boolean }) {
  const total = job.tokens.input + job.tokens.output;
  const done = job.steps.filter((s) => s.state === "done").length;
  const steps = Math.max(1, job.steps.length);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [answer, setAnswer] = useState("");
  useEffect(() => {
    setConfirmDelete(false);
    setAnswer("");
  }, [job.id]);

  const art = job.artifacts;
  // Same rule as the server: a job that has written nothing for ten minutes is stuck, not busy.
  const stale = job.state === "running" && Date.now() - Date.parse(job.updatedAt ?? job.createdAt) > 10 * 60_000;

  return (
    <Panel
      title={job.title}
      description={`${JOB_LABELS[job.kind]} · ${job.model}${job.options?.resolution ? ` · ${job.options.resolution}` : ""}`}
      action={
        <span className="flex items-center gap-2">
          <StateChip state={job.state} pulse={job.state === "running"} />
          {(job.state !== "running" || stale) && (
            <button
              type="button"
              onClick={() => (confirmDelete ? onDelete(job.id) : setConfirmDelete(true))}
              className={cn(
                "ax-focus rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors",
                confirmDelete ? "border-[var(--ax-danger)]/50 bg-[var(--ax-danger)]/12 text-[var(--ax-danger)]" : "border-[var(--ax-line)] text-[var(--ax-ink-dim)] hover:text-[var(--ax-ink)]",
              )}
            >
              {confirmDelete ? "Confirm delete" : "Delete"}
            </button>
          )}
        </span>
      }
    >
      <div className="flex flex-col gap-5">
        {(job.prompt || job.options?.url) && (
          <p className="rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[var(--ax-ink-muted)]">
            <span className="ax-eyebrow mr-2">Asked</span>
            {job.options?.url && <span className="font-mono text-[11.5px] text-[var(--ax-ink)]">{job.options.url} </span>}
            {job.prompt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-6">
          <RadialGauge value={done} max={steps} size={104} tone={STATE_TONE[job.state]} label={`${Math.round((done / steps) * 100)}%`} caption="complete" />
          <div className="flex min-w-[190px] flex-1 flex-col gap-2.5">
            <span className="flex items-baseline justify-between">
              <span className="ax-eyebrow">Tokens</span>
              <span className="font-mono text-[11.5px] text-[var(--ax-ink)]">{total.toLocaleString()} · ${job.cost.toFixed(3)}</span>
            </span>
            <span className="flex h-2.5 overflow-hidden rounded-full bg-[rgba(var(--ax-glow),0.10)]">
              <span className="h-full bg-[var(--ax-accent)] transition-[width] duration-700" style={{ width: `${total ? (job.tokens.input / total) * 100 : 0}%` }} />
              <span className="h-full bg-[var(--ax-violet)] transition-[width] duration-700" style={{ width: `${total ? (job.tokens.output / total) * 100 : 0}%` }} />
            </span>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-[var(--ax-ink-muted)]">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[var(--ax-accent)]" />Input {job.tokens.input.toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[var(--ax-violet)]" />Output {job.tokens.output.toLocaleString()}</span>
              {job.tokens.cached ? <span className="text-[var(--ax-ink-dim)]">{job.tokens.cached.toLocaleString()} cached</span> : null}
              {job.turns ? <span className="text-[var(--ax-ink-dim)]">{job.turns} turn{job.turns === 1 ? "" : "s"}</span> : null}
            </span>
          </div>
        </div>

        {job.steps.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="ax-eyebrow">Each step, and how long it took</span>
            <StepRail steps={job.steps} />
          </div>
        )}

        {job.steps.some((s) => s.detail) && (
          <ul className="flex flex-col gap-1.5 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)] p-3">
            {job.steps.filter((s) => s.detail).map((s) => (
              <li key={s.label} className="flex gap-2 text-[11.5px] leading-snug">
                <span className="shrink-0 text-[var(--ax-ink-dim)]">{s.label}</span>
                <span className="min-w-0 break-words text-[var(--ax-ink-muted)]">— {s.detail}</span>
              </li>
            ))}
          </ul>
        )}

        {job.error && (
          <Note tone="danger">
            <Icon name="x" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.6} />
            {job.error}
          </Note>
        )}

        {((job.question && job.state === "review") || (job.kind === "site-edit" && (job.state === "review" || job.state === "done"))) && (
          <div className={`flex flex-col gap-3 rounded-xl border p-4 ${job.question ? "border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/8" : "border-[var(--ax-line)] bg-[var(--ax-surface-2)]/40"}`}>
            {job.question ? (
              <p className="text-[13px] leading-relaxed text-[var(--ax-ink)]">
                <span className="ax-eyebrow mr-2 text-[var(--ax-warning)]">The agent asks</span>
                {job.question}
              </p>
            ) : (
              <p className="text-[12.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                <span className="ax-eyebrow mr-2 text-[var(--ax-accent-soft)]">Carry on</span>
                Ask for more on top of this, in the same conversation. One Discard puts back everything since you last pressed Keep.
              </p>
            )}
            <div className="flex gap-2">
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && answer.trim()) {
                    onReply(job.id, answer.trim());
                    setAnswer("");
                  }
                }}
                placeholder={job.question ? "Your answer" : "What else should change?"}
                className={FIELD}
              />
              <button
                type="button"
                disabled={!answer.trim()}
                onClick={() => {
                  onReply(job.id, answer.trim());
                  setAnswer("");
                }}
                className="ax-focus shrink-0 rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-4 py-2 text-[12.5px] font-semibold text-white disabled:opacity-50"
              >
                {job.question ? "Answer" : "Send"}
              </button>
            </div>
          </div>
        )}

        {art?.videoSrc && (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.06)] p-3.5">
            <video src={art.videoSrc} poster={art.posterSrc} controls preload="metadata" className="w-full rounded-lg bg-black" />
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-[var(--ax-ink-muted)]">
              <span>
                {art.width}×{art.height} · {art.seconds}s · H.264
                {art.productSlug && (
                  <>
                    {" · attached to "}
                    <Link href={`/products/${art.productSlug}`} className="text-[var(--ax-accent-soft)] underline underline-offset-2">/products/{art.productSlug}</Link>
                  </>
                )}
              </span>
              <a href={art.videoSrc} download className="ax-focus inline-flex items-center gap-1.5 rounded-full border border-[var(--ax-line-strong)] px-3 py-1.5 font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)]">
                <Icon name="upload" className="size-3.5 rotate-180" strokeWidth={2} />
                Download MP4
              </a>
            </div>
          </div>
        )}

        {art?.screens && art.screens.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="ax-eyebrow">Screens the agent captured</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {art.screens.map((s) => (
                <figure key={s.id} className="overflow-hidden rounded-lg border border-[var(--ax-line)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt={s.label} loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
                  <figcaption className="truncate px-2 py-1 text-[10.5px] text-[var(--ax-ink-dim)]">{s.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {art?.audit && (
          <div className="flex flex-col gap-3">
            <AuditReportView audit={art.audit} />
            <div className="flex flex-wrap items-center gap-2">
              <a href={`/api/admin/ai/jobs/${job.id}/report`} className="ax-focus rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-3.5 py-1.5 text-[11.5px] font-semibold text-white transition-all hover:brightness-110">
                Download the report
              </a>
              {watched ? (
                <span className="text-[11.5px] text-[var(--ax-ink-dim)]">This product is being watched.</span>
              ) : (
                <>
                  <button type="button" onClick={() => onWatch(job, 24)} className="ax-focus rounded-full border border-[var(--ax-line-strong)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)]">Re-audit daily</button>
                  <button type="button" onClick={() => onWatch(job, 168)} className="ax-focus rounded-full border border-[var(--ax-line-strong)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)]">Re-audit weekly</button>
                  <span className="text-[11px] text-[var(--ax-ink-dim)]">You are told when the verdict moves.</span>
                </>
              )}
            </div>
          </div>
        )}

        {(job.output || (art?.changes && art.changes.length > 0)) && (
          <div className="flex flex-col gap-3 rounded-xl border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.06)] p-3.5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex min-w-0 items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[rgba(var(--ax-glow),0.14)] text-[var(--ax-accent-soft)]">
                  <Icon name={job.output?.kind === "video" ? "play" : job.output?.kind === "patch" ? "settings" : job.output?.kind === "audit" ? "shield" : "file"} className="size-4" strokeWidth={2} />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[12.5px] font-semibold text-[var(--ax-ink)]">
                    {job.state === "discarded" ? "Put back" : job.output?.kind === "patch" ? "Applied to the site" : job.output?.kind === "video" ? "Film" : job.output?.kind === "audit" ? "Verdict" : "Result"}
                  </span>
                  {job.output?.summary && <span className="break-words text-[11.5px] leading-relaxed text-[var(--ax-ink-muted)]">{job.output.summary}</span>}
                  {art?.changes && art.changes.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-0.5 font-mono text-[10.5px] text-[var(--ax-ink-dim)]">
                      {art.changes.map((c, i) => <li key={i}>· {c}</li>)}
                    </ul>
                  )}
                  {art?.productSlug && !art.videoSrc && (
                    <Link href={`/products/${art.productSlug}`} className="text-[11.5px] text-[var(--ax-accent-soft)] underline underline-offset-2">/products/{art.productSlug}</Link>
                  )}
                </span>
              </span>
              {job.state === "review" && !job.question && (
                <span className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => onDecide(job.id, "discard")} className="ax-focus rounded-full border border-[var(--ax-line-strong)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)]">
                    Discard &amp; revert
                  </button>
                  <button type="button" onClick={() => onDecide(job.id, "approve")} className="ax-focus rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-3 py-1.5 text-[11.5px] font-semibold text-white transition-all hover:brightness-110">
                    Keep
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

/** The audit as a reader wants it: the verdict, then the scores, then every finding with its evidence. */
function AuditReportView({ audit }: { audit: AuditReport }) {
  const r = READINESS[audit.readiness];
  const overall = Math.round(audit.scores.reduce((a, s) => a + s.score, 0) / Math.max(1, audit.scores.length));
  const count = (sev: string) => audit.issues.filter((i) => i.severity === sev).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${r.tone} 40%, transparent)`, background: `color-mix(in srgb, ${r.tone} 9%, transparent)` }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white" style={{ background: r.tone }}>{overall}</span>
            <span className="flex flex-col">
              <span className="text-[14px] font-semibold text-[var(--ax-ink)]">{r.label}</span>
              <span className="text-[11.5px] text-[var(--ax-ink-muted)]">Overall {overall} of 100 · {audit.checks.screens} screens · {audit.checks.linksChecked} links followed · {audit.checks.mobileChecked} phone-width checks</span>
            </span>
          </span>
          <span className="flex flex-wrap gap-1.5">
            {(["critical", "high", "medium", "low"] as const).map((sev) => (
              <span key={sev} className="rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider" style={{ borderColor: `color-mix(in srgb, ${SEVERITY_TONE[sev]} 45%, transparent)`, color: count(sev) ? SEVERITY_TONE[sev] : "var(--ax-ink-dim)" }}>
                {count(sev)} {sev}
              </span>
            ))}
          </span>
        </div>
        <p className="text-[12.5px] leading-relaxed text-[var(--ax-ink)]">{audit.summary}</p>
      </div>

      <div>
        <span className="ax-eyebrow text-[var(--ax-ink-dim)]">Scores, with the reasons</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {audit.scores.map((s) => (
            <details key={s.key} className="group rounded-lg border border-[var(--ax-line)] bg-[var(--ax-surface-2)]/40 px-3 py-2.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="text-[12px] font-medium text-[var(--ax-ink)]">{s.label}</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--ax-line)]">
                    <span className="block h-full rounded-full" style={{ width: `${s.score}%`, background: s.score >= 85 ? "var(--ax-success)" : s.score >= 70 ? "var(--ax-warning)" : "var(--ax-danger)" }} />
                  </span>
                  <span className="w-7 text-right font-mono text-[12px] text-[var(--ax-ink)]">{s.score}</span>
                </span>
              </summary>
              <ul className="mt-2 flex flex-col gap-1 text-[11.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                {s.reasons.map((why, i) => <li key={i}>· {why}</li>)}
              </ul>
            </details>
          ))}
        </div>
      </div>

      {audit.issues.length > 0 && (
        <div>
          <span className="ax-eyebrow text-[var(--ax-ink-dim)]">Findings, most serious first</span>
          <ul className="mt-2 flex flex-col gap-2">
            {audit.issues.map((it, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-[var(--ax-line)] p-3">
                {it.screen && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a href={it.screen} target="_blank" rel="noreferrer" className="shrink-0"><img src={it.screen} alt="" loading="lazy" className="h-14 w-22 rounded-md border border-[var(--ax-line)] object-cover object-top" /></a>
                )}
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white" style={{ background: SEVERITY_TONE[it.severity] }}>{it.severity}</span>
                    <span className="text-[10.5px] uppercase tracking-wider text-[var(--ax-ink-dim)]">{it.area}</span>
                    <span className="text-[12.5px] font-medium text-[var(--ax-ink)]">{it.title}</span>
                  </span>
                  <span className="text-[11.5px] leading-relaxed text-[var(--ax-ink-muted)]">{it.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {audit.recommended.length > 0 && (
        <div>
          <span className="ax-eyebrow text-[var(--ax-ink-dim)]">Recommended next</span>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-[12px] leading-relaxed text-[var(--ax-ink)]">
            {audit.recommended.map((rec, i) => <li key={i}>{rec}</li>)}
          </ol>
        </div>
      )}

      <div className="grid gap-2 text-[11px] text-[var(--ax-ink-dim)] sm:grid-cols-2">
        <span>Console errors {audit.checks.consoleErrors} · failed requests {audit.checks.failedRequests} · broken links {audit.checks.brokenLinks} of {audit.checks.linksChecked}</span>
        <span>Slow screens {audit.checks.slowPages} · phone overflow {audit.checks.mobileOverflow} of {audit.checks.mobileChecked} · images without alt {audit.checks.missingAlt} · unlabeled fields {audit.checks.unlabeledFields}</span>
      </div>

      {audit.map.length > 0 && (
        <details className="rounded-lg border border-[var(--ax-line)] px-3 py-2">
          <summary className="cursor-pointer text-[11.5px] font-medium text-[var(--ax-ink-muted)]">The product as the agent found it</summary>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-[10.5px] leading-relaxed text-[var(--ax-ink-dim)]">{audit.map.join("\n")}</pre>
        </details>
      )}
    </div>
  );
}
