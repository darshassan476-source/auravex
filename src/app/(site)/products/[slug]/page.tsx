import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { PRODUCTS, categoryLabel, getProduct } from "@/data/products";
import { findProduct, getSiteBundle } from "@/server/cache";
import { ProductDetail } from "./ProductDetail";

// Pages refresh at least this often, so a product edited or published in the
// portal never stays stale (or missing) on a cached page.
export const revalidate = 60;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

async function load(slug: string) {
  const base = getProduct(slug) ?? (await findProduct(slug));
  if (!base) return undefined;
  const override = (await getSiteBundle()).products?.[slug];
  if (override?.hidden) return undefined;
  return {
    ...base,
    name: override?.name ?? base.name,
    tagline: override?.tagline ?? base.tagline,
    summary: override?.summary ?? base.summary,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) {
    const text = (await getSiteBundle()).text ?? {};
    return { title: text["product.meta.notFound"] || CONTENT_DEFAULTS["product.meta.notFound"] || "Solution not found" };
  }
  const title = `${product.name} — ${categoryLabel(product.category)}`;
  return {
    title,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name} — ${product.tagline}`, description: product.summary, url: `/products/${product.slug}`, type: "website" },
    twitter: { card: "summary_large_image", title, description: product.summary },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await load(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: categoryLabel(product.category),
    description: product.summary,
    operatingSystem: "Web",
    publisher: { "@type": "Organization", name: "AURAVEX" },
    ...(product.links.demo ? { url: product.links.demo } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductDetail product={product} />
    </>
  );
}
