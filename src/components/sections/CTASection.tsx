import type { ReactNode } from "react";
import { Text } from "@/cms/Text";
import { SiteEmailLink } from "../layout/SiteEmail";
import { Reveal } from "../fx/Reveal";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Primitives";

interface CTASectionProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  primaryLabel?: ReactNode;
  primaryHref?: string;
  secondaryLabel?: ReactNode;
  secondaryHref?: string;
}

/**
 * The closing conversion block, repeated at the foot of every marketing page.
 * Defaults come from the admin-editable copy store; pages that want their own
 * wording pass it in and override that.
 */
export function CTASection({
  eyebrow = <Text id="cta.eyebrow" />,
  title = <Text id="cta.title" />,
  accent = <Text id="cta.accent" />,
  description = <Text id="cta.body" />,
  primaryLabel = <Text id="cta.primary" />,
  primaryHref = "/contact",
  secondaryLabel = <Text id="cta.secondary" />,
  secondaryHref = "/products",
}: CTASectionProps) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="ax-container">
        <Reveal direction="scale">
          <div className="ax-glass-strong ax-edge-light ax-halo relative overflow-hidden rounded-[28px] px-7 py-16 text-center md:px-16 md:py-24">
            <div className="ax-grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]" />

            <div className="relative flex flex-col items-center gap-7">
              <Eyebrow>{eyebrow}</Eyebrow>

              <h2 className="ax-display ax-text-balance max-w-3xl text-[clamp(2.1rem,4.6vw,3.8rem)]">
                {title} <span className="ax-gradient-text">{accent}</span>
              </h2>

              <p className="ax-text-pretty max-w-xl text-[15.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                {description}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Button href={primaryHref} size="lg" icon="arrow-right">
                  {primaryLabel}
                </Button>
                <Button href={secondaryHref} size="lg" variant="secondary" icon="grid" iconPosition="left">
                  {secondaryLabel}
                </Button>
              </div>

              <p className="mt-3 text-[12.5px] text-[var(--ax-ink-dim)]">
                <Text id="cta.emailLead" />{" "}
                <SiteEmailLink className="ax-focus font-medium text-[var(--ax-accent-soft)] transition-colors hover:text-[var(--ax-accent)]" />
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
