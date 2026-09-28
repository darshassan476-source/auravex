import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/Primitives";
import { Button } from "@/components/ui/Button";
import { ProductForm } from "./ProductForm";

export const metadata: Metadata = { title: "Add Software" };

export default function AddProductPage() {
  return (
    <>
      <AdminHeader
        title="Add Software"
        description="Author a product once and it renders across the catalogue, the homepage rail and search."
        action={
          <Button href="/admin/products" size="sm" variant="secondary" icon="arrow-left" iconPosition="left">
            Back to catalogue
          </Button>
        }
      />

      {/* useSearchParams needs a boundary so the shell can still prerender. */}
      <Suspense
        fallback={
          <div className="ax-glass grid h-[520px] place-items-center rounded-2xl">
            <span className="size-6 animate-spin rounded-full border-2 border-[var(--ax-line-strong)] border-t-[var(--ax-accent)]" />
          </div>
        }
      >
        <ProductForm />
      </Suspense>
    </>
  );
}
