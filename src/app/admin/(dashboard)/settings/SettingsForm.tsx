"use client";

import { fileToMedia, isSupported } from "@/lib/imageUpload";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useCms } from "@/cms/CmsProvider";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { Panel } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useAdminSession } from "@/lib/adminAuth";
import { api, errorMessage } from "@/lib/api";
import { formatBytes } from "@/lib/cms";
import { cn } from "@/lib/utils";

const FIELD =
  "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
  "px-3.5 py-2.5 text-[13.5px] text-[var(--ax-ink)] outline-none transition-colors duration-300 " +
  "placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

/** Brand and contact fields, by the ids Site Content already edits. */
const BRAND_FIELDS = [
  { id: "site.name", label: "Company name" },
  { id: "site.tagline", label: "Tagline", hint: "Sits under the wordmark." },
  { id: "site.headline", label: "Homepage headline" },
  { id: "site.description", label: "Meta description", hint: "Used for search and social previews.", long: true },
] as const;

const CONTACT_FIELDS = [
  { id: "site.email", label: "Email", type: "email" },
  { id: "site.phone", label: "Phone", type: "text" },
  { id: "site.location", label: "Location", type: "text" },
] as const;

interface Status {
  ai: boolean;
  mail: boolean;
  push: { subscriptions: number };
  counts: Record<"media" | "visits" | "threads" | "bookings" | "jobs" | "sessions", number>;
  storage: { dataDir: string; dbBytes: number; mediaBytes: number };
  node: string;
  uptimeSeconds: number;
}

/**
 * Site-wide settings: the brand and contact copy (the same fields Site
 * Content edits, gathered here), the account, and what is connected.
 */
export function SettingsForm() {
  const { state, ready, setText, flushNow, error } = useCms();

  const current = (id: string) => state.text[id] ?? CONTENT_DEFAULTS[id] ?? "";
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const ids = [...BRAND_FIELDS, ...CONTACT_FIELDS].map((f) => f.id);
  const dirty = ids.some((id) => id in draft && draft[id] !== current(id));

  function edit(id: string, value: string) {
    setDraft((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  }

  async function save() {
    ids.forEach((id) => {
      if (id in draft && draft[id] !== current(id)) setText(id, draft[id]);
    });
    setDraft({});
    setSaving(true);
    const ok = await flushNow();
    setSaving(false);
    setSaved(ok);
  }

  const value = (id: string) => (id in draft ? draft[id] : current(id));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Identity" description="How the brand presents across the site">
          <div className="flex flex-col gap-5">
            {BRAND_FIELDS.map((field) => (
              <Field key={field.id} label={field.label} hint={"hint" in field ? field.hint : undefined}>
                {"long" in field && field.long ? (
                  <>
                    <textarea
                      value={value(field.id)}
                      onChange={(e) => edit(field.id, e.target.value)}
                      rows={3}
                      disabled={!ready}
                      className={cn(FIELD, "resize-none leading-relaxed")}
                    />
                    <span
                      className={cn(
                        "self-end font-mono text-[10.5px]",
                        value(field.id).length > 160 ? "text-[var(--ax-warning)]" : "text-[var(--ax-ink-dim)]",
                      )}
                    >
                      {value(field.id).length} / 160
                    </span>
                  </>
                ) : (
                  <input
                    value={value(field.id)}
                    onChange={(e) => edit(field.id, e.target.value)}
                    disabled={!ready}
                    className={FIELD}
                  />
                )}
              </Field>
            ))}
            <LogoField />
          </div>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel title="Contact" description="Shown in the footer and on the contact page">
            <div className="flex flex-col gap-5">
              {CONTACT_FIELDS.map((field) => (
                <Field key={field.id} label={field.label}>
                  <input
                    type={field.type}
                    value={value(field.id)}
                    onChange={(e) => edit(field.id, e.target.value)}
                    disabled={!ready}
                    className={FIELD}
                  />
                </Field>
              ))}
            </div>
          </Panel>

          <PasswordPanel />
        </div>
      </div>

      <ConnectionsPanel />

      {/* Save bar — present only while there is something to save or report */}
      {(dirty || saving || saved || error) && (
      <div className="ax-glass-strong sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl px-5 py-3.5">
        <AnimatePresence mode="wait">
          {saved && !dirty ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--ax-success)]"
            >
              <Icon name="check" className="size-4" strokeWidth={2.6} />
              Saved to the server — live on the site
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[12.5px] text-[var(--ax-ink-dim)]"
            >
              {error ? (
                <span className="text-[var(--ax-danger)]">{error}</span>
              ) : saving ? "Saving…" : dirty ? "Unsaved changes." : "Changes apply across the public site on save."}
            </motion.span>
          )}
        </AnimatePresence>

        <Button size="sm" icon="check" iconPosition="left" disabled={!dirty || saving} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
      )}
    </div>
  );
}

/* ---------------- Account ---------------- */

export function PasswordPanel({ onChanged }: { onChanged?: () => void } = {}) {
  const { user, changePassword } = useAdminSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    if (next !== again) {
      setResult({ ok: false, text: "The new passwords do not match." });
      return;
    }
    setBusy(true);
    const outcome = await changePassword(current, next);
    setBusy(false);
    if (outcome.ok) {
      setCurrent("");
      setNext("");
      setAgain("");
      setResult({ ok: true, text: "Password changed. Other devices have been signed out." });
      onChanged?.();
    } else {
      setResult({ ok: false, text: outcome.error ?? "Could not change the password." });
    }
  }

  return (
    <Panel
      title="Account"
      description={user ? `Signed in as ${user.email}` : "Signed in"}
      action={
        user?.mustChange && (
          <span className="rounded-full border border-[var(--ax-warning)]/40 bg-[var(--ax-warning)]/12 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ax-warning)]">
            Demo password
          </span>
        )
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Current password">
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
            className={FIELD}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" hint="At least 10 characters.">
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              minLength={10}
              required
              className={FIELD}
            />
          </Field>
          <Field label="Repeat it">
            <input
              type="password"
              value={again}
              onChange={(e) => setAgain(e.target.value)}
              autoComplete="new-password"
              required
              className={FIELD}
            />
          </Field>
        </div>

        {result && (
          <p
            className={cn(
              "rounded-lg border px-3 py-2 text-[12px]",
              result.ok
                ? "border-[var(--ax-success)]/35 bg-[var(--ax-success)]/10 text-[var(--ax-success)]"
                : "border-[var(--ax-danger)]/35 bg-[var(--ax-danger)]/10 text-[var(--ax-danger)]",
            )}
          >
            {result.text}
          </p>
        )}

        <Button type="submit" size="sm" icon="lock" iconPosition="left" disabled={busy} className="self-start">
          {busy ? "Changing…" : "Change password"}
        </Button>
      </form>
    </Panel>
  );
}

/* ---------------- Connections ---------------- */

function ConnectionsPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Status>("/api/admin/status")
      .then(setStatus)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const rows = status
    ? [
        {
          label: "Anthropic API",
          ok: status.ai,
          detail: status.ai ? "Key present — AI Studio can run jobs." : "Paste your Anthropic API key below.",
        },
        {
          label: "Outgoing email",
          ok: status.mail,
          detail: status.mail
            ? "Replies and notifications are emailed."
            : "Add your mail server below to email replies; until then they stay in the inbox.",
        },
        {
          label: "Push reminders",
          ok: status.push.subscriptions > 0,
          detail:
            status.push.subscriptions > 0
              ? `${status.push.subscriptions} browser${status.push.subscriptions === 1 ? "" : "s"} subscribed.`
              : "No browser subscribed yet — turn on reminders under Bookings.",
        },
        {
          label: "Storage",
          ok: true,
          detail: `${status.storage.dataDir} · database ${formatBytes(status.storage.dbBytes)} · media ${formatBytes(status.storage.mediaBytes)}`,
        },
      ]
    : [];

  return (
    <Panel
      title="Connections"
      description={
        status
          ? `Node ${status.node} · up ${Math.round(status.uptimeSeconds / 60)} min · ${status.counts.sessions} active session${status.counts.sessions === 1 ? "" : "s"}`
          : "What the server has, and what it is missing"
      }
    >
      {error && <p className="text-[12.5px] text-[var(--ax-danger)]">{error}</p>}
      {!status && !error && <p className="text-[12.5px] text-[var(--ax-ink-dim)]">Checking…</p>}
      {status && (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start gap-3 rounded-xl border border-[var(--ax-line)] p-4"
            >
              <span
                className={cn(
                  "mt-1 size-2.5 shrink-0 rounded-full",
                  row.ok ? "bg-[var(--ax-success)]" : "bg-[var(--ax-warning)]",
                )}
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[13px] font-semibold text-[var(--ax-ink)]">{row.label}</span>
                <span className="break-words text-[11.5px] leading-snug text-[var(--ax-ink-dim)]">
                  {row.detail}
                </span>
              </span>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-[var(--ax-line)] p-4 text-[11.5px] text-[var(--ax-ink-muted)] lg:col-span-2">
            {(
              [
                ["Images", status.counts.media],
                ["Visits logged", status.counts.visits],
                ["Conversations", status.counts.threads],
                ["Bookings", status.counts.bookings],
                ["AI jobs", status.counts.jobs],
              ] as const
            ).map(([label, n]) => (
              <span key={label}>
                <span className="font-mono text-[var(--ax-ink)]">{n.toLocaleString()}</span> {label}
              </span>
            ))}
          </div>
        </div>
      )}
      <ConnectionForms onChanged={() => api<Status>("/api/admin/status").then(setStatus).catch(() => undefined)} />
    </Panel>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex flex-wrap items-baseline gap-2">
        <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">{label}</span>
        {hint && <span className="text-[11px] text-[var(--ax-ink-dim)]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** The mark next to the name: upload your own, or keep the drawn one. */
function LogoField() {
  const { state, addMedia, setLogo } = useCms();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const logo = state.logoId ? state.media.find((m) => m.id === state.logoId) : undefined;

  async function onFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!isSupported(file)) {
      setNote(`${file.name} is not an image file.`);
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const item = await fileToMedia(file);
      addMedia(item);
      setLogo(item.id);
    } catch (e) {
      setNote(e instanceof Error ? e.message : "That upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field label="Logo" hint="Shown next to the name everywhere. PNG or SVG with a transparent background looks best.">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--ax-line)] bg-[var(--ax-surface)]">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} alt="" className="size-10 object-contain" />
          ) : (
            <span className="text-[10px] text-[var(--ax-ink-dim)]">drawn</span>
          )}
        </span>
        <label className={cn("ax-focus cursor-pointer rounded-full border border-[var(--ax-line-strong)] px-3 py-1.5 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)]", busy && "opacity-50")}>
          {busy ? "Uploading…" : logo ? "Replace logo" : "Upload a logo"}
          <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(e) => onFile(e.target.files)} />
        </label>
        {logo && (
          <button type="button" onClick={() => setLogo(null)} className="ax-focus rounded-full px-3 py-1.5 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-danger)]">
            Use the drawn mark
          </button>
        )}
        {note && <span className="basis-full text-[12px] text-[var(--ax-warning)]">{note}</span>}
      </div>
    </Field>
  );
}

interface Connections {
  mail: { host: string; port: number; secure: boolean; user: string; from: string; adminEmail: string; hasPassword: boolean; source: "portal" | "env" | "none" };
  ai: { hasKey: boolean; source: "portal" | "env" | "none"; hint: string };
}

/**
 * The mail server and the model key, typed here rather than into .env.
 * Secrets are sealed on the server and never shown again; a blank field on
 * save keeps what is stored.
 */
function ConnectionForms({ onChanged }: { onChanged: () => void }) {
  const [conn, setConn] = useState<Connections | null>(null);
  const [mail, setMail] = useState({ host: "", port: "587", secure: false, user: "", pass: "", from: "", adminEmail: "" });
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState<"mail" | "test" | "key" | null>(null);
  const [note, setNote] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);

  useEffect(() => {
    api<Connections>("/api/admin/connections")
      .then((c) => {
        setConn(c);
        setMail({ host: c.mail.host, port: String(c.mail.port), secure: c.mail.secure, user: c.mail.user, pass: "", from: c.mail.from, adminEmail: c.mail.adminEmail });
      })
      .catch((e) => setNote({ tone: "bad", text: errorMessage(e) }));
  }, []);

  async function saveMail() {
    setBusy("mail");
    setNote(null);
    try {
      const c = await api<Connections>("/api/admin/connections", { method: "PUT", body: { mail: { ...mail, port: Number(mail.port) } } });
      setConn(c);
      setMail((m) => ({ ...m, pass: "" }));
      setNote({ tone: "ok", text: c.mail.host ? "Mail server saved. Send yourself a test to be sure." : "Mail settings cleared." });
      onChanged();
    } catch (e) {
      setNote({ tone: "bad", text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  }
  async function testMail() {
    setBusy("test");
    setNote(null);
    try {
      const r = await api<{ ok: boolean; to: string; reason?: string }>("/api/admin/connections/test-mail", { body: { to: mail.adminEmail } });
      setNote(r.ok ? { tone: "ok", text: `Test email sent to ${r.to}.` } : { tone: "bad", text: r.reason ?? "The test did not go through." });
    } catch (e) {
      setNote({ tone: "bad", text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  }
  async function saveKey(clear = false) {
    setBusy("key");
    setNote(null);
    try {
      const c = await api<Connections>("/api/admin/connections", { method: "PUT", body: clear ? { clearAiKey: true } : { aiKey: key } });
      setConn(c);
      setKey("");
      setNote({ tone: "ok", text: clear ? "Model key removed." : "Model key saved. AI Studio can run jobs now." });
      onChanged();
    } catch (e) {
      setNote({ tone: "bad", text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  }

  const input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={FIELD} />;

  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--ax-line)] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-[var(--ax-ink)]">Email delivery</span>
          <span className="text-[11px] text-[var(--ax-ink-dim)]">{conn ? (conn.mail.source === "portal" ? "Set here" : conn.mail.source === "env" ? "From .env" : "Not set") : "…"}</span>
        </div>
        <p className="text-[12px] leading-relaxed text-[var(--ax-ink-muted)]">Any SMTP account works: the outgoing server of your email provider, or a sending service. Replies to visitors and your own alerts go out through it.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Server">{input({ value: mail.host, placeholder: "smtp.example.com", onChange: (e) => setMail({ ...mail, host: e.target.value }) })}</Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Port">{input({ value: mail.port, inputMode: "numeric", onChange: (e) => setMail({ ...mail, port: e.target.value }) })}</Field>
            <Field label="TLS">
              <label className="flex h-[42px] items-center gap-2 text-[12.5px] text-[var(--ax-ink-muted)]">
                <input type="checkbox" checked={mail.secure} onChange={(e) => setMail({ ...mail, secure: e.target.checked })} />
                On port 465
              </label>
            </Field>
          </div>
          <Field label="Username">{input({ value: mail.user, autoComplete: "off", onChange: (e) => setMail({ ...mail, user: e.target.value }) })}</Field>
          <Field label="Password" hint={conn?.mail.hasPassword ? "Stored. Leave blank to keep it." : undefined}>{input({ type: "password", value: mail.pass, autoComplete: "new-password", onChange: (e) => setMail({ ...mail, pass: e.target.value }) })}</Field>
          <Field label="Send as">{input({ value: mail.from, placeholder: "hello@yourdomain.com", onChange: (e) => setMail({ ...mail, from: e.target.value }) })}</Field>
          <Field label="Your alerts go to">{input({ type: "email", value: mail.adminEmail, placeholder: "you@yourdomain.com", onChange: (e) => setMail({ ...mail, adminEmail: e.target.value }) })}</Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveMail} disabled={busy !== null} size="sm">{busy === "mail" ? "Saving…" : "Save mail settings"}</Button>
          <Button onClick={testMail} disabled={busy !== null || !(conn?.mail.host || mail.host)} size="sm" variant="outline">{busy === "test" ? "Sending…" : "Send me a test"}</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[var(--ax-line)] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-[var(--ax-ink)]">AI model key</span>
          <span className="text-[11px] text-[var(--ax-ink-dim)]">{conn ? (conn.ai.hasKey ? `${conn.ai.source === "env" ? "From .env" : "Set here"} · ends ${conn.ai.hint}` : "Not set") : "…"}</span>
        </div>
        <p className="text-[12px] leading-relaxed text-[var(--ax-ink-muted)]">Your Anthropic API key. It is sealed on this server, never shown again, and used only by AI Studio.</p>
        <Field label="API key">{input({ type: "password", value: key, placeholder: "sk-ant-…", autoComplete: "off", onChange: (e) => setKey(e.target.value) })}</Field>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => saveKey(false)} disabled={busy !== null || key.trim().length < 20} size="sm">{busy === "key" ? "Saving…" : "Save key"}</Button>
          {conn?.ai.source === "portal" && (
            <Button onClick={() => saveKey(true)} disabled={busy !== null} size="sm" variant="outline">Remove</Button>
          )}
        </div>
      </div>

      {note && <p className={cn("xl:col-span-2 text-[12.5px]", note.tone === "ok" ? "text-[var(--ax-success)]" : "text-[var(--ax-danger)]")}>{note.text}</p>}
    </div>
  );
}
