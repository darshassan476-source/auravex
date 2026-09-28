"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Panel } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Primitives";
import { Select } from "@/components/ui/Select";
import { api, errorMessage } from "@/lib/api";
import type { ManagedLink } from "@/lib/cms";
import { cn, formatCompact } from "@/lib/utils";

const GROUPS = ["Social", "Product", "Resource"] as const;
const GROUP_ICONS: Record<string, string> = { Social: "globe", Product: "box", Resource: "file" };

const FIELD =
  "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
  "px-3.5 py-2.5 text-[13px] text-[var(--ax-ink)] outline-none transition-colors duration-300 " +
  "placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

/**
 * Outbound destinations with a tracked address each. Sharing /go/<id>
 * instead of the raw URL counts the click before redirecting, so the
 * numbers here are real visits through those addresses — nothing else.
 */
export function LinksManager() {
  const [links, setLinks] = useState<ManagedLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ label: "", url: "", group: "Resource" as (typeof GROUPS)[number] });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [edit, setEdit] = useState({ label: "", url: "", group: "Resource" });
  const [confirming, setConfirming] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api<{ links: ManagedLink[] }>("/api/admin/links")
      .then((d) => setLinks(d.links))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const link = await api<ManagedLink>("/api/admin/links", { body: draft });
      setLinks((prev) => [...(prev ?? []), link]);
      setDraft({ label: "", url: "", group: draft.group });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setAdding(false);
    }
  }

  async function save(id: string) {
    try {
      const link = await api<ManagedLink>(`/api/admin/links/${id}`, { method: "PATCH", body: edit });
      setLinks((prev) => (prev ?? []).map((l) => (l.id === id ? link : l)));
      setEditing(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function remove(id: string) {
    try {
      await api(`/api/admin/links/${id}`, { method: "DELETE" });
      setLinks((prev) => (prev ?? []).filter((l) => l.id !== id));
      setConfirming(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function copy(id: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/go/${id}`);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  const all = links ?? [];
  const totalClicks = all.reduce((sum, l) => sum + l.clicks, 0);
  const busiest = [...all].sort((a, b) => b.clicks - a.clicks)[0];
  const groups = GROUPS.filter((g) => all.some((l) => l.group === g));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Tracked links", value: String(all.length), icon: "link" },
          { label: "Clicks through /go", value: formatCompact(totalClicks), icon: "activity" },
          { label: "Most used", value: busiest && busiest.clicks > 0 ? busiest.label : "—", icon: "trending", small: true },
        ].map((stat) => (
          <div key={stat.label} className="ax-glass ax-edge-light flex items-center gap-4 rounded-2xl p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
              <Icon name={stat.icon} className="size-[18px]" strokeWidth={1.8} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className={stat.small ? "truncate text-[15px] font-semibold text-[var(--ax-ink)]" : "ax-display text-[24px] text-[var(--ax-ink)]"}>
                {links ? stat.value : "—"}
              </span>
              <span className="text-[12px] text-[var(--ax-ink-muted)]">{stat.label}</span>
            </span>
          </div>
        ))}
      </div>

      <Panel title="Add a link" description="Share the tracked address and every click is counted before the redirect.">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-[1fr_1.6fr_170px_auto] md:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Name</span>
            <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Press kit" required className={FIELD} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">Destination</span>
            <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" type="url" required className={FIELD} />
          </label>
          <Select
            label="Group"
            value={draft.group}
            onChange={(g) => setDraft({ ...draft, group: g })}
            options={GROUPS.map((g) => ({ value: g, label: g }))}
          />
          <Button type="submit" size="sm" icon="plus" iconPosition="left" disabled={adding}>
            {adding ? "Adding…" : "Add link"}
          </Button>
        </form>
        {error && <p className="mt-3 text-[12.5px] text-[var(--ax-danger)]">{error}</p>}
      </Panel>

      {links && links.length === 0 && (
        <Panel>
          <p className="py-8 text-center text-[12.5px] text-[var(--ax-ink-dim)]">
            No links yet. Add the destinations you share — social profiles, live demos, documents.
          </p>
        </Panel>
      )}

      {groups.map((group) => {
        const rows = all.filter((l) => l.group === group);
        return (
          <Panel key={group} title={group} description={`${rows.length} ${rows.length === 1 ? "link" : "links"}`} padded={false}>
            <ul className="flex flex-col">
              {rows.map((link) => (
                <li
                  key={link.id}
                  className="group flex flex-col gap-3 border-b border-[var(--ax-line)] px-5 py-4 transition-colors duration-300 last:border-0 hover:bg-[rgba(var(--ax-glow),0.05)] sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)] text-[var(--ax-accent-soft)]">
                    <Icon name={GROUP_ICONS[link.group] ?? "link"} className="size-4" strokeWidth={1.9} />
                  </span>

                  {editing === link.id ? (
                    <span className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                      <input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} className={cn(FIELD, "sm:w-[180px]")} aria-label="Name" />
                      <input value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} className={FIELD} aria-label="Destination" />
                      <Select label="Group" value={edit.group} onChange={(g) => setEdit({ ...edit, group: g })} options={GROUPS.map((g) => ({ value: g, label: g }))} className="sm:w-[150px]" size="sm" />
                    </span>
                  ) : (
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[13.5px] font-medium text-[var(--ax-ink)]">{link.label}</span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ax-focus truncate font-mono text-[11.5px] text-[var(--ax-ink-dim)] transition-colors hover:text-[var(--ax-accent-soft)]"
                      >
                        {link.url}
                      </a>
                      <span className="truncate font-mono text-[10.5px] text-[var(--ax-ink-dim)]">
                        tracked: /go/{link.id}
                      </span>
                    </span>
                  )}

                  <Tag className="hidden sm:inline-flex">{formatCompact(link.clicks)} clicks</Tag>

                  <div className="flex shrink-0 gap-1">
                    {editing === link.id ? (
                      <>
                        <button type="button" onClick={() => save(link.id)} className="ax-focus rounded-lg bg-[var(--ax-accent)]/16 px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--ax-accent-soft)]">
                          Save
                        </button>
                        <button type="button" onClick={() => setEditing(null)} className="ax-focus rounded-lg px-2.5 py-1.5 text-[11.5px] text-[var(--ax-ink-dim)]">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => copy(link.id)}
                          aria-label={`Copy tracked address for ${link.label}`}
                          className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                        >
                          <Icon name={copied === link.id ? "check" : "link"} className="size-4" strokeWidth={1.9} />
                        </button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${link.label}`}
                          className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                        >
                          <Icon name="external-link" className="size-4" strokeWidth={1.9} />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(link.id);
                            setEdit({ label: link.label, url: link.url, group: link.group });
                          }}
                          aria-label={`Edit ${link.label}`}
                          className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                        >
                          <Icon name="pencil" className="size-4" strokeWidth={1.9} />
                        </button>
                        {confirming === link.id ? (
                          <button type="button" onClick={() => remove(link.id)} className="ax-focus rounded-lg bg-[var(--ax-danger)]/14 px-2 text-[10.5px] font-semibold text-[var(--ax-danger)]">
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirming(link.id)}
                            aria-label={`Delete ${link.label}`}
                            className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[var(--ax-danger)]/12 hover:text-[var(--ax-danger)]"
                          >
                            <Icon name="trash" className="size-4" strokeWidth={1.9} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        );
      })}
    </div>
  );
}
