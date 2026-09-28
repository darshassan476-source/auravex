import { LogoMark } from "@/components/layout/Logo";
import { Icon } from "@/components/ui/Icon";
import { cn, sparklineArea, sparklinePath } from "@/lib/utils";

/**
 * A high-fidelity AURAVEX product screenshot, rendered as markup rather than
 * an image so it repaints with every theme and stays crisp at any density.
 *
 * Values are fixed marketing copy — this is a picture of the product, not a
 * live view of it.
 */

const NAV = [
  { icon: "home", label: "Overview", active: true },
  { icon: "building", label: "Portfolio" },
  { icon: "chart", label: "Performance" },
  { icon: "workflow", label: "Operations" },
  { icon: "users", label: "Tenants" },
  { icon: "file", label: "Reports" },
];

const KPIS = [
  { label: "Total Asset Value", value: "AED 12.4B", delta: "+12%", up: true, series: [30, 38, 35, 46, 52, 49, 62, 68, 74, 82] },
  { label: "Active Properties", value: "328", delta: "+8%", up: true, series: [58, 55, 62, 60, 68, 71, 69, 78, 82, 88] },
  { label: "Total Area (sq ft)", value: "1.2M", delta: "+18%", up: true, series: [42, 48, 45, 52, 50, 58, 62, 60, 68, 72] },
];

const REVENUE = [38, 44, 41, 52, 58, 54, 66, 72, 68, 80, 86, 94];
const FORECAST = [30, 34, 36, 42, 46, 48, 54, 58, 62, 68, 72, 78];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ASSETS = [
  { name: "Marina Heights Tower", sector: "Residential", value: "AED 2.8B", occupancy: 98, status: "Stabilised" },
  { name: "Dubai Hills Commercial", sector: "Office", value: "AED 1.9B", occupancy: 94, status: "Leasing" },
  { name: "Bluewaters Retail Quarter", sector: "Retail", value: "AED 1.4B", occupancy: 91, status: "Stabilised" },
  { name: "Creek Harbour Phase II", sector: "Mixed-Use", value: "AED 3.2B", occupancy: 76, status: "Delivery" },
];

const STATUS_TONE: Record<string, string> = {
  Stabilised: "text-[var(--ax-success)] bg-[var(--ax-success)]/12 border-[var(--ax-success)]/25",
  Leasing: "text-[var(--ax-accent-soft)] bg-[var(--ax-accent)]/12 border-[var(--ax-accent)]/25",
  Delivery: "text-[var(--ax-warning)] bg-[var(--ax-warning)]/12 border-[var(--ax-warning)]/25",
};

export type MockPreset =
  | "real-estate"
  | "analytics"
  | "operations"
  | "crm"
  | "experience"
  | "platform";

interface Preset {
  title: string;
  meta: string;
  nav: { icon: string; label: string; active?: boolean }[];
  kpis: typeof KPIS;
  chartTitle: string;
  panelTitle: string;
  slices: { label: string; share: number; color: string }[];
  rows: typeof ASSETS;
  note: { title: string; body: string };
  insight: string;
}

/**
 * Each product shows its own interface rather than the real-estate one, so a
 * visitor browsing the catalogue sees a portfolio of distinct software.
 */
const PRESETS: Record<MockPreset, Partial<Preset>> = {
  "real-estate": {},

  analytics: {
    title: "Executive Analytics",
    meta: "Live · 42 connected sources",
    nav: [
      { icon: "home", label: "Overview", active: true },
      { icon: "chart", label: "Dashboards" },
      { icon: "activity", label: "Metrics" },
      { icon: "brain", label: "Forecasts" },
      { icon: "database", label: "Sources" },
      { icon: "file", label: "Reports" },
    ],
    kpis: [
      { label: "Revenue (YTD)", value: "AED 8.6B", delta: "+32%", up: true, series: [28, 34, 40, 38, 48, 55, 60, 68, 76, 88] },
      { label: "Gross Margin", value: "41.2%", delta: "+2.4%", up: true, series: [50, 52, 55, 54, 60, 62, 66, 70, 74, 79] },
      { label: "Forecast Accuracy", value: "94%", delta: "+6%", up: true, series: [40, 44, 50, 56, 58, 64, 70, 74, 80, 86] },
    ],
    chartTitle: "Revenue vs Forecast",
    panelTitle: "Revenue Mix",
    slices: [
      { label: "Recurring", share: 48, color: "var(--ax-accent)" },
      { label: "Services", share: 24, color: "var(--ax-violet)" },
      { label: "Licensing", share: 18, color: "var(--ax-cyan)" },
      { label: "Other", share: 10, color: "var(--ax-success)" },
    ],
    rows: [
      { name: "MENA Region", sector: "Region", value: "AED 3.4B", occupancy: 92, status: "Stabilised" },
      { name: "Europe", sector: "Region", value: "AED 2.1B", occupancy: 87, status: "Leasing" },
      { name: "Asia Pacific", sector: "Region", value: "AED 1.8B", occupancy: 74, status: "Delivery" },
      { name: "North America", sector: "Region", value: "AED 1.3B", occupancy: 81, status: "Stabilised" },
    ],
    insight: "Recurring revenue is pacing 8% ahead of plan this quarter.",
    note: { title: "Margin up 2.4%", body: "Driven by services mix" },
  },

  operations: {
    title: "Operations Control",
    meta: "1,412 workflows live",
    nav: [
      { icon: "home", label: "Overview", active: true },
      { icon: "workflow", label: "Workflows" },
      { icon: "check-circle", label: "Approvals" },
      { icon: "users", label: "Teams" },
      { icon: "clock", label: "SLAs" },
      { icon: "file", label: "Audit" },
    ],
    kpis: [
      { label: "Processes Automated", value: "1,412", delta: "+18%", up: true, series: [30, 36, 42, 50, 56, 62, 70, 78, 84, 92] },
      { label: "Avg Cycle Time", value: "2.4 days", delta: "-38%", up: false, series: [88, 82, 76, 70, 62, 56, 48, 42, 36, 30] },
      { label: "Approval SLA", value: "99.1%", delta: "+4%", up: true, series: [55, 58, 62, 66, 70, 74, 80, 84, 88, 94] },
    ],
    chartTitle: "Throughput vs Target",
    panelTitle: "Queue Load",
    slices: [
      { label: "Finance", share: 38, color: "var(--ax-accent)" },
      { label: "Procurement", share: 27, color: "var(--ax-violet)" },
      { label: "Legal", share: 21, color: "var(--ax-cyan)" },
      { label: "Facilities", share: 14, color: "var(--ax-success)" },
    ],
    rows: [
      { name: "Vendor Onboarding", sector: "Flow", value: "412 runs", occupancy: 96, status: "Stabilised" },
      { name: "Variation Approval", sector: "Flow", value: "318 runs", occupancy: 88, status: "Leasing" },
      { name: "Invoice Matching", sector: "Flow", value: "286 runs", occupancy: 93, status: "Stabilised" },
      { name: "Site Inspection", sector: "Flow", value: "194 runs", occupancy: 71, status: "Delivery" },
    ],
    insight: "Approval queues cleared 2.1 days faster than last month.",
    note: { title: "Cycle time -38%", body: "After routing rules" },
  },

  crm: {
    title: "Pipeline Overview",
    meta: "2,428 qualified leads",
    nav: [
      { icon: "home", label: "Overview", active: true },
      { icon: "users", label: "Leads" },
      { icon: "target", label: "Pipeline" },
      { icon: "message", label: "Outreach" },
      { icon: "calendar", label: "Meetings" },
      { icon: "chart", label: "Reports" },
    ],
    kpis: [
      { label: "Qualified Leads", value: "2,428", delta: "+24%", up: true, series: [30, 36, 40, 48, 52, 60, 66, 74, 82, 90] },
      { label: "Conversion", value: "18.6%", delta: "+3.2%", up: true, series: [42, 46, 50, 52, 58, 62, 68, 72, 78, 84] },
      { label: "Avg Deal Size", value: "AED 1.2M", delta: "+11%", up: true, series: [38, 42, 46, 50, 54, 60, 64, 70, 76, 82] },
    ],
    chartTitle: "Pipeline vs Target",
    panelTitle: "Stage Mix",
    slices: [
      { label: "New", share: 34, color: "var(--ax-accent)" },
      { label: "Contacted", share: 28, color: "var(--ax-violet)" },
      { label: "Negotiation", share: 23, color: "var(--ax-cyan)" },
      { label: "Closed Won", share: 15, color: "var(--ax-success)" },
    ],
    rows: [
      { name: "Nexar Properties", sector: "Lead", value: "AED 2.4M", occupancy: 88, status: "Stabilised" },
      { name: "BrightBuild Group", sector: "Lead", value: "AED 1.8M", occupancy: 72, status: "Leasing" },
      { name: "Gulf Infrastructure", sector: "Lead", value: "AED 1.1M", occupancy: 64, status: "Delivery" },
      { name: "Vision Holdings", sector: "Lead", value: "AED 940K", occupancy: 55, status: "Leasing" },
    ],
    insight: "Lead scoring flagged 18 accounts worth prioritising today.",
    note: { title: "Conversion +3.2%", body: "After AI lead scoring" },
  },

  experience: {
    title: "Visitor Experience",
    meta: "18,402 visits today",
    nav: [
      { icon: "home", label: "Overview", active: true },
      { icon: "user", label: "Visitors" },
      { icon: "scan", label: "Access" },
      { icon: "sparkles", label: "Concierge" },
      { icon: "calendar", label: "Events" },
      { icon: "chart", label: "Insights" },
    ],
    kpis: [
      { label: "Visits Today", value: "18,402", delta: "+22%", up: true, series: [32, 38, 44, 48, 56, 62, 70, 76, 84, 92] },
      { label: "Satisfaction", value: "4.8 / 5", delta: "+0.3", up: true, series: [50, 54, 58, 62, 66, 70, 76, 80, 86, 90] },
      { label: "Check-in Time", value: "38 sec", delta: "-46%", up: false, series: [90, 84, 78, 70, 62, 55, 48, 42, 36, 30] },
    ],
    chartTitle: "Footfall vs Forecast",
    panelTitle: "Journey Mix",
    slices: [
      { label: "Check-in", share: 40, color: "var(--ax-accent)" },
      { label: "Concierge", share: 26, color: "var(--ax-violet)" },
      { label: "Amenities", share: 20, color: "var(--ax-cyan)" },
      { label: "Events", share: 14, color: "var(--ax-success)" },
    ],
    rows: [
      { name: "Marina Promenade", sector: "Venue", value: "6,120", occupancy: 94, status: "Stabilised" },
      { name: "Creek Pavilion", sector: "Venue", value: "4,480", occupancy: 88, status: "Leasing" },
      { name: "Hills Clubhouse", sector: "Venue", value: "3,910", occupancy: 79, status: "Stabilised" },
      { name: "Bluewaters Deck", sector: "Venue", value: "3,892", occupancy: 68, status: "Delivery" },
    ],
    insight: "Evening footfall is tracking 12% above the weekly forecast.",
    note: { title: "Check-in -46%", body: "After digital access" },
  },

  platform: {
    title: "Platform Console",
    meta: "24 services · 99.98% uptime",
    nav: [
      { icon: "home", label: "Overview", active: true },
      { icon: "box", label: "Services" },
      { icon: "terminal", label: "Deploys" },
      { icon: "activity", label: "Traces" },
      { icon: "shield", label: "Access" },
      { icon: "settings", label: "Config" },
    ],
    kpis: [
      { label: "Services Live", value: "24", delta: "+4", up: true, series: [30, 34, 38, 46, 52, 58, 64, 72, 80, 88] },
      { label: "P95 Latency", value: "118 ms", delta: "-27%", up: false, series: [88, 82, 76, 70, 64, 56, 50, 44, 38, 32] },
      { label: "Uptime", value: "99.98%", delta: "+0.1%", up: true, series: [60, 64, 68, 72, 76, 80, 84, 88, 92, 96] },
    ],
    chartTitle: "Requests vs Capacity",
    panelTitle: "Traffic Mix",
    slices: [
      { label: "API", share: 44, color: "var(--ax-accent)" },
      { label: "Web", share: 28, color: "var(--ax-violet)" },
      { label: "Jobs", share: 18, color: "var(--ax-cyan)" },
      { label: "Webhooks", share: 10, color: "var(--ax-success)" },
    ],
    rows: [
      { name: "auth-service", sector: "Service", value: "18.4M", occupancy: 99, status: "Stabilised" },
      { name: "billing-api", sector: "Service", value: "12.1M", occupancy: 97, status: "Stabilised" },
      { name: "search-index", sector: "Service", value: "8.6M", occupancy: 91, status: "Leasing" },
      { name: "media-worker", sector: "Service", value: "4.2M", occupancy: 78, status: "Delivery" },
    ],
    insight: "Edge caching cut p95 latency across all regions overnight.",
    note: { title: "Latency -27%", body: "After edge caching" },
  },
};

export function DashboardMock({
  className,
  preset = "real-estate",
}: {
  className?: string;
  preset?: MockPreset;
}) {
  const conf = PRESETS[preset] ?? {};
  const nav = conf.nav ?? NAV;
  const kpis = conf.kpis ?? KPIS;
  const rows = conf.rows ?? ASSETS;
  const title = conf.title ?? "Portfolio Overview";
  const meta = conf.meta ?? "Updated 4 minutes ago \u00b7 320 assets";
  const chartTitle = conf.chartTitle ?? "Revenue vs Forecast";
  const panelTitle = conf.panelTitle ?? "Allocation";
  const slices = conf.slices ?? [
    { label: "Residential", share: 42, color: "var(--ax-accent)" },
    { label: "Commercial", share: 27, color: "var(--ax-violet)" },
    { label: "Retail", share: 19, color: "var(--ax-cyan)" },
    { label: "Hospitality", share: 12, color: "var(--ax-success)" },
  ];
  const insight = conf.insight ?? "Creek Harbour occupancy is tracking 6% ahead of forecast.";
  const note = conf.note ?? { title: "Yield up 0.6%", body: "Driven by retail renewals" };
  return (
    <div className={cn("flex min-h-[420px] text-[var(--ax-ink)] md:min-h-[520px]", className)}>
      {/* ================= Sidebar ================= */}
      <aside className="hidden w-[148px] shrink-0 flex-col gap-5 border-r border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)] p-3.5 md:flex lg:w-[160px]">
        <div className="flex items-center gap-2">
          <LogoMark className="size-5" />
          <span className="text-[11px] font-semibold tracking-[0.18em] text-[var(--ax-ink)]">
            AURAVEX
          </span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => (
            <span
              key={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[11px] font-medium",
                item.active
                  ? "bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-ink)] ring-1 ring-[var(--ax-line-strong)]"
                  : "text-[var(--ax-ink-dim)]",
              )}
            >
              <Icon
                name={item.icon}
                className={cn("size-3.5 shrink-0", item.active && "text-[var(--ax-accent-soft)]")}
                strokeWidth={1.9}
              />
              {item.label}
            </span>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2.5 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)] p-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--ax-ink)]">
            <Icon name="sparkles" className="size-3 text-[var(--ax-accent-soft)]" strokeWidth={2} />
            AI Insight
          </span>
          <span className="text-[9.5px] leading-relaxed text-[var(--ax-ink-dim)]">
            {insight}
          </span>
        </div>
      </aside>

      {/* ================= Main ================= */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-3 border-b border-[var(--ax-line)] px-4 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[13px] font-semibold tracking-[-0.01em]">
              {title}
            </span>
            <span className="truncate text-[9.5px] text-[var(--ax-ink-dim)]">
              {meta}</span>
          </div>

          {/* Segmented control */}
          <div className="ml-auto hidden items-center gap-0.5 rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] p-0.5 sm:flex">
            {["30D", "QTD", "YTD"].map((range, i) => (
              <span
                key={range}
                className={cn(
                  "rounded-md px-2 py-1 text-[9.5px] font-semibold",
                  i === 2
                    ? "bg-[rgba(var(--ax-glow),0.18)] text-[var(--ax-ink)]"
                    : "text-[var(--ax-ink-dim)]",
                )}
              >
                {range}
              </span>
            ))}
          </div>

          <span className="hidden size-7 shrink-0 place-items-center rounded-lg border border-[var(--ax-line)] text-[var(--ax-ink-dim)] sm:grid">
            <Icon name="filter" className="size-3.5" strokeWidth={1.9} />
          </span>

          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[9px] font-bold text-white">
            AD
          </span>
        </header>

        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* ---------- KPI row ---------- */}
          <div className="grid grid-cols-3 gap-2.5">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex flex-col gap-2 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] p-3"
              >
                <span className="text-[9px] font-medium uppercase leading-tight tracking-[0.08em] text-[var(--ax-ink-dim)]">
                  {kpi.label}
                </span>

                <div className="flex items-end justify-between gap-2">
                  <span className="text-[16px] font-semibold tracking-[-0.02em]">{kpi.value}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold",
                      kpi.up
                        ? "bg-[var(--ax-success)]/12 text-[var(--ax-success)]"
                        : "bg-[var(--ax-accent)]/12 text-[var(--ax-accent-soft)]",
                    )}
                  >
                    {kpi.delta}
                  </span>
                </div>

                <svg viewBox="0 0 100 22" preserveAspectRatio="none" className="h-5 w-full" aria-hidden>
                  <path
                    d={sparklinePath(kpi.series, 100, 22)}
                    fill="none"
                    stroke={kpi.up ? "var(--ax-accent)" : "var(--ax-ink-dim)"}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* ---------- Chart + side panel ---------- */}
          <div className="grid flex-1 gap-2.5 lg:grid-cols-[1.75fr_1fr]">
            {/* Revenue chart */}
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold">{chartTitle}</span>
                  <span className="text-[9px] text-[var(--ax-ink-dim)]">Rolling 12 months</span>
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { label: "Actual", color: "var(--ax-accent)" },
                    { label: "Forecast", color: "var(--ax-violet)" },
                  ].map((legend) => (
                    <span
                      key={legend.label}
                      className="flex items-center gap-1.5 text-[9px] text-[var(--ax-ink-dim)]"
                    >
                      <span className="size-1.5 rounded-full" style={{ background: legend.color }} />
                      {legend.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[120px] flex-1">
                {/* Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="h-px w-full bg-[var(--ax-line)]" />
                  ))}
                </div>

                <svg
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="mock-revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--ax-accent)" stopOpacity="0.42" />
                      <stop offset="100%" stopColor="var(--ax-accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path d={sparklineArea(REVENUE, 100, 40)} fill="url(#mock-revenue)" />
                  <path
                    d={sparklinePath(FORECAST, 100, 40)}
                    fill="none"
                    stroke="var(--ax-violet)"
                    strokeWidth="1.3"
                    strokeDasharray="3 2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={sparklinePath(REVENUE, 100, 40)}
                    fill="none"
                    stroke="var(--ax-accent)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Focus marker on the latest point */}
                <span className="absolute right-0 top-0 flex -translate-y-1/2 translate-x-1/2 items-center">
                  <span className="size-2 rounded-full bg-[var(--ax-accent)] ring-[3px] ring-[var(--ax-bg-elevated)]" />
                </span>
              </div>

              <div className="flex justify-between text-[8.5px] text-[var(--ax-ink-dim)]">
                {MONTHS.filter((_, i) => i % 2 === 0).map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>

            {/* Allocation panel */}
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)] p-3.5">
              <span className="text-[11px] font-semibold">{panelTitle}</span>

              <div className="flex flex-col gap-2.5">
                {slices.map((slice) => (
                  <div key={slice.label} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between text-[9.5px]">
                      <span className="text-[var(--ax-ink-muted)]">{slice.label}</span>
                      <span className="font-mono tabular-nums text-[var(--ax-ink)]">
                        {slice.share}%
                      </span>
                    </div>
                    <span className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ax-line)]">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${slice.share}%`, background: slice.color }}
                      />
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2 rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)] p-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-[var(--ax-success)]/15 text-[var(--ax-success)]">
                  <Icon name="trending" className="size-3" strokeWidth={2.4} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[9.5px] font-semibold">{note.title}</span>
                  <span className="truncate text-[8.5px] text-[var(--ax-ink-dim)]">
                    {note.body}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Asset table ---------- */}
          <div className="hidden overflow-hidden rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)] sm:block">
            <div className="grid grid-cols-[2.1fr_1fr_1.25fr_0.95fr] gap-3 border-b border-[var(--ax-line)] px-3.5 py-2">
              {["Asset", "Value", "Occupancy", "Status"].map((heading) => (
                <span
                  key={heading}
                  className="text-[8.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ax-ink-dim)]"
                >
                  {heading}
                </span>
              ))}
            </div>

            {rows.map((asset) => (
              <div
                key={asset.name}
                className="grid grid-cols-[2.1fr_1fr_1.25fr_0.95fr] items-center gap-3 border-b border-[var(--ax-line)] px-3.5 py-2.5 last:border-0"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-[var(--ax-accent)]" />
                  <span className="truncate text-[10px] font-medium">{asset.name}</span>
                </span>
                <span className="truncate font-mono text-[9.5px] tabular-nums text-[var(--ax-ink-muted)]">
                  {asset.value}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--ax-line)]">
                    <span
                      className="block h-full rounded-full bg-[var(--ax-accent)]"
                      style={{ width: `${asset.occupancy}%` }}
                    />
                  </span>
                  <span className="shrink-0 font-mono text-[9px] tabular-nums text-[var(--ax-ink-dim)]">
                    {asset.occupancy}%
                  </span>
                </span>
                <span
                  className={cn(
                    "w-fit truncate rounded-md border px-1.5 py-0.5 text-[8.5px] font-semibold",
                    STATUS_TONE[asset.status],
                  )}
                >
                  {asset.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
