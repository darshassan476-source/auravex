"use client";

import { useProduct } from "@/cms/useProduct";
import { RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Delta } from "@/components/ui/Primitives";
import type { Product } from "@/lib/types";

const ICONS = ["chart", "building", "users", "globe"];

/**
 * The four headline figures under a product hero, read through the store so
 * they can be replaced from the portal.
 */
export function ProductMetrics({ product: source }: { product: Product }) {
  const product = useProduct(source);
  const metrics = product.metrics.filter((m) => m.value.trim() && m.label.trim());
  if (metrics.length === 0) return null;

  return (
    <section className="relative pb-4">
      <div className="ax-container">
        <RevealGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
          {metrics.map((metric, i) => (
            <RevealItem key={`${metric.label}-${i}`}>
              <div className="ax-glass flex h-full items-center gap-4 rounded-2xl p-5">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: `linear-gradient(145deg, ${product.accent}3d, ${product.accent}0f)`,
                    boxShadow: `inset 0 0 0 1px ${product.accent}45`,
                  }}
                >
                  <Icon
                    name={ICONS[i % ICONS.length]}
                    className="size-5"
                    strokeWidth={1.8}
                    style={{ color: product.accent }}
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="ax-display text-[24px] leading-none text-[var(--ax-ink)]">
                    {metric.value}
                  </span>
                  <span className="flex items-center gap-2 text-[12px] text-[var(--ax-ink-muted)]">
                    {metric.label}
                    {metric.delta && <Delta value={metric.delta} trend={metric.trend} />}
                  </span>
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
