"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { EmptyState, LEAD_LABELS, LeadChip, Panel } from "@/components/admin/Primitives";
import { FilterPills } from "@/components/ui/FilterPills";
import { Select } from "@/components/ui/Select";
import type { Thread } from "@/lib/cms";
import type { LeadStatus } from "@/lib/types";
import { EnquirySummary } from "../_records/EnquirySummary";
import { useProductName } from "../_records/kit";

type Filter = "all" | "configure" | "consult" | "meeting";

const FILTERS: { id: Filter; label: string; match: (t: Thread) => boolean }[] = [
  { id: "all", label: "All enquiries", match: () => true },
  { id: "configure", label: "Configured solutions", match: (t) => t.details?.path === "configure" },
  { id: "consult", label: "Direct consultations", match: (t) => t.details?.path === "consult" },
  { id: "meeting", label: "Meeting requests", match: (t) => Boolean(t.details?.meetingRequested) },
];

const STAGES = Object.keys(LEAD_LABELS) as LeadStatus[];

/**
 * Structured enquiries from the website's configurator and consultation form.
 * They are inbox threads underneath, so the conversation and replies stay in
 * Messages; this screen is the requirements view, with the pipeline stage.
 */
export function EnquiriesBoard() {
  const { state, setThreadStatus } = useCms();
  const productName = useProductName();
  const [filter, setFilter] = useState<Filter>("all");

  const enquiries = useMemo(
    () =>
      state.threads
        .filter((t) => t.details && !t.archived)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.threads],
  );
  const shown = enquiries.filter(FILTERS.find((f) => f.id === filter)!.match);

  return (
    <div className="flex flex-col gap-5">
      <FilterPills
        options={FILTERS.map((f) => ({ id: f.id, label: f.label, count: enquiries.filter(f.match).length }))}
        value={filter}
        onChange={(id) => setFilter(id as Filter)}
        layoutId="enquiry-filter"
      />

      {shown.length === 0 ? (
        <Panel>
          <EmptyState
            icon="mail"
            title={enquiries.length ? "Nothing in this view" : "No enquiries yet"}
            body="Enquiries submitted from product pages and the contact page appear here, with every option the visitor selected."
          />
        </Panel>
      ) : (
        shown.map((t) => (
          <Panel
            key={t.id}
            title={`${t.name}${t.company ? ` — ${t.company}` : ""}`}
            description={`${t.email} · ${new Date(t.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`}
            action={
              <div className="flex items-center gap-2">
                <LeadChip status={t.status} />
                <Select
                  size="sm"
                  label="Pipeline stage"
                  value={t.status}
                  onChange={(v) => setThreadStatus(t.id, v as LeadStatus)}
                  options={STAGES.map((s) => ({ value: s, label: LEAD_LABELS[s] }))}
                />
              </div>
            }
          >
            <EnquirySummary details={t.details!} productName={productName(t.details?.productSlug)} />
            {t.messages[0]?.body && (
              <p className="mt-4 whitespace-pre-wrap rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)] p-3.5 text-[12.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                {t.messages[0].body}
              </p>
            )}
            <div className="mt-4">
              <Link
                href={`/admin/messages?thread=${encodeURIComponent(t.id)}`}
                className="ax-focus text-[12.5px] font-medium text-[var(--ax-accent-soft)] underline underline-offset-2"
              >
                Open conversation and reply
              </Link>
            </div>
          </Panel>
        ))
      )}
    </div>
  );
}
