import { Reveal } from "../fx/Reveal";
import { Hairline, Section } from "../ui/Primitives";
import { PageHero } from "./PageHero";

export interface LegalSection {
  heading: string;
  body: string[];
}

/** Shared layout for the privacy and terms pages. */
export function LegalPage({
  eyebrow,
  title,
  accent,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} accent={accent} description={intro}>
        <p className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-[var(--ax-ink-dim)]">
          Last updated · {updated}
        </p>
      </PageHero>

      <Section className="pt-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {sections.map((section, i) => (
            <Reveal key={section.heading} delay={i * 0.04}>
              <article className="flex flex-col gap-4">
                <h2 className="flex items-baseline gap-3 text-[20px] font-semibold text-[var(--ax-ink)]">
                  <span className="font-mono text-[12px] text-[var(--ax-accent-soft)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                <Hairline />
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="ax-text-pretty text-[14.5px] leading-relaxed text-[var(--ax-ink-muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
