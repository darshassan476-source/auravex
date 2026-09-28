"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Chart set for the portal.
 *
 * Deliberately hand-drawn SVG rather than a charting library: the palette is
 * driven by CSS variables, so a colour changed in Appearance repaints these
 * without a re-render, and the whole set costs nothing in bundle size.
 *
 * Every chart animates in once, on first sight, and never re-plays.
 */

/** Runs a 0 → 1 easing once the element has been seen. */
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

    // A chart that is never scrolled into view must still be readable — a
    // zeroed bar chart looks like "no data", which is a lie.
    const settle = window.setTimeout(() => {
      io.disconnect();
      setT((current) => (current === 0 ? 1 : current));
    }, 1800);

    return () => {
      io.disconnect();
      window.clearTimeout(settle);
      cancelAnimationFrame(frame);
    };
  }, [duration]);

  return { ref, t };
}

export interface Point {
  label: string;
  value: number;
}

function niceCeil(value: number) {
  if (value <= 5) return 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.ceil(value / magnitude) * magnitude;
}

/* ============================================================
   Line + area, with axes and a hover readout
   ============================================================ */

export function TrendChart({
  data,
  height = 260,
  label = "Trend",
  accent = "var(--ax-accent)",
}: {
  data: Point[];
  height?: number;
  label?: string;
  accent?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const { ref, t } = useEnter();
  const [hover, setHover] = useState<number | null>(null);

  const W = 100;
  const H = 46;
  const max = useMemo(() => niceCeil(Math.max(1, ...data.map((d) => d.value))), [data]);

  const pts = data.map((d, i) => ({
    x: data.length === 1 ? W / 2 : (i / (data.length - 1)) * W,
    y: H - (d.value / max) * H,
    ...d,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  const active = hover === null ? null : pts[hover];

  if (data.length === 0) {
    return <ChartEmpty height={height} message="No data in this range yet." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3" style={{ height }}>
        {/* Y axis */}
        <div className="flex w-10 shrink-0 flex-col justify-between py-px text-right font-mono text-[10px] text-[var(--ax-ink-dim)]">
          {[max, Math.round(max * 0.66), Math.round(max * 0.33), 0].map((v, i) => (
            <span key={i}>{v.toLocaleString()}</span>
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
            className="absolute inset-0 size-full overflow-visible"
            role="img"
            aria-label={label}
          >
            <defs>
              <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.34" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
              <clipPath id={`clip-${uid}`}>
                <rect x="0" y="-4" width={W * t} height={H + 8} />
              </clipPath>
            </defs>

            <g clipPath={`url(#clip-${uid})`}>
              <path d={area} fill={`url(#fill-${uid})`} />
              <path
                d={line}
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {active && (
              <line
                x1={active.x}
                y1="0"
                x2={active.x}
                y2={H}
                stroke={accent}
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.55"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Hover targets, one per point */}
          <div className="absolute inset-0 flex">
            {pts.map((p, i) => (
              <button
                key={`${p.label}-${i}`}
                type="button"
                className="ax-focus h-full flex-1"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${p.label}: ${p.value}`}
              />
            ))}
          </div>

          {active && (
            <span
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--ax-line-strong)] bg-[var(--ax-bg-elevated)] px-2.5 py-1.5 text-center shadow-lg"
              style={{ left: `${active.x}%`, top: `${(active.y / H) * 100}%` }}
            >
              <span className="block text-[12px] font-semibold text-[var(--ax-ink)]">
                {active.value.toLocaleString()}
              </span>
              <span className="block text-[10px] text-[var(--ax-ink-dim)]">{active.label}</span>
            </span>
          )}

          {active && (
            <span
              className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--ax-bg)]"
              style={{
                left: `${active.x}%`,
                top: `${(active.y / H) * 100}%`,
                background: accent,
              }}
            />
          )}
        </div>
      </div>

      <div className="flex justify-between pl-[52px] text-[10px] text-[var(--ax-ink-dim)]">
        {data
          .filter((_, i) => i % Math.max(1, Math.ceil(data.length / 6)) === 0)
          .map((p, i) => (
            <span key={`${p.label}-${i}`}>{p.label}</span>
          ))}
      </div>
    </div>
  );
}

/* ============================================================
   Horizontal bars — good for "top pages" style breakdowns
   ============================================================ */

export function BarList({
  data,
  max: maxOverride,
  unit = "",
}: {
  data: Point[];
  max?: number;
  unit?: string;
}) {
  const { ref, t } = useEnter(700);
  const max = maxOverride ?? Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <ChartEmpty height={160} message="Nothing recorded yet." />;
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* An invisible svg carries the intersection observer for the group. */}
      <svg ref={ref} className="absolute size-0" aria-hidden />
      {data.map((d) => (
        <div key={d.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[12.5px] text-[var(--ax-ink)]">{d.label}</span>
            <span className="shrink-0 font-mono text-[11.5px] text-[var(--ax-ink-muted)]">
              {d.value.toLocaleString()}
              {unit}
            </span>
          </div>
          <span className="h-1.5 overflow-hidden rounded-full bg-[rgba(var(--ax-glow),0.10)]">
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,var(--ax-accent),var(--ax-violet))] transition-[width] duration-500"
              style={{ width: `${(d.value / max) * 100 * t}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Donut — share of a whole
   ============================================================ */

export function DonutChart({
  data,
  size = 168,
  centreLabel,
}: {
  data: Point[];
  size?: number;
  centreLabel?: string;
}) {
  const { ref, t } = useEnter(850);
  const total = data.reduce((a, b) => a + b.value, 0);
  const colours = [
    "var(--ax-accent)",
    "var(--ax-violet)",
    "var(--ax-cyan)",
    "var(--ax-success)",
    "var(--ax-warning)",
  ];

  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;

  if (total === 0) {
    return <ChartEmpty height={size} message="Nothing recorded yet." />;
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg ref={ref} viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label="Share">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="rgba(var(--ax-glow),0.10)"
            strokeWidth="12"
          />
          {data.map((d, i) => {
            const share = (d.value / total) * t;
            const dash = share * C;
            const el = (
              <circle
                key={d.label}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={colours[i % colours.length]}
                strokeWidth="12"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>

        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="ax-display text-[24px] text-[var(--ax-ink)]">
            {Math.round(total * t).toLocaleString()}
          </span>
          {centreLabel && (
            <span className="text-[10.5px] text-[var(--ax-ink-dim)]">{centreLabel}</span>
          )}
        </span>
      </div>

      <ul className="flex min-w-[140px] flex-1 flex-col gap-2.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ background: colours[i % colours.length] }}
            />
            <span className="flex-1 truncate text-[12.5px] text-[var(--ax-ink-muted)]">
              {d.label}
            </span>
            <span className="font-mono text-[11.5px] text-[var(--ax-ink)]">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   Vertical bars — good for "by hour" / "by day" distributions
   ============================================================ */

export function ColumnChart({ data, height = 180 }: { data: Point[]; height?: number }) {
  const { ref, t } = useEnter(750);
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <ChartEmpty height={height} message="Nothing recorded yet." />;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <svg ref={ref} className="absolute size-0" aria-hidden />
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d) => (
          <span
            key={d.label}
            className="group relative flex h-full flex-1 items-end"
            title={`${d.label}: ${d.value}`}
          >
            <span
              className={cn(
                "w-full rounded-t-[4px] bg-[linear-gradient(180deg,var(--ax-accent),rgba(var(--ax-glow),0.22))]",
                "transition-[height] duration-500 group-hover:brightness-125",
              )}
              style={{ height: `${Math.max(2, (d.value / max) * 100 * t)}%` }}
            />
          </span>
        ))}
      </div>
      <div className="flex gap-1.5 text-[9.5px] text-[var(--ax-ink-dim)]">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center">
            {i % Math.max(1, Math.ceil(data.length / 8)) === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartEmpty({ height, message }: { height: number; message: string }) {
  return (
    <div
      className="grid place-items-center rounded-xl border border-dashed border-[var(--ax-line-strong)] text-[12.5px] text-[var(--ax-ink-dim)]"
      style={{ height }}
    >
      {message}
    </div>
  );
}
