"use client";

import { useState, type FormEvent } from "react";
import { EmptyState, Panel } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useRecords } from "@/cms/useRecords";
import {
  CONFIDENTIAL_LABEL,
  DEPLOYMENT_STATUS_LABELS,
  type CustomerRecord,
  type DeploymentStatus,
  type DisclosureLevel,
} from "@/lib/enterprise";
import {
  Chip,
  FIELD,
  Field,
  FormMessage,
  MediaPicker,
  RowAction,
  SwitchRow,
  newId,
  splitList,
  useProductName,
  useProductOptions,
} from "../_records/kit";

const COUNTRIES = ["United Arab Emirates", "Saudi Arabia", "United States", "Australia", "China"];

const DISCLOSURE: Record<DisclosureLevel, { label: string; body: string }> = {
  hidden: { label: "Not shown publicly", body: "Kept in the portal only." },
  named: { label: "Show company name", body: "Name, country, industry and logo (if set) appear on the site." },
  confidential: {
    label: `Show as “${CONFIDENTIAL_LABEL}”`,
    body: "Only country, industry and product appear. Use only for real relationships you may disclose this way.",
  },
};

type Draft = {
  company: string;
  country: string;
  industry: string;
  productSlug: string;
  status: DeploymentStatus;
  deploymentDate: string;
  customization: string;
  modules: string;
  description: string;
  logoId?: string;
  verified: boolean;
  disclosure: DisclosureLevel;
};

const blank = (productSlug: string): Draft => ({
  company: "",
  country: "",
  industry: "",
  productSlug,
  status: "planned",
  deploymentDate: "",
  customization: "",
  modules: "",
  description: "",
  logoId: undefined,
  verified: false,
  disclosure: "hidden",
});

const fromRecord = (c: CustomerRecord): Draft => ({
  company: c.company,
  country: c.country,
  industry: c.industry,
  productSlug: c.productSlug,
  status: c.status,
  deploymentDate: c.deploymentDate ?? "",
  customization: c.customization ?? "",
  modules: (c.modules ?? []).join(", "),
  description: c.description ?? "",
  logoId: c.logoId,
  verified: c.verified,
  disclosure: c.disclosure,
});

/** Is this record on the public website right now? */
export const isPublicCustomer = (c: CustomerRecord) => c.verified && c.disclosure !== "hidden";

/**
 * Customer and deployment records. Nothing here is public until it is both
 * marked verified and given a disclosure level — the site never shows an
 * unconfirmed relationship.
 */
export function CustomersManager() {
  const { items, loading, saving, error, save } = useRecords<CustomerRecord>("customers");
  const products = useProductOptions();
  const productName = useProductName();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(blank(""));
  const [problems, setProblems] = useState<Partial<Record<keyof Draft, string>>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  function start(record?: CustomerRecord) {
    setNotice(null);
    setProblems({});
    setEditing(record ? record.id : "new");
    setDraft(record ? fromRecord(record) : blank(products[0]?.value ?? ""));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: typeof problems = {};
    if (!draft.company.trim()) found.company = "Enter the company name.";
    if (!draft.country.trim()) found.country = "Enter the country.";
    if (!draft.industry.trim()) found.industry = "Enter the industry.";
    if (!draft.productSlug) found.productSlug = "Choose the product purchased.";
    setProblems(found);
    if (Object.keys(found).length) return;

    const at = new Date().toISOString();
    const existing = items.find((c) => c.id === editing);
    const record: CustomerRecord = {
      id: existing?.id ?? newId("c"),
      company: draft.company.trim(),
      country: draft.country.trim(),
      industry: draft.industry.trim(),
      productSlug: draft.productSlug,
      status: draft.status,
      deploymentDate: draft.deploymentDate || undefined,
      customization: draft.customization.trim() || undefined,
      modules: splitList(draft.modules),
      description: draft.description.trim() || undefined,
      logoId: draft.logoId,
      verified: draft.verified,
      disclosure: draft.disclosure,
      createdAt: existing?.createdAt ?? at,
      updatedAt: at,
    };
    const next = existing ? items.map((c) => (c.id === existing.id ? record : c)) : [...items, record];
    if (await save(next)) {
      setEditing(null);
      setNotice(isPublicCustomer(record) ? "Saved. This customer is shown on the website." : "Saved. Not shown on the website.");
    }
  }

  async function remove(id: string) {
    if (await save(items.filter((c) => c.id !== id))) {
      setConfirming(null);
      if (editing === id) setEditing(null);
      setNotice("Customer record deleted.");
    }
  }

  const publicCount = items.filter(isPublicCustomer).length;

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title="How customer records appear"
        description="Only records marked Verified and given a disclosure level are shown on the website. Unverified or undisclosed records stay in the portal."
      >
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-[var(--ax-ink-muted)]">
          <Chip tone="muted">{items.length} records</Chip>
          <Chip tone="success">{publicCount} public</Chip>
          <Button size="sm" icon="plus" iconPosition="left" onClick={() => start()} disabled={!products.length}>
            Add customer
          </Button>
          {!products.length && <span className="text-[12px]">Add a product first.</span>}
        </div>
        <div className="mt-3">
          <FormMessage error={error} notice={notice} />
        </div>
      </Panel>

      {editing && (
        <Panel
          title={editing === "new" ? "New customer deployment" : "Edit customer deployment"}
          description="Fields marked * are required."
        >
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Company name *" error={problems.company}>
              <input className={FIELD} value={draft.company} onChange={(e) => set("company", e.target.value)} />
            </Field>
            <Field label="Country *" hint="Choose or type" error={problems.country}>
              <input
                className={FIELD}
                list="customer-countries"
                value={draft.country}
                onChange={(e) => set("country", e.target.value)}
              />
              <datalist id="customer-countries">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Industry *" error={problems.industry}>
              <input className={FIELD} value={draft.industry} onChange={(e) => set("industry", e.target.value)} />
            </Field>
            <Field label="Product purchased *" error={problems.productSlug}>
              <Select
                label="Product purchased"
                value={draft.productSlug}
                onChange={(v) => set("productSlug", v)}
                options={products}
              />
            </Field>
            <Field label="Deployment status">
              <Select
                label="Deployment status"
                value={draft.status}
                onChange={(v) => set("status", v as DeploymentStatus)}
                options={(Object.keys(DEPLOYMENT_STATUS_LABELS) as DeploymentStatus[]).map((s) => ({
                  value: s,
                  label: DEPLOYMENT_STATUS_LABELS[s],
                }))}
              />
            </Field>
            <Field label="Deployment date" hint="Optional">
              <input type="date" className={FIELD} value={draft.deploymentDate} onChange={(e) => set("deploymentDate", e.target.value)} />
            </Field>
            <Field label="Modules deployed" hint="Comma separated" className="md:col-span-2">
              <input className={FIELD} value={draft.modules} onChange={(e) => set("modules", e.target.value)} />
            </Field>
            <Field label="Customisation performed" className="md:col-span-2">
              <textarea rows={3} className={FIELD} value={draft.customization} onChange={(e) => set("customization", e.target.value)} />
            </Field>
            <Field label="Customer description" hint="Shown publicly only for named customers" className="md:col-span-2">
              <textarea rows={3} className={FIELD} value={draft.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <Field label="Customer logo" hint="Only if the customer has authorised it. Upload in Media Library first." className="md:col-span-2">
              <MediaPicker label="Customer logo" value={draft.logoId} onChange={(id) => set("logoId", id)} />
            </Field>
            <SwitchRow
              checked={draft.verified}
              onChange={(v) => set("verified", v)}
              title="Verified relationship"
              body="Turn on only once the customer, product and deployment are confirmed. Unverified records are never public."
            />
            <Field label="Public display">
              <Select
                label="Public display"
                value={draft.disclosure}
                onChange={(v) => set("disclosure", v as DisclosureLevel)}
                options={(Object.keys(DISCLOSURE) as DisclosureLevel[]).map((d) => ({ value: d, label: DISCLOSURE[d].label }))}
              />
              <span className="text-[11.5px] text-[var(--ax-ink-dim)]">{DISCLOSURE[draft.disclosure].body}</span>
            </Field>
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save customer"}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <span className="text-[12px] text-[var(--ax-ink-dim)]">
                {draft.verified && draft.disclosure !== "hidden"
                  ? "Will be shown on the website."
                  : "Will not be shown on the website."}
              </span>
            </div>
          </form>
        </Panel>
      )}

      <Panel title="Customer deployments" padded={false}>
        {loading ? (
          <p className="p-6 text-[12.5px] text-[var(--ax-ink-dim)]">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState
            icon="building"
            title="No customer records yet"
            body="Add verified customer deployments here. Nothing is shown publicly until you verify and disclose it."
          />
        ) : (
          <ul className="divide-y divide-[var(--ax-line)]">
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[14px] font-semibold text-[var(--ax-ink)]">{c.company}</span>
                  <span className="text-[12px] text-[var(--ax-ink-muted)]">
                    {[productName(c.productSlug), c.country, c.industry, DEPLOYMENT_STATUS_LABELS[c.status], c.deploymentDate]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    <Chip tone={c.verified ? "success" : "warning"}>{c.verified ? "Verified" : "Unverified"}</Chip>
                    <Chip tone={isPublicCustomer(c) ? "accent" : "muted"}>
                      {isPublicCustomer(c)
                        ? c.disclosure === "confidential"
                          ? "Public · confidential"
                          : "Public · named"
                        : "Not public"}
                    </Chip>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <RowAction onClick={() => start(c)}>Edit</RowAction>
                  {confirming === c.id ? (
                    <>
                      <RowAction danger onClick={() => remove(c.id)}>
                        Confirm delete
                      </RowAction>
                      <RowAction onClick={() => setConfirming(null)}>Keep</RowAction>
                    </>
                  ) : (
                    <RowAction danger onClick={() => setConfirming(c.id)}>
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
