import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Delta } from "@/components/ui/Primitives";
import type { AnalyticsPoint, LeadStatus } from "@/lib/types";
import { cn, sparklineArea, sparklinePath } from "@/lib/utils";

/* ---------------- Page header ---------------- */

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="ax-display text-[clamp(1.6rem,3vw,2.2rem)] text-[var(--ax-ink)]">{title}</h1>
        {description && (
          <p className="ax-text-pretty max-w-xl text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2.5">{action}</div>}
    </div>
  );
}

/* ---------------- Panel ---------------- */

export function Panel({
  title,
  description,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn("ax-glass ax-edge-light flex flex-col rounded-2xl", className)}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-[var(--ax-line)] px-6 py-4">
          <div className="flex min-w-0 flex-1 basis-[220px] flex-col gap-1">
            {title && (
              <h2 className="text-[15px] font-semibold text-[var(--ax-ink)]">{title}</h2>
            )}
            {description && (
              <p className="text-[12px] text-[var(--ax-ink-dim)]">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn("flex-1", padded && "p-6")}>{children}</div>
    </section>
  );
}

/* ---------------- KPI card ---------------- */

export function KpiTile({
  label,
  value,
  delta,
  trend,
  icon,
  series,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: string;
  series: number[];
}) {
  const gradientId = `kpi-${label.replace(/\W/g, "").toLowerCase()}`;

  return (
    <div className="ax-glass ax-edge-light group relative overflow-hidden rounded-2xl p-5 transition-colors duration-500 hover:border-[var(--ax-line-strong)]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:scale-110">
          <Icon name={icon} className="size-[18px]" strokeWidth={1.8} />
        </span>
        <Delta value={delta} trend={trend} />
      </div>

      <div className="mt-5 flex flex-col gap-1">
        <span className="ax-display text-[30px] text-[var(--ax-ink)]">{value}</span>
        <span className="text-[12.5px] text-[var(--ax-ink-muted)]">{label}</span>
      </div>

      <svg
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        className="mt-4 h-10 w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ax-accent)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--ax-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={sparklineArea(series, 100, 32)} fill={`url(#${gradientId})`} />
        <path
          d={sparklinePath(series, 100, 32)}
          fill="none"
          stroke="var(--ax-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

/* ---------------- Area chart ---------------- */

export function AreaChart({
  data,
  height = 220,
  id,
}: {
  data: AnalyticsPoint[];
  height?: number;
  id: string;
}) {
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const W = 100;
  const H = 40;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative" style={{ height }}>
        {/* Horizontal rules */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-px w-full bg-[var(--ax-line)]" />
          ))}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-label="Visitor trend"
          role="img"
        >
          <defs>
            <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ax-accent)" stopOpacity="0.36" />
              <stop offset="100%" stopColor="var(--ax-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={sparklineArea(values, W, H)} fill={`url(#area-${id})`} />
          <path
            d={sparklinePath(values, W, H)}
            fill="none"
            stroke="var(--ax-accent)"
            strokeWidth="1.8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Point markers */}
        <div className="absolute inset-0 flex items-stretch justify-between">
          {data.map((point) => {
            const ratio = (point.value - min) / (max - min || 1);
            return (
              <span
                key={point.label}
                className="group relative flex w-full justify-center"
                title={`${point.label}: ${point.value.toLocaleString()}`}
              >
                <span
                  className="absolute size-1.5 -translate-y-1/2 rounded-full bg-[var(--ax-accent)] opacity-0 ring-2 ring-[var(--ax-bg)] transition-opacity duration-200 group-hover:opacity-100"
                  style={{ top: `${(1 - ratio) * 100}%` }}
                />
                <span className="h-full w-px bg-transparent transition-colors duration-200 group-hover:bg-[rgba(var(--ax-glow),0.18)]" />
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-[var(--ax-ink-dim)]">
        {data
          .filter((_, i) => i % 3 === 0)
          .map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
      </div>
    </div>
  );
}

/* ---------------- Lead status chip ---------------- */

const LEAD_STYLES: Record<LeadStatus, string> = {
  new: "text-[var(--ax-accent-soft)] border-[var(--ax-accent)]/30 bg-[var(--ax-accent)]/10",
  contacted: "text-[var(--ax-cyan)] border-[var(--ax-cyan)]/30 bg-[var(--ax-cyan)]/10",
  qualified: "text-[var(--ax-success)] border-[var(--ax-success)]/30 bg-[var(--ax-success)]/10",
  "in-progress": "text-[var(--ax-warning)] border-[var(--ax-warning)]/30 bg-[var(--ax-warning)]/10",
  closed: "text-[var(--ax-ink-dim)] border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.06)]",
};

export const LEAD_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  "in-progress": "In Progress",
  closed: "Closed",
};

export function LeadChip({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]",
        LEAD_STYLES[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {LEAD_LABELS[status]}
    </span>
  );
}

/* ---------------- Empty state ---------------- */

export function EmptyState({
  icon = "search",
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)] text-[var(--ax-ink-dim)]">
        <Icon name={icon} className="size-5" strokeWidth={1.7} />
      </span>
      <p className="text-[14.5px] font-medium text-[var(--ax-ink)]">{title}</p>
      {body && <p className="max-w-sm text-[12.5px] text-[var(--ax-ink-dim)]">{body}</p>}
      {action}
    </div>
  );
}
