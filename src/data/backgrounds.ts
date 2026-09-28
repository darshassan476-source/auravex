/**
 * Hero background registry.
 *
 * Every environment image the site can sit on is declared here, so a page
 * references a background by id and never by file path. Replacing the artwork
 * means dropping a new file into /public/backgrounds under the same name —
 * no component changes, no imports to update.
 *
 * Twelve plates, six arrangements in two exposures. Each page is given a
 * different one by default: repeating a single photograph across the site is
 * the fastest way to make it look like a template.
 *
 * Plates are regenerated with `node scripts/generate-backgrounds.mjs`.
 */

const ARRANGEMENTS = [
  { n: "01", label: "Atrium, sculpture, lobby, facade" },
  { n: "02", label: "Lobby, facade, marble pier, atrium" },
  { n: "03", label: "Marble pier, atrium, facade, sculpture" },
  { n: "04", label: "Facade, lobby, atrium, marble pier" },
  { n: "05", label: "Sculpture, marble pier, lobby, facade" },
  { n: "06", label: "Atrium, facade, sculpture, lobby" },
] as const;

export type BackgroundId =
  | `dark-hero-${(typeof ARRANGEMENTS)[number]["n"]}`
  | `light-hero-${(typeof ARRANGEMENTS)[number]["n"]}`;

export interface HeroBackground {
  id: BackgroundId;
  label: string;
  /** Which theme family this plate belongs to. */
  mode: "dark" | "light";
  src: string;
  /** object-position for the plate, so the light pools land where intended. */
  position: string;
  /** Average colour — paints behind the image while it decodes. */
  tint: string;
  /** Shown when a light theme is active and this plate is a dark one. */
  counterpart: BackgroundId;
}

function build(): Record<BackgroundId, HeroBackground> {
  const out = {} as Record<BackgroundId, HeroBackground>;

  for (const { n, label } of ARRANGEMENTS) {
    const dark = `dark-hero-${n}` as BackgroundId;
    const light = `light-hero-${n}` as BackgroundId;

    out[dark] = {
      id: dark,
      label: `Dark — ${label.toLowerCase()}`,
      mode: "dark",
      src: `/backgrounds/${dark}.jpg`,
      position: "50% 50%",
      tint: "#2b2833",
      counterpart: light,
    };

    out[light] = {
      id: light,
      label: `Light — ${label.toLowerCase()}`,
      mode: "light",
      src: `/backgrounds/${light}.jpg`,
      position: "50% 50%",
      tint: "#a9a7ac",
      counterpart: dark,
    };
  }

  return out;
}

export const HERO_BACKGROUNDS = build();

export const BACKGROUND_IDS = Object.keys(HERO_BACKGROUNDS) as BackgroundId[];

export const DEFAULT_BACKGROUND: Record<"dark" | "light", BackgroundId> = {
  dark: "dark-hero-01",
  light: "light-hero-01",
};

/**
 * Picks the plate to render: the requested one when it suits the active theme,
 * otherwise its counterpart, so a light theme never loads a dark interior.
 */
export function resolveBackground(
  requested: BackgroundId | undefined,
  mode: "dark" | "light",
): HeroBackground {
  const wanted = requested ? HERO_BACKGROUNDS[requested] : undefined;
  if (!wanted) return HERO_BACKGROUNDS[DEFAULT_BACKGROUND[mode]];
  if (wanted.mode === mode) return wanted;

  const swap = HERO_BACKGROUNDS[wanted.counterpart];
  return swap?.mode === mode ? swap : HERO_BACKGROUNDS[DEFAULT_BACKGROUND[mode]];
}
