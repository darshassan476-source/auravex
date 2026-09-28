import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact number formatting used across dashboards and stat tiles. */
export function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

/**
 * Builds an SVG path for a sparkline from a raw series.
 * Kept dependency-free so it can run during SSR.
 */
export function sparklinePath(series: number[], width = 100, height = 32) {
  if (series.length < 2) return "";
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const step = width / (series.length - 1);

  const points = series.map((value, i) => {
    const x = i * step;
    const y = height - ((value - min) / span) * height;
    return [x, y] as const;
  });

  // Catmull-Rom style smoothing for a premium curve rather than hard joints.
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

export function sparklineArea(series: number[], width = 100, height = 32) {
  const line = sparklinePath(series, width, height);
  if (!line) return "";
  return `${line} L ${width},${height} L 0,${height} Z`;
}

/** Deterministic pseudo-random generator — avoids SSR/CSR hydration drift. */
export function seededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
