/**
 * AURAVEX — shared domain types.
 *
 * These mirror the shapes the future Python/REST backend is expected to
 * return, so swapping `src/data/*` for live fetches in `src/lib/api.ts`
 * requires no component changes.
 */

/**
 * Where a product stands commercially. Only "available" products count as
 * active; the rest are listed separately on the Enterprise Solutions page.
 */
export type ProductStatus =
  | "available"
  | "preview"
  | "development"
  | "upcoming"
  | "unavailable";

export type ProductCategory =
  | "sustainability"
  | "document-management"
  | "ai-agents"
  | "enterprise-management"
  | "business-intelligence"
  | "construction"
  | "other";

/** How a product can be deployed for a customer. */
export type DeploymentOption = "cloud" | "private-cloud" | "on-premises" | "custom";

/** A named piece of a product: a core module, an optional add-on or an AI enhancement. */
export interface ProductModule {
  id: string;
  name: string;
  description: string;
}

/** Early-access details for a product that is not generally available yet. */
export interface ProductPreview {
  /** Where "View Preview" points, when public access is on. */
  url?: string;
  description?: string;
  /** Media ids of preview screens. */
  imageIds?: string[];
  /** When true the preview link is shown publicly; otherwise visitors can request one. */
  public?: boolean;
  /** Free text, e.g. "Q1 2027". Shown only when set. */
  expectedRelease?: string;
}

export interface MediaAsset {
  id: string;
  type: "image" | "video";
  /** Public URL or storage key once cloud storage is wired up. */
  src: string;
  alt: string;
  /** Poster frame for video assets. */
  poster?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface ProductMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}

export interface ProductFeature {
  title: string;
  description: string;
  icon: string;
}

export interface TimelinePhase {
  phase: string;
  duration: string;
  detail?: string;
}

export interface ArchitectureLayer {
  layer: string;
  description: string;
  tech: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  /** Secondary label shown above the product name on cards. */
  sector: string;
  status: ProductStatus;
  summary: string;
  description: string;
  icon: string;
  accent: string;
  tags: string[];
  features: ProductFeature[];
  stack: string[];
  metrics: ProductMetric[];
  architecture: ArchitectureLayer[];
  timeline: TimelinePhase[];
  gallery: MediaAsset[];
  video?: MediaAsset;
  links: {
    demo?: string;
    live?: string;
    github?: string;
    caseStudy?: string;
  };
  /** A line shown under "Try it live", e.g. the demo account to use. */
  demoNote?: string;
  /** False hides the Quick Demo button even when a demo address is set. */
  demoPublic?: boolean;
  featured: boolean;
  year: string;
  views: number;

  /* ---- Enterprise detail (all optional so older portal records still load) ---- */
  /** The business problems the product addresses. */
  problems?: string[];
  /** Core modules that ship with the product. */
  modules?: ProductModule[];
  aiCapabilities?: string[];
  workflows?: string[];
  deployment?: DeploymentOption[];
  integrations?: string[];
  industries?: string[];
  /** Add-ons a customer may choose in "Customize Your Solution". */
  optionalModules?: ProductModule[];
  /** Optional AI enhancements offered in the configurator. */
  aiEnhancements?: ProductModule[];
  /** Whether voice-to-voice AI is offered as an option for this product. */
  voiceAI?: boolean;
  /** What can be tailored: branding, workflows, fields, reports… */
  customization?: string[];
  preview?: ProductPreview;
  /** Display order in listings; lower comes first. */
  order?: number;
}

export interface Solution {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  bullets: string[];
  stats: ProductMetric[];
}

export interface Industry {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  outcomes: string[];
  stat: ProductMetric;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  index: string;
  title: string;
  sector: string;
  summary: string;
  challenge: string;
  approach: string[];
  metrics: ProductMetric[];
  timeline: TimelinePhase[];
  testimonial: Testimonial;
  productSlug?: string;
}

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

/* ---------- Admin domain ---------- */

export type LeadStatus = "new" | "contacted" | "qualified" | "in-progress" | "closed";

export interface DemoRequest {
  id: string;
  name: string;
  company: string;
  interest: string;
  status: LeadStatus;
  date: string;
  email: string;
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  kind: "create" | "update" | "delete" | "publish" | "login";
}

export interface PageRecord {
  id: string;
  name: string;
  path: string;
  published: boolean;
}

export interface AnalyticsPoint {
  label: string;
  value: number;
}

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: string;
  series: number[];
}
