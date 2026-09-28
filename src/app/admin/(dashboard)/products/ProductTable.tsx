"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { EmptyState } from "@/components/admin/Primitives";
import { AX_EASE } from "@/components/fx/Reveal";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Primitives";
import { CATEGORY_LABELS, PRODUCT_FILTERS } from "@/data/products";
import type { ProductCategory } from "@/lib/types";
import { cn, formatCompact } from "@/lib/utils";

type SortKey = "name" | "views" | "year" | "status";

/**
 * Management table for the product catalogue: the bundled products with
 * their edits, plus everything created in the portal. Views are the last
 * thirty days of the site's own visit log, not a bundled number.
 */
export function ProductTable() {
  const { state, removeCustomProduct } = useCms();
  const catalogue = useCatalogue({ includeHidden: true });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("views");
  const [ascending, setAscending] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  const views = useMemo(() => {
    const cutoff = Date.now() - 30 * 86_400_000;
    const counts = new Map<string, number>();
    state.visits.forEach((v) => {
      if (Date.parse(v.at) < cutoff) return;
      const m = /^\/products\/([^/?#]+)/.exec(v.path);
      if (m) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
    });
    return counts;
  }, [state.visits]);

  const products = useMemo(
    () => catalogue.map((p) => ({ ...p, views: views.get(p.slug) ?? 0 })),
    [catalogue, views],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.sector.toLowerCase().includes(q) ||
        product.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });

    const direction = ascending ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort === "views") return (a.views - b.views) * direction;
      return String(a[sort]).localeCompare(String(b[sort])) * direction;
    });
  }, [products, query, category, sort, ascending]);

  function toggleSort(key: SortKey) {
    if (sort === key) setAscending((v) => !v);
    else {
      setSort(key);
      setAscending(key === "name");
    }
  }

  const columns: { key: SortKey | null; label: string; className?: string }[] = [
    { key: "name", label: "Product" },
    { key: null, label: "Category" },
    { key: "status", label: "Status" },
    { key: "views", label: "Views · 30d", className: "text-right" },
    { key: "year", label: "Year" },
    { key: null, label: "", className: "text-right" },
  ];

  return (
    <div className="flex flex-col">
      {/* ---------- Toolbar ---------- */}
      <div className="flex flex-col gap-4 border-b border-[var(--ax-line)] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setCategory(filter.id)}
              className={cn(
                "ax-focus rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors duration-300",
                category === filter.id
                  ? "bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-ink)] ring-1 ring-[var(--ax-line-strong)]"
                  : "text-[var(--ax-ink-dim)] hover:text-[var(--ax-ink-muted)]",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="flex h-10 shrink-0 items-center gap-2.5 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-3.5 lg:w-[260px]">
          <Icon name="search" className="size-4 shrink-0 text-[var(--ax-ink-dim)]" strokeWidth={2} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full bg-transparent text-[13px] text-[var(--ax-ink)] outline-none placeholder:text-[var(--ax-ink-dim)]"
          />
        </label>
      </div>

      {/* ---------- Table ---------- */}
      {rows.length === 0 ? (
        <EmptyState
          title="No products match that filter"
          body="Try a different category, or clear the search to see the full catalogue."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-[var(--ax-line)]">
                {columns.map((column) => (
                  <th
                    key={column.label || "actions"}
                    className={cn(
                      "px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ax-ink-dim)]",
                      column.className,
                    )}
                  >
                    {column.key ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key as SortKey)}
                        className="ax-focus inline-flex items-center gap-1.5 transition-colors hover:text-[var(--ax-ink-muted)]"
                      >
                        {column.label}
                        <Icon
                          name="chevron-down"
                          className={cn(
                            "size-3 transition-all duration-300",
                            sort === column.key
                              ? cn("text-[var(--ax-accent)]", ascending && "rotate-180")
                              : "opacity-30",
                          )}
                          strokeWidth={2.6}
                        />
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((product) => (
                  <motion.tr
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: AX_EASE }}
                    className={cn(
                      "group border-b border-[var(--ax-line)] transition-colors last:border-0 hover:bg-[rgba(var(--ax-glow),0.05)]",
                      product.hidden && "opacity-55",
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--ax-line)]"
                          style={{ background: `${product.accent}1f` }}
                        >
                          <Icon
                            name={product.icon}
                            className="size-4"
                            strokeWidth={1.8}
                            style={{ color: product.accent }}
                          />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-2 truncate text-[13.5px] font-medium text-[var(--ax-ink)]">
                            {product.name}
                            {product.custom && (
                              <span className="rounded-full border border-[var(--ax-line-strong)] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ax-ink-dim)]">
                                Added
                              </span>
                            )}
                            {product.hidden && (
                              <span className="rounded-full border border-[var(--ax-warning)]/40 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ax-warning)]">
                                Hidden
                              </span>
                            )}
                          </span>
                          <span className="truncate text-[11.5px] text-[var(--ax-ink-dim)]">
                            /products/{product.slug}
                          </span>
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-[12.5px] text-[var(--ax-ink-muted)]">
                      {CATEGORY_LABELS[product.category]}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={product.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right font-mono text-[12.5px] tabular-nums text-[var(--ax-ink-muted)]">
                      {formatCompact(product.views)}
                    </td>

                    <td className="px-5 py-3.5 text-[12.5px] text-[var(--ax-ink-dim)]">
                      {product.year}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                        <Link
                          href={`/products/${product.slug}`}
                          aria-label={`View ${product.name}`}
                          className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                        >
                          <Icon name="eye" className="size-4" strokeWidth={1.9} />
                        </Link>
                        <Link
                          href={`/admin/products/new?slug=${product.slug}`}
                          aria-label={`Edit ${product.name}`}
                          className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
                        >
                          <Icon name="pencil" className="size-4" strokeWidth={1.9} />
                        </Link>
                        {product.custom &&
                          (confirming === product.slug ? (
                            <button
                              type="button"
                              onClick={() => {
                                removeCustomProduct(product.slug);
                                setConfirming(null);
                              }}
                              className="ax-focus rounded-lg bg-[var(--ax-danger)]/14 px-2 py-1 text-[10.5px] font-semibold text-[var(--ax-danger)]"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirming(product.slug)}
                              aria-label={`Delete ${product.name}`}
                              className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[var(--ax-danger)]/12 hover:text-[var(--ax-danger)]"
                            >
                              <Icon name="trash" className="size-4" strokeWidth={1.9} />
                            </button>
                          ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-[var(--ax-line)] px-5 py-3.5 text-[12px] text-[var(--ax-ink-dim)]">
        <span>
          Showing {rows.length} of {products.length} products
        </span>
        <span className="font-mono text-[11px]">
          Sorted by {sort} · {ascending ? "ascending" : "descending"}
        </span>
      </div>
    </div>
  );
}
