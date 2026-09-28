"use client";

import { useEffect, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import { PALETTE_GROUPS, PALETTE_KEYS, PALETTE_META, type PaletteKey, type PaletteScope } from "@/lib/cms";
import { CONTRAST_TARGETS, contrastRatio, parseColor } from "@/lib/contrast";
import { cn } from "@/lib/utils";
import { useTheme } from "@/themes/ThemeProvider";

/**
 * Every colour of one scope, editable. The picker is the full spectrum and
 * the field beside it takes any CSS colour, so a theme is not limited to the
 * presets; whatever is chosen, the text is kept readable.
 */
export function PalettePanel({ scope, onScope }: { scope: PaletteScope; onScope: (s: PaletteScope) => void }) {
  const { state, setPalette, resetPalette } = useCms();
  const { theme } = useTheme();
  const setScope = onScope;

  return (
    <Panel
      title="Colours"
      description={
        scope === "site"
          ? "Overrides for the public site, on top of the " + theme.name + " preset."
          : "Overrides for this portal only. The public site keeps its own colours."
      }
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-[var(--ax-line)] p-0.5">
            {(["site", "portal"] as PaletteScope[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setScope(option)}
                className={cn(
                  "ax-focus rounded-full px-3 py-1.5 text-[12px] font-medium transition-all duration-300",
                  option === scope
                    ? "bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                    : "text-[var(--ax-ink-muted)] hover:text-[var(--ax-ink)]",
                )}
              >
                {option === "site" ? "Public site" : "Admin portal"}
              </button>
            ))}
          </div>

          {Object.keys(scope === "site" ? state.palette : state.portalPalette).length >
            0 && (
            <button
              type="button"
              onClick={() => resetPalette(scope)}
              className="ax-focus inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
            >
              <Icon name="x" className="size-3.5" strokeWidth={2.4} />
              Reset
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <p className="text-[12.5px] leading-relaxed text-[var(--ax-ink-muted)]">
          Any colour at all — the picker is the full spectrum, and the field beside it
          accepts any CSS colour, including translucent ones like{" "}
          <code className="font-mono text-[11.5px] text-[var(--ax-accent-soft)]">
            rgba(20, 30, 60, 0.6)
          </code>
          . Every combination is allowed, and the page repaints as you drag.
        </p>

        <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-success)]/30 bg-[var(--ax-success)]/8 px-3.5 py-2.5 text-[12px] leading-relaxed text-[var(--ax-ink-muted)]">
          <Icon
            name="shield"
            className="mt-0.5 size-3.5 shrink-0 text-[var(--ax-success)]"
            strokeWidth={2}
          />
          <span>
            Text can never become unreadable. Whatever you pick, the heading, body and
            caption colours are measured against the page background and nudged just far
            enough to stay legible — the bar under each one shows the contrast it lands on.
          </span>
        </p>

        {PALETTE_GROUPS.map((group) => {
          const keys = PALETTE_KEYS.filter((k) => PALETTE_META[k].group === group);
          return (
            <div key={group} className="flex flex-col gap-3">
              <span className="ax-eyebrow">{group}</span>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {keys.map((key) => (
                  <ColourRow
                    key={scope + "-" + key}
                    tokenKey={key}
                    value={(scope === "site" ? state.palette : state.portalPalette)[key]}
                    onChange={(v) => setPalette(scope, key, v)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ---------------- pieces ---------------- */

function ColourRow({
  tokenKey,
  value,
  onChange,
}: {
  tokenKey: PaletteKey;
  value?: string;
  onChange: (v: string | null) => void;
}) {
  const meta = PALETTE_META[tokenKey];
  const [draft, setDraft] = useState(value ?? "");

  // Keep the text field in step when the picker, a reset or a scope change
  // moves the value out from under it.
  useEffect(() => setDraft(value ?? ""), [value]);

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[var(--ax-line)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-semibold text-[var(--ax-ink)]">
            {meta.label}
          </span>
          <span className="text-[11.5px] leading-snug text-[var(--ax-ink-dim)]">
            {meta.hint}
          </span>
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ax-focus shrink-0 rounded px-1 text-[11px] text-[var(--ax-ink-dim)] transition-colors hover:text-[var(--ax-ink)]"
          >
            reset
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <label
          className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-[var(--ax-line-strong)]"
          style={{ background: value ?? "var(" + meta.cssVar + ")" }}
        >
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(value ?? "") ? (value as string) : "#3b82f6"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            aria-label={meta.label + " colour picker"}
          />
        </label>

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange(draft.trim() || null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onChange(draft.trim() || null);
          }}
          placeholder={meta.alpha ? "rgba(20, 30, 60, 0.6)" : "preset default"}
          spellCheck={false}
          className="ax-focus w-full rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] px-2.5 py-1.5 font-mono text-[11.5px] text-[var(--ax-ink)] outline-none transition-colors focus:border-[var(--ax-line-strong)]"
        />
      </div>

      <ContrastReadout tokenKey={tokenKey} />
    </div>
  );
}

/**
 * What this token actually measures against the page background, after the
 * guard has had its say. Text tokens can never end up unreadable — this is
 * here so you can see how much headroom a choice leaves.
 */
function ContrastReadout({ tokenKey }: { tokenKey: PaletteKey }) {
  const [reading, setReading] = useState<{ ratio: number; target: number } | null>(null);
  const target = (CONTRAST_TARGETS as Record<string, number>)[tokenKey];

  useEffect(() => {
    if (!target) return;

    const measure = () => {
      const computed = getComputedStyle(document.documentElement);
      const bg = parseColor(computed.getPropertyValue("--ax-bg"));
      const fg = parseColor(computed.getPropertyValue(PALETTE_META[tokenKey].cssVar));
      if (bg && fg) setReading({ ratio: contrastRatio(fg, bg), target });
    };

    // After paint, so the guard has already run.
    const id = window.setTimeout(measure, 60);
    return () => window.clearTimeout(id);
  });

  if (!reading) return null;

  const comfortable = reading.ratio >= reading.target + 1.5;
  const tone = comfortable
    ? "var(--ax-success)"
    : reading.ratio >= reading.target
      ? "var(--ax-warning)"
      : "var(--ax-danger)";

  return (
    <span className="flex items-center gap-2">
      <span className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(var(--ax-glow),0.12)]">
        <span
          className="block h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.min(100, (reading.ratio / 12) * 100)}%`,
            background: tone,
          }}
        />
      </span>
      <span className="shrink-0 font-mono text-[10px]" style={{ color: tone }}>
        {reading.ratio.toFixed(1)}:1
      </span>
    </span>
  );
}
