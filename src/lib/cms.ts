/**
 * AURAVEX content store.
 *
 * Everything the admin portal can change about the public site lives in one
 * serialisable object: copy, per-page backgrounds, palette overrides, uploaded
 * media, product overrides, page-builder blocks, plus the inbox, bookings and
 * visit log the portal reads.
 *
 * The server owns it: `GET /api/site` returns the content half to every
 * visitor, and the portal writes changes through `/api/admin/*`. The copy in
 * localStorage is a cache so a returning browser paints the edited site
 * before the network answers, and so the portal's live preview iframe follows
 * edits instantly through the `storage` event.
 */
import type { BackgroundId } from "@/data/backgrounds";
import type { LeadStatus, Product, ProductMetric } from "./types";

export const CMS_STORAGE_KEY = "auravex:cms";
export const CMS_VERSION = 3;

/** Pages that own a hero background. */
export const PAGE_KEYS = [
  "home",
  "products",
  "product-detail",
  "solutions",
  "industries",
  "our-work",
  "case-study",
  "about",
  "contact",
  "admin-login",
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Home",
  products: "Products",
  "product-detail": "Product detail",
  solutions: "Solutions",
  industries: "Industries",
  "our-work": "Our Work",
  "case-study": "Case study",
  about: "About",
  contact: "Contact",
  "admin-login": "Admin login",
};

/**
 * Palette tokens the admin may override, on top of whichever preset is active.
 * Any hex value is accepted — these are the surfaces, not a fixed set of
 * colours.
 */
export const PALETTE_KEYS = [
  "accent",
  "accentSoft",
  "accentDeep",
  "violet",
  "cyan",
  "bg",
  "bgElevated",
  "surface",
  "line",
  "lineStrong",
  "ink",
  "inkMuted",
  "inkDim",
  "success",
  "warning",
  "danger",
] as const;

export type PaletteKey = (typeof PALETTE_KEYS)[number];

export interface PaletteMeta {
  label: string;
  cssVar: string;
  hint: string;
  group: "Brand" | "Surfaces" | "Text" | "Status";
  /** Alpha-capable tokens accept rgba; the rest are plain hex. */
  alpha?: boolean;
}

export const PALETTE_META: Record<PaletteKey, PaletteMeta> = {
  accent: {
    group: "Brand",
    label: "Accent",
    cssVar: "--ax-accent",
    hint: "Primary buttons, links, active states",
  },
  accentSoft: {
    group: "Brand",
    label: "Accent soft",
    cssVar: "--ax-accent-soft",
    hint: "Icons, highlights, eyebrow text",
  },
  accentDeep: {
    group: "Brand",
    label: "Accent deep",
    cssVar: "--ax-accent-deep",
    hint: "Pressed states and deep fills",
  },
  violet: {
    group: "Brand",
    label: "Gradient end",
    cssVar: "--ax-violet",
    hint: "The far end of every gradient",
  },
  cyan: {
    group: "Brand",
    label: "Cyan",
    cssVar: "--ax-cyan",
    hint: "Third series colour in charts",
  },

  bg: {
    group: "Surfaces",
    label: "Page background",
    cssVar: "--ax-bg",
    hint: "The base canvas behind everything",
  },
  bgElevated: {
    group: "Surfaces",
    label: "Raised background",
    cssVar: "--ax-bg-elevated",
    hint: "Footer and sidebar",
  },
  surface: {
    group: "Surfaces",
    label: "Glass panel",
    cssVar: "--ax-surface",
    hint: "Cards and panels",
    alpha: true,
  },
  line: {
    group: "Surfaces",
    label: "Border",
    cssVar: "--ax-line",
    hint: "Hairlines between things",
    alpha: true,
  },
  lineStrong: {
    group: "Surfaces",
    label: "Border strong",
    cssVar: "--ax-line-strong",
    hint: "Emphasised borders",
    alpha: true,
  },

  ink: {
    group: "Text",
    label: "Heading text",
    cssVar: "--ax-ink",
    hint: "Headlines and primary copy",
  },
  inkMuted: {
    group: "Text",
    label: "Body text",
    cssVar: "--ax-ink-muted",
    hint: "Paragraphs and secondary copy",
  },
  inkDim: {
    group: "Text",
    label: "Caption text",
    cssVar: "--ax-ink-dim",
    hint: "Labels, captions, metadata",
  },

  success: {
    group: "Status",
    label: "Success",
    cssVar: "--ax-success",
    hint: "Positive deltas and live badges",
  },
  warning: {
    group: "Status",
    label: "Warning",
    cssVar: "--ax-warning",
    hint: "Drafts and cautions",
  },
  danger: {
    group: "Status",
    label: "Danger",
    cssVar: "--ax-danger",
    hint: "Errors and destructive actions",
  },
};

export const PALETTE_GROUPS = ["Brand", "Surfaces", "Text", "Status"] as const;

/** Which palette a colour edit applies to. */
export type PaletteScope = "site" | "portal";

export interface MediaItem {
  id: string;
  name: string;
  /** Served by the API: `/api/media/<id>`. */
  src: string;
  /** image/…, video/mp4 or audio/… */
  mime?: string;
  width: number;
  height: number;
  /** Bytes on disk. */
  size: number;
  addedAt: string;
}

export interface VisitRecord {
  /** ISO timestamp. */
  at: string;
  path: string;
  /** "direct" or the referring host. */
  source: string;
  device: "desktop" | "tablet" | "mobile";
}

/** Background choice for one page: a registry plate, or an uploaded image. */
export type BackgroundChoice =
  { kind: "plate"; id: BackgroundId } | { kind: "media"; mediaId: string };

/** One inbound enquiry and everything said since. */
export interface Message {
  id: string;
  /** "them" is the visitor, "me" is the portal operator. */
  from: "them" | "me";
  body: string;
  at: string;
}

export interface Thread {
  id: string;
  name: string;
  email: string;
  company?: string;
  /** What they said they were interested in. */
  subject?: string;
  messages: Message[];
  unread: boolean;
  archived?: boolean;
  /** Where the lead sits in the pipeline, moved by the operator. */
  status: LeadStatus;
  createdAt: string;
}

/** An outbound destination with a tracked address at /go/<id>. */
export interface ManagedLink {
  id: string;
  label: string;
  url: string;
  group: string;
  clicks: number;
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "done" | "cancelled";

export interface Booking {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject?: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  /** "10:00 AM" as chosen in the booking panel. */
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  /** Minutes before the slot to raise a reminder. */
  remindMinutes: number;
  /** Set once the reminder has fired, so it never fires twice. */
  remindedAt?: string;
}

export interface CmsState {
  version: number;
  /** Copy overrides, keyed by the ids in `src/cms/contentSchema.ts`. */
  text: Record<string, string>;
  backgrounds: Partial<Record<PageKey, BackgroundChoice>>;
  /** Colours for the public site. */
  palette: Partial<Record<PaletteKey, string>>;
  /** Colours for the admin portal, kept separate on purpose. */
  portalPalette: Partial<Record<PaletteKey, string>>;
  media: MediaItem[];
  /** Product overrides, keyed by slug. Only changed fields are stored. */
  products: Record<string, ProductOverride>;
  /** Products created in the portal, complete records alongside the bundled ones. */
  customProducts: Product[];
  /** Case-study overrides, keyed by slug. */
  caseStudies: Record<string, CaseStudyOverride>;
  /** Page-builder blocks, keyed by page. */
  blocks: Partial<Record<PageKey, Block[]>>;
  visits: VisitRecord[];
  threads: Thread[];
  bookings: Booking[];
  /** Media id of an uploaded logo mark, replacing the built-in one. */
  logoId?: string;
  /** Themes the owner made in Appearance; offered in every theme picker. */
  customThemes: CustomTheme[];
  /** The theme a visitor gets before choosing one (a built-in id or "custom:<id>"). */
  siteTheme?: string;
  /** The theme the portal opens in before the operator chooses one. */
  portalTheme?: string;
  /** Media id shown on the home hero's laptop screen. */
  heroImageId?: string;
  /** Whether the operator has granted desktop notification permission. */
  remindersEnabled: boolean;
  updatedAt: string | null;
}

/** A theme the owner made: a built-in preset as the base, with their own colours on top. */
export interface CustomTheme {
  id: string;
  name: string;
  mode: "dark" | "light";
  /** The built-in theme id this starts from. */
  base: string;
  palette: Partial<Record<PaletteKey, string>>;
}

export interface ProductOverride {
  name?: string;
  tagline?: string;
  summary?: string;
  description?: string;
  accent?: string;
  status?: string;
  /** Media id used as the product's card and hero image: the first screen. */
  imageId?: string;
  /**
   * Every screen the owner has put on this product, in order. The first one
   * fills the laptop on the product page and the card in the catalogue; the
   * rest are offered under the device for the visitor to flick through.
   */
  imageIds?: string[];
  hidden?: boolean;
  /** Replaces the four headline figures on the product page. */
  metrics?: ProductMetric[];
  sector?: string;
  category?: string;
  icon?: string;
  tags?: string[];
  stack?: string[];
  year?: string;
  featured?: boolean;
  links?: { demo?: string; github?: string };
  /** A line shown under "Try it live", e.g. the demo account to use. */
  demoNote?: string;
  /** A film made in AI Studio, and its poster frame. */
  videoId?: string;
  posterId?: string;
}

export interface CaseStudyOverride {
  title?: string;
  summary?: string;
  metrics?: ProductMetric[];
  hidden?: boolean;
}

/* ---------------- Page builder ---------------- */

/** Where on a page a block can be dropped. */
export const BLOCK_SLOTS = ["after-hero", "before-cta"] as const;
export type BlockSlot = (typeof BLOCK_SLOTS)[number];

export const SLOT_LABELS: Record<BlockSlot, string> = {
  "after-hero": "Directly under the hero",
  "before-cta": "Just above the closing call to action",
};

export type BlockType = "image" | "text" | "stats" | "quote" | "video";

export const BLOCK_LABELS: Record<BlockType, string> = {
  image: "Image",
  text: "Text section",
  stats: "Figures row",
  quote: "Quote",
  video: "Video",
};

export interface Block {
  id: string;
  type: BlockType;
  slot: BlockSlot;
  /** Heading for text/stats/quote, caption for image/video. */
  title?: string;
  /** Body copy for text, the quotation for quote. */
  body?: string;
  /** Uploaded image for `image`, or a poster for `video`. */
  mediaId?: string;
  /** Video URL — a YouTube/Vimeo embed or a direct file. */
  url?: string;
  /** Figures for `stats`. */
  items?: { value: string; label: string }[];
  /** Attribution for `quote`. */
  author?: string;
  role?: string;
  /** Image blocks: show inside the laptop frame, or full-bleed. */
  framed?: boolean;
}

export const EMPTY_CMS: CmsState = {
  version: CMS_VERSION,
  text: {},
  backgrounds: {},
  palette: {},
  portalPalette: {},
  media: [],
  products: {},
  customProducts: [],
  caseStudies: {},
  blocks: {},
  visits: [],
  threads: [],
  bookings: [],
  remindersEnabled: false,
  customThemes: [],
  updatedAt: null,
};

/** Visits are capped so the store cannot grow without bound. */
export const MAX_VISITS = 500;

export function loadCms(): CmsState {
  if (typeof window === "undefined") return EMPTY_CMS;
  try {
    const raw = window.localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return EMPTY_CMS;
    const parsed = JSON.parse(raw) as Partial<CmsState>;
    // Version 1 predates every field below; anything later is forward-compatible
    // because missing keys fall back to the empty defaults.
    if (!parsed.version || parsed.version < 2) return EMPTY_CMS;
    return { ...EMPTY_CMS, ...parsed, version: CMS_VERSION };
  } catch {
    return EMPTY_CMS;
  }
}

export type SaveResult = { ok: true } | { ok: false; reason: string };

export function saveCms(state: CmsState): SaveResult {
  if (typeof window === "undefined")
    return { ok: false, reason: "No browser storage." };
  try {
    window.localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    // Almost always the 5MB quota, and almost always because of media.
    const quota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22);
    return {
      ok: false,
      reason: quota
        ? "Browser storage is full."
        : "Could not write to browser storage.",
    };
  }
}

/** Approximate bytes currently used by the store. */
export function cmsSize(state: CmsState): number {
  try {
    return JSON.stringify(state).length;
  } catch {
    return 0;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
