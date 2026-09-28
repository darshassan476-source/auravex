"use client";

import Link from "next/link";
import { useMemo } from "react";
import { slotTime } from "@/cms/Reminders";
import { useCms } from "@/cms/CmsProvider";
import { useCatalogue } from "@/cms/useProduct";
import { useAdminSession } from "@/lib/adminAuth";
import { AdminHeader, AreaChart, Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import { Delta } from "@/components/ui/Primitives";
import type { AnalyticsPoint } from "@/lib/types";
import { cn, sparklineArea, sparklinePath } from "@/lib/utils";

const DAY = 86_400_000;
const dayKey = (iso: string) => iso.slice(0, 10);

function pct(delta: number, base: number) {
  if (!base) return delta > 0 ? "new" : "—";
  return `${delta >= 0 ? "+" : ""}${Math.round((delta / base) * 100)}%`;
}

/** Counts per day over the last `days`, oldest first, gaps as zero. */
function perDay(dates: string[], days: number): AnalyticsPoint[] {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(dayKey(new Date(Date.now() - i * DAY).toISOString()), 0);
  }
  dates.forEach((iso) => {
    const k = dayKey(iso);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  });
  return [...buckets.entries()].map(([k, value]) => ({
    label: new Date(`${k}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value,
  }));
}

const QUICK_LINKS = [
  { href: "/admin/appearance", icon: "image", label: "Backgrounds & images" },
  { href: "/admin/content", icon: "pencil", label: "Site content" },
  { href: "/admin/pages", icon: "file", label: "Page builder" },
  { href: "/admin/products", icon: "box", label: "Products" },
  { href: "/admin/media", icon: "upload", label: "Media library" },
  { href: "/admin/ai", icon: "sparkles", label: "AI Studio" },
] as const;

/**
 * The overview, from the server's own records: page views, bookings,
 * conversations and media. Every figure is a count of something that
 * happened; deltas compare the last 30 days with the 30 before.
 */
export function DashboardLive({ name }: { name: string }) {
  const { state, ready } = useCms();
  const { user } = useAdminSession();
  const catalogue = useCatalogue();
  const today = new Date();

  const stats = useMemo(() => {
    const now = Date.now();
    const since = (days: number) => now - days * DAY;
    const visits30 = state.visits.filter((v) => Date.parse(v.at) >= since(30));
    const visitsPrev = state.visits.filter(
      (v) => Date.parse(v.at) >= since(60) && Date.parse(v.at) < since(30),
    );
    const upcoming = state.bookings.filter((b) => slotTime(b) >= now && b.status !== "cancelled");
    const bookings30 = state.bookings.filter((b) => Date.parse(b.createdAt) >= since(30));
    const bookingsPrev = state.bookings.filter(
      (b) => Date.parse(b.createdAt) >= since(60) && Date.parse(b.createdAt) < since(30),
    );
    const unread = state.threads.filter((t) => t.unread && !t.archived);
    const threads30 = state.threads.filter((t) => Date.parse(t.createdAt) >= since(30));
    const threadsPrev = state.threads.filter(
      (t) => Date.parse(t.createdAt) >= since(60) && Date.parse(t.createdAt) < since(30),
    );

    const pages = new Map<string, number>();
    visits30.forEach((v) => pages.set(v.path, (pages.get(v.path) ?? 0) + 1));
    const products = catalogue.map((p) => ({
      slug: p.slug,
      name: p.name,
      accent: p.accent,
      views: pages.get(`/products/${p.slug}`) ?? 0,
    }))
      .filter((p) => p.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 4);
    const topPages = [...pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

    const mobile = visits30.filter((v) => v.device === "mobile").length;
    const direct = visits30.filter((v) => v.source === "direct").length;

    return {
      visits30,
      visitsPrev,
      upcoming,
      bookings30,
      bookingsPrev,
      unread,
      threads30,
      threadsPrev,
      products,
      topPages,
      mobileShare: visits30.length ? Math.round((mobile / visits30.length) * 100) : 0,
      directShare: visits30.length ? Math.round((direct / visits30.length) * 100) : 0,
      pagesSeen: pages.size,
    };
  }, [state.visits, state.bookings, state.threads, catalogue]);

  const series = useMemo(
    () => ({
      visits: perDay(state.visits.map((v) => v.at), 30),
      bookings: perDay(state.bookings.map((b) => b.createdAt), 14),
      threads: perDay(state.threads.map((t) => t.createdAt), 14),
      media: perDay(state.media.map((m) => m.addedAt), 14),
    }),
    [state.visits, state.bookings, state.threads, state.media],
  );

  const cards = [
    {
      id: "views",
      label: "Page views · 30 days",
      value: stats.visits30.length,
      delta: pct(stats.visits30.length - stats.visitsPrev.length, stats.visitsPrev.length),
      trend: stats.visits30.length >= stats.visitsPrev.length ? "up" : "down",
      icon: "eye",
      href: "/admin/analytics",
      series: series.visits.slice(-14).map((p) => p.value),
    },
    {
      id: "bookings",
      label: "Upcoming demos",
      value: stats.upcoming.length,
      delta: `${stats.bookings30.length} booked this month`,
      trend: stats.bookings30.length >= stats.bookingsPrev.length ? "up" : "down",
      icon: "calendar",
      href: "/admin/bookings",
      series: series.bookings.map((p) => p.value),
    },
    {
      id: "messages",
      label: "Unread conversations",
      value: stats.unread.length,
      delta: `${stats.threads30.length} new this month`,
      trend: stats.threads30.length >= stats.threadsPrev.length ? "up" : "down",
      icon: "mail",
      href: "/admin/messages",
      series: series.threads.map((p) => p.value),
    },
    {
      id: "media",
      label: "Images in library",
      value: state.media.length,
      delta: `${series.media.reduce((a, p) => a + p.value, 0)} added recently`,
      trend: "flat",
      icon: "image",
      href: "/admin/media",
      series: series.media.map((p) => p.value),
    },
  ] as const;

  const peak = series.visits.reduce((m, p) => (p.value > m.value ? p : m), series.visits[0]);

  const latest = useMemo(() => {
    const items = [
      ...state.bookings.map((b) => ({
        id: b.id,
        at: b.createdAt,
        icon: "calendar",
        href: "/admin/bookings",
        title: `${b.name} booked a demo`,
        detail: [b.company, `${b.date} at ${b.time}`].filter(Boolean).join(" · "),
      })),
      ...state.threads.map((t) => ({
        id: t.id,
        at: t.createdAt,
        icon: "mail",
        href: "/admin/messages",
        title: `${t.name} sent an enquiry`,
        detail: [t.company, t.subject].filter(Boolean).join(" · ") || t.messages[0]?.body.slice(0, 80) || "",
      })),
    ];
    return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 8);
  }, [state.bookings, state.threads]);

  return (
    <>
      <AdminHeader
        title={`Welcome back, ${user?.name ?? name}`}
        description="What the site has been doing, from its own records."
        action={
          // Rendered only once the client is up: the build-time date would not match.
          ready && (
            <span className="hidden items-center gap-2.5 rounded-xl border border-[var(--ax-line)] px-3.5 py-2 text-[12px] text-[var(--ax-ink-muted)] sm:inline-flex">
              <Icon name="calendar" className="size-4 text-[var(--ax-ink-dim)]" strokeWidth={1.9} />
              <span className="flex flex-col leading-tight">
                <span className="text-[var(--ax-ink)]">
                  {today.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="text-[10.5px] text-[var(--ax-ink-dim)]">
                  {today.toLocaleDateString(undefined, { weekday: "long" })}
                </span>
              </span>
            </span>
          )
        }
      />

      {/* ---------- KPI row ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const gid = `kpi-${card.id}`;
          return (
            <div
              key={card.id}
              className="ax-glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-500 hover:border-[var(--ax-line-strong)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
                  <Icon name={card.icon} className="size-4" strokeWidth={1.9} />
                </span>
                <span className="text-[13px] font-medium text-[var(--ax-ink)]">{card.label}</span>

                <Link
                  href={card.href}
                  aria-label={`Open ${card.label}`}
                  className="ax-focus ml-auto grid size-7 place-items-center rounded-full border border-[var(--ax-line-strong)] text-[var(--ax-ink-muted)] transition-all duration-300 group-hover:border-transparent group-hover:bg-[var(--ax-accent)] group-hover:text-white"
                >
                  <Icon name="arrow-right" className="size-3.5" strokeWidth={2.2} />
                </Link>
              </div>

              <div className="mt-4 flex items-end gap-3">
                <span className="ax-display text-[34px] leading-none text-[var(--ax-ink)]">
                  {ready ? card.value.toLocaleString() : "—"}
                </span>
                <Delta value={card.delta} trend={card.trend} className="mb-1" />
              </div>

              <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="mt-4 h-12 w-full" aria-hidden>
                <defs>
                  <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--ax-accent)" stopOpacity="0.42" />
                    <stop offset="100%" stopColor="var(--ax-accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={sparklineArea(card.series as number[], 100, 34)} fill={`url(#${gid})`} />
                <path
                  d={sparklinePath(card.series as number[], 100, 34)}
                  fill="none"
                  stroke="var(--ax-accent)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          );
        })}
      </div>

      {/* ---------- Analytics + side column ---------- */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Website Analytics"
          description="Page views per day, last 30 days."
          action={
            <Link
              href="/admin/analytics"
              className="ax-focus text-[12px] font-medium text-[var(--ax-accent-soft)] transition-colors hover:text-[var(--ax-accent)]"
            >
              Full report
            </Link>
          }
        >
          <div className="mb-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              { label: "Page views", value: stats.visits30.length.toLocaleString() },
              { label: "Pages seen", value: String(stats.pagesSeen) },
              { label: "On a phone", value: `${stats.mobileShare}%` },
              { label: "Came direct", value: `${stats.directShare}%` },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <span className="ax-display text-[24px] leading-none text-[var(--ax-ink)]">
                  {ready ? item.value : "—"}
                </span>
                <span className="text-[11.5px] text-[var(--ax-ink-dim)]">{item.label}</span>
              </div>
            ))}
          </div>

          {stats.visits30.length > 0 ? (
            <>
              <AreaChart id="dash" data={series.visits} height={230} />
              <p className="mt-4 flex items-center gap-2 text-[11.5px] text-[var(--ax-ink-dim)]">
                <span className="size-1.5 rounded-full bg-[var(--ax-accent)]" />
                Peak {peak.label} · {peak.value.toLocaleString()} views
              </p>
            </>
          ) : (
            <p className="grid h-[230px] place-items-center text-center text-[12.5px] text-[var(--ax-ink-dim)]">
              {ready ? "No page views recorded yet. Open the public site and they will appear here." : "Loading…"}
            </p>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel
            title={stats.products.length ? "Top Products" : "Top Pages"}
            description="By views, last 30 days."
            action={
              <Link
                href="/admin/analytics"
                className="ax-focus text-[12px] font-medium text-[var(--ax-accent-soft)] transition-colors hover:text-[var(--ax-accent)]"
              >
                View All
              </Link>
            }
          >
            {stats.products.length > 0 ? (
              <ul className="flex flex-col gap-3.5">
                {stats.products.map((product) => (
                  <li key={product.slug} className="group flex items-center gap-3">
                    <span
                      className="h-10 w-1.5 shrink-0 rounded-full"
                      style={{ background: product.accent }}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/admin/products?slug=${product.slug}`}
                        className="ax-focus truncate text-[13px] font-medium text-[var(--ax-ink)]"
                      >
                        {product.name}
                      </Link>
                      <span className="text-[11px] text-[var(--ax-ink-dim)]">
                        {product.views.toLocaleString()} view{product.views === 1 ? "" : "s"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : stats.topPages.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {stats.topPages.map(([path, count]) => (
                  <li key={path} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[var(--ax-ink)]">
                      {path}
                    </span>
                    <span className="text-[11.5px] text-[var(--ax-ink-dim)]">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-[12.5px] text-[var(--ax-ink-dim)]">
                Nothing viewed yet.
              </p>
            )}
          </Panel>

          <Panel title="Quick actions" action={<span className="text-[11.5px] text-[var(--ax-ink-dim)]">Editing</span>}>
            <ul className="grid grid-cols-2 gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="ax-focus flex items-center gap-2.5 rounded-xl border border-[var(--ax-line)] px-3 py-2.5 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:border-[var(--ax-line-strong)] hover:bg-[rgba(var(--ax-glow),0.07)]"
                  >
                    <Icon name={link.icon} className="size-4 shrink-0 text-[var(--ax-accent-soft)]" strokeWidth={1.9} />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* ---------- Latest ---------- */}
      <div className="mt-4">
        <Panel
          title="Latest"
          description="Bookings and enquiries as they arrived."
          padded={false}
          action={
            <span className="text-[11.5px] text-[var(--ax-ink-dim)]">
              {stats.upcoming.length} upcoming · {stats.unread.length} unread
            </span>
          }
        >
          {latest.length === 0 ? (
            <p className="px-6 py-10 text-center text-[12.5px] text-[var(--ax-ink-dim)]">
              {ready ? "Nothing yet. Bookings and enquiries from the contact page will appear here." : "Loading…"}
            </p>
          ) : (
            <ul className="flex flex-col">
              {latest.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "ax-focus flex items-center gap-4 border-b border-[var(--ax-line)] px-6 py-3.5 transition-colors last:border-0 hover:bg-[rgba(var(--ax-glow),0.05)]",
                    )}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)] text-[var(--ax-accent-soft)]">
                      <Icon name={item.icon} className="size-4" strokeWidth={1.9} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-medium text-[var(--ax-ink)]">{item.title}</span>
                      <span className="truncate text-[11.5px] text-[var(--ax-ink-dim)]">{item.detail}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--ax-ink-dim)]">
                      {new Date(item.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
