import "server-only";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * A headless Chrome the agents can drive, over the DevTools protocol.
 *
 * One page per browser. Everything the model can do goes through a small
 * set of verbs — navigate, read, click, type, scroll, capture — and the
 * verbs enforce the rules: stay on the product's host, never press a
 * destructive control, never reveal a typed secret.
 */

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean) as string[];

export function chromePath(): string {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error("Chrome was not found. Install Google Chrome or set CHROME_PATH in .env.");
  return found;
}

const DESTRUCTIVE =
  /\b(delete|remove|destroy|drop|erase|wipe|revoke|deactivate|terminate|unsubscribe|cancel (?:plan|subscription|account)|close account|pay now|purchase|buy now|checkout|transfer|send money|reset all|factory reset)\b/i;

export interface Digest {
  title: string;
  url: string;
  rows: string[];
  text: string;
  scroll: { y: number; h: number; vh: number };
}

export interface ClipFrame {
  data: Buffer;
  at: number;
}

/** What a page says about itself, measured rather than judged. */
export interface PageFacts {
  url: string;
  title: string;
  description: string;
  hasCanonical: boolean;
  hasViewportMeta: boolean;
  lang: string;
  h1Count: number;
  imagesWithoutAlt: number;
  images: number;
  unlabeledFields: number;
  fields: number;
  insecureLinks: number;
  internalLinks: string[];
  overflowsHorizontally: boolean;
  /** Milliseconds from navigation start to the load event, when known. */
  loadMs: number | null;
  wordCount: number;
}

export interface Evidence {
  consoleErrors: string[];
  failedRequests: { url: string; status: number }[];
}

interface CdpMessage {
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: { message: string };
}

export interface BrowserOptions {
  width?: number;
  height?: number;
  /** Device pixel ratio; 2 on a 1920×1080 window yields 4K captures. */
  scale?: number;
  /** Hosts the page may visit; empty means anywhere. */
  allowHosts?: string[];
  allowDestructive?: boolean;
}

/** Raised when the browser itself is gone; agents stop rather than retry. */
export class FatalError extends Error {}

export class Browser {
  private proc!: ChildProcess;
  private ws!: WebSocket;
  private dead: string | null = null;
  private seq = 0;
  private pending = new Map<number, { resolve: (v: Record<string, unknown>) => void; reject: (e: Error) => void }>();
  private listeners = new Map<string, Set<(params: Record<string, unknown>) => void>>();
  private profile = "";
  /** The last off-site address the lock refused, so the agent can be told why nothing happened. */
  private blocked: string | null = null;
  /** Errors and failed requests since the last time they were collected. */
  private consoleErrors: string[] = [];
  private failedRequests: { url: string; status: number }[] = [];
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  private allowHosts: string[];
  private allowDestructive: boolean;

  constructor(options: BrowserOptions = {}) {
    this.width = options.width ?? 1440;
    this.height = options.height ?? 900;
    this.scale = options.scale ?? 1;
    this.allowHosts = options.allowHosts ?? [];
    this.allowDestructive = options.allowDestructive ?? false;
  }

  /* ---------------- Lifecycle ---------------- */

  async launch() {
    const port = 9222 + Math.floor(Math.random() * 20000);
    this.profile = path.join(tmpdir(), `auravex-agent-${port}`);
    mkdirSync(this.profile, { recursive: true });
    this.proc = spawn(
      chromePath(),
      [
        "--headless=new",
        // The GPU, where there is one, more than doubles how fast frames come off the stage;
        // without one Chrome falls back to software rendering by itself.
        "--enable-gpu-rasterization",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--disable-background-networking",
        "--hide-scrollbars",
        "--mute-audio",
        `--force-device-scale-factor=${this.scale}`,
        `--remote-debugging-port=${port}`,
        `--window-size=${this.width},${this.height}`,
        `--user-data-dir=${this.profile}`,
        // Hosts that run Chrome in a container (Render) need e.g. "--no-sandbox".
        ...(process.env.CHROME_FLAGS?.split(/\s+/).filter(Boolean) ?? []),
        "about:blank",
      ],
      { stdio: "ignore" },
    );

    let target: { webSocketDebuggerUrl: string } | undefined;
    for (let i = 0; i < 80 && !target; i++) {
      try {
        const list = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
        target = list.find((t) => t.type === "page");
      } catch {
        /* not up yet */
      }
      if (!target) await sleep(250);
    }
    if (!target) {
      this.proc.kill();
      throw new Error("Chrome started but never exposed a page to drive.");
    }

    try {
      this.ws = new WebSocket(target.webSocketDebuggerUrl);
      this.ws.addEventListener("message", (event) => this.onMessage(JSON.parse(String(event.data)) as CdpMessage));
      await new Promise<void>((resolve, reject) => {
        this.ws.addEventListener("open", () => resolve());
        this.ws.addEventListener("error", () => reject(new Error("Could not connect to Chrome.")));
      });
      // Once Chrome is gone every call fails at once, instead of each waiting out a timeout.
      this.ws.addEventListener("close", () => this.markDead("Chrome closed the connection."));
      this.proc.on("exit", () => this.markDead("Chrome exited unexpectedly."));
      await this.send("Page.enable");
      await this.send("Runtime.enable");
      await this.send("Network.enable");
      await this.send("Emulation.setFocusEmulationEnabled", { enabled: true });
      // Evidence for audits: what the page itself reports as broken.
      this.on("Runtime.exceptionThrown", (p) => {
        const d = p.exceptionDetails as { exception?: { description?: string }; text?: string } | undefined;
        this.noteConsole(d?.exception?.description ?? d?.text ?? "Uncaught exception");
      });
      this.on("Runtime.consoleAPICalled", (p) => {
        if (p.type !== "error") return;
        const args = (p.args as { value?: unknown; description?: string }[] | undefined) ?? [];
        this.noteConsole(args.map((a) => (a.value !== undefined ? String(a.value) : (a.description ?? ""))).join(" "));
      });
      this.on("Network.responseReceived", (p) => {
        const r = p.response as { url: string; status: number } | undefined;
        if (r && r.status >= 400 && this.failedRequests.length < 200) this.failedRequests.push({ url: r.url.slice(0, 200), status: r.status });
      });
      this.on("Network.loadingFailed", (p) => {
        if (p.canceled || p.blockedReason) return;
        const type = String(p.type ?? "");
        if (type === "Ping" || type === "Other") return;
        if (this.failedRequests.length < 200) this.failedRequests.push({ url: String(p.errorText ?? "request failed").slice(0, 200), status: 0 });
      });
      // Headless Chrome keeps window decorations out of the size it was asked for;
      // pin the viewport so captures are exactly the size the film expects.
      await this.metrics(this.scale);
      if (this.allowHosts.length) await this.lockToHosts();
    } catch (error) {
      // A Chrome that came up but cannot be driven must not be left running.
      await this.close();
      throw error;
    }
  }

  /**
   * The host rule enforced where it cannot be bypassed: any page-level
   * request (a link, a form, a redirect, a frame) to another host is refused
   * before it loads, so the agent — and a typed credential — never leave.
   */
  private async lockToHosts() {
    this.on("Fetch.requestPaused", (params) => {
      const requestId = String(params.requestId);
      const request = params.request as { url: string } | undefined;
      const type = String(params.resourceType ?? "");
      const url = request?.url ?? "";
      const ok = type !== "Document" || this.hostAllowed(url);
      if (!ok) this.blocked = url;
      void this.send(ok ? "Fetch.continueRequest" : "Fetch.failRequest", ok ? { requestId } : { requestId, errorReason: "BlockedByClient" }).catch(() => undefined);
    });
    await this.send("Fetch.enable", { patterns: [{ urlPattern: "*", resourceType: "Document", requestStage: "Request" }] });
  }

  private hostAllowed(url: string) {
    let host = "";
    try {
      const u = new URL(url);
      if (u.protocol === "about:" || u.protocol === "data:" || u.protocol === "blob:") return true;
      host = u.hostname.toLowerCase();
    } catch {
      return false;
    }
    return this.allowHosts.length === 0 || this.allowHosts.some((h) => host === h || host.endsWith(`.${h}`));
  }

  /** What a verb reports when the page it tried to reach was refused; clears the record. */
  takeBlocked(): string {
    const url = this.blocked;
    this.blocked = null;
    if (!url) return "";
    let host = url;
    try {
      host = new URL(url).hostname;
    } catch {
      /* keep the raw address */
    }
    return ` The page tried to open ${host}, which is not part of the product, so it was refused; this run stays on the product's own site.`;
  }

  private noteConsole(text: string) {
    const line = text.split("\n")[0].trim().slice(0, 240);
    if (line && this.consoleErrors.length < 100) this.consoleErrors.push(line);
  }

  /** Errors and failed requests seen since the last call; the buffers start again. */
  drainEvidence(): Evidence {
    const out = { consoleErrors: this.consoleErrors, failedRequests: this.failedRequests };
    this.consoleErrors = [];
    this.failedRequests = [];
    return out;
  }

  /** Measurable facts about the current page. */
  async inspect(): Promise<PageFacts> {
    return this.evaluate<PageFacts>(`(() => {
      const q = (s) => Array.from(document.querySelectorAll(s));
      const host = location.hostname;
      const internal = new Set();
      for (const a of q('a[href]')) {
        try {
          const u = new URL(a.getAttribute('href'), location.href);
          if ((u.protocol === 'http:' || u.protocol === 'https:') && u.hostname === host && !u.hash) internal.add(u.origin + u.pathname + u.search);
        } catch {}
        if (internal.size >= 60) break;
      }
      const fields = q('input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea');
      const unlabeled = fields.filter((el) => {
        if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('placeholder') || el.getAttribute('title')) return false;
        if (el.id && document.querySelector('label[for="' + el.id.replace(/"/g, '') + '"]')) return false;
        return !el.closest('label');
      }).length;
      const images = q('img');
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        url: location.href,
        title: document.title,
        description: (document.querySelector('meta[name="description"]') || {}).content || '',
        hasCanonical: !!document.querySelector('link[rel="canonical"]'),
        hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
        lang: document.documentElement.getAttribute('lang') || '',
        h1Count: q('h1').length,
        imagesWithoutAlt: images.filter((i) => !i.hasAttribute('alt')).length,
        images: images.length,
        unlabeledFields: unlabeled,
        fields: fields.length,
        insecureLinks: location.protocol === 'https:' ? q('a[href^="http://"],img[src^="http://"],script[src^="http://"]').length : 0,
        internalLinks: Array.from(internal),
        overflowsHorizontally: document.documentElement.scrollWidth > window.innerWidth + 2,
        loadMs: nav && nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd - nav.startTime) : null,
        wordCount: (document.body.innerText || '').split(/\\s+/).filter(Boolean).length,
      };
    })()`);
  }

  /** The current page at a phone's width: does it overflow, and what does it look like. */
  async mobileCheck(): Promise<{ overflows: boolean; shot: Buffer }> {
    await this.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(700);
    try {
      const overflows = await this.evaluate<boolean>("document.documentElement.scrollWidth > window.innerWidth + 2");
      const shot = await this.screenshot("jpeg", 82);
      return { overflows, shot };
    } finally {
      await this.metrics(this.scale);
      await sleep(300);
    }
  }

  private markDead(reason: string) {
    if (this.dead) return;
    this.dead = reason;
    for (const [id, waiting] of this.pending) {
      this.pending.delete(id);
      waiting.reject(new FatalError(reason));
    }
  }

  private metrics(scale: number) {
    return this.send("Emulation.setDeviceMetricsOverride", { width: this.width, height: this.height, deviceScaleFactor: scale, mobile: false });
  }

  async close() {
    this.dead ??= "Closed.";
    try {
      this.ws?.close();
    } catch {
      /* already gone */
    }
    const exited = new Promise<void>((resolve) => {
      if (!this.proc || this.proc.exitCode !== null) return resolve();
      this.proc.once("exit", () => resolve());
      setTimeout(resolve, 4000);
    });
    try {
      this.proc?.kill();
    } catch {
      /* already gone */
    }
    await exited;
    // The profile holds the product's signed-in session; it must not outlive the job.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        rmSync(this.profile, { recursive: true, force: true });
        break;
      } catch {
        await sleep(400);
      }
    }
  }

  private onMessage(message: CdpMessage) {
    if (message.id !== undefined) {
      const waiting = this.pending.get(message.id);
      if (!waiting) return;
      this.pending.delete(message.id);
      if (message.error) waiting.reject(new Error(message.error.message));
      else waiting.resolve(message.result ?? {});
      return;
    }
    if (message.method) {
      this.listeners.get(message.method)?.forEach((fn) => fn(message.params ?? {}));
    }
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    if (this.dead) return Promise.reject(new FatalError(this.dead));
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`${method} timed out.`));
        }
      }, 45_000);
    });
  }

  on(method: string, fn: (params: Record<string, unknown>) => void) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method)!.add(fn);
    return () => this.listeners.get(method)?.delete(fn);
  }

  /* ---------------- Verbs ---------------- */

  private checkHost(url: string) {
    if (this.allowHosts.length === 0) return;
    let host = "";
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      throw new Error(`"${url}" is not a valid address.`);
    }
    if (!this.hostAllowed(url)) throw new Error(`Refused to leave the product: ${host} is not part of it.`);
  }

  async navigate(url: string, settleMs = 900) {
    this.checkHost(url);
    const loaded = new Promise<void>((resolve) => {
      const off = this.on("Page.loadEventFired", () => {
        off();
        resolve();
      });
      setTimeout(() => {
        off();
        resolve();
      }, 20_000);
    });
    const result = (await this.send("Page.navigate", { url })) as { errorText?: string };
    await loaded;
    await sleep(settleMs);
    const landed = await this.url();
    if (result.errorText || landed.startsWith("chrome-error://")) {
      const refused = this.takeBlocked();
      throw new Error(refused ? `Could not open ${url}.${refused}` : `Could not open ${url}: ${result.errorText ?? "the page failed to load"}.`);
    }
  }

  async evaluate<T = unknown>(expression: string): Promise<T> {
    const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    const r = result.result as { value?: T; description?: string } | undefined;
    const exception = result.exceptionDetails as { text?: string; exception?: { description?: string } } | undefined;
    if (exception) throw new Error(exception.exception?.description ?? exception.text ?? "Script failed.");
    return r?.value as T;
  }

  async url(): Promise<string> {
    return this.evaluate<string>("location.href");
  }

  /**
   * What the model reads instead of the DOM: the title, the address, a
   * numbered list of things it can act on, and the visible text.
   */
  async digest(): Promise<Digest> {
    return this.evaluate<Digest>(`(() => {
      const seen = new Set();
      const rows = [];
      let n = 0;
      const nodes = document.querySelectorAll('a[href],button,input,select,textarea,[role="button"],[role="link"],[role="tab"],[role="menuitem"],[contenteditable="true"]');
      for (const el of nodes) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || cs.display === 'none') continue;
        if (r.bottom < -200 || r.top > innerHeight * 3) continue;
        const tag = el.tagName.toLowerCase();
        const type = (el.getAttribute('type') || '').toLowerCase();
        if (type === 'hidden') continue;
        const label = (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('name') || (tag === 'input' || tag === 'select' || tag === 'textarea' ? (el.labels && el.labels[0] ? el.labels[0].textContent : '') : el.textContent) || '').trim().replace(/\\s+/g, ' ').slice(0, 60);
        const href = tag === 'a' ? (el.getAttribute('href') || '') : '';
        const key = tag + '|' + type + '|' + label + '|' + href;
        if (seen.has(key)) continue;
        seen.add(key);
        n++;
        el.setAttribute('data-ax-ref', String(n));
        rows.push('#' + n + ' ' + tag + (type ? '[' + type + ']' : '') + ' "' + label.replace(/"/g, "'") + '"' + (href ? ' -> ' + href.slice(0, 90) : ''));
        if (rows.length >= 90) break;
      }
      const text = (document.body.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 1800);
      return { title: document.title, url: location.href, rows, text, scroll: { y: Math.round(scrollY), h: document.documentElement.scrollHeight, vh: innerHeight } };
    })()`);
  }

  /** The digest as the model sees it. */
  static describe(d: Digest): string {
    return [
      `Title: ${d.title}`,
      `URL: ${d.url}`,
      `Scroll: ${d.scroll.y}/${d.scroll.h} (viewport ${d.scroll.vh})`,
      "",
      "Interactive elements:",
      ...(d.rows.length ? d.rows : ["(none visible)"]),
      "",
      "Visible text:",
      d.text || "(none)",
    ].join("\n");
  }

  private async centre(ref: string): Promise<{ x: number; y: number; label: string; tag: string; type: string }> {
    const found = await this.evaluate<{ x: number; y: number; label: string; tag: string; type: string } | null>(`(() => {
      const el = document.querySelector('[data-ax-ref="${String(ref).replace(/[^0-9]/g, "")}"]');
      if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').trim().slice(0, 80), tag: el.tagName.toLowerCase(), type: (el.getAttribute('type') || '').toLowerCase() };
    })()`);
    if (!found) throw new Error(`There is no element #${ref} on the page any more; read the page again.`);
    return found;
  }

  async click(ref: string) {
    const el = await this.centre(ref);
    if (!this.allowDestructive && DESTRUCTIVE.test(el.label)) {
      throw new Error(`Refused: "${el.label}" looks destructive and this run is read-only.`);
    }
    await sleep(120);
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await this.send("Input.dispatchMouseEvent", { type, x: el.x, y: el.y, button: "left", clickCount: 1 });
    }
    await sleep(900);
    return el.label;
  }

  async type(ref: string, text: string, submit = false, options: { passwordOnly?: boolean } = {}) {
    const el = await this.centre(ref);
    if (!["input", "textarea", "select"].includes(el.tag) && !(await this.evaluate<boolean>(`!!document.querySelector('[data-ax-ref="${ref}"][contenteditable="true"]')`))) {
      throw new Error(`#${ref} is a ${el.tag}, not a field.`);
    }
    if (options.passwordOnly && el.type !== "password") {
      throw new Error(`Refused: #${ref} is not a password field, and a stored password is only ever typed into one.`);
    }
    if (submit && !this.allowDestructive) {
      // Enter submits the field's form; hold it to the same rule as a click on its button.
      const submitter = await this.evaluate<string>(`(() => {
        const el = document.querySelector('[data-ax-ref="${String(ref).replace(/[^0-9]/g, "")}"]');
        const form = el && el.form;
        const b = form && form.querySelector('button[type="submit"],input[type="submit"],button:not([type])');
        return b ? (b.getAttribute('aria-label') || b.value || b.textContent || '').trim().slice(0, 80) : '';
      })()`);
      if (DESTRUCTIVE.test(submitter)) throw new Error(`Refused: submitting this form presses "${submitter}", which looks destructive.`);
    }
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
      await this.send("Input.dispatchMouseEvent", { type, x: el.x, y: el.y, button: "left", clickCount: 1 });
    }
    await sleep(80);
    // Replace whatever is there rather than appending to it.
    await this.send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers: 2, windowsVirtualKeyCode: 65 });
    await this.send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers: 2, windowsVirtualKeyCode: 65 });
    await this.send("Input.insertText", { text });
    if (submit) {
      await this.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
      await this.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
      await sleep(1200);
    }
    return el.label;
  }

  async scroll(direction: "down" | "up" | "top" | "bottom", amount = 700) {
    await this.evaluate(
      direction === "top" ? "window.scrollTo({top:0})"
      : direction === "bottom" ? "window.scrollTo({top:document.documentElement.scrollHeight})"
      : `window.scrollBy({top:${direction === "down" ? amount : -amount}})`,
    );
    await sleep(500);
  }

  /** A still of the current viewport, at the browser's device pixel ratio. */
  async screenshot(format: "png" | "jpeg" = "png", quality = 92, fast = false): Promise<Buffer> {
    const result = await this.send("Page.captureScreenshot", {
      format,
      ...(format === "jpeg" ? { quality } : {}),
      captureBeyondViewport: false,
      // Film frames favour throughput; captured product screens favour fidelity.
      ...(fast ? { optimizeForSpeed: true } : {}),
    });
    return Buffer.from(String(result.data), "base64");
  }

  /** A still at a chosen pixel ratio, for the film, without disturbing the page's own layout. */
  async capture(scale: number, format: "png" | "jpeg" = "png", quality = 92): Promise<Buffer> {
    if (scale === this.scale) return this.screenshot(format, quality);
    await this.metrics(scale);
    await sleep(350);
    try {
      return await this.screenshot(format, quality);
    } finally {
      await this.metrics(this.scale);
      await sleep(120);
    }
  }

  /**
   * Records the viewport while the page scrolls smoothly for `seconds`,
   * as a run of JPEG frames with their timestamps.
   */
  async recordScroll(seconds: number, scale = 1): Promise<ClipFrame[]> {
    const frames: ClipFrame[] = [];
    const start = Date.now();
    const off = this.on("Page.screencastFrame", (params) => {
      const meta = params.metadata as { timestamp?: number } | undefined;
      frames.push({ data: Buffer.from(String(params.data), "base64"), at: (meta?.timestamp ?? Date.now() / 1000) * 1000 });
      void this.send("Page.screencastFrameAck", { sessionId: params.sessionId }).catch(() => undefined);
    });
    if (scale !== this.scale) {
      await this.metrics(scale);
      await sleep(300);
    }
    await this.send("Page.startScreencast", { format: "jpeg", quality: 90, everyNthFrame: 1 });
    // A gentle, even scroll: the page moves; the camera does not.
    await this.evaluate(`(async () => {
      const total = Math.min(document.documentElement.scrollHeight - innerHeight - scrollY, innerHeight * 1.2);
      const from = scrollY; const ms = ${Math.round(seconds * 1000)}; const t0 = performance.now();
      await new Promise((done) => { const tick = () => { const u = Math.min(1, (performance.now() - t0) / ms); const e = u < 0.5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2) / 2; window.scrollTo(0, from + total * e); if (u < 1) requestAnimationFrame(tick); else done(); }; requestAnimationFrame(tick); });
    })()`);
    await sleep(200);
    await this.send("Page.stopScreencast");
    off();
    if (scale !== this.scale) {
      await this.metrics(this.scale);
    }
    const t0 = frames[0]?.at ?? start;
    return frames.map((f) => ({ ...f, at: f.at - t0 }));
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
