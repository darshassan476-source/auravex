"use client";

import Image from "next/image";
import { usePageBackground, useCms } from "@/cms/CmsProvider";
import {
  HERO_BACKGROUNDS,
  resolveBackground,
  type BackgroundId,
} from "@/data/backgrounds";
import type { PageKey } from "@/lib/cms";
import { useTheme } from "@/themes/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * The environment layer behind a hero.
 *
 * Renders a photographic interior plate from /public/backgrounds, chosen for
 * the active theme, under the scrims that keep headline copy legible. Pass
 * `page` and the admin portal can replace it — with another registry plate or
 * an uploaded image — for that page alone.
 *
 * It draws no grid, no particles and no geometry, and never affects the layout
 * of what sits on top of it.
 */
export function HeroBackdrop({
  background,
  page,
  image,
  scrim = "left",
  priority = true,
  className,
}: {
  /** Plate id from the registry. Falls back per theme when omitted. */
  background?: BackgroundId;
  /** Which page this is, so the admin override can find it. */
  page?: PageKey;
  /** Absolute override — any path under /public. Wins over `background`. */
  image?: string;
  /** `left` protects a left-aligned copy column; `center` dims evenly. */
  scrim?: "left" | "center" | "none";
  priority?: boolean;
  className?: string;
}) {
  const { theme, ready } = useTheme();
  const { state } = useCms();
  const override = usePageBackground(page ?? ("home" as PageKey));

  // Before preferences are adopted the no-flash script has already applied the
  // default dark theme, so matching that here avoids a swap on hydration.
  const mode = ready ? theme.mode : "dark";

  const chosen =
    page && override?.kind === "plate" ? override.id : background;
  const plate = resolveBackground(chosen, mode);

  const uploaded =
    page && override?.kind === "media"
      ? state.media.find((m) => m.id === override.mediaId)?.src
      : undefined;

  const src = image ?? uploaded ?? plate.src;
  // An uploaded image has no registry entry, so fall back to a neutral tint
  // and centre it rather than using the plate's framing.
  const tint = uploaded ? (mode === "dark" ? "#0a0e18" : "#eef2f9") : plate.tint;
  const position = uploaded ? "50% 50%" : plate.position;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
      style={{ backgroundColor: tint }}
    >
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        quality={82}
        // Uploaded images are data URLs; the optimiser cannot touch those.
        unoptimized={Boolean(uploaded)}
        className="object-cover"
        style={{ objectPosition: position }}
      />

      {/* ---- Scrims: the only thing between the plate and the content ---- */}
      {scrim === "left" && (
        <div
          className={cn(
            "absolute inset-0",
            // The plate is a full-width room, so this carries legibility on
            // its own. Tuned to the references: the copy side is clearly
            // darker, but the architecture behind it still reads.
            mode === "dark"
              ? "bg-[linear-gradient(90deg,rgba(4,7,15,0.90)_0%,rgba(4,7,15,0.76)_24%,rgba(4,7,15,0.46)_48%,rgba(4,7,15,0.16)_70%,transparent_88%)]"
              : "bg-[linear-gradient(90deg,rgba(246,248,253,0.66)_0%,rgba(246,248,253,0.48)_24%,rgba(246,248,253,0.22)_48%,rgba(246,248,253,0.05)_70%,transparent_86%)]",
          )}
        />
      )}

      {scrim === "center" && (
        <div
          className={cn(
            "absolute inset-0",
            mode === "dark" ? "bg-[rgba(4,7,15,0.48)]" : "bg-[rgba(246,248,253,0.46)]",
          )}
        />
      )}

      {/* Blend into the navbar above and the next section below */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-28",
          mode === "dark"
            ? "bg-[linear-gradient(180deg,rgba(4,7,15,0.72),transparent)]"
            : "bg-[linear-gradient(180deg,rgba(246,248,253,0.68),transparent)]",
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,transparent,var(--ax-bg))]" />
    </div>
  );
}

/** Registry plates, for the admin picker. */
export const BACKGROUND_OPTIONS = Object.values(HERO_BACKGROUNDS);
