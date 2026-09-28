"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EmptyState, LEAD_LABELS, LeadChip, Panel } from "@/components/admin/Primitives";
import { AX_EASE } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { DemoRequest, LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const PIPELINE: LeadStatus[] = ["new", "contacted", "qualified", "in-progress", "closed"];

/**
 * Lead pipeline over the inbox: every enquiry is a lead, and its stage is
 * stored on the thread, so moving it here is a PATCH the inbox also sees.
 */
export function RequestBoard({
  requests: rows,
  onMove,
}: {
  requests: DemoRequest[];
  onMove: (id: string, status: LeadStatus) => void;
}) {
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.company.toLowerCase().includes(q) ||
        row.interest.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, query]);

  const move = onMove;

  const active = rows.find((row) => row.id === selected);
  const countFor = (status: LeadStatus | "all") =>
    status === "all" ? rows.length : rows.filter((row) => row.status === status).length;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <Panel padded={false}>
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-[var(--ax-line)] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...PIPELINE] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={cn(
                  "ax-focus inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors duration-300",
                  filter === status
                    ? "bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-ink)] ring-1 ring-[var(--ax-line-strong)]"
                    : "text-[var(--ax-ink-dim)] hover:text-[var(--ax-ink-muted)]",
                )}
              >
                {status === "all" ? "All" : LEAD_LABELS[status]}
                <span className="font-mono text-[10.5px] tabular-nums text-[var(--ax-ink-dim)]">
                  {countFor(status)}
                </span>
              </button>
            ))}
          </div>

          <label className="flex h-10 shrink-0 items-center gap-2.5 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-3.5 lg:w-[240px]">
            <Icon name="search" className="size-4 shrink-0 text-[var(--ax-ink-dim)]" strokeWidth={2} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search leads…"
              aria-label="Search leads"
              className="w-full bg-transparent text-[13px] text-[var(--ax-ink)] outline-none placeholder:text-[var(--ax-ink-dim)]"
            />
          </label>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon="mail"
            title={rows.length === 0 ? "No requests yet" : "No requests in this stage"}
            body={
              rows.length === 0
                ? "Every enquiry sent from the contact page becomes a lead here."
                : "Leads move through the pipeline as you work them. Try another filter."
            }
          />
        ) : (
          <ul className="flex flex-col">
            <AnimatePresence initial={false}>
              {visible.map((request) => (
                <motion.li
                  key={request.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: AX_EASE }}
                  className="border-b border-[var(--ax-line)] last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(request.id)}
                    className={cn(
                      "ax-focus flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-300",
                      selected === request.id
                        ? "bg-[rgba(var(--ax-glow),0.10)]"
                        : "hover:bg-[rgba(var(--ax-glow),0.05)]",
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[12px] font-bold text-white">
                      {request.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[13.5px] font-medium text-[var(--ax-ink)]">
                        {request.name}
                      </span>
                      <span className="truncate text-[11.5px] text-[var(--ax-ink-dim)]">
                        {request.company} · {request.interest}
                      </span>
                    </span>

                    <LeadChip status={request.status} />

                    <span className="hidden shrink-0 text-[11.5px] text-[var(--ax-ink-dim)] sm:block">
                      {request.date}
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Panel>

      {/* ---------- Detail pane ---------- */}
      <div className="xl:sticky xl:top-24 xl:self-start">
        {active ? (
          <Panel title="Lead detail" description={active.company}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[17px] font-bold text-white">
                  {active.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-[16px] font-semibold text-[var(--ax-ink)]">
                    {active.name}
                  </span>
                  <a
                    href={`mailto:${active.email}`}
                    className="ax-focus truncate text-[12.5px] text-[var(--ax-accent-soft)] transition-colors hover:text-[var(--ax-accent)]"
                  >
                    {active.email}
                  </a>
                </span>
              </div>

              <dl className="flex flex-col gap-3 border-y border-[var(--ax-line)] py-5 text-[13px]">
                {[
                  { label: "Company", value: active.company },
                  { label: "Interest", value: active.interest },
                  { label: "Received", value: active.date },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4">
                    <dt className="text-[var(--ax-ink-dim)]">{row.label}</dt>
                    <dd className="truncate font-medium text-[var(--ax-ink)]">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ax-ink-dim)]">
                  Move to stage
                </span>
                <div className="flex flex-wrap gap-2">
                  {PIPELINE.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => move(active.id, status)}
                      className={cn(
                        "ax-focus rounded-lg border px-3 py-1.5 text-[11.5px] font-medium transition-all duration-300",
                        active.status === status
                          ? "border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-ink)]"
                          : "border-[var(--ax-line)] text-[var(--ax-ink-dim)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink-muted)]",
                      )}
                    >
                      {LEAD_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                href={`mailto:${active.email}`}
                external
                size="sm"
                icon="mail"
                iconPosition="left"
                className="w-full"
                magnetic={false}
              >
                Reply to {active.name.split(" ")[0]}
              </Button>
            </div>
          </Panel>
        ) : (
          <Panel>
            <EmptyState
              icon="user"
              title="Select a lead"
              body="Pick a request from the list to see the full detail and move it through the pipeline."
            />
          </Panel>
        )}
      </div>
    </div>
  );
}
