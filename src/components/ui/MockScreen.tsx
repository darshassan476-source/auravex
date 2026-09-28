import { cn, seededRandom, sparklineArea, sparklinePath } from "@/lib/utils";

/**
 * Deterministic product-shot stand-in.
 *
 * A product without an uploaded image shows one of these archetype screens;
 * until then a broken <img> would look worse than nothing. This renders an
 * abstract dashboard keyed to the asset id, so every screenshot is stable
 * across SSR/CSR and distinct from its neighbours.
 */
export function MockScreen({
  seed,
  accent,
  label,
  variant = "dashboard",
  className,
}: {
  /** Any stable string — the asset id is ideal. */
  seed: string;
  accent: string;
  label?: string;
  variant?: "dashboard" | "map" | "insights";
  className?: string;
}) {
  const numericSeed = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0) * 31, 7);
  const rand = seededRandom(numericSeed);

  const series = Array.from({ length: 14 }, (_, i) => 30 + rand() * 50 + i * 2.4);
  const bars = Array.from({ length: 9 }, () => 24 + rand() * 66);
  const nodes = Array.from({ length: 11 }, () => ({
    x: 8 + rand() * 84,
    y: 12 + rand() * 72,
    r: 1.4 + rand() * 3.2,
  }));

  return (
    <div
      className={cn(
        "ax-glass relative overflow-hidden rounded-xl border border-[var(--ax-line)]",
        className,
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--ax-line)] px-3.5 py-2.5">
        <span className="flex gap-1.5">
          {["var(--ax-danger)", "var(--ax-warning)", "var(--ax-success)"].map((color) => (
            <span key={color} className="size-2 rounded-full opacity-60" style={{ background: color }} />
          ))}
        </span>
        {label && (
          <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--ax-ink-dim)]">
            {label}
          </span>
        )}
      </div>

      <div className="relative p-3.5">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full opacity-40 blur-3xl"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
        />

        {variant === "dashboard" && (
          <div className="relative flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)] p-2">
                  <span className="block h-1 w-8 rounded-full bg-[var(--ax-line-strong)]" />
                  <span
                    className="mt-1.5 block h-2 rounded-full"
                    style={{ width: `${50 + i * 14}%`, background: accent, opacity: 0.75 }}
                  />
                </div>
              ))}
            </div>

            <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="h-20 w-full" aria-hidden>
              <defs>
                <linearGradient id={`ms-${numericSeed}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.38" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={sparklineArea(series, 100, 34)} fill={`url(#ms-${numericSeed})`} />
              <path
                d={sparklinePath(series, 100, 34)}
                fill="none"
                stroke={accent}
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="flex h-12 items-end gap-1.5">
              {bars.map((height, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{ height: `${height}%`, background: accent, opacity: 0.18 + (i % 3) * 0.16 }}
                />
              ))}
            </div>
          </div>
        )}

        {variant === "map" && (
          <div className="relative h-[184px] overflow-hidden rounded-lg border border-[var(--ax-line)]">
            <div className="ax-grid-bg absolute inset-0 opacity-70" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
              {nodes.map((node, i) => (
                <g key={i}>
                  <circle cx={node.x} cy={node.y} r={node.r * 2.6} fill={accent} opacity="0.12" />
                  <circle cx={node.x} cy={node.y} r={node.r} fill={accent} opacity="0.9" />
                </g>
              ))}
              {nodes.slice(0, 6).map((node, i) => {
                const next = nodes[i + 1];
                return (
                  <line
                    key={`l-${i}`}
                    x1={node.x}
                    y1={node.y}
                    x2={next.x}
                    y2={next.y}
                    stroke={accent}
                    strokeWidth="0.35"
                    opacity="0.4"
                  />
                );
              })}
            </svg>
          </div>
        )}

        {variant === "insights" && (
          <div className="relative flex flex-col gap-2.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-2.5 py-2"
              >
                <span className="size-5 shrink-0 rounded-md" style={{ background: accent, opacity: 0.25 + i * 0.12 }} />
                <span className="flex flex-1 flex-col gap-1">
                  <span className="block h-1.5 rounded-full bg-[var(--ax-line-strong)]" style={{ width: `${86 - i * 11}%` }} />
                  <span className="block h-1 rounded-full bg-[var(--ax-line)]" style={{ width: `${62 - i * 8}%` }} />
                </span>
                <span
                  className="h-1.5 w-8 shrink-0 rounded-full"
                  style={{ background: accent, opacity: 0.55 }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scanline sweep — reads as a live surface rather than a static image */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-[scan_3.2s_ease-in-out_infinite] opacity-40"
        style={{ background: `linear-gradient(180deg, ${accent}22, transparent)` }}
      />
    </div>
  );
}
