"use client";

import Link from "next/link";
import { RevealItem } from "@/components/fx/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Primitives";
import { Text } from "@/cms/Text";
import { useSolutions } from "@/cms/useSolutions";

/** The first four solutions on the home page, with their portal copy applied. */
export function HomeSolutionCards() {
  const solutions = useSolutions();
  return (
    <>
          {solutions.slice(0, 4).map((solution) => (
            <RevealItem key={solution.id}>
              <Link
                href={`/solutions#${solution.slug}`}
                className="ax-glass ax-focus group flex h-full items-start gap-5 rounded-2xl p-6 transition-all duration-500 hover:border-[var(--ax-line-strong)] md:p-7"
              >
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)] transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(var(--ax-glow),0.24), rgba(var(--ax-glow),0.06))",
                    boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.24)",
                  }}
                >
                  <Icon name={solution.icon} className="size-5" strokeWidth={1.8} />
                </span>

                <span className="flex min-w-0 flex-1 flex-col gap-3">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="text-[18px] font-semibold text-[var(--ax-ink)]">
                      {solution.name}
                    </span>
                    <Tag>{solution.category}</Tag>
                  </span>

                  <span className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                    {solution.description}
                  </span>

                  <span className="mt-1 flex flex-col gap-1.5">
                    {solution.bullets.map((bullet, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-2 text-[12.5px] text-[var(--ax-ink-dim)]"
                      >
                        <Icon
                          name="check-circle"
                          className="size-3.5 shrink-0 text-[var(--ax-accent)]"
                          strokeWidth={2.1}
                        />
                        {bullet}
                      </span>
                    ))}
                  </span>

                  <span className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--ax-accent-soft)]">
                    <Text id="home.solutions.cardLink" />
                    <Icon
                      name="arrow-right"
                      className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2.3}
                    />
                  </span>
                </span>
              </Link>
            </RevealItem>
          ))}
    </>
  );
}
