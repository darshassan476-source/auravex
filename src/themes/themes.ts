/**
 * AURAVEX theme registry.
 *
 * Each entry maps to a `[data-theme]` block in `globals.css`. The provider
 * only writes the attribute — all repainting is handled by the CSS token
 * layer, so adding a theme means adding one block here and one in CSS.
 */

export type ThemeMode = "dark" | "light";
export type MotionLevel = "subtle" | "balanced" | "cinematic";

export interface ThemeDefinition {
  id: string;
  name: string;
  mode: ThemeMode;
  description: string;
  /** Swatches used by the theme picker preview chips. */
  swatch: [string, string, string];
  /** Accent ramp used by gradients, glows and chart series. */
  scene: {
    primary: string;
    secondary: string;
    fog: string;
    particle: string;
  };
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "futuristic-enterprise",
    name: "Futuristic Enterprise",
    mode: "dark",
    description: "The AURAVEX signature. Deep navy, electric blue, executive calm.",
    swatch: ["#04070f", "#3b82f6", "#7c6cff"],
    scene: { primary: "#3b82f6", secondary: "#7c6cff", fog: "#04070f", particle: "#60a5fa" },
  },
  {
    id: "cyber-city",
    name: "Cyber City",
    mode: "dark",
    description: "Neon magenta skyline. High-contrast, after-dark energy.",
    swatch: ["#05060f", "#d946ef", "#22d3ee"],
    scene: { primary: "#d946ef", secondary: "#22d3ee", fog: "#05060f", particle: "#f0abfc" },
  },
  {
    id: "space-universe",
    name: "Space Universe",
    mode: "dark",
    description: "Indigo deep-field. Orbital, quiet, infinite.",
    swatch: ["#030512", "#6366f1", "#a855f7"],
    scene: { primary: "#6366f1", secondary: "#a855f7", fog: "#030512", particle: "#a5b4fc" },
  },
  {
    id: "neon-mountains",
    name: "Neon Mountains",
    mode: "dark",
    description: "Teal ridgelines against black. Cold, precise, technical.",
    swatch: ["#04090d", "#2dd4bf", "#38bdf8"],
    scene: { primary: "#2dd4bf", secondary: "#38bdf8", fog: "#04090d", particle: "#5eead4" },
  },
  {
    id: "ai-world",
    name: "AI World",
    mode: "dark",
    description: "Violet neural space. Generative, organic, alive.",
    swatch: ["#070410", "#a855f7", "#e879f9"],
    scene: { primary: "#a855f7", secondary: "#e879f9", fog: "#070410", particle: "#c4b5fd" },
  },
  {
    id: "clean-enterprise",
    name: "Clean Enterprise",
    mode: "light",
    description: "Boardroom daylight. Crisp white with confident blue.",
    swatch: ["#f6f8fd", "#2563eb", "#6d5cf0"],
    scene: { primary: "#2563eb", secondary: "#6d5cf0", fog: "#f6f8fd", particle: "#93c5fd" },
  },
  {
    id: "white-future-city",
    name: "White Future City",
    mode: "light",
    description: "Sunlit glass architecture. Open, optimistic, modern.",
    swatch: ["#f4f7fb", "#0284c7", "#06b6d4"],
    scene: { primary: "#0284c7", secondary: "#06b6d4", fog: "#f4f7fb", particle: "#7dd3fc" },
  },
  {
    id: "crystal-world",
    name: "Crystal World",
    mode: "light",
    description: "Prismatic violet on white. Refined and refractive.",
    swatch: ["#f5f4fd", "#7c5cff", "#c084fc"],
    scene: { primary: "#7c5cff", secondary: "#c084fc", fog: "#f5f4fd", particle: "#c4b5fd" },
  },
  {
    id: "ai-landscape",
    name: "AI Landscape",
    mode: "light",
    description: "Soft teal horizon. Natural intelligence, daylight clarity.",
    swatch: ["#f3faf8", "#0d9488", "#0ea5e9"],
    scene: { primary: "#0d9488", secondary: "#0ea5e9", fog: "#f3faf8", particle: "#5eead4" },
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    mode: "dark",
    description: "Black marble and warm brass. Quiet luxury, boardroom after hours.",
    swatch: ["#0a0805", "#d4a24c", "#c2703f"],
    scene: { primary: "#d4a24c", secondary: "#c2703f", fog: "#0a0805", particle: "#f0c67d" },
  },
  {
    id: "emerald-vault",
    name: "Emerald Vault",
    mode: "dark",
    description: "Deep green glass. Considered, financial, understated.",
    swatch: ["#04100c", "#10b981", "#0ea5e9"],
    scene: { primary: "#10b981", secondary: "#0ea5e9", fog: "#04100c", particle: "#34d399" },
  },
  {
    id: "crimson-atlas",
    name: "Crimson Atlas",
    mode: "dark",
    description: "Charcoal with a signal red. Decisive, editorial, high contrast.",
    swatch: ["#0b0709", "#e11d48", "#f97316"],
    scene: { primary: "#e11d48", secondary: "#f97316", fog: "#0b0709", particle: "#fb7185" },
  },
  {
    id: "arctic-steel",
    name: "Arctic Steel",
    mode: "dark",
    description: "Cold graphite and ice blue. Technical, precise, no warmth.",
    swatch: ["#07090c", "#38bdf8", "#818cf8"],
    scene: { primary: "#38bdf8", secondary: "#818cf8", fog: "#07090c", particle: "#7dd3fc" },
  },
  {
    id: "warm-linen",
    name: "Warm Linen",
    mode: "light",
    description: "Paper and terracotta. Editorial, calm, human.",
    swatch: ["#faf7f2", "#b4532a", "#9a6b3f"],
    scene: { primary: "#b4532a", secondary: "#9a6b3f", fog: "#faf7f2", particle: "#d97757" },
  },
  {
    id: "sage-studio",
    name: "Sage Studio",
    mode: "light",
    description: "Soft green on off-white. Considered and quiet.",
    swatch: ["#f4f7f4", "#3f7d58", "#7c8f4f"],
    scene: { primary: "#3f7d58", secondary: "#7c8f4f", fog: "#f4f7f4", particle: "#5fa37a" },
  },
  {
    id: "porcelain-navy",
    name: "Porcelain Navy",
    mode: "light",
    description: "Crisp white with deep navy. Traditional, trustworthy, corporate.",
    swatch: ["#f7f8fb", "#1e3a8a", "#4c1d95"],
    scene: { primary: "#1e3a8a", secondary: "#4c1d95", fog: "#f7f8fb", particle: "#3b5bb5" },
  },
  {
    id: "blush-quartz",
    name: "Blush Quartz",
    mode: "light",
    description: "Pale rose and plum. Distinctive without shouting.",
    swatch: ["#fbf6f8", "#9d356d", "#7c3aed"],
    scene: { primary: "#9d356d", secondary: "#7c3aed", fog: "#fbf6f8", particle: "#c2568f" },
  },
];

export const DEFAULT_THEME_ID = "futuristic-enterprise";
export const DEFAULT_MOTION: MotionLevel = "balanced";

export const THEME_IDS = THEMES.map((t) => t.id);

export function getTheme(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export const MOTION_LEVELS: { id: MotionLevel; name: string; description: string }[] = [
  { id: "subtle", name: "Subtle", description: "Reduced movement. Maximum focus on content." },
  { id: "balanced", name: "Balanced", description: "The default AURAVEX feel." },
  { id: "cinematic", name: "Cinematic", description: "Full parallax, depth and drift." },
];

export const STORAGE_KEYS = {
  theme: "auravex:theme",
  /** The portal keeps its own choice, so a dark portal never darkens the public site. */
  portalTheme: "auravex:portal-theme",
  motion: "auravex:motion",
  effects: "auravex:effects",
} as const;
