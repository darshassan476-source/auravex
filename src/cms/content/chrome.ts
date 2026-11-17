import type { ContentField, ContentGroup } from "../contentSchema";
import { listFields } from "../lists";
import { STATUS_LABELS } from "@/data/products";
import { FOOTER_COLUMNS, NAV_ITEMS, SOCIAL_PROFILES } from "@/data/site";
import { SEARCH_PAGES, SEO_KEYWORDS } from "@/data/chromeCopy";

/**
 * Menu entries and buttons. Ids carry the `ex.` prefix: the menu changed
 * shape, and older overrides keyed by position must not land on new items.
 */
const navFields: ContentField[] = [
  ...listFields("ex.nav", "Menu item", NAV_ITEMS, [
    { key: "label", label: "name" },
    { key: "description", label: "short description", hint: "Shown in search results" },
  ]),
  { id: "ex.nav.cta", label: "Button at the top right", value: "Discuss Your Requirements" },
  { id: "ex.nav.mobile.cta", label: "Button at the foot of the phone menu", value: "Discuss Your Requirements" },
];

const footerFields: ContentField[] = [
  ...FOOTER_COLUMNS.flatMap((column, c) => [
    { id: `ex.footer.col.${c + 1}.title`, label: `Column ${c + 1} — heading`, value: column.title },
    ...column.links.map((link, l) => ({
      id: `ex.footer.col.${c + 1}.link.${l + 1}`,
      label: `Column ${c + 1} — link ${l + 1}`,
      value: link.label,
    })),
  ]),
  ...SOCIAL_PROFILES.map((social) => ({
    id: `ex.social.${social.id}.url`,
    label: `${social.label} address`,
    value: "",
    hint: "Full https:// address of your profile. The button appears in the footer only when this is filled in.",
  })),
  { id: "footer.rights", label: "Copyright line ending", value: "All rights reserved.", hint: "Follows “© year Company.”" },
];

export const CHROME_GROUPS: ContentGroup[] = [
  {
    id: "navigation",
    label: "Navigation menu",
    description: "The menu across the top of every page and the phone menu.",
    fields: navFields,
  },
  {
    id: "footer",
    label: "Footer",
    description: "The foot of every page: link columns, social profile addresses and the bottom line. The pitch is the company description from the Brand section.",
    fields: footerFields,
  },
  {
    id: "search",
    label: "Search",
    description: "The search box that opens from the magnifying glass (or Ctrl/Cmd + K).",
    fields: [
      { id: "ex.search.placeholder", label: "Search box hint text", value: "Search solutions, industries and pages..." },
      { id: "search.esc", label: "Close key label", value: "ESC" },
      { id: "search.noResults", label: "No results message", value: "No results for", hint: "Followed by what the visitor typed" },
      { id: "search.hint.navigate", label: "Keyboard hint — move", value: "↑↓ Navigate" },
      { id: "search.hint.open", label: "Keyboard hint — open", value: "↵ Open" },
      { id: "search.footer", label: "Name in the bottom corner", value: "AURAVEX Search" },
      { id: "ex.search.group.products", label: "Result type — products", value: "Enterprise Solutions" },
      { id: "search.group.industries", label: "Result type — industries", value: "Industries" },
      { id: "search.group.pages", label: "Result type — pages", value: "Pages" },
      ...listFields("ex.search.page", "Page result", SEARCH_PAGES, [
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
      { id: "ex.notfound.products", label: "Solutions button", value: "Browse Enterprise Solutions" },
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
      { id: "status.available", label: "Product status — available", value: STATUS_LABELS.available },
      { id: "status.preview", label: "Product status — preview available", value: STATUS_LABELS.preview },
      { id: "status.development", label: "Product status — under development", value: STATUS_LABELS.development },
      { id: "status.upcoming", label: "Product status — upcoming", value: STATUS_LABELS.upcoming },
      { id: "status.unavailable", label: "Product status — temporarily unavailable", value: STATUS_LABELS.unavailable },
      { id: "legal.updated", label: "Privacy/Terms — date label", value: "Last updated ·", hint: "Followed by the date" },
      {
        id: "cta.emailLead",
        label: "Closing band — email line",
        value: "Or email us directly at",
        hint: "Followed by the email address from the Brand section",
      },
      {
        id: "ex.seo.keywords",
        label: "Search-engine keywords",
        value: SEO_KEYWORDS.join(", "),
        long: true,
        hint: "Separate the keywords with commas",
      },
    ],
  },
];
