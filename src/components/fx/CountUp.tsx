"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Splits "AED 50B+" into the number to animate and the text around it, so a
 * figure edited in the portal still counts up.
 */
export function parseFigure(text: string) {
  const match = /^(\D*?)(\d+(?:\.\d+)?)([\s\S]*)$/.exec(text.trim());
  if (!match) return { prefix: text, value: 0, suffix: "", decimals: 0 };
  const [, prefix, digits, suffix] = match;
  return {
    prefix,
    value: Number(digits),
    suffix,
    decimals: digits.includes(".") ? digits.split(".")[1].length : 0,
  };
}

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Counts up once the element enters the viewport.
 * Renders the final value on the server so SSR output stays meaningful.
 */
export function CountUp({
  value,
  duration = 1800,
  decimals,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);
  // A ref, not state: flipping state here would re-run the effect, and its
  // cleanup would cancel the very frame loop it had just started.
  const started = useRef(false);

  // Infer decimals from the source value unless explicitly set.
  const places = decimals ?? (Number.isInteger(value) ? 0 : 1);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      // The first rAF timestamp can predate `start` by a frame, which would
      // otherwise send the eased value sharply negative on the opening frame.
      const progress = Math.min(Math.max((now - start) / duration, 0), 1);
      // easeOutExpo — fast start, precise landing
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(places)}
      {suffix}
    </span>
  );
}
