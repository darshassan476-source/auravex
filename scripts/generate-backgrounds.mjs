/**
 * Builds the hero background plates in /public/backgrounds.
 *
 * The references show one continuous luxury interior running the full width of
 * the hero, with the copy sitting on the darker left of that same room. No
 * reference contains a single clean region wide enough to do that — their own
 * interface covers most of each frame — so each plate is assembled as a
 * panorama from several clean, UI-free slabs.
 *
 * How it holds together:
 *   - slabs are placed at their natural aspect and cross-faded over ~200px, so
 *     there is no visible seam and no mirrored repeat;
 *   - every slab is normalised to the same mean luminance before compositing,
 *     which is what makes four separate rooms read as one space;
 *   - they are sharpened, never blurred. Soft focus is the single strongest
 *     tell that a background was machine-made;
 *   - light plates are the same architecture re-exposed for daylight —
 *     shadows lifted with gamma, saturation eased back — rather than the
 *     original photograph hidden behind a white veil.
 *
 *   node scripts/generate-backgrounds.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "backgrounds");
const REF = join(ROOT, "..", "reference-images");
mkdirSync(OUT, { recursive: true });

const W = 2400;
const H = 1440;
/** Cross-fade width between neighbouring slabs, before the run is scaled. */
const OVERLAP = 300;
/** Mean luminance every slab is pulled towards, 0-255. */
const TARGET_LUMA = 46;

const REFS = {
  home: join(REF, "ChatGPT Image Sep 24, 2026, 07_03_11 PM (1).png"),
  solutions: join(REF, "ChatGPT Image Sep 24, 2026, 07_03_11 PM (2).png"),
  product: join(REF, "ChatGPT Image Sep 24, 2026, 07_03_12 PM (3).png"),
  work: join(REF, "ChatGPT Image Sep 24, 2026, 07_03_13 PM (4).png"),
  contact: join(REF, "ChatGPT Image Sep 24, 2026, 07_03_14 PM (5).png"),
};

/**
 * Clean regions — each verified to contain no interface, text or device.
 * Keep these coordinates honest; a few pixels of stray UI is very visible
 * once a slab is enlarged to 960px tall.
 */
const SLAB = {
  /** Curved balcony, blue light ribbons, stepped stone. */
  atrium: { src: REFS.work, crop: { left: 1104, top: 48, width: 281, height: 432 } },
  /** Marble wall with the gold sculpture on its plinth. */
  sculpture: { src: REFS.solutions, crop: { left: 1130, top: 112, width: 185, height: 345 } },
  /** Glazing, planting and warm cove lighting. */
  lobby: { src: REFS.contact, crop: { left: 1440, top: 108, width: 232, height: 620 } },
  /** Glass facade, chrome sphere, blue strip light. */
  facade: { src: REFS.product, crop: { left: 1345, top: 88, width: 327, height: 462 } },
  /** Marble pier with a palm, warm uplight. */
  pier: { src: REFS.solutions, crop: { left: 1478, top: 112, width: 194, height: 340 } },
};

/**
 * Twelve plates from five slabs.
 *
 * Every page gets its own arrangement: with three heroes sharing one image the
 * site looked like the same photograph on a loop, which is exactly what makes
 * a template feel like a template.
 */
const ARRANGEMENTS = [
  ["atrium", "sculpture", "lobby", "facade"],
  ["lobby", "facade", "pier", "atrium"],
  ["pier", "atrium", "facade", "sculpture"],
  ["facade", "lobby", "atrium", "pier"],
  ["sculpture", "pier", "lobby", "facade"],
  ["atrium", "facade", "sculpture", "lobby"],
];

const PLATES = ARRANGEMENTS.flatMap((names, i) => {
  const n = String(i + 1).padStart(2, "0");
  const slabs = names.map((key) => SLAB[key]);
  return [
    { id: `dark-hero-${n}`, mode: "dark", slabs },
    { id: `light-hero-${n}`, mode: "light", slabs },
  ];
});

/** Alpha ramp so a slab dissolves into the one before it. */
function crossfade(width, height, overlap) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
       <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0" stop-color="#fff" stop-opacity="0"/>
         <stop offset="${(overlap / width).toFixed(4)}" stop-color="#fff" stop-opacity="1"/>
       </linearGradient></defs>
       <rect width="100%" height="100%" fill="url(#g)"/>
     </svg>`,
  );
}

/** Fine grain — enough to stop a gradient banding, not enough to read as noise. */
async function grain() {
  const px = Buffer.alloc(W * H * 3);
  let seed = 20260926;
  for (let i = 0; i < px.length; i++) {
    seed = (seed * 16807) % 2147483647;
    px[i] = 126 + (seed % 5);
  }
  return sharp(px, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
}

const noise = await grain();

for (const plate of PLATES) {
  const slabs = plate.slabs;

  // Lay the slabs out at their natural aspect, then scale the whole run so it
  // fills the canvas exactly — no slab is stretched relative to its neighbours.
  const natural = slabs.map((s) =>
    Math.round((s.crop.width / s.crop.height) * H),
  );
  const span =
    natural.reduce((a, b) => a + b, 0) - OVERLAP * (slabs.length - 1);
  const k = W / span;
  const widths = natural.map((w) => Math.round(w * k));
  const overlap = Math.round(OVERLAP * k);

  const layers = [];
  let x = 0;

  for (let i = 0; i < slabs.length; i++) {
    const source = await sharp(slabs[i].src).extract(slabs[i].crop).toBuffer();

    // Normalise exposure before anything else, so the seams do not show up as
    // steps in brightness.
    const stats = await sharp(source).stats();
    const mean =
      (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;
    const gain = Math.max(0.6, Math.min(1.8, TARGET_LUMA / mean));

    let img = sharp(source)
      .resize(widths[i], H, { fit: "cover", position: "center" })
      .linear(gain, 0);

    if (plate.mode === "light") {
      // Re-expose the same room for daylight: lift the shadows hard with
      // gamma, hold the highlights, ease the saturation back a little. The
      // veil that follows is light enough to keep the architecture legible —
      // the point is daylight, not fog.
      // A linear lift, not a gamma curve: gamma multiplies the near-black
      // pixels and turns compression noise into magenta blotches, whereas
      // `linear(a<1, b)` compresses the range upward and scales that noise
      // down on the way.
      // Enough lift to read as daylight, but the architecture has to survive
      // it. Pushed too far and the plate turns into white fog — which is what
      // "the background is barely visible in light mode" means.
      img = img.modulate({ saturation: 0.7 }).linear(0.82, 44);
    }

    img = img.sharpen({ sigma: 1.3, m1: 0.8, m2: 2.6 });

    let buf = await img.png().toBuffer();
    if (i > 0) {
      buf = await sharp(buf)
        .ensureAlpha()
        .composite([{ input: crossfade(widths[i], H, overlap), blend: "dest-in" }])
        .png()
        .toBuffer();
    }

    layers.push({ input: buf, left: x, top: 0 });
    x += widths[i] - overlap;
  }

  const veil =
    plate.mode === "light"
      ? [
          {
            input: Buffer.from(
              `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
                 <rect width="100%" height="100%" fill="#f7f9fd" opacity="0.04"/>
               </svg>`,
            ),
            blend: "over",
          },
        ]
      : [];

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: plate.mode === "light" ? "#eef2f9" : "#05070f",
    },
  })
    .composite([...layers, ...veil, { input: noise, blend: "overlay" }])
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(join(OUT, `${plate.id}.jpg`));

  console.log("wrote", plate.id, widths.join("+"), `overlap ${overlap}`);
}
