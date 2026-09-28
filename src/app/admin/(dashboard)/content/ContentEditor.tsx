"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCms } from "@/cms/CmsProvider";
import { CONTENT_DEFAULTS, CONTENT_GROUPS, type ContentField } from "@/cms/contentSchema";
import { ContentPreview } from "./ContentPreview";
import { Panel } from "@/components/admin/Primitives";
import { SitePreview } from "@/components/admin/SitePreview";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Every editable string on the public site, grouped by where it appears.
 *
 * Edits are live: they write through to the store the site reads, so a field
 * changed here is changed on the page before you get back to it. Each field
 * shows whether it still holds the built-in copy and can be put back.
 */
export function ContentEditor() {
  const { state, error, setText, resetText } = useCms();
  const [group, setGroup] = useState(CONTENT_GROUPS[0].id);
  const [query, setQuery] = useState("");
  /** Which field the preview should highlight. */
  const [focused, setFocused] = useState<string | null>(null);

  const valueOf = (id: string) => state.text[id] ?? CONTENT_DEFAULTS[id] ?? "";

  const active = CONTENT_GROUPS.find((g) => g.id === group) ?? CONTENT_GROUPS[0];

  const fields = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active.fields;
    return CONTENT_GROUPS.flatMap((g) => g.fields).filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.value.toLowerCase().includes(q),
    );
  }, [active, query]);

  const changed = Object.keys(state.text).length;

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10 px-4 py-3 text-[12.5px] text-[var(--ax-warning)]">
          <Icon name="bell" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error}
        </p>
      )}

      <Panel
        title="Live preview"
        description="The real page, updating as you type below."
      >
        <SitePreview height={460} />
      </Panel>

      <Panel
        title="Site copy"
        description={
          changed
            ? `${changed} field${changed === 1 ? "" : "s"} changed from the built-in copy.`
            : "Nothing changed yet — every field below still shows the built-in copy."
        }
        action={
          <Link
            href="/"
            target="_blank"
            className="ax-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--ax-accent-soft)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)]"
          >
            View site
            <Icon name="external-link" className="size-3.5" strokeWidth={2} />
          </Link>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {CONTENT_GROUPS.map((g) => {
                const isActive = g.id === active.id && !query;
                const edits = g.fields.filter((f) => f.id in state.text).length;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setGroup(g.id);
                    }}
                    className={cn(
                      "ax-focus inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all duration-300",
                      isActive
                        ? "border-transparent bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                        : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
                    )}
                  >
                    {g.label}
                    {edits > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[10px] font-semibold",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[rgba(var(--ax-glow),0.16)] text-[var(--ax-accent-soft)]",
                        )}
                      >
                        {edits}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <label className="flex items-center gap-2 rounded-full border border-[var(--ax-line)] px-3.5 py-2 lg:w-64">
              <Icon
                name="search"
                className="size-3.5 shrink-0 text-[var(--ax-ink-dim)]"
                strokeWidth={2}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all copy…"
                className="w-full bg-transparent text-[12.5px] text-[var(--ax-ink)] outline-none placeholder:text-[var(--ax-ink-dim)]"
              />
            </label>
          </div>

          {!query && (
            <p className="text-[12.5px] text-[var(--ax-ink-muted)]">{active.description}</p>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
            <div className="flex flex-col gap-3">
              {fields.map((field) => (
                <Field
                  key={field.id}
                  field={field}
                  value={state.text[field.id]}
                  onChange={(v) => setText(field.id, v)}
                  onReset={() => resetText(field.id)}
                  onFocus={() => setFocused(field.id)}
                  onBlur={() => setFocused((f) => (f === field.id ? null : f))}
                />
              ))}
              {fields.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--ax-line-strong)] px-4 py-8 text-center text-[12.5px] text-[var(--ax-ink-dim)]">
                  Nothing matches “{query}”.
                </p>
              )}
            </div>

            {!query && (
              <aside className="hidden xl:block">
                <div className="sticky top-6 flex flex-col gap-2.5">
                  <span className="flex items-center gap-2">
                    <Icon
                      name="eye"
                      className="size-3.5 text-[var(--ax-accent-soft)]"
                      strokeWidth={2}
                    />
                    <span className="ax-eyebrow">Where this appears</span>
                  </span>
                  <ContentPreview
                    groupId={active.id}
                    value={valueOf}
                    active={focused}
                  />
                  <p className="text-[11.5px] leading-relaxed text-[var(--ax-ink-dim)]">
                    Click into any field and the matching piece lights up here. This
                    updates as you type.
                  </p>
                </div>
              </aside>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
  onReset,
  onFocus,
  onBlur,
}: {
  field: ContentField;
  value?: string;
  onChange: (v: string) => void;
  onReset: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const edited = value !== undefined && value !== field.value;
  const shown = value ?? field.value;

  const inputClass =
    "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] " +
    "px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[var(--ax-ink)] outline-none " +
    "transition-colors duration-300 placeholder:text-[var(--ax-ink-dim)] " +
    "focus:border-[var(--ax-line-strong)]";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-4 transition-colors duration-300",
        edited ? "border-[var(--ax-accent)]/40 bg-[rgba(var(--ax-glow),0.05)]" : "border-[var(--ax-line)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--ax-ink)]">{field.label}</span>
          {edited && (
            <span className="rounded-full bg-[rgba(var(--ax-glow),0.16)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ax-accent-soft)]">
              Changed
            </span>
          )}
        </span>

        {edited && (
          <button
            type="button"
            onClick={onReset}
            className="ax-focus shrink-0 rounded-lg px-2 py-1 text-[11.5px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
          >
            Revert
          </button>
        )}
      </div>

      {field.long ? (
        <textarea
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseEnter={onFocus}
          rows={3}
          className={cn(inputClass, "resize-y")}
        />
      ) : (
        <input
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseEnter={onFocus}
          className={inputClass}
        />
      )}

      {field.hint && (
        <span className="text-[11.5px] text-[var(--ax-ink-dim)]">{field.hint}</span>
      )}
    </div>
  );
}
