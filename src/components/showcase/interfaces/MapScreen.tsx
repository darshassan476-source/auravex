import { Icon } from "@/components/ui/Icon";
import { seededRandom } from "@/lib/utils";

/**
 * Geospatial portfolio view — a map canvas with asset pins and a side panel.
 *
 * This is what a property platform looks like when you open it, and it is
 * visibly a different kind of software from a chart dashboard.
 */

const ASSETS = [
  { name: "Marina Heights", value: "AED 2.8B", occ: 98, tone: "var(--ax-success)" },
  { name: "Dubai Hills", value: "AED 1.9B", occ: 94, tone: "var(--ax-accent)" },
  { name: "Bluewaters", value: "AED 1.4B", occ: 91, tone: "var(--ax-success)" },
  { name: "Creek Harbour", value: "AED 3.2B", occ: 76, tone: "var(--ax-warning)" },
];

/** Stable pin scatter — seeded so server and client agree. */
const rand = seededRandom(20260926);
const PINS = Array.from({ length: 14 }, () => ({
  x: 8 + rand() * 84,
  y: 12 + rand() * 74,
  r: 2 + rand() * 4,
}));

export function MapScreen({ accent = "var(--ax-accent)" }: { accent?: string }) {
  return (
    <div className="flex h-full bg-[var(--ax-bg-elevated)] text-[var(--ax-ink)]">
      {/* Map canvas */}
      <div className="relative flex-1 overflow-hidden">
        {/* Land / water blocks, drawn rather than gridded */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <defs>
            <linearGradient id="map-water" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.16" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#map-water)" />
          <path
            d="M0,62 C18,54 28,68 44,60 C58,53 66,64 80,56 L100,60 L100,100 L0,100 Z"
            fill="rgba(var(--ax-glow),0.10)"
          />
          <path
            d="M0,74 C22,68 34,80 52,72 C68,65 80,76 100,70 L100,100 L0,100 Z"
            fill="rgba(var(--ax-glow),0.07)"
          />
          {/* Roads */}
          {[22, 44, 66].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y - 6}
              stroke="rgba(var(--ax-glow),0.18)"
              strokeWidth="0.4"
            />
          ))}
          {[30, 58, 82].map((x) => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x - 5}
              y2="100"
              stroke="rgba(var(--ax-glow),0.14)"
              strokeWidth="0.35"
            />
          ))}
        </svg>

        {/* Pins */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          {PINS.map((pin, i) => (
            <g key={i}>
              <circle cx={pin.x} cy={pin.y} r={pin.r * 2.4} fill={accent} opacity="0.12" />
              <circle cx={pin.x} cy={pin.y} r={pin.r * 0.5} fill={accent} />
            </g>
          ))}
        </svg>

        {/* Floating callout on the map */}
        <div className="absolute left-[16%] top-[22%] rounded-lg border border-[var(--ax-line-strong)] bg-[var(--ax-bg)]/85 px-2.5 py-1.5 backdrop-blur">
          <span className="block text-[9.5px] font-semibold text-[var(--ax-ink)]">
            Downtown District
          </span>
          <span className="block text-[8px] text-[var(--ax-ink-dim)]">
            AED 4.2B · 12 properties
          </span>
        </div>

        {/* Map controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1">
          {["plus", "search", "layers"].map((icon) => (
            <span
              key={icon}
              className="grid size-6 place-items-center rounded-md border border-[var(--ax-line)] bg-[var(--ax-bg)]/80 text-[var(--ax-ink-muted)] backdrop-blur"
            >
              <Icon name={icon} className="size-3" strokeWidth={2} />
            </span>
          ))}
        </div>

        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {["Satellite", "Heatmap", "Zoning"].map((chip, i) => (
            <span
              key={chip}
              className="rounded-full border border-[var(--ax-line)] bg-[var(--ax-bg)]/80 px-2 py-1 text-[8.5px] backdrop-blur"
              style={i === 1 ? { borderColor: accent, color: accent } : undefined}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <aside className="flex w-[38%] shrink-0 flex-col border-l border-[var(--ax-line)]">
        <div className="flex items-center justify-between border-b border-[var(--ax-line)] px-3 py-2.5">
          <span className="text-[11px] font-semibold">Portfolio</span>
          <span className="text-[8.5px] text-[var(--ax-ink-dim)]">320 assets</span>
        </div>

        <div className="flex flex-col gap-1.5 border-b border-[var(--ax-line)] p-3">
          <span className="text-[8.5px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">
            Total value
          </span>
          <span className="ax-display text-[19px] leading-none">AED 12.4B</span>
          <span className="flex items-center gap-1 text-[8.5px] text-[var(--ax-success)]">
            <Icon name="trending" className="size-2.5" strokeWidth={2.4} />
            +12% year on year
          </span>
        </div>

        <div className="flex flex-1 flex-col">
          {ASSETS.map((asset) => (
            <div
              key={asset.name}
              className="flex items-center gap-2 border-b border-[var(--ax-line)] px-3 py-2 last:border-0"
            >
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: asset.tone }} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[9.5px] font-medium text-[var(--ax-ink)]">
                  {asset.name}
                </span>
                <span className="font-mono text-[8px] text-[var(--ax-ink-dim)]">
                  {asset.value}
                </span>
              </span>
              <span className="shrink-0 text-[9px] text-[var(--ax-ink-muted)]">{asset.occ}%</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
