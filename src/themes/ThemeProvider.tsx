"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CustomTheme } from "@/lib/cms";
import { CUSTOM_PREFIX, type ThemeDefaults } from "./noFlash";
export { CUSTOM_PREFIX, type ThemeDefaults };
import {
  DEFAULT_MOTION,
  DEFAULT_THEME_ID,
  STORAGE_KEYS,
  THEME_IDS,
  getTheme,
  type MotionLevel,
  type ThemeDefinition,
} from "./themes";

/** Which half of the site a page belongs to; each keeps its own theme choice. */
export type ThemeArea = "site" | "portal";

export const areaOf = (pathname: string): ThemeArea => (pathname.startsWith("/admin") ? "portal" : "site");
export const isCustomId = (id: string) => id.startsWith(CUSTOM_PREFIX);

interface ThemeContextValue {
  area: ThemeArea;
  themeId: string;
  theme: ThemeDefinition;
  /** The custom theme in force, when the current id is one. */
  custom: CustomTheme | null;
  customThemes: CustomTheme[];
  motion: MotionLevel;
  effectsEnabled: boolean;
  /** True once the client has adopted persisted preferences. */
  ready: boolean;
  setThemeId: (id: string) => void;
  setMotion: (level: MotionLevel) => void;
  setEffectsEnabled: (enabled: boolean) => void;
  /** The content store tells the theme layer about themes made in the portal. */
  registerCustomThemes: (list: CustomTheme[]) => void;
  /** And about the defaults it read from the live server, in case this page was rendered before they were set. */
  registerDefaults: (defaults: { site?: string; portal?: string }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** A custom theme as the pickers see it: its base preset's shape with its own colours in front. */
export function describeCustom(custom: CustomTheme): ThemeDefinition {
  const base = getTheme(custom.base);
  return {
    id: `${CUSTOM_PREFIX}${custom.id}`,
    name: custom.name,
    mode: custom.mode,
    description: "Your own colours",
    swatch: [custom.palette.bg ?? base.swatch[0], custom.palette.accent ?? base.swatch[1], custom.palette.violet ?? base.swatch[2]],
    scene: base.scene,
  };
}

const storageKey = (area: ThemeArea) => (area === "portal" ? STORAGE_KEYS.portalTheme : STORAGE_KEYS.theme);

export function ThemeProvider({ children, defaults }: { children: ReactNode; defaults?: ThemeDefaults }) {
  const pathname = usePathname() ?? "/";
  const area = areaOf(pathname);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(defaults?.custom ?? []);
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID);
  const [motion, setMotionState] = useState<MotionLevel>(DEFAULT_MOTION);
  const [effectsEnabled, setEffectsState] = useState(true);
  const [ready, setReady] = useState(false);
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const resolve = useCallback(
    (id: string): { id: string; base: string; custom: CustomTheme | null } => {
      if (isCustomId(id)) {
        const found = customThemes.find((c) => `${CUSTOM_PREFIX}${c.id}` === id);
        if (found && THEME_IDS.includes(found.base)) return { id, base: found.base, custom: found };
        return { id: DEFAULT_THEME_ID, base: DEFAULT_THEME_ID, custom: null };
      }
      return THEME_IDS.includes(id) ? { id, base: id, custom: null } : { id: DEFAULT_THEME_ID, base: DEFAULT_THEME_ID, custom: null };
    },
    [customThemes],
  );

  /** Writes the choice to <html>; the content store repaints the colours from there. */
  const apply = useCallback(
    (id: string) => {
      const r = resolve(id);
      const root = document.documentElement;
      root.setAttribute("data-theme", r.base);
      root.setAttribute("data-theme-id", r.id);
      setThemeIdState(r.id);
    },
    [resolve],
  );

  // Adopt this area's stored choice, or the server's default for it, whenever the area changes.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(storageKey(area));
    } catch {
      /* storage unavailable */
    }
    const d = defaultsRef.current;
    apply(stored || (area === "portal" ? d?.portal : d?.site) || DEFAULT_THEME_ID);
    const root = document.documentElement;
    const storedMotion = (root.getAttribute("data-motion") as MotionLevel) ?? DEFAULT_MOTION;
    let storedEffects = true;
    try {
      storedEffects = localStorage.getItem(STORAGE_KEYS.effects) !== "false";
    } catch {
      /* keep effects on */
    }
    setMotionState(storedMotion);
    setEffectsState(storedEffects);
    setReady(true);
  }, [area, apply]);

  const setThemeId = useCallback(
    (id: string) => {
      apply(id);
      try {
        localStorage.setItem(storageKey(area), id);
      } catch {
        /* non-fatal */
      }
    },
    [apply, area],
  );

  const setMotion = useCallback((level: MotionLevel) => {
    setMotionState(level);
    document.documentElement.setAttribute("data-motion", level);
    try {
      localStorage.setItem(STORAGE_KEYS.motion, level);
    } catch {
      /* non-fatal */
    }
  }, []);

  const setEffectsEnabled = useCallback((enabled: boolean) => {
    setEffectsState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.effects, String(enabled));
    } catch {
      /* non-fatal */
    }
  }, []);

  const registerCustomThemes = useCallback((list: CustomTheme[]) => {
    setCustomThemes((prev) => (JSON.stringify(prev) === JSON.stringify(list) ? prev : list));
  }, []);

  /**
   * The live defaults, straight from the store. A page served from the cache
   * may predate them, so whoever has not chosen a theme for this area adopts
   * the current default as soon as it is known.
   */
  const registerDefaults = useCallback(
    (next: { site?: string; portal?: string }) => {
      const previous = defaultsRef.current;
      defaultsRef.current = { site: next.site, portal: next.portal, custom: previous?.custom ?? [] };
      let chosen: string | null = null;
      try {
        chosen = localStorage.getItem(storageKey(area));
      } catch {
        /* storage unavailable */
      }
      if (chosen) return;
      const wanted = (area === "portal" ? next.portal : next.site) ?? DEFAULT_THEME_ID;
      if (wanted !== themeId) apply(wanted);
    },
    [apply, area, themeId],
  );

  // A custom theme that was deleted while in use falls back to its base.
  useEffect(() => {
    if (!ready || !isCustomId(themeId)) return;
    if (!customThemes.some((c) => `${CUSTOM_PREFIX}${c.id}` === themeId)) setThemeId(DEFAULT_THEME_ID);
  }, [customThemes, ready, themeId, setThemeId]);

  const value = useMemo<ThemeContextValue>(() => {
    const r = resolve(themeId);
    return {
      area,
      themeId: r.id,
      theme: r.custom ? describeCustom(r.custom) : getTheme(r.base),
      custom: r.custom,
      customThemes,
      motion,
      effectsEnabled,
      ready,
      setThemeId,
      setMotion,
      setEffectsEnabled,
      registerCustomThemes,
      registerDefaults,
    };
  }, [area, themeId, resolve, customThemes, motion, effectsEnabled, ready, setThemeId, setMotion, setEffectsEnabled, registerCustomThemes, registerDefaults]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/** Numeric multiplier for animation distance/duration, driven by motion level. */
export function useMotionScale() {
  const { motion } = useTheme();
  return motion === "subtle" ? 0.45 : motion === "cinematic" ? 1.55 : 1;
}
