"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/themes/ThemeProvider";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees at full motion strength. */
  intensity?: number;
  /** Adds a cursor-tracking specular highlight. */
  glare?: boolean;
}

/**
 * 3D tilt surface with a cursor-tracked spotlight.
 * Falls back to a static container when effects are disabled.
 */
export function TiltCard({
  children,
  className,
  intensity = 6,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { effectsEnabled, motion: motionLevel } = useTheme();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useMotionValue(0);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.5 };
  const sRotateX = useSpring(rotateX, springConfig);
  const sRotateY = useSpring(rotateY, springConfig);
  const sGlareOpacity = useSpring(glareOpacity, { stiffness: 140, damping: 26 });

  const glareBackground = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(var(--ax-glow), 0.20), transparent 62%)`;

  const scale = motionLevel === "subtle" ? 0.4 : motionLevel === "cinematic" ? 1.5 : 1;

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!effectsEnabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * intensity * 2 * scale);
    rotateX.set(-(py - 0.5) * intensity * 2 * scale);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(1);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX: sRotateX,
        rotateY: sRotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1200,
      }}
      className={cn("relative", className)}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden
          style={{ background: glareBackground, opacity: sGlareOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      )}
    </motion.div>
  );
}
