import type { Industry, Solution } from "@/lib/types";

export const SOLUTION_FILTERS = [
  "All Solutions",
  "Real Estate",
  "Operations",
  "Analytics",
  "Customer Experience",
  "Custom Development",
] as const;

export const SOLUTIONS: Solution[] = [
  {
    id: "s-001",
    slug: "real-estate-os",
    name: "Real Estate OS",
    description: "End-to-end platform for property management, leasing, sales and investment.",
    icon: "building",
    category: "Real Estate",
    bullets: ["Property & Asset Management", "Leasing & Sales Automation", "Investor Relations"],
    stats: [
      { label: "Total Assets", value: "AED 12.4B", delta: "+12%", trend: "up" },
      { label: "Occupancy", value: "96%", trend: "up" },
    ],
  },
  {
    id: "s-002",
    slug: "operations-suite",
    name: "Operations Suite",
    description: "Automate workflows, streamline approvals and connect your entire business.",
    icon: "settings",
    category: "Operations",
    bullets: ["Workflow Automation", "Approvals & Compliance", "Multi-Entity Operations"],
    stats: [
      { label: "Processes Automated", value: "1,400+", trend: "up" },
      { label: "Cycle Time", value: "-38%", trend: "down" },
    ],
  },
  {
    id: "s-003",
    slug: "business-intelligence",
    name: "Business Intelligence",
    description: "Turn your data into clear insights with powerful analytics and predictive intelligence.",
    icon: "chart",
    category: "Analytics",
    bullets: ["Real-time Dashboards", "Predictive Analytics", "Custom Reports"],
    stats: [
      { label: "Portfolio Value", value: "AED 12.4B", delta: "+18%", trend: "up" },
      { label: "Revenue", value: "+32%", trend: "up" },
    ],
  },
  {
    id: "s-004",
    slug: "crm-lead-flow",
    name: "CRM & Lead Flow",
    description: "Capture, nurture and convert leads with an integrated, AI-powered CRM.",
    icon: "users",
    category: "Customer Experience",
    bullets: ["Lead Capture & Scoring", "Automated Follow-ups", "Sales Pipeline Management"],
    stats: [
      { label: "Qualified Leads", value: "2,428", delta: "+24%", trend: "up" },
      { label: "Close Rate", value: "+19%", trend: "up" },
    ],
  },
  {
    id: "s-005",
    slug: "visitor-experience",
    name: "Visitor Experience",
    description: "Create seamless, premium experiences for residents, tenants and guests.",
    icon: "user",
    category: "Customer Experience",
    bullets: ["Smart Check-in & Access", "Digital Concierge", "Integrated Community Services"],
    stats: [
      { label: "Visitors / Month", value: "410K", trend: "up" },
      { label: "Satisfaction", value: "4.8/5", trend: "up" },
    ],
  },
  {
    id: "s-006",
    slug: "custom-platforms",
    name: "Custom Platforms",
    description: "Tailored digital platforms for your unique business model and industry needs.",
    icon: "code",
    category: "Custom Development",
    bullets: ["Bespoke Web & Mobile Apps", "System Integrations", "Scalable Architecture"],
    stats: [
      { label: "Platforms Delivered", value: "38", trend: "up" },
      { label: "On-time Delivery", value: "96%", trend: "up" },
    ],
  },
];

export const SOLUTION_HERO_STATS = [
  { icon: "building", value: "6", label: "Enterprise Solutions" },
  { icon: "users", value: "10K+", label: "Businesses Empowered" },
  { icon: "box", value: "2M+", label: "End Users Reached" },
  { icon: "chart", value: "35%", label: "Avg. Operational Efficiency Gain" },
];

export const INDUSTRIES: Industry[] = [
  {
    id: "i-001",
    slug: "real-estate-development",
    name: "Real Estate Development",
    description:
      "Master-plan to handover. Unified project reporting, sales, and investor visibility across multi-billion dirham portfolios.",
    icon: "building",
    outcomes: ["Portfolio-wide reporting", "Sales & inventory control", "Investor dashboards"],
    stat: { label: "Assets Managed", value: "AED 50B+", trend: "up" },
  },
  {
    id: "i-002",
    slug: "construction-delivery",
    name: "Construction & Delivery",
    description:
      "Field, project and finance teams on one platform — improving execution, accountability and cost control across every active site.",
    icon: "layers",
    outcomes: ["Site-level progress tracking", "Cost & variation control", "Safety and compliance"],
    stat: { label: "Active Sites", value: "120+", trend: "up" },
  },
  {
    id: "i-003",
    slug: "hospitality-leisure",
    name: "Hospitality & Leisure",
    description:
      "Premium guest journeys across hotels, resorts and destinations, from smart access to AI concierge services.",
    icon: "user",
    outcomes: ["Digital check-in", "Concierge automation", "Experience analytics"],
    stat: { label: "Guest Satisfaction", value: "4.8/5", trend: "up" },
  },
  {
    id: "i-004",
    slug: "asset-portfolio-management",
    name: "Asset & Portfolio Management",
    description:
      "Analytics that optimise asset performance, forecast value and reduce risk across diversified holdings.",
    icon: "chart",
    outcomes: ["Valuation modelling", "Risk assessment", "Performance forecasting"],
    stat: { label: "Portfolio Performance", value: "+35%", trend: "up" },
  },
  {
    id: "i-005",
    slug: "retail-mixed-use",
    name: "Retail & Mixed-Use",
    description:
      "Footfall intelligence, tenant performance and community engagement for destinations that need to stay alive after opening day.",
    icon: "globe",
    outcomes: ["Footfall analytics", "Tenant performance", "Community engagement"],
    stat: { label: "Footfall Uplift", value: "+22%", trend: "up" },
  },
  {
    id: "i-006",
    slug: "government-public-sector",
    name: "Government & Public Sector",
    description:
      "Secure, auditable platforms for public-facing services and inter-departmental operations at national scale.",
    icon: "shield",
    outcomes: ["Citizen services", "Inter-agency workflows", "Full auditability"],
    stat: { label: "Uptime", value: "99.9%", trend: "up" },
  },
];

export function getSolution(slug: string) {
  return SOLUTIONS.find((s) => s.slug === slug);
}

export function getIndustry(slug: string) {
  return INDUSTRIES.find((i) => i.slug === slug);
}
