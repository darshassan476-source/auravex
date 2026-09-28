"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AX_EASE } from "../fx/Reveal";
import { Icon } from "../ui/Icon";
import { MockScreen } from "../ui/MockScreen";

const VARIANTS = ["dashboard", "map", "insights"] as const;

/**
 * Product gallery with a lightbox. Assets render through `MockScreen` until
 * real media is wired up — swapping in an <Image> here is the only change
 * needed once the storage layer exists.
 */
export function Gallery({ assets, accent }: { assets: MediaAsset[]; accent: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") setActive((i) => (i + 1) % assets.length);
      if (event.key === "ArrowLeft") setActive((i) => (i - 1 + assets.length) % assets.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, assets.length]);

  if (assets.length === 0) return null;

  const current = assets[active];

  return (
    <>
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label={`Expand ${current.alt}`}
          className="ax-focus group relative block w-full overflow-hidden rounded-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: AX_EASE }}
            >
              <MockScreen
                seed={current.id + current.src}
                accent={accent}
                label={current.alt}
                variant={VARIANTS[active % VARIANTS.length]}
              />
            </motion.div>
          </AnimatePresence>

          <span className="pointer-events-none absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-[var(--ax-line-strong)] bg-[var(--ax-bg)]/70 text-[var(--ax-ink)] opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            <Icon name="scan" className="size-4" strokeWidth={2} />
          </span>
        </button>

        <div className="flex flex-wrap gap-2.5">
          {assets.map((asset, i) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "ax-focus flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium transition-all duration-300",
                i === active
                  ? "border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.14)] text-[var(--ax-ink)]"
                  : "border-[var(--ax-line)] text-[var(--ax-ink-dim)] hover:text-[var(--ax-ink-muted)]",
              )}
            >
              <Icon
                name={asset.type === "video" ? "play" : "image"}
                className="size-3.5"
                strokeWidth={2}
              />
              {asset.alt}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-5"
          >
            <button
              type="button"
              aria-label="Close gallery"
              onClick={() => setLightbox(false)}
              className="absolute inset-0 cursor-default bg-[var(--ax-bg)]/90 backdrop-blur-lg"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.34, ease: AX_EASE }}
              className="relative w-full max-w-5xl"
            >
              <MockScreen
                seed={current.id + current.src}
                accent={accent}
                label={current.alt}
                variant={VARIANTS[active % VARIANTS.length]}
                className="ax-glow-lg"
              />

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-[13px] text-[var(--ax-ink-muted)]">
                  {current.caption ?? current.alt}
                </p>

                <div className="flex items-center gap-2">
                  <span className="mr-2 font-mono text-[11px] tabular-nums text-[var(--ax-ink-dim)]">
                    {String(active + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}
                  </span>
                  {(["chevron-left", "chevron-right"] as const).map((icon, i) => (
                    <button
                      key={icon}
                      type="button"
                      aria-label={i === 0 ? "Previous" : "Next"}
                      onClick={() =>
                        setActive((c) => (c + (i === 0 ? -1 : 1) + assets.length) % assets.length)
                      }
                      className="ax-glass ax-focus grid size-9 place-items-center rounded-full text-[var(--ax-ink)] transition-colors hover:border-[var(--ax-line-strong)]"
                    >
                      <Icon name={icon} className="size-4" strokeWidth={2.2} />
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setLightbox(false)}
                    className="ax-glass ax-focus grid size-9 place-items-center rounded-full text-[var(--ax-ink)] transition-colors hover:border-[var(--ax-line-strong)]"
                  >
                    <Icon name="x" className="size-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
