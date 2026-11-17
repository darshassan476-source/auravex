"use client";

import type { ReactNode } from "react";
import { useText } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { ProductCard } from "@/components/cards/ProductCard";
import { RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { isActive } from "@/data/products";
import { cn } from "@/lib/utils";

/** Active products and the pipeline, from the live catalogue — never a hard-coded list. */
export function useSolutions() {
  const catalogue = useCatalogue();
  const active = catalogue.filter(isActive);
  const pipeline = catalogue.filter((p) => !isActive(p));
  return { active, pipeline };
}

/** "6 Enterprise Solutions" — the number is always the live count of available products. */
export function SolutionCount({ className }: { className?: string }) {
  const { active } = useSolutions();
  const one = useText("ex.solutions.countOne");
  const many = useText("ex.solutions.countMany");
  return (
    <span className={className}>
      <span className="tabular-nums">{active.length}</span> {active.length === 1 ? one : many}
    </span>
  );
}

export function SolutionsGrid({
  which = "active",
  className,
}: {
  which?: "active" | "pipeline";
  className?: string;
}) {
  const { active, pipeline } = useSolutions();
  const list = which === "active" ? active : pipeline;
  const empty = useText("ex.solutions.empty");

  if (list.length === 0) {
    return which === "active" ? (
      <p className="py-12 text-center text-[15px] text-[var(--ax-ink-muted)]">{empty}</p>
    ) : null;
  }

  return (
    <RevealGroup className={cn("grid gap-5 md:grid-cols-2 xl:grid-cols-3", className)} stagger={0.06}>
      {list.map((product) => (
        <RevealItem key={product.slug} className="h-full">
          <ProductCard product={product} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

/** The "In development & upcoming" block, rendered only when something is in it. */
export function PipelineSection({ children }: { children: ReactNode }) {
  const { pipeline } = useSolutions();
  if (pipeline.length === 0) return null;
  return <>{children}</>;
}
