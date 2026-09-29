import type { Metadata } from "next";
import { Text } from "@/cms/Text";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { LegalPage, type LegalSection } from "@/components/sections/LegalPage";
import { TERMS_SECTIONS } from "@/data/legalCopy";
import { getSiteBundle } from "@/server/cache";
import { LegalText } from "../privacy/LegalText";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  return {
    title: text["terms.meta.title"] || CONTENT_DEFAULTS["terms.meta.title"],
    description: text["terms.meta.description"] || CONTENT_DEFAULTS["terms.meta.description"],
  };
}

// Same number of sections and paragraphs as the shipped copy; the words come from the portal.
const SECTIONS: LegalSection[] = TERMS_SECTIONS.map((section, i) => ({
  heading: <Text id={`terms.sections.${i + 1}.heading`} />,
  body: section.body.map((_, j) => <LegalText key={j} id={`terms.sections.${i + 1}.body.${j + 1}`} />),
}));

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow={<Text id="terms.eyebrow" />}
      title={<Text id="terms.title" />}
      accent={<Text id="terms.accent" />}
      intro={<Text id="terms.intro" />}
      updated={<Text id="terms.updated" />}
      sections={SECTIONS}
    />
  );
}
