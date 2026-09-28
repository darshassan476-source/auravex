"use client";

import { Suspense } from "react";
import { useCatalogue } from "@/cms/useProduct";
import { AdminHeader, Panel } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import { STATUS_LABELS } from "@/data/products";
import type { ProductStatus } from "@/lib/types";
import { ProductEditor } from "./ProductEditor";
import { ProductTable } from "./ProductTable";

const STATUS_ORDER: ProductStatus[] = ["live", "beta", "development", "coming-soon"];

/** The catalogue screen: counts, the quick editor and the full table, all from the live catalogue. */
export function ProductsAdmin() {
  const catalogue = useCatalogue({ includeHidden: true });
  const counts = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: catalogue.filter((p) => p.status === status && !p.hidden).length,
  }));

  return (
    <>
      <AdminHeader
        title="Manage Products"
        description="The full catalogue as it appears on the public site. Changes here publish straight to /products."
        action={
          <Button href="/admin/products/new" size="sm" icon="plus" iconPosition="left">
            Add Software
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {counts.map((item) => (
          <div key={item.status} className="ax-glass ax-edge-light flex flex-col gap-2 rounded-2xl p-5">
            <span className="ax-display text-[28px] text-[var(--ax-ink)]">{item.count}</span>
            <span className="text-[12.5px] text-[var(--ax-ink-muted)]">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-5">
        {/* The editor reads ?slug= so links from the dashboard open the right product. */}
        <Suspense fallback={null}>
          <ProductEditor />
        </Suspense>
      </div>

      <Panel title="Catalogue" padded={false}>
        <ProductTable />
      </Panel>
    </>
  );
}
