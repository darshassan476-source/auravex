"use client";

import { useText } from "@/cms/CmsProvider";
import { Text } from "@/cms/Text";
import { useProduct } from "@/cms/useProduct";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

/**
 * The three things a visitor can do from a product's hero: set a meeting,
 * try the product live where a demo address is configured, and watch the
 * film where one has been made. Resolved on the client so the portal's
 * edits (a demo address, a film) show without a rebuild.
 */
export function ProductActions({ product: source }: { product: Product }) {
  const product = useProduct(source);
  const film = product.video?.src?.startsWith("/api/media/");
  const demoNote = useText("product.actions.demoNote");
  return (
    <div className="mt-9 flex flex-wrap items-center gap-3.5">
      {/* The quick demo leads: it is the thing a visitor wants first. */}
      {product.links.demo ? (
        <>
          <Button href={product.links.demo} external size="lg" icon="arrow-right">
            <Text id="product.actions.demo" />
          </Button>
          <Button href="/contact" size="lg" variant="outline" icon="calendar" iconPosition="left" magnetic={false}>
            <Text id="product.actions.meeting" />
          </Button>
        </>
      ) : (
        <Button href="/contact" size="lg" icon="arrow-right">
          <Text id="product.actions.meeting" />
        </Button>
      )}
      {film && (
        <Button href="#film" size="lg" variant="outline" icon="play" iconPosition="left" magnetic={false}>
          <Text id="product.actions.film" />
        </Button>
      )}
      {product.links.demo && (
        <p className="basis-full text-[12.5px] leading-relaxed text-[var(--ax-ink-dim)]">
          {product.demoNote || demoNote}
        </p>
      )}
    </div>
  );
}
