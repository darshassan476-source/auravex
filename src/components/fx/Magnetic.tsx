"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useTheme } from "@/themes/ThemeProvider";

interface MagneticProps {
  children: ReactNode;
  /** Maximum pull distance in px at full motion strength. */
  strength?: number;
  className?: string;
}

/**
 * Pulls its child toward the cursor while hovered.
 * Disabled on coarse pointers and when effects are switched off.
 */
export function Magnetic({ children, strength = 14, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { effectsEnabled, motion: motionLevel } = useTheme();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  const scale = motionLevel === "subtle" ? 0.4 : motionLevel === "cinematic" ? 1.5 : 1;

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!effectsEnabled) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    x.set((relX / rect.width) * strength * 2 * scale);
    y.set((relY / rect.height) * strength * 2 * scale);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={className ?? "inline-flex"}
    >
      {children}
    </motion.div>
  );
}
