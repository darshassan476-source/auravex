"use client";

import { useRef, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Panel } from "@/components/admin/Primitives";
import { SitePreview } from "@/components/admin/SitePreview";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import {
  BLOCK_LABELS,
  BLOCK_SLOTS,
  PAGE_LABELS,
  SLOT_LABELS,
  type Block,
  type BlockSlot,
  type BlockType,
  type PageKey,
} from "@/lib/cms";
import { fileToMedia, isSupported } from "@/lib/imageUpload";
import { cn } from "@/lib/utils";

/** Pages that can carry blocks, and where the preview should open them. */
const PAGES: { key: PageKey; path: string }[] = [
  { key: "home", path: "/" },
  { key: "products", path: "/products" },
  { key: "product-detail", path: "/products/real-estate-os" },
  { key: "solutions", path: "/solutions" },
  { key: "industries", path: "/industries" },
  { key: "our-work", path: "/our-work" },
  { key: "case-study", path: "/our-work/manual-work-reduction" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
];

const TYPE_ICONS: Record<BlockType, string> = {
  image: "image",
  text: "file",
  stats: "chart",
  quote: "message",
  video: "play",
};

const INPUT =
  "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
  "px-3.5 py-2.5 text-[13px] text-[var(--ax-ink)] outline-none transition-colors duration-300 " +
  "placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

/**
 * Drop images, text, figures, quotes and video onto any page.
 *
 * Each page has two slots — under the hero and above the closing call to
 * action. Blocks are arranged per slot, edited in place, and the live preview
 * beside the editor shows the real page with them in it.
 */
export function PageBuilder() {
  const { state, error, notice, addBlock, updateBlock, removeBlock, moveBlock, addMedia } = useCms();
  const [page, setPage] = useState<PageKey>("home");
  const [slot, setSlot] = useState<BlockSlot>("after-hero");
  const [openId, setOpenId] = useState<string | null>(null);

  const path = PAGES.find((p) => p.key === page)?.path ?? "/";
  const blocks = (state.blocks[page] ?? []).filter((b) => b.slot === slot);
  const totalOnPage = (state.blocks[page] ?? []).length;

  function add(type: BlockType) {
    const id = addBlock(page, {
      type,
      slot,
      ...(type === "stats"
        ? { title: "By the numbers", items: [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }] }
        : {}),
      ...(type === "image" ? { framed: true } : {}),
    });
    setOpenId(id);
  }

  return (
    <div className="flex flex-col gap-5">
      {notice && !error && (
        <p className="rounded-xl border border-[var(--ax-danger)]/35 bg-[var(--ax-danger)]/10 px-4 py-2.5 text-[12.5px] text-[var(--ax-danger)]">
          {notice}
        </p>
      )}
      {error && (
        <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 px-4 py-3 text-[12.5px] text-[var(--ax-warning)]">
          <Icon name="bell" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error}
        </p>
      )}

      <Panel title="Which page" description="Pick a page, then where on it.">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {PAGES.map((p) => {
              const active = p.key === page;
              const count = (state.blocks[p.key] ?? []).length;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setPage(p.key);
                    setOpenId(null);
                  }}
                  className={cn(
                    "ax-focus inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all duration-300",
                    active
                      ? "border-transparent bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                      : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
                  )}
                >
                  {PAGE_LABELS[p.key]}
                  {count > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px] font-semibold",
                        active ? "bg-white/20 text-white" : "bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-accent-soft)]",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex rounded-full border border-[var(--ax-line)] p-0.5 self-start">
            {BLOCK_SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSlot(s);
                  setOpenId(null);
                }}
                className={cn(
                  "ax-focus rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all duration-300",
                  s === slot
                    ? "bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                    : "text-[var(--ax-ink-muted)] hover:text-[var(--ax-ink)]",
                )}
              >
                {SLOT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Panel
          title={`${PAGE_LABELS[page]} — ${SLOT_LABELS[slot].toLowerCase()}`}
          description={
            blocks.length === 0
              ? "Nothing here yet. Add a block below."
              : `${blocks.length} block${blocks.length === 1 ? "" : "s"} · ${totalOnPage} on the page`
          }
        >
          <div className="flex flex-col gap-3">
            {blocks.map((block, i) => (
              <BlockCard
                key={block.id}
                block={block}
                first={i === 0}
                last={i === blocks.length - 1}
                open={openId === block.id}
                onToggle={() => setOpenId(openId === block.id ? null : block.id)}
                onChange={(patch) => updateBlock(page, block.id, patch)}
                onRemove={() => {
                  removeBlock(page, block.id);
                  if (openId === block.id) setOpenId(null);
                }}
                onMove={(d) => moveBlock(page, block.id, d)}
                media={state.media}
                addMedia={addMedia}
              />
            ))}

            <div className="flex flex-col gap-2 rounded-xl border border-dashed border-[var(--ax-line-strong)] p-3.5">
              <span className="ax-eyebrow">Add a block</span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => add(type)}
                    className="ax-focus inline-flex items-center gap-2 rounded-full border border-[var(--ax-line)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]"
                  >
                    <Icon name={TYPE_ICONS[type]} className="size-3.5 text-[var(--ax-accent-soft)]" strokeWidth={2} />
                    {BLOCK_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Live preview" description="The real page. Scroll it to find your block.">
          <SitePreview key={path} defaultPath={path} height={620} />
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- one block ---------------- */

function BlockCard({
  block,
  first,
  last,
  open,
  onToggle,
  onChange,
  onRemove,
  onMove,
  media,
  addMedia,
}: {
  block: Block;
  first: boolean;
  last: boolean;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<Block>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  media: { id: string; name: string; src: string }[];
  addMedia: (item: Awaited<ReturnType<typeof fileToMedia>>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const chosen = block.mediaId ? media.find((m) => m.id === block.mediaId) : undefined;

  const summary =
    block.type === "image"
      ? chosen?.name ?? "No image chosen"
      : block.type === "video"
        ? block.url || "No video URL"
        : block.type === "stats"
          ? `${(block.items ?? []).filter((i) => i.value).length} figures`
          : (block.title || block.body || "Empty").slice(0, 60);
  const summaryLine = uploadError ? `Upload failed: ${uploadError}` : null;

  async function onFile(files: FileList | null) {
    const file = files?.[0];
    if (!file || !isSupported(file)) return;
    setBusy(true);
    setUploadError(null);
    try {
      const item = await fileToMedia(file);
      addMedia(item);
      onChange({ mediaId: item.id });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "That upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors duration-300",
        open ? "border-[var(--ax-accent)]/40 bg-[rgba(var(--ax-glow),0.05)]" : "border-[var(--ax-line)]",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={onToggle}
          className="ax-focus flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={open}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[rgba(var(--ax-glow),0.12)] text-[var(--ax-accent-soft)]">
            <Icon name={TYPE_ICONS[block.type]} className="size-4" strokeWidth={2} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[13px] font-semibold text-[var(--ax-ink)]">{BLOCK_LABELS[block.type]}</span>
            <span className="truncate text-[11.5px] text-[var(--ax-ink-dim)]">{summaryLine ?? summary}</span>
          </span>
        </button>

        <span className="flex shrink-0 items-center gap-1">
          <IconButton icon="chevron-down" label="Move down" disabled={last} onClick={() => onMove(1)} className="rotate-0" />
          <IconButton icon="chevron-down" label="Move up" disabled={first} onClick={() => onMove(-1)} className="rotate-180" />
          <IconButton icon="trash" label="Remove block" danger onClick={onRemove} />
          <IconButton
            icon="chevron-down"
            label={open ? "Collapse" : "Edit"}
            onClick={onToggle}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </span>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-[var(--ax-line)] p-3.5">
          {(block.type === "text" || block.type === "stats" || block.type === "image" || block.type === "video") && (
            <Field label={block.type === "text" ? "Heading" : block.type === "stats" ? "Eyebrow" : "Caption"}>
              <input
                className={INPUT}
                value={block.title ?? ""}
                onChange={(e) => onChange({ title: e.target.value })}
              />
            </Field>
          )}

          {(block.type === "text" || block.type === "quote") && (
            <Field label={block.type === "quote" ? "The quotation" : "Body"}>
              <textarea
                rows={block.type === "quote" ? 3 : 5}
                className={cn(INPUT, "resize-y")}
                value={block.body ?? ""}
                onChange={(e) => onChange({ body: e.target.value })}
              />
            </Field>
          )}

          {block.type === "quote" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Who said it">
                <input className={INPUT} value={block.author ?? ""} onChange={(e) => onChange({ author: e.target.value })} />
              </Field>
              <Field label="Their role">
                <input className={INPUT} value={block.role ?? ""} onChange={(e) => onChange({ role: e.target.value })} />
              </Field>
            </div>
          )}

          {block.type === "stats" && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(block.items ?? []).map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-[var(--ax-line)] p-2.5">
                  <input
                    className={cn(INPUT, "ax-display text-[18px]")}
                    placeholder="120+"
                    value={item.value}
                    aria-label={`Figure ${i + 1}`}
                    onChange={(e) =>
                      onChange({ items: (block.items ?? []).map((it, j) => (j === i ? { ...it, value: e.target.value } : it)) })
                    }
                  />
                  <input
                    className={INPUT}
                    placeholder="Label"
                    value={item.label}
                    aria-label={`Figure ${i + 1} label`}
                    onChange={(e) =>
                      onChange({ items: (block.items ?? []).map((it, j) => (j === i ? { ...it, label: e.target.value } : it)) })
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => onChange({ items: [...(block.items ?? []), { value: "", label: "" }] })}
                className="ax-focus grid min-h-[92px] place-items-center rounded-lg border border-dashed border-[var(--ax-line-strong)] text-[12px] text-[var(--ax-ink-dim)] transition-colors hover:text-[var(--ax-ink)]"
              >
                + Add a figure
              </button>
            </div>
          )}

          {block.type === "video" && (
            <Field label="Video URL" hint="YouTube, Vimeo, or a direct .mp4 link">
              <input
                className={cn(INPUT, "font-mono text-[12px]")}
                placeholder="https://youtu.be/…"
                value={block.url ?? ""}
                onChange={(e) => onChange({ url: e.target.value })}
              />
            </Field>
          )}

          {(block.type === "image" || block.type === "video") && (
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">
                {block.type === "image" ? "Image" : "Poster image (optional)"}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)]">
                  {chosen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={chosen.src} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-[10.5px] text-[var(--ax-ink-dim)]">None</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="ax-focus inline-flex items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] disabled:opacity-50"
                >
                  <Icon name={busy ? "clock" : "upload"} className="size-3.5" strokeWidth={2} />
                  {busy ? "Processing…" : "Upload"}
                </button>
                {media.length > 0 && (
                  <Select
                    label="Pick from library"
                    size="sm"
                    className="w-[200px]"
                    value={block.mediaId ?? ""}
                    onChange={(v) => onChange({ mediaId: v || undefined })}
                    options={[{ value: "", label: "— from library —" }, ...media.map((m) => ({ value: m.id, label: m.name }))]}
                  />
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files)} />
              </div>
            </div>
          )}

          {block.type === "image" && (
            <label className="flex items-center gap-3 rounded-lg border border-[var(--ax-line)] p-3">
              <Toggle
                size="sm"
                checked={block.framed ?? true}
                label="Show inside the laptop frame"
                onChange={(next) => onChange({ framed: next })}
              />
              <span className="text-[12px] text-[var(--ax-ink-muted)]">
                {block.framed ?? true ? "Inside the laptop frame" : "Full-width, no frame"}
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-2">
        <span className="text-[12px] font-medium text-[var(--ax-ink-muted)]">{label}</span>
        {hint && <span className="text-[11px] text-[var(--ax-ink-dim)]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function IconButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
  className,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors duration-200 disabled:opacity-30",
        danger ? "hover:bg-[var(--ax-danger)]/12 hover:text-[var(--ax-danger)]" : "hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]",
        className,
      )}
    >
      <Icon name={icon} className="size-4" strokeWidth={2} />
    </button>
  );
}
