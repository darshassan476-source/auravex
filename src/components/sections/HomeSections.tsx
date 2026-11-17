"use client";

import { useCms, useText } from "@/cms/CmsProvider";
import { useTextList } from "@/cms/useTextList";
import { UpdateCard } from "@/components/cards/UpdateCard";
import { RevealGroup, RevealItem } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ADDITIONAL_CAPABILITIES, DEPLOYMENT_STEPS, INDUSTRIES, OUTCOMES } from "@/data/enterprise";

/** Small icon tile used across the home sections. */
function IconTile({ name }: { name: string }) {
  return (
    <span
      className="grid size-11 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
      style={{
        background: "linear-gradient(145deg, rgba(var(--ax-glow),0.18), rgba(var(--ax-glow),0.04))",
        boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.2)",
      }}
    >
      <Icon name={name} className="size-5" strokeWidth={1.7} />
    </span>
  );
}

export function OutcomeGrid() {
  const items = useTextList("ex.outcome", OUTCOMES.length, ["title", "body"] as const);
  return (
    <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2" stagger={0.06}>
      {OUTCOMES.map((o, i) => (
        <RevealItem key={o.icon}>
          <div className="ax-glass flex h-full gap-5 rounded-2xl p-6 md:p-7">
            <IconTile name={o.icon} />
            <div>
              <h3 className="text-[17px] font-semibold text-[var(--ax-ink)]">{items[i].title}</h3>
              <p className="ax-text-pretty mt-2 text-[14px] leading-relaxed text-[var(--ax-ink-muted)]">{items[i].body}</p>
            </div>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function IndustryGrid() {
  const items = useTextList("ex.industry", INDUSTRIES.length, ["title", "body"] as const);
  return (
    <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" stagger={0.06}>
      {INDUSTRIES.map((ind, i) => (
        <RevealItem key={ind.slug}>
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--ax-line)] bg-[var(--ax-bg-elevated)] p-6">
            <IconTile name={ind.icon} />
            <h3 className="text-[16px] font-semibold leading-snug text-[var(--ax-ink)]">{items[i].title}</h3>
            <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">{items[i].body}</p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function DeploymentSteps() {
  const items = useTextList("ex.deploy", DEPLOYMENT_STEPS.length, ["title", "body"] as const);
  return (
    <ol className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {DEPLOYMENT_STEPS.map((s, i) => (
        <li key={s.icon} className="relative flex flex-col gap-4 rounded-2xl border border-[var(--ax-line)] p-6">
          <div className="flex items-center justify-between">
            <IconTile name={s.icon} />
            <span className="font-mono text-[12px] text-[var(--ax-ink-dim)]">{String(i + 1).padStart(2, "0")}</span>
          </div>
          <h3 className="text-[17px] font-semibold text-[var(--ax-ink)]">{items[i].title}</h3>
          <p className="ax-text-pretty text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">{items[i].body}</p>
        </li>
      ))}
    </ol>
  );
}

export function CapabilityList() {
  const items = useTextList("ex.cap", ADDITIONAL_CAPABILITIES.length, ["title", "body"] as const);
  return (
    <ul className="mt-12 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
      {ADDITIONAL_CAPABILITIES.map((c, i) => (
        <li key={c.icon + i} className="flex gap-4">
          <IconTile name={c.icon} />
          <div>
            <h3 className="text-[15.5px] font-semibold text-[var(--ax-ink)]">{items[i].title}</h3>
            <p className="ax-text-pretty mt-1.5 text-[13.5px] leading-relaxed text-[var(--ax-ink-muted)]">{items[i].body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The three most recent published updates, or a quiet empty line. */
export function LatestUpdates() {
  const { state } = useCms();
  const empty = useText("ex.home.updates.empty");
  const updates = state.publicUpdates.slice(0, 3);
  if (updates.length === 0) {
    return <p className="mt-10 text-[14.5px] text-[var(--ax-ink-muted)]">{empty}</p>;
  }
  return (
    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {updates.map((u) => (
        <UpdateCard key={u.id} update={u} compact />
      ))}
    </div>
  );
}

export function UpdatesButton() {
  const { state } = useCms();
  const label = useText("ex.home.updates.button");
  if (state.publicUpdates.length === 0) return null;
  return (
    <Button href="/updates" variant="outline" icon="arrow-right" magnetic={false}>
      {label}
    </Button>
  );
}
