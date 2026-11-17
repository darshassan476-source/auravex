/**
 * Site-chrome copy that used to sit inline in components. Plain data, so both
 * the components and the CMS registry (`src/cms/content/chrome.ts`) can read it.
 */

/** The fixed page entries at the end of the search index. */
export const SEARCH_PAGES = [
  { label: "Enterprise Solutions", href: "/products", description: "The Auravex product portfolio", icon: "grid" },
  { label: "Latest Updates", href: "/updates", description: "Product news and announcements", icon: "megaphone" },
  { label: "About Auravex", href: "/about", description: "Who we are and how we deliver", icon: "users" },
  { label: "Discuss Your Requirements", href: "/contact", description: "Configure a solution or request a consultation", icon: "mail" },
];

/** Default search-engine keywords; editable as one comma-separated field. */
export const SEO_KEYWORDS = [
  "Enterprise Software Solutions",
  "AI-Powered Enterprise Software",
  "Enterprise Document Management",
  "AI Document Management System",
  "Enterprise Automation",
  "Construction Management Software",
  "Enterprise Business Intelligence",
  "AI Business Solutions",
  "Digital Transformation",
];
