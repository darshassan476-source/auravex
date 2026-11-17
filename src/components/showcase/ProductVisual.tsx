"use client";

import { useEffect, useState } from "react";
import { useProduct } from "@/cms/useProduct";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LaptopFrame } from "./LaptopFrame";
import { ProductAura } from "./ProductAura";
import { ProductSchematic } from "./ProductSchematic";
import { productScreens } from "./ProductShowcase";

const DWELL_MS = 5200;

/**
 * The hero visual for a product: the machine in the product's own light,
 * with its real screens on it — uploads from the portal first, otherwise the
 * captures bundled with the site — easing from one to the next.
 */
export function ProductVisual({
  product: source,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const product = useProduct(source);
  const shots = productScreens(product);
  const [shown, setShown] = useState(0);
  const index = shots.length ? shown % shots.length : 0;

  useEffect(() => {
    if (shots.length < 2) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), DWELL_MS);
    return () => window.clearTimeout(t);
  }, [shown, shots.length]);

  return (
    <div className={cn("relative flex flex-col gap-5", className)}>
      <ProductAura slug={product.slug} accent={product.accent} className="-inset-[12%] -z-10" />
      <LaptopFrame>
        {shots.length ? (
          <div className="relative size-full">
            {shots.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                className={cn(
                  "absolute inset-0 size-full object-cover object-top transition-opacity duration-1000",
                  i === index ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </div>
        ) : (
          <ProductSchematic product={product} />
        )}
      </LaptopFrame>

      {shots.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setShown(i)}
              aria-label={`Show screen ${i + 1} of ${shots.length}`}
              aria-current={i === index}
              className="ax-focus h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === index ? 28 : 8,
                background: i === index ? product.accent : "var(--ax-line-strong)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
