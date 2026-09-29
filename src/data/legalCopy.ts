/**
 * The built-in wording of the privacy and terms pages. Plain data, shared by
 * the pages and the editable-copy registry so the defaults stay word for word.
 *
 * `{email}` is replaced with the company email (Brand → Email) when rendered.
 * The number of sections and of paragraphs in each is fixed here; the words
 * themselves are editable in the portal.
 */
export interface LegalCopySection {
  heading: string;
  body: string[];
}

export const PRIVACY_SECTIONS: LegalCopySection[] = [
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
      `Send any request to {email} with the subject line "Data request" and we will confirm receipt within one working day.`,
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

export const TERMS_SECTIONS: LegalCopySection[] = [
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
      "Questions about these terms can be sent to {email}.",
    ],
  },
];
