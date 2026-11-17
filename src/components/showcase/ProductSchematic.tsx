"use client";

import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/lib/types";

/**
 * A product's screen, drawn from its own record: its module list as the
 * navigation and its main capabilities as the workspace. No invented
 * figures — until real screenshots are uploaded in the portal, this shows
 * what the product actually contains.
 */
export function ProductSchematic({ product }: { product: Product }) {
  const modules = (product.modules ?? []).slice(0, 7);
  const features = product.features.slice(0, 4);
  const accent = product.accent;

  return (
    <div className="flex size-full bg-[var(--ax-bg)] text-left" aria-hidden>
      <div className="flex w-[30%] flex-col gap-1 border-r border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-[3%]">
        <div className="mb-[6%] flex items-center gap-1.5">
          <span className="grid size-5 place-items-center rounded-md" style={{ background: `${accent}2e`, color: accent }}>
            <Icon name={product.icon} className="size-3" strokeWidth={2} />
          </span>
          <span className="truncate text-[9px] font-semibold text-[var(--ax-ink)]">{product.name}</span>
        </div>
        {modules.map((m, i) => (
          <span
            key={m.id}
            className="truncate rounded-md px-1.5 py-1 text-[7.5px] text-[var(--ax-ink-muted)]"
            style={i === 0 ? { background: `${accent}24`, color: "var(--ax-ink)" } : undefined}
          >
            {m.name}
          </span>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-[3%] p-[4%]">
        <span className="text-[10px] font-semibold text-[var(--ax-ink)]">{modules[0]?.name ?? product.name}</span>
        <div className="grid flex-1 grid-cols-2 gap-[3%]">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-1 rounded-lg border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-[6%]">
              <Icon name={f.icon} className="size-3" strokeWidth={2} style={{ color: accent }} />
              <span className="text-[8px] font-semibold leading-tight text-[var(--ax-ink)]">{f.title}</span>
              <span className="line-clamp-3 text-[6.5px] leading-snug text-[var(--ax-ink-dim)]">{f.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The home hero's screen when no image is uploaded: the six solutions as one
 * connected suite. Names and categories only.
 */
export function SuiteSchematic({ products }: { products: Product[] }) {
  return (
    <div className="flex size-full flex-col bg-[var(--ax-bg)] p-[4%]" aria-hidden>
      <div className="mb-[3%] flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-[var(--ax-ink)]">AURAVEX</span>
        <span className="text-[7.5px] uppercase tracking-[0.14em] text-[var(--ax-ink-dim)]">Enterprise Solutions</span>
      </div>
      <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-[2.5%]">
        {products.slice(0, 6).map((p) => (
          <div key={p.slug} className="flex flex-col justify-between rounded-lg border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-[7%]">
            <span className="grid size-6 place-items-center rounded-md" style={{ background: `${p.accent}2e`, color: p.accent }}>
              <Icon name={p.icon} className="size-3.5" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[9px] font-semibold leading-tight text-[var(--ax-ink)]">{p.name}</span>
              <span className="mt-0.5 block text-[6.5px] uppercase tracking-[0.08em] text-[var(--ax-ink-dim)]">{p.sector}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
