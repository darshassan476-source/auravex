import type { ContentField, ContentGroup } from "../contentSchema";
import { listFields } from "../lists";
import { PRODUCT_FILTERS } from "@/data/products";
import { PRIVACY_SECTIONS, TERMS_SECTIONS, type LegalCopySection } from "@/data/legalCopy";

/** Heading + paragraphs of each legal section, numbered like the page shows them. */
function legalSectionFields(prefix: string, sections: LegalCopySection[]): ContentField[] {
  return sections.flatMap((section, i) => [
    { id: `${prefix}.${i + 1}.heading`, label: `Section ${i + 1} — heading`, value: section.heading },
    ...section.body.map((paragraph, j) => ({
      id: `${prefix}.${i + 1}.body.${j + 1}`,
      label: `Section ${i + 1} — paragraph ${j + 1}`,
      value: paragraph,
      long: true,
      ...(paragraph.includes("{email}") ? { hint: "{email} is replaced with the company email" } : {}),
    })),
  ]);
}

const NAME_HINT = "{name} is replaced with the product's name";

/** Editable copy: Products pages and the legal pages. */
export const PRODUCTS_LEGAL_GROUPS: ContentGroup[] = [
  {
    id: "products",
    label: "Products page",
    description: "The product gallery: heading, callouts, filter names and the closing call to action.",
    fields: [
      { id: "products.meta.title", label: "Browser tab title", value: "Products" },
      {
        id: "products.meta.description",
        label: "Search engine description",
        value:
          "The full AURAVEX product portfolio — AI engines, enterprise platforms, automation suites and developer tooling, all in production.",
        long: true,
      },
      { id: "products.hero.eyebrow", label: "Eyebrow pill", value: "Our Work / Product Gallery" },
      { id: "products.hero.title", label: "Heading", value: "Software Experiences\nDesigned to" },
      { id: "products.hero.accent", label: "Heading, accented word", value: "Impress.", hint: "Rendered in the gradient" },
      {
        id: "products.hero.body",
        label: "Intro paragraph",
        value:
          "From real estate and hospitality to enterprise operations, we design and build intelligent software products that solve complex challenges and deliver measurable impact.",
        long: true,
      },
      { id: "products.hero.card1", label: "Floating card 1", value: "Real Businesses. Real Impact." },
      { id: "products.hero.card2", label: "Floating card 2", value: "Built in Collaboration. For a Global Future." },
      { id: "products.hero.card3", label: "Floating card 3", value: "Enterprise Software That Scales." },
      ...listFields("products.filters", "Filter", PRODUCT_FILTERS, [{ key: "label", label: "name" }]),
      { id: "products.card.caseStudy", label: "Card link — when a case study exists", value: "View Case Study" },
      { id: "products.card.explore", label: "Card link — otherwise", value: "Explore Product" },
      { id: "products.cta.eyebrow", label: "Closing block — eyebrow", value: "Not on the list?" },
      { id: "products.cta.title", label: "Closing block — heading", value: "Most of our best work started as" },
      { id: "products.cta.accent", label: "Closing block — accented words", value: "something that did not exist." },
      {
        id: "products.cta.body",
        label: "Closing block — paragraph",
        value:
          "If your problem does not map onto any of these, that is usually the sign it is worth building properly. Tell us what you are up against.",
        long: true,
      },
      { id: "products.cta.primary", label: "Closing block — main button", value: "Start a conversation" },
      { id: "products.cta.secondary", label: "Closing block — second button", value: "See how we work" },
    ],
  },
  {
    id: "product",
    label: "Product page (every product)",
    description:
      "The wording shared by every product page. The product's own name, description, features and figures are edited in the product editor.",
    fields: [
      { id: "product.meta.notFound", label: "Browser tab title for a missing product", value: "Product not found" },
      { id: "product.breadcrumb", label: "Back link at the top", value: "Products" },
      { id: "product.actions.demo", label: "Button — quick demo", value: "Quick demo" },
      { id: "product.actions.meeting", label: "Button — set a meeting", value: "Set a meeting" },
      { id: "product.actions.film", label: "Button — watch the film", value: "Watch the film" },
      {
        id: "product.actions.demoNote",
        label: "Note under the demo button",
        value: "Opens the live product in a new tab.",
        hint: "Used when the product has no note of its own",
      },
      { id: "product.overview.eyebrow", label: "Overview — eyebrow", value: "Overview" },
      {
        id: "product.overview.title",
        label: "Overview — heading",
        value: "One Platform.\nThe Entire {domain}",
        hint: "{domain} is replaced with the product's sector, e.g. Real Estate",
      },
      { id: "product.overview.accent", label: "Overview — accented word", value: "Lifecycle." },
      {
        id: "product.overview.body",
        label: "Overview — paragraph",
        value:
          "{summary} From first touch to long-term value, AURAVEX {name} gives you a unified view across your operation with real-time data, AI-driven insight and automated workflows — so you move faster, decide better and deliver lasting results.",
        long: true,
        hint: "{summary} is the product's summary; {name} is its name",
      },
      { id: "product.overview.link", label: "Overview — link", value: "Explore the platform" },
      {
        id: "product.overview.caption",
        label: "Video caption",
        value: "Discover AURAVEX {name}",
        hint: `${NAME_HINT}. Used when the film has no caption of its own`,
      },
      {
        id: "product.overview.statement",
        label: "Statement panel — heading",
        value: "Transforming {domain} for a Smarter",
        hint: "{domain} is replaced with the product's sector",
      },
      { id: "product.overview.statementAccent", label: "Statement panel — accented word", value: "Tomorrow." },
      { id: "product.overview.values.1", label: "Statement panel — line 1", value: "Technology." },
      { id: "product.overview.values.2", label: "Statement panel — line 2", value: "People." },
      { id: "product.overview.values.3", label: "Statement panel — line 3", value: "Sustainable Growth." },
      { id: "product.architecture.eyebrow", label: "Architecture — eyebrow", value: "Architecture" },
      { id: "product.architecture.title", label: "Architecture — heading", value: "Four layers," },
      { id: "product.architecture.accent", label: "Architecture — accented words", value: "one contract." },
      {
        id: "product.architecture.body",
        label: "Architecture — paragraph",
        value:
          "Each layer is independently deployable and independently replaceable. You are never locked into a vendor decision we made on your behalf.",
        long: true,
      },
      { id: "product.architecture.stack", label: "Architecture — stack label", value: "Stack" },
      { id: "product.delivery.eyebrow", label: "Delivery — eyebrow", value: "Delivery" },
      { id: "product.delivery.title", label: "Delivery — heading", value: "From first call to" },
      { id: "product.delivery.accent", label: "Delivery — accented words", value: "measured impact." },
      { id: "product.related.eyebrow", label: "Related products — eyebrow", value: "Keep exploring" },
      { id: "product.related.title", label: "Related products — heading", value: "Often deployed" },
      { id: "product.related.accent", label: "Related products — accented word", value: "alongside." },
      { id: "product.related.all", label: "Related products — button", value: "All products" },
      { id: "product.cta.title", label: "Closing block — heading", value: "See {name} running on", hint: NAME_HINT },
      { id: "product.cta.accent", label: "Closing block — accented words", value: "your data." },
      {
        id: "product.cta.body",
        label: "Closing block — paragraph",
        value:
          "We will walk through the platform with your workflows in it — not a generic sandbox. Thirty minutes, no slide deck.",
        long: true,
      },
      { id: "product.cta.secondary", label: "Closing block — second button", value: "Compare products" },
    ],
  },
  {
    id: "privacy",
    label: "Privacy policy",
    description: "The privacy page: heading, date and every section.",
    fields: [
      { id: "privacy.meta.title", label: "Browser tab title", value: "Privacy" },
      {
        id: "privacy.meta.description",
        label: "Search engine description",
        value: "How AURAVEX collects, uses and protects the information you share with us.",
        long: true,
      },
      { id: "privacy.eyebrow", label: "Eyebrow", value: "Legal" },
      { id: "privacy.title", label: "Heading", value: "Privacy" },
      { id: "privacy.accent", label: "Heading, accented word", value: "policy." },
      {
        id: "privacy.intro",
        label: "Intro paragraph",
        value: "A short, plain-language account of what we collect, why, and what you can ask us to do about it.",
        long: true,
      },
      { id: "privacy.updated", label: "Last updated date", value: "24 September 2026" },
      ...legalSectionFields("privacy.sections", PRIVACY_SECTIONS),
    ],
  },
  {
    id: "terms",
    label: "Terms of use",
    description: "The terms page: heading, date and every section.",
    fields: [
      { id: "terms.meta.title", label: "Browser tab title", value: "Terms" },
      {
        id: "terms.meta.description",
        label: "Search engine description",
        value: "The terms that govern use of the AURAVEX website and the material published on it.",
        long: true,
      },
      { id: "terms.eyebrow", label: "Eyebrow", value: "Legal" },
      { id: "terms.title", label: "Heading", value: "Terms of" },
      { id: "terms.accent", label: "Heading, accented word", value: "use." },
      {
        id: "terms.intro",
        label: "Intro paragraph",
        value: "What you can do with the material on this site, and what we do and do not promise about it.",
        long: true,
      },
      { id: "terms.updated", label: "Last updated date", value: "24 September 2026" },
      ...legalSectionFields("terms.sections", TERMS_SECTIONS),
    ],
  },
];
