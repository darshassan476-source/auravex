"use client";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: { track: 32, height: 18, knob: 12, pad: 3 },
  md: { track: 44, height: 24, knob: 16, pad: 4 },
} as const;

/**
 * On/off switch.
 *
 * The knob is positioned with an explicit `left`, not a translate. The earlier
 * hand-rolled versions each guessed a translate distance against a track width
 * defined somewhere else, and when either changed the knob ended up hanging
 * over the edge of the pill. Here the geometry is computed from one table, so
 * the knob is always inset by `pad` at both ends.
 */
export function Toggle({
  checked,
  onChange,
  label,
  size = "md",
  tone = "accent",
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Accessible name — required, the switch has no visible text of its own. */
  label: string;
  size?: keyof typeof SIZES;
  /** `success` for published/live states, `accent` for everything else. */
  tone?: "accent" | "success";
  className?: string;
}) {
  const { track, height, knob, pad } = SIZES[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{ width: track, height }}
      className={cn(
        "ax-focus relative shrink-0 rounded-full transition-colors duration-300",
        checked
          ? tone === "success"
            ? "bg-[var(--ax-success)]"
            : "bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))]"
          : "bg-[var(--ax-line-strong)]",
        className,
      )}
    >
      <span
        aria-hidden
        style={{
          width: knob,
          height: knob,
          left: checked ? track - knob - pad : pad,
        }}
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left] duration-300 ease-out"
      />
    </button>
  );
}
