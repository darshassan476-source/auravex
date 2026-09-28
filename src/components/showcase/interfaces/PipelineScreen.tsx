import { Icon } from "@/components/ui/Icon";

/**
 * Sales pipeline — the interface a CRM actually looks like: a funnel across
 * the top, the deal list under it, and the activity feed on the right.
 */

const STAGES = [
  { label: "New", count: 284, width: 100 },
  { label: "Contacted", count: 196, width: 78 },
  { label: "Qualified", count: 112, width: 56 },
  { label: "Proposal", count: 64, width: 38 },
  { label: "Won", count: 38, width: 24 },
];

const DEALS = [
  { name: "Nexar Properties", owner: "MK", value: "AED 1.2M", stage: "Proposal", heat: 92 },
  { name: "Gulf Infrastructure", owner: "RS", value: "AED 860K", stage: "Qualified", heat: 74 },
  { name: "Vision Holdings", owner: "LN", value: "AED 640K", stage: "Contacted", heat: 58 },
  { name: "Arada Developments", owner: "JD", value: "AED 410K", stage: "New", heat: 31 },
];

const ACTIVITY = [
  { icon: "mail", text: "Proposal opened", who: "Nexar", when: "4m" },
  { icon: "message", text: "Reply received", who: "Gulf Infra", when: "26m" },
  { icon: "calendar", text: "Demo booked", who: "Vision", when: "1h" },
  { icon: "check-circle", text: "Deal won", who: "Sobha", when: "3h" },
];

export function PipelineScreen({ accent = "var(--ax-accent)" }: { accent?: string }) {
  return (
    <div className="flex h-full flex-col bg-[var(--ax-bg-elevated)] text-[var(--ax-ink)]">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--ax-line)] px-4 py-2.5">
        <span className="flex items-center gap-2.5">
          <span className="text-[12px] font-semibold">Pipeline</span>
          <span className="text-[9.5px] text-[var(--ax-ink-dim)]">Q4 · 694 open leads</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="rounded-md px-2 py-1 text-[9.5px] font-medium text-white"
            style={{ background: accent }}
          >
            + Add lead
          </span>
          <span className="grid size-5 place-items-center rounded-full bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[8px] font-bold text-white">
            AD
          </span>
        </span>
      </header>

      {/* Funnel */}
      <div className="flex flex-col gap-1.5 border-b border-[var(--ax-line)] px-4 py-3">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-2.5">
            <span className="w-14 shrink-0 text-[9px] text-[var(--ax-ink-muted)]">
              {stage.label}
            </span>
            <span className="h-3 flex-1 overflow-hidden rounded-[3px] bg-[rgba(var(--ax-glow),0.08)]">
              <span
                className="block h-full rounded-[3px]"
                style={{
                  width: `${stage.width}%`,
                  background: `linear-gradient(90deg, ${accent}, ${accent}55)`,
                  opacity: 1 - i * 0.12,
                }}
              />
            </span>
            <span className="w-8 shrink-0 text-right font-mono text-[9px] text-[var(--ax-ink)]">
              {stage.count}
            </span>
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-[1.55fr_1fr] overflow-hidden">
        {/* Deals */}
        <div className="flex flex-col border-r border-[var(--ax-line)]">
          <div className="grid grid-cols-[1.6fr_0.9fr_0.8fr] gap-2 border-b border-[var(--ax-line)] px-3.5 py-2 text-[8px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">
            <span>Account</span>
            <span>Value</span>
            <span>Score</span>
          </div>

          {DEALS.map((deal) => (
            <div
              key={deal.name}
              className="grid grid-cols-[1.6fr_0.9fr_0.8fr] items-center gap-2 border-b border-[var(--ax-line)] px-3.5 py-2.5 last:border-0"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[rgba(var(--ax-glow),0.18)] text-[7.5px] font-bold text-[var(--ax-ink-muted)]">
                  {deal.owner}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[10px] font-medium text-[var(--ax-ink)]">
                    {deal.name}
                  </span>
                  <span className="text-[8px] text-[var(--ax-ink-dim)]">{deal.stage}</span>
                </span>
              </span>

              <span className="font-mono text-[9.5px] text-[var(--ax-ink)]">{deal.value}</span>

              <span className="flex items-center gap-1.5">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(var(--ax-glow),0.10)]">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${deal.heat}%`, background: accent }}
                  />
                </span>
                <span className="w-5 text-right text-[8px] text-[var(--ax-ink-muted)]">
                  {deal.heat}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="flex flex-col gap-2 p-3">
          <span className="text-[9px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">
            Live activity
          </span>
          {ACTIVITY.map((item) => (
            <span key={item.text} className="flex items-start gap-2">
              <span
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md"
                style={{ background: `${accent}22`, color: accent }}
              >
                <Icon name={item.icon} className="size-2.5" strokeWidth={2.2} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[9.5px] text-[var(--ax-ink)]">{item.text}</span>
                <span className="text-[8px] text-[var(--ax-ink-dim)]">
                  {item.who} · {item.when} ago
                </span>
              </span>
            </span>
          ))}

          <span className="mt-auto rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] p-2">
            <span className="block text-[8.5px] font-semibold text-[var(--ax-ink)]">
              Next best action
            </span>
            <span className="mt-0.5 block text-[8px] leading-snug text-[var(--ax-ink-dim)]">
              Call Gulf Infrastructure — proposal opened three times today.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
