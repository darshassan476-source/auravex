import type { MessageParam } from "@anthropic-ai/sdk/resources/messages/messages";

/**
 * The scripted operator, as pure policy.
 *
 * It reads the same tool results the real model would and follows a fixed,
 * sensible course for each task, so tests prove the machinery around the
 * model rather than the model itself. Everything it needs to know is read
 * back from the transcript, so it keeps no state of its own — which lets the
 * same policy answer through the in-process provider and through a
 * wire-level stand-in for the Anthropic API alike.
 *
 * This file is loaded by plain Node as well as by Next, so it must stay free
 * of framework imports.
 */

export interface PolicyCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface PolicyTurn {
  text: string;
  calls: PolicyCall[];
}

export type PolicyTask = "site" | "browse" | "plan" | "import" | "audit";

type Digest = { rows: string[]; text: string; url: string };

/** Which agent a system prompt belongs to; the wire stand-in has nothing else to go on. */
export function taskOf(system: string): PolicyTask {
  if (/operate the AURAVEX website/i.test(system)) return "site";
  if (/exploring a web product/i.test(system)) return "browse";
  if (/director of a/i.test(system)) return "plan";
  if (/write the audit/i.test(system)) return "audit";
  return "import";
}

function blockText(content: MessageParam["content"]): string {
  if (typeof content === "string") return content;
  return content.map((c) => (c.type === "text" ? c.text : "")).join("\n");
}

/** Every tool call the assistant has made so far, oldest first, with the result each got. */
function history(messages: MessageParam[]): { name: string; input: Record<string, unknown>; result: string }[] {
  const calls: { id: string; name: string; input: Record<string, unknown>; result: string }[] = [];
  for (const m of messages) {
    if (typeof m.content === "string") continue;
    if (m.role === "assistant") {
      for (const b of m.content) if (b.type === "tool_use") calls.push({ id: b.id, name: b.name, input: (b.input ?? {}) as Record<string, unknown>, result: "" });
    } else {
      for (const b of m.content) {
        if (b.type !== "tool_result") continue;
        const c = calls.find((x) => x.id === b.tool_use_id);
        if (c) c.result = typeof b.content === "string" ? b.content : (b.content ?? []).map((x) => (x.type === "text" ? x.text : "")).join("\n");
      }
    }
  }
  return calls;
}

function parseDigest(text: string | null): Digest {
  if (!text) return { rows: [], text: "", url: "" };
  const rows = text.split("\n").filter((l) => /^#\d+ /.test(l));
  const url = /^URL: (.+)$/m.exec(text)?.[1] ?? "";
  return { rows, text, url };
}

function firstUserText(messages: MessageParam[]): string {
  const m = messages.find((x) => x.role === "user");
  return m ? blockText(m.content) : "";
}

/** The owner's most recent words: the original ask, or the answer to a question. */
function lastUserText(messages: MessageParam[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const text = blockText(m.content);
    if (text.trim()) return text;
  }
  return "";
}

function refOf(rows: string[], pattern: RegExp): string | null {
  const row = rows.find((r) => pattern.test(r));
  return row ? (/^#(\d+)/.exec(row)?.[1] ?? null) : null;
}

let counter = 0;
const call = (name: string, input: Record<string, unknown>): PolicyCall => ({ id: `mock-${++counter}`, name, input });

export function decide(task: PolicyTask, messages: MessageParam[]): PolicyTurn {
  switch (task) {
    case "site":
      return site(messages);
    case "browse":
      return browse(messages);
    case "plan":
      return plan(messages);
    case "audit":
      return audit(messages);
    default:
      return importEntry(messages);
  }
}

function site(messages: MessageParam[]): PolicyTurn {
  const asked = lastUserText(messages);
  // Acted on the latest request already? Then the only thing left is to say so.
  const lastUser = messages.map((m, i) => ({ m, i })).filter(({ m }) => m.role === "user" && blockText(m.content).trim()).pop();
  const acted = messages.slice((lastUser?.i ?? -1) + 1).some((m) => m.role === "assistant" && Array.isArray(m.content) && m.content.some((b) => b.type === "tool_use"));
  if (acted) return { text: "Done. I changed exactly what you asked for; use Discard to put it back.", calls: [] };
  const calls: PolicyCall[] = [];
  for (const m of asked.matchAll(/set\s+([\w.-]+)\s+to\s+"([^"]+)"/gi)) calls.push(call("set_text", { id: m[1], value: m[2] }));
  for (const m of asked.matchAll(/hide\s+product\s+([\w-]+)/gi)) calls.push(call("update_product", { slug: m[1], hidden: true }));
  for (const m of asked.matchAll(/background\s+of\s+([\w-]+)\s+to\s+([\w-]+)/gi)) calls.push(call("set_background", { page: m[1], plateId: m[2] }));
  if (!calls.length) return { text: "Which field or page should change, and to what?", calls: [] };
  return { text: "", calls };
}

function browse(messages: MessageParam[]): PolicyTurn {
  const asked = firstUserText(messages);
  const url = /https?:\/\/\S+/.exec(asked)?.[0]?.replace(/[),.]+$/, "") ?? "";
  const hasCredential = /credential fields available:/i.test(asked);
  const past = history(messages);
  const reads = past.filter((c) => c.name === "read_page");
  const digest = parseDigest(reads.length ? reads[reads.length - 1].result : null);
  const triedSignIn = past.some((c) => c.name === "type_secret");
  // Only clicks made after the first capture count as sections; the sign-in button comes before it.
  const firstCapture = past.findIndex((c) => c.name === "capture_screen");
  const clicked = (firstCapture < 0 ? [] : past.slice(firstCapture + 1)).filter((c) => c.name === "click").map((c) => /^Clicked "([^"]*)"/.exec(c.result)?.[1] ?? "").filter(Boolean);
  const captured = past.filter((c) => c.name === "capture_screen").map((c) => String(c.input.label ?? ""));
  const scrolls = past.filter((c) => c.name === "record_scroll").length;
  const lastLabel = clicked[clicked.length - 1] ?? "";
  const auditing = /audit mode/i.test(asked);
  const noted = past.filter((c) => c.name === "note_issue").length;

  if (!past.some((c) => c.name === "navigate")) return { text: "", calls: [call("navigate", { url })] };
  if (reads.length === 0) return { text: "", calls: [call("read_page", {})] };

  const password = refOf(digest.rows, /input\[password\]/);
  if (password) {
    if (!hasCredential || triedSignIn) {
      return { text: "The sign-in form is still showing.", calls: [call("finish", { summary: "Could not sign in.", success: false })] };
    }
    const user = refOf(digest.rows, /input\[(email|text)\]/) ?? refOf(digest.rows, /input(?!\[password\])/);
    const submit = refOf(digest.rows, /button|input\[submit\]/);
    const calls: PolicyCall[] = [];
    if (user) calls.push(call("type_secret", { ref: user, field: "username" }));
    calls.push(call("type_secret", { ref: password, field: "password" }));
    if (submit) calls.push(call("click", { ref: submit }));
    calls.push(call("read_page", {}));
    return { text: "", calls };
  }

  // Signed in (or nothing to sign into): a fixed walk, each beat decided from what has been done.
  const nextLink = () => {
    const row = digest.rows.find((r) => {
      const m = /^#(\d+) a "([^"]+)" -> (\S+)/.exec(r);
      if (!m) return false;
      if (clicked.includes(m[2])) return false;
      if (/sign out|log ?out|settings|overview|delete|remove/i.test(m[2])) return false;
      return !m[3].startsWith("#");
    });
    if (!row) return null;
    const m = /^#(\d+) a "([^"]+)"/.exec(row)!;
    return { ref: m[1], label: m[2] };
  };

  if (!captured.includes("Overview")) return { text: "", calls: [call("capture_screen", { label: "Overview" })] };
  if (clicked.length < 1) {
    const link = nextLink();
    if (link) return { text: "", calls: [call("click", { ref: link.ref }), call("read_page", {})] };
    if (!captured.includes("Detail")) return { text: "", calls: [call("capture_screen", { label: "Detail" })] };
    return { text: "", calls: [call("finish", { summary: "Walked what was reachable and captured it.", success: true })] };
  }
  if (auditing && captured.length >= 1 && noted < 1) {
    return { text: "", calls: [call("note_issue", { severity: "medium", area: "Navigation", title: "Sign out sits in the main navigation", detail: "A destructive action is one click from every screen, next to the sections people use all day." })] };
  }
  if (scrolls < 1) {
    return { text: "", calls: [call("capture_screen", { label: lastLabel || "Detail" }), call("record_scroll", { label: `${lastLabel || "Detail"} scroll`, seconds: 3 })] };
  }
  if (clicked.length < 2) {
    const link = nextLink();
    if (link) return { text: "", calls: [call("click", { ref: link.ref }), call("read_page", {})] };
  }
  if (clicked.length >= 2 && !captured.includes(lastLabel)) return { text: "", calls: [call("capture_screen", { label: lastLabel })] };
  return { text: "", calls: [call("finish", { summary: "Signed in, walked the main screens and captured them.", success: true })] };
}

function plan(messages: MessageParam[]): PolicyTurn {
  const asked = firstUserText(messages);
  const screens = [...asked.matchAll(/^- (screen|clip) "([^"]+)"/gm)].map((m) => ({ kind: m[1], label: m[2] }));
  const name = /Product: (.+)$/m.exec(asked)?.[1]?.trim() ?? "The product";
  const shots = [
    { kind: "title", seconds: 4, caption: name, sub: "A closer look" },
    ...screens.map((s, i) => ({
      kind: s.kind,
      seconds: 5,
      label: s.label,
      caption: i === 0 ? "Everything in one place" : s.label,
      sub: i === 0 ? "The overview your team opens first" : "Built for the way you work",
    })),
    { kind: "outro", seconds: 4, caption: "Book a walkthrough", sub: "auravex.com" },
  ];
  return { text: JSON.stringify({ logline: `${name}, at work.`, shots }), calls: [] };
}

function audit(messages: MessageParam[]): PolicyTurn {
  const asked = firstUserText(messages);
  const name = /Product: (.+)$/m.exec(asked)?.[1]?.trim() ?? "The product";
  const n = (key: string) => Number(new RegExp(`${key}: (\\d+)`).exec(asked)?.[1] ?? 0);
  const consoleErrors = n("Console errors");
  const overflow = n("Pages overflowing on a phone");
  const scores = [
    { key: "usability", score: 86, reasons: ["The main sections are one click away and each screen states its purpose in a heading."] },
    { key: "clarity", score: 84, reasons: ["Labels are plain words; the overview explains what the numbers mean."] },
    { key: "navigation", score: 88, reasons: ["Five top-level sections, no nesting; the current section is marked."] },
    { key: "onboarding", score: 72, reasons: ["Nothing greets a first-time user beyond the dashboard itself; no guided first step."] },
    { key: "consistency", score: 90, reasons: ["Cards, tables and buttons share one style across every screen seen."] },
    { key: "errorHandling", score: 70, reasons: ["No error or empty states were reachable during the walk, so they are unproven."] },
    { key: "content", score: 85, reasons: ["Short, specific copy; a few placeholder-looking rows in lists."] },
  ];
  const issues = [
    { severity: overflow ? "high" : "low", area: "Mobile", title: overflow ? "A screen overflows sideways on a phone" : "Phone layout holds", detail: overflow ? "At 390px wide the page is wider than the screen, so parts of it are cut off." : "No horizontal overflow at 390px on the screens checked.", screen: 1 },
    { severity: consoleErrors ? "medium" : "low", area: "Reliability", title: consoleErrors ? "Errors in the browser console" : "Console clean", detail: consoleErrors ? `${consoleErrors} console error(s) appeared while using the product.` : "No console errors while using the product.", screen: 1 },
  ];
  return {
    text: JSON.stringify({
      summary: `${name} is an operations dashboard: an overview of open work, a pipeline board and a reports view, all reachable from one navigation bar. It felt quick and plain to use; it has no onboarding and its error states were not reachable.`,
      readiness: overflow ? "review" : "ready",
      scores,
      issues,
      recommended: ["Add a first-run guide or an empty-state message on the overview.", "Move Sign out out of the primary navigation.", "Show a friendly message when a list has no rows."],
    }),
    calls: [],
  };
}

function importEntry(messages: MessageParam[]): PolicyTurn {
  const asked = firstUserText(messages);
  const title = /Page title: (.+)$/m.exec(asked)?.[1]?.trim() || "Imported product";
  const name = title.split(/[|·—-]/)[0].trim().slice(0, 40) || "Imported product";
  return {
    text: JSON.stringify({
      name,
      tagline: "Seen through its own screens",
      summary: `${name} was explored and catalogued by the AI Studio from its live interface.`,
      description: "The catalogue entry was drafted from what the agent saw: the sign-in, the overview and the main working screens.",
      category: "saas",
      sector: "Operations",
      features: [
        { title: "Overview", description: "The first screen the team sees.", icon: "grid" },
        { title: "Workspace", description: "Where the day's work happens.", icon: "layers" },
      ],
      stack: ["Web"],
      tags: ["imported"],
    }),
    calls: [],
  };
}
