import type { ContentGroup } from "../contentSchema";
import { listFields } from "../lists";
import { ABOUT_BUILD, ABOUT_DELIVERY, ABOUT_READINESS } from "@/data/aboutCopy";

/** Copy for About, Industries, Latest Updates and other secondary pages. */
export const PAGES_GROUPS: ContentGroup[] = [
  {
    id: "ex-cta",
    label: "Closing call to action",
    description: "The band that closes most pages, and the sticky bar on phones.",
    fields: [
      { id: "ex.cta.eyebrow", label: "Eyebrow", value: "Business Discussion" },
      { id: "ex.cta.title", label: "Heading", value: "Discuss your organisation’s" },
      { id: "ex.cta.accent", label: "Accented phrase", value: "requirements." },
      {
        id: "ex.cta.body",
        label: "Paragraph",
        long: true,
        value:
          "Tell us what you need to achieve. We will recommend the right Auravex solution, the optional capabilities that fit and how it can be deployed.",
      },
      { id: "ex.cta.primary", label: "Primary button", value: "Discuss Your Requirements" },
      { id: "ex.cta.secondary", label: "Secondary button", value: "Explore Our Solutions" },
      { id: "ex.cta.emailLead", label: "Email line", value: "Or email us directly at", hint: "Followed by the email address from the Brand section" },
      {
        id: "ex.mobile.cta.body",
        label: "Phone bar — message",
        long: true,
        value: "Explore enterprise software and AI solutions for your organisation.",
      },
      { id: "ex.mobile.cta.button", label: "Phone bar — button", value: "Discuss Requirements" },
    ],
  },
  {
    id: "ex-about",
    label: "About page",
    description: "Who Auravex is, what it builds and how it delivers.",
    fields: [
      { id: "ex.about.meta.title", label: "Browser tab title", value: "About Auravex — Enterprise Software & AI Solutions" },
      {
        id: "ex.about.meta.description",
        label: "Search description",
        long: true,
        value:
          "Auravex is an international enterprise software and AI solutions company building products for document management, automation, business intelligence and construction delivery.",
      },
      { id: "ex.about.eyebrow", label: "Eyebrow", value: "About Auravex" },
      { id: "ex.about.title", label: "Heading", value: "An enterprise software and" },
      { id: "ex.about.accent", label: "Heading — accented words", value: "AI solutions company." },
      {
        id: "ex.about.body",
        label: "Introduction",
        long: true,
        value:
          "Auravex develops enterprise software products that help organisations improve operations, manage information, automate business processes and make better decisions. We work with organisations internationally, from our base in the United Arab Emirates.",
      },
      { id: "ex.about.build.eyebrow", label: "What we build — eyebrow", value: "What We Build" },
      { id: "ex.about.build.title", label: "What we build — heading", value: "Products first, configured for each organisation" },
      {
        id: "ex.about.build.body",
        label: "What we build — introduction",
        long: true,
        value:
          "Our focus is a defined portfolio of enterprise products — not a catalogue of services. Each product solves a specific operational problem and is then adapted to the organisation deploying it.",
      },
      ...listFields("ex.about.build", "Focus area", ABOUT_BUILD, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "ex.about.build.button", label: "What we build — button", value: "Explore Enterprise Solutions" },
      { id: "ex.about.delivery.eyebrow", label: "How we deliver — eyebrow", value: "How We Deliver" },
      { id: "ex.about.delivery.title", label: "How we deliver — heading", value: "From working product to working deployment" },
      {
        id: "ex.about.delivery.body",
        label: "How we deliver — introduction",
        long: true,
        value:
          "Every engagement starts from a product that already works. The effort goes into fitting it to your organisation, connecting it to your systems and deploying it where you need it.",
      },
      ...listFields("ex.about.delivery", "Delivery step", ABOUT_DELIVERY, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "ex.about.ready.eyebrow", label: "Enterprise readiness — eyebrow", value: "Enterprise Readiness" },
      { id: "ex.about.ready.title", label: "Enterprise readiness — heading", value: "Designed for the way enterprises buy and run software" },
      {
        id: "ex.about.ready.body",
        label: "Enterprise readiness — introduction",
        long: true,
        value:
          "Security, access and deployment requirements are agreed with your IT and compliance teams during each engagement.",
      },
      ...listFields("ex.about.ready", "Readiness point", ABOUT_READINESS, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "ex.about.cta.eyebrow", label: "Closing — eyebrow", value: "Work With Us" },
      { id: "ex.about.cta.title", label: "Closing — heading", value: "Discuss your" },
      { id: "ex.about.cta.accent", label: "Closing — accented words", value: "requirements." },
      {
        id: "ex.about.cta.body",
        label: "Closing — text",
        long: true,
        value: "Tell us about your organisation and the challenge you want to solve. Our team will recommend the right solution and deployment approach.",
      },
      { id: "ex.about.cta.primary", label: "Closing — primary button", value: "Discuss Your Requirements" },
      { id: "ex.about.cta.secondary", label: "Closing — secondary button", value: "Enterprise Solutions" },
    ],
  },
  {
    id: "ex-industries",
    label: "Industries page",
    description: "Headings around the five industries (the industry names and descriptions are edited under Home — sections).",
    fields: [
      { id: "ex.industries.meta.title", label: "Browser tab title", value: "Industries — Enterprise Software for Complex Sectors" },
      {
        id: "ex.industries.meta.description",
        label: "Search description",
        long: true,
        value:
          "Auravex enterprise software for real estate development, construction and delivery, healthcare and hospitals, IT and technology, and government and the public sector.",
      },
      { id: "ex.industries.eyebrow", label: "Eyebrow", value: "Industries We Serve" },
      { id: "ex.industries.title", label: "Heading", value: "Enterprise software for sectors with" },
      { id: "ex.industries.accent", label: "Heading — accented words", value: "complex operations." },
      {
        id: "ex.industries.body",
        label: "Introduction",
        long: true,
        value:
          "We focus on industries where information, compliance and coordination carry real cost — and where the right system makes a measurable difference.",
      },
      { id: "ex.industries.relevant", label: "Relevant solutions label", value: "Relevant solutions" },
      { id: "ex.industries.none", label: "When no product is tagged", value: "Discuss your requirements to see which solution fits." },
      { id: "ex.industries.cta.title", label: "Closing — heading", value: "Your sector, your" },
      { id: "ex.industries.cta.accent", label: "Closing — accented word", value: "requirements." },
      {
        id: "ex.industries.cta.body",
        label: "Closing — text",
        long: true,
        value: "Tell us how your organisation operates and we will show you how an Auravex solution can be configured for it.",
      },
    ],
  },
  {
    id: "ex-updates",
    label: "Latest Updates page",
    description: "The /updates page. The updates themselves are managed under Latest Updates.",
    fields: [
      { id: "ex.updates.meta.title", label: "Browser tab title", value: "Latest Updates — Product News and Announcements" },
      {
        id: "ex.updates.meta.description",
        label: "Search description",
        long: true,
        value: "New AI capabilities, modules, integrations, deployments and announcements across the Auravex enterprise software portfolio.",
      },
      { id: "ex.updates.eyebrow", label: "Eyebrow", value: "Latest Updates" },
      { id: "ex.updates.title", label: "Heading", value: "Product developments and" },
      { id: "ex.updates.accent", label: "Heading — accented word", value: "announcements." },
      {
        id: "ex.updates.body",
        label: "Introduction",
        long: true,
        value: "New capabilities, modules, integrations and releases across the Auravex enterprise solutions portfolio.",
      },
      { id: "ex.updates.all", label: "Filter — everything", value: "All updates" },
      { id: "ex.updates.empty", label: "When nothing is published", value: "New product announcements will be published here." },
    ],
  },
];
