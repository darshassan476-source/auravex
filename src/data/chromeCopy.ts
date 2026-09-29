/**
 * Site-chrome copy that used to sit inline in components. Plain data, so both
 * the components and the CMS registry (`src/cms/content/chrome.ts`) can read it.
 */

/** Position of "Products" in NAV_ITEMS — its children form the drop-down. */
export const NAV_PRODUCTS_INDEX = 1;

/** The fixed page entries at the end of the search index. */
export const SEARCH_PAGES = [
  { label: "About AURAVEX", href: "/about", description: "The team, method and mission", icon: "users" },
  { label: "Contact", href: "/contact", description: "Request a demo or book a call", icon: "mail" },
  { label: "Admin Portal", href: "/admin/login", description: "Private management platform", icon: "lock" },
];

/** Default search-engine keywords; editable as one comma-separated field. */
export const SEO_KEYWORDS = [
  "AI software",
  "enterprise platforms",
  "real estate technology",
  "business intelligence",
  "automation",
  "Dubai software company",
];
