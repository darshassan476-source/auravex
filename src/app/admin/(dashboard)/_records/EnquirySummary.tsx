"use client";

import { DEPLOYMENT_LABELS } from "@/data/products";
import type { EnquiryDetails } from "@/lib/enterprise";
import type { DeploymentOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Chip } from "./kit";

const deploymentLabel = (value?: string) =>
  value ? (DEPLOYMENT_LABELS[value as DeploymentOption] ?? value) : undefined;

/** Every field the website's enquiry form captured, as a compact definition list. */
export function EnquirySummary({
  details,
  productName,
  compact = false,
}: {
  details: EnquiryDetails;
  /** Falls back to the slug when the stored name is missing. */
  productName?: string;
  compact?: boolean;
}) {
  const rows: [string, string | undefined][] = [
    ["Product", details.productName || productName || details.productSlug],
    ["Country", details.country],
    ["Industry", details.industry],
    ["Optional modules", details.modules?.length ? details.modules.join(", ") : undefined],
    ["AI enhancements", details.aiEnhancements?.length ? details.aiEnhancements.join(", ") : undefined],
    ["Voice-to-voice AI", details.voiceAI ? "Requested" : undefined],
    ["Departments", details.departments ? String(details.departments) : undefined],
    ["Approximate users", details.users ? String(details.users) : undefined],
    ["Integrations", details.integrations],
    ["Custom workflows", details.workflows],
    ["Deployment", deploymentLabel(details.deployment)],
    ["Preferred meeting times", details.meetingRequested ? details.meetingTimes || "Meeting requested — no times given" : undefined],
  ];
  const shown = rows.filter((r): r is [string, string] => Boolean(r[1]));

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-1.5">
        <Chip tone={details.path === "configure" ? "accent" : "muted"}>
          {details.path === "configure" ? "Configured solution" : "Direct consultation"}
        </Chip>
        {details.meetingRequested && <Chip tone="warning">Meeting requested</Chip>}
        {details.commercialProposal && <Chip tone="success">Commercial proposal</Chip>}
      </div>
      {shown.length > 0 && (
        <dl className={cn("grid gap-x-5 gap-y-1.5", compact ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
          {shown.map(([label, value]) => (
            <div key={label} className="flex min-w-0 flex-col">
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ax-ink-dim)]">{label}</dt>
              <dd className="whitespace-pre-wrap break-words text-[12.5px] text-[var(--ax-ink)]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
