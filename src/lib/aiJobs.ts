/**
 * Shapes for the AI Studio, shared by the portal and the job runner in
 * `src/server/ai.ts`. Jobs are created through `POST /api/admin/ai/jobs` and
 * read back through `GET`.
 */

export type JobKind =
  | "site-edit"
  | "product-audit"
  | "product-video"
  | "product-import"
  /** Older rows only; the portal no longer offers these. */
  | "copy-rewrite"
  | "image-generate";

/** What the composer offers. */
export const ACTIVE_KINDS: JobKind[] = ["site-edit", "product-audit", "product-video", "product-import"];

/** How a product film is staged. */
export type FilmStyle = "showroom" | "studio" | "recording";

export const FILM_STYLES: { value: FilmStyle; label: string; hint: string }[] = [
  { value: "showroom", label: "Showroom", hint: "A photographed room, the product on a laptop, focus pulled between the two" },
  { value: "studio", label: "Studio", hint: "A dark lit studio, the laptop large and floating, the product's colour in the light" },
  { value: "recording", label: "Screen recording", hint: "The screens themselves, full frame, with slow pushes and lower-third captions" },
];

export type JobState = "queued" | "running" | "review" | "done" | "failed" | "discarded";

export interface JobStep {
  label: string;
  state: "done" | "running" | "queued" | "failed";
  /** Short note on what happened, shown under the step. */
  detail?: string;
  /** Seconds the step took, once finished. */
  seconds?: number;
}

export interface TokenUse {
  input: number;
  output: number;
  /** Cached input tokens, billed at a lower rate. */
  cached?: number;
}

export type Resolution = "1080p" | "4k";

export interface JobOptions {
  /** The product's address, for browsing jobs. */
  url?: string;
  /** Stored credential the browser may type; the model never sees its values. */
  credentialId?: string;
  resolution?: Resolution;
  /** Target film length. */
  seconds?: number;
  /** Attach the finished film to this product. */
  productSlug?: string;
  /** Uploaded audio laid under the film. */
  musicMediaId?: string;
  /** How the film is staged; left out, it is read from the request. */
  style?: FilmStyle;
  /** Which photographed set the showroom uses (a background plate id). */
  plateId?: string;
  /** Who an audit walks as. */
  persona?: AuditPersona;
  /** Set when a scheduled watch queued the audit. */
  watchId?: string;
}

/** Who the audit walks as; it changes what the agent looks for and how the report is judged. */
export type AuditPersona = "first-time" | "power" | "mobile" | "buyer" | "accessibility";

export const PERSONAS: { value: AuditPersona; label: string; hint: string }[] = [
  { value: "first-time", label: "First-time customer", hint: "Knows nothing about the product; judges clarity and onboarding" },
  { value: "power", label: "Power user", hint: "Uses it all day; judges speed, shortcuts and consistency" },
  { value: "mobile", label: "Phone user", hint: "Every screen checked at phone width" },
  { value: "buyer", label: "Evaluator", hint: "Deciding whether to buy; judges trust, completeness and polish" },
  { value: "accessibility", label: "Accessibility-focused", hint: "Keyboard, labels, contrast and structure first" },
];

/** A product the studio re-audits on a schedule, telling you when the verdict moves. */
export interface AiWatch {
  id: string;
  name: string;
  url: string;
  credentialId?: string;
  persona: AuditPersona;
  /** Hours between audits. */
  hours: number;
  createdAt: string;
  lastRunAt?: string;
  lastJobId?: string;
  lastVerdict?: AuditReadiness;
  lastOverall?: number;
  lastCritical?: number;
  nextRunAt?: string;
}

export type AuditReadiness = "ready" | "review" | "not-ready";
export type IssueSeverity = "critical" | "high" | "medium" | "low";

export interface AuditScore {
  key: string;
  label: string;
  score: number;
  reasons: string[];
}

export interface AuditIssue {
  severity: IssueSeverity;
  area: string;
  title: string;
  detail: string;
  /** Evidence: the screen this was seen on. */
  screen?: string;
}

/** What the audit measured for itself, before the model's judgement. */
export interface AuditChecks {
  screens: number;
  pages: number;
  consoleErrors: number;
  failedRequests: number;
  brokenLinks: number;
  linksChecked: number;
  slowPages: number;
  mobileOverflow: number;
  mobileChecked: number;
  missingAlt: number;
  unlabeledFields: number;
  missingMeta: number;
  insecureLinks: number;
}

export interface AuditReport {
  readiness: AuditReadiness;
  /** The persona the audit was made as, as a label. */
  persona?: string;
  /** What the product does and how it felt to use, in a few sentences. */
  summary: string;
  scores: AuditScore[];
  issues: AuditIssue[];
  recommended: string[];
  checks: AuditChecks;
  /** The product as the agent found it: one line per screen. */
  map: string[];
}

export interface JobArtifacts {
  videoId?: string;
  videoSrc?: string;
  posterId?: string;
  posterSrc?: string;
  seconds?: number;
  width?: number;
  height?: number;
  screens?: { id: string; src: string; label: string }[];
  /** The product a film was attached to, or an import created. */
  productSlug?: string;
  /** Human-readable list of what a site job changed. */
  changes?: string[];
  /** The result of a product audit. */
  audit?: AuditReport;
}

export interface AiJob {
  id: string;
  kind: JobKind;
  title: string;
  /** What the operator asked for, verbatim. */
  prompt: string;
  state: JobState;
  createdAt: string;
  /** Last time the runner wrote to the job; how "stuck" is told from "busy". */
  updatedAt?: string;
  finishedAt?: string;
  model: string;
  tokens: TokenUse;
  /** USD, priced from the provider's reported usage. */
  cost: number;
  steps: JobStep[];
  /** Populated when the job produced something reviewable. */
  output?: { kind: "video" | "image" | "text" | "patch" | "audit"; summary: string };
  error?: string;
  options?: JobOptions;
  artifacts?: JobArtifacts;
  /** Set when the agent stopped to ask something; answer with a reply. */
  question?: string;
  /** Conversation turns so far, for site jobs. */
  turns?: number;
}

export const JOB_LABELS: Record<JobKind, string> = {
  "site-edit": "Change the site",
  "product-audit": "Audit a product",
  "product-video": "Product film",
  "product-import": "Import a product",
  "copy-rewrite": "Rewrite copy",
  "image-generate": "Generate an image",
};

export const JOB_ICONS: Record<JobKind, string> = {
  "site-edit": "settings",
  "product-audit": "shield",
  "product-video": "play",
  "product-import": "package",
  "copy-rewrite": "pencil",
  "image-generate": "image",
};

export const STATE_LABELS: Record<JobState, string> = {
  queued: "Queued",
  running: "Running",
  review: "Needs review",
  done: "Done",
  failed: "Failed",
  discarded: "Discarded",
};

export const STATE_TONE: Record<JobState, string> = {
  queued: "var(--ax-ink-dim)",
  running: "var(--ax-accent)",
  review: "var(--ax-warning)",
  done: "var(--ax-success)",
  failed: "var(--ax-danger)",
  discarded: "var(--ax-ink-dim)",
};

/** List prices per million tokens (input / output); cache reads are billed at a tenth of input. */
export const MODEL_RATES: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-opus-5": { input: 5, output: 25 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

/** What a job's usage costs at list price. Cache writes are counted as plain input, a small undercount. */
export function costOf(model: string, tokens: TokenUse): number {
  const rate = MODEL_RATES[model] ?? MODEL_RATES["claude-sonnet-5"];
  const cached = tokens.cached ?? 0;
  const fresh = Math.max(0, tokens.input - cached);
  return Number(((fresh / 1_000_000) * rate.input + (cached / 1_000_000) * rate.input * 0.1 + (tokens.output / 1_000_000) * rate.output).toFixed(4));
}

/** A stored credential as the portal sees it: names only, never values. */
export interface CredentialSummary {
  id: string;
  name: string;
  host: string;
  fields: string[];
  createdAt: string;
  lastUsedAt?: string;
}

/** What the studio can do on this machine right now. */
export interface StudioStatus {
  provider: "anthropic" | "mock" | "none";
  chrome: boolean;
  ffmpeg: boolean;
}
