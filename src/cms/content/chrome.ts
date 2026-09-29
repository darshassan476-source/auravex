import type { ContentField, ContentGroup } from "../contentSchema";
import { listFields } from "../lists";
import { STATUS_LABELS } from "@/data/products";
import {
  CAPABILITY_STRIP,
  FOOTER_COLUMNS,
  HERO_PANELS,
  NAV_ITEMS,
  PROCESS_STEPS,
  SITE,
  TECH_STACK,
} from "@/data/site";
import { NAV_PRODUCTS_INDEX, SEARCH_PAGES, SEO_KEYWORDS } from "@/data/chromeCopy";

/** Menu entries, then the Products drop-down underneath. */
const navFields: ContentField[] = [
  ...listFields("nav", "Menu item", NAV_ITEMS, [
    { key: "label", label: "name" },
    { key: "description", label: "short description", hint: "Shown in the search and drop-down menus" },
  ]),
  ...listFields("nav.products", "Products drop-down item", NAV_ITEMS[NAV_PRODUCTS_INDEX].children ?? [], [
    { key: "label", label: "name" },
    { key: "description", label: "short description" },
  ]),
  { id: "nav.mobile.cta", label: "Button at the foot of the phone menu", value: "Request Demo" },
];

const footerFields: ContentField[] = [
  {
    id: "footer.description",
    label: "Sentence after the company description",
    value: "We partner with visionary enterprises to design, build and scale the platforms their next decade depends on.",
    long: true,
    hint: "Follows the company description from the Brand section",
  },
  ...FOOTER_COLUMNS.flatMap((column, c) => [
    { id: `footer.col.${c + 1}.title`, label: `Column ${c + 1} — heading`, value: column.title },
    ...column.links.map((link, l) => ({
      id: `footer.col.${c + 1}.link.${l + 1}`,
      label: `Column ${c + 1} — link ${l + 1}`,
      value: link.label,
    })),
  ]),
  ...SITE.socials.map((social, i) => ({
    id: `footer.social.${i + 1}`,
    label: `Social button ${i + 1}`,
    value: social.label,
  })),
  { id: "footer.rights", label: "Copyright line ending", value: "All rights reserved.", hint: "Follows “© year Company.”" },
  { id: "footer.privacy", label: "Privacy link", value: "Privacy" },
  { id: "footer.terms", label: "Terms link", value: "Terms" },
  { id: "footer.status", label: "Status note", value: "All systems operational" },
];

export const CHROME_GROUPS: ContentGroup[] = [
  {
    id: "home-extras",
    label: "Home page extras",
    description: "Section paragraphs, buttons, the hero callouts and the capability strip on the homepage.",
    fields: [
      { id: "home.portfolio.button", label: "Portfolio button", value: "View All Products" },
      {
        id: "home.solutions.body",
        label: "Solutions paragraph",
        value:
          "A powerful suite of enterprise software solutions designed for the real estate and urban economy — helping you automate, connect and grow with confidence.",
        long: true,
      },
      { id: "home.solutions.button", label: "Solutions button", value: "All Solutions" },
      { id: "home.solutions.cardLink", label: "Link on each solution card", value: "Explore Solution" },
      {
        id: "home.work.body",
        label: "Case studies paragraph",
        value:
          "From complex developments to large-scale operations, explore how our customers turn challenges into measurable growth with AURAVEX.",
        long: true,
      },
      { id: "home.work.button", label: "Case studies button", value: "More Success Stories" },
      {
        id: "home.process.body",
        label: "Process paragraph",
        value:
          "Get from idea to implementation with a clear, streamlined journey — designed for enterprise teams.",
        long: true,
      },
      {
        id: "home.stack.body",
        label: "Technology paragraph",
        value: "Typed end to end, observable in production, and yours to take over whenever you want it.",
        long: true,
      },
      ...listFields("home.hero.card", "Hero callout", HERO_PANELS, [
        { key: "title", label: "title" },
        { key: "body", label: "text" },
      ]),
      ...listFields("home.hero.capability", "Capability strip item", CAPABILITY_STRIP, [
        { key: "label", label: "label", long: true, hint: "A line break splits it over two lines" },
      ]),
    ],
  },
  {
    id: "process-stack",
    label: "Process steps & technology",
    description: "The three-step process (homepage and Contact page) and the technology stack cards (homepage and About page).",
    fields: [
      ...listFields("process", "Step", PROCESS_STEPS, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      ...TECH_STACK.flatMap((group, i) => [
        { id: `stack.${i + 1}.title`, label: `Technology card ${i + 1} — heading`, value: group.group },
        {
          id: `stack.${i + 1}.items`,
          label: `Technology card ${i + 1} — tools`,
          value: group.items.join(", "),
          hint: "Separate the tools with commas",
        },
      ]),
    ],
  },
  {
    id: "navigation",
    label: "Navigation menu",
    description: "The menu across the top of every page, its Products drop-down, and the phone menu.",
    fields: navFields,
  },
  {
    id: "footer",
    label: "Footer",
    description: "The foot of every page: the short pitch, link columns, social buttons and the bottom line.",
    fields: footerFields,
  },
  {
    id: "search",
    label: "Search",
    description: "The search box that opens from the magnifying glass (or Ctrl/Cmd + K).",
    fields: [
      { id: "search.placeholder", label: "Search box hint text", value: "Search products, solutions, case studies..." },
      { id: "search.esc", label: "Close key label", value: "ESC" },
      { id: "search.noResults", label: "No results message", value: "No results for", hint: "Followed by what the visitor typed" },
      { id: "search.hint.navigate", label: "Keyboard hint — move", value: "↑↓ Navigate" },
      { id: "search.hint.open", label: "Keyboard hint — open", value: "↵ Open" },
      { id: "search.footer", label: "Name in the bottom corner", value: "AURAVEX Search" },
      { id: "search.group.products", label: "Result type — products", value: "Products" },
      { id: "search.group.solutions", label: "Result type — solutions", value: "Solutions" },
      { id: "search.group.industries", label: "Result type — industries", value: "Industries" },
      { id: "search.group.caseStudies", label: "Result type — case studies", value: "Case Studies" },
      { id: "search.group.pages", label: "Result type — pages", value: "Pages" },
      ...listFields("search.page", "Page result", SEARCH_PAGES, [
        { key: "label", label: "name" },
        { key: "description", label: "description" },
      ]),
    ],
  },
  {
    id: "not-found",
    label: "404 page",
    description: "What visitors see when they follow a link to a page that does not exist.",
    fields: [
      { id: "notfound.eyebrow", label: "Small label above", value: "Error 404" },
      { id: "notfound.code", label: "Big number", value: "404" },
      { id: "notfound.title", label: "Heading", value: "This page never made it to production." },
      {
        id: "notfound.body",
        label: "Paragraph",
        value:
          "The address you followed does not match anything we publish. It may have moved, or it may have been one of the ideas that did not survive review.",
        long: true,
      },
      { id: "notfound.home", label: "Home button", value: "Back to home" },
      { id: "notfound.products", label: "Products button", value: "Browse products" },
    ],
  },
  {
    id: "small-labels",
    label: "Small labels",
    description: "Little bits of text around the site: theme picker, loading screen, product status badges and more.",
    fields: [
      { id: "theme.label", label: "Theme picker — before it loads", value: "Theme" },
      { id: "theme.group.own", label: "Theme picker — your themes heading", value: "Your themes" },
      { id: "theme.group.dark", label: "Theme picker — dark heading", value: "Dark" },
      { id: "theme.group.light", label: "Theme picker — light heading", value: "Light" },
      { id: "mode.toLight", label: "Light/dark button tooltip (in dark mode)", value: "Switch to light mode" },
      { id: "mode.toDark", label: "Light/dark button tooltip (in light mode)", value: "Switch to dark mode" },
      { id: "preloader.label", label: "Loading screen text", value: "INITIALISING SYSTEM" },
      { id: "status.live", label: "Product status — live", value: STATUS_LABELS.live },
      { id: "status.beta", label: "Product status — beta", value: STATUS_LABELS.beta },
      { id: "status.development", label: "Product status — in development", value: STATUS_LABELS.development },
      { id: "status.coming-soon", label: "Product status — coming soon", value: STATUS_LABELS["coming-soon"] },
      { id: "marquee.label", label: "Sector band heading (default)", value: "The sectors we build for, every day" },
      { id: "legal.updated", label: "Privacy/Terms — date label", value: "Last updated ·", hint: "Followed by the date" },
      {
        id: "cta.emailLead",
        label: "Closing band — email line",
        value: "Or email us directly at",
        hint: "Followed by the email address from the Brand section",
      },
      {
        id: "seo.keywords",
        label: "Search-engine keywords",
        value: SEO_KEYWORDS.join(", "),
        long: true,
        hint: "Separate the keywords with commas",
      },
    ],
  },
];
