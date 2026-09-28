"use client";

import {
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { useTheme } from "@/themes/ThemeProvider";

/**
 * Pointer-driven perspective tilt for the device frames.
 *
 * Shared so every frame behaves identically — the laptop, the tablet and the
 * browser window all lean the same amount, settle on the same spring, and
 * carry the same travelling highlight.
 *
 * Deliberately restrained: seven degrees at the far edge and a six-pixel lift.
 * It should register as the object being solid, not as an effect. Touch
 * pointers are ignored entirely, and it honours the motion level and the
 * effects switch in Theme settings.
 */
export function useDeviceTilt(
  intensity = 7,
  /**
   * The pose the object rests in, before the pointer moves it. A device that
   * sits square to the viewer reads as a picture of a device; a few degrees
   * of turn is what makes it read as an object in the room.
   */
  rest: { rotateX?: number; rotateY?: number } = {},
) {
  const restX = rest.rotateX ?? 0;
  const restY = rest.rotateY ?? 0;
  const ref = useRef<HTMLDivElement>(null);
  const { effectsEnabled, motion: motionLevel } = useTheme();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const lift = useMotionValue(0);

  const spring = { stiffness: 180, damping: 30, mass: 0.6 };
  const scale = motionLevel === "subtle" ? 0.4 : motionLevel === "cinematic" ? 1.5 : 1;

  const rotateY = useSpring(
    useTransform(px, [0, 1], [restY - intensity * scale, restY + intensity * scale]),
    spring,
  );
  const rotateX = useSpring(
    useTransform(py, [0, 1], [restX + intensity * 0.66 * scale, restX - intensity * 0.66 * scale]),
    spring,
  );
  const y = useSpring(lift, { stiffness: 200, damping: 26 });

  const sheenX = useTransform(px, [0, 1], [18, 82]);
  const sheenY = useTransform(py, [0, 1], [10, 70]);
  const sheen = useMotionTemplate`radial-gradient(60% 46% at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.16), transparent 62%)`;

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!effectsEnabled) return;
    if (event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
    lift.set(-6);
  }

  function onPointerLeave() {
    px.set(0.5);
    py.set(0.5);
    lift.set(0);
  }

  return {
    ref,
    sheen,
    /** Spread onto the outer wrapper. */
    handlers: { onPointerMove, onPointerLeave },
    /** Spread onto the motion element that should rotate. */
    style: { rotateX, rotateY, y, transformStyle: "preserve-3d" as const },
  };
}
