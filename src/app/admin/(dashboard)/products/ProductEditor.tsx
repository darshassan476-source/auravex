"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { Panel } from "@/components/admin/Primitives";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { PRODUCTS, STATUS_LABELS } from "@/data/products";
import type { Product } from "@/lib/types";
import { formatBytes, type MediaItem } from "@/lib/cms";
import { fileToMedia, isSupported, isVideo, uploadRaw } from "@/lib/imageUpload";
import type { ProductMetric, ProductStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES = Object.keys(STATUS_LABELS) as ProductStatus[];

/**
 * Quick edits for any product in the catalogue: copy, accent colour, status,
 * sector, the screens and film the product page shows, and whether the
 * product appears on the site at all.
 *
 * Only changed fields are stored, so "Revert" genuinely restores the
 * original record rather than a copy of it.
 */
export function ProductEditor() {
  const { state, error, setProduct, resetProduct } = useCms();
  const params = useSearchParams();
  const catalogue = useCatalogue({ includeHidden: true });
  const requested = params.get("slug");
  const [slug, setSlug] = useState(
    requested && catalogue.some((p) => p.slug === requested)
      ? requested
      : PRODUCTS[0].slug,
  );
  // The unedited record: bundled, or the portal's own saved copy.
  const sources: Product[] = [...PRODUCTS, ...state.customProducts];
  const base = sources.find((p) => p.slug === slug) ?? PRODUCTS[0];
  const patch = state.products[slug] ?? {};
  const edited = Object.values(patch).some((v) => v !== undefined);

  const value = {
    name: patch.name ?? base.name,
    tagline: patch.tagline ?? base.tagline,
    summary: patch.summary ?? base.summary,
    description: patch.description ?? base.description,
    accent: patch.accent ?? base.accent,
    status: (patch.status as ProductStatus) ?? base.status,
    hidden: patch.hidden ?? false,
    metrics: patch.metrics ?? base.metrics,
    links: patch.links ? { ...base.links, ...patch.links } : base.links,
    demoNote: patch.demoNote ?? base.demoNote ?? "",
    sector: patch.sector ?? base.sector ?? "",
  };

  function setMetric(i: number, field: keyof ProductMetric, v: string) {
    const next = value.metrics.map((m, idx) =>
      idx === i ? { ...m, [field]: v } : m,
    );
    setProduct(slug, { metrics: next });
  }

  const inputClass =
    "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
    "px-3.5 py-2.5 text-[13.5px] text-[var(--ax-ink)] outline-none transition-colors duration-300 " +
    "placeholder:text-[var(--ax-ink-dim)] focus:border-[var(--ax-line-strong)]";

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 px-4 py-3 text-[12.5px] text-[var(--ax-warning)]">
          <Icon
            name="bell"
            className="mt-0.5 size-4 shrink-0"
            strokeWidth={2}
          />
          {error}
        </p>
      )}

      <Panel
        title="Products"
        description="Pick a product to edit. Changes show on the public site immediately."
      >
        <div className="flex flex-wrap gap-2">
          {sources.map((p) => {
            const active = p.slug === slug;
            const changed = Boolean(state.products[p.slug]);
            const hidden = state.products[p.slug]?.hidden;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => setSlug(p.slug)}
                className={cn(
                  "ax-focus inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all duration-300",
                  active
                    ? "border-transparent bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                    : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
                  hidden && !active && "opacity-50",
                )}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    background: state.products[p.slug]?.accent ?? p.accent,
                  }}
                />
                {state.products[p.slug]?.name ?? p.name}
                {changed && (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      active ? "bg-white/80" : "bg-[var(--ax-accent)]",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title={`Editing — ${base.name}`}
          description={
            edited
              ? "This product has unsaved-to-backend local edits."
              : "Showing the built-in record."
          }
          action={
            edited ? (
              <button
                type="button"
                onClick={() => resetProduct(slug)}
                className="ax-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
              >
                <Icon name="x" className="size-3.5" strokeWidth={2.4} />
                Revert all
              </button>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <input
                className={inputClass}
                value={value.name}
                onChange={(e) => setProduct(slug, { name: e.target.value })}
              />
            </Field>

            <Field label="Tagline" hint="The headline on the product page">
              <input
                className={inputClass}
                value={value.tagline}
                onChange={(e) => setProduct(slug, { tagline: e.target.value })}
              />
            </Field>

            <Field
              label="Card summary"
              hint="One line, shown on cards and in search"
            >
              <textarea
                rows={2}
                className={cn(inputClass, "resize-y")}
                value={value.summary}
                onChange={(e) => setProduct(slug, { summary: e.target.value })}
              />
            </Field>

            <Field
              label="Full description"
              hint="The paragraph under the product headline"
            >
              <textarea
                rows={4}
                className={cn(inputClass, "resize-y")}
                value={value.description}
                onChange={(e) =>
                  setProduct(slug, { description: e.target.value })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Live demo address"
                hint="Where visitors can try it themselves; shown as “Try it live”"
              >
                <input
                  className={inputClass}
                  placeholder="https://demo.example.com"
                  value={value.links?.demo ?? ""}
                  onChange={(e) =>
                    setProduct(slug, {
                      links: {
                        ...(value.links ?? {}),
                        demo: e.target.value.trim() || undefined,
                      },
                    })
                  }
                />
              </Field>
              <Field
                label="Demo sign-in note"
                hint="Optional line under the button, e.g. the demo account"
              >
                <input
                  className={inputClass}
                  placeholder="Sign in with demo@example.com / demo"
                  value={value.demoNote ?? ""}
                  onChange={(e) =>
                    setProduct(slug, { demoNote: e.target.value })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Accent colour"
                hint="Drives this product's icons and charts"
              >
                <div className="flex items-center gap-3">
                  <label
                    className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-[var(--ax-line-strong)]"
                    style={{ background: value.accent }}
                  >
                    <input
                      type="color"
                      value={value.accent}
                      onChange={(e) =>
                        setProduct(slug, { accent: e.target.value })
                      }
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                      aria-label="Accent colour"
                    />
                  </label>
                  <input
                    className={cn(inputClass, "font-mono")}
                    value={value.accent}
                    onChange={(e) =>
                      setProduct(slug, { accent: e.target.value })
                    }
                  />
                </div>
              </Field>

              <Field label="Status">
                <Select
                  label="Product status"
                  value={value.status}
                  onChange={(v) => setProduct(slug, { status: v })}
                  options={STATUSES.map((st) => ({
                    value: st,
                    label: STATUS_LABELS[st],
                  }))}
                />
              </Field>
            </div>

            <Field label="Sector" hint="The industry it serves, shown with the product">
              <input
                className={inputClass}
                placeholder="Real estate"
                value={value.sector}
                onChange={(e) => setProduct(slug, { sector: e.target.value })}
              />
            </Field>

            <label className="flex items-center gap-3 rounded-xl border border-[var(--ax-line)] p-3.5">
              <Toggle
                checked={!value.hidden}
                label={value.hidden ? "Show on the site" : "Hide from the site"}
                onChange={(next) => setProduct(slug, { hidden: !next })}
              />
              <span className="flex flex-col">
                <span className="text-[13px] font-semibold text-[var(--ax-ink)]">
                  {value.hidden
                    ? "Hidden from the site"
                    : "Visible on the site"}
                </span>
                <span className="text-[11.5px] text-[var(--ax-ink-dim)]">
                  Hidden products disappear from listings and the nav menu.
                </span>
              </span>
            </label>
          </div>
        </Panel>

        <ScreensPanel slug={slug} accent={value.accent} />
      </div>

      <FilmPanel slug={slug} />

      <Panel
        title="Headline figures"
        description="The four figures under the product hero. They ship as illustrative placeholders; put the real ones here."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {value.metrics.map((metric, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-[var(--ax-line)] p-3"
            >
              <input
                className={cn(inputClass, "ax-display text-[20px]")}
                value={metric.value}
                onChange={(e) => setMetric(i, "value", e.target.value)}
                placeholder="AED 50B+"
                aria-label={`Figure ${i + 1}`}
              />
              <input
                className={inputClass}
                value={metric.label}
                onChange={(e) => setMetric(i, "label", e.target.value)}
                placeholder="Total Assets Managed"
                aria-label={`Figure ${i + 1} label`}
              />
              <input
                className={cn(inputClass, "font-mono text-[12px]")}
                value={metric.delta ?? ""}
                onChange={(e) => setMetric(i, "delta", e.target.value)}
                placeholder="+3% (optional)"
                aria-label={`Figure ${i + 1} change`}
              />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-baseline gap-2">
        <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-[var(--ax-ink-dim)]">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}

/**
 * Every screen on one product.
 *
 * The first one fills the laptop on the product page and the card in the
 * catalogue; the rest are offered under the device for a visitor to flick
 * through. Images can come from the machine or from anything already in the
 * library, so an older upload can be put back on a product at any time.
 */
function ScreensPanel({ slug, accent }: { slug: string; accent: string }) {
  const { state, setProduct, addMedia } = useCms();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const patch = state.products[slug] ?? {};
  // A product edited before galleries existed carries a single id; it is the
  // first screen, and writing the list back keeps both fields in step.
  const ids = patch.imageIds?.length
    ? patch.imageIds
    : patch.imageId
      ? [patch.imageId]
      : [];
  const shots = ids
    .map((id) => state.media.find((m) => m.id === id))
    .filter((m): m is MediaItem => Boolean(m));

  const write = (next: string[]) =>
    setProduct(slug, { imageIds: next, imageId: next[0] });

  const add = (id: string) =>
    ids.includes(id) ? write(ids.filter((x) => x !== id)) : write([...ids, id]);
  const remove = (id: string) => write(ids.filter((x) => x !== id));
  const makeFirst = (id: string) => write([id, ...ids.filter((x) => x !== id)]);
  const move = (id: string, by: -1 | 1) => {
    const i = ids.indexOf(id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    write(next);
  };

  async function onFiles(files: FileList | null) {
    const chosen = Array.from(files ?? []);
    if (!chosen.length) return;
    setBusy(true);
    setProblem(null);
    const added: string[] = [];
    for (const file of chosen) {
      if (!isSupported(file)) {
        setProblem(`${file.name} is not an image file.`);
        continue;
      }
      try {
        const item = await fileToMedia(file);
        addMedia(item);
        added.push(item.id);
      } catch (e) {
        setProblem(
          e instanceof Error
            ? e.message
            : `${file.name} could not be uploaded.`,
        );
      }
    }
    if (added.length) write([...ids, ...added]);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Panel
      title="Product screens"
      description="What the laptop shows on the product page, and the card in the catalogue."
    >
      <div className="flex flex-col gap-4">
        <p className="text-[12px] leading-relaxed text-[var(--ax-ink-muted)]">
          Add as many screens as you like — the first one fills the laptop and
          the card, and the rest appear under it for visitors to flick through.
          Upload new pictures or pick any you have uploaded before. With none
          here, a generated interface is shown instead.
        </p>

        {problem && (
          <p className="rounded-xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 px-3.5 py-2.5 text-[12px] text-[var(--ax-warning)]">
            {problem}
          </p>
        )}

        {shots.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {shots.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--ax-line)] p-2"
              >
                <span className="relative shrink-0 overflow-hidden rounded-lg border border-[var(--ax-line)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.src}
                    alt=""
                    className="h-12 w-[76px] object-cover"
                  />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[12.5px] font-medium text-[var(--ax-ink)]">
                    {m.name}
                  </span>
                  <span className="text-[11px] text-[var(--ax-ink-dim)]">
                    {i === 0 ? "On the laptop and the card" : `Screen ${i + 1}`}{" "}
                    · {formatBytes(m.size)}
                  </span>
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-1">
                  <IconButton
                    label="Move up"
                    icon="chevron-up"
                    onClick={() => move(m.id, -1)}
                    disabled={i === 0}
                  />
                  <IconButton
                    label="Move down"
                    icon="chevron-down"
                    onClick={() => move(m.id, 1)}
                    disabled={i === shots.length - 1}
                  />
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeFirst(m.id)}
                      className="ax-focus rounded-lg px-2 py-1.5 text-[11.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                    >
                      Make first
                    </button>
                  )}
                  <IconButton
                    label="Remove from this product"
                    icon="x"
                    onClick={() => remove(m.id)}
                  />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="grid aspect-[16/10] w-full max-w-[320px] place-items-center rounded-xl border border-[var(--ax-line)] text-[12px] text-[var(--ax-ink-dim)]"
            style={{
              background: `linear-gradient(140deg, ${accent}33, transparent 70%)`,
            }}
          >
            Generated interface
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="ax-focus inline-flex items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] disabled:opacity-50"
          >
            <Icon
              name={busy ? "clock" : "upload"}
              className="size-3.5"
              strokeWidth={2}
            />
            {busy ? "Processing…" : "Upload images"}
          </button>
          {shots.length > 0 && (
            <button
              type="button"
              onClick={() => write([])}
              className="ax-focus inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
            >
              <Icon name="x" className="size-3.5" strokeWidth={2.4} />
              Use the generated interface
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />

        {state.media.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="ax-eyebrow">
              Your library — tap to add or remove
            </span>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {state.media
                .filter((m) => !m.mime || m.mime.startsWith("image/"))
                .map((m) => {
                  const on = ids.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => add(m.id)}
                      title={`${m.name} · ${formatBytes(m.size)}`}
                      aria-pressed={on}
                      className={cn(
                        "ax-focus relative overflow-hidden rounded-lg border transition-all duration-300",
                        on
                          ? "border-[var(--ax-accent)] ax-glow-sm"
                          : "border-[var(--ax-line)] hover:border-[var(--ax-line-strong)]",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.src}
                        alt=""
                        className="aspect-[4/3] w-full object-cover"
                      />
                      {on && (
                        <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-[var(--ax-accent)] text-white">
                          <Icon
                            name="check"
                            className="size-2.5"
                            strokeWidth={3}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

/**
 * The film on the product page: an MP4 uploaded here or picked from the
 * library, with an optional poster frame. The same slot a film made in AI
 * Studio fills, so either can replace the other.
 */
function FilmPanel({ slug }: { slug: string }) {
  const { state, setProduct, addMedia } = useCms();
  const videoRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [posterBusy, setPosterBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const patch = state.products[slug] ?? {};
  const videos = state.media.filter((m) => m.mime?.startsWith("video/"));
  const images = state.media.filter((m) => !m.mime || m.mime.startsWith("image/"));
  const video = patch.videoId ? state.media.find((m) => m.id === patch.videoId) : undefined;
  const poster = patch.posterId ? state.media.find((m) => m.id === patch.posterId) : undefined;

  async function onVideo(files: FileList | null) {
    const file = files?.[0];
    if (videoRef.current) videoRef.current.value = "";
    if (!file) return;
    if (!isVideo(file)) {
      setProblem(`${file.name} is not an MP4 video.`);
      return;
    }
    setProblem(null);
    setProgress(0);
    try {
      const item = await uploadRaw(file, setProgress);
      addMedia(item);
      setProduct(slug, { videoId: item.id });
    } catch (e) {
      setProblem(e instanceof Error ? e.message : `${file.name} could not be uploaded.`);
    } finally {
      setProgress(null);
    }
  }

  async function onPoster(files: FileList | null) {
    const file = files?.[0];
    if (posterRef.current) posterRef.current.value = "";
    if (!file) return;
    if (!isSupported(file)) {
      setProblem(`${file.name} is not an image file.`);
      return;
    }
    setProblem(null);
    setPosterBusy(true);
    try {
      const item = await fileToMedia(file);
      addMedia(item);
      setProduct(slug, { posterId: item.id });
    } catch (e) {
      setProblem(e instanceof Error ? e.message : `${file.name} could not be uploaded.`);
    } finally {
      setPosterBusy(false);
    }
  }

  const button =
    "ax-focus inline-flex items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] disabled:opacity-50";

  return (
    <Panel
      title="Product video"
      description="A film on the product page. Upload an MP4 (up to 120 MB) or pick one you have uploaded before."
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-3">
          {video ? (
            <video
              key={video.id}
              src={video.src}
              poster={poster?.src}
              controls
              preload="metadata"
              className="aspect-video w-full rounded-xl border border-[var(--ax-line)] bg-black object-contain"
            />
          ) : (
            <div className="grid aspect-video w-full place-items-center rounded-xl border border-dashed border-[var(--ax-line-strong)] text-[12.5px] text-[var(--ax-ink-dim)]">
              No video on this product yet
            </div>
          )}
          {video && (
            <span className="text-[11.5px] text-[var(--ax-ink-dim)]">
              {video.name} · {formatBytes(video.size)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {problem && (
            <p className="rounded-xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 px-3.5 py-2.5 text-[12px] text-[var(--ax-warning)]">
              {problem}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => videoRef.current?.click()} disabled={progress !== null} className={button}>
              <Icon name={progress !== null ? "clock" : "upload"} className="size-3.5" strokeWidth={2} />
              {progress !== null ? `Uploading… ${Math.round(progress * 100)}%` : video ? "Replace video" : "Upload a video"}
            </button>
            {video && (
              <button
                type="button"
                onClick={() => setProduct(slug, { videoId: undefined, posterId: undefined })}
                className="ax-focus inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
              >
                <Icon name="x" className="size-3.5" strokeWidth={2.4} />
                Remove video
              </button>
            )}
          </div>
          <input ref={videoRef} type="file" accept="video/mp4" hidden onChange={(e) => onVideo(e.target.files)} />

          {videos.length > 0 && (
            <Field label="Or pick a video you uploaded">
              <Select
                label="Video from the library"
                value={patch.videoId ?? ""}
                onChange={(v) => setProduct(slug, { videoId: v || undefined })}
                options={[{ value: "", label: "— none —" }, ...videos.map((m) => ({ value: m.id, label: m.name }))]}
              />
            </Field>
          )}

          {video && (
            <div className="flex flex-col gap-2">
              <span className="text-[12.5px] font-medium text-[var(--ax-ink-muted)]">
                Poster image{" "}
                <span className="text-[11px] text-[var(--ax-ink-dim)]">— shown before it plays (optional)</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => posterRef.current?.click()} disabled={posterBusy} className={button}>
                  <Icon name={posterBusy ? "clock" : "upload"} className="size-3.5" strokeWidth={2} />
                  {posterBusy ? "Processing…" : "Upload a poster"}
                </button>
                {images.length > 0 && (
                  <Select
                    label="Poster from the library"
                    size="sm"
                    className="w-[200px]"
                    value={patch.posterId ?? ""}
                    onChange={(v) => setProduct(slug, { posterId: v || undefined })}
                    options={[{ value: "", label: "— no poster —" }, ...images.map((m) => ({ value: m.id, label: m.name }))]}
                  />
                )}
              </div>
              <input ref={posterRef} type="file" accept="image/*" hidden onChange={(e) => onPoster(e.target.files)} />
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function IconButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: IconName;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="ax-focus grid size-7 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)] disabled:opacity-30"
    >
      <Icon name={icon} className="size-3.5" strokeWidth={2.2} />
    </button>
  );
}
