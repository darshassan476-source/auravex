import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/sections/LegalPage";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How AURAVEX collects, uses and protects the information you share with us.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    body: [
      "When you submit a demo request we collect the name, work email, organisation and message you provide, plus the product interest and indicative budget if you choose to share them.",
      "We collect aggregate analytics about how this site is used — pages viewed, referrer and approximate region. This is measured at the session level and is not linked to an identified individual.",
    ],
  },
  {
    heading: "Why we collect it",
    body: [
      "Contact details are used for one purpose: replying to you about the enquiry you sent. We do not add submitted addresses to a newsletter, a nurture sequence or any automated marketing list.",
      "Analytics tell us which parts of the site are useful and which are not, so we can make the case for our work more clearly.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We do not sell, rent or trade personal information. We do not share enquiry details with third-party advertisers or data brokers.",
      "We use a small number of infrastructure providers — hosting, email delivery and error monitoring — who process data strictly on our instructions under written agreements.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Enquiries are retained for twenty-four months so we can pick up a conversation where it left off, then deleted. Analytics data is retained in aggregate form for thirteen months.",
      "If an engagement begins, project data is governed by the data processing agreement in your contract rather than this policy.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can ask us for a copy of what we hold about you, ask us to correct it, or ask us to delete it. We action verified requests within thirty days at no cost.",
      `Send any request to ${SITE.email} with the subject line "Data request" and we will confirm receipt within one working day.`,
    ],
  },
  {
    heading: "Client project data",
    body: [
      "Platforms we build are deployed in your cloud account, in the region you nominate, with encryption keys you control. We hold no copy of your production data outside the environment you own.",
      "Where support requires temporary access, that access is time-bound, logged and revoked automatically at the end of the window.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "If this policy changes materially we will update the date at the top of this page and, where we hold your contact details for an active enquiry, tell you directly.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy"
      accent="policy."
      intro="A short, plain-language account of what we collect, why, and what you can ask us to do about it."
      updated="24 September 2026"
      sections={SECTIONS}
    />
  );
}
