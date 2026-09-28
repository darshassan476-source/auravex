"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * A live miniature of the part of the site a group of fields controls.
 *
 * The point is that nobody should have to know what "home.hero.titleA" means.
 * You see the headline, the buttons and the paragraph laid out the way a
 * visitor sees them, and the piece you are editing lights up.
 */

/** Wraps one editable region so it can be highlighted from the field list. */
function Region({
  id,
  active,
  children,
  className,
  block,
}: {
  id: string;
  active: string | null;
  children: ReactNode;
  className?: string;
  /** Regions that should sit on their own line. */
  block?: boolean;
}) {
  const on = active === id;
  return (
    <span
      data-field={id}
      className={cn(
        block ? "block" : "inline-block",
        "rounded-[5px] transition-all duration-200",
        on
          ? "bg-[rgba(var(--ax-glow),0.22)] shadow-[0_0_0_2px_var(--ax-accent)]"
          : "shadow-[0_0_0_0_transparent]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Frame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--ax-line-strong)] bg-[var(--ax-bg)]">
      {/* Browser chrome, so it reads as "this is your website" at a glance */}
      <div className="flex items-center gap-2 border-b border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.06)] px-3 py-2">
        <span className="flex gap-1.5">
          {["var(--ax-danger)", "var(--ax-warning)", "var(--ax-success)"].map((c) => (
            <span key={c} className="size-2 rounded-full opacity-70" style={{ background: c }} />
          ))}
        </span>
        <span className="truncate text-[10.5px] text-[var(--ax-ink-dim)]">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function ContentPreview({
  groupId,
  value,
  active,
}: {
  groupId: string;
  /** Current value for any field id. */
  value: (id: string) => string;
  /** Field id currently being edited, highlighted in the preview. */
  active: string | null;
}) {
  if (groupId === "brand") {
    return (
      <Frame title="Header and footer, every page">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--ax-line)] px-3 py-2.5">
            <span className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md bg-[linear-gradient(140deg,var(--ax-accent),var(--ax-violet))] text-[10px] font-bold text-white">
                A
              </span>
              <span className="flex flex-col leading-tight">
                <Region id="site.name" active={active}>
                  <span className="text-[12px] font-bold tracking-[0.18em] text-[var(--ax-ink)]">
                    {value("site.name")}
                  </span>
                </Region>
                <Region id="site.tagline" active={active}>
                  <span className="text-[6.5px] uppercase tracking-[0.16em] text-[var(--ax-ink-dim)]">
                    {value("site.tagline")}
                  </span>
                </Region>
              </span>
            </span>
            <span className="rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-2.5 py-1 text-[9px] font-semibold text-white">
              Request Demo
            </span>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--ax-line)] p-3">
            <span className="text-[9px] uppercase tracking-[0.14em] text-[var(--ax-ink-dim)]">
              Footer
            </span>
            <Region id="site.headline" active={active} block>
              <span className="text-[11px] font-semibold text-[var(--ax-ink)]">
                {value("site.headline")}
              </span>
            </Region>
            <Region id="site.description" active={active} block>
              <span className="text-[9.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                {value("site.description")}
              </span>
            </Region>
            <div className="mt-1 flex flex-col gap-0.5">
              {(["site.email", "site.phone", "site.location"] as const).map((id) => (
                <Region key={id} active={active} id={id} block>
                  <span className="text-[9.5px] text-[var(--ax-ink-muted)]">{value(id)}</span>
                </Region>
              ))}
            </div>
          </div>
        </div>
      </Frame>
    );
  }

  if (groupId === "home-hero") {
    return (
      <Frame title="Home page — the first screen">
        <div className="grid grid-cols-[1.05fr_0.95fr] items-center gap-3">
          <div className="flex flex-col items-start gap-2">
            <Region id="home.hero.eyebrow" active={active}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ax-line)] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-ink-muted)]">
                <span className="size-1 rounded-full bg-[var(--ax-accent)]" />
                {value("home.hero.eyebrow")}
              </span>
            </Region>

            <h3 className="ax-display text-[17px] leading-[1.1]">
              <Region id="home.hero.titleA" active={active}>
                {value("home.hero.titleA")}
              </Region>
              <br />
              <Region id="home.hero.titleB" active={active}>
                {value("home.hero.titleB")}
              </Region>{" "}
              <Region id="home.hero.accent" active={active}>
                <span className="ax-gradient-text">{value("home.hero.accent")}</span>
              </Region>
            </h3>

            <Region id="home.hero.body" active={active} block>
              <span className="text-[9px] leading-relaxed text-[var(--ax-ink-muted)]">
                {value("home.hero.body")}
              </span>
            </Region>

            <div className="mt-1 flex flex-wrap gap-1.5">
              <Region id="home.hero.primaryCta" active={active}>
                <span className="inline-block rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-2.5 py-1.5 text-[9px] font-semibold text-white">
                  {value("home.hero.primaryCta")}
                </span>
              </Region>
              <Region id="home.hero.secondaryCta" active={active}>
                <span className="inline-block rounded-full border border-[var(--ax-line-strong)] px-2.5 py-1.5 text-[9px] font-semibold text-[var(--ax-ink)]">
                  {value("home.hero.secondaryCta")}
                </span>
              </Region>
            </div>
          </div>

          <MiniDevice />
        </div>
      </Frame>
    );
  }

  if (groupId === "home-sections") {
    const rows = [
      { key: "portfolio", label: "Product cards below" },
      { key: "solutions", label: "Solution cards below" },
      { key: "work", label: "Case study below" },
      { key: "process", label: "Three steps below" },
      { key: "stack", label: "Technology cards below" },
    ] as const;

    return (
      <Frame title="Home page — the headings down the page">
        <div className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex flex-col gap-1 rounded-lg border border-[var(--ax-line)] p-2.5"
            >
              <Region id={`home.${row.key}.eyebrow`} active={active}>
                <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-accent-soft)]">
                  {value(`home.${row.key}.eyebrow`)}
                </span>
              </Region>
              <span className="ax-display text-[12.5px] leading-tight">
                <Region id={`home.${row.key}.title`} active={active}>
                  <span className="whitespace-pre-line">{value(`home.${row.key}.title`)}</span>
                </Region>{" "}
                <Region id={`home.${row.key}.accent`} active={active}>
                  <span className="ax-gradient-text">{value(`home.${row.key}.accent`)}</span>
                </Region>
              </span>
              {row.key === "portfolio" && (
                <Region id="home.portfolio.body" active={active} block>
                  <span className="text-[8.5px] leading-relaxed text-[var(--ax-ink-muted)]">
                    {value("home.portfolio.body")}
                  </span>
                </Region>
              )}
              <span className="mt-0.5 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-4 flex-1 rounded border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)]"
                  />
                ))}
              </span>
              <span className="text-[8px] text-[var(--ax-ink-dim)]">{row.label}</span>
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  if (groupId === "cta") {
    return (
      <Frame title="The band at the bottom of most pages">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-4 py-6 text-center">
          <Region id="cta.eyebrow" active={active}>
            <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--ax-accent-soft)]">
              {value("cta.eyebrow")}
            </span>
          </Region>
          <h3 className="ax-display text-[16px] leading-tight">
            <Region id="cta.title" active={active}>
              {value("cta.title")}
            </Region>{" "}
            <Region id="cta.accent" active={active}>
              <span className="ax-gradient-text">{value("cta.accent")}</span>
            </Region>
          </h3>
          <Region id="cta.body" active={active} block>
            <span className="text-[9px] leading-relaxed text-[var(--ax-ink-muted)]">
              {value("cta.body")}
            </span>
          </Region>
          <div className="mt-1 flex gap-1.5">
            <Region id="cta.primary" active={active}>
              <span className="inline-block rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-2.5 py-1.5 text-[9px] font-semibold text-white">
                {value("cta.primary")}
              </span>
            </Region>
            <Region id="cta.secondary" active={active}>
              <span className="inline-block rounded-full border border-[var(--ax-line-strong)] px-2.5 py-1.5 text-[9px] font-semibold text-[var(--ax-ink)]">
                {value("cta.secondary")}
              </span>
            </Region>
          </div>
        </div>
      </Frame>
    );
  }

  if (groupId === "mobile") {
    return (
      <Frame title="Phones only — the bar that follows visitors">
        <div className="mx-auto w-[210px] rounded-[18px] border border-[var(--ax-line-strong)] bg-[var(--ax-bg-elevated)] p-2">
          <div className="h-24 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)]" />
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.08)] p-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-accent-soft)]">
              <Icon name="layers" className="size-3" strokeWidth={2} />
            </span>
            <Region id="mobile.cta.body" active={active} className="min-w-0 flex-1">
              <span className="block text-[8px] leading-snug text-[var(--ax-ink)]">
                {value("mobile.cta.body")}
              </span>
            </Region>
            <Region id="mobile.cta.button" active={active}>
              <span className="inline-block shrink-0 rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-2 py-1 text-[8px] font-semibold text-white">
                {value("mobile.cta.button")}
              </span>
            </Region>
          </div>
        </div>
      </Frame>
    );
  }

  return null;
}

/** A stand-in for the dashboard mock beside the hero copy. */
function MiniDevice() {
  return (
    <div className="rounded-lg border border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.06)] p-1.5">
      <div className="flex gap-1">
        <span className="flex w-8 shrink-0 flex-col gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1.5 rounded-[2px] bg-[rgba(var(--ax-glow),0.18)]" />
          ))}
        </span>
        <span className="flex flex-1 flex-col gap-1">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-5 flex-1 rounded-[3px] border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)]"
              />
            ))}
          </span>
          <span className="h-10 rounded-[3px] border border-[var(--ax-line)] bg-[linear-gradient(180deg,rgba(var(--ax-glow),0.18),transparent)]" />
        </span>
      </div>
    </div>
  );
}
