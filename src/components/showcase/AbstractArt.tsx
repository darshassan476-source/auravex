import { cn, seededRandom } from "@/lib/utils";

export type ArtVariant = "skyline" | "waves" | "mesh" | "facade";

/**
 * Card artwork. The references fill the right half of every product card with
 * a dark architectural or abstract-blue image; these are the drawn equivalents,
 * deterministic so server and client agree.
 *
 * The solid tones come from theme tokens rather than fixed hex, so a light
 * theme gets slate architecture instead of near-black slabs sitting on a
 * white page.
 *
 * Swap any card to a real photograph by passing `image` on the consumer.
 */
export function AbstractArt({
  variant,
  accent = "#3b82f6",
  seed = "auravex",
  className,
}: {
  variant: ArtVariant;
  accent?: string;
  seed?: string;
  className?: string;
}) {
  const n = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0) * 17, 11);
  const rand = seededRandom(n);
  const uid = `art-${n}`;

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.30" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={`${uid}-glow`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="50%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7c6cff" stopOpacity="0" />
          </linearGradient>
          <filter id={`${uid}-blur`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <rect width="400" height="300" fill={`url(#${uid}-sky)`} opacity="0.85" />

        {variant === "skyline" && (
          <g>
            {Array.from({ length: 16 }, (_, i) => {
              const w = 14 + rand() * 20;
              const h = 60 + rand() * 170;
              const x = i * 26 - 10 + rand() * 6;
              return (
                <g key={i}>
                  <rect x={x} y={300 - h} width={w} height={h} fill="var(--ax-art-solid)" opacity="0.92" />
                  <rect x={x} y={300 - h} width={w} height="1.2" fill={accent} opacity="0.7" />
                  {/* Window lights */}
                  {Array.from({ length: Math.floor(h / 22) }, (_, r) => (
                    <rect
                      key={r}
                      x={x + 3}
                      y={300 - h + 10 + r * 22}
                      width={w - 6}
                      height="2.5"
                      fill={accent}
                      opacity={0.14 + rand() * 0.3}
                    />
                  ))}
                </g>
              );
            })}
            <rect x="0" y="286" width="400" height="14" fill="var(--ax-art-deep)" opacity="0.8" />
          </g>
        )}

        {variant === "waves" && (
          <g>
            {Array.from({ length: 5 }, (_, i) => (
              <path
                key={i}
                d={`M -20 ${230 - i * 26} C 90 ${170 - i * 30}, 200 ${260 - i * 18}, 420 ${140 - i * 26}`}
                stroke={`url(#${uid}-glow)`}
                strokeWidth={i === 2 ? 2.4 : 1.3}
                fill="none"
                filter={i === 2 ? `url(#${uid}-blur)` : undefined}
              />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <path
                key={`s-${i}`}
                d={`M -20 ${230 - i * 26} C 90 ${170 - i * 30}, 200 ${260 - i * 18}, 420 ${140 - i * 26}`}
                stroke={`url(#${uid}-glow)`}
                strokeWidth="0.9"
                fill="none"
              />
            ))}
          </g>
        )}

        {variant === "mesh" && (
          <g>
            {(() => {
              const pts = Array.from({ length: 22 }, () => ({
                x: rand() * 400,
                y: rand() * 300,
              }));
              return (
                <>
                  {pts.map((p, i) =>
                    pts.slice(i + 1).map((q, j) => {
                      const d = Math.hypot(p.x - q.x, p.y - q.y);
                      if (d > 95) return null;
                      return (
                        <line
                          key={`${i}-${j}`}
                          x1={p.x}
                          y1={p.y}
                          x2={q.x}
                          y2={q.y}
                          stroke={accent}
                          strokeWidth="0.5"
                          opacity={0.32 - d / 500}
                        />
                      );
                    }),
                  )}
                  {pts.map((p, i) => (
                    <g key={`p-${i}`}>
                      <circle cx={p.x} cy={p.y} r="6" fill={accent} opacity="0.10" />
                      <circle cx={p.x} cy={p.y} r="1.8" fill={accent} opacity="0.9" />
                    </g>
                  ))}
                </>
              );
            })()}
          </g>
        )}

        {variant === "facade" && (
          <g>
            {Array.from({ length: 9 }, (_, r) =>
              Array.from({ length: 12 }, (_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={c * 34 + 4}
                  y={r * 34 + 4}
                  width="28"
                  height="28"
                  rx="2"
                  fill={accent}
                  opacity={0.04 + rand() * 0.26}
                />
              )),
            )}
            <path
              d="M -20 300 L 200 40 L 420 300 Z"
              fill={accent}
              opacity="0.08"
            />
          </g>
        )}
      </svg>

      {/* Depth: darken toward the card's content side */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--ax-bg-elevated)_0%,rgba(7,13,28,0.86)_30%,rgba(7,13,28,0.32)_70%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(4,7,15,0.85)_100%)]" />
    </div>
  );
}
