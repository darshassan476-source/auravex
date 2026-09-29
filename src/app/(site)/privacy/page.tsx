import type { Metadata } from "next";
import { Text } from "@/cms/Text";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { LegalPage, type LegalSection } from "@/components/sections/LegalPage";
import { PRIVACY_SECTIONS } from "@/data/legalCopy";
import { getSiteBundle } from "@/server/cache";
import { LegalText } from "./LegalText";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  return {
    title: text["privacy.meta.title"] || CONTENT_DEFAULTS["privacy.meta.title"],
    description: text["privacy.meta.description"] || CONTENT_DEFAULTS["privacy.meta.description"],
  };
}

// Same number of sections and paragraphs as the shipped copy; the words come from the portal.
const SECTIONS: LegalSection[] = PRIVACY_SECTIONS.map((section, i) => ({
  heading: <Text id={`privacy.sections.${i + 1}.heading`} />,
  body: section.body.map((_, j) => <LegalText key={j} id={`privacy.sections.${i + 1}.body.${j + 1}`} />),
}));

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow={<Text id="privacy.eyebrow" />}
      title={<Text id="privacy.title" />}
      accent={<Text id="privacy.accent" />}
      intro={<Text id="privacy.intro" />}
      updated={<Text id="privacy.updated" />}
      sections={SECTIONS}
    />
  );
}
