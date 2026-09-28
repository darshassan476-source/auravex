/**
 * Colour maths for the palette guard.
 *
 * The portal lets any colour be chosen for any token. That freedom is only
 * safe if something guarantees the result stays readable — otherwise a dark
 * heading colour on a dark background silently makes copy disappear, which is
 * exactly the failure we are protecting against.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parses hex, rgb() and rgba(). Returns null for anything else. */
export function parseColor(input: string): Rgb | null {
  const value = input.trim();

  const hex = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec(value);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3) digits = digits.split("").map((c) => c + c).join("");
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
    };
  }

  const fn = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value);
  if (fn) {
    return { r: Number(fn[1]), g: Number(fn[2]), b: Number(fn[3]) };
  }

  return null;
}

export function toHex({ r, g, b }: Rgb) {
  const h = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Relative luminance, per WCAG. */
export function luminance({ r, g, b }: Rgb) {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: Rgb, b: Rgb) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mixes `amount` of `towards` into `base`. */
export function mix(base: Rgb, towards: Rgb, amount: number): Rgb {
  return {
    r: base.r + (towards.r - base.r) * amount,
    g: base.g + (towards.g - base.g) * amount,
    b: base.b + (towards.b - base.b) * amount,
  };
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 10, g: 12, b: 18 };

/**
 * Nudges `colour` toward white or black — whichever the background is further
 * from — until it clears `target`, keeping as much of the original hue as the
 * requirement allows.
 */
export function ensureContrast(colour: Rgb, background: Rgb, target: number): Rgb {
  if (contrastRatio(colour, background) >= target) return colour;

  // Push away from the background: light background → darken, and vice versa.
  const towards = luminance(background) > 0.35 ? BLACK : WHITE;

  let lo = 0;
  let hi = 1;
  let best = mix(colour, towards, 1);

  // Twelve passes lands within ~0.02% of the minimum mix that satisfies the
  // requirement, which keeps the most of the chosen hue.
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const candidate = mix(colour, towards, mid);
    if (contrastRatio(candidate, background) >= target) {
      best = candidate;
      hi = mid;
    } else {
      lo = mid;
    }
  }

  // The search runs on floats but the value is written as integer hex, and
  // that rounding can drop the result a hair under the target. Nudge until the
  // rounded colour actually passes.
  for (let i = 0; i < 24; i++) {
    const rounded = parseColor(toHex(best));
    if (!rounded || contrastRatio(rounded, background) >= target) break;
    best = mix(best, towards, 0.04);
  }

  return best;
}

/** WCAG AA thresholds, by the role a token plays. */
export const CONTRAST_TARGETS = {
  /** Headlines are large; 3:1 is the AA bar for large text. */
  ink: 4.5,
  /**
   * Body and caption text also sit on glass panels and chips tinted a step
   * lighter or darker than the page, which costs up to a point of ratio; the
   * headroom keeps them at or above 4.5 there too.
   */
  inkMuted: 5.6,
  inkDim: 5.6,
  /** Links and accent text sit at body size. */
  accent: 3.4,
  accentSoft: 3.4,
  /** Status colours carry small chip text on chips tinted with the same colour. */
  success: 5.2,
  warning: 5.2,
  danger: 5.2,
} as const;

export type GuardedToken = keyof typeof CONTRAST_TARGETS;
