import type { CustomTheme } from "@/lib/cms";
import { DEFAULT_MOTION, DEFAULT_THEME_ID, STORAGE_KEYS, THEME_IDS } from "./themes";

/**
 * The script the layout injects before first paint. Server-safe on purpose:
 * the layout builds it from the store's defaults, so a stored or default
 * theme never flashes.
 */

export const CUSTOM_PREFIX = "custom:";

/** What the server knows: the default theme for each area, and the owner's own themes. */
export interface ThemeDefaults {
  site?: string;
  portal?: string;
  custom: CustomTheme[];
}

/**
 * Injected before paint so a persisted theme never flashes the default.
 * The site and the portal each have their own choice (and their own default
 * from the server); a custom theme also paints its colours here, so the first
 * frame is already right.
 */
export function themeNoFlashScript(defaults: ThemeDefaults) {
  const custom = Object.fromEntries(defaults.custom.map((c) => [c.id, { base: c.base, palette: c.palette }]));
  return `
(function(){
  try {
    var portal = location.pathname.indexOf('/admin') === 0;
    var key = portal ? '${STORAGE_KEYS.portalTheme}' : '${STORAGE_KEYS.theme}';
    var fallback = portal ? ${JSON.stringify(defaults.portal ?? DEFAULT_THEME_ID)} : ${JSON.stringify(defaults.site ?? DEFAULT_THEME_ID)};
    var t = localStorage.getItem(key) || fallback;
    var m = localStorage.getItem('${STORAGE_KEYS.motion}');
    var valid = ${JSON.stringify(THEME_IDS)};
    var custom = ${JSON.stringify(custom)};
    var vars = ${JSON.stringify(PALETTE_VARS)};
    var root = document.documentElement;
    var base = t, own = null;
    if (t.indexOf('${CUSTOM_PREFIX}') === 0) { own = custom[t.slice(${CUSTOM_PREFIX.length})]; base = own ? own.base : fallback; }
    if (valid.indexOf(base) < 0) { base = '${DEFAULT_THEME_ID}'; t = base; own = null; }
    root.setAttribute('data-theme', base);
    root.setAttribute('data-theme-id', t);
    if (own) for (var k in own.palette) if (vars[k]) root.style.setProperty(vars[k], own.palette[k]);
    root.setAttribute('data-motion', (m === 'subtle' || m === 'cinematic' || m === 'balanced') ? m : '${DEFAULT_MOTION}');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME_ID}');
  }
})();
`;
}

/** Palette token -> CSS variable, for the pre-paint script. Kept here to avoid importing the store. */
const PALETTE_VARS: Record<string, string> = {
  accent: "--ax-accent",
  accentSoft: "--ax-accent-soft",
  accentDeep: "--ax-accent-deep",
  violet: "--ax-violet",
  cyan: "--ax-cyan",
  bg: "--ax-bg",
  bgElevated: "--ax-bg-elevated",
  surface: "--ax-surface",
  line: "--ax-line",
  lineStrong: "--ax-line-strong",
  ink: "--ax-ink",
  inkMuted: "--ax-ink-muted",
  inkDim: "--ax-ink-dim",
  success: "--ax-success",
  warning: "--ax-warning",
  danger: "--ax-danger",
};

