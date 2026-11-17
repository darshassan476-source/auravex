"use client";

import Link from "next/link";
import { useText } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { useTextList } from "@/cms/useTextList";
import { RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { Icon } from "@/components/ui/Icon";
import { INDUSTRIES } from "@/data/enterprise";

/** Words too common to tie an industry to a product on their own. */
const STOP = new Set(["and", "the", "for", "public", "sector", "delivery", "development"]);

/**
 * Whether a product lists this industry. Matches on the editable industry
 * name and the shipped one, so renaming in the portal does not drop links.
 * A product with no `industries` set is never matched: nothing is guessed.
 */
function serves(productIndustries: string[] | undefined, names: string[]): boolean {
  if (!productIndustries?.length) return false;
  const tags = productIndustries.map((t) => t.toLowerCase());
  return names.some((name) => {
    const n = name.toLowerCase().trim();
    if (!n) return false;
    if (tags.some((t) => t.includes(n) || n.includes(t))) return true;
    // "Healthcare and Hospitals" also matches a product tagged "Healthcare".
    const words = n.split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP.has(w));
    return words.some((w) => tags.some((t) => t.split(/[^a-z]+/).includes(w)));
  });
}

export function IndustryList() {
  const items = useTextList("ex.industry", INDUSTRIES.length, ["title", "body"] as const);
  const relevantLabel = useText("ex.industries.relevant");
  const none = useText("ex.industries.none");
  const catalogue = useCatalogue();

  return (
    <RevealGroup className="flex flex-col gap-4" stagger={0.07}>
      {INDUSTRIES.map((industry, i) => {
        const products = catalogue.filter((p) => serves(p.industries, [items[i].title, industry.title]));
        return (
          <RevealItem key={industry.slug}>
            <article
              id={industry.slug}
              className="ax-glass grid scroll-mt-28 gap-8 rounded-2xl p-7 md:p-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14"
            >
              <div className="flex flex-col gap-4">
                <span className="grid size-12 place-items-center rounded-xl bg-[rgba(var(--ax-glow),0.1)] text-[var(--ax-accent-soft)] ring-1 ring-inset ring-[rgba(var(--ax-glow),0.22)]">
                  <Icon name={industry.icon} className="size-[22px]" strokeWidth={1.7} />
                </span>
                <h2 className="ax-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight">{items[i].title}</h2>
                <p className="ax-text-pretty max-w-[52ch] text-[15px] leading-relaxed text-[var(--ax-ink-muted)]">
                  {items[i].body}
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-[var(--ax-line)] pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-ink-dim)]">
                  {relevantLabel}
                </span>
                {products.length ? (
                  <ul className="flex flex-col gap-2">
                    {products.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/products/${p.slug}`}
                          className="ax-focus group flex items-center justify-between gap-4 rounded-xl border border-[var(--ax-line)] px-4 py-3 transition-colors hover:border-[var(--ax-line-strong)]"
                        >
                          <span className="flex flex-col">
                            <span className="text-[14.5px] font-medium text-[var(--ax-ink)]">{p.name}</span>
                            <span className="text-[12.5px] text-[var(--ax-ink-dim)]">{p.tagline}</span>
                          </span>
                          <Icon
                            name="arrow-right"
                            className="size-4 shrink-0 text-[var(--ax-ink-dim)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--ax-accent-soft)]"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13.5px] text-[var(--ax-ink-muted)]">
                    <Link href="/contact" className="ax-focus underline underline-offset-4 hover:text-[var(--ax-ink)]">
                      {none}
                    </Link>
                  </p>
                )}
              </div>
            </article>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
