/**
 * The metal the laptop is made of.
 *
 * A machine that is dark on a dark page and dark on a white page is a
 * drawing of a machine. A real one is aluminium: it takes the light of the
 * room it is in, its deck is clearly lighter than the black bezel, and its
 * keys are clearly darker than the deck they sit in. Two finishes, chosen by
 * the theme's mode, keep those relationships true on either page.
 */
export interface LaptopFinish {
  /** The shell around the screen. */
  shell: string;
  shellShadow: string;
  hinge: string;
  hingeCap: string;
  /** The top face of the base. */
  deck: string;
  deckSheen: string;
  /** Brushed grain across the deck. */
  grain: string;
  /** The recess the keys sit in. */
  well: string;
  wellShadow: string;
  key: string;
  keyShadow: string;
  /** The power key, top right. */
  keyPower: string;
  trackpad: string;
  trackpadShadow: string;
  /** The edge that faces the viewer, and the side the turn brings into view. */
  front: string;
  frontShadow: string;
  notch: string;
  side: string;
  grille: string;
  /** How hard the machine's shadows fall on the surface it stands on. */
  shadow: { contact: string; cast: string; occlusion: string; mirror: string };
}

export const SPACE_GREY: LaptopFinish = {
  shell:
    "linear-gradient(158deg, #8f99ad 0%, #4c5567 1%, #394254 2%, #262e3d 16%, #141a26 54%, #0a0e16 100%)",
  shellShadow:
    "0 1px 0 rgba(255,255,255,0.24) inset, 0 -2px 3px rgba(0,0,0,0.7) inset, 0 50px 110px -40px rgba(0,0,0,0.9)",
  hinge: "linear-gradient(180deg,#59637a,#2b3341 55%,#141a24)",
  hingeCap: "linear-gradient(180deg,#0e131c,#05070c)",
  deck: "linear-gradient(180deg,#646d7e 0%,#576070 34%,#48505f 68%,#3a4250 100%)",
  deckSheen:
    "linear-gradient(104deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 26%, transparent 52%), linear-gradient(180deg, rgba(0,0,0,0.45), transparent 10%)",
  grain:
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, rgba(0,0,0,0.035) 1px 2.5px)",
  well: "#14181e",
  wellShadow:
    "0 0 0 0.5px rgba(0,0,0,0.8), 0 1px 2.5px rgba(0,0,0,0.65) inset, 0 0.5px 0 rgba(255,255,255,0.16)",
  key: "linear-gradient(180deg,#333a46 0%,#262d38 46%,#1b212a 100%)",
  keyShadow:
    "0 0.5px 0 rgba(255,255,255,0.22) inset, 0 -0.5px 0 rgba(0,0,0,0.7) inset, 0 0.5px 1px rgba(0,0,0,0.6)",
  keyPower: "linear-gradient(180deg,#414a58 0%,#2f3742 50%,#222831 100%)",
  trackpad: "linear-gradient(180deg,#525b6b 0%,#464e5d 60%,#3d4553 100%)",
  trackpadShadow:
    "0 0 0 0.5px rgba(0,0,0,0.5) inset, 0 0.5px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.35) inset",
  front:
    "linear-gradient(100deg, rgba(255,255,255,0.12), transparent 55%), linear-gradient(180deg,#93a0b4 0%,#6b7488 1%,#5c667a 3%,#495265 40%,#232a36 78%,#12171f 100%)",
  frontShadow:
    "0 1px 0 rgba(255,255,255,0.34) inset, 0 -1px 1px rgba(0,0,0,0.75) inset",
  notch: "linear-gradient(180deg,#0d121a,#232a36)",
  side: "linear-gradient(90deg, #12171f 0%, #39414f 55%, #5d6779 100%)",
  grille: "rgba(255,255,255,0.14)",
  shadow: {
    contact: "rgba(0,0,0,0.85)",
    cast: "rgba(0,0,0,0.45)",
    occlusion: "rgba(0,0,0,0.6)",
    mirror:
      "linear-gradient(180deg, rgba(110,122,145,0.34), rgba(60,68,84,0.16) 45%, transparent)",
  },
};

export const SILVER: LaptopFinish = {
  shell:
    "linear-gradient(158deg, #ffffff 0%, #eef1f5 3%, #dbe1e9 18%, #c2cad5 56%, #a4aeba 100%)",
  shellShadow:
    "0 1px 0 rgba(255,255,255,0.95) inset, 0 -2px 3px rgba(31,41,55,0.22) inset, 0 50px 110px -40px rgba(23,32,48,0.55)",
  hinge: "linear-gradient(180deg,#d9dfe7,#b3bcc8 55%,#8a94a2)",
  hingeCap: "linear-gradient(180deg,#8d97a5,#6f7a89)",
  deck: "linear-gradient(180deg,#f2f5f8 0%,#e7ebf1 34%,#d8dee6 68%,#c7cfd9 100%)",
  deckSheen:
    "linear-gradient(104deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.18) 26%, transparent 54%), linear-gradient(180deg, rgba(33,42,58,0.30), transparent 10%)",
  grain:
    "repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 1px, rgba(90,102,120,0.06) 1px 2.5px)",
  well: "#191d24",
  wellShadow:
    "0 0 0 0.5px rgba(30,38,50,0.65), 0 1px 2.5px rgba(0,0,0,0.55) inset, 0 0.5px 0 rgba(255,255,255,0.85)",
  key: "linear-gradient(180deg,#3b424e 0%,#2d343e 46%,#20262e 100%)",
  keyShadow:
    "0 0.5px 0 rgba(255,255,255,0.26) inset, 0 -0.5px 0 rgba(0,0,0,0.6) inset, 0 0.5px 1px rgba(0,0,0,0.55)",
  keyPower: "linear-gradient(180deg,#49515f 0%,#373f4a 50%,#272e37 100%)",
  trackpad: "linear-gradient(180deg,#e4e9f0 0%,#dae0e8 60%,#cdd5df 100%)",
  trackpadShadow:
    "0 0 0 0.5px rgba(70,82,100,0.5) inset, 0 0.5px 0 rgba(255,255,255,0.9), 0 1.5px 2px rgba(40,50,66,0.22) inset",
  front:
    "linear-gradient(100deg, rgba(255,255,255,0.55), transparent 55%), linear-gradient(180deg,#ffffff 0%,#eaeef4 10%,#d5dce5 40%,#b3bcc9 78%,#95a0af 100%)",
  frontShadow:
    "0 1px 0 rgba(255,255,255,0.95) inset, 0 -1px 1px rgba(40,50,66,0.35) inset",
  notch: "linear-gradient(180deg,#8e98a6,#cdd4dd)",
  side: "linear-gradient(90deg, #95a0af 0%, #cbd2dc 55%, #f0f3f7 100%)",
  grille: "rgba(60,72,90,0.22)",
  shadow: {
    contact: "rgba(30,40,58,0.6)",
    cast: "rgba(30,40,58,0.3)",
    occlusion: "rgba(30,40,58,0.38)",
    mirror:
      "linear-gradient(180deg, rgba(150,160,175,0.40), rgba(150,160,175,0.18) 45%, transparent)",
  },
};

export const finishFor = (mode: "dark" | "light") =>
  mode === "light" ? SILVER : SPACE_GREY;
