import { Icon } from "@/components/ui/Icon";
import { cn, sparklineArea, sparklinePath, seededRandom } from "@/lib/utils";

/**
 * The small laptop that sits inside each card in the product gallery.
 * Lighter than the hero device — enough UI to read as a real product shot
 * at card scale, without the cost of the full dashboard.
 */
export function MiniDevice({
  accent,
  seed,
  variant = "dashboard",
  className,
}: {
  accent: string;
  seed: string;
  variant?: "dashboard" | "table" | "flow" | "map" | "kiosk" | "console";
  className?: string;
}) {
  const n = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0) * 13, 5);
  const rand = seededRandom(n);
  const series = Array.from({ length: 12 }, (_, i) => 26 + rand() * 44 + i * 2.6);

  return (
    <div className={cn("relative", className)}>
      {/* Glow under the device */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -top-4 bottom-2 rounded-[40%] opacity-60 blur-2xl"
        style={{ background: `radial-gradient(50% 50% at 50% 50%, ${accent}66, transparent 70%)` }}
      />

      <div className="relative">
        <div
          className="rounded-[7px] p-[4px] shadow-[0_18px_44px_-16px_rgba(0,0,0,0.85)]"
          style={{ background: "linear-gradient(160deg,#2a3242,#0b0e16)" }}
        >
          <div className="overflow-hidden rounded-[4px] bg-[#070c16]">
            {/* Chrome */}
            <div className="flex items-center gap-1 border-b border-white/5 px-2 py-1">
              <span className="size-1 rounded-full bg-white/25" />
              <span className="size-1 rounded-full bg-white/15" />
              <span className="ml-auto h-1 w-8 rounded-full bg-white/10" />
            </div>

            <div className="flex gap-1.5 p-1.5">
              {/* Rail */}
              <div className="flex w-6 shrink-0 flex-col gap-1 rounded-[3px] bg-white/[0.03] p-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1 rounded-full"
                    style={{ background: i === 0 ? accent : "rgba(255,255,255,0.12)" }}
                  />
                ))}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {variant === "dashboard" && (
                  <>
                    <div className="grid grid-cols-3 gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="rounded-[3px] bg-white/[0.04] p-1">
                          <span className="block h-[2px] w-3 rounded-full bg-white/20" />
                          <span
                            className="mt-1 block h-[3px] rounded-full"
                            style={{ width: `${56 + i * 12}%`, background: accent, opacity: 0.8 }}
                          />
                        </div>
                      ))}
                    </div>
                    <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="h-10 w-full" aria-hidden>
                      <defs>
                        <linearGradient id={`md-${n}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
                          <stop offset="100%" stopColor={accent} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={sparklineArea(series, 100, 34)} fill={`url(#md-${n})`} />
                      <path
                        d={sparklinePath(series, 100, 34)}
                        fill="none"
                        stroke={accent}
                        strokeWidth="1.3"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </>
                )}

                {variant === "table" && (
                  <div className="flex flex-col gap-[3px]">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-1 rounded-[2px] bg-white/[0.03] px-1 py-[3px]">
                        <span className="size-1 shrink-0 rounded-full" style={{ background: accent }} />
                        <span className="h-[2px] flex-1 rounded-full bg-white/15" />
                        <span
                          className="h-[2px] w-4 shrink-0 rounded-full"
                          style={{ background: accent, opacity: 0.7 }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {variant === "flow" && (
                  <svg viewBox="0 0 100 54" className="h-[54px] w-full" aria-hidden>
                    {[
                      [16, 12], [50, 12], [84, 12],
                      [33, 34], [67, 34], [50, 50],
                    ].map(([x, y], i) => (
                      <g key={i}>
                        <rect
                          x={x - 9}
                          y={y - 5}
                          width="18"
                          height="10"
                          rx="2.5"
                          fill={accent}
                          opacity={i === 0 ? 0.55 : 0.2}
                        />
                      </g>
                    ))}
                    {[
                      [16, 17, 33, 29], [50, 17, 33, 29], [50, 17, 67, 29],
                      [84, 17, 67, 29], [33, 39, 50, 45], [67, 39, 50, 45],
                    ].map(([x1, y1, x2, y2], i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="0.6" opacity="0.5" />
                    ))}
                  </svg>
                )}

                {variant === "kiosk" && (
                  <div className="flex flex-col gap-1">
                    <span
                      className="h-[3px] w-10 rounded-full"
                      style={{ background: accent, opacity: 0.85 }}
                    />
                    <div className="flex items-center gap-1.5 rounded-[3px] p-1" style={{ background: `${accent}18` }}>
                      <span className="grid size-5 shrink-0 grid-cols-4 gap-[1px] rounded-[2px] bg-black/40 p-[2px]">
                        {Array.from({ length: 16 }, (_, i) => (
                          <span
                            key={i}
                            className="rounded-[0.5px]"
                            style={{ background: i % 3 === 0 ? accent : "transparent" }}
                          />
                        ))}
                      </span>
                      <span className="flex flex-1 flex-col gap-[3px]">
                        <span className="block h-[3px] w-full rounded-full bg-white/22" />
                        <span className="block h-[2px] w-2/3 rounded-full bg-white/12" />
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 rounded-[3px] bg-white/[0.04] p-1"
                        >
                          <span
                            className="size-2 shrink-0 rounded-[2px]"
                            style={{ background: accent, opacity: 0.6 }}
                          />
                          <span className="block h-[2px] flex-1 rounded-full bg-white/14" />
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {variant === "console" && (
                  <div className="flex flex-col gap-1 rounded-[3px] bg-black/35 p-1.5">
                    {[
                      { w: "72%", c: "rgba(255,255,255,0.20)" },
                      { w: "54%", c: "rgba(255,255,255,0.12)" },
                      { w: "84%", c: "var(--ax-success)" },
                      { w: "46%", c: "rgba(255,255,255,0.12)" },
                      { w: "66%", c: "var(--ax-success)" },
                      { w: "38%", c: accent },
                    ].map((line, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="h-[2px] w-2 shrink-0 rounded-full bg-white/10" />
                        <span
                          className="block h-[2px] rounded-full"
                          style={{ width: line.w, background: line.c }}
                        />
                      </span>
                    ))}
                    <span className="mt-0.5 flex items-center gap-1">
                      <span
                        className="size-1 animate-pulse rounded-full"
                        style={{ background: accent }}
                      />
                      <span className="block h-[2px] w-6 rounded-full" style={{ background: accent }} />
                    </span>
                  </div>
                )}

                {variant === "map" && (
                  <div className="relative h-[54px] overflow-hidden rounded-[3px] bg-white/[0.03]">
                    <svg viewBox="0 0 100 54" className="absolute inset-0 size-full" aria-hidden>
                      {Array.from({ length: 9 }, (_, i) => {
                        const x = 8 + rand() * 84;
                        const y = 8 + rand() * 38;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="4" fill={accent} opacity="0.14" />
                            <circle cx={x} cy={y} r="1.3" fill={accent} opacity="0.9" />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <span className="h-[2px] flex-1 rounded-full bg-white/10" />
                  <Icon name="arrow-right" className="size-2 text-white/25" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Base */}
        <div className="mx-auto h-[4px] w-[106%] -translate-x-[3%] rounded-b-[4px] bg-[linear-gradient(180deg,#242b39,#0a0d14)]" />
      </div>
    </div>
  );
}
