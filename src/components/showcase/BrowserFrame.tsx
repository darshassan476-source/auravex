import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A browser window around a real product screen: traffic lights, the
 * product's own address and a soft accent-lit edge, so a screenshot reads
 * as the live application rather than a pasted picture.
 */
export function BrowserFrame({
  address,
  accent,
  children,
  className,
  compact = false,
}: {
  address?: string;
  accent?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-white/10 bg-[#0b0f1a]",
        "shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.03)]",
        className,
      )}
      style={accent ? { boxShadow: `0 40px 100px -34px ${accent}88, 0 24px 60px -30px rgba(0,0,0,0.8)` } : undefined}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-white/[0.07] bg-[linear-gradient(180deg,#161b29,#10141f)]",
          compact ? "h-7 px-3" : "h-9 px-4",
        )}
      >
        <span className="flex gap-1.5" aria-hidden>
          <span className={cn("rounded-full bg-[#ff5f57]", compact ? "size-2" : "size-2.5")} />
          <span className={cn("rounded-full bg-[#febc2e]", compact ? "size-2" : "size-2.5")} />
          <span className={cn("rounded-full bg-[#28c840]", compact ? "size-2" : "size-2.5")} />
        </span>
        {address && (
          <span
            className={cn(
              "mx-auto flex max-w-[60%] items-center gap-1.5 truncate rounded-md bg-white/[0.06] text-white/55",
              compact ? "px-2 py-0.5 text-[9.5px]" : "px-3 py-1 text-[11px]",
            )}
          >
            <svg viewBox="0 0 12 12" className="size-2.5 shrink-0 opacity-70" aria-hidden>
              <path d="M3.5 5V3.8a2.5 2.5 0 0 1 5 0V5M2.8 5h6.4v5H2.8z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className="truncate">{address}</span>
          </span>
        )}
        {address && <span className={compact ? "w-8" : "w-12"} aria-hidden />}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/** The host name of a URL, for the address bar. */
export function hostOf(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}
