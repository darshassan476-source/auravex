"use client";

import { useState, type FormEvent } from "react";
import { EmptyState, Panel } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useRecords } from "@/cms/useRecords";
import type { AdoptionFigure } from "@/lib/enterprise";
import {
  Chip,
  FIELD,
  Field,
  FormMessage,
  RowAction,
  SwitchRow,
  newId,
  useProductName,
  useProductOptions,
} from "../_records/kit";

type Draft = {
  productSlug: string;
  label: string;
  value: string;
  suffix: string;
  verified: boolean;
  public: boolean;
  source: string;
};

const blank: Draft = { productSlug: "all", label: "", value: "", suffix: "", verified: false, public: false, source: "" };

const isShown = (f: AdoptionFigure) => f.verified && f.public;

/**
 * Adoption figures. The site renders each figure from what is stored here —
 * there are no hard-coded counters — and only once it is verified and public.
 */
export function AdoptionManager() {
  const { items, loading, saving, error, save } = useRecords<AdoptionFigure>("adoption");
  const products = useProductOptions();
  const productName = useProductName();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [problems, setProblems] = useState<Partial<Record<keyof Draft, string>>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  function start(figure?: AdoptionFigure) {
    setNotice(null);
    setProblems({});
    setEditing(figure ? figure.id : "new");
    setDraft(
      figure
        ? {
            productSlug: figure.productSlug,
            label: figure.label,
            value: String(figure.value),
            suffix: figure.suffix ?? "",
            verified: figure.verified,
            public: figure.public,
            source: figure.source ?? "",
          }
        : blank,
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: typeof problems = {};
    const value = Number(draft.value);
    if (!draft.label.trim()) found.label = "Describe the figure, e.g. “Businesses using AI DMS”.";
    if (draft.value.trim() === "" || !Number.isFinite(value) || value < 0) found.value = "Enter a number (0 or more).";
    if (draft.suffix.length > 8) found.suffix = "At most 8 characters.";
    setProblems(found);
    if (Object.keys(found).length) return;

    const existing = items.find((f) => f.id === editing);
    const figure: AdoptionFigure = {
      id: existing?.id ?? newId("f"),
      productSlug: draft.productSlug,
      label: draft.label.trim(),
      value,
      suffix: draft.suffix.trim() || undefined,
      verified: draft.verified,
      public: draft.public,
      source: draft.source.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    const next = existing ? items.map((f) => (f.id === existing.id ? figure : f)) : [...items, figure];
    if (await save(next)) {
      setEditing(null);
      setNotice(isShown(figure) ? "Saved. This figure is shown on the website." : "Saved. Hidden from the website until verified and public.");
    }
  }

  async function remove(id: string) {
    if (await save(items.filter((f) => f.id !== id))) {
      setConfirming(null);
      if (editing === id) setEditing(null);
      setNotice("Figure deleted.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title="Verified figures only"
        description="A figure appears on the website only when it is both Verified and Public. Keep unconfirmed numbers unverified — they stay in the portal."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Chip tone="muted">{items.length} figures</Chip>
          <Chip tone="success">{items.filter(isShown).length} public</Chip>
          <Button size="sm" icon="plus" iconPosition="left" onClick={() => start()}>
            Add figure
          </Button>
        </div>
        <div className="mt-3">
          <FormMessage error={error} notice={notice} />
        </div>
      </Panel>

      {editing && (
        <Panel title={editing === "new" ? "New figure" : "Edit figure"} description="Fields marked * are required.">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Applies to">
              <Select
                label="Applies to"
                value={draft.productSlug}
                onChange={(v) => set("productSlug", v)}
                options={[{ value: "all", label: "Auravex (company-wide)" }, ...products]}
              />
            </Field>
            <Field label="Label *" hint="e.g. Businesses using the software" error={problems.label}>
              <input className={FIELD} value={draft.label} onChange={(e) => set("label", e.target.value)} />
            </Field>
            <Field label="Value *" error={problems.value}>
              <input type="number" min={0} step="any" className={FIELD} value={draft.value} onChange={(e) => set("value", e.target.value)} />
            </Field>
            <Field label="Suffix" hint="Optional, e.g. +" error={problems.suffix}>
              <input className={FIELD} maxLength={8} value={draft.suffix} onChange={(e) => set("suffix", e.target.value)} />
            </Field>
            <Field label="Source / evidence" hint="Internal note, never public" className="md:col-span-2">
              <textarea rows={2} className={FIELD} value={draft.source} onChange={(e) => set("source", e.target.value)} />
            </Field>
            <SwitchRow
              checked={draft.verified}
              onChange={(v) => set("verified", v)}
              title="Verified"
              body="The number is confirmed with supporting evidence."
            />
            <SwitchRow
              checked={draft.public}
              onChange={(v) => set("public", v)}
              title="Show on the website"
              body="Takes effect only when the figure is also verified."
            />
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save figure"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title="Adoption figures" padded={false}>
        {loading ? (
          <p className="p-6 text-[12.5px] text-[var(--ax-ink-dim)]">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState
            icon="chart"
            title="No figures yet"
            body="Add figures such as businesses using a product, enterprise deployments or countries served."
          />
        ) : (
          <ul className="divide-y divide-[var(--ax-line)]">
            {items.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[14px] font-semibold text-[var(--ax-ink)]">
                    {f.value.toLocaleString()}
                    {f.suffix} · {f.label}
                  </span>
                  <span className="text-[12px] text-[var(--ax-ink-muted)]">
                    {f.productSlug === "all" ? "Company-wide" : productName(f.productSlug)}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    <Chip tone={f.verified ? "success" : "warning"}>{f.verified ? "Verified" : "Unverified"}</Chip>
                    <Chip tone={isShown(f) ? "accent" : "muted"}>{isShown(f) ? "Public" : "Hidden"}</Chip>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <RowAction onClick={() => start(f)}>Edit</RowAction>
                  {confirming === f.id ? (
                    <>
                      <RowAction danger onClick={() => remove(f.id)}>
                        Confirm delete
                      </RowAction>
                      <RowAction onClick={() => setConfirming(null)}>Keep</RowAction>
                    </>
                  ) : (
                    <RowAction danger onClick={() => setConfirming(f.id)}>
                      Delete
                    </RowAction>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
