"use client";

import { useCms } from "@/cms/CmsProvider";
import { Reveal } from "@/components/fx/Reveal";
import { LaptopFrame } from "@/components/showcase/LaptopFrame";
import { Icon } from "@/components/ui/Icon";
import type { Block, BlockSlot as Slot, PageKey } from "@/lib/cms";

/**
 * A drop point for page-builder blocks.
 *
 * Every public page has two: one under its hero and one above its closing
 * call to action. Whatever the portal has placed there renders here, in the
 * order it was arranged. Empty slots render nothing at all — no placeholder,
 * no spacing — so a page with no blocks is exactly the page it was before.
 */
export function BlockSlot({ page, slot }: { page: PageKey; slot: Slot }) {
  const { state, ready } = useCms();
  if (!ready) return null;

  const blocks = (state.blocks[page] ?? []).filter((b) => b.slot === slot);
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </>
  );
}

/** Turns a watch/share URL into something an iframe will accept. */
function embedUrl(url: string): { kind: "iframe" | "video"; src: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i.exec(trimmed);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };

  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/i.exec(trimmed);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(trimmed)) return { kind: "video", src: trimmed };

  // Anything else is trusted as an embeddable page.
  return { kind: "iframe", src: trimmed };
}

function BlockView({ block }: { block: Block }) {
  const { state } = useCms();
  const media = block.mediaId ? state.media.find((m) => m.id === block.mediaId) : undefined;

  if (block.type === "image") {
    if (!media) return null;
    return (
      <section className="relative py-10 md:py-14">
        <div className="ax-container">
          <Reveal direction="scale">
            {block.framed ? (
              <div className="mx-auto max-w-[900px]">
                <LaptopFrame>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={media.src} alt={block.title ?? ""} className="aspect-[16/10] w-full object-cover" />
                </LaptopFrame>
              </div>
            ) : (
              <figure className="overflow-hidden rounded-[24px] border border-[var(--ax-line)] ax-glow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={media.src} alt={block.title ?? ""} className="w-full object-cover" />
              </figure>
            )}
            {block.title && (
              <p className="mt-4 text-center text-[13px] text-[var(--ax-ink-dim)]">{block.title}</p>
            )}
          </Reveal>
        </div>
      </section>
    );
  }

  if (block.type === "text") {
    if (!block.title && !block.body) return null;
    return (
      <section className="relative py-10 md:py-14">
        <div className="ax-container">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              {block.title && (
                <h2 className="ax-display ax-text-balance text-[clamp(1.8rem,3.4vw,2.6rem)]">
                  {block.title}
                </h2>
              )}
              {block.body && (
                <p className="ax-text-pretty whitespace-pre-line text-[15.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                  {block.body}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  if (block.type === "stats") {
    const items = (block.items ?? []).filter((i) => i.value.trim() || i.label.trim());
    if (items.length === 0) return null;
    return (
      <section className="relative py-10 md:py-14">
        <div className="ax-container">
          <Reveal direction="scale">
            <div className="ax-glass ax-edge-light rounded-2xl px-7 py-8">
              {block.title && <p className="ax-eyebrow mb-6">{block.title}</p>}
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, i) => (
                  <div key={`${item.label}-${i}`} className="flex flex-col gap-1.5">
                    <span className="ax-display ax-gradient-text text-[clamp(2rem,3.6vw,2.8rem)]">
                      {item.value}
                    </span>
                    <span className="text-[13px] font-medium text-[var(--ax-ink-muted)]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  if (block.type === "quote") {
    if (!block.body) return null;
    return (
      <section className="relative py-10 md:py-14">
        <div className="ax-container">
          <Reveal direction="scale">
            <figure className="ax-glass-strong ax-edge-light mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[28px] px-8 py-12 text-center md:px-16">
              <span className="grid size-11 place-items-center rounded-full border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.12)] text-[var(--ax-accent-soft)]">
                <Icon name="message" className="size-5" strokeWidth={1.7} />
              </span>
              <blockquote className="ax-display ax-text-balance text-[clamp(1.25rem,2.6vw,2rem)] leading-snug text-[var(--ax-ink)]">
                &ldquo;{block.body}&rdquo;
              </blockquote>
              {(block.author || block.role) && (
                <figcaption className="flex flex-col gap-0.5">
                  {block.author && (
                    <span className="text-[13.5px] font-semibold text-[var(--ax-ink)]">
                      {block.author}
                    </span>
                  )}
                  {block.role && (
                    <span className="text-[12px] text-[var(--ax-ink-dim)]">{block.role}</span>
                  )}
                </figcaption>
              )}
            </figure>
          </Reveal>
        </div>
      </section>
    );
  }

  if (block.type === "video") {
    const embed = block.url ? embedUrl(block.url) : null;
    if (!embed) return null;
    return (
      <section className="relative py-10 md:py-14">
        <div className="ax-container">
          <Reveal direction="scale">
            <div className="mx-auto max-w-[1000px] overflow-hidden rounded-[24px] border border-[var(--ax-line-strong)] bg-black ax-glow-md">
              <div className="relative aspect-video">
                {embed.kind === "iframe" ? (
                  <iframe
                    src={embed.src}
                    title={block.title ?? "Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                  />
                ) : (
                  <video
                    src={embed.src}
                    poster={media?.src}
                    controls
                    playsInline
                    className="absolute inset-0 size-full"
                  />
                )}
              </div>
            </div>
            {block.title && (
              <p className="mt-4 text-center text-[13px] text-[var(--ax-ink-dim)]">{block.title}</p>
            )}
          </Reveal>
        </div>
      </section>
    );
  }

  return null;
}
