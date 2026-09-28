"use client";

import { useState } from "react";
import { useProduct } from "@/cms/useProduct";
import type { Product, ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DashboardMock } from "./DashboardMock";
import { LaptopFrame } from "./LaptopFrame";
import { BoardScreen } from "./interfaces/BoardScreen";
import { ConsoleScreen } from "./interfaces/ConsoleScreen";
import { KioskScreen } from "./interfaces/KioskScreen";
import { MapScreen } from "./interfaces/MapScreen";
import { PipelineScreen } from "./interfaces/PipelineScreen";

/**
 * The hero visual for a product: the machine, with this product on its screen.
 *
 * Every product page shows the same laptop, so the catalogue reads as one
 * shelf — but never the same screen twice. Each product has its own kind of
 * interface (a map, an approval board, an analytics desk, a pipeline, a
 * deploy console, a check-in app), and screens uploaded in the portal replace
 * the generated one entirely. Where there is more than one, the visitor can
 * flick through them and the laptop's screen changes like a wallpaper.
 */

type Archetype =
  "map" | "analytics" | "board" | "pipeline" | "kiosk" | "console";

const BY_SLUG: Record<string, Archetype> = {
  "real-estate-os": "map",
  "business-intelligence": "analytics",
  "operations-suite": "board",
  "crm-lead-flow": "pipeline",
  "visitor-experience": "kiosk",
  "custom-platforms": "console",
  "aurora-ai-engine": "analytics",
  "forge-devkit": "console",
  "atlas-site-builder": "board",
};

const BY_CATEGORY: Record<ProductCategory, Archetype> = {
  enterprise: "map",
  ai: "analytics",
  automation: "board",
  saas: "pipeline",
  "web-apps": "kiosk",
  "developer-tools": "console",
};

export function archetypeFor(
  slug: string,
  category: ProductCategory,
): Archetype {
  return BY_SLUG[slug] ?? BY_CATEGORY[category] ?? "analytics";
}

/** The generated interface for a product that has no screenshot of its own. */
function GeneratedScreen({
  archetype,
  accent,
}: {
  archetype: Archetype;
  accent: string;
}) {
  if (archetype === "map") return <MapScreen accent={accent} />;
  if (archetype === "board") return <BoardScreen accent={accent} />;
  if (archetype === "pipeline") return <PipelineScreen accent={accent} />;
  if (archetype === "console") return <ConsoleScreen accent={accent} />;
  if (archetype === "kiosk") {
    // A check-in app is a portrait interface. Stretched across a 16:10 screen
    // it stops looking like itself, so it is shown at its own shape, the way
    // it would be previewed on a desktop.
    return (
      <div className="flex h-full items-center justify-center bg-[var(--ax-bg)] p-2.5">
        <div className="h-full overflow-hidden rounded-[9px] border border-[var(--ax-line)] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.7)] [aspect-ratio:3/4]">
          <KioskScreen accent={accent} />
        </div>
      </div>
    );
  }
  return <DashboardMock preset="analytics" />;
}

export function ProductVisual({
  product: source,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const product = useProduct(source);
  const archetype = archetypeFor(product.slug, product.category);
  const accent = product.accent;
  const shots = product.imageSrcs ?? [];
  const [shown, setShown] = useState(0);
  const index = Math.min(shown, Math.max(0, shots.length - 1));
  const current = shots[index];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <LaptopFrame>
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt={`${product.name} — screen ${index + 1}`}
            className="size-full object-cover"
          />
        ) : (
          <GeneratedScreen archetype={archetype} accent={accent} />
        )}
      </LaptopFrame>

      {shots.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setShown(i)}
              aria-label={`Show screen ${i + 1} of ${shots.length}`}
              aria-current={i === index}
              className={cn(
                "ax-focus relative h-11 w-[72px] overflow-hidden rounded-lg border transition-all duration-300",
                i === index
                  ? "border-[var(--ax-accent)] ax-glow-sm"
                  : "border-[var(--ax-line)] opacity-70 hover:border-[var(--ax-line-strong)] hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
