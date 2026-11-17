import type { NavItem } from "@/lib/types";

export const SITE = {
  name: "AURAVEX",
  tagline: "Enterprise Software & AI Solutions",
  headline: "Intelligent Software. Built for Enterprise.",
  description:
    "Auravex develops advanced enterprise software and AI-powered solutions that help organizations modernize operations, manage complexity, and achieve measurable business outcomes.",
  email: "hello@auravex.com",
  /** Empty until a real number is entered in Site Content; hidden while empty. */
  phone: "",
  location: "Dubai, United Arab Emirates",
} as const;

/**
 * Social profiles. Each address is an editable field (`ex.social.<id>.url`),
 * empty by default; a button appears in the footer only once an address is set.
 */
export const SOCIAL_PROFILES = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
] as const;

/** Where the site lives publicly; used for canonical URLs, the sitemap and social previews. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://auravex-site.netlify.app").replace(/\/+$/, "");

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Back to the start",
  },
  {
    label: "Enterprise Solutions",
    href: "/products",
    description: "The Auravex enterprise software portfolio",
  },
  {
    label: "Industries",
    href: "/industries",
    description: "The sectors our solutions serve",
  },
  {
    label: "Latest Updates",
    href: "/updates",
    description: "Product news and announcements",
  },
  {
    label: "About",
    href: "/about",
    description: "Who we are and how we deliver",
  },
];

/**
 * Footer link columns. The Enterprise Solutions column also lists every
 * available product, read live from the catalogue in the Footer itself.
 */
export const FOOTER_COLUMNS: { title: string; links: NavItem[] }[] = [
  {
    title: "Enterprise Solutions",
    links: [{ label: "All solutions", href: "/products" }],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Industries", href: "/industries" },
      { label: "Latest Updates", href: "/updates" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];


