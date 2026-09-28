import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/sections/LegalPage";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that govern use of the AURAVEX website and the material published on it.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Scope",
    body: [
      "These terms govern your use of this website. They do not govern any engagement between us — that is covered by the master services agreement and statement of work signed for the specific project.",
      "Where these terms and a signed agreement conflict, the signed agreement takes precedence.",
    ],
  },
  {
    heading: "Use of the site",
    body: [
      "You may read, print and share the material published here for your own evaluation and internal use. You may not republish it commercially, present it as your own, or use it to train a model without written permission.",
      "You agree not to attempt to gain unauthorised access to any part of the site, including the administration portal, or to interfere with its availability for others.",
    ],
  },
  {
    heading: "Accuracy of published figures",
    body: [
      "Metrics quoted in case studies and product pages come from client reporting after go-live and reflect specific deployments in specific conditions.",
      "They are evidence of what has been achieved, not a guarantee of what any future engagement will achieve. Nothing on this site constitutes a warranty of results.",
    ],
  },
  {
    heading: "Intellectual property",
    body: [
      "The AURAVEX name, logo, written material and interface design on this site are our property. Third-party names and marks appearing here belong to their respective owners.",
      "Source code written for a client engagement is assigned to that client on the terms set out in the relevant statement of work.",
    ],
  },
  {
    heading: "Third-party links",
    body: [
      "This site links to external services and repositories. We do not control them and are not responsible for their content, availability or privacy practices.",
    ],
  },
  {
    heading: "Availability",
    body: [
      "We aim to keep this site available continuously but make no commitment to uninterrupted access. We may change, suspend or withdraw any part of it without notice.",
      "Service levels for platforms we operate on your behalf are defined contractually and are not affected by this clause.",
    ],
  },
  {
    heading: "Liability",
    body: [
      "To the extent permitted by law, we accept no liability for loss arising from reliance on material published on this site. This does not limit liability for fraud or for anything that cannot lawfully be limited.",
    ],
  },
  {
    heading: "Governing law and contact",
    body: [
      "These terms are governed by the laws of the United Arab Emirates, and the courts of Dubai have exclusive jurisdiction over any dispute arising from them.",
      `Questions about these terms can be sent to ${SITE.email}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of"
      accent="use."
      intro="What you can do with the material on this site, and what we do and do not promise about it."
      updated="24 September 2026"
      sections={SECTIONS}
    />
  );
}
