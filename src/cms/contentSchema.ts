/**
 * Every piece of front-end copy the admin portal can edit.
 *
 * One flat registry rather than scattered defaults: the admin Content screen
 * renders straight from this, and `useText(id)` on the public site falls back
 * to `value` whenever nothing has been overridden. Adding an editable string
 * means adding one entry here and reading it through `useText`.
 */
import { SITE } from "@/data/site";

export interface ContentField {
  id: string;
  label: string;
  value: string;
  /** Renders a textarea instead of a single line. */
  long?: boolean;
  hint?: string;
}

export interface ContentGroup {
  id: string;
  label: string;
  description: string;
  fields: ContentField[];
}

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "brand",
    label: "Brand",
    description: "Name, promise and contact details, used in the nav, footer and metadata.",
    fields: [
      { id: "site.name", label: "Company name", value: SITE.name },
      { id: "site.tagline", label: "Tagline", value: SITE.tagline, hint: "Sits under the wordmark" },
      { id: "site.headline", label: "Headline", value: SITE.headline },
      { id: "site.description", label: "Description", value: SITE.description, long: true },
      { id: "site.email", label: "Email", value: SITE.email },
      { id: "site.phone", label: "Phone", value: SITE.phone },
      { id: "site.location", label: "Location", value: SITE.location },
      { id: "nav.cta", label: "Navigation button", value: "Set a meeting", hint: "The button at the top right of every page" },
    ],
  },
  {
    id: "home-hero",
    label: "Home — hero",
    description: "The first thing a visitor reads.",
    fields: [
      { id: "home.hero.eyebrow", label: "Eyebrow pill", value: "Enterprise Software Solutions" },
      { id: "home.hero.titleA", label: "Headline, line 1", value: "Intelligent Software." },
      { id: "home.hero.titleB", label: "Headline, line 2", value: "Built for" },
      {
        id: "home.hero.accent",
        label: "Headline, accented word",
        value: "Enterprise.",
        hint: "Rendered in the gradient",
      },
      {
        id: "home.hero.body",
        label: "Supporting paragraph",
        value:
          "AI-powered software, automation, analytics and digital platforms to help visionary companies around the world build a smarter, faster and more connected future.",
        long: true,
      },
      { id: "home.hero.primaryCta", label: "Primary button", value: "Explore Products" },
      { id: "home.hero.secondaryCta", label: "Secondary button", value: "Set a meeting" },
    ],
  },
  {
    id: "home-sections",
    label: "Home — sections",
    description: "The section headings down the homepage.",
    fields: [
      { id: "home.portfolio.eyebrow", label: "Portfolio eyebrow", value: "Our Product Portfolio" },
      { id: "home.portfolio.title", label: "Portfolio heading", value: "A Complete Suite for\nModern" },
      { id: "home.portfolio.accent", label: "Portfolio accent", value: "Enterprises." },
      {
        id: "home.portfolio.body",
        label: "Portfolio paragraph",
        value:
          "From real estate and construction to group enterprises, our products combine AI, automation and beautiful design to solve complex business challenges at scale.",
        long: true,
      },
      { id: "home.solutions.eyebrow", label: "Solutions eyebrow", value: "Our Solutions" },
      { id: "home.solutions.title", label: "Solutions heading", value: "Software Built Around\nReal" },
      { id: "home.solutions.accent", label: "Solutions accent", value: "Business Outcomes." },
      { id: "home.work.eyebrow", label: "Case studies eyebrow", value: "Featured Case Studies" },
      { id: "home.work.title", label: "Case studies heading", value: "Transformation in" },
      { id: "home.work.accent", label: "Case studies accent", value: "Action." },
      { id: "home.process.eyebrow", label: "Process eyebrow", value: "From Conversation to Impact" },
      { id: "home.process.title", label: "Process heading", value: "A Simple Process.\nReal Business" },
      { id: "home.process.accent", label: "Process accent", value: "Outcomes." },
      { id: "home.stack.eyebrow", label: "Technology eyebrow", value: "Technology" },
      { id: "home.stack.title", label: "Technology heading", value: "A stack built for" },
      { id: "home.stack.accent", label: "Technology accent", value: "the next decade." },
    ],
  },
  {
    id: "proof",
    label: "Headline numbers",
    description:
      "The three figures on the homepage band, the About hero and the stats strip. These ship as placeholders — replace them with real figures before launch.",
    fields: [
      { id: "proof.1.value", label: "Figure 1", value: "50+" },
      { id: "proof.1.label", label: "Figure 1 — label", value: "Enterprise Clients" },
      { id: "proof.1.sub", label: "Figure 1 — caption", value: "Across MENA & Global" },
      { id: "proof.2.value", label: "Figure 2", value: "40%" },
      { id: "proof.2.label", label: "Figure 2 — label", value: "Average Efficiency Gain" },
      { id: "proof.2.sub", label: "Figure 2 — caption", value: "for Our Clients" },
      { id: "proof.3.value", label: "Figure 3", value: "99.9%" },
      { id: "proof.3.label", label: "Figure 3 — label", value: "Platform Uptime" },
      { id: "proof.3.sub", label: "Figure 3 — caption", value: "Powering Critical Business" },
    ],
  },
  {
    id: "sectors",
    label: "Sectors band",
    description:
      "The scrolling band under the product gallery. It lists what you build for rather than naming companies as customers.",
    fields: [
      { id: "sectors.label", label: "Band heading", value: "Built for the\nsectors we know deeply", long: true },
      { id: "sectors.1", label: "Sector 1", value: "Real Estate Development" },
      { id: "sectors.2", label: "Sector 2", value: "Construction & Delivery" },
      { id: "sectors.3", label: "Sector 3", value: "Hospitality & Leisure" },
      { id: "sectors.4", label: "Sector 4", value: "Asset Management" },
      { id: "sectors.5", label: "Sector 5", value: "Retail & Mixed-Use" },
      { id: "sectors.6", label: "Sector 6", value: "Government & Public Sector" },
    ],
  },
  {
    id: "cta",
    label: "Closing call to action",
    description: "The band that closes most pages.",
    fields: [
      { id: "cta.eyebrow", label: "Eyebrow", value: "Get started" },
      { id: "cta.title", label: "Heading", value: "Ready to build" },
      { id: "cta.accent", label: "Accented phrase", value: "what comes next?" },
      {
        id: "cta.body",
        label: "Paragraph",
        value:
          "Tell us what you are trying to achieve. We will show you exactly how AURAVEX gets you there — with your data, your workflows, your numbers.",
        long: true,
      },
      { id: "cta.primary", label: "Primary button", value: "Set a meeting" },
      { id: "cta.secondary", label: "Secondary button", value: "Explore Products" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile CTA bar",
    description: "The sticky bar that follows visitors on phones.",
    fields: [
      {
        id: "mobile.cta.body",
        label: "Message",
        value: "See how AURAVEX can power your next stage of growth.",
        long: true,
      },
      { id: "mobile.cta.button", label: "Button", value: "Set a meeting" },
    ],
  },
];

/** Flat id -> default, for `useText` lookups. */
export const CONTENT_DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_GROUPS.flatMap((group) => group.fields.map((f) => [f.id, f.value])),
);
