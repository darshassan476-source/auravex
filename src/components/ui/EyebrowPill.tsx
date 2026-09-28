import { cn } from "@/lib/utils";

/**
 * The section marker used at the top of every reference hero: a glass pill
 * with a glowing dot, uppercase tracked label, then a thin rule that trails
 * off to a second dot.
 */
export function EyebrowPill({
  children,
  trail = true,
  className,
}: {
  children: React.ReactNode;
  /** The decorative rule + dot trailing to the right. */
  trail?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="ax-glass inline-flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-[pulse-ring_2.6s_ease-out_infinite] rounded-full bg-[var(--ax-accent)]" />
          <span className="relative inline-flex size-1.5 rounded-full bg-[var(--ax-accent-soft)]" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ax-ink-muted)]">
          {children}
        </span>
      </span>

      {trail && (
        <span aria-hidden className="hidden items-center gap-2 sm:inline-flex">
          <span className="h-px w-14 bg-[linear-gradient(90deg,var(--ax-line-strong),transparent)]" />
          <span className="size-1 rounded-full bg-[var(--ax-line-strong)]" />
        </span>
      )}
    </span>
  );
}
