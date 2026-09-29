"use client";

import { useTheme } from "@/themes/ThemeProvider";
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
import { usePathname } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import {
  CMS_STORAGE_KEY,
  EMPTY_CMS,
  PALETTE_KEYS,
  PALETTE_META,
  loadCms,
  saveCms,
  type Booking,
  type BookingStatus,
  type CmsState,
  type MediaItem,
  type PageKey,
  type PaletteKey,
  type PaletteScope,
  type ProductOverride,
  type BackgroundChoice,
  type Block,
  type BlockSlot,
  type CaseStudyOverride,
  type CustomTheme,
  type Thread,
  type VisitRecord,
} from "@/lib/cms";
import {
  CONTRAST_TARGETS,
  ensureContrast,
  parseColor,
  toHex,
  type GuardedToken,
} from "@/lib/contrast";
import type { LeadStatus, Product } from "@/lib/types";
import { CONTENT_DEFAULTS } from "./contentSchema";

/**
 * Keys that live in the server's settings table. Every edit to one of them
 * is written through, debounced, as a partial update of just that key.
 */
const SYNC_KEYS = [
  "text",
  "backgrounds",
  "palette",
  "portalPalette",
  "products",
  "customProducts",
  "caseStudies",
  "blocks",
  "logoId",
  "heroImageId",
  "remindersEnabled",
  "customThemes",
  "siteTheme",
  "portalTheme",
] as const;
type SyncKey = (typeof SYNC_KEYS)[number];

/** Keys whose unsent edits survive a closed tab, so they are retried next time. */
const PENDING_KEY = "auravex:pending";

function readPending(): SyncKey[] {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return list.filter((k): k is SyncKey => (SYNC_KEYS as readonly string[]).includes(k));
  } catch {
    return [];
  }
}

function writePending(keys: Iterable<SyncKey>) {
  try {
    const list = [...keys];
    if (list.length) window.localStorage.setItem(PENDING_KEY, JSON.stringify(list));
    else window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable */
  }
}

/**
 * The cache holds the public content only. The inbox, bookings and visit
 * log are the portal's, are re-read from the server on every visit, and
 * must not sit in a browser's storage after sign-out.
 */
const cache = (s: CmsState) => saveCms({ ...s, visits: [], threads: [], bookings: [] });

export type Outcome = { ok: true } | { ok: false; reason: string };
export type MailOutcome = { sent: true } | { sent: false; reason: string };

interface CmsContextValue {
  state: CmsState;
  /** True once the cached copy has been read; the site is renderable. */
  ready: boolean;
  /** True once the server's copy has been merged in. */
  synced: boolean;
  /** Whether replies can leave as email, as reported by the server. */
  mailConfigured: boolean;
  /** Set by the last failed settings write, so screens can surface it. */
  error: string | null;
  /** A passing message from the last failed action; clears itself. */
  notice: string | null;
  /** Sends every queued edit now; resolves true once the server has it. */
  flushNow: () => Promise<boolean>;
  setText: (id: string, value: string) => void;
  resetText: (id: string) => void;
  setBackground: (page: PageKey, choice: BackgroundChoice | null) => void;
  setPalette: (scope: PaletteScope, key: PaletteKey, value: string | null) => void;
  resetPalette: (scope: PaletteScope) => void;
  /** Keeps the current colours of a scope as a named theme of the owner's own. */
  saveCustomTheme: (scope: PaletteScope, name: string, base: string, mode: "dark" | "light") => CustomTheme;
  removeCustomTheme: (id: string) => void;
  /** The theme visitors (site) or operators (portal) get before choosing one. */
  setDefaultTheme: (scope: PaletteScope, themeId: string | null) => void;
  addThread: (
    thread: Omit<Thread, "id" | "messages" | "unread" | "status" | "createdAt"> & { body: string },
  ) => Promise<Outcome>;
  replyToThread: (threadId: string, body: string) => Promise<MailOutcome>;
  markThreadRead: (threadId: string, read: boolean) => void;
  setThreadStatus: (threadId: string, status: LeadStatus) => void;
  archiveThread: (threadId: string, archived: boolean) => void;
  deleteThread: (threadId: string) => void;
  addBooking: (
    booking: Omit<Booking, "id" | "status" | "createdAt" | "remindMinutes"> & { remindMinutes?: number },
  ) => Promise<Outcome>;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  setBookingReminder: (id: string, minutes: number) => void;
  deleteBooking: (id: string) => void;
  enableReminders: () => Promise<boolean>;
  setLogo: (mediaId: string | null) => void;
  setHeroImage: (mediaId: string | null) => void;
  addMedia: (item: MediaItem) => void;
  removeMedia: (id: string) => void;
  setProduct: (slug: string, patch: ProductOverride) => void;
  resetProduct: (slug: string) => void;
  upsertCustomProduct: (product: Product) => void;
  removeCustomProduct: (slug: string) => void;
  setCaseStudy: (slug: string, patch: CaseStudyOverride) => void;
  resetCaseStudy: (slug: string) => void;
  addBlock: (page: PageKey, block: Omit<Block, "id"> & { slot: BlockSlot }) => string;
  updateBlock: (page: PageKey, id: string, patch: Partial<Block>) => void;
  removeBlock: (page: PageKey, id: string) => void;
  moveBlock: (page: PageKey, id: string, direction: -1 | 1) => void;
  clearVisits: () => void;
  resetAll: () => void;
  /** Re-reads visits, threads and bookings from the server. */
  refreshAdmin: () => Promise<void>;
}

const CmsContext = createContext<CmsContextValue | null>(null);

/**
 * Applies palette overrides to <html>, and clears the ones that were removed.
 *
 * The site and the portal keep separate palettes, so which one is painted
 * depends on where you are. Switching between them repaints from scratch
 * rather than merging, or a colour set on one would leak into the other.
 */
function paintPalette(palette: Partial<Record<PaletteKey, string>>) {
  const root = document.documentElement;
  PALETTE_KEYS.forEach((key) => {
    const cssVar = PALETTE_META[key].cssVar;
    const value = palette[key];
    if (value) root.style.setProperty(cssVar, value);
    else root.style.removeProperty(cssVar);
  });

  // The glow token is an "r, g, b" triple used inside rgba(), so it has to be
  // derived from the accent rather than set to a hex string.
  const accent = palette.accent;
  if (accent) {
    const rgb = hexToRgb(accent);
    if (rgb) root.style.setProperty("--ax-glow", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  } else {
    root.style.removeProperty("--ax-glow");
  }

  applyContrastGuard();
}

/**
 * Keeps every text token readable against whatever background is in force.
 *
 * Any colour can be chosen for any token, which means a dark heading colour
 * can land on a dark page and vanish. Rather than forbid the choice, this
 * measures the result after the fact and nudges the text tokens just far
 * enough toward white or black to clear the WCAG bar — keeping as much of the
 * chosen hue as the requirement allows.
 *
 * It reads computed values, so it corrects the preset themes too, not only
 * hand-picked overrides.
 */
export function applyContrastGuard() {
  const root = document.documentElement;
  const computed = getComputedStyle(root);

  const background = parseColor(computed.getPropertyValue("--ax-bg"));
  if (!background) return;

  (Object.keys(CONTRAST_TARGETS) as GuardedToken[]).forEach((token) => {
    const cssVar = PALETTE_META[token as PaletteKey]?.cssVar;
    if (!cssVar) return;

    // Read the value as it currently resolves, before this guard touches it.
    root.style.removeProperty(`${cssVar}-guarded`);
    const current = parseColor(computed.getPropertyValue(cssVar));
    if (!current) return;

    const fixed = ensureContrast(current, background, CONTRAST_TARGETS[token]);
    const changed =
      Math.abs(fixed.r - current.r) > 1 ||
      Math.abs(fixed.g - current.g) > 1 ||
      Math.abs(fixed.b - current.b) > 1;

    if (changed) root.style.setProperty(cssVar, toHex(fixed));
  });
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

function deviceClass(width: number): VisitRecord["device"] {
  if (width < 768) return "mobile";
  if (width < 1180) return "tablet";
  return "desktop";
}

/**
 * Which colours to paint: a custom theme's own, when one is chosen for this
 * area (the theme layer records the choice on <html>), otherwise the area's
 * palette overrides.
 */
const paintFor = (s: CmsState) => {
  const chosen = document.documentElement.getAttribute("data-theme-id") ?? "";
  if (chosen.startsWith("custom:")) {
    const own = s.customThemes.find((c) => `custom:${c.id}` === chosen);
    if (own) return paintPalette(own.palette);
  }
  paintPalette(window.location.pathname.startsWith("/admin") ? s.portalPalette : s.palette);
};

/** The content half of the bundle: what `/api/site` returns. */
type SiteBundle = Omit<CmsState, "visits" | "threads" | "bookings">;

export function CmsProvider({ children, initial }: { children: ReactNode; initial?: SiteBundle }) {
  // With the server's bundle in hand from the first render there is nothing
  // to wait for: the HTML already carries the edited site.
  const [state, setState] = useState<CmsState>(() => (initial ? { ...EMPTY_CMS, ...initial } : EMPTY_CMS));
  const [ready, setReady] = useState(Boolean(initial));
  const [synced, setSynced] = useState(Boolean(initial));
  const [mailConfigured, setMailConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every portal mutation, so a poll that started earlier is ignored.
  const mutationSeq = useRef(0);
  const pathname = usePathname();
  const lastLogged = useRef<string | null>(null);
  // Read inside listeners and timers that must not re-subscribe on every state change.
  const stateRef = useRef<CmsState>(state);
  stateRef.current = state;
  const syncedRef = useRef(Boolean(initial));
  const pending = useRef<Set<SyncKey>>(new Set());
  // Bumped per key on every edit, so a save that was in flight when a newer
  // edit arrived cannot mark that newer edit as sent.
  const versions = useRef<Map<SyncKey, number>>(new Map());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inPortal = pathname.startsWith("/admin");
  const onLogin = pathname === "/admin/login";

  /* ---------------- Server sync ---------------- */

  /** Writes every pending key to the server as one partial update. */
  const flush = useCallback(async (): Promise<boolean> => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = null;
    if (!syncedRef.current) return false; // never overwrite the server with a stale cache
    const keys = [...pending.current];
    if (keys.length === 0) return true;
    const sent = new Map(keys.map((key) => [key, versions.current.get(key) ?? 0]));

    const patch: Record<string, unknown> = {};
    for (const key of keys) patch[key] = stateRef.current[key] ?? null;

    try {
      await api("/api/admin/settings", { method: "PUT", body: patch });
      // Only edits that did not change while the request was out are done.
      for (const [key, version] of sent) {
        if ((versions.current.get(key) ?? 0) === version) pending.current.delete(key);
      }
      writePending(pending.current);
      setError(null);
      return pending.current.size === 0 || flush();
    } catch (e) {
      setError(`Not saved to the server: ${errorMessage(e)}`);
      return false;
    }
  }, []);

  const queue = useCallback(
    (keys: readonly SyncKey[]) => {
      keys.forEach((key) => {
        pending.current.add(key);
        versions.current.set(key, (versions.current.get(key) ?? 0) + 1);
      });
      writePending(pending.current);
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(() => void flush(), 400);
    },
    [flush],
  );

  // A closing tab sends whatever is still queued, in one keepalive request.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState !== "hidden") return;
      if (!syncedRef.current || pending.current.size === 0) return;
      const keys = [...pending.current];
      const patch: Record<string, unknown> = {};
      for (const key of keys) patch[key] = stateRef.current[key] ?? null;
      const body = JSON.stringify(patch);
      // keepalive bodies are capped around 64KB; larger edits stay queued for next load.
      if (body.length > 60_000) return;
      pending.current.clear();
      writePending(pending.current);
      fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
        credentials: "same-origin",
        keepalive: true,
      }).catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  /** Shows a passing message for a few seconds. */
  const tell = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 6000);
  }, []);

  /**
   * Single write path: applies in memory, caches in this browser, and queues
   * the touched keys for the server.
   */
  const update = useCallback(
    (fn: (prev: CmsState) => CmsState, keys?: readonly SyncKey[]) => {
      // The ref moves now, not on the next render: a save issued straight after
      // an edit (Publish → flushNow) must send the edit, not the state before it.
      const at = new Date().toISOString();
      const base = stateRef.current;
      const next = { ...fn(base), updatedAt: at };
      stateRef.current = next;
      cache(next);
      // Another update may already be queued for this render; build on it if so.
      setState((prev) => (prev === base ? next : { ...fn(prev), updatedAt: at }));
      if (keys?.length) queue(keys);
    },
    [queue],
  );

  /** Edits queued by a tab that closed before they were sent are picked up here. */
  const resumePending = useCallback(() => {
    const stale = readPending();
    if (stale.length === 0) return;
    const cached = loadCms();
    setState((prev) => {
      const next = { ...prev };
      for (const key of stale) (next as unknown as Record<string, unknown>)[key] = cached[key];
      return next;
    });
    queue(stale);
  }, [queue]);

  // Paint from what is in hand, then confirm against the live server.
  useEffect(() => {
    if (initial) {
      // The HTML already carried the bundle: paint it and refresh the cache.
      const seeded = { ...EMPTY_CMS, ...initial };
      paintFor(seeded);
      cache(seeded);
      resumePending();
    } else {
      const cached = loadCms();
      setState(cached);
      paintFor(cached);
      setReady(true);
    }

    let live = true;
    (async () => {
      for (let attempt = 0; attempt < 3 && live; attempt++) {
        try {
          const bundle = await api<SiteBundle>("/api/site");
          if (!live) return;
          setState((prev) => {
            // Keys the server no longer has must reset, so unset first, then apply.
            const next: CmsState = { ...prev, logoId: undefined, heroImageId: undefined, ...bundle };
            // An edit made before this arrived must not be undone by it.
            for (const key of pending.current) {
              (next as unknown as Record<string, unknown>)[key] = prev[key];
            }
            cache(next);
            return next;
          });
          syncedRef.current = true;
          setSynced(true);
          setError(null);
          resumePending();
          // Anything queued while waiting can go now.
          if (pending.current.size) queue([]);
          return;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        }
      }
      if (live) setError("The server could not be reached. Edits are kept in this browser only.");
    })();

    return () => {
      live = false;
    };
    // `initial` is fixed for the life of the document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, resumePending]);

  // Crossing between the site and the portal swaps the whole palette.
  useEffect(() => {
    if (!ready) return;
    paintFor(state);
  }, [inPortal, ready, state]);

  // The theme layer learns about themes made here, so its pickers can offer them.
  const { registerCustomThemes, registerDefaults } = useTheme();
  useEffect(() => {
    registerCustomThemes(state.customThemes);
  }, [state.customThemes, registerCustomThemes]);
  useEffect(() => {
    if (!synced) return;
    registerDefaults({ site: state.siteTheme, portal: state.portalTheme });
  }, [synced, state.siteTheme, state.portalTheme, registerDefaults]);

  // A preset change comes from ThemeProvider, not from here, so watch the
  // attributes and repaint against the new theme.
  useEffect(() => {
    const target = document.documentElement;
    const observer = new MutationObserver(() => paintFor(stateRef.current));
    observer.observe(target, { attributes: true, attributeFilter: ["data-theme", "data-theme-id"] });
    return () => observer.disconnect();
  }, []);

  // Another tab — or the live preview iframe — following this browser's cache.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== CMS_STORAGE_KEY) return;
      const next = loadCms();
      setState((prev) => {
        const merged: CmsState = { ...next, visits: prev.visits, threads: prev.threads, bookings: prev.bookings };
        // This document's own unsent edits outrank whatever another one cached.
        for (const key of pending.current) {
          (merged as unknown as Record<string, unknown>)[key] = prev[key];
        }
        return merged;
      });
      paintFor(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ---------------- Portal data ---------------- */

  const refreshAdmin = useCallback(async () => {
    const seq = mutationSeq.current;
    const [v, t, b] = await Promise.all([
      api<{ visits: VisitRecord[] }>("/api/admin/visits?days=365"),
      api<{ threads: Thread[]; mail: boolean }>("/api/admin/threads"),
      api<{ bookings: Booking[] }>("/api/admin/bookings"),
    ]);
    // A change was made while this was in flight; the answer is already stale.
    if (seq !== mutationSeq.current) return;
    setMailConfigured(t.mail);
    setState((prev) => ({ ...prev, visits: v.visits, threads: t.threads, bookings: b.bookings }));
  }, []);

  useEffect(() => {
    if (!inPortal || onLogin) return;
    refreshAdmin().catch(() => undefined);
    const timer = setInterval(() => refreshAdmin().catch(() => undefined), 30_000);
    return () => clearInterval(timer);
  }, [inPortal, onLogin, refreshAdmin]);

  /* ---------------- Visit tracking ---------------- */

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (lastLogged.current === pathname) return;
    lastLogged.current = pathname;
    // The portal's live preview is not a visitor.
    if (window.self !== window.top) return;

    let source = "direct";
    try {
      if (document.referrer) {
        const host = new URL(document.referrer).hostname;
        if (host && host !== window.location.hostname) source = host;
      }
    } catch {
      /* malformed referrer — keep "direct" */
    }

    void api("/api/track", {
      body: { path: pathname, source, device: deviceClass(window.innerWidth) },
    }).catch(() => undefined);
  }, [pathname]);

  /** Optimistic write helper for portal records: apply, send, and re-read on failure. */
  const remote = useCallback(
    (apply: (prev: CmsState) => CmsState, send: () => Promise<unknown>) => {
      mutationSeq.current += 1;
      setState((prev) => apply(prev));
      send()
        .then(() => {
          mutationSeq.current += 1;
        })
        .catch((e) => {
          tell(errorMessage(e));
          mutationSeq.current += 1;
          refreshAdmin().catch(() => undefined);
        });
    },
    [refreshAdmin, tell],
  );

  const value = useMemo<CmsContextValue>(
    () => ({
      state,
      ready,
      synced,
      mailConfigured,
      error,
      notice,
      flushNow: flush,
      setText: (id, v) =>
        update((prev) => ({ ...prev, text: { ...prev.text, [id]: v } }), ["text"]),
      resetText: (id) =>
        update((prev) => {
          const text = { ...prev.text };
          delete text[id];
          return { ...prev, text };
        }, ["text"]),
      setBackground: (page, choice) =>
        update((prev) => {
          const backgrounds = { ...prev.backgrounds };
          if (choice) backgrounds[page] = choice;
          else delete backgrounds[page];
          return { ...prev, backgrounds };
        }, ["backgrounds"]),
      setPalette: (scope, key, v) =>
        update(
          (prev) => {
            const field = scope === "portal" ? "portalPalette" : "palette";
            const palette = { ...prev[field] };
            if (v) palette[key] = v;
            else delete palette[key];
            // Only repaint if the edit targets the area currently on screen.
            if ((scope === "portal") === inPortal) paintPalette(palette);
            return { ...prev, [field]: palette };
          },
          [scope === "portal" ? "portalPalette" : "palette"],
        ),
      resetPalette: (scope) =>
        update(
          (prev) => {
            const field = scope === "portal" ? "portalPalette" : "palette";
            if ((scope === "portal") === inPortal) paintPalette({});
            return { ...prev, [field]: {} };
          },
          [scope === "portal" ? "portalPalette" : "palette"],
        ),
      saveCustomTheme: (scope, name, base, mode) => {
        const theme: CustomTheme = {
          id: `t-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          name: name.trim().slice(0, 40) || "My theme",
          mode,
          base,
          palette: { ...(scope === "portal" ? stateRef.current.portalPalette : stateRef.current.palette) },
        };
        update((prev) => ({ ...prev, customThemes: [...prev.customThemes, theme].slice(-24) }), ["customThemes"]);
        return theme;
      },
      removeCustomTheme: (id) =>
        update(
          (prev) => ({
            ...prev,
            customThemes: prev.customThemes.filter((t) => t.id !== id),
            siteTheme: prev.siteTheme === `custom:${id}` ? undefined : prev.siteTheme,
            portalTheme: prev.portalTheme === `custom:${id}` ? undefined : prev.portalTheme,
          }),
          ["customThemes", "siteTheme", "portalTheme"],
        ),
      setDefaultTheme: (scope, themeId) =>
        update(
          (prev) => ({ ...prev, [scope === "portal" ? "portalTheme" : "siteTheme"]: themeId ?? undefined }),
          [scope === "portal" ? "portalTheme" : "siteTheme"],
        ),

      /* ---------------- Messages ---------------- */

      addThread: async ({ body, ...rest }) => {
        try {
          await api("/api/contact", { body: { ...rest, body } });
          return { ok: true };
        } catch (e) {
          return { ok: false, reason: errorMessage(e) };
        }
      },
      replyToThread: async (threadId, body) => {
        const result = await api<{ thread: Thread; mail: MailOutcome }>(
          `/api/admin/threads/${threadId}/reply`,
          { body: { body } },
        );
        setState((prev) => ({
          ...prev,
          threads: prev.threads.map((t) => (t.id === threadId ? result.thread : t)),
        }));
        return result.mail;
      },
      markThreadRead: (threadId, read) =>
        remote(
          (prev) => ({
            ...prev,
            threads: prev.threads.map((t) => (t.id === threadId ? { ...t, unread: !read } : t)),
          }),
          () => api(`/api/admin/threads/${threadId}`, { method: "PATCH", body: { unread: !read } }),
        ),
      setThreadStatus: (threadId, status) =>
        remote(
          (prev) => ({
            ...prev,
            threads: prev.threads.map((t) => (t.id === threadId ? { ...t, status } : t)),
          }),
          () => api(`/api/admin/threads/${threadId}`, { method: "PATCH", body: { status } }),
        ),
      archiveThread: (threadId, archived) =>
        remote(
          (prev) => ({
            ...prev,
            threads: prev.threads.map((t) => (t.id === threadId ? { ...t, archived } : t)),
          }),
          () => api(`/api/admin/threads/${threadId}`, { method: "PATCH", body: { archived } }),
        ),
      deleteThread: (threadId) =>
        remote(
          (prev) => ({ ...prev, threads: prev.threads.filter((t) => t.id !== threadId) }),
          () => api(`/api/admin/threads/${threadId}`, { method: "DELETE" }),
        ),

      /* ---------------- Bookings ---------------- */

      addBooking: async ({ remindMinutes = 30, ...rest }) => {
        try {
          await api("/api/bookings", { body: { ...rest, remindMinutes } });
          return { ok: true };
        } catch (e) {
          return { ok: false, reason: errorMessage(e) };
        }
      },
      setBookingStatus: (id, status) =>
        remote(
          (prev) => ({
            ...prev,
            bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
          }),
          () => api(`/api/admin/bookings/${id}`, { method: "PATCH", body: { status } }),
        ),
      setBookingReminder: (id, minutes) =>
        remote(
          (prev) => ({
            ...prev,
            bookings: prev.bookings.map((b) =>
              // Changing the lead time re-arms a reminder that already fired.
              b.id === id ? { ...b, remindMinutes: minutes, remindedAt: undefined } : b,
            ),
          }),
          () => api(`/api/admin/bookings/${id}`, { method: "PATCH", body: { remindMinutes: minutes } }),
        ),
      deleteBooking: (id) =>
        remote(
          (prev) => ({ ...prev, bookings: prev.bookings.filter((b) => b.id !== id) }),
          () => api(`/api/admin/bookings/${id}`, { method: "DELETE" }),
        ),
      enableReminders: async () => {
        if (typeof Notification === "undefined") return false;
        const permission =
          Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();
        const granted = permission === "granted";
        // Only a grant is recorded: a refusal on one device must not switch
        // reminders off for every other browser that already subscribed.
        if (granted) update((prev) => ({ ...prev, remindersEnabled: true }), ["remindersEnabled"]);
        return granted;
      },

      /* ---------------- Media & images ---------------- */

      setLogo: (mediaId) =>
        update((prev) => ({ ...prev, logoId: mediaId ?? undefined }), ["logoId"]),
      setHeroImage: (mediaId) =>
        update((prev) => ({ ...prev, heroImageId: mediaId ?? undefined }), ["heroImageId"]),
      addMedia: (item) => update((prev) => ({ ...prev, media: [item, ...prev.media] })),
      removeMedia: (id) =>
        remote(
          (prev) => {
            // The server scrubs its own references; mirror that here so nothing renders a gap.
            const next: CmsState = {
              ...prev,
              media: prev.media.filter((m) => m.id !== id),
              logoId: prev.logoId === id ? undefined : prev.logoId,
              heroImageId: prev.heroImageId === id ? undefined : prev.heroImageId,
              backgrounds: Object.fromEntries(
                Object.entries(prev.backgrounds).filter(
                  ([, c]) => !(c && c.kind === "media" && c.mediaId === id),
                ),
              ),
              products: Object.fromEntries(
                Object.entries(prev.products).map(([slug, p]) =>
                  p.imageId === id ? [slug, { ...p, imageId: undefined }] : [slug, p],
                ),
              ),
              blocks: Object.fromEntries(
                Object.entries(prev.blocks).map(([page, list]) => [
                  page,
                  (list ?? []).map((b) => (b.mediaId === id ? { ...b, mediaId: undefined } : b)),
                ]),
              ),
            };
            cache(next);
            return next;
          },
          () => api(`/api/admin/media/${id}`, { method: "DELETE" }),
        ),
      setProduct: (slug, patch) =>
        update(
          (prev) => ({
            ...prev,
            products: { ...prev.products, [slug]: { ...prev.products[slug], ...patch } },
          }),
          ["products"],
        ),
      resetProduct: (slug) =>
        update((prev) => {
          const products = { ...prev.products };
          delete products[slug];
          return { ...prev, products };
        }, ["products"]),
      upsertCustomProduct: (product) =>
        update(
          (prev) => ({
            ...prev,
            customProducts: prev.customProducts.some((p) => p.id === product.id)
              ? prev.customProducts.map((p) => (p.id === product.id ? product : p))
              : [...prev.customProducts, product],
          }),
          ["customProducts"],
        ),
      removeCustomProduct: (slug) =>
        update((prev) => {
          const products = { ...prev.products };
          delete products[slug];
          return { ...prev, products, customProducts: prev.customProducts.filter((p) => p.slug !== slug) };
        }, ["customProducts", "products"]),
      setCaseStudy: (slug, patch) =>
        update(
          (prev) => ({
            ...prev,
            caseStudies: { ...prev.caseStudies, [slug]: { ...prev.caseStudies[slug], ...patch } },
          }),
          ["caseStudies"],
        ),
      resetCaseStudy: (slug) =>
        update((prev) => {
          const caseStudies = { ...prev.caseStudies };
          delete caseStudies[slug];
          return { ...prev, caseStudies };
        }, ["caseStudies"]),

      /* ---------------- Page builder ---------------- */

      addBlock: (page, block) => {
        const id = uid("blk");
        update(
          (prev) => ({
            ...prev,
            blocks: { ...prev.blocks, [page]: [...(prev.blocks[page] ?? []), { ...block, id }] },
          }),
          ["blocks"],
        );
        return id;
      },
      updateBlock: (page, id, patch) =>
        update(
          (prev) => ({
            ...prev,
            blocks: {
              ...prev.blocks,
              [page]: (prev.blocks[page] ?? []).map((b) => (b.id === id ? { ...b, ...patch } : b)),
            },
          }),
          ["blocks"],
        ),
      removeBlock: (page, id) =>
        update(
          (prev) => ({
            ...prev,
            blocks: { ...prev.blocks, [page]: (prev.blocks[page] ?? []).filter((b) => b.id !== id) },
          }),
          ["blocks"],
        ),
      moveBlock: (page, id, direction) =>
        update((prev) => {
          const list = [...(prev.blocks[page] ?? [])];
          const from = list.findIndex((b) => b.id === id);
          if (from === -1) return prev;
          // Only reorder within the same slot; crossing slots is a different edit.
          const slot = list[from].slot;
          const siblings = list.filter((b) => b.slot === slot);
          const at = siblings.findIndex((b) => b.id === id);
          const to = at + direction;
          if (to < 0 || to >= siblings.length) return prev;
          const swapWith = siblings[to];
          const j = list.findIndex((b) => b.id === swapWith.id);
          [list[from], list[j]] = [list[j], list[from]];
          return { ...prev, blocks: { ...prev.blocks, [page]: list } };
        }, ["blocks"]),

      clearVisits: () =>
        remote(
          (prev) => ({ ...prev, visits: [] }),
          () => api("/api/admin/visits", { method: "DELETE" }),
        ),
      resetAll: () => {
        paintPalette({});
        update(
          (prev) => ({
            ...EMPTY_CMS,
            media: prev.media,
            visits: prev.visits,
            threads: prev.threads,
            bookings: prev.bookings,
          }),
          SYNC_KEYS,
        );
      },
      refreshAdmin,
    }),
    [state, ready, synced, mailConfigured, error, notice, flush, inPortal, update, remote, refreshAdmin],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be used inside <CmsProvider>");
  return ctx;
}

/**
 * One editable string. Returns the default until the store has been read, so
 * server and first client render agree and nothing flashes.
 */
export function useText(id: string): string {
  const { state, ready } = useCms();
  const fallback = CONTENT_DEFAULTS[id] ?? "";
  if (!ready) return fallback;
  return state.text[id] ?? fallback;
}

/** The background a page should use, or null to keep its built-in plate. */
export function usePageBackground(page: PageKey): BackgroundChoice | null {
  const { state, ready } = useCms();
  if (!ready) return null;
  return state.backgrounds[page] ?? null;
}

export function useMediaSrc(id: string | undefined): string | null {
  const { state } = useCms();
  if (!id) return null;
  return state.media.find((m) => m.id === id)?.src ?? null;
}
