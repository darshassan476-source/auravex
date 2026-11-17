import type { DeploymentOption, Product, ProductCategory, ProductStatus } from "@/lib/types";
import { CATALOGUE } from "./catalogue";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  sustainability: "Sustainability & Community",
  "document-management": "Enterprise Document Management",
  "ai-agents": "Enterprise AI Agents",
  "enterprise-management": "Enterprise Management",
  "business-intelligence": "Business Intelligence",
  construction: "Construction & Development",
  other: "Enterprise Software",
};

/** The category label for any record, including ones saved before the categories changed. */
export function categoryLabel(category: string | undefined): string {
  return CATEGORY_LABELS[category as ProductCategory] ?? CATEGORY_LABELS.other;
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  available: "Available",
  preview: "Preview Available",
  development: "Under Development",
  upcoming: "Upcoming",
  unavailable: "Temporarily Unavailable",
};

const LEGACY_STATUS: Record<string, ProductStatus> = {
  live: "available",
  beta: "preview",
  "coming-soon": "upcoming",
};

/** A status from any era of the store, mapped onto today's set. */
export function normalizeStatus(status: string | undefined): ProductStatus {
  if (status && status in STATUS_LABELS) return status as ProductStatus;
  return (status && LEGACY_STATUS[status]) || "available";
}

/** Only these count towards "N Enterprise Solutions". */
export const isActive = (p: Pick<Product, "status">) => normalizeStatus(p.status) === "available";

export const DEPLOYMENT_LABELS: Record<DeploymentOption, string> = {
  cloud: "Cloud (SaaS)",
  "private-cloud": "Private cloud",
  "on-premises": "On-premises",
  custom: "Custom enterprise deployment",
};

/** The bundled catalogue, defined in ./catalogue.ts. */
export const PRODUCTS: Product[] = CATALOGUE;

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.featured);
}

export const PRODUCT_FILTERS: { id: ProductCategory | "all"; label: string; icon: string }[] = [
  { id: "all", label: "All Solutions", icon: "grid" },
  ...(Object.keys(CATEGORY_LABELS) as ProductCategory[])
    .filter((id) => id !== "other")
    .map((id) => ({ id, label: CATEGORY_LABELS[id], icon: "box" })),
];
