"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useText } from "@/cms/CmsProvider";
import { Text } from "@/cms/Text";
import { useProduct } from "@/cms/useProduct";
import { Reveal, RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { FilmPlate } from "@/components/sections/FilmPlate";
import { Icon } from "@/components/ui/Icon";

import { resolveBackground } from "@/data/backgrounds";
import type { Product } from "@/lib/types";
import { useTheme } from "@/themes/ThemeProvider";
import { fillTemplate } from "./TemplateText";

/**
 * The Overview band from reference 3 — the section directly under the stat
 * cards on a product page.
 *
 * Four columns: the positioning copy, a selectable capability list where the
 * active item carries the product accent, a video plate cut from the same
 * environment photography as the hero, and a closing statement panel.
 */
export function ProductOverview({ product: source }: { product: Product }) {
  // The portal may have attached a film, renamed the product or changed its accent.
  const product = useProduct(source);
  const film = product.video?.src?.startsWith("/api/media/") ? product.video : undefined;
  // The reference has the second item lit, which reads better than the first:
  // it shows the list is selectable rather than merely ordered.
  const [active, setActive] = useState(product.features.length > 1 ? 1 : 0);

  const { theme, ready } = useTheme();
  const mode = ready ? theme.mode : "dark";
  // A different room from the hero above it — the same photograph twice on
  // one page reads as a placeholder.
  const plate = resolveBackground("dark-hero-06", mode);

  // "Real Estate & Property Tech" → "Real Estate"
  const domain = product.sector.split(/[&·,]/)[0].trim();
  const vars = { name: product.name, domain, summary: product.summary };
  const fallbackCaption = fillTemplate(useText("product.overview.caption"), vars);
  const caption = product.video?.caption ?? fallbackCaption;
  const title = fillTemplate(useText("product.overview.title"), vars);
  const body = fillTemplate(useText("product.overview.body"), vars);
  const statement = fillTemplate(useText("product.overview.statement"), vars);
  const values = [
    useText("product.overview.values.1"),
    useText("product.overview.values.2"),
    useText("product.overview.values.3"),
  ];
  const videoHref = product.links.caseStudy ?? product.links.demo ?? "/contact";

  return (
    <section id="film" className="relative py-14 md:py-16 lg:py-20">
      <div className="ax-container">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-7">
          {/* ---------------- Copy ---------------- */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            <Reveal direction="fade" duration={0.6}>
              <span className="inline-flex items-center gap-3">
                <span className="h-px w-7 bg-[var(--ax-line-strong)]" />
                <span className="ax-eyebrow"><Text id="product.overview.eyebrow" /></span>
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="ax-display ax-text-balance text-[clamp(1.7rem,2.5vw,2.25rem)] leading-[1.1]">
                <span className="whitespace-pre-line">{title}</span>
                <br />
                <span className="ax-gradient-text"><Text id="product.overview.accent" /></span>
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="ax-text-pretty text-[14.5px] leading-[1.75] text-[var(--ax-ink-muted)]">
                {body}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <Link
                href={product.links.demo ?? "/contact"}
                className="ax-focus group inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--ax-accent-soft)]"
              >
                <Text id="product.overview.link" />
                <Icon
                  name="arrow-right"
                  className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                  strokeWidth={2.1}
                />
              </Link>
            </Reveal>
          </div>

          {/* ---------------- Capability list ---------------- */}
          <RevealGroup className="flex flex-col gap-3 lg:col-span-3" stagger={0.07}>
            {product.features.map((feature, i) => {
              const isActive = i === active;
              return (
                <RevealItem key={feature.title} direction="left">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-pressed={isActive}
                    className="ax-focus ax-glass flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all duration-500 hover:border-[var(--ax-line-strong)]"
                    style={
                      isActive
                        ? {
                            borderColor: `${product.accent}80`,
                            background: `linear-gradient(135deg, ${product.accent}1f, ${product.accent}08)`,
                            boxShadow: `0 0 0 1px ${product.accent}40, 0 18px 46px -22px ${product.accent}9e`,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-500"
                      style={{
                        background: isActive
                          ? `linear-gradient(145deg, ${product.accent}66, ${product.accent}1a)`
                          : `linear-gradient(145deg, ${product.accent}2b, ${product.accent}0a)`,
                        boxShadow: `inset 0 0 0 1px ${product.accent}${isActive ? "70" : "33"}`,
                      }}
                    >
                      <Icon
                        name={feature.icon}
                        className="size-[18px]"
                        strokeWidth={1.8}
                        style={{ color: product.accent }}
                      />
                    </span>

                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[14.5px] font-semibold leading-tight text-[var(--ax-ink)]">
                        {feature.title}
                      </span>
                      <span className="ax-text-pretty text-[12.5px] leading-snug text-[var(--ax-ink-muted)]">
                        {feature.description}
                      </span>
                    </span>
                  </button>
                </RevealItem>
              );
            })}
          </RevealGroup>

          {/* ---------------- Video plate ---------------- */}
          <Reveal direction="scale" delay={0.1} className="lg:col-span-4">
            {film ? (
              <FilmPlate video={film} accent={product.accent} caption={caption} />
            ) : (
            <Link
              href={videoHref}
              className="ax-focus group relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-[var(--ax-line)] transition-colors duration-500 hover:border-[var(--ax-line-strong)]"
              style={{ backgroundColor: plate.tint }}
            >
              <Image
                src={plate.src}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 34vw"
                quality={82}
                className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                style={{ objectPosition: plate.position }}
              />

              <span
                aria-hidden
                className={
                  mode === "dark"
                    ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,15,0.34),rgba(4,7,15,0.62))]"
                    : "absolute inset-0 bg-[linear-gradient(180deg,rgba(246,248,253,0.28),rgba(246,248,253,0.58))]"
                }
              />

              <span className="relative flex flex-col items-center gap-5 px-6 text-center">
                <span className="relative grid size-[62px] place-items-center rounded-full border border-[var(--ax-line-strong)] bg-[var(--ax-bg)]/55 text-[var(--ax-ink)] backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                  <span
                    aria-hidden
                    className="absolute size-[62px] animate-[pulse-ring_2.8s_ease-out_infinite] rounded-full"
                    style={{ boxShadow: `0 0 0 1px ${product.accent}66` }}
                  />
                  <Icon name="play" className="ml-0.5 size-5" strokeWidth={2.2} />
                </span>
                <span className="ax-display max-w-[16ch] text-[19px] leading-snug text-[var(--ax-ink)]">
                  {caption}
                </span>
              </span>
            </Link>
            )}
          </Reveal>

          {/* ---------------- Statement ---------------- */}
          <Reveal direction="left" delay={0.16} className="lg:col-span-2">
            <div className="ax-glass ax-edge-light flex h-full flex-col justify-center gap-6 rounded-2xl p-7">
              <h3 className="ax-display text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.24]">
                {statement}{" "}
                <span className="ax-gradient-text"><Text id="product.overview.statementAccent" /></span>
              </h3>

              <span className="h-px w-16 bg-[var(--ax-line-strong)]" />

              <ul className="flex flex-col gap-2.5 text-[13.5px] text-[var(--ax-ink-muted)]">
                {values.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
