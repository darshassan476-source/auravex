"use client";

import { useRef, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import { formatBytes } from "@/lib/cms";
import { fileToMedia, isMediaSupported, isSupported, uploadRaw, type UploadError } from "@/lib/imageUpload";
import { cn } from "@/lib/utils";

/**
 * Every image the portal has uploaded, straight from the server.
 *
 * Uploads land in `data/media` and are served from `/api/media/<id>`; the
 * same items are offered wherever the portal asks for a picture — page
 * backgrounds, product images, the logo, page-builder blocks.
 */
export function MediaLibrary() {
  const { state, ready, addMedia, removeMedia } = useCms();
  const [busy, setBusy] = useState(0);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalBytes = state.media.reduce((a, m) => a + m.size, 0);
  const used = new Set<string>();
  Object.values(state.backgrounds).forEach((c) => c?.kind === "media" && used.add(c.mediaId));
  Object.values(state.products).forEach((p) => p.imageId && used.add(p.imageId));
  Object.values(state.blocks).forEach((list) => list?.forEach((b) => b.mediaId && used.add(b.mediaId)));
  if (state.logoId) used.add(state.logoId);
  if (state.heroImageId) used.add(state.heroImageId);

  async function intake(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setErrors([]);
    setBusy((n) => n + list.length);
    for (const file of list) {
      const image = isSupported(file);
      if (!image && !isMediaSupported(file)) {
        setErrors((e) => [...e, { file: file.name, reason: "Only PNG, JPG, WebP, AVIF, GIF, SVG, MP4, MP3, WAV or M4A." }]);
        setBusy((n) => n - 1);
        continue;
      }
      try {
        addMedia(image ? await fileToMedia(file) : await uploadRaw(file));
      } catch (error) {
        setErrors((e) => [
          ...e,
          { file: file.name, reason: error instanceof Error ? error.message : "Upload failed." },
        ]);
      } finally {
        setBusy((n) => n - 1);
      }
    }
  }

  async function copyLink(src: string, id: string) {
    try {
      await navigator.clipboard.writeText(new URL(src, window.location.origin).toString());
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Files", value: String(state.media.length), icon: "image" },
          { label: "On disk", value: formatBytes(totalBytes), icon: "box" },
          { label: "In use on the site", value: String(used.size), icon: "check-circle" },
        ].map((stat) => (
          <div key={stat.label} className="ax-glass ax-edge-light flex items-center gap-4 rounded-2xl p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
              <Icon name={stat.icon} className="size-[18px]" strokeWidth={1.8} />
            </span>
            <span className="flex flex-col">
              <span className="ax-display text-[24px] text-[var(--ax-ink)]">{stat.value}</span>
              <span className="text-[12px] text-[var(--ax-ink-muted)]">{stat.label}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Dropzone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void intake(e.dataTransfer.files);
        }}
        className={cn(
          "ax-focus flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center transition-colors duration-300",
          dragging
            ? "border-[var(--ax-accent)] bg-[rgba(var(--ax-glow),0.10)]"
            : "border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.04)] hover:border-[var(--ax-accent)]/60",
        )}
      >
        <span className="grid size-12 place-items-center rounded-2xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)] text-[var(--ax-accent-soft)]">
          <Icon name="upload" className="size-5" strokeWidth={1.8} />
        </span>
        <span className="text-[14px] font-medium text-[var(--ax-ink)]">
          {busy > 0 ? `Uploading ${busy}…` : "Drop images here, or click to choose"}
        </span>
        <span className="max-w-sm text-[12px] leading-relaxed text-[var(--ax-ink-dim)]">
          Images up to 15 MB (large photos are downscaled to 2000px; logos keep their
          transparency), MP4 films and MP3/WAV music beds up to 120 MB.
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,audio/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void intake(e.target.files);
            e.target.value = "";
          }}
        />
      </button>

      {errors.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-xl border border-[var(--ax-danger)]/35 bg-[var(--ax-danger)]/10 px-4 py-3 text-[12px] text-[var(--ax-danger)]">
          {errors.map((e) => (
            <li key={e.file + e.reason}>
              <span className="font-medium">{e.file}</span> — {e.reason}
            </li>
          ))}
        </ul>
      )}

      <Panel title="All images" description={`${state.media.length} file${state.media.length === 1 ? "" : "s"}`}>
        {state.media.length === 0 ? (
          <p className="py-10 text-center text-[12.5px] text-[var(--ax-ink-dim)]">
            {ready ? "Nothing uploaded yet." : "Loading…"}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {state.media.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col gap-3 rounded-xl border border-[var(--ax-line)] p-3 transition-colors duration-500 hover:border-[var(--ax-line-strong)]"
              >
                <div className="relative overflow-hidden rounded-lg border border-[var(--ax-line)] bg-[var(--ax-bg)]">
                  {item.mime?.startsWith("video/") ? (
                    <video src={item.src} controls preload="metadata" className="aspect-[16/10] w-full bg-black object-cover" />
                  ) : item.mime?.startsWith("audio/") ? (
                    <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 bg-[rgba(var(--ax-glow),0.06)] px-3">
                      <Icon name="activity" className="size-6 text-[var(--ax-accent-soft)]" strokeWidth={1.8} />
                      <audio src={item.src} controls preload="metadata" className="w-full" />
                    </div>
                  ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={item.name}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  )}
                  {used.has(item.id) && (
                    <span className="absolute left-2 top-2 rounded-full border border-[var(--ax-success)]/40 bg-[var(--ax-bg)]/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ax-success)] backdrop-blur">
                      In use
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="truncate text-[12.5px] font-medium text-[var(--ax-ink)]" title={item.name}>
                    {item.name}
                  </span>
                  <div className="flex items-center justify-between text-[10.5px] text-[var(--ax-ink-dim)]">
                    <span className="font-mono">
                      {item.width && item.height ? `${item.width} × ${item.height}` : item.mime?.startsWith("audio/") ? "audio" : item.mime?.startsWith("video/") ? "video" : "vector"}
                    </span>
                    <span>{formatBytes(item.size)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-[var(--ax-line)] pt-2.5">
                  <span className="text-[10.5px] text-[var(--ax-ink-dim)]">
                    {new Date(item.addedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => copyLink(item.src, item.id)}
                      aria-label={`Copy link to ${item.name}`}
                      className="ax-focus grid size-7 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                    >
                      <Icon name={copied === item.id ? "check" : "link"} className="size-3.5" strokeWidth={1.9} />
                    </button>
                    {confirming === item.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          removeMedia(item.id);
                          setConfirming(null);
                        }}
                        className="ax-focus rounded-lg bg-[var(--ax-danger)]/14 px-2 text-[10.5px] font-semibold text-[var(--ax-danger)]"
                      >
                        Confirm
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming(item.id)}
                        aria-label={`Delete ${item.name}`}
                        className="ax-focus grid size-7 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[var(--ax-danger)]/12 hover:text-[var(--ax-danger)]"
                      >
                        <Icon name="trash" className="size-3.5" strokeWidth={1.9} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
