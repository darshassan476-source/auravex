"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { useCms } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { Panel } from "@/components/admin/Primitives";
import { ProductCard } from "@/components/cards/ProductCard";
import { AX_EASE } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select as ThemedSelect } from "@/components/ui/Select";
import { MockScreen } from "@/components/ui/MockScreen";
import { Hairline } from "@/components/ui/Primitives";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/data/products";
import { fileToMedia, isSupported } from "@/lib/imageUpload";
import type { Product, ProductCategory, ProductStatus } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];
const STATUSES = Object.keys(STATUS_LABELS) as ProductStatus[];

const ACCENTS = ["#3b82f6", "#7c6cff", "#38bdf8", "#a855f7", "#2dd4bf", "#d946ef", "#fbbf24"];

const ICON_CHOICES = [
  "box", "brain", "building", "chart", "cloud", "code", "cpu", "database",
  "globe", "layers", "network", "package", "shield", "sparkles", "terminal", "workflow",
];

const STEPS = [
  { id: "basics", label: "Basics", icon: "file" },
  { id: "detail", label: "Detail", icon: "layers" },
  { id: "publish", label: "Publish", icon: "upload" },
] as const;

interface Draft {
  name: string;
  slug: string;
  tagline: string;
  sector: string;
  summary: string;
  description: string;
  category: ProductCategory;
  status: ProductStatus;
  icon: string;
  accent: string;
  year: string;
  tags: string;
  stack: string;
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
}

const BLANK: Draft = {
  name: "",
  slug: "",
  tagline: "",
  sector: "",
  summary: "",
  description: "",
  category: "saas",
  status: "development",
  icon: "box",
  accent: ACCENTS[0],
  year: String(new Date().getFullYear()),
  tags: "",
  stack: "",
  demoUrl: "",
  githubUrl: "",
  featured: false,
};

function fromProduct(product: Product): Draft {
  return {
    name: product.name,
    slug: product.slug,
    tagline: product.tagline,
    sector: product.sector,
    summary: product.summary,
    description: product.description,
    category: product.category,
    status: product.status,
    icon: product.icon,
    accent: product.accent,
    year: product.year,
    tags: product.tags.join(", "),
    stack: product.stack.join(", "),
    demoUrl: product.links.demo ?? "",
    githubUrl: product.links.github ?? "",
    featured: product.featured,
  };
}

const splitList = (value: string) =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

/**
 * Product authoring form with a live preview of the public card.
 *
 * Editing a bundled product stores only the changed fields as an override;
 * a new product is saved as a complete record. Either way `save()` writes
 * through the store to the server, and the product is live on /products
 * as soon as the server confirms.
 */
export function ProductForm() {
  const params = useSearchParams();
  const router = useRouter();
  const editingSlug = params.get("slug");
  const { state, setProduct, upsertCustomProduct, addMedia, flushNow } = useCms();
  const catalogue = useCatalogue({ includeHidden: true });
  const existing = editingSlug ? catalogue.find((p) => p.slug === editingSlug) : undefined;
  const builtIn = Boolean(existing && !existing.custom);

  const [draft, setDraft] = useState<Draft>(existing ? fromProduct(existing) : BLANK);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const image = existing && state.products[existing.slug]?.imageId
    ? state.media.find((m) => m.id === state.products[existing.slug]?.imageId)
    : undefined;

  async function onImage(files: FileList | null) {
    const file = files?.[0];
    if (!file || !existing) return;
    if (!isSupported(file)) {
      setNotice(`${file.name} is not a supported image (PNG, JPG, WebP, AVIF, GIF or SVG).`);
      return;
    }
    setImageBusy(true);
    setNotice(null);
    try {
      const item = await fileToMedia(file);
      addMedia(item);
      setProduct(existing.slug, { imageId: item.id });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "That upload failed.");
    } finally {
      setImageBusy(false);
      if (imageRef.current) imageRef.current.value = "";
    }
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => {
      // Keep the slug in step with the name until it is edited directly.
      if (key === "name" && (prev.slug === "" || prev.slug === slugify(prev.name))) {
        return { ...prev, name: value as string, slug: slugify(value as string) };
      }
      return { ...prev, [key]: value };
    });
    setSaved(false);
  }

  const preview = useMemo<Product>(
    () => ({
      id: existing?.id ?? "draft",
      slug: draft.slug || "untitled",
      name: draft.name || "Untitled product",
      tagline: draft.tagline || "A one-line promise goes here",
      category: draft.category,
      sector: draft.sector || "Sector",
      status: draft.status,
      summary: draft.summary || "A short summary of what this product does for the customer.",
      description:
        draft.description || "The longer positioning paragraph shown on featured cards and the detail page.",
      icon: draft.icon,
      accent: draft.accent,
      tags: splitList(draft.tags).length ? splitList(draft.tags) : ["Tag"],
      features: existing?.features ?? [],
      stack: splitList(draft.stack),
      metrics: existing?.metrics ?? [],
      architecture: existing?.architecture ?? [],
      timeline: existing?.timeline ?? [],
      gallery: existing?.gallery ?? [],
      links: { demo: draft.demoUrl || undefined, github: draft.githubUrl || undefined },
      featured: draft.featured,
      year: draft.year,
      views: existing?.views ?? 0,
    }),
    [draft, existing],
  );

  const complete =
    draft.name.trim() !== "" && draft.summary.trim() !== "" && draft.sector.trim() !== "";

  async function save() {
    setNotice(null);
    const slug = builtIn && existing ? existing.slug : draft.slug || slugify(draft.name);
    if (!slug) {
      setNotice("Give the product a name first.");
      return;
    }
    if (catalogue.some((p) => p.slug === slug && p.slug !== editingSlug)) {
      setNotice(`/products/${slug} is already taken by another product.`);
      return;
    }

    setBusy(true);
    if (builtIn && existing) {
      setProduct(existing.slug, {
        name: draft.name,
        tagline: draft.tagline,
        summary: draft.summary,
        description: draft.description,
        status: draft.status,
        accent: draft.accent,
        sector: draft.sector,
        category: draft.category,
        icon: draft.icon,
        tags: splitList(draft.tags),
        stack: splitList(draft.stack),
        year: draft.year,
        featured: draft.featured,
        links: { demo: draft.demoUrl || undefined, github: draft.githubUrl || undefined },
      });
    } else {
      upsertCustomProduct({ ...preview, slug, id: existing?.id ?? `custom-${slug}` });
    }

    const ok = await flushNow();
    setBusy(false);
    if (!ok) {
      setNotice("The server did not confirm the save. Check the connection and try again.");
      return;
    }
    setSaved(true);
    if (editingSlug !== slug) router.replace(`/admin/products/new?slug=${slug}`);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      {/* ---------- Form column ---------- */}
      <div className="flex flex-col gap-5">
        {/* Stepper */}
        <div className="ax-glass ax-edge-light flex items-center gap-2 rounded-2xl p-2">
          {STEPS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "ax-focus relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition-colors duration-300",
                step === i ? "text-[var(--ax-ink)]" : "text-[var(--ax-ink-dim)] hover:text-[var(--ax-ink-muted)]",
              )}
            >
              {step === i && (
                <motion.span
                  layoutId="product-step"
                  transition={{ duration: 0.36, ease: AX_EASE }}
                  className="absolute inset-0 rounded-xl bg-[rgba(var(--ax-glow),0.14)] ring-1 ring-[var(--ax-line-strong)]"
                />
              )}
              <Icon name={item.icon} className="relative size-3.5" strokeWidth={2} />
              <span className="relative">
                <span className="mr-1.5 font-mono text-[10px] text-[var(--ax-ink-dim)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <Panel>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.3, ease: AX_EASE }}
              className="flex flex-col gap-5"
            >
              {step === 0 && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Product name">
                      <Input value={draft.name} onChange={(v) => set("name", v)} placeholder="Real Estate OS" />
                    </Field>
                    <Field label="URL slug" hint={`/products/${draft.slug || "…"}`}>
                      <Input value={draft.slug} disabled={builtIn} onChange={(v) => set("slug", slugify(v))} placeholder="real-estate-os" mono />
                    </Field>
                  </div>

                  <Field label="Tagline">
                    <Input
                      value={draft.tagline}
                      onChange={(v) => set("tagline", v)}
                      placeholder="The Operating System for Modern Real Estate"
                    />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Sector">
                      <Input value={draft.sector} onChange={(v) => set("sector", v)} placeholder="Real Estate & Property Tech" />
                    </Field>
                    <Field label="Year">
                      <Input value={draft.year} onChange={(v) => set("year", v)} placeholder="2026" mono />
                    </Field>
                  </div>

                  <Field label="Summary" hint="One sentence. Shown on product cards.">
                    <Textarea
                      value={draft.summary}
                      onChange={(v) => set("summary", v)}
                      rows={2}
                      placeholder="End-to-end platform for property management, leasing and investment operations."
                    />
                  </Field>

                  <Field label="Description" hint="The longer positioning paragraph on the detail page.">
                    <Textarea
                      value={draft.description}
                      onChange={(v) => set("description", v)}
                      rows={4}
                      placeholder="Unify your portfolio, people and performance…"
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Category">
                      <Select
                        value={draft.category}
                        onChange={(v) => set("category", v as ProductCategory)}
                        options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
                      />
                    </Field>
                    <Field label="Status">
                      <Select
                        value={draft.status}
                        onChange={(v) => set("status", v as ProductStatus)}
                        options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
                      />
                    </Field>
                  </div>

                  <Field label="Accent colour">
                    <div className="flex flex-wrap gap-2">
                      {ACCENTS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => set("accent", color)}
                          aria-label={`Accent ${color}`}
                          className={cn(
                            "ax-focus size-9 rounded-xl border transition-transform duration-300 hover:scale-110",
                            draft.accent === color
                              ? "border-[var(--ax-ink)] ring-2 ring-[rgba(var(--ax-glow),0.4)]"
                              : "border-[var(--ax-line)]",
                          )}
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </Field>

                  <Field label="Icon">
                    <div className="flex flex-wrap gap-2">
                      {ICON_CHOICES.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => set("icon", icon)}
                          aria-label={`Icon ${icon}`}
                          className={cn(
                            "ax-focus grid size-9 place-items-center rounded-xl border transition-colors duration-300",
                            draft.icon === icon
                              ? "border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-accent-soft)]"
                              : "border-[var(--ax-line)] text-[var(--ax-ink-dim)] hover:text-[var(--ax-ink-muted)]",
                          )}
                        >
                          <Icon name={icon} className="size-4" strokeWidth={1.9} />
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Tags" hint="Comma separated.">
                    <Input value={draft.tags} onChange={(v) => set("tags", v)} placeholder="Title Platform, AI-Powered, Enterprise" />
                  </Field>

                  <Field label="Stack" hint="Comma separated.">
                    <Input value={draft.stack} onChange={(v) => set("stack", v)} placeholder="Next.js, TypeScript, Python, PostgreSQL" mono />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Demo link" hint="Where the primary CTA points.">
                    <Input value={draft.demoUrl} onChange={(v) => set("demoUrl", v)} placeholder="/contact" mono />
                  </Field>

                  <Field label="Repository" hint="Optional. Shown as a secondary action.">
                    <Input value={draft.githubUrl} onChange={(v) => set("githubUrl", v)} placeholder="https://github.com/auravex/…" mono />
                  </Field>

                  <Field
                    label="Product image"
                    hint={existing ? "Shown on the card and the product page." : "Save the product first, then add its image."}
                  >
                    <button
                      type="button"
                      disabled={!existing || imageBusy}
                      onClick={() => imageRef.current?.click()}
                      className="ax-focus flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.04)] px-6 py-8 text-center transition-colors hover:border-[var(--ax-accent)]/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image.src} alt="" className="aspect-[16/10] w-full max-w-[320px] rounded-lg object-cover" />
                      ) : (
                        <span className="grid size-11 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)] text-[var(--ax-accent-soft)]">
                          <Icon name="upload" className="size-5" strokeWidth={1.8} />
                        </span>
                      )}
                      <p className="text-[13px] font-medium text-[var(--ax-ink)]">
                        {imageBusy ? "Uploading…" : image ? "Replace the image" : "Upload a screenshot"}
                      </p>
                      <p className="max-w-xs text-[11.5px] leading-relaxed text-[var(--ax-ink-dim)]">
                        PNG, JPG, WebP, AVIF, GIF or SVG up to 15 MB. Without one, the page shows the
                        product archetype visual.
                      </p>
                    </button>
                    <input
                      ref={imageRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => onImage(e.target.files)}
                    />
                  </Field>

                  <Hairline />

                  <button
                    type="button"
                    onClick={() => set("featured", !draft.featured)}
                    className="ax-focus flex items-center justify-between gap-4 rounded-xl border border-[var(--ax-line)] p-4 text-left transition-colors duration-300 hover:border-[var(--ax-line-strong)]"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="text-[13.5px] font-semibold text-[var(--ax-ink)]">
                        Feature on the homepage
                      </span>
                      <span className="text-[11.5px] text-[var(--ax-ink-dim)]">
                        Featured products appear in the portfolio rail above the fold.
                      </span>
                    </span>
                    <span
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
                        draft.featured ? "bg-[var(--ax-accent)]" : "bg-[var(--ax-line-strong)]",
                      )}
                    >
                      <motion.span
                        animate={{ x: draft.featured ? 20 : 2 }}
                        transition={{ duration: 0.26, ease: AX_EASE }}
                        className="absolute top-1 size-4 rounded-full bg-white"
                      />
                    </span>
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer controls */}
          <div className="mt-7 flex items-center justify-between gap-4 border-t border-[var(--ax-line)] pt-5">
            <Button
              variant="ghost"
              size="sm"
              icon="arrow-left"
              iconPosition="left"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>

            <div className="flex items-center gap-2.5">
              {notice && (
                <span className="text-[12px] text-[var(--ax-danger)]">{notice}</span>
              )}
              <AnimatePresence>
                {saved && !notice && (
                  <motion.span
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--ax-success)]"
                  >
                    <Icon name="check" className="size-3.5" strokeWidth={2.6} />
                    Saved ·{" "}
                    <Link href={`/products/${existing?.slug ?? draft.slug}`} className="underline underline-offset-2">
                      view on the site
                    </Link>
                  </motion.span>
                )}
              </AnimatePresence>

              {step < STEPS.length - 1 ? (
                <Button size="sm" icon="arrow-right" onClick={() => setStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <Button size="sm" icon="upload" iconPosition="left" disabled={!complete || busy} onClick={save}>
                  {busy ? "Saving…" : existing ? "Update product" : "Publish product"}
                </Button>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* ---------- Preview column ---------- */}
      <div className="flex flex-col gap-5 xl:sticky xl:top-24 xl:self-start">
        <Panel title="Card preview" description="Exactly how this renders on /products">
          <ProductCard preview product={preview} />
        </Panel>

        <Panel title="Detail header" description="Hero treatment on the product page">
          <div className="flex flex-col gap-4">
            <MockScreen
              seed={draft.slug || "draft"}
              accent={draft.accent}
              label={draft.name || "Untitled product"}
              variant="dashboard"
            />
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ax-ink-dim)]">
                {draft.sector || "Sector"}
              </span>
              <span className="ax-display text-[22px] text-[var(--ax-ink)]">
                {draft.name || "Untitled product"}
              </span>
              <span className="ax-gradient-text text-[14px] font-semibold">
                {draft.tagline || "A one-line promise goes here"}
              </span>
            </div>
          </div>
        </Panel>

        {!complete && (
          <p className="flex items-start gap-2 rounded-xl border border-[var(--ax-warning)]/30 bg-[var(--ax-warning)]/8 px-4 py-3 text-[12px] leading-relaxed text-[var(--ax-warning)]">
            <Icon name="clock" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} />
            Name, sector and summary are required before this can be published.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Form primitives ---------------- */

const FIELD_CLASS =
  "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
  "px-3.5 py-2.5 text-[13.5px] text-[var(--ax-ink)] outline-none transition-colors duration-300 " +
  "placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
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

function Input({
  value,
  onChange,
  placeholder,
  mono,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mono?: boolean;
  /** Locked fields (a bundled product's address) still show their value. */
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(FIELD_CLASS, mono && "font-mono text-[12.5px]", disabled && "opacity-60")}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(FIELD_CLASS, "resize-none leading-relaxed")}
    />
  );
}

/**
 * Thin wrapper over the shared picker, so this form matches the rest of the
 * portal and its menu is drawn by the page rather than the operating system.
 */
function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <ThemedSelect
      label="Choose an option"
      value={value}
      onChange={onChange}
      options={options}
      className="w-full"
    />
  );
}
