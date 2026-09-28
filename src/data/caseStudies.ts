import type { CaseStudy } from "@/lib/types";

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "cs-001",
    slug: "manual-work-reduction",
    index: "CASE STUDY 01",
    title: "How Enterprise Teams Reduced Manual Work by 62%.",
    sector: "Real Estate Development",
    summary:
      "A leading property developer streamlined project reporting and cross-team coordination across a multi-billion dirham portfolio.",
    challenge:
      "Twelve business units produced project reports in twelve different formats. Consolidating a single board pack took nine working days, and by the time it was approved the numbers were already stale. Nobody could answer a portfolio-level question without a week of notice.",
    approach: [
      "Mapped every reporting input across development, sales, finance and facilities.",
      "Replaced spreadsheet consolidation with a governed semantic layer and shared metric definitions.",
      "Automated the reporting pipeline so board packs generate continuously rather than monthly.",
      "Rolled out role-aware dashboards so each team reads the same numbers from the same source.",
    ],
    metrics: [
      { label: "Less manual work", value: "62%", trend: "down" },
      { label: "Faster reporting", value: "3.5x", trend: "up" },
      { label: "Project visibility", value: "100%", trend: "up" },
    ],
    timeline: [
      { phase: "Discovery", duration: "2 weeks" },
      { phase: "Implementation", duration: "8 weeks" },
      { phase: "Company-wide Rollout", duration: "12 weeks" },
      { phase: "Full impact", duration: "6 months" },
    ],
    testimonial: {
      quote:
        "Auravex gave us real-time visibility across every project. It has become essential to how we operate.",
      author: "Chief Operating Officer",
      role: "Leading Real Estate Developer",
    },
    productSlug: "real-estate-os",
  },
  {
    id: "cs-002",
    slug: "unified-operations",
    index: "CASE STUDY 02",
    title: "From Data Silos to Unified Operations Across 12+ Sites.",
    sector: "Construction & Delivery",
    summary:
      "A major construction group connected field, project and finance teams with a single platform, improving execution and accountability.",
    challenge:
      "Each site ran its own tools and its own version of the truth. Variations were approved over email, progress was reported on WhatsApp, and finance discovered cost overruns weeks after they happened.",
    approach: [
      "Deployed a single operations backbone across twelve active sites.",
      "Digitised approval chains with policy-aware routing and a full audit trail.",
      "Integrated existing ERP and finance systems rather than replacing them.",
      "Gave leadership a live view of progress, cost and risk per site.",
    ],
    metrics: [
      { label: "Faster decision-making", value: "40%", trend: "up" },
      { label: "Lower operational costs", value: "28%", trend: "down" },
      { label: "Active sites connected", value: "12+", trend: "up" },
    ],
    timeline: [
      { phase: "Assessment", duration: "3 weeks" },
      { phase: "Integration", duration: "10 weeks" },
      { phase: "Training & Adoption", duration: "4 weeks" },
      { phase: "Full impact", duration: "8 months" },
    ],
    testimonial: {
      quote:
        "The level of clarity and control we have today is unmatched. Auravex has transformed the way we deliver.",
      author: "Head of Operations",
      role: "Global Construction Group",
    },
    productSlug: "operations-suite",
  },
  {
    id: "cs-003",
    slug: "ai-portfolio-performance",
    index: "CASE STUDY 03",
    title: "Driving 35% Higher Portfolio Performance with AI Insights.",
    sector: "Asset & Portfolio Management",
    summary:
      "A diversified real estate enterprise uses Auravex analytics to optimise asset performance, forecast value and reduce risk.",
    challenge:
      "Investment decisions relied on quarterly valuations and analyst intuition. Underperforming assets were identified too late to intervene, and risk exposure was assessed manually across a portfolio too large to hold in one person's head.",
    approach: [
      "Built forecasting models for occupancy, rental yield and asset valuation.",
      "Introduced continuous risk scoring across the full portfolio.",
      "Layered AI narration so every metric shift comes with an explanation.",
      "Connected insights directly to the investment committee workflow.",
    ],
    metrics: [
      { label: "Higher portfolio performance", value: "35%", trend: "up" },
      { label: "Faster risk assessment", value: "50%", trend: "up" },
      { label: "Data accuracy", value: "90%", trend: "up" },
    ],
    timeline: [
      { phase: "Strategy", duration: "2 weeks" },
      { phase: "AI Model Setup", duration: "8 weeks" },
      { phase: "Portfolio Rollout", duration: "6 weeks" },
      { phase: "Full impact", duration: "4 months" },
    ],
    testimonial: {
      quote:
        "Auravex helps us see opportunities earlier, manage risk better, and make smarter investment decisions.",
      author: "Head of Asset Management",
      role: "Diversified REIT",
    },
    productSlug: "business-intelligence",
  },
];

export const WORK_HERO_STATS = [
  { value: "50+", label: "Enterprise Clients" },
  { value: "62%", label: "Average Productivity Gain" },
  { value: "$1.2B+", label: "Total Project Value Supported" },
];

export const WORK_HIGHLIGHTS = [
  { icon: "chart", title: "Higher\nProductivity" },
  { icon: "settings", title: "Smarter\nOperations" },
  { icon: "users", title: "Stronger\nBusiness Outcomes" },
];

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
