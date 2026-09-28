import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Browser chrome wrapper for product screenshots.
 *
 * The frame is deliberately understated — thin border, muted chrome, one
 * highlight along the top edge — so the interface inside carries the weight.
 */
export function AppWindow({
  url = "app.auravex.com",
  children,
  className,
  glow = true,
}: {
  url?: string;
  children: ReactNode;
  className?: string;
  /** Soft accent bloom behind the frame. */
  glow?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {glow && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-12 -top-8 bottom-0 rounded-[40px] opacity-70 blur-[90px]"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(var(--ax-glow),0.45), transparent 70%)",
            }}
          />
          {/* Contact shadow — grounds the frame without a hard edge */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-16 -bottom-6 h-12 rounded-[50%] opacity-60 blur-2xl"
            style={{ background: "rgba(var(--ax-glow),0.30)" }}
          />
        </>
      )}

      <div
        className={cn(
          "ax-glass-strong ax-edge-light relative overflow-hidden rounded-xl",
          "shadow-[0_40px_120px_-40px_rgba(0,0,0,0.65)] md:rounded-2xl",
        )}
      >
        {/* ---------- Chrome ---------- */}
        <div className="flex items-center gap-3 border-b border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-3.5 py-2.5 md:px-4 md:py-3">
          <span className="flex shrink-0 gap-1.5">
            {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
              <span
                key={color}
                className="size-2.5 rounded-full opacity-80"
                style={{ background: color }}
              />
            ))}
          </span>

          <span className="hidden shrink-0 items-center gap-1 sm:flex">
            {(["chevron-left", "chevron-right"] as const).map((icon) => (
              <span
                key={icon}
                className="grid size-5 place-items-center text-[var(--ax-ink-dim)]"
              >
                <Icon name={icon} className="size-3.5" strokeWidth={2.2} />
              </span>
            ))}
          </span>

          {/* Address pill */}
          <span className="mx-auto flex h-6 w-full max-w-[280px] items-center justify-center gap-1.5 rounded-md border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.07)] px-3">
            <Icon
              name="lock"
              className="size-2.5 shrink-0 text-[var(--ax-success)]"
              strokeWidth={2.4}
            />
            <span className="truncate font-mono text-[10px] text-[var(--ax-ink-dim)]">{url}</span>
          </span>

          <span className="hidden shrink-0 items-center gap-2 text-[var(--ax-ink-dim)] sm:flex">
            <Icon name="plus" className="size-3.5" strokeWidth={2.2} />
          </span>
        </div>

        {/* ---------- Viewport ---------- */}
        <div className="relative bg-[var(--ax-bg-elevated)]">{children}</div>
      </div>
    </div>
  );
}
