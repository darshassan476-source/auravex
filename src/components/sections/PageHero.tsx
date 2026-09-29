import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "../fx/Reveal";
import { Eyebrow } from "../ui/Primitives";
import type { BackgroundId } from "@/data/backgrounds";
import { AmbientField } from "./AmbientField";

interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Rendered below the copy — stat strips, filter rails, breadcrumb rows. */
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** Background plate id from the registry. */
  background?: BackgroundId;
}

/**
 * The shared inner-page hero. Sits under the fixed navbar, so the top
 * padding accounts for the 88px header plus breathing room.
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  actions,
  children,
  align = "left",
  className,
  background,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "ax-halo relative isolate overflow-hidden pb-16 pt-[152px] md:pb-20 md:pt-[184px]",
        className,
      )}
    >
      <AmbientField background={background} priority />

      <div className="ax-container relative">
        <div
          className={cn(
            "flex flex-col gap-7",
            align === "center" ? "items-center text-center" : "items-start",
          )}
        >
          {eyebrow && (
            <Reveal trigger="load" direction="fade" duration={0.6}>
              <Eyebrow withRule={align === "left"}>{eyebrow}</Eyebrow>
            </Reveal>
          )}

          <Reveal trigger="load" delay={0.06}>
            <h1
              className={cn(
                "ax-display ax-text-balance text-[clamp(2.6rem,6.4vw,5.2rem)]",
                align === "center" ? "max-w-4xl" : "max-w-[19ch]",
              )}
            >
              {title}
              {accent && (
                <>
                  {" "}
                  <span className="ax-gradient-text">{accent}</span>
                </>
              )}
            </h1>
          </Reveal>

          {description && (
            <Reveal trigger="load" delay={0.14}>
              <p
                className={cn(
                  "ax-text-pretty text-[16px] leading-relaxed text-[var(--ax-ink-muted)] md:text-[17px]",
                  align === "center" ? "mx-auto max-w-2xl" : "max-w-xl",
                )}
              >
                {description}
              </p>
            </Reveal>
          )}

          {actions && (
            <Reveal trigger="load" delay={0.22}>
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            </Reveal>
          )}
        </div>

        {children && <div className="relative mt-14">{children}</div>}
      </div>
    </section>
  );
}
