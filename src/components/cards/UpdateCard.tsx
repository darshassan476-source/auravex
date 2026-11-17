"use client";

import Link from "next/link";
import { useCms } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { UPDATE_KIND_LABELS, type PublicUpdate } from "@/lib/enterprise";
import { cn } from "@/lib/utils";

/** "17 November 2026", fixed to UTC so server and browser render the same text. */
function formatDate(iso: string) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * One Latest Update: what kind of news it is, when, which product it concerns,
 * and the announcement itself. `compact` drops the image and the long body,
 * for the home page strip.
 */
export function UpdateCard({ update, compact }: { update: PublicUpdate; compact?: boolean }) {
  const { state } = useCms();
  const catalogue = useCatalogue();
  const product = update.productSlug ? catalogue.find((p) => p.slug === update.productSlug) : undefined;
  const image = !compact && update.imageId ? state.media.find((m) => m.id === update.imageId) : undefined;
  const date = formatDate(update.date);

  return (
    <article
      className={cn(
        "ax-glass flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-500 hover:border-[var(--ax-line-strong)]",
        update.featured && "border-[rgba(var(--ax-glow),0.35)]",
      )}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={update.title}
          className="aspect-[16/9] w-full border-b border-[var(--ax-line)] object-cover"
          loading="lazy"
        />
      )}

      <div className={cn("flex flex-1 flex-col gap-4", compact ? "p-6" : "p-7")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span className="text-[var(--ax-accent-soft)]">{UPDATE_KIND_LABELS[update.kind] ?? "Update"}</span>
          {update.featured && (
            <span className="rounded-full border border-[rgba(var(--ax-glow),0.35)] px-2 py-0.5 text-[10px] text-[var(--ax-ink)]">
              Featured
            </span>
          )}
          {date && (
            <time dateTime={update.date} className="font-medium normal-case tracking-normal text-[var(--ax-ink-dim)]">
              {date}
            </time>
          )}
        </div>

        <h3 className={cn("ax-text-balance font-semibold leading-snug text-[var(--ax-ink)]", compact ? "text-[17px]" : "text-[20px]")}>
          {update.title}
        </h3>

        <p className="ax-text-pretty text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">{update.summary}</p>

        {!compact && update.body && (
          <p className="ax-text-pretty whitespace-pre-line text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">
            {update.body}
          </p>
        )}

        {product && (
          <Link
            href={`/products/${product.slug}`}
            className="ax-focus mt-auto inline-flex w-fit items-center gap-1.5 pt-2 text-[13px] font-medium text-[var(--ax-accent-soft)] transition-colors hover:text-[var(--ax-accent)]"
          >
            {product.name} →
          </Link>
        )}
      </div>
    </article>
  );
}
