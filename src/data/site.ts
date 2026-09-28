import type { NavItem } from "@/lib/types";

export const SITE = {
  name: "AURAVEX",
  tagline: "Software for a Brighter Tomorrow",
  headline: "Building Intelligent Software Experiences",
  description:
    "Creating advanced software, AI solutions and digital products for the future.",
  email: "hello@auravex.com",
  phone: "+971 4 000 0000",
  location: "Dubai, United Arab Emirates",
  socials: [
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "X", href: "https://x.com" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Dribbble", href: "https://dribbble.com" },
  ],
} as const;

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Back to the start",
  },
  {
    label: "Products",
    href: "/products",
    description: "The full AURAVEX product portfolio",
    children: [
      { label: "Real Estate OS", href: "/products/real-estate-os", description: "End-to-end property operations" },
      { label: "Business Intelligence", href: "/products/business-intelligence", description: "Analytics and predictive insight" },
      { label: "Operations Suite", href: "/products/operations-suite", description: "Workflow and approval automation" },
      { label: "CRM & Lead Flow", href: "/products/crm-lead-flow", description: "Capture, nurture and convert" },
      { label: "Visitor Experience", href: "/products/visitor-experience", description: "Smart venues and digital concierge" },
      { label: "Custom Platforms", href: "/products/custom-platforms", description: "Tailored builds for your model" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    description: "Outcome-led software for real business problems",
  },
  {
    label: "Industries",
    href: "/industries",
    description: "Built for the sectors we know deeply",
  },
  {
    label: "Our Work",
    href: "/our-work",
    description: "Case studies and measurable results",
  },
  {
    label: "About",
    href: "/about",
    description: "The team, the method, the mission",
  },
];

export const FOOTER_COLUMNS: { title: string; links: NavItem[] }[] = [
  {
    title: "Products",
    links: [
      { label: "Real Estate OS", href: "/products/real-estate-os" },
      { label: "Business Intelligence", href: "/products/business-intelligence" },
      { label: "Operations Suite", href: "/products/operations-suite" },
      { label: "CRM & Lead Flow", href: "/products/crm-lead-flow" },
      { label: "Visitor Experience", href: "/products/visitor-experience" },
      { label: "Custom Platforms", href: "/products/custom-platforms" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Work", href: "/our-work" },
      { label: "Solutions", href: "/solutions" },
      { label: "Industries", href: "/industries" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Set a meeting", href: "/contact" },
      { label: "Technology Stack", href: "/about#stack" },
      { label: "Security", href: "/about#security" },
      { label: "Admin Portal", href: "/admin/login" },
    ],
  },
];

/** Hero capability strip under the fold-line. */
export const CAPABILITY_STRIP = [
  { icon: "brain", label: "AI &\nAutomation" },
  { icon: "chart", label: "Data &\nAnalytics" },
  { icon: "layers", label: "Digital\nPlatforms" },
  { icon: "link", label: "Enterprise\nIntegration" },
];

export const HERO_PANELS = [
  {
    icon: "sparkles",
    title: "AI Insights",
    body: "Identify high-value investments and opportunities with AI.",
  },
  {
    icon: "settings",
    title: "Automate Operations",
    body: "Reduce costs and increase efficiency.",
  },
  {
    icon: "chart",
    title: "Predict Growth",
    body: "Turn data into smarter decisions.",
  },
];

export const GLOBAL_STATS = [
  { value: 50, suffix: "+", label: "Enterprise Clients", sub: "Across MENA & Global" },
  { value: 40, suffix: "%", label: "Average Efficiency Gain", sub: "for Our Clients" },
  { value: 99.9, suffix: "%", label: "Platform Uptime", sub: "Powering Critical Business" },
];

/**
 * Sectors, not client names.
 *
 * This band used to list real Dubai developers as customers. None of them are,
 * and naming a company you have not worked with is the kind of claim that is
 * both easy to check and expensive to get wrong. What we build for is true
 * regardless of who has signed.
 */
export const SECTORS_SERVED = [
  "Real Estate Development",
  "Construction & Delivery",
  "Hospitality & Leisure",
  "Asset Management",
  "Retail & Mixed-Use",
  "Government & Public Sector",
];

export const TECH_STACK = [
  { group: "Frontend", items: ["React", "Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"] },
  { group: "Backend", items: ["Python", "FastAPI", "Node.js", "GraphQL", "Redis", "Celery"] },
  { group: "Data & AI", items: ["PostgreSQL", "PyTorch", "LangChain", "Vector DB", "dbt", "Snowflake"] },
  { group: "Cloud", items: ["AWS", "Kubernetes", "Terraform", "Cloudflare", "S3", "Observability"] },
];

export const PROCESS_STEPS = [
  {
    step: "01",
    icon: "message",
    title: "Set a meeting",
    body: "Share your goals and tell us what you are looking to achieve.",
  },
  {
    step: "02",
    icon: "calendar",
    title: "Discovery Call",
    body: "Our experts will understand your needs and explore opportunities for your business.",
  },
  {
    step: "03",
    icon: "chart",
    title: "Solution Walkthrough",
    body: "See a tailored demo of AURAVEX in action, with real use cases for your industry.",
  },
];
