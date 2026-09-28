"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import { api, errorMessage } from "@/lib/api";
import type { ActivityEntry } from "@/lib/types";

const KIND_META: Record<ActivityEntry["kind"], { icon: string; label: string; className: string }> = {
  create: {
    icon: "plus",
    label: "Created",
    className: "border-[var(--ax-success)]/30 bg-[var(--ax-success)]/10 text-[var(--ax-success)]",
  },
  update: {
    icon: "pencil",
    label: "Updated",
    className: "border-[var(--ax-accent)]/30 bg-[var(--ax-accent)]/10 text-[var(--ax-accent-soft)]",
  },
  publish: {
    icon: "upload",
    label: "Published",
    className: "border-[var(--ax-violet)]/30 bg-[var(--ax-violet)]/10 text-[var(--ax-violet)]",
  },
  delete: {
    icon: "trash",
    label: "Removed",
    className: "border-[var(--ax-danger)]/30 bg-[var(--ax-danger)]/10 text-[var(--ax-danger)]",
  },
  login: {
    icon: "user",
    label: "Session",
    className: "border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.08)] text-[var(--ax-ink-muted)]",
  },
};

const KINDS = Object.keys(KIND_META) as ActivityEntry["kind"][];

interface Entry extends Omit<ActivityEntry, "time"> {
  at: string;
}

function when(iso: string) {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Every change made through the portal, as the server recorded it. */
export function ActivityLog() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    const load = () =>
      api<{ entries: Entry[]; total: number }>("/api/admin/activity?limit=300")
        .then((data) => {
          if (!live) return;
          setEntries(data.entries);
          setTotal(data.total);
          setError(null);
        })
        .catch((e) => live && setError(errorMessage(e)));
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);

  const counts = KINDS.map((kind) => ({
    kind,
    n: (entries ?? []).filter((e) => e.kind === kind).length,
  })).filter((c) => c.n > 0);

  return (
    <>
      {counts.length > 0 && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {counts.map(({ kind, n }) => (
            <div key={kind} className="ax-glass ax-edge-light flex items-center gap-4 rounded-2xl p-5">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl border ${KIND_META[kind].className}`}>
                <Icon name={KIND_META[kind].icon} className="size-[18px]" strokeWidth={1.9} />
              </span>
              <span className="flex flex-col">
                <span className="ax-display text-[24px] text-[var(--ax-ink)]">{n}</span>
                <span className="text-[12px] text-[var(--ax-ink-muted)]">{KIND_META[kind].label}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <Panel
        title="Full log"
        description={entries ? `${total.toLocaleString()} entr${total === 1 ? "y" : "ies"}` : "Loading…"}
        padded={false}
      >
        {error && <p className="px-5 py-4 text-[12.5px] text-[var(--ax-danger)]">{error}</p>}
        {entries && entries.length === 0 && (
          <p className="px-5 py-10 text-center text-[12.5px] text-[var(--ax-ink-dim)]">
            Nothing recorded yet. Sign-ins, edits, uploads and replies will appear here.
          </p>
        )}
        {entries && entries.length > 0 && (
          <ol className="flex flex-col">
            {entries.map((entry) => {
              const meta = KIND_META[entry.kind] ?? KIND_META.update;
              return (
                <li
                  key={entry.id}
                  className="flex items-center gap-4 border-b border-[var(--ax-line)] px-5 py-4 transition-colors duration-300 last:border-0 hover:bg-[rgba(var(--ax-glow),0.05)]"
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl border ${meta.className}`}>
                    <Icon name={meta.icon} className="size-4" strokeWidth={1.9} />
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[13.5px] leading-snug text-[var(--ax-ink-muted)] [overflow-wrap:anywhere]">
                      <span className="font-semibold text-[var(--ax-ink)]">{entry.actor}</span> {entry.action}{" "}
                      <span className="font-medium text-[var(--ax-ink)]">{entry.target}</span>
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">
                      {meta.label}
                    </span>
                  </span>

                  <span className="shrink-0 text-[12px] text-[var(--ax-ink-dim)]" title={new Date(entry.at).toLocaleString()}>
                    {when(entry.at)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </>
  );
}
