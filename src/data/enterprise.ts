/**
 * Company-level content for the enterprise portfolio: industries served,
 * the outcomes the software is built around, how deployment works and the
 * optional capabilities offered on top of any product.
 *
 * Plain data so both pages and the content registry can import it; the text
 * here is the shipped default for each editable field.
 */

export const INDUSTRIES = [
  {
    slug: "real-estate-development",
    icon: "building",
    title: "Real Estate Development",
    body: "Portfolio, community and sustainability operations for developers and asset owners — from master communities to managed buildings.",
  },
  {
    slug: "construction-delivery",
    icon: "hard-hat",
    title: "Construction and Delivery",
    body: "Project controls, site coordination and delivery visibility for contractors and development managers running complex programmes.",
  },
  {
    slug: "healthcare-hospitals",
    icon: "heart-pulse",
    title: "Healthcare and Hospitals",
    body: "Controlled document handling, approvals and operational dashboards for hospitals and healthcare groups with strict compliance needs.",
  },
  {
    slug: "it-technology",
    icon: "cpu",
    title: "IT and Technology",
    body: "AI agents, automation and connected systems for technology organisations that want to scale operations without adding headcount.",
  },
  {
    slug: "government-public-sector",
    icon: "landmark",
    title: "Government and Public Sector",
    body: "Information management, workflow governance and reporting for public entities that need accountability, audit trails and data control.",
  },
] as const;

export const OUTCOMES = [
  {
    icon: "file",
    title: "Information that can be found",
    body: "Documents, records and knowledge organised, classified and searchable — so teams stop losing time looking for the latest version.",
  },
  {
    icon: "workflow",
    title: "Processes that run themselves",
    body: "Approvals, reviews and hand-offs move through defined workflows instead of email chains, with every step recorded.",
  },
  {
    icon: "chart",
    title: "Decisions backed by live data",
    body: "Operational and financial data consolidated into dashboards leadership can act on, rather than reports assembled by hand.",
  },
  {
    icon: "brain",
    title: "AI where it saves real effort",
    body: "AI applied to specific work — classifying documents, answering questions from records, assisting operations — not added for its own sake.",
  },
] as const;

export const DEPLOYMENT_STEPS = [
  {
    icon: "settings",
    title: "Configure",
    body: "Roles, departments, terminology and workflows set to match how your organisation already operates.",
  },
  {
    icon: "layers",
    title: "Customise",
    body: "Optional modules, fields, reports and branding added where your requirements go beyond the standard product.",
  },
  {
    icon: "link",
    title: "Integrate",
    body: "Connections to the systems you already run, so information flows in and out without re-keying.",
  },
  {
    icon: "cloud",
    title: "Deploy",
    body: "Cloud, private cloud or on-premises, agreed with your IT and security teams, followed by onboarding and support.",
  },
] as const;

export const ADDITIONAL_CAPABILITIES = [
  {
    icon: "sparkles",
    title: "Advanced AI features",
    body: "Additional AI models and assistants tailored to your documents, data and processes.",
  },
  {
    icon: "mic",
    title: "Voice-to-voice AI interaction",
    body: "Spoken conversations with your systems. Requires additional implementation and licensing.",
  },
  {
    icon: "box",
    title: "Additional software modules",
    body: "Extra functional modules added to the base product as your needs grow.",
  },
  {
    icon: "users",
    title: "Department-specific functionality",
    body: "Screens, fields and workflows built for individual departments.",
  },
  {
    icon: "link",
    title: "Enterprise integrations",
    body: "Connections to ERP, HR, finance, identity and other line-of-business systems.",
  },
  {
    icon: "chart",
    title: "Custom reporting",
    body: "Reports and dashboards designed around the measures your leadership uses.",
  },
  {
    icon: "workflow",
    title: "Additional automation",
    body: "Further automated workflows, notifications and approvals.",
  },
] as const;

/** Options offered in the configurator's deployment question. */
export const DEPLOYMENT_CHOICES = [
  { id: "cloud", label: "Cloud (SaaS)" },
  { id: "private-cloud", label: "Private cloud" },
  { id: "on-premises", label: "On-premises" },
  { id: "custom", label: "Custom enterprise deployment" },
  { id: "unsure", label: "Not sure yet — advise us" },
] as const;

/** Countries suggested on the enquiry form; any country can be typed. */
export const COUNTRY_SUGGESTIONS = [
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "United States",
  "United Kingdom",
  "Australia",
  "China",
  "India",
  "Pakistan",
  "Egypt",
] as const;
