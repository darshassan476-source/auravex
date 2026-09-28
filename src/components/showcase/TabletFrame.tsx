"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useDeviceTilt } from "./useDeviceTilt";

/**
 * Tablet device mockup, for the products that are touch interfaces rather
 * than desktop tools. Same lighting language as `LaptopFrame` so the two sit
 * together in one catalogue.
 */
export function TabletFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, sheen, handlers, style } = useDeviceTilt(6);

  return (
    <div
      ref={ref}
      {...handlers}
      className={cn("relative mx-auto w-full max-w-[420px] [perspective:1400px]", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-12 -top-8 bottom-6 rounded-[50%] opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 50%, rgba(var(--ax-glow),0.40), transparent 70%)",
        }}
      />

      <motion.div
        style={{
          ...style,
          background: "linear-gradient(160deg, #3a4355 0%, #11151f 42%, #0a0d15 100%)",
        }}
        className="relative rounded-[26px] p-[10px] shadow-[0_46px_120px_-36px_rgba(0,0,0,0.85)]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-white/10"
        />

        {/* Front camera */}
        <span
          aria-hidden
          className="absolute left-1/2 top-[4px] size-1.5 -translate-x-1/2 rounded-full bg-black/70 ring-1 ring-white/10"
        />

        <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-[var(--ax-bg-elevated)]">
          {children}
          {/* Glass: fixed diagonal plus the highlight that tracks the pointer */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.10),transparent_38%)]"
          />
          <motion.span
            aria-hidden
            style={{ backgroundImage: sheen }}
            className="pointer-events-none absolute inset-0 mix-blend-screen"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.4)]"
          />
        </div>
      </motion.div>
    </div>
  );
}
