import type { Metadata } from "next";
import { Text } from "@/cms/Text";
import { BlockSlot } from "@/components/sections/BlockSlot";
import { CTASection } from "@/components/sections/CTASection";
import { HomeHero } from "@/components/sections/HomeHero";
import {
  CapabilityList,
  DeploymentSteps,
  IndustryGrid,
  LatestUpdates,
  OutcomeGrid,
  UpdatesButton,
} from "@/components/sections/HomeSections";
import { SectionHead } from "@/components/sections/SectionHead";
import { SolutionCount, SolutionsGrid } from "@/components/sections/SolutionsGrid";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: { absolute: "AURAVEX — Enterprise Software & AI Solutions" },
  description:
    "Auravex develops AI-powered enterprise software: document management, enterprise AI agents, business intelligence, sustainability and construction management solutions, configured and deployed to your requirements.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <BlockSlot page="home" slot="after-hero" />

      {/* 1. Enterprise Solutions */}
      <Section id="solutions" className="pt-16 md:pt-20">
        <SectionHead
          eyebrow={<SolutionCount />}
          title={<Text id="ex.home.solutions.title" />}
          description={<Text id="ex.home.solutions.body" />}
          action={
            <Button href="/products" variant="outline" icon="arrow-right" magnetic={false}>
              <Text id="ex.home.solutions.button" />
            </Button>
          }
        />
        <SolutionsGrid className="mt-12" />
      </Section>

      {/* 2. Built Around Business Outcomes */}
      <Section>
        <SectionHead
          eyebrow={<Text id="ex.home.outcomes.eyebrow" />}
          title={<Text id="ex.home.outcomes.title" />}
          description={<Text id="ex.home.outcomes.body" />}
        />
        <OutcomeGrid />
      </Section>

      {/* 3. Industries We Serve */}
      <Section>
        <SectionHead
          eyebrow={<Text id="ex.home.industries.eyebrow" />}
          title={<Text id="ex.home.industries.title" />}
          description={<Text id="ex.home.industries.body" />}
          action={
            <Button href="/industries" variant="outline" icon="arrow-right" magnetic={false}>
              <Text id="ex.home.industries.button" />
            </Button>
          }
        />
        <IndustryGrid />
      </Section>

      {/* 4. Enterprise Deployment */}
      <Section>
        <SectionHead
          eyebrow={<Text id="ex.home.deploy.eyebrow" />}
          title={<Text id="ex.home.deploy.title" />}
          description={<Text id="ex.home.deploy.body" />}
        />
        <DeploymentSteps />
      </Section>

      {/* 5. Additional Capabilities */}
      <Section>
        <SectionHead
          eyebrow={<Text id="ex.home.caps.eyebrow" />}
          title={<Text id="ex.home.caps.title" />}
          description={<Text id="ex.home.caps.body" />}
        />
        <CapabilityList />
      </Section>

      {/* 6. Latest Updates */}
      <Section>
        <SectionHead
          eyebrow={<Text id="ex.home.updates.eyebrow" />}
          title={<Text id="ex.home.updates.title" />}
          action={<UpdatesButton />}
        />
        <LatestUpdates />
      </Section>

      <BlockSlot page="home" slot="before-cta" />

      {/* 7. Contact / Business Discussion */}
      <CTASection
        eyebrow={<Text id="ex.home.contact.eyebrow" />}
        title={<Text id="ex.home.contact.title" />}
        accent=""
        description={<Text id="ex.home.contact.body" />}
        primaryLabel={<Text id="ex.home.contact.primary" />}
        primaryHref="/contact"
        secondaryLabel={<Text id="ex.home.contact.secondary" />}
        secondaryHref="/products"
      />
    </>
  );
}
