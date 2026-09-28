import { SECTORS_SERVED } from "@/data/site";

/**
 * Infinite sector rail. The list is duplicated so the CSS marquee
 * (-50% translate) loops without a visible seam.
 */
export function ClientMarquee({ label = "The sectors we build for, every day" }) {
  return (
    <section className="relative border-y border-[var(--ax-line)] py-12">
      <div className="ax-container flex flex-col gap-7">
        <p className="ax-eyebrow text-center">{label}</p>

        <div className="ax-mask-edges relative overflow-hidden">
          <div className="flex w-max animate-[marquee_38s_linear_infinite] items-center gap-16 pr-16">
            {[...SECTORS_SERVED, ...SECTORS_SERVED].map((sector, i) => (
              <span
                key={`${sector}-${i}`}
                className="flex shrink-0 items-center gap-3 whitespace-nowrap text-[17px] font-medium text-[var(--ax-ink-dim)] transition-colors duration-300 hover:text-[var(--ax-ink-muted)] md:text-[19px]"
              >
                <span className="size-1.5 rounded-full bg-[var(--ax-accent)] opacity-50" />
                {sector}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
