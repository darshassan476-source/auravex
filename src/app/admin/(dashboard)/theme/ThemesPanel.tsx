"use client";

import { useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import type { PaletteScope } from "@/lib/cms";
import { cn } from "@/lib/utils";
import { CUSTOM_PREFIX, describeCustom, useTheme } from "@/themes/ThemeProvider";
import { THEMES, getTheme } from "@/themes/themes";

const FIELD =
  "ax-focus w-full rounded-xl border border-[var(--ax-line)] bg-[var(--ax-surface)] px-3.5 py-2.5 text-[13px] text-[var(--ax-ink)] outline-none transition-colors focus:border-[var(--ax-accent)]";
const BUTTON =
  "ax-focus inline-flex items-center gap-1.5 rounded-full border border-[var(--ax-line-strong)] px-3 py-1.5 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-colors hover:text-[var(--ax-ink)] disabled:opacity-50";

/**
 * Themes, for each half of the site separately: which one people get before
 * they choose, and the owner's own themes made from the colours below. The
 * public site and the portal never share a choice, so a dark portal never
 * darkens the site for visitors.
 */
export function ThemesPanel({ scope, onScope }: { scope: PaletteScope; onScope: (s: PaletteScope) => void }) {
  const { state, saveCustomTheme, removeCustomTheme, setDefaultTheme } = useCms();
  const { area, themeId, setThemeId, custom } = useTheme();
  const setScope = onScope;
  const [name, setName] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const current = scope === "portal" ? state.portalTheme : state.siteTheme;
  const inThisArea = (scope === "portal") === (area === "portal");
  const builtIn = (mode: "dark" | "light") => THEMES.filter((t) => t.mode === mode);
  const own = state.customThemes.map(describeCustom);
  const paletteEdited = Object.keys(scope === "portal" ? state.portalPalette : state.palette).length > 0;

  function save() {
    // The base is the theme in force where these colours are shown, so the new theme looks like the screen does now.
    const baseId = custom ? custom.base : themeId;
    const base = getTheme(current && !current.startsWith(CUSTOM_PREFIX) ? current : baseId);
    const theme = saveCustomTheme(scope, name, base.id, base.mode);
    setName("");
    setSavedNote(`“${theme.name}” saved. It is in every theme picker now.`);
    setTimeout(() => setSavedNote(null), 4000);
  }

  return (
    <Panel
      title="Themes"
      description="Which theme people see first, and the ones you make yourself. The public site and the admin portal each keep their own."
      action={
        <div className="flex rounded-full border border-[var(--ax-line)] p-0.5">
          {(["site", "portal"] as PaletteScope[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setScope(option)}
              className={cn(
                "ax-focus rounded-full px-3 py-1.5 text-[12px] font-medium transition-all duration-300",
                option === scope ? "bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white" : "text-[var(--ax-ink-muted)] hover:text-[var(--ax-ink)]",
              )}
            >
              {option === "site" ? "Public site" : "Admin portal"}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="ax-eyebrow">{scope === "site" ? "What visitors see first" : "What the portal opens in"}</span>
          <select value={current ?? ""} onChange={(e) => setDefaultTheme(scope, e.target.value || null)} className={FIELD} aria-label="Default theme">
            <option value="">Futuristic Enterprise (the standard)</option>
            {own.length > 0 && (
              <optgroup label="Your themes">
                {own.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            )}
            <optgroup label="Dark">
              {builtIn("dark").map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </optgroup>
            <optgroup label="Light">
              {builtIn("light").map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </optgroup>
          </select>
          <p className="text-[12px] leading-relaxed text-[var(--ax-ink-muted)]">
            {scope === "site"
              ? "Anyone who has not picked a theme gets this one. Their own light or dark switch still works and is remembered in their browser only."
              : "Only your portal. Changing it never touches what visitors see, and your choice here is remembered separately from the site's."}
          </p>
          {inThisArea && current && themeId !== current && (
            <button type="button" onClick={() => setThemeId(current)} className={cn(BUTTON, "self-start")}>
              <Icon name="eye" className="size-3.5" strokeWidth={2.2} />
              Show me this default now
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <span className="ax-eyebrow">Your own themes</span>
          <p className="text-[12px] leading-relaxed text-[var(--ax-ink-muted)]">
            Set any colours in the panel below, then keep them under a name. The theme appears in every picker and can be made the default here.
          </p>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name, e.g. Midnight Brass" className={FIELD} aria-label="Theme name" />
            <button type="button" onClick={save} disabled={!paletteEdited && !custom} className={cn(BUTTON, "shrink-0")} title={paletteEdited || custom ? "" : "Change a colour below first"}>
              <Icon name="plus" className="size-3.5" strokeWidth={2.4} />
              Save current colours
            </button>
          </div>
          {savedNote && <p className="text-[12px] text-[var(--ax-success)]">{savedNote}</p>}
          {own.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {own.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl border border-[var(--ax-line)] px-3 py-2">
                  <span className="size-7 shrink-0 rounded-lg border border-[var(--ax-line)]" style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 0%, ${t.swatch[1]} 55%, ${t.swatch[2]} 100%)` }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-[var(--ax-ink)]">{t.name}</span>
                    <span className="text-[11px] text-[var(--ax-ink-dim)]">{t.mode} · from {getTheme(state.customThemes.find((c) => `${CUSTOM_PREFIX}${c.id}` === t.id)?.base ?? "").name}</span>
                  </span>
                  {current === t.id ? (
                    <span className="text-[11px] font-medium text-[var(--ax-accent-soft)]">Default</span>
                  ) : (
                    <button type="button" onClick={() => setDefaultTheme(scope, t.id)} className={BUTTON}>Make default</button>
                  )}
                  <button type="button" onClick={() => setThemeId(t.id)} className={BUTTON} title="Show it here now">
                    <Icon name="eye" className="size-3.5" strokeWidth={2.2} />
                  </button>
                  <button type="button" onClick={() => removeCustomTheme(t.id.slice(CUSTOM_PREFIX.length))} className={cn(BUTTON, "hover:text-[var(--ax-danger)]")} aria-label={`Delete ${t.name}`}>
                    <Icon name="trash" className="size-3.5" strokeWidth={2.2} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}
