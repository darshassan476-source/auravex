"use client";

import { useMemo, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { BarList, ColumnChart, DonutChart, TrendChart, type Point } from "@/components/admin/Charts";
import { Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import { PAGE_LABELS } from "@/lib/cms";
import { cn } from "@/lib/utils";

const RANGES = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
] as const;

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function shortDay(key: string) {
  const d = new Date(`${key}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function prettyPath(path: string) {
  if (path === "/") return "Home";
  const slug = path.replace(/^\//, "");
  const known = (PAGE_LABELS as Record<string, string>)[slug];
  return known ?? path;
}

/**
 * Visitor analytics from the server's visit log.
 *
 * Every public page view posts to /api/track; the portal reads the log back
 * through /api/admin/visits. Nothing identifies a person — a path, a source
 * and a device class per view.
 */
export function VisitorAnalytics() {
  const { state, ready, clearVisits } = useCms();
  const [rangeId, setRangeId] = useState<(typeof RANGES)[number]["id"]>("30");
  const range = RANGES.find((r) => r.id === rangeId) ?? RANGES[1];

  const visits = useMemo(() => {
    const cutoff = Date.now() - range.days * 86_400_000;
    return state.visits.filter((v) => new Date(v.at).getTime() >= cutoff);
  }, [state.visits, range.days]);

  /** One bucket per day across the window, so gaps read as zero not absence. */
  const perDay = useMemo<Point[]>(() => {
    const buckets = new Map<string, number>();
    for (let i = range.days - 1; i >= 0; i--) {
      buckets.set(dayKey(new Date(Date.now() - i * 86_400_000).toISOString()), 0);
    }
    visits.forEach((v) => {
      const k = dayKey(v.at);
      if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
    });
    return [...buckets.entries()].map(([k, value]) => ({ label: shortDay(k), value }));
  }, [visits, range.days]);

  const perPage = useMemo<Point[]>(() => {
    const counts = new Map<string, number>();
    visits.forEach((v) => counts.set(v.path, (counts.get(v.path) ?? 0) + 1));
    return [...counts.entries()]
      .map(([path, value]) => ({ label: prettyPath(path), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [visits]);

  const perDevice = useMemo<Point[]>(() => {
    const counts = { desktop: 0, tablet: 0, mobile: 0 };
    visits.forEach((v) => (counts[v.device] += 1));
    return [
      { label: "Desktop", value: counts.desktop },
      { label: "Tablet", value: counts.tablet },
      { label: "Mobile", value: counts.mobile },
    ].filter((d) => d.value > 0);
  }, [visits]);

  const perSource = useMemo<Point[]>(() => {
    const counts = new Map<string, number>();
    visits.forEach((v) => counts.set(v.source, (counts.get(v.source) ?? 0) + 1));
    return [...counts.entries()]
      .map(([label, value]) => ({ label: label === "direct" ? "Direct" : label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [visits]);

  const perHour = useMemo<Point[]>(() => {
    const counts = Array.from({ length: 24 }, () => 0);
    visits.forEach((v) => (counts[new Date(v.at).getHours()] += 1));
    return counts.map((value, h) => ({ label: `${h}`, value }));
  }, [visits]);

  const days = new Set(visits.map((v) => dayKey(v.at))).size;
  const busiest = perDay.reduce((a, b) => (b.value > a.value ? b : a), { label: "—", value: 0 });

  const recent = [...state.visits].slice(-12).reverse();

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-accent)]/30 bg-[rgba(var(--ax-glow),0.07)] px-4 py-3 text-[12.5px] leading-relaxed text-[var(--ax-ink-muted)]">
        <Icon
          name="shield"
          className="mt-0.5 size-4 shrink-0 text-[var(--ax-accent-soft)]"
          strokeWidth={1.9}
        />
        <span>
          Every public page view is recorded by the server — from{" "}
          <strong className="text-[var(--ax-ink)]">every visitor and device</strong>, not
          just this browser. Only a path, a source and a device class are kept; nothing
          identifies a person. The portal itself and its live preview are not counted.
        </span>
      </p>

      {/* Range + totals */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRangeId(r.id)}
              className={cn(
                "ax-focus rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all duration-300",
                r.id === rangeId
                  ? "border-transparent bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                  : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {state.visits.length > 0 && (
          <button
            type="button"
            onClick={clearVisits}
            className="ax-focus inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
          >
            <Icon name="trash" className="size-3.5" strokeWidth={2} />
            Clear the log
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Page views" value={visits.length} icon="eye" />
        <Stat label="Pages seen" value={perPage.length} icon="file" />
        <Stat label="Active days" value={days} icon="calendar" />
        <Stat label="Busiest day" value={busiest.value} sub={busiest.label} icon="trending" />
      </div>

      <Panel
        title="Page views"
        description={`Daily, across the ${range.label.toLowerCase()}.`}
      >
        {/* Day labels come from the clock, so the chart renders only once the client is up. */}
        {ready ? (
          <TrendChart data={perDay} label="Page views per day" />
        ) : (
          <p className="py-10 text-center text-[12.5px] text-[var(--ax-ink-dim)]">Loading…</p>
        )}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Most visited pages">
          <BarList data={perPage} />
        </Panel>

        <Panel title="Devices">
          <DonutChart data={perDevice} centreLabel="views" />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Where visits came from">
          <BarList data={perSource} />
        </Panel>

        <Panel title="By hour of day" description="Local time on the visiting device.">
          <ColumnChart data={perHour} />
        </Panel>
      </div>

      <Panel title="Most recent visits" padded={false}>
        {!ready || recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-[12.5px] text-[var(--ax-ink-dim)]">
            Nothing logged yet. Open the public site in another tab and browse a few
            pages — they will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-[var(--ax-line)] text-[11px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">
                  <th className="px-6 py-3 font-medium">Page</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Device</th>
                  <th className="px-6 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((v, i) => (
                  <tr
                    key={`${v.at}-${i}`}
                    className="border-b border-[var(--ax-line)] last:border-0 transition-colors hover:bg-[rgba(var(--ax-glow),0.05)]"
                  >
                    <td className="px-6 py-3 text-[12.5px] text-[var(--ax-ink)]">{v.path}</td>
                    <td className="px-6 py-3 text-[12.5px] text-[var(--ax-ink-muted)]">
                      {v.source === "direct" ? "Direct" : v.source}
                    </td>
                    <td className="px-6 py-3 text-[12.5px] capitalize text-[var(--ax-ink-muted)]">
                      {v.device}
                    </td>
                    <td className="px-6 py-3 font-mono text-[11.5px] text-[var(--ax-ink-dim)]">
                      {new Date(v.at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="ax-glass ax-edge-light flex items-center gap-4 rounded-2xl p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
        <Icon name={icon} className="size-[18px]" strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="ax-display text-[26px] leading-none text-[var(--ax-ink)]">
          {value.toLocaleString()}
        </span>
        <span className="mt-1 truncate text-[12px] text-[var(--ax-ink-muted)]">{label}</span>
        {sub && <span className="truncate text-[11px] text-[var(--ax-ink-dim)]">{sub}</span>}
      </span>
    </div>
  );
}
