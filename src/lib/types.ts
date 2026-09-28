/**
 * AURAVEX — shared domain types.
 *
 * These mirror the shapes the future Python/REST backend is expected to
 * return, so swapping `src/data/*` for live fetches in `src/lib/api.ts`
 * requires no component changes.
 */

export type ProductStatus = "live" | "beta" | "development" | "coming-soon";

export type ProductCategory =
  | "ai"
  | "saas"
  | "web-apps"
  | "automation"
  | "developer-tools"
  | "enterprise";

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
  featured: boolean;
  year: string;
  views: number;
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
