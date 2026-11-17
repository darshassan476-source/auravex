"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PointerEvent } from "react";
import type { ResolvedProduct } from "@/cms/useProduct";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BrowserFrame } from "./BrowserFrame";
import { ProductAura } from "./ProductAura";
import { ProductSchematic } from "./ProductSchematic";

/** Every screen for a product: portal uploads first, then the bundled captures. */
export function productScreens(product: ResolvedProduct): { src: string; alt: string }[] {
  const uploaded = (product.imageSrcs ?? []).map((src, i) => ({ src, alt: `${product.name} — screen ${i + 1}` }));
  if (uploaded.length) return uploaded;
  return product.gallery.filter((g) => g.type === "image").map((g) => ({ src: g.src, alt: g.alt }));
}

/**
 * A product in its own light: its colours, its real screen in a browser
 * window, a second screen behind it, and two of its actual capabilities
 * floating alongside. The whole set leans gently toward the pointer.
 */
export function ProductShowcase({
  product,
  size = "lg",
  className,
}: {
  product: ResolvedProduct;
  size?: "lg" | "md" | "sm";
  className?: string;
}) {
  const screens = productScreens(product);
  const [main, second] = screens;
  const chips = product.features.slice(0, 2);
  const address = product.name;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 18 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const sm = size === "sm";

  return (
    <div
      className={cn("relative isolate [perspective:1600px]", className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <ProductAura slug={product.slug} accent={product.accent} intensity={sm ? 0.8 : 1} />

      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        className={cn(
          "relative z-10 [transform-style:preserve-3d]",
          sm ? "px-[7%] pb-[9%] pt-[8%]" : "px-[6%] pb-[10%] pt-[7%]",
        )}
      >
        {second && !sm && (
          <div className="absolute right-[1%] top-[1%] w-[58%] opacity-80 [transform:translateZ(-60px)]">
            <BrowserFrame compact address={address} className="ax-float-slower">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={second.src} alt="" loading="lazy" className="block w-full" />
            </BrowserFrame>
          </div>
        )}

        <div className={cn("relative", second && !sm ? "w-[88%]" : "w-full", "[transform:translateZ(20px)]")}>
          <BrowserFrame address={address} accent={product.accent} compact={size !== "lg"}>
            {main ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={main.src}
                alt={main.alt}
                loading="lazy"
                className="block aspect-[16/10] w-full object-cover object-top"
              />
            ) : (
              <div className="aspect-[16/10] w-full">
                <ProductSchematic product={product} />
              </div>
            )}
          </BrowserFrame>
        </div>

        {!sm &&
          chips.map((c, i) => (
            <div
              key={c.title}
              className={cn(
                "absolute z-20 hidden max-w-[46%] sm:block",
                i === 0 ? "bottom-[3%] left-0" : "right-0 top-[38%]",
              )}
              style={{ transform: "translateZ(80px)" }}
            >
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-2xl border border-white/12 px-3.5 py-2.5 backdrop-blur-xl",
                  "bg-[rgba(10,14,26,0.78)] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]",
                  i === 0 ? "ax-float-slow" : "ax-float-slower",
                )}
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${product.accent}33`, color: product.accent }}
                >
                  <Icon name={c.icon} className="size-4" strokeWidth={2} />
                </span>
                <span className="truncate text-[12.5px] font-semibold text-white">{c.title}</span>
              </div>
            </div>
          ))}
      </motion.div>
    </div>
  );
}
