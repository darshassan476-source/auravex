import type { ReactNode } from "react";
import { Reveal } from "../fx/Reveal";
import { EyebrowPill } from "../ui/EyebrowPill";
import { cn } from "@/lib/utils";

/**
 * Section header used throughout the references: eyebrow pill, a two-line
 * heading whose closing phrase is accented, a description set in its own
 * column, and an outline action pushed to the right.
 */
export function SectionHead({
  eyebrow,
  title,
  accent,
  description,
  action,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-7", className)}>
      <Reveal direction="fade" duration={0.6}>
        <EyebrowPill trail={false}>{eyebrow}</EyebrowPill>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end lg:gap-12">
        <Reveal delay={0.05}>
          <h2 className="ax-display ax-text-balance text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.06]">
            {title}
            {accent && (
              <>
                {" "}
                <span className="ax-gradient-text">{accent}</span>
              </>
            )}
          </h2>
        </Reveal>

        {description && (
          <Reveal delay={0.1}>
            <p className="ax-text-pretty max-w-[40ch] text-[14.5px] leading-relaxed text-[var(--ax-ink-muted)]">
              {description}
            </p>
          </Reveal>
        )}

        {action && (
          <Reveal delay={0.15} className={description ? "" : "lg:col-start-3"}>
            <div className="shrink-0">{action}</div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
