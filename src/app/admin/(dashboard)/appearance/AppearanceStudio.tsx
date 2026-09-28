"use client";

import { useRef, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Panel } from "@/components/admin/Primitives";
import { SitePreview } from "@/components/admin/SitePreview";
import { Icon } from "@/components/ui/Icon";
import { HERO_BACKGROUNDS } from "@/data/backgrounds";
import {
  PAGE_KEYS,
  PAGE_LABELS,
  cmsSize,
  formatBytes,
  type PageKey,
} from "@/lib/cms";
import { fileToMedia, isSupported } from "@/lib/imageUpload";
import { cn } from "@/lib/utils";
import { useTheme } from "@/themes/ThemeProvider";

const PLATES = Object.values(HERO_BACKGROUNDS);

/**
 * One screen for everything visual: which photograph each page sits on, and
 * the six colours the whole system is built from. Both write straight through
 * to the live site — there is no publish step to forget.
 */
export function AppearanceStudio() {
  const {
    state,
    error,
    setBackground,
    setLogo,
    setHeroImage,
    addMedia,
    removeMedia,
  } = useCms();
  const { theme } = useTheme();
  const [page, setPage] = useState<PageKey>("home");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);

  const current = state.backgrounds[page] ?? null;
  const modePlates = PLATES.filter((p) => p.mode === theme.mode);
  const otherPlates = PLATES.filter((p) => p.mode !== theme.mode);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setNotice(null);
    try {
      for (const file of Array.from(files)) {
        if (!isSupported(file)) {
          setNotice(`${file.name} is not an image file.`);
          continue;
        }
        const item = await fileToMedia(file);
        addMedia(item);
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "That upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onLogo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!isSupported(file)) {
      setNotice(`${file.name} is not an image file.`);
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const item = await fileToMedia(file);
      addMedia(item);
      setLogo(item.id);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "That upload failed.");
    } finally {
      setBusy(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  }

  async function onHeroImage(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!isSupported(file)) {
      setNotice(`${file.name} is not an image file.`);
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const item = await fileToMedia(file);
      addMedia(item);
      setHeroImage(item.id);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "That upload failed.");
    } finally {
      setBusy(false);
      if (heroRef.current) heroRef.current.value = "";
    }
  }

  const logo = state.logoId
    ? state.media.find((m) => m.id === state.logoId)
    : undefined;
  const heroImage = state.heroImageId
    ? state.media.find((m) => m.id === state.heroImageId)
    : undefined;

  return (
    <div className="flex flex-col gap-5">
      {(error || notice) && (
        <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 px-4 py-3 text-[12.5px] text-[var(--ax-warning)]">
          <Icon name="bell" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error ?? notice}
        </p>
      )}

      {/* ============ Live preview ============ */}
      <Panel
        title="Live preview"
        description="The public site as it stands right now. Everything below changes it."
      >
        <SitePreview height={540} />
      </Panel>

      {/* ============ Brand mark ============ */}
      <Panel
        title="Logo"
        description="Shown in the header, the footer, the mobile menu and this portal."
      >
        <div className="flex flex-wrap items-center gap-5">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)] p-2">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo.src} alt="" className="size-full object-contain" />
            ) : (
              <span className="grid size-12 place-items-center rounded-xl bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[18px] font-bold text-white">
                A
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-[13px] font-semibold text-[var(--ax-ink)]">
              {logo ? logo.name : "Built-in mark"}
            </span>
            <span className="text-[11.5px] leading-relaxed text-[var(--ax-ink-dim)]">
              A square PNG with a transparent background works best. The company name
              beside it is edited under Site Content.
            </span>
            <div className="mt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                disabled={busy}
                className="ax-focus inline-flex items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] disabled:opacity-50"
              >
                <Icon name={busy ? "clock" : "upload"} className="size-3.5" strokeWidth={2} />
                {busy ? "Processing…" : "Upload a logo"}
              </button>
              {logo && (
                <button
                  type="button"
                  onClick={() => setLogo(null)}
                  className="ax-focus inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                >
                  <Icon name="x" className="size-3.5" strokeWidth={2.4} />
                  Use the built-in mark
                </button>
              )}
            </div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onLogo(e.target.files)}
            />
          </div>
        </div>
      </Panel>

      {/* ============ Home hero screen ============ */}
      <Panel
        title="Home hero screen"
        description="What shows on the laptop screen in the homepage hero. Uploads always render inside the device."
      >
        <div className="flex flex-wrap items-center gap-5">
          <div className="w-52 shrink-0 overflow-hidden rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)]">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage.src} alt="" className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="grid aspect-[16/10] w-full place-items-center text-[11.5px] text-[var(--ax-ink-dim)]">
                Built-in portfolio map
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-[13px] font-semibold text-[var(--ax-ink)]">
              {heroImage ? heroImage.name : "Using the built-in screen"}
            </span>
            <span className="text-[11.5px] leading-relaxed text-[var(--ax-ink-dim)]">
              A 16:10 screenshot fits the screen exactly. It is drawn inside the bezel, under
              the glass, so it keeps the reflection and the tilt.
            </span>
            <div className="mt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => heroRef.current?.click()}
                disabled={busy}
                className="ax-focus inline-flex items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] disabled:opacity-50"
              >
                <Icon name={busy ? "clock" : "upload"} className="size-3.5" strokeWidth={2} />
                {busy ? "Processing…" : "Upload a screen"}
              </button>
              {heroImage && (
                <button
                  type="button"
                  onClick={() => setHeroImage(null)}
                  className="ax-focus inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                >
                  <Icon name="x" className="size-3.5" strokeWidth={2.4} />
                  Use the built-in screen
                </button>
              )}
            </div>
            <input
              ref={heroRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onHeroImage(e.target.files)}
            />

            {state.media.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                <span className="ax-eyebrow">Or pick from your library</span>
                <div className="flex flex-wrap gap-2">
                  {state.media.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setHeroImage(m.id)}
                      title={m.name}
                      className={cn(
                        "ax-focus h-12 w-16 overflow-hidden rounded-md border transition-all duration-300",
                        state.heroImageId === m.id
                          ? "border-[var(--ax-accent)] ax-glow-sm"
                          : "border-[var(--ax-line)] hover:border-[var(--ax-line-strong)]",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.src} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* ============ Backgrounds ============ */}
      <Panel
        title="Page backgrounds"
        description="Pick the photograph behind each page's hero, or upload your own."
        action={
          <span className="font-mono text-[11px] text-[var(--ax-ink-dim)]">
            {formatBytes(cmsSize(state))} stored
          </span>
        }
      >
        <div className="flex flex-col gap-6">
          {/* Page selector */}
          <div className="flex flex-wrap gap-2">
            {PAGE_KEYS.map((key) => {
              const active = key === page;
              const customised = Boolean(state.backgrounds[key]);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPage(key)}
                  className={cn(
                    "ax-focus inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all duration-300",
                    active
                      ? "border-transparent bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                      : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
                  )}
                >
                  {PAGE_LABELS[key]}
                  {customised && (
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        active ? "bg-white/80" : "bg-[var(--ax-accent)]",
                      )}
                      title="Customised"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-4 border-y border-[var(--ax-line)] py-3">
            <p className="text-[12.5px] text-[var(--ax-ink-muted)]">
              Background for <strong className="text-[var(--ax-ink)]">{PAGE_LABELS[page]}</strong>
              {current ? "" : " — using the built-in plate"}
            </p>
            {current && (
              <button
                type="button"
                onClick={() => setBackground(page, null)}
                className="ax-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
              >
                <Icon name="x" className="size-3.5" strokeWidth={2.4} />
                Reset to default
              </button>
            )}
          </div>

          {/* Built-in plates, current theme mode first */}
          <div className="flex flex-col gap-3">
            <span className="ax-eyebrow">Built in · {theme.mode}</span>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {modePlates.map((plate) => (
                <PlateCard
                  key={plate.id}
                  id={plate.id}
                  label={plate.label}
                  src={plate.src}
                  selected={current?.kind === "plate" && current.id === plate.id}
                  onSelect={() => setBackground(page, { kind: "plate", id: plate.id })}
                />
              ))}
            </div>
          </div>

          {otherPlates.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="ax-eyebrow">
                Built in · {otherPlates[0].mode} — shown when that theme is active
              </span>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {otherPlates.map((plate) => (
                  <PlateCard
                    key={plate.id}
                    id={plate.id}
                    label={plate.label}
                    src={plate.src}
                    selected={current?.kind === "plate" && current.id === plate.id}
                    onSelect={() => setBackground(page, { kind: "plate", id: plate.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Uploads */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span className="ax-eyebrow">Your images</span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="ax-focus inline-flex items-center gap-2 rounded-full border border-[var(--ax-line-strong)] px-3.5 py-2 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] disabled:opacity-50"
              >
                <Icon name={busy ? "clock" : "upload"} className="size-3.5" strokeWidth={2} />
                {busy ? "Processing…" : "Upload image"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>

            {state.media.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--ax-line-strong)] px-4 py-8 text-center text-[12.5px] text-[var(--ax-ink-dim)]">
                No uploads yet. Anything you add here can be used as a page background
                or as a product image.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {state.media.map((item) => (
                  <PlateCard
                    key={item.id}
                    id={item.id}
                    label={`${item.name} · ${formatBytes(item.size)}`}
                    src={item.src}
                    selected={current?.kind === "media" && current.mediaId === item.id}
                    onSelect={() => setBackground(page, { kind: "media", mediaId: item.id })}
                    onDelete={() => removeMedia(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Panel>

    </div>
  );
}

/* ---------------- pieces ---------------- */

function PlateCard({
  id,
  label,
  src,
  selected,
  onSelect,
  onDelete,
}: {
  id: string;
  label: string;
  src: string;
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "ax-focus block w-full overflow-hidden rounded-xl border text-left transition-all duration-300",
          selected
            ? "border-[var(--ax-accent)] ax-glow-sm"
            : "border-[var(--ax-line)] hover:border-[var(--ax-line-strong)]",
        )}
      >
        {/* A plain img: sources are a mix of /public paths and data URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="aspect-[16/10] w-full object-cover"
          loading="lazy"
        />
        <span className="flex items-center gap-1.5 px-2.5 py-2">
          {selected && (
            <Icon
              name="check-circle"
              className="size-3.5 shrink-0 text-[var(--ax-accent)]"
              strokeWidth={2.2}
            />
          )}
          <span className="truncate text-[11px] text-[var(--ax-ink-muted)]" title={label}>
            {label}
          </span>
        </span>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${label}`}
          className="ax-focus absolute right-2 top-2 grid size-7 place-items-center rounded-lg border border-[var(--ax-line-strong)] bg-[var(--ax-bg)]/80 text-[var(--ax-ink-muted)] opacity-0 backdrop-blur transition-all duration-300 hover:text-[var(--ax-danger)] group-hover:opacity-100"
        >
          <Icon name="trash" className="size-3.5" strokeWidth={2} />
        </button>
      )}
      <span className="sr-only">{id}</span>
    </div>
  );
}


