"use client";

import { useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import { DEPLOYMENT_LABELS } from "@/data/products";
import type { ProductOverride } from "@/lib/cms";
import type { DeploymentOption, Product, ProductFeature, ProductModule, ProductPreview } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FIELD, Field, SwitchRow, slugify } from "../_records/kit";

const DEPLOYMENTS = Object.keys(DEPLOYMENT_LABELS) as DeploymentOption[];

/**
 * The enterprise half of a product: everything the public detail page and the
 * "Customize Your Solution" configurator render. Each list is stored as a
 * product override, replacing the bundled list only once it is edited.
 *
 * Text areas commit on blur, so a half-typed line is never split or dropped
 * while the owner is still typing.
 */
export function EnterpriseDetails({ slug, base }: { slug: string; base: Product }) {
  const { state, setProduct } = useCms();
  const patch: ProductOverride = state.products[slug] ?? {};
  const pick = <K extends keyof ProductOverride & keyof Product>(key: K) =>
    (patch[key] !== undefined ? patch[key] : base[key]) as Product[K];
  const set = (change: ProductOverride) => setProduct(slug, change);

  const demo = (patch.links?.demo ?? base.links.demo) || "";
  const deployment = pick("deployment") ?? [];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel
        title="Enterprise details"
        description="What the product page lists. One item per line; changes save when you leave a box."
        className="xl:col-span-2"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Quick Demo address" hint="Opens in a new tab from the product page">
            <input
              type="url"
              className={FIELD}
              placeholder="https://…"
              defaultValue={demo}
              key={`demo-${slug}`}
              onBlur={(e) => set({ links: { ...patch.links, demo: e.target.value.trim() || undefined } })}
            />
          </Field>
          <Field label="Listing order" hint="Lower numbers are listed first">
            <input
              type="number"
              className={FIELD}
              defaultValue={pick("order") ?? ""}
              key={`order-${slug}`}
              onBlur={(e) => set({ order: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          </Field>
          <SwitchRow
            checked={pick("demoPublic") !== false}
            onChange={(v) => set({ demoPublic: v })}
            title="Show the Quick Demo button"
            body={demo ? "Turn off if the live demo should not be public." : "No demo address set — the button is hidden and visitors are offered a consultation instead."}
          />
          <SwitchRow
            checked={Boolean(pick("voiceAI"))}
            onChange={(v) => set({ voiceAI: v })}
            title="Offer voice-to-voice AI"
            body="Adds the optional voice-to-voice AI choice to this product's configurator."
          />

          <LinesField key={`problems-${slug}`} label="Business problems it solves" value={pick("problems")} onCommit={(v) => set({ problems: v })} />
          <LinesField key={`ai-${slug}`} label="AI capabilities" value={pick("aiCapabilities")} onCommit={(v) => set({ aiCapabilities: v })} />
          <LinesField key={`wf-${slug}`} label="Supported workflows" value={pick("workflows")} onCommit={(v) => set({ workflows: v })} />
          <LinesField key={`int-${slug}`} label="Integration possibilities" value={pick("integrations")} onCommit={(v) => set({ integrations: v })} />
          <LinesField key={`ind-${slug}`} label="Industries that benefit" value={pick("industries")} onCommit={(v) => set({ industries: v })} />
          <LinesField key={`cust-${slug}`} label="Customisation options" value={pick("customization")} onCommit={(v) => set({ customization: v })} />

          <div className="flex flex-col gap-2 md:col-span-2">
            <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">Deployment options offered</span>
            <div className="flex flex-wrap gap-2">
              {DEPLOYMENTS.map((d) => {
                const on = deployment.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ deployment: on ? deployment.filter((x) => x !== d) : [...deployment, d] })}
                    className={cn(
                      "ax-focus inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                      on
                        ? "border-[var(--ax-accent)] bg-[var(--ax-accent)]/12 text-[var(--ax-ink)]"
                        : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)]",
                    )}
                  >
                    {on && <Icon name="check" className="size-3.5" strokeWidth={2.4} />}
                    {DEPLOYMENT_LABELS[d]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      <ModulesField
        key={`features-${slug}`}
        title="Main capabilities"
        description="Headline capabilities, each with a short explanation."
        value={(pick("features") ?? []).map((f) => ({ id: slugify(f.title), name: f.title, description: f.description }))}
        onCommit={(rows) =>
          set({
            features: rows.map(
              (r, i): ProductFeature => ({
                title: r.name,
                description: r.description,
                icon: (pick("features") ?? [])[i]?.icon ?? "check-circle",
              }),
            ),
          })
        }
      />
      <ModulesField
        key={`modules-${slug}`}
        title="Available modules"
        description="Modules included in the product."
        value={pick("modules") ?? []}
        onCommit={(rows) => set({ modules: rows })}
      />
      <ModulesField
        key={`optional-${slug}`}
        title="Optional add-on modules"
        description="Offered in “Customize Your Solution”. Customers choose only what they need."
        value={pick("optionalModules") ?? []}
        onCommit={(rows) => set({ optionalModules: rows })}
      />
      <ModulesField
        key={`aienh-${slug}`}
        title="Optional AI enhancements"
        description="AI options offered in the configurator."
        value={pick("aiEnhancements") ?? []}
        onCommit={(rows) => set({ aiEnhancements: rows })}
      />

      <PreviewPanel key={`preview-${slug}`} value={pick("preview") ?? {}} onChange={(preview) => set({ preview })} />
    </div>
  );
}

/** One string per line. */
function LinesField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: string[] | undefined;
  onCommit: (lines: string[]) => void;
}) {
  const [text, setText] = useState((value ?? []).join("\n"));
  return (
    <Field label={label} hint="One per line">
      <textarea
        rows={5}
        className={FIELD}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const lines = text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          if (lines.join("\n") !== (value ?? []).join("\n")) onCommit(lines);
        }}
      />
    </Field>
  );
}

type Row = { name: string; description: string };

/** Name + description rows; ids come from the name. */
function ModulesField({
  title,
  description,
  value,
  onCommit,
}: {
  title: string;
  description: string;
  value: ProductModule[];
  onCommit: (rows: ProductModule[]) => void;
}) {
  const [rows, setRows] = useState<Row[]>(value.map((m) => ({ name: m.name, description: m.description })));

  function commit(next: Row[]) {
    const clean = next
      .filter((r) => r.name.trim())
      .map((r, i) => ({
        id: slugify(r.name) || `item-${i + 1}`,
        name: r.name.trim(),
        description: r.description.trim(),
      }));
    const before = JSON.stringify(value.map((m) => [m.name, m.description]));
    const after = JSON.stringify(clean.map((m) => [m.name, m.description]));
    if (before !== after) onCommit(clean);
  }

  const update = (i: number, change: Partial<Row>) =>
    setRows((list) => list.map((r, idx) => (idx === i ? { ...r, ...change } : r)));

  return (
    <Panel
      title={title}
      description={description}
      action={
        <button
          type="button"
          onClick={() => setRows((list) => [...list, { name: "", description: "" }])}
          className="ax-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--ax-accent-soft)] hover:bg-[rgba(var(--ax-glow),0.10)]"
        >
          <Icon name="plus" className="size-3.5" strokeWidth={2.4} />
          Add
        </button>
      }
    >
      {rows.length === 0 ? (
        <p className="text-[12.5px] text-[var(--ax-ink-dim)]">None yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <li key={i} className="grid gap-2 rounded-xl border border-[var(--ax-line)] p-3 sm:grid-cols-[1fr_1.6fr_auto]">
              <input
                aria-label={`${title} ${i + 1} name`}
                placeholder="Name"
                className={FIELD}
                value={row.name}
                onChange={(e) => update(i, { name: e.target.value })}
                onBlur={() => commit(rows)}
              />
              <input
                aria-label={`${title} ${i + 1} description`}
                placeholder="Short description"
                className={FIELD}
                value={row.description}
                onChange={(e) => update(i, { description: e.target.value })}
                onBlur={() => commit(rows)}
              />
              <button
                type="button"
                aria-label="Remove"
                onClick={() => {
                  const next = rows.filter((_, idx) => idx !== i);
                  setRows(next);
                  commit(next);
                }}
                className="ax-focus grid size-10 place-items-center rounded-lg text-[var(--ax-ink-dim)] hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-danger)]"
              >
                <Icon name="trash" className="size-4" strokeWidth={1.9} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** Early access: preview link, screens, description, expected release. */
function PreviewPanel({ value, onChange }: { value: ProductPreview; onChange: (next: ProductPreview) => void }) {
  const { state } = useCms();
  const images = state.media.filter((m) => !m.mime || m.mime.startsWith("image/"));
  const chosen = value.imageIds ?? [];
  const merge = (change: Partial<ProductPreview>) => onChange({ ...value, ...change });

  return (
    <Panel
      title="Preview & release"
      description="For products under development, upcoming or in preview. A preview link is shown only when public access is on."
      className="xl:col-span-2"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Preview address">
          <input
            type="url"
            className={FIELD}
            placeholder="https://…"
            defaultValue={value.url ?? ""}
            onBlur={(e) => merge({ url: e.target.value.trim() || undefined })}
          />
        </Field>
        <Field label="Expected release" hint="Optional, e.g. Q2 2027. Shown only if set.">
          <input
            className={FIELD}
            defaultValue={value.expectedRelease ?? ""}
            onBlur={(e) => merge({ expectedRelease: e.target.value.trim() || undefined })}
          />
        </Field>
        <Field label="Preview description" className="md:col-span-2">
          <textarea
            rows={3}
            className={FIELD}
            defaultValue={value.description ?? ""}
            onBlur={(e) => merge({ description: e.target.value.trim() || undefined })}
          />
        </Field>
        <SwitchRow
          checked={Boolean(value.public)}
          onChange={(v) => merge({ public: v })}
          title="Public preview access"
          body={
            value.url
              ? "On shows “View Preview”. Off shows “Request a Preview” instead."
              : "Add a preview address first; without one visitors can only request a preview."
          }
        />
        <div className="flex flex-col gap-2 md:col-span-2">
          <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">
            Preview images <span className="text-[11px] text-[var(--ax-ink-dim)]">Click to add or remove. Upload in Media Library.</span>
          </span>
          {images.length === 0 ? (
            <p className="text-[12px] text-[var(--ax-ink-dim)]">No images in the library yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {images.map((m) => {
                const on = chosen.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    title={m.name}
                    onClick={() => merge({ imageIds: on ? chosen.filter((x) => x !== m.id) : [...chosen, m.id] })}
                    className={cn(
                      "ax-focus relative size-16 overflow-hidden rounded-lg border-2 transition-colors",
                      on ? "border-[var(--ax-accent)]" : "border-[var(--ax-line)] opacity-70 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.src} alt={m.name} className="size-full object-cover" />
                    {on && (
                      <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-[var(--ax-accent)] text-white">
                        <Icon name="check" className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
