/**
 * Every piece of front-end copy the admin portal can edit.
 *
 * One flat registry rather than scattered defaults: the admin Content screen
 * renders straight from this, and `useText(id)` on the public site falls back
 * to `value` whenever nothing has been overridden. Adding an editable string
 * means adding one entry here and reading it through `useText`.
 */
import { SITE } from "@/data/site";
import { ABOUT_CONTACT_GROUPS } from "./content/aboutContact";
import { CHROME_GROUPS } from "./content/chrome";
import { PRODUCTS_LEGAL_GROUPS } from "./content/productsLegal";
import { SECTORS_WORK_GROUPS } from "./content/sectorsWork";
import { ENTERPRISE_GROUPS } from "./content/enterprise";
import { PAGES_GROUPS } from "./content/pages";

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

const CORE_GROUPS: ContentGroup[] = [
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
    ],
  },
];

/** Every group, in the order the Content screen lists them. Each page's copy lives in `./content/`. */
export const CONTENT_GROUPS: ContentGroup[] = [
  ...CORE_GROUPS,
  ...ENTERPRISE_GROUPS,
  ...PAGES_GROUPS,
  ...CHROME_GROUPS,
  ...ABOUT_CONTACT_GROUPS,
  ...SECTORS_WORK_GROUPS,
  ...PRODUCTS_LEGAL_GROUPS,
];

/** Flat id -> default, for `useText` lookups. */
export const CONTENT_DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_GROUPS.flatMap((group) => group.fields.map((f) => [f.id, f.value])),
);
