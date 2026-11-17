import { cn } from "@/lib/utils";

/** A second hue for each product's atmosphere, so no two look alike. */
const PARTNER: Record<string, string> = {
  "ai-dms": "#22d3ee",
  "aldar-sustainability-platform": "#84cc16",
  "enterprise-agentos": "#ec4899",
  "vantage-enterprise": "#6366f1",
  "enterprise-dashboards": "#ef4444",
  "buildsphere-ai": "#6366f1",
};

export function partnerHue(slug: string, accent: string): string {
  return PARTNER[slug] ?? accent;
}

/**
 * The light a product sits in: two slowly drifting pools of its own colours
 * and a turning halo behind the screen. Purely decorative.
 */
export function ProductAura({
  slug,
  accent,
  className,
  intensity = 1,
}: {
  slug: string;
  accent: string;
  className?: string;
  intensity?: number;
}) {
  const partner = partnerHue(slug, accent);
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span
        className="absolute -left-[10%] top-[5%] h-[80%] w-[60%] rounded-full blur-[90px]"
        style={{
          background: accent,
          opacity: 0.32 * intensity,
          animation: "ax-drift 14s ease-in-out infinite",
        }}
      />
      <span
        className="absolute -right-[8%] bottom-[-10%] h-[75%] w-[55%] rounded-full blur-[100px]"
        style={{
          background: partner,
          opacity: 0.22 * intensity,
          animation: "ax-drift 17s ease-in-out -6s infinite",
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-[40px]"
        style={{
          background: `conic-gradient(from 0deg, ${accent}, transparent 30%, ${partner} 55%, transparent 80%, ${accent})`,
          animation: "ax-spin 40s linear infinite",
        }}
      />
    </div>
  );
}

/**
 * BuildSphere's signature: a tower drawn as a construction blueprint,
 * standing behind its screen. Decorative only.
 */
export function BlueprintTower({ accent, className }: { accent: string; className?: string }) {
  const floors = 22;
  return (
    <svg viewBox="0 0 200 420" className={cn("pointer-events-none", className)} aria-hidden>
      <defs>
        <linearGradient id="bp-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fecaca" stopOpacity="1" />
          <stop offset="1" stopColor={accent} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#bp-fade)" strokeWidth="1.6">
        {/* podium */}
        <path d="M20 400 L20 350 L180 350 L180 400" />
        <path d="M20 375 L180 375" opacity="0.6" />
        {/* tower */}
        <path d="M55 350 L60 40 L140 40 L145 350" />
        <path d="M100 40 L100 14 M92 22 L108 22" />
        {Array.from({ length: floors }, (_, i) => {
          const y = 350 - ((i + 1) * 310) / (floors + 1);
          const inset = ((350 - y) / 310) * 5;
          return <path key={i} d={`M${55 + inset} ${y} L${145 - inset} ${y}`} opacity={0.55 + (i % 4 === 0 ? 0.45 : 0)} />;
        })}
        {[75, 100, 125].map((x) => (
          <path key={x} d={`M${x} 350 L${x} 40`} opacity="0.45" strokeDasharray="3 5" />
        ))}
        {/* dimension lines */}
        <path d="M168 40 L168 350 M163 40 L173 40 M163 350 L173 350" opacity="0.5" />
        <path d="M55 384 L145 384" opacity="0.4" strokeDasharray="2 3" />
      </g>
    </svg>
  );
}
