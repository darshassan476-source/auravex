"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Gauges, heat grids and multi-series areas for the AI workspace.
 *
 * Same rules as the rest of the chart set: hand-drawn SVG, palette from CSS
 * variables, one easing pass on first sight and never again. Nothing here
 * costs a dependency or a re-render per frame after it has settled.
 */

/** 0 → 1 easing that runs once the element is seen, with a safety net. */
function useEnter(duration = 900) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(1);
      return;
    }

    let frame = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) frame = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          frame = requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(node);

    const settle = window.setTimeout(() => {
      io.disconnect();
      setT((c) => (c === 0 ? 1 : c));
    }, 1800);

    return () => {
      io.disconnect();
      window.clearTimeout(settle);
      cancelAnimationFrame(frame);
    };
  }, [duration]);

  return { ref, t };
}

/* ============================================================
   Radial gauge — one number as a ring
   ============================================================ */

export function RadialGauge({
  value,
  max = 100,
  size = 132,
  thickness = 9,
  label,
  caption,
  tone = "var(--ax-accent)",
  /** Draws a second, dimmer ring behind — useful for "of budget" readings. */
  secondary,
  pulse = false,
}: {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  caption?: string;
  tone?: string;
  secondary?: { value: number; tone: string };
  pulse?: boolean;
}) {
  const { ref, t } = useEnter();
  const R = 50 - thickness / 2;
  const C = 2 * Math.PI * R;
  const share = Math.max(0, Math.min(1, value / max));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg ref={ref} viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={label ?? "Gauge"}>
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="rgba(var(--ax-glow),0.12)"
          strokeWidth={thickness}
        />

        {secondary && (
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={secondary.tone}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${(secondary.value / max) * C * t} ${C}`}
            opacity="0.35"
          />
        )}

        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={tone}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${share * C * t} ${C}`}
          className={cn(pulse && "animate-pulse")}
        />
      </svg>

      <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        {label && (
          <span className="ax-display text-[22px] leading-none text-[var(--ax-ink)]">
            {label}
          </span>
        )}
        {caption && (
          <span className="max-w-[80%] text-center text-[9.5px] leading-tight text-[var(--ax-ink-dim)]">
            {caption}
          </span>
        )}
      </span>
    </div>
  );
}

/* ============================================================
   Stacked area — two series, shown as one volume
   ============================================================ */

export interface Series {
  label: string;
  tone: string;
  points: number[];
}

export function StackedArea({
  series,
  labels,
  height = 200,
}: {
  series: [Series, Series];
  labels: string[];
  height?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const { ref, t } = useEnter(1000);

  const W = 100;
  const H = 42;

  const totals = series[0].points.map((v, i) => v + series[1].points[i]);
  const max = Math.max(1, ...totals);

  const path = (values: number[], base: number[]) => {
    const up = values.map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * W;
      const y = H - ((v + (base[i] ?? 0)) / max) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    });
    const down = base
      .map((v, i) => {
        const idx = base.length - 1 - i;
        const x = (idx / Math.max(1, base.length - 1)) * W;
        const y = H - ((base[idx] ?? 0) / max) * H;
        return `L${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
    return `${up.join(" ")} ${down} Z`;
  };

  const zero = series[0].points.map(() => 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3" style={{ height }}>
        <div className="flex w-12 shrink-0 flex-col justify-between py-px text-right font-mono text-[9.5px] text-[var(--ax-ink-dim)]">
          {[max, Math.round(max * 0.66), Math.round(max * 0.33), 0].map((v, i) => (
            <span key={i}>{v >= 1000 ? `${Math.round(v / 1000)}k` : v}</span>
          ))}
        </div>

        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-px w-full bg-[var(--ax-line)]" />
            ))}
          </div>

          <svg
            ref={ref}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            role="img"
            aria-label="Token use"
          >
            <defs>
              <clipPath id={`sa-${uid}`}>
                <rect x="0" y="0" width={W * t} height={H} />
              </clipPath>
              {series.map((s, i) => (
                <linearGradient key={s.label} id={`sa-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.tone} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={s.tone} stopOpacity="0.08" />
                </linearGradient>
              ))}
            </defs>

            <g clipPath={`url(#sa-${uid})`}>
              <path d={path(series[0].points, zero)} fill={`url(#sa-${uid}-0)`} />
              <path d={path(series[1].points, series[0].points)} fill={`url(#sa-${uid}-1)`} />
            </g>
          </svg>
        </div>
      </div>

      {/* Legend and axis share a row where there is room, and stack where there is not. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 pl-[60px]">
        <span className="flex gap-4">
          {series.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-[10.5px] text-[var(--ax-ink-muted)]">
              <span className="size-2 rounded-sm" style={{ background: s.tone }} />
              {s.label}
            </span>
          ))}
        </span>
        <span className="flex min-w-[220px] flex-1 justify-between gap-3 text-[9.5px] text-[var(--ax-ink-dim)]">
          {labels
            .filter((_, i) => i % Math.max(1, Math.ceil(labels.length / 5)) === 0)
            .map((l, i) => (
              <span key={`${l}-${i}`}>{l}</span>
            ))}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   Heat grid — activity by day, at a glance
   ============================================================ */

export function HeatGrid({
  values,
  columns = 14,
  label = "Activity",
}: {
  /** One entry per cell, any scale. */
  values: { day: string; value: number }[];
  columns?: number;
  label?: string;
}) {
  const { ref, t } = useEnter(700);
  const max = Math.max(1, ...values.map((v) => v.value));

  const rows = useMemo(() => {
    const out: (typeof values)[] = [];
    for (let i = 0; i < values.length; i += columns) out.push(values.slice(i, i + columns));
    return out;
  }, [values, columns]);

  return (
    <div className="flex flex-col gap-2.5">
      <svg ref={ref} className="absolute size-0" aria-hidden />
      <div className="flex flex-col gap-1.5" aria-label={label}>
        {rows.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((cell) => {
              const intensity = (cell.value / max) * t;
              return (
                <span
                  key={cell.day}
                  title={`${cell.day}: ${cell.value}`}
                  className="h-7 flex-1 rounded-[5px] transition-colors duration-300"
                  style={{
                    background:
                      cell.value === 0
                        ? "rgba(var(--ax-glow),0.07)"
                        : `color-mix(in srgb, var(--ax-accent) ${Math.round(18 + intensity * 82)}%, transparent)`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[9.5px] text-[var(--ax-ink-dim)]">
        <span>{values[0]?.day}</span>
        <span className="flex items-center gap-1.5">
          Less
          {[0.15, 0.4, 0.65, 1].map((v) => (
            <span
              key={v}
              className="size-2.5 rounded-[3px]"
              style={{
                background: `color-mix(in srgb, var(--ax-accent) ${Math.round(v * 100)}%, transparent)`,
              }}
            />
          ))}
          More
        </span>
        <span>{values[values.length - 1]?.day}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Step timeline — one bar, segments proportional to time
   ============================================================ */

/**
 * A job's steps as a single track.
 *
 * The earlier version drew a separate column per step with the bar height
 * encoding duration and the label crammed underneath. It was noisy and hard to
 * read: five little bars of different heights say very little. One continuous
 * bar, with each segment's *width* proportional to the time it took, answers
 * the actual question — where did the time go — at a glance, and the legend
 * sits below where there is room for it.
 */
export function StepRail({
  steps,
}: {
  steps: { label: string; state: "done" | "running" | "queued" | "failed"; seconds?: number }[];
}) {
  const { ref, t } = useEnter(850);

  const toneOf = (state: string) =>
    state === "done"
      ? "var(--ax-success)"
      : state === "running"
        ? "var(--ax-accent)"
        : state === "failed"
          ? "var(--ax-danger)"
          : "rgba(var(--ax-glow),0.22)";

  // Unfinished steps still need a slice, or the track ends early.
  const weights = steps.map((s) => Math.max(s.seconds ?? 0, 6));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const elapsed = steps.reduce((a, s) => a + (s.seconds ?? 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <svg ref={ref} className="absolute size-0" aria-hidden />

      <div className="flex items-baseline justify-between">
        <span className="text-[10.5px] text-[var(--ax-ink-dim)]">
          {steps.filter((s) => s.state === "done").length} of {steps.length} complete
        </span>
        <span className="font-mono text-[10.5px] text-[var(--ax-ink-muted)]">
          {elapsed >= 60 ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s` : `${elapsed}s`} total
        </span>
      </div>

      {/* The track */}
      <div className="flex h-7 gap-[3px] overflow-hidden rounded-lg">
        {steps.map((step, i) => (
          <span
            key={step.label}
            title={`${step.label}${step.seconds !== undefined ? ` · ${step.seconds}s` : ""}`}
            className={cn(
              "group relative flex items-center justify-center overflow-hidden transition-[flex-grow] duration-700",
              i === 0 && "rounded-l-lg",
              i === steps.length - 1 && "rounded-r-lg",
              step.state === "running" && "animate-pulse",
            )}
            style={{
              flexGrow: (weights[i] / total) * t + 0.001,
              background: toneOf(step.state),
              opacity: step.state === "queued" ? 0.45 : 1,
            }}
          >
            {/* Only label the segment when it is wide enough to hold text. */}
            {weights[i] / total > 0.16 && (
              <span className="truncate px-2 text-[9.5px] font-medium text-white/90">
                {step.seconds !== undefined ? `${step.seconds}s` : "—"}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {steps.map((step) => (
          <span key={step.label} className="flex items-center gap-1.5">
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ background: toneOf(step.state), opacity: step.state === "queued" ? 0.45 : 1 }}
            />
            <span className="text-[10.5px] text-[var(--ax-ink-muted)]">{step.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
