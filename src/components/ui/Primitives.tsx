import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { sparklineArea, sparklinePath } from "@/lib/utils";
import type { ProductStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/data/products";
import { Icon } from "./Icon";

/* ---------------- Eyebrow ---------------- */

export function Eyebrow({
  children,
  className,
  withDot = true,
  withRule = false,
}: {
  children: ReactNode;
  className?: string;
  withDot?: boolean;
  withRule?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {withDot && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-[pulse-ring_2.6s_ease-out_infinite] rounded-full bg-[var(--ax-accent)]" />
          <span className="relative inline-flex size-1.5 rounded-full bg-[var(--ax-accent)]" />
        </span>
      )}
      <span className="ax-eyebrow">{children}</span>
      {withRule && (
        <span className="h-px w-12 bg-[linear-gradient(90deg,var(--ax-line-strong),transparent)]" />
      )}
    </span>
  );
}

/* ---------------- Pill / Badge ---------------- */

export function Pill({
  children,
  className,
  icon,
}: {
  children: ReactNode;
  className?: string;
  icon?: string;
}) {
  return (
    <span
      className={cn(
        "ax-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5",
        "text-[11px] font-medium text-[var(--ax-ink-muted)]",
        className,
      )}
    >
      {icon && <Icon name={icon} className="size-3" strokeWidth={2.2} />}
      {children}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.07)]",
        "px-2.5 py-1 text-[11px] font-medium text-[var(--ax-ink-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<ProductStatus, string> = {
  live: "text-[var(--ax-success)] border-[var(--ax-success)]/30 bg-[var(--ax-success)]/10",
  beta: "text-[var(--ax-accent-soft)] border-[var(--ax-accent)]/30 bg-[var(--ax-accent)]/10",
  development: "text-[var(--ax-warning)] border-[var(--ax-warning)]/30 bg-[var(--ax-warning)]/10",
  "coming-soon": "text-[var(--ax-ink-muted)] border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.06)]",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {status === "live" && (
          <span className="absolute inline-flex size-full animate-[pulse-ring_2.6s_ease-out_infinite] rounded-full bg-current" />
        )}
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      {STATUS_LABELS[status]}
    </span>
  );
}

/* ---------------- Glass panel ---------------- */

export function GlassPanel({
  children,
  className,
  strong = false,
  edgeLight = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  edgeLight?: boolean;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag
      className={cn(
        strong ? "ax-glass-strong" : "ax-glass",
        edgeLight && "ax-edge-light",
        "rounded-2xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ---------------- Section heading ---------------- */

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  action,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Trailing gradient-highlighted phrase, matching the AURAVEX headline style. */
  accent?: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "items-start",
        description || action ? "lg:flex-row lg:items-end lg:justify-between lg:gap-16" : "",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-4", align === "center" && "items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="ax-display ax-text-balance max-w-2xl text-[clamp(2rem,4.2vw,3.5rem)]">
          {title}
          {accent && (
            <>
              {" "}
              <span className="ax-gradient-text">{accent}</span>
            </>
          )}
        </h2>
      </div>

      {(description || action) && (
        <div
          className={cn(
            "flex shrink-0 flex-col gap-6",
            align === "center" ? "items-center" : "lg:items-end",
          )}
        >
          {description && (
            <p className="ax-text-pretty max-w-md text-[15px] leading-relaxed text-[var(--ax-ink-muted)]">
              {description}
            </p>
          )}
          {action}
        </div>
      )}
    </div>
  );
}

/* ---------------- Section shell ---------------- */

export function Section({
  children,
  className,
  id,
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Skips the container so the section can run full-bleed. */
  bleed?: boolean;
}) {
  return (
    <section id={id} className={cn("relative py-14 md:py-16 lg:py-20", className)}>
      {bleed ? children : <div className="ax-container">{children}</div>}
    </section>
  );
}

/* ---------------- Stat tile ---------------- */

export function StatTile({
  icon,
  value,
  label,
  sub,
  className,
}: {
  icon?: string;
  value: ReactNode;
  label: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {icon && (
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
          <Icon name={icon} className="size-5" strokeWidth={1.8} />
        </span>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="ax-display text-2xl text-[var(--ax-ink)] md:text-[28px]">{value}</span>
        <span className="text-[13px] font-medium text-[var(--ax-ink-muted)]">{label}</span>
        {sub && <span className="text-[11px] text-[var(--ax-ink-dim)]">{sub}</span>}
      </div>
    </div>
  );
}

/* ---------------- Sparkline ---------------- */

export function Sparkline({
  series,
  className,
  width = 100,
  height = 32,
  gradientId,
  stroke = "var(--ax-accent)",
}: {
  series: number[];
  className?: string;
  width?: number;
  height?: number;
  gradientId: string;
  stroke?: string;
}) {
  const line = sparklinePath(series, width, height);
  const area = sparklineArea(series, width, height);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ---------------- Delta indicator ---------------- */

export function Delta({
  value,
  trend = "up",
  className,
}: {
  value: string;
  trend?: "up" | "down" | "flat";
  className?: string;
}) {
  const positive = trend === "up";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px] font-semibold",
        trend === "flat"
          ? "text-[var(--ax-ink-muted)]"
          : positive
            ? "text-[var(--ax-success)]"
            : "text-[var(--ax-accent-soft)]",
        className,
      )}
    >
      {trend !== "flat" && (
        <Icon
          name="trending"
          className={cn("size-3.5", !positive && "rotate-180")}
          strokeWidth={2.4}
        />
      )}
      {value}
    </span>
  );
}

/* ---------------- Divider ---------------- */

export function Hairline({ className }: { className?: string }) {
  return <div className={cn("ax-hairline w-full", className)} />;
}
