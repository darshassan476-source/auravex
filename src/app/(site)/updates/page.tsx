import type { Metadata } from "next";
import { CTASection } from "@/components/sections/CTASection";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Primitives";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { Text } from "@/cms/Text";
import { getSiteBundle } from "@/server/cache";
import { UpdatesList } from "./UpdatesList";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  const title = text["ex.updates.meta.title"] || CONTENT_DEFAULTS["ex.updates.meta.title"];
  const description = text["ex.updates.meta.description"] || CONTENT_DEFAULTS["ex.updates.meta.description"];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/updates" },
    openGraph: { title, description, url: "/updates" },
  };
}

export default function UpdatesPage() {
  return (
    <>
      <PageHero
        background="dark-hero-04"
        eyebrow={<Text id="ex.updates.eyebrow" />}
        title={<Text id="ex.updates.title" />}
        accent={<Text id="ex.updates.accent" />}
        description={<Text id="ex.updates.body" />}
      />

      <Section className="pt-2">
        <UpdatesList />
      </Section>

      <CTASection
        eyebrow={<Text id="ex.home.contact.eyebrow" />}
        title={<Text id="ex.home.contact.title" />}
        accent={null}
        description={<Text id="ex.home.contact.body" />}
        primaryLabel={<Text id="ex.home.contact.primary" />}
        secondaryLabel={<Text id="ex.home.contact.secondary" />}
      />
    </>
  );
}
