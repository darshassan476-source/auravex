"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Icon } from "@/components/ui/Icon";
import type { Thread } from "@/lib/cms";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread" | "archived";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function relative(iso: string) {
  const delta = Date.now() - new Date(iso).getTime();
  const mins = Math.round(delta / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Two-pane inbox: every enquiry that came in through the site, and the
 * conversation with each one.
 *
 * Replies are stored on the thread so the history is complete, but nothing is
 * emailed to the visitor only when SMTP is configured; otherwise the screen
 * says the reply was stored rather than implying it was delivered.
 */
export function MessagesInbox() {
  const {
    state,
    ready,
    mailConfigured,
    replyToThread,
    markThreadRead,
    archiveThread,
    deleteThread,
  } = useCms();
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const threads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.threads
      .filter((t) =>
        filter === "unread" ? t.unread && !t.archived
        : filter === "archived" ? t.archived
        : !t.archived,
      )
      .filter((t) =>
        !q
          ? true
          : [t.name, t.email, t.company, t.subject, ...t.messages.map((m) => m.body)]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q)),
      );
  }, [state.threads, filter, query]);

  const active = state.threads.find((t) => t.id === activeId) ?? threads[0] ?? null;

  // Choosing a thread clears its unread flag; merely landing on the page does not,
  // or the newest enquiry would be marked read before anyone looked at it.
  useEffect(() => {
    if (!activeId) return;
    const chosen = state.threads.find((t) => t.id === activeId);
    if (chosen?.unread) markThreadRead(chosen.id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [active?.messages.length, active?.id]);

  const unread = state.threads.filter((t) => t.unread && !t.archived).length;

  async function send() {
    if (!active || !draft.trim() || sending) return;
    setSending(true);
    setNotice(null);
    try {
      const mail = await replyToThread(active.id, draft.trim());
      setDraft("");
      setNotice(
        mail.sent
          ? { tone: "ok", text: `Emailed to ${active.email}.` }
          : { tone: "warn", text: `Saved on the thread, not emailed: ${mail.reason}` },
      );
    } catch (e) {
      setNotice({ tone: "warn", text: e instanceof Error ? e.message : "Could not send." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-accent)]/30 bg-[rgba(var(--ax-glow),0.07)] px-4 py-3 text-[12.5px] leading-relaxed text-[var(--ax-ink-muted)]">
        <Icon
          name="mail"
          className="mt-0.5 size-4 shrink-0 text-[var(--ax-accent-soft)]"
          strokeWidth={1.9}
        />
        <span>
          Every demo request from the contact form lands here as a conversation, and the
          full history stays on the thread.{" "}
          {mailConfigured
            ? "Replies are emailed to the visitor."
            : "Replies are stored here; set SMTP_HOST in .env and they will also be emailed to the visitor."}
        </span>
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {/* ---------------- Thread list ---------------- */}
        <div className="ax-glass ax-edge-light flex max-h-[720px] flex-col overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-3 border-b border-[var(--ax-line)] p-4">
            <label className="flex items-center gap-2 rounded-full border border-[var(--ax-line)] px-3.5 py-2">
              <Icon
                name="search"
                className="size-3.5 shrink-0 text-[var(--ax-ink-dim)]"
                strokeWidth={2}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people and messages…"
                className="w-full bg-transparent text-[12.5px] text-[var(--ax-ink)] outline-none placeholder:text-[var(--ax-ink-dim)]"
              />
            </label>

            <div className="flex gap-1.5">
              {(["all", "unread", "archived"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "ax-focus inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium capitalize transition-all duration-300",
                    f === filter
                      ? "bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                      : "text-[var(--ax-ink-muted)] hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]",
                  )}
                >
                  {f}
                  {f === "unread" && unread > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px] font-semibold",
                        f === filter
                          ? "bg-white/20"
                          : "bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-accent-soft)]",
                      )}
                    >
                      {unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!ready || threads.length === 0 ? (
              <p className="px-5 py-12 text-center text-[12.5px] leading-relaxed text-[var(--ax-ink-dim)]">
                {state.threads.length === 0
                  ? "No enquiries yet. Send one through the contact form on the public site and it will appear here."
                  : "Nothing matches that filter."}
              </p>
            ) : (
              threads.map((thread) => (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  active={thread.id === active?.id}
                  onClick={() => setActiveId(thread.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ---------------- Conversation ---------------- */}
        <div className="ax-glass ax-edge-light flex max-h-[720px] min-h-[420px] flex-col overflow-hidden rounded-2xl">
          {!active ? (
            <div className="grid flex-1 place-items-center px-6 text-center">
              <span className="flex flex-col items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)] text-[var(--ax-accent-soft)]">
                  <Icon name="message" className="size-5" strokeWidth={1.8} />
                </span>
                <span className="text-[13px] text-[var(--ax-ink-muted)]">
                  Pick a conversation to read it.
                </span>
              </span>
            </div>
          ) : (
            <>
              <header className="flex items-start justify-between gap-4 border-b border-[var(--ax-line)] p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[12px] font-bold text-white">
                    {initials(active.name)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-semibold text-[var(--ax-ink)]">
                      {active.name}
                    </span>
                    <span className="truncate text-[11.5px] text-[var(--ax-ink-dim)]">
                      {[active.email, active.company].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <IconAction
                    icon="mail"
                    label="Mark unread"
                    onClick={() => markThreadRead(active.id, false)}
                  />
                  <IconAction
                    icon={active.archived ? "upload" : "box"}
                    label={active.archived ? "Move to inbox" : "Archive"}
                    onClick={() => archiveThread(active.id, !active.archived)}
                  />
                  <IconAction
                    icon="trash"
                    label="Delete conversation"
                    danger
                    onClick={() => {
                      deleteThread(active.id);
                      setActiveId(null);
                    }}
                  />
                </div>
              </header>

              {active.subject && (
                <div className="border-b border-[var(--ax-line)] px-4 py-2.5">
                  <span className="text-[11.5px] text-[var(--ax-ink-dim)]">
                    Interested in{" "}
                    <span className="font-medium text-[var(--ax-accent-soft)]">
                      {active.subject}
                    </span>
                  </span>
                </div>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {active.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.from === "me" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-4 py-3",
                        message.from === "me"
                          ? "bg-[linear-gradient(120deg,var(--ax-accent),var(--ax-violet))] text-white"
                          : "border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)] text-[var(--ax-ink)]",
                      )}
                    >
                      <p className="whitespace-pre-line text-[13.5px] leading-relaxed">
                        {message.body}
                      </p>
                      <span
                        className={cn(
                          "mt-1.5 block text-[10.5px]",
                          message.from === "me" ? "text-white/70" : "text-[var(--ax-ink-dim)]",
                        )}
                      >
                        {relative(message.at)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {notice && (
                <p
                  className={cn(
                    "mx-3 mt-3 rounded-lg border px-3 py-2 text-[11.5px] leading-snug",
                    notice.tone === "ok"
                      ? "border-[var(--ax-success)]/35 bg-[var(--ax-success)]/10 text-[var(--ax-success)]"
                      : "border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 text-[var(--ax-ink-muted)]",
                  )}
                >
                  {notice.text}
                </p>
              )}

              <footer className="flex items-end gap-2.5 border-t border-[var(--ax-line)] p-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={2}
                  placeholder="Write a reply…  (Ctrl+Enter to send)"
                  className="ax-focus max-h-32 min-h-[46px] flex-1 resize-y rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-3.5 py-2.5 text-[13.5px] text-[var(--ax-ink)] outline-none transition-colors placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!draft.trim() || sending}
                  className="ax-focus grid size-[46px] shrink-0 place-items-center rounded-xl bg-[linear-gradient(120deg,var(--ax-accent),var(--ax-violet))] text-white transition-all duration-300 hover:brightness-110 disabled:opacity-40"
                  aria-label="Send reply"
                >
                  <Icon name="arrow-right" className="size-[18px]" strokeWidth={2.2} />
                </button>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadRow({
  thread,
  active,
  onClick,
}: {
  thread: Thread;
  active: boolean;
  onClick: () => void;
}) {
  const last = thread.messages[thread.messages.length - 1];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ax-focus flex w-full items-start gap-3 border-b border-[var(--ax-line)] p-4 text-left transition-colors duration-200",
        active ? "bg-[rgba(var(--ax-glow),0.10)]" : "hover:bg-[rgba(var(--ax-glow),0.05)]",
      )}
    >
      <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[11px] font-bold text-white">
        {initials(thread.name)}
        {thread.unread && (
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[var(--ax-accent)] ring-2 ring-[var(--ax-bg-elevated)]" />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-[13px]",
              thread.unread
                ? "font-semibold text-[var(--ax-ink)]"
                : "font-medium text-[var(--ax-ink-muted)]",
            )}
          >
            {thread.name}
          </span>
          <span className="shrink-0 text-[10.5px] text-[var(--ax-ink-dim)]">
            {relative(last?.at ?? thread.createdAt)}
          </span>
        </span>
        <span className="truncate text-[11.5px] text-[var(--ax-ink-dim)]">
          {last?.from === "me" ? "You: " : ""}
          {last?.body}
        </span>
      </span>
    </button>
  );
}

function IconAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors duration-200",
        danger
          ? "hover:bg-[var(--ax-danger)]/12 hover:text-[var(--ax-danger)]"
          : "hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]",
      )}
    >
      <Icon name={icon} className="size-4" strokeWidth={1.9} />
    </button>
  );
}
