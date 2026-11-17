"use client";

import { useState, type FormEvent } from "react";
import { EmptyState, Panel } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useRecords } from "@/cms/useRecords";
import { UPDATE_KIND_LABELS, type UpdateKind, type UpdatePost } from "@/lib/enterprise";
import {
  Chip,
  FIELD,
  Field,
  FormMessage,
  MediaPicker,
  RowAction,
  SwitchRow,
  newId,
  useProductName,
  useProductOptions,
} from "../_records/kit";

type Draft = {
  title: string;
  summary: string;
  body: string;
  kind: UpdateKind;
  productSlug: string;
  imageId?: string;
  featured: boolean;
  published: boolean;
  /** datetime-local value, in the browser's time zone. */
  publishAt: string;
};

const blank: Draft = {
  title: "",
  summary: "",
  body: "",
  kind: "announcement",
  productSlug: "",
  imageId: undefined,
  featured: false,
  published: false,
  publishAt: "",
};

/** ISO → the value a datetime-local input expects, in local time. */
function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type UpdateState = "draft" | "scheduled" | "published";

export function updateState(u: Pick<UpdatePost, "published" | "publishAt">, now = Date.now()): UpdateState {
  if (!u.published) return "draft";
  if (u.publishAt && Date.parse(u.publishAt) > now) return "scheduled";
  return "published";
}

const STATE_CHIP: Record<UpdateState, { tone: "muted" | "warning" | "success"; label: string }> = {
  draft: { tone: "muted", label: "Draft" },
  scheduled: { tone: "warning", label: "Scheduled" },
  published: { tone: "success", label: "Published" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/**
 * Latest Updates. Each one is a record the site renders on its own: publish,
 * unpublish, schedule, feature or delete without touching code.
 */
export function UpdatesManager() {
  const { items, loading, saving, error, save } = useRecords<UpdatePost>("updates");
  const products = useProductOptions();
  const productName = useProductName();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [problems, setProblems] = useState<Partial<Record<keyof Draft, string>>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  function start(post?: UpdatePost) {
    setNotice(null);
    setProblems({});
    setEditing(post ? post.id : "new");
    setDraft(
      post
        ? {
            title: post.title,
            summary: post.summary,
            body: post.body ?? "",
            kind: post.kind,
            productSlug: post.productSlug ?? "",
            imageId: post.imageId,
            featured: post.featured,
            published: post.published,
            publishAt: toLocalInput(post.publishAt),
          }
        : blank,
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: typeof problems = {};
    if (!draft.title.trim()) found.title = "Give the update a title.";
    else if (draft.title.length > 200) found.title = "At most 200 characters.";
    if (!draft.summary.trim()) found.summary = "Write a short summary — it is what the listing shows.";
    else if (draft.summary.length > 600) found.summary = "At most 600 characters.";
    const publishAt = draft.publishAt ? new Date(draft.publishAt) : null;
    if (publishAt && Number.isNaN(publishAt.getTime())) found.publishAt = "That date and time is not valid.";
    setProblems(found);
    if (Object.keys(found).length) return;

    const at = new Date().toISOString();
    const existing = items.find((u) => u.id === editing);
    const post: UpdatePost = {
      id: existing?.id ?? newId("u"),
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      body: draft.body.trim() || undefined,
      kind: draft.kind,
      productSlug: draft.productSlug || undefined,
      imageId: draft.imageId,
      featured: draft.featured,
      published: draft.published,
      publishAt: publishAt ? publishAt.toISOString() : undefined,
      createdAt: existing?.createdAt ?? at,
      updatedAt: at,
    };
    const next = existing ? items.map((u) => (u.id === existing.id ? post : u)) : [post, ...items];
    if (await save(next)) {
      setEditing(null);
      const s = updateState(post);
      setNotice(
        s === "published"
          ? "Saved and published. It is on the website now."
          : s === "scheduled"
            ? `Saved. It will appear on ${formatDate(post.publishAt!)}.`
            : "Saved as a draft. Not shown on the website.",
      );
    }
  }

  async function patch(id: string, change: Partial<UpdatePost>) {
    const at = new Date().toISOString();
    if (await save(items.map((u) => (u.id === id ? { ...u, ...change, updatedAt: at } : u)))) setNotice("Saved.");
  }

  async function remove(id: string) {
    if (await save(items.filter((u) => u.id !== id))) {
      setConfirming(null);
      if (editing === id) setEditing(null);
      setNotice("Update deleted.");
    }
  }

  const sorted = [...items].sort((a, b) => (b.publishAt || b.createdAt).localeCompare(a.publishAt || a.createdAt));

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title="Publishing"
        description="Drafts stay private. Published updates show on the website; a future publish date holds them until then."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Chip tone="muted">{items.length} updates</Chip>
          <Chip tone="success">{items.filter((u) => updateState(u) === "published").length} published</Chip>
          <Chip tone="warning">{items.filter((u) => updateState(u) === "scheduled").length} scheduled</Chip>
          <Button size="sm" icon="plus" iconPosition="left" onClick={() => start()}>
            New update
          </Button>
        </div>
        <div className="mt-3">
          <FormMessage error={error} notice={notice} />
        </div>
      </Panel>

      {editing && (
        <Panel title={editing === "new" ? "New update" : "Edit update"} description="Fields marked * are required.">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Title *" error={problems.title} className="md:col-span-2">
              <input className={FIELD} maxLength={200} value={draft.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Summary *" hint="One or two sentences" error={problems.summary} className="md:col-span-2">
              <textarea rows={2} maxLength={600} className={FIELD} value={draft.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <Field label="Full description" hint="Optional" className="md:col-span-2">
              <textarea rows={5} className={FIELD} value={draft.body} onChange={(e) => set("body", e.target.value)} />
            </Field>
            <Field label="Type">
              <Select
                label="Update type"
                value={draft.kind}
                onChange={(v) => set("kind", v as UpdateKind)}
                options={(Object.keys(UPDATE_KIND_LABELS) as UpdateKind[]).map((k) => ({ value: k, label: UPDATE_KIND_LABELS[k] }))}
              />
            </Field>
            <Field label="Product" hint="Optional">
              <Select
                label="Product"
                value={draft.productSlug}
                onChange={(v) => set("productSlug", v)}
                options={[{ value: "", label: "Company-wide" }, ...products]}
              />
            </Field>
            <Field label="Image" hint="Optional. Upload in Media Library first." className="md:col-span-2">
              <MediaPicker label="Update image" value={draft.imageId} onChange={(id) => set("imageId", id)} />
            </Field>
            <Field label="Publish on" hint="Optional. Leave empty to publish immediately." error={problems.publishAt}>
              <input
                type="datetime-local"
                className={FIELD}
                value={draft.publishAt}
                onChange={(e) => set("publishAt", e.target.value)}
              />
            </Field>
            <div className="flex flex-col gap-3">
              <SwitchRow
                checked={draft.published}
                onChange={(v) => set("published", v)}
                title="Published"
                body="Off keeps it as a private draft."
              />
              <SwitchRow
                checked={draft.featured}
                onChange={(v) => set("featured", v)}
                title="Featured"
                body="Featured updates are listed first."
              />
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save update"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title="All updates" padded={false}>
        {loading ? (
          <p className="p-6 text-[12.5px] text-[var(--ax-ink-dim)]">Loading…</p>
        ) : sorted.length === 0 ? (
          <EmptyState icon="bell" title="No updates yet" body="Announce new AI capabilities, modules, integrations, releases or company news." />
        ) : (
          <ul className="divide-y divide-[var(--ax-line)]">
            {sorted.map((u) => {
              const s = updateState(u);
              return (
                <li key={u.id} className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <Chip tone={STATE_CHIP[s].tone}>{STATE_CHIP[s].label}</Chip>
                      {u.featured && <Chip tone="accent">Featured</Chip>}
                      <span className="text-[14px] font-semibold text-[var(--ax-ink)]">{u.title}</span>
                    </span>
                    <span className="text-[12px] text-[var(--ax-ink-muted)]">
                      {[UPDATE_KIND_LABELS[u.kind], u.productSlug ? productName(u.productSlug) : "Company-wide", formatDate(u.publishAt || u.createdAt)].join(" · ")}
                    </span>
                    <span className="line-clamp-2 text-[12.5px] text-[var(--ax-ink-dim)]">{u.summary}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <RowAction onClick={() => patch(u.id, { published: !u.published })}>
                      {u.published ? "Unpublish" : "Publish"}
                    </RowAction>
                    <RowAction onClick={() => start(u)}>Edit</RowAction>
                    {confirming === u.id ? (
                      <>
                        <RowAction danger onClick={() => remove(u.id)}>
                          Confirm delete
                        </RowAction>
                        <RowAction onClick={() => setConfirming(null)}>Keep</RowAction>
                      </>
                    ) : (
                      <RowAction danger onClick={() => setConfirming(u.id)}>
                        Delete
                      </RowAction>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
