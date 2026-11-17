/**
 * AURAVEX — the commercial records the portal manages beside the catalogue:
 * customer deployments, adoption figures, pricing and Latest Updates.
 *
 * Each list is stored privately on the server. Visitors only ever receive the
 * public view built from it (`publicCustomers`, `publicAdoption`, …): unverified
 * figures, undisclosed customers, internal prices and unpublished updates
 * never leave the server.
 */

export const PRIVATE_RECORD_KEYS = ["customers", "adoption", "pricing", "updates"] as const;
export type PrivateRecordKey = (typeof PRIVATE_RECORD_KEYS)[number];

/* ---------------- Customers & deployments ---------------- */

export type DeploymentStatus = "planned" | "in-progress" | "pilot" | "live" | "completed";

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  planned: "Planned",
  "in-progress": "Deployment in progress",
  pilot: "Pilot",
  live: "Live",
  completed: "Completed",
};

/**
 * How a customer may appear on the public site.
 * - hidden: not shown at all (the default).
 * - named: company name (and logo, if one is set) shown.
 * - confidential: shown as "Enterprise Client — Confidential" with country and industry.
 */
export type DisclosureLevel = "hidden" | "named" | "confidential";

export interface CustomerRecord {
  id: string;
  company: string;
  country: string;
  industry: string;
  /** Slug of the product purchased. */
  productSlug: string;
  status: DeploymentStatus;
  /** yyyy-mm or yyyy-mm-dd; optional. */
  deploymentDate?: string;
  customization?: string;
  modules?: string[];
  description?: string;
  /** Media id of the customer's logo; shown only when disclosure is "named". */
  logoId?: string;
  /** The relationship and details have been confirmed. Unverified records are never public. */
  verified: boolean;
  disclosure: DisclosureLevel;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCustomer {
  id: string;
  /** The company name, or the confidential label. */
  name: string;
  confidential: boolean;
  country: string;
  industry: string;
  productSlug: string;
  status: DeploymentStatus;
  deploymentDate?: string;
  modules?: string[];
  description?: string;
  logoId?: string;
}

export const CONFIDENTIAL_LABEL = "Enterprise Client — Confidential";

export function toPublicCustomers(list: CustomerRecord[]): PublicCustomer[] {
  return list
    .filter((c) => c.verified && c.disclosure !== "hidden")
    .map((c) => {
      const confidential = c.disclosure === "confidential";
      return {
        id: c.id,
        name: confidential ? CONFIDENTIAL_LABEL : c.company,
        confidential,
        country: c.country,
        industry: c.industry,
        productSlug: c.productSlug,
        status: c.status,
        deploymentDate: c.deploymentDate || undefined,
        modules: c.modules?.length ? c.modules : undefined,
        // A confidential client's own description could identify them.
        description: confidential ? undefined : c.description || undefined,
        logoId: confidential ? undefined : c.logoId || undefined,
      };
    });
}

/* ---------------- Adoption figures ---------------- */

export interface AdoptionFigure {
  id: string;
  /** A product slug, or "all" for a company-wide figure. */
  productSlug: string;
  /** e.g. "Businesses using AI DMS", "Countries served". */
  label: string;
  value: number;
  /** Optional suffix such as "+". */
  suffix?: string;
  /** Evidence has been checked. Unverified figures are never public. */
  verified: boolean;
  /** Shown on the website when verified. */
  public: boolean;
  /** Internal note: where the figure came from. Never public. */
  source?: string;
  updatedAt: string;
}

export interface PublicFigure {
  id: string;
  productSlug: string;
  label: string;
  value: number;
  suffix?: string;
}

export function toPublicAdoption(list: AdoptionFigure[]): PublicFigure[] {
  return list
    .filter((f) => f.verified && f.public && Number.isFinite(f.value))
    .map(({ id, productSlug, label, value, suffix }) => ({ id, productSlug, label, value, suffix: suffix || undefined }));
}

/* ---------------- Pricing ---------------- */

export const PRICE_LINES = [
  { key: "base", label: "Base licence" },
  { key: "deployment", label: "Deployment" },
  { key: "customization", label: "Customisation" },
  { key: "optionalModules", label: "Optional modules" },
  { key: "ai", label: "AI enhancements" },
  { key: "voice", label: "Voice-to-voice AI" },
  { key: "integration", label: "Integrations" },
  { key: "support", label: "Support & maintenance" },
  { key: "recurring", label: "Recurring licence" },
] as const;

export type PriceLineKey = (typeof PRICE_LINES)[number]["key"];

export interface PricingRecord {
  productSlug: string;
  currency: string;
  /** Free text per line, e.g. "From 45,000 / year" — prices are never invented by the site. */
  lines: Partial<Record<PriceLineKey, string>>;
  /** Internal notes. Never public. */
  notes?: string;
  /** Only when true are the lines shown on the product page. */
  publicDisplay: boolean;
  updatedAt: string;
}

export interface PublicPricing {
  productSlug: string;
  currency: string;
  lines: Partial<Record<PriceLineKey, string>>;
}

export function toPublicPricing(list: PricingRecord[]): PublicPricing[] {
  return list
    .filter((p) => p.publicDisplay && Object.values(p.lines ?? {}).some((v) => v && v.trim()))
    .map((p) => ({ productSlug: p.productSlug, currency: p.currency, lines: p.lines }));
}

/* ---------------- Latest Updates ---------------- */

export type UpdateKind =
  | "ai"
  | "module"
  | "improvement"
  | "integration"
  | "deployment"
  | "industry"
  | "release"
  | "announcement";

export const UPDATE_KIND_LABELS: Record<UpdateKind, string> = {
  ai: "New AI capability",
  module: "New module",
  improvement: "Product improvement",
  integration: "New integration",
  deployment: "Deployment",
  industry: "New industry",
  release: "Upcoming release",
  announcement: "Announcement",
};

export interface UpdatePost {
  id: string;
  title: string;
  summary: string;
  body?: string;
  kind: UpdateKind;
  /** Product it belongs to, if any. */
  productSlug?: string;
  imageId?: string;
  featured: boolean;
  published: boolean;
  /** ISO time it goes public. Empty or past means immediately once published. */
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PublicUpdate = Omit<UpdatePost, "published" | "createdAt" | "updatedAt"> & {
  /** When it went (or goes) public. */
  date: string;
};

export function toPublicUpdates(list: UpdatePost[], now = Date.now()): PublicUpdate[] {
  return list
    .filter((u) => u.published && (!u.publishAt || Date.parse(u.publishAt) <= now))
    .map((u) => ({
      id: u.id,
      title: u.title,
      summary: u.summary,
      body: u.body,
      kind: u.kind,
      productSlug: u.productSlug,
      imageId: u.imageId,
      featured: u.featured,
      publishAt: u.publishAt,
      date: u.publishAt || u.createdAt,
    }))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.localeCompare(a.date));
}

/* ---------------- Enquiries ---------------- */

export interface EnquiryDetails {
  /** "configure" when they built a configuration, "consult" for a direct consultation. */
  path: "configure" | "consult";
  country?: string;
  industry?: string;
  productSlug?: string;
  productName?: string;
  modules?: string[];
  aiEnhancements?: string[];
  voiceAI?: boolean;
  departments?: number;
  users?: number;
  integrations?: string;
  workflows?: string;
  deployment?: string;
  meetingRequested?: boolean;
  /** Preferred meeting times, free text; the team follows up to confirm. */
  meetingTimes?: string;
  commercialProposal?: boolean;
}
