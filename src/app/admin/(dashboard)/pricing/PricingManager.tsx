"use client";

import { useEffect, useState } from "react";
import { EmptyState, Panel } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import { useRecords } from "@/cms/useRecords";
import { PRICE_LINES, type PriceLineKey, type PricingRecord } from "@/lib/enterprise";
import { cn } from "@/lib/utils";
import { Chip, FIELD, Field, FormMessage, SwitchRow, useProductOptions } from "../_records/kit";

type Draft = {
  currency: string;
  lines: Partial<Record<PriceLineKey, string>>;
  notes: string;
  publicDisplay: boolean;
};

const blank: Draft = { currency: "AED", lines: {}, notes: "", publicDisplay: false };

/**
 * Commercial figures per product. Free text per line, because enterprise
 * pricing is rarely one number; nothing is shown publicly unless the owner
 * turns on public display for that product.
 */
export function PricingManager() {
  const { items, loading, saving, error, save } = useRecords<PricingRecord>("pricing");
  const products = useProductOptions();
  const [slug, setSlug] = useState("");
  const [draft, setDraft] = useState<Draft>(blank);
  const [problem, setProblem] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const active = slug || products[0]?.value || "";
  const record = items.find((p) => p.productSlug === active);

  // Load the chosen product's record into the form.
  useEffect(() => {
    setDraft(
      record
        ? { currency: record.currency, lines: { ...record.lines }, notes: record.notes ?? "", publicDisplay: record.publicDisplay }
        : blank,
    );
    setProblem(null);
  }, [record, active]);

  async function submit() {
    setNotice(null);
    const currency = draft.currency.trim().toUpperCase();
    if (!currency) return setProblem("Enter a currency, e.g. AED or USD.");
    if (currency.length > 8) return setProblem("Currency must be at most 8 characters.");
    const lines = Object.fromEntries(
      Object.entries(draft.lines)
        .map(([k, v]) => [k, (v ?? "").trim()])
        .filter(([, v]) => v),
    ) as PricingRecord["lines"];
    if (draft.publicDisplay && Object.keys(lines).length === 0) {
      return setProblem("Add at least one price line before showing pricing publicly.");
    }
    setProblem(null);
    const next: PricingRecord = {
      productSlug: active,
      currency,
      lines,
      notes: draft.notes.trim() || undefined,
      publicDisplay: draft.publicDisplay,
      updatedAt: new Date().toISOString(),
    };
    const list = record ? items.map((p) => (p.productSlug === active ? next : p)) : [...items, next];
    if (await save(list)) {
      setNotice(next.publicDisplay ? "Saved. These prices are shown on the product page." : "Saved. Kept internal — the website shows tailored pricing.");
    }
  }

  async function clear() {
    if (!record) return;
    if (await save(items.filter((p) => p.productSlug !== active))) setNotice("Pricing removed for this product.");
  }

  if (!products.length) {
    return (
      <Panel>
        <EmptyState icon="box" title="No products yet" body="Add a product before configuring its pricing." />
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
      <Panel title="Products" padded={false}>
        <ul className="flex flex-col p-2">
          {products.map((p) => {
            const r = items.find((i) => i.productSlug === p.value);
            return (
              <li key={p.value}>
                <button
                  type="button"
                  onClick={() => {
                    setSlug(p.value);
                    setNotice(null);
                  }}
                  className={cn(
                    "ax-focus flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-[13px] transition-colors",
                    p.value === active
                      ? "bg-[rgba(var(--ax-glow),0.12)] text-[var(--ax-ink)]"
                      : "text-[var(--ax-ink-muted)] hover:bg-[rgba(var(--ax-glow),0.06)]",
                  )}
                >
                  <span className="truncate">{p.label}</span>
                  {r && <Chip tone={r.publicDisplay ? "accent" : "muted"}>{r.publicDisplay ? "Public" : "Internal"}</Chip>}
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title={`Pricing — ${products.find((p) => p.value === active)?.label ?? ""}`}
        description="Write each line as you would quote it, e.g. “From 45,000 per year” or “Quoted per integration”. Leave lines empty if not applicable."
      >
        {loading ? (
          <p className="text-[12.5px] text-[var(--ax-ink-dim)]">Loading…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Currency *" hint="e.g. AED, USD, SAR" className="max-w-[200px]">
              <input className={FIELD} value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              {PRICE_LINES.map((line) => (
                <Field key={line.key} label={line.label}>
                  <input
                    className={FIELD}
                    value={draft.lines[line.key] ?? ""}
                    maxLength={200}
                    onChange={(e) => setDraft({ ...draft, lines: { ...draft.lines, [line.key]: e.target.value } })}
                  />
                </Field>
              ))}
            </div>
            <Field label="Internal notes" hint="Never shown publicly">
              <textarea rows={3} className={FIELD} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            </Field>
            <SwitchRow
              checked={draft.publicDisplay}
              onChange={(v) => setDraft({ ...draft, publicDisplay: v })}
              title="Show these prices on the public website"
              body="Off by default. When off, visitors see “Enterprise pricing tailored to your organization’s requirements” and a Request Commercial Proposal button."
            />
            <FormMessage error={problem ?? error} notice={notice} />
            <div className="flex flex-wrap gap-3">
              <Button size="sm" onClick={submit} disabled={saving}>
                {saving ? "Saving…" : "Save pricing"}
              </Button>
              {record && (
                <Button size="sm" variant="ghost" onClick={clear} disabled={saving}>
                  Remove pricing for this product
                </Button>
              )}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
