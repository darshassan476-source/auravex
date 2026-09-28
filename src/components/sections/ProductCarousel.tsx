"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Product rail — reference 6.
 *
 * On phones and tablets the cards become a snap carousel with arrow controls
 * and a dot indicator, exactly as the mobile reference shows. From `xl` the
 * same markup lays out as the four-across grid the desktop references use, and
 * the controls disappear because nothing overflows.
 */
export function ProductCarousel({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [overflows, setOverflows] = useState(false);

  /** Nearest card to the left edge — the one the snap has settled on. */
  const syncIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setOverflows(track.scrollWidth - track.clientWidth > 8);

    const cards = Array.from(track.children) as HTMLElement[];
    let nearest = 0;
    let best = Infinity;
    cards.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft - track.scrollLeft);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    setIndex(nearest);
  }, []);

  useEffect(() => {
    syncIndex();
    window.addEventListener("resize", syncIndex);
    return () => window.removeEventListener("resize", syncIndex);
  }, [syncIndex]);

  const goTo = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[target] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  }, []);

  const step = (delta: number) =>
    goTo(Math.min(products.length - 1, Math.max(0, index + delta)));

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Arrow controls — only meaningful while the rail overflows */}
      {overflows && (
        <div className="flex justify-end gap-2.5 xl:hidden">
          {[
            { dir: -1, icon: "arrow-left", label: "Previous products" },
            { dir: 1, icon: "arrow-right", label: "Next products" },
          ].map((control) => {
            const disabled =
              control.dir < 0 ? index === 0 : index >= products.length - 1;
            return (
              <button
                key={control.icon}
                type="button"
                onClick={() => step(control.dir)}
                disabled={disabled}
                aria-label={control.label}
                className="ax-focus grid size-11 place-items-center rounded-full border border-[var(--ax-line-strong)] text-[var(--ax-ink)] transition-all duration-300 hover:bg-[rgba(var(--ax-glow),0.10)] disabled:opacity-35"
              >
                <Icon name={control.icon} className="size-[18px]" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={trackRef}
        onScroll={syncIndex}
        className={cn(
          "ax-no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-1",
          "md:-mx-10 md:px-10 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0",
        )}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[82%] shrink-0 snap-start sm:w-[54%] lg:w-[38%] xl:w-auto xl:shrink"
          >
            <ProductCard product={product} className="h-full" />
          </div>
        ))}
      </div>

      {/* Dot indicator */}
      {overflows && (
        <div className="flex justify-center gap-2 xl:hidden">
          {products.map((product, i) => (
            <button
              key={product.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${product.name}`}
              aria-current={i === index}
              className={cn(
                "ax-focus h-1.5 rounded-full transition-all duration-500",
                i === index
                  ? "w-7 bg-[linear-gradient(90deg,var(--ax-accent),var(--ax-violet))]"
                  : "w-1.5 bg-[var(--ax-line-strong)] hover:bg-[rgba(var(--ax-glow),0.45)]",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
