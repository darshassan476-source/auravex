import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Workflow board — the interface an operations product actually looks like.
 *
 * Deliberately not another KPI dashboard: columns, cards, assignees and SLA
 * chips. A catalogue where every product shows the same chart layout reads as
 * one product with the numbers changed.
 */

const COLUMNS = [
  {
    title: "Submitted",
    tone: "var(--ax-ink-dim)",
    count: 12,
    cards: [
      { title: "Vendor onboarding · Alserkal", tag: "Procurement", age: "2h", avatar: "MK" },
      { title: "Variation order #4182", tag: "Delivery", age: "5h", avatar: "RS" },
      { title: "Site access request", tag: "Facilities", age: "1d", avatar: "AH" },
    ],
  },
  {
    title: "In review",
    tone: "var(--ax-warning)",
    count: 8,
    cards: [
      { title: "Invoice matching batch", tag: "Finance", age: "3h", avatar: "LN", flagged: true },
      { title: "Contract renewal · Tower B", tag: "Legal", age: "6h", avatar: "JD" },
    ],
  },
  {
    title: "Approved",
    tone: "var(--ax-success)",
    count: 31,
    cards: [
      { title: "Fit-out permit · Level 14", tag: "Facilities", age: "1d", avatar: "SA" },
      { title: "Quarterly vendor review", tag: "Procurement", age: "2d", avatar: "MK" },
      { title: "Safety inspection sign-off", tag: "HSE", age: "2d", avatar: "TR" },
    ],
  },
];

export function BoardScreen({ accent = "var(--ax-accent)" }: { accent?: string }) {
  return (
    <div className="flex h-full flex-col bg-[var(--ax-bg-elevated)] text-[var(--ax-ink)]">
      {/* Toolbar */}
      <header className="flex items-center justify-between gap-3 border-b border-[var(--ax-line)] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[12px] font-semibold">Approval Board</span>
          <span className="rounded-full border border-[var(--ax-line)] px-2 py-0.5 text-[9px] text-[var(--ax-ink-dim)]">
            Multi-entity
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {["Board", "Table", "Timeline"].map((view, i) => (
            <span
              key={view}
              className={cn(
                "rounded-md px-2 py-1 text-[9.5px]",
                i === 0
                  ? "bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-ink)]"
                  : "text-[var(--ax-ink-dim)]",
              )}
            >
              {view}
            </span>
          ))}
          <span className="ml-1 grid size-5 place-items-center rounded-full bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[8px] font-bold text-white">
            AD
          </span>
        </div>
      </header>

      {/* Columns */}
      <div className="grid flex-1 grid-cols-3 gap-2.5 overflow-hidden p-3">
        {COLUMNS.map((column) => (
          <div key={column.title} className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: column.tone }} />
                <span className="text-[10px] font-semibold text-[var(--ax-ink)]">
                  {column.title}
                </span>
              </span>
              <span className="text-[9px] text-[var(--ax-ink-dim)]">{column.count}</span>
            </div>

            <div className="flex flex-col gap-2">
              {column.cards.map((card) => (
                <article
                  key={card.title}
                  className="flex flex-col gap-2 rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] p-2.5"
                >
                  <span className="line-clamp-2 text-[10px] font-medium leading-snug text-[var(--ax-ink)]">
                    {card.title}
                  </span>

                  <span className="flex items-center justify-between gap-1.5">
                    <span
                      className="truncate rounded px-1.5 py-0.5 text-[8px]"
                      style={{ background: `${accent}22`, color: accent }}
                    >
                      {card.tag}
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {"flagged" in card && card.flagged && (
                        <Icon
                          name="bell"
                          className="size-2.5 text-[var(--ax-warning)]"
                          strokeWidth={2.4}
                        />
                      )}
                      <span className="text-[8px] text-[var(--ax-ink-dim)]">{card.age}</span>
                      <span className="grid size-4 place-items-center rounded-full bg-[rgba(var(--ax-glow),0.18)] text-[7px] font-bold text-[var(--ax-ink-muted)]">
                        {card.avatar}
                      </span>
                    </span>
                  </span>
                </article>
              ))}

              {/* Drop hint, so it reads as a live board */}
              <span className="rounded-lg border border-dashed border-[var(--ax-line)] py-2 text-center text-[8.5px] text-[var(--ax-ink-dim)]">
                Drag here
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SLA strip */}
      <footer className="flex items-center gap-3 border-t border-[var(--ax-line)] px-4 py-2">
        <span className="text-[9px] text-[var(--ax-ink-dim)]">SLA health</span>
        <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(var(--ax-glow),0.10)]">
          <span className="h-full w-[72%]" style={{ background: "var(--ax-success)" }} />
          <span className="h-full w-[19%]" style={{ background: "var(--ax-warning)" }} />
          <span className="h-full w-[9%]" style={{ background: "var(--ax-danger)" }} />
        </span>
        <span className="text-[9px] font-medium text-[var(--ax-success)]">72% on time</span>
      </footer>
    </div>
  );
}
