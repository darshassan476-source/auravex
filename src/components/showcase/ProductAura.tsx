import { cn } from "@/lib/utils";

/**
 * A lighter tint of each product's own colour, used for gradients and the
 * second pool of light. Staying in one colour family keeps every product
 * calm and distinct instead of rainbow-like.
 */
const PARTNER: Record<string, string> = {
  "ai-dms": "#a5b4fc",
  "aldar-sustainability-platform": "#6ee7b7",
  "enterprise-agentos": "#c4b5fd",
  "vantage-enterprise": "#7dd3fc",
  "enterprise-dashboards": "#fcd34d",
  "buildsphere-ai": "#fca5a5",
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
          opacity: 0.16 * intensity,
          animation: "ax-drift 14s ease-in-out infinite",
        }}
      />
      <span
        className="absolute -right-[8%] bottom-[-10%] h-[75%] w-[55%] rounded-full blur-[100px]"
        style={{
          background: partner,
          opacity: 0.1 * intensity,
          animation: "ax-drift 17s ease-in-out -6s infinite",
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] blur-[50px]"
        style={{
          background: `conic-gradient(from 0deg, ${accent}, transparent 30%, ${partner} 55%, transparent 80%, ${accent})`,
          animation: "ax-spin 40s linear infinite",
        }}
      />
    </div>
  );
}
