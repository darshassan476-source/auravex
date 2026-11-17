"use client";

import { useState } from "react";
import { useProduct } from "@/cms/useProduct";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LaptopFrame } from "./LaptopFrame";
import { ProductSchematic } from "./ProductSchematic";

/**
 * The hero visual for a product: the machine, with this product on its
 * screen — screens uploaded in the portal when there are any, otherwise a
 * schematic drawn from the product's own modules and capabilities. Where
 * there is more than one screen, the visitor can flick through them.
 */
export function ProductVisual({
  product: source,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const product = useProduct(source);
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
          <ProductSchematic product={product} />
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
