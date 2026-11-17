import type { ContentGroup } from "../contentSchema";
import { listFields } from "../lists";
import { ADDITIONAL_CAPABILITIES, DEPLOYMENT_STEPS, INDUSTRIES, OUTCOMES } from "@/data/enterprise";

/**
 * Copy for the enterprise portfolio: home, Enterprise Solutions, product
 * pages and the enquiry flow. Ids carry the `ex.` prefix so older overrides
 * written for the previous site can never resurface on these sections.
 */
export const ENTERPRISE_GROUPS: ContentGroup[] = [
  {
    id: "ex-home-hero",
    label: "Home — hero",
    description: "The opening statement of the site.",
    fields: [
      { id: "ex.hero.eyebrow", label: "Eyebrow", value: "Enterprise Software & AI Solutions" },
      { id: "ex.hero.title", label: "Headline, first part", value: "Intelligent Software." },
      { id: "ex.hero.accent", label: "Headline, accented part", value: "Built for Enterprise." },
      {
        id: "ex.hero.body",
        label: "Supporting text",
        long: true,
        value:
          "Auravex develops advanced enterprise software and AI-powered solutions that help organizations modernize operations, manage complexity, and achieve measurable business outcomes.",
      },
      { id: "ex.hero.primary", label: "Primary button", value: "Explore Our Solutions" },
      { id: "ex.hero.secondary", label: "Secondary button", value: "Discuss Your Requirements" },
      { id: "ex.hero.pillar.1", label: "Pillar 1", value: "Enterprise software products" },
      { id: "ex.hero.pillar.2", label: "Pillar 2", value: "AI-powered business systems" },
      { id: "ex.hero.pillar.3", label: "Pillar 3", value: "Configurable deployments" },
      { id: "ex.hero.pillar.4", label: "Pillar 4", value: "Enterprise integrations" },
    ],
  },
  {
    id: "ex-home-sections",
    label: "Home — sections",
    description: "Headings and introductions for each section below the hero.",
    fields: [
      { id: "ex.home.solutions.eyebrow", label: "Solutions — eyebrow", value: "Enterprise Solutions" },
      { id: "ex.home.solutions.title", label: "Solutions — heading", value: "Software products built for how enterprises operate" },
      {
        id: "ex.home.solutions.body",
        label: "Solutions — introduction",
        long: true,
        value:
          "Each Auravex product addresses a specific operational challenge — documents, sustainability, AI agents, enterprise management, business intelligence and construction delivery — and can be configured to your organisation.",
      },
      { id: "ex.home.solutions.button", label: "Solutions — button", value: "View All Solutions" },
      { id: "ex.home.outcomes.eyebrow", label: "Outcomes — eyebrow", value: "Built Around Business Outcomes" },
      { id: "ex.home.outcomes.title", label: "Outcomes — heading", value: "We start from the problem, not the technology" },
      {
        id: "ex.home.outcomes.body",
        label: "Outcomes — introduction",
        long: true,
        value:
          "Organisations rarely lack software. They lack systems that fit how work actually moves between people, departments and data. Auravex products are designed around those problems.",
      },
      ...listFields("ex.outcome", "Outcome", OUTCOMES, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "ex.home.industries.eyebrow", label: "Industries — eyebrow", value: "Industries We Serve" },
      { id: "ex.home.industries.title", label: "Industries — heading", value: "Focused on sectors with complex operations" },
      {
        id: "ex.home.industries.body",
        label: "Industries — introduction",
        long: true,
        value: "Our products are used and adapted where information, compliance and coordination carry real cost.",
      },
      { id: "ex.home.industries.button", label: "Industries — button", value: "Explore Industries" },
      ...listFields("ex.industry", "Industry", INDUSTRIES, [
        { key: "title", label: "name" },
        { key: "body", label: "description", long: true },
      ]),
      { id: "ex.home.deploy.eyebrow", label: "Deployment — eyebrow", value: "Enterprise Deployment" },
      { id: "ex.home.deploy.title", label: "Deployment — heading", value: "Configured, integrated and deployed to your requirements" },
      {
        id: "ex.home.deploy.body",
        label: "Deployment — introduction",
        long: true,
        value:
          "Every Auravex solution starts from a working product and is then shaped to your organisation — its structure, its systems and its security requirements.",
      },
      ...listFields("ex.deploy", "Deployment step", DEPLOYMENT_STEPS, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "ex.home.caps.eyebrow", label: "Capabilities — eyebrow", value: "Additional Capabilities" },
      { id: "ex.home.caps.title", label: "Capabilities — heading", value: "Extend any solution as your needs grow" },
      {
        id: "ex.home.caps.body",
        label: "Capabilities — introduction",
        long: true,
        value:
          "Optional capabilities can be added to any product. You choose only what your organisation needs; nothing here is mandatory.",
      },
      ...listFields("ex.cap", "Capability", ADDITIONAL_CAPABILITIES, [
        { key: "title", label: "title" },
        { key: "body", label: "text", long: true },
      ]),
      { id: "ex.home.updates.eyebrow", label: "Updates — eyebrow", value: "Latest Updates" },
      { id: "ex.home.updates.title", label: "Updates — heading", value: "Product developments and announcements" },
      { id: "ex.home.updates.button", label: "Updates — button", value: "All Updates" },
      {
        id: "ex.home.updates.empty",
        label: "Updates — when nothing is published",
        value: "New product announcements will be published here.",
      },
      { id: "ex.home.contact.eyebrow", label: "Contact — eyebrow", value: "Business Discussion" },
      { id: "ex.home.contact.title", label: "Contact — heading", value: "Tell us what your organisation needs" },
      {
        id: "ex.home.contact.body",
        label: "Contact — text",
        long: true,
        value:
          "Share your requirements and our team will walk you through the relevant solution, the deployment options and a commercial proposal.",
      },
      { id: "ex.home.contact.primary", label: "Contact — primary button", value: "Discuss Your Requirements" },
      { id: "ex.home.contact.secondary", label: "Contact — secondary button", value: "Explore Our Solutions" },
    ],
  },
  {
    id: "ex-solutions",
    label: "Enterprise Solutions page",
    description: "The product listing at /products.",
    fields: [
      { id: "ex.solutions.meta.title", label: "Browser tab title", value: "Enterprise Solutions — AI-Powered Enterprise Software" },
      {
        id: "ex.solutions.meta.description",
        label: "Search description",
        long: true,
        value:
          "Enterprise software solutions from Auravex: AI document management, enterprise AI agents, business intelligence dashboards, construction management software and more.",
      },
      { id: "ex.solutions.eyebrow", label: "Eyebrow", value: "Enterprise Solutions" },
      { id: "ex.solutions.title", label: "Heading", value: "Enterprise software for operations, information and decisions" },
      {
        id: "ex.solutions.body",
        label: "Introduction",
        long: true,
        value:
          "Explore the Auravex product portfolio. Every solution can be configured, extended with optional modules and deployed to your organisation's requirements.",
      },
      { id: "ex.solutions.countOne", label: "Count label — one product", value: "Enterprise Solution" },
      { id: "ex.solutions.countMany", label: "Count label — several products", value: "Enterprise Solutions" },
      { id: "ex.solutions.pipeline.eyebrow", label: "Upcoming section — eyebrow", value: "Product Pipeline" },
      { id: "ex.solutions.pipeline.title", label: "Upcoming section — heading", value: "In Development & Upcoming" },
      {
        id: "ex.solutions.pipeline.body",
        label: "Upcoming section — text",
        long: true,
        value: "Solutions we are preparing for release. Request an early preview or discuss your requirements with our team.",
      },
      { id: "ex.solutions.empty", label: "When nothing is listed", value: "New enterprise solutions will be listed here shortly." },
      { id: "ex.card.explore", label: "Card — details link", value: "View Solution" },
      { id: "ex.card.demo", label: "Card — demo link", value: "Quick Demo" },
    ],
  },
  {
    id: "ex-product",
    label: "Product pages",
    description: "Section headings and fixed wording on every product page.",
    fields: [
      { id: "ex.product.back", label: "Back link", value: "Enterprise Solutions" },
      { id: "ex.product.overview", label: "Overview heading", value: "Product overview" },
      { id: "ex.product.problems", label: "Problems heading", value: "Business problems it solves" },
      { id: "ex.product.capabilities", label: "Capabilities heading", value: "Main capabilities" },
      { id: "ex.product.modules", label: "Modules heading", value: "Available modules" },
      { id: "ex.product.ai", label: "AI heading", value: "AI capabilities" },
      { id: "ex.product.workflows", label: "Workflows heading", value: "Supported workflows" },
      { id: "ex.product.deployment", label: "Deployment heading", value: "Enterprise deployment options" },
      { id: "ex.product.integrations", label: "Integrations heading", value: "Integration possibilities" },
      { id: "ex.product.industries", label: "Industries heading", value: "Industries that can benefit" },
      { id: "ex.product.optional", label: "Optional modules heading", value: "Optional additional modules" },
      { id: "ex.product.customers", label: "Customer deployments heading", value: "Customer deployments" },
      { id: "ex.product.customization", label: "Customisation heading", value: "Customisation options" },
      { id: "ex.product.demo", label: "Quick Demo button", value: "Quick Demo" },
      { id: "ex.product.consult", label: "Consultation button", value: "Request a Consultation" },
      { id: "ex.product.noDemo", label: "When no public demo", value: "A guided demonstration is available on request." },
      { id: "ex.product.requestDemo", label: "Request demo button", value: "Request a Demo" },
      { id: "ex.product.pricing.title", label: "Pricing heading", value: "Commercial information" },
      {
        id: "ex.product.pricing.body",
        label: "Pricing statement",
        value: "Enterprise pricing tailored to your organization’s requirements.",
      },
      { id: "ex.product.pricing.button", label: "Proposal button", value: "Request Commercial Proposal" },
      { id: "ex.product.dev.label", label: "Under development — label", value: "Currently Under Development" },
      {
        id: "ex.product.dev.body",
        label: "Under development — text",
        long: true,
        value:
          "We are expanding this solution with additional enterprise capabilities. Request an early preview or discuss your requirements with our team.",
      },
      { id: "ex.product.upcoming.label", label: "Upcoming — label", value: "Upcoming Release" },
      { id: "ex.product.unavailable.label", label: "Unavailable — label", value: "Temporarily Unavailable" },
      {
        id: "ex.product.unavailable.body",
        label: "Unavailable — text",
        long: true,
        value: "This solution is temporarily unavailable for new deployments. Contact our team to discuss your requirements.",
      },
      { id: "ex.product.preview.request", label: "Request preview button", value: "Request a Preview" },
      { id: "ex.product.preview.view", label: "View preview button", value: "View Preview" },
      { id: "ex.product.preview.release", label: "Expected release label", value: "Expected release" },
      { id: "ex.product.adoption", label: "Adoption heading", value: "Adoption" },
    ],
  },
  {
    id: "ex-configure",
    label: "Customize Your Solution & enquiries",
    description: "The configurator on product pages and the enquiry form.",
    fields: [
      { id: "ex.cfg.title", label: "Configurator heading", value: "Customize Your Solution" },
      {
        id: "ex.cfg.body",
        label: "Configurator introduction",
        long: true,
        value:
          "Start from the base product and add only what your organisation needs. Every option below is optional — select what is relevant and our team will prepare a tailored proposal.",
      },
      { id: "ex.cfg.modules", label: "Step — modules", value: "Additional modules" },
      { id: "ex.cfg.departments", label: "Step — departments", value: "Departments using the software" },
      { id: "ex.cfg.users", label: "Step — users", value: "Approximate number of users" },
      { id: "ex.cfg.ai", label: "Step — AI enhancements", value: "AI enhancements" },
      { id: "ex.cfg.voice", label: "Step — voice AI", value: "Voice-to-voice AI" },
      {
        id: "ex.cfg.voice.note",
        label: "Voice AI note",
        long: true,
        value:
          "Spoken, conversational interaction with the system. This is an advanced capability that can require additional implementation and licensing costs.",
      },
      { id: "ex.cfg.integrations", label: "Step — integrations", value: "Integrations with your existing systems" },
      { id: "ex.cfg.workflows", label: "Step — workflows", value: "Custom workflows or automation" },
      { id: "ex.cfg.deployment", label: "Step — deployment", value: "Preferred deployment" },
      { id: "ex.cfg.summary", label: "Summary heading", value: "Your selection" },
      { id: "ex.cfg.summaryEmpty", label: "Summary — nothing selected", value: "Base product only. Add options above if you need them." },
      { id: "ex.cfg.submit", label: "Configurator button", value: "Continue to Enquiry" },
      { id: "ex.enquiry.meta.title", label: "Enquiry page — tab title", value: "Discuss Your Requirements" },
      { id: "ex.enquiry.eyebrow", label: "Enquiry page — eyebrow", value: "Business Discussion" },
      { id: "ex.enquiry.title", label: "Enquiry page — heading", value: "Discuss your requirements with Auravex" },
      {
        id: "ex.enquiry.body",
        label: "Enquiry page — introduction",
        long: true,
        value:
          "Configure a solution with the modules and capabilities you need, or simply request a consultation. Our team responds to every enquiry personally.",
      },
      { id: "ex.enquiry.pathA", label: "Path A", value: "Configure Your Solution" },
      { id: "ex.enquiry.pathA.body", label: "Path A — text", value: "Select a product, optional modules and requirements." },
      { id: "ex.enquiry.pathB", label: "Path B", value: "Direct Consultation" },
      { id: "ex.enquiry.pathB.body", label: "Path B — text", value: "Request a meeting without choosing any options." },
      { id: "ex.enquiry.success.title", label: "Confirmation — heading", value: "Thank you — your enquiry has been received" },
      {
        id: "ex.enquiry.success.body",
        label: "Confirmation — text",
        long: true,
        value: "A member of our team will review your requirements and contact you by email, usually within one business day.",
      },
      {
        id: "ex.enquiry.meeting.note",
        label: "Meeting note",
        long: true,
        value: "Tell us a few times that suit you. We will confirm the meeting by email.",
      },
    ],
  },
];
