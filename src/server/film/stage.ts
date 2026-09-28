import "server-only";

/**
 * The set the film is shot on.
 *
 * A single HTML page: a photographed room, a machined laptop in the middle of
 * it showing the product's real screens, captions in the site's typography,
 * and a camera that pushes in, drifts and racks focus between the room and
 * the screen. Nothing is timed by the clock — `__setFrame(i)` puts every
 * element exactly where frame `i` needs it, so the renderer can take frames
 * as fast or as slowly as it likes and the film is identical every time.
 */

export interface Shot {
  kind: "title" | "screen" | "clip" | "outro";
  seconds: number;
  caption?: string;
  sub?: string;
  /** file:// URL of a still, for `screen`. */
  image?: string;
  /** file:// URLs, one per output frame, for `clip`. */
  frames?: string[];
}

export type StageStyle = "showroom" | "studio" | "recording";

export interface StageManifest {
  width: number;
  height: number;
  fps: number;
  /** showroom: photographed room and laptop; studio: lit dark set, laptop large; recording: the screens full frame. */
  style?: StageStyle;
  product: { name: string; tagline: string; accent: string };
  brand: string;
  tagline: string;
  /** file:// URL of the room photograph. */
  plate: string;
  /** The same photograph pre-blurred, so focus can be pulled by crossfade rather than a live filter. */
  plateBlur?: string;
  /** file:// URLs of the site's font files, if present. */
  fonts: string[];
  shots: Shot[];
}

export function totalSeconds(shots: Shot[]) {
  return shots.reduce((a, s) => a + s.seconds, 0);
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const KEY_ROWS = [
  [1.45, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.55],
  [1.55, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1.85, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7],
  [2.35, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.35],
  [1, 1, 1, 1.25, 5.2, 1.25, 1, 1, 1, 1],
];

export function buildStageHtml(m: StageManifest): string {
  const fontFaces = m.fonts
    .map(
      (url) =>
        `@font-face{font-family:"AXInter";src:url("${url}") format("woff2");font-weight:100 900;font-display:block;}`,
    )
    .join("\n");

  const shotMarkup = m.shots
    .map((shot, i) => {
      if (shot.kind === "screen" && shot.image) {
        return `<div class="content" data-shot="${i}"><img class="still" src="${shot.image}" alt=""></div>`;
      }
      if (shot.kind === "clip" && shot.frames?.length) {
        const unique = [...new Set(shot.frames)];
        const index = shot.frames.map((f) => unique.indexOf(f));
        return `<div class="content" data-shot="${i}" data-index='${JSON.stringify(index)}'>${unique
          .map(
            (f, k) => `<img class="clipframe" data-k="${k}" src="${f}" alt="">`,
          )
          .join("")}</div>`;
      }
      return "";
    })
    .join("\n");

  const captions = m.shots
    .map(
      (shot, i) =>
        `<div class="caption" data-shot="${i}"><span class="eyebrow">${esc(m.product.name)}</span><span class="title">${esc(shot.caption ?? "")}</span><span class="sub">${esc(shot.sub ?? "")}</span></div>`,
    )
    .join("\n");

  // The keyboard, row by row, in units of one key; legends would only read as noise.
  const keyboard = KEY_ROWS.map(
    (row, r) =>
      `<div class="row${r === 0 ? " fn" : ""}">${row
        .map(
          (w, k) =>
            `<span class="key${r === 0 && k === row.length - 1 ? " power" : ""}" style="flex:${w} ${w} 0%"></span>`,
        )
        .join("")}</div>`,
  ).join("");

  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
${fontFaces}
:root{--accent:${m.product.accent};--w:${m.width}px;--h:${m.height}px}
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#04070f;font-family:"AXInter","Inter","Segoe UI",system-ui,sans-serif;color:#f2f6ff}
.stage{position:relative;width:1920px;height:1080px;overflow:hidden;isolation:isolate}
.room,.roomblur{position:absolute;inset:-6%;background:url("${m.plate}") center/cover no-repeat;transform-origin:50% 50%;will-change:transform,opacity}
.roomblur{background-image:url("${m.plateBlur ?? m.plate}");opacity:0}
.dim{position:absolute;inset:0;background:#04070f;opacity:.1;will-change:opacity}
.wash{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,7,15,.18),rgba(4,7,15,.55) 70%,rgba(4,7,15,.78));}
.tint{position:absolute;inset:0;background:radial-gradient(60% 70% at 50% 60%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 70%);opacity:.5}
.vignette{position:absolute;inset:0;box-shadow:inset 0 0 260px 80px rgba(0,0,0,.72);pointer-events:none}
.backdrop{display:none;position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 42%,color-mix(in srgb,var(--accent) 26%,#0b1220),#04070f 78%)}
.stage[data-style="studio"] .room,.stage[data-style="studio"] .roomblur,.stage[data-style="studio"] .dim{display:none}
.stage[data-style="studio"] .backdrop{display:block}
.stage[data-style="studio"] .laptop{width:1060px}
.stage[data-style="studio"] .glow{opacity:1}
.stage[data-style="recording"] .room,.stage[data-style="recording"] .roomblur,.stage[data-style="recording"] .dim,.stage[data-style="recording"] .tint,.stage[data-style="recording"] .glow,.stage[data-style="recording"] .hinge,.stage[data-style="recording"] .base,.stage[data-style="recording"] .floor,.stage[data-style="recording"] .cam,.stage[data-style="recording"] .chamfer,.stage[data-style="recording"] .edge,.stage[data-style="recording"] .sheen{display:none}
.stage[data-style="recording"] .backdrop{display:block;background:linear-gradient(160deg,#0d1424 0%,#04070f 70%)}
.stage[data-style="recording"] .laptop{width:1640px;top:50%}
.stage[data-style="recording"] .lid{padding:0;background:none;box-shadow:0 70px 160px -50px rgba(0,0,0,.95),0 0 0 1px rgba(255,255,255,.08)}
.stage[data-style="recording"] .screen{border-radius:16px}
.stage[data-style="recording"] .caption{left:88px;bottom:64px;padding:16px 22px 18px;border-radius:14px;background:rgba(4,7,15,.72);box-shadow:0 20px 60px -20px rgba(0,0,0,.8);max-width:720px}
.stage[data-style="recording"] .title{font-size:40px}
.stage[data-style="recording"] .sub{font-size:19px}
.grain{position:absolute;inset:-20%;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.16 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");opacity:.32;pointer-events:none;will-change:transform}
.laptop{position:absolute;left:50%;top:47%;width:960px;transform-origin:50% 55%;perspective:3000px;perspective-origin:50% 40%;will-change:transform,opacity}
.rig{position:relative;transform-origin:50% 55%;transform-style:preserve-3d;will-change:transform}
.glow{position:absolute;left:-16%;right:-16%;top:-14%;bottom:4%;border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,color-mix(in srgb,var(--accent) 34%,transparent),color-mix(in srgb,var(--accent) 12%,transparent) 45%,transparent 72%);opacity:.8}
.lid{position:relative;border-radius:22px;padding:12px;background:linear-gradient(158deg,#3a4355 0%,#222a38 18%,#10151f 52%,#0a0e16 100%);box-shadow:0 2px 1px rgba(255,255,255,.10) inset,0 -1px 2px rgba(0,0,0,.6) inset,0 70px 150px -50px rgba(0,0,0,.95)}
.edge{position:absolute;inset:0;border-radius:22px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
.chamfer{position:absolute;left:28px;right:28px;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent)}
.cam{position:absolute;left:50%;top:4px;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:rgba(0,0,0,.85);box-shadow:0 0 0 .5px rgba(255,255,255,.22)}
.screen{position:relative;overflow:hidden;border-radius:13px;background:#0b1220;aspect-ratio:16/10;box-shadow:0 0 0 1px rgba(0,0,0,.65),0 10px 30px -12px rgba(0,0,0,.8) inset}
.content{position:absolute;inset:0;opacity:0;transform-origin:50% 0;will-change:opacity,transform}
.content img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;display:none}
.content img.on{display:block}
.glass{position:absolute;inset:0;background:linear-gradient(122deg,rgba(255,255,255,.11) 0%,transparent 36%,transparent 64%,rgba(255,255,255,.05) 100%);pointer-events:none}
.sheen{position:absolute;inset:-40% -60%;background:linear-gradient(112deg,transparent 42%,rgba(255,255,255,.09) 50%,transparent 58%);pointer-events:none}
.inner{position:absolute;inset:0;box-shadow:inset 0 0 30px rgba(0,0,0,.28);pointer-events:none}
.hinge{margin:0 auto;height:7px;width:94%;border-radius:0 0 3px 3px;background:linear-gradient(180deg,#59637a,#2b3341 55%,#141a24);box-shadow:0 1px 0 rgba(255,255,255,.12) inset}
.base{position:relative;aspect-ratio:100/23;transform-style:preserve-3d}
.frame{position:absolute;left:0;right:0;top:0;aspect-ratio:100/42;transform-origin:50% 0;transform:rotateX(70deg);transform-style:preserve-3d}
.floor{position:absolute;inset:0;transform:translateZ(-16px)}
.floor span,.deck>span,.front>span{position:absolute;display:block}
.ao{left:-2.5%;right:-2.5%;top:-3%;bottom:-3%;border-radius:10px;background:rgba(0,0,0,.6);filter:blur(12px)}
.contact{left:1%;right:1%;top:96%;height:8%;border-radius:50%;background:rgba(0,0,0,.85);filter:blur(5px)}
.cast{left:-7%;right:-7%;top:92%;height:36%;border-radius:50%;background:rgba(0,0,0,.45);filter:blur(40px)}
.mirror{left:.5%;right:.5%;top:100%;height:14%;filter:blur(1px);background:linear-gradient(180deg,rgba(88,99,122,.34),rgba(52,60,76,.16) 45%,transparent)}
.spill{left:14%;right:14%;top:98%;height:80%;border-radius:50%;opacity:.5;filter:blur(24px);background:radial-gradient(50% 100% at 50% 0%,color-mix(in srgb,var(--accent) 50%,transparent),transparent 76%)}
.deck{position:absolute;left:0;right:0;top:0;height:40%;transform-origin:50% 0;transform:scaleY(2.5);border-radius:0 0 12px 12px/0 0 4px 4px;background:linear-gradient(180deg,#646d7e 0%,#576070 34%,#48505f 68%,#3a4250 100%)}
.grain2{inset:0;border-radius:inherit;opacity:.6;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.045) 0 1px,rgba(0,0,0,.035) 1px 2.5px)}
.light{inset:0;border-radius:inherit;background:linear-gradient(104deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.03) 26%,transparent 52%),linear-gradient(180deg,rgba(0,0,0,.45),transparent 10%)}
.glowdeck{left:0;right:0;top:0;height:42%;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 18%,transparent),transparent 92%)}
.grille{width:5%;top:9%;height:52%;opacity:.8;background-image:radial-gradient(circle,rgba(255,255,255,.14) .55px,transparent .9px);background-size:3.6px 1.7px}
.grille.l{left:3.2%}.grille.r{right:3.2%}
.well{position:absolute;left:9.5%;right:9.5%;top:8%;height:54%;border-radius:4px/1.6px;background:#14181e;box-shadow:0 0 0 .5px rgba(0,0,0,.8),0 1px 2.5px rgba(0,0,0,.65) inset,0 .5px 0 rgba(255,255,255,.16)}
.keys{position:absolute;inset:4.5% 1.6%;display:flex;flex-direction:column;gap:5.5% 0}
.row{display:flex;min-height:0;flex:1 1 0%;gap:0 .95%}
.row.fn{flex:.62 .62 0%}
.key{min-width:0;border-radius:2.5px/1.1px;background:linear-gradient(180deg,#333a46 0%,#262d38 46%,#1b212a 100%);box-shadow:0 .5px 0 rgba(255,255,255,.22) inset,0 -.5px 0 rgba(0,0,0,.7) inset,0 .5px 1px rgba(0,0,0,.6)}
.key.power{background:linear-gradient(180deg,#414a58 0%,#2f3742 50%,#222831 100%)}
.pad{left:30%;right:30%;top:68%;height:27%;border-radius:5px/2px;background:linear-gradient(180deg,#525b6b 0%,#464e5d 60%,#3d4553 100%);box-shadow:0 0 0 .5px rgba(0,0,0,.5) inset,0 .5px 0 rgba(255,255,255,.18),0 1px 2px rgba(0,0,0,.35) inset}
.front{position:absolute;left:0;right:0;top:100%;height:16px;transform-origin:50% 0;transform:rotateX(-90deg);border-radius:0 0 7px 7px;background:linear-gradient(100deg,rgba(255,255,255,.12),transparent 55%),linear-gradient(180deg,#93a0b4 0%,#6b7488 1%,#5c667a 3%,#495265 40%,#232a36 78%,#12171f 100%);box-shadow:0 1px 0 rgba(255,255,255,.34) inset,0 -1px 1px rgba(0,0,0,.75) inset}
.notch{left:50%;top:0;width:12%;height:38%;transform:translateX(-50%);border-radius:0 0 5px 5px;background:linear-gradient(180deg,#0a0e15,#1a2130)}
.side{position:absolute;top:0;height:100%;width:16px;background:linear-gradient(90deg,#12171f 0%,#39414f 55%,#5d6779 100%)}
.side.r{right:0;transform-origin:100% 50%;transform:rotateY(-90deg);border-radius:0 0 0 7px}
.side.l{left:0;transform-origin:0 50%;transform:rotateY(90deg);background:linear-gradient(270deg,#12171f 0%,#39414f 55%,#5d6779 100%);border-radius:0 0 7px 0}
.caption{position:absolute;left:112px;bottom:78px;display:flex;flex-direction:column;gap:10px;opacity:0;will-change:opacity,transform;max-width:820px;text-shadow:0 2px 24px rgba(0,0,0,.6)}
.eyebrow{font-size:15px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;color:color-mix(in srgb,var(--accent) 70%,white)}
.eyebrow::before{content:"";display:inline-block;width:28px;height:1px;background:currentColor;margin-right:12px;vertical-align:middle;opacity:.7}
.title{font-size:50px;font-weight:600;letter-spacing:-.02em;line-height:1.05}
.sub{font-size:21px;color:rgba(242,246,255,.74);line-height:1.4}
.card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;text-align:center;opacity:0;will-change:opacity,transform}
.card .name{font-size:112px;font-weight:600;letter-spacing:-.03em;line-height:1;text-shadow:0 8px 60px rgba(0,0,0,.6)}
.card .line{width:72px;height:2px;background:var(--accent);border-radius:2px}
.card .tag{font-size:30px;color:rgba(242,246,255,.8);max-width:900px;line-height:1.35}
.card .brand{font-size:26px;letter-spacing:.4em;text-transform:uppercase;font-weight:600}
.card .cta{font-size:34px;font-weight:600;letter-spacing:-.01em}
.card .url{font-size:22px;color:rgba(242,246,255,.7);letter-spacing:.12em}
</style></head>
<body><div class="stage" data-style="${m.style ?? "showroom"}">
  <div class="room" id="room"></div>
  <div class="roomblur" id="roomblur"></div>
  <div class="dim" id="dim"></div>
  <div class="backdrop"></div>
  <div class="wash"></div><div class="tint"></div>
  <div class="laptop" id="laptop"><div class="rig" id="rig">
    <div class="glow"></div>
    <div class="lid"><div class="edge"></div><div class="chamfer"></div><div class="cam"></div>
      <div class="screen">
        ${shotMarkup}
        <div class="glass"></div><div class="sheen" id="sheen"></div><div class="inner"></div>
      </div>
    </div>
    <div class="hinge"></div>
    <div class="base"><div class="frame">
      <div class="floor"><span class="ao"></span><span class="contact"></span><span class="cast"></span><span class="mirror"></span><span class="spill"></span></div>
      <div class="deck"><span class="grain2"></span><span class="light"></span><span class="glowdeck"></span><span class="grille l"></span><span class="grille r"></span><div class="well"><div class="keys">${keyboard}</div></div><span class="pad"></span></div>
      <div class="front"><span class="notch"></span></div>
      <div class="side r"></div><div class="side l"></div>
    </div></div>
  </div></div>
  ${captions}
  <div class="card" id="titlecard"><div class="brand">${esc(m.brand)}</div><div class="name">${esc(m.product.name)}</div><div class="line"></div><div class="tag">${esc(m.product.tagline)}</div></div>
  <div class="card" id="outro"><div class="brand">${esc(m.brand)}</div><div class="cta">${esc(m.shots.find((s) => s.kind === "outro")?.caption ?? "Book a walkthrough")}</div><div class="line"></div><div class="url">${esc(m.shots.find((s) => s.kind === "outro")?.sub ?? m.tagline)}</div></div>
  <div class="vignette"></div><div class="grain" id="grain"></div>
</div>
<script>
(() => {
  const SHOTS = ${JSON.stringify(m.shots.map((s) => ({ kind: s.kind, seconds: s.seconds })))};
  const FPS = ${m.fps};
  const STYLE = ${JSON.stringify(m.style ?? "showroom")};
  const starts = []; let acc = 0;
  for (const s of SHOTS) { starts.push(acc); acc += s.seconds; }
  const TOTAL = acc;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const ease = (u) => { u = clamp(u, 0, 1); return 1 - Math.pow(1 - u, 3); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const rand = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

  const room = document.getElementById('room');
  const roomblur = document.getElementById('roomblur');
  const dim = document.getElementById('dim');
  const laptop = document.getElementById('laptop');
  const rig = document.getElementById('rig');
  const sheen = document.getElementById('sheen');
  const grain = document.getElementById('grain');
  const titlecard = document.getElementById('titlecard');
  const outro = document.getElementById('outro');
  const contents = [...document.querySelectorAll('.content')].map((el) => ({ el, shot: +el.dataset.shot, index: el.dataset.index ? JSON.parse(el.dataset.index) : null, imgs: [...el.querySelectorAll('img')] }));
  const captions = [...document.querySelectorAll('.caption')].map((el) => ({ el, shot: +el.dataset.shot }));

  // The camera for each shot: alternating pushes and drifts, never the same twice in a row.
  const camera = SHOTS.map((s, i) => {
    if (s.kind === 'title' || s.kind === 'outro') return { s0: .92, s1: .96, x0: 0, x1: 0, y0: 30, y1: 30, ry0: -4, ry1: -4, rx0: 2, rx1: 2 };
    const k = i % 4;
    if (k === 0) return { s0: .95, s1: 1.03, x0: -30, x1: 10, y0: 0, y1: -6, ry0: -7, ry1: -3, rx0: 3, rx1: 2 };
    if (k === 1) return { s0: 1.02, s1: .97, x0: 24, x1: -12, y0: -4, y1: 4, ry0: 6, ry1: 2, rx0: 2, rx1: 3 };
    if (k === 2) return { s0: .98, s1: 1.05, x0: 0, x1: 0, y0: 8, y1: -10, ry0: -2, ry1: 1, rx0: 4, rx1: 2 };
    return { s0: 1.04, s1: .99, x0: -18, x1: 18, y0: -6, y1: 2, ry0: 4, ry1: -4, rx0: 2, rx1: 3 };
  });

  function blurTarget(kind) { return kind === 'title' || kind === 'outro' ? 0 : 9; }
  function fadeWindow(local, len, inDur, outDur) {
    return Math.min(smooth(local / inDur), smooth((len - local) / outDur));
  }

  window.__total = TOTAL;
  window.__setFrame = (frame) => {
    const t = clamp(frame / FPS, 0, TOTAL - 1 / FPS);
    let i = SHOTS.length - 1;
    for (let k = 0; k < SHOTS.length; k++) if (t < starts[k] + SHOTS[k].seconds) { i = k; break; }
    const shot = SHOTS[i]; const local = t - starts[i]; const u = local / shot.seconds;

    // Room: a slow, continuous push over the whole film, focus pulled between shots.
    const roomScale = lerp(1.06, 1.14, t / TOTAL);
    const roomX = Math.sin(t / TOTAL * Math.PI) * 26;
    const roomTransform = 'translate(' + roomX.toFixed(2) + 'px, ' + (-(t / TOTAL) * 18).toFixed(2) + 'px) scale(' + roomScale.toFixed(4) + ')';
    room.style.transform = roomTransform;
    roomblur.style.transform = roomTransform;
    let blur = blurTarget(shot.kind);
    const prev = i > 0 ? blurTarget(SHOTS[i - 1].kind) : blur;
    const next = i < SHOTS.length - 1 ? blurTarget(SHOTS[i + 1].kind) : blur;
    if (local < .8) blur = lerp(prev, blur, smooth(local / .8));
    else if (shot.seconds - local < .8) blur = lerp(blur, next, smooth(1 - (shot.seconds - local) / .8));
    // Focus is pulled by crossfading a pre-blurred copy of the room: opacity is cheap, a live blur is not.
    roomblur.style.opacity = (blur / 9).toFixed(3);
    dim.style.opacity = lerp(.08, .3, blur / 9).toFixed(3);

    // Laptop: present during screens and clips, entering from below and leaving into the outro.
    const onScreen = shot.kind === 'screen' || shot.kind === 'clip';
    let lapOpacity = 0, lapRise = 40;
    if (onScreen) {
      const firstScreen = SHOTS.findIndex((s) => s.kind === 'screen' || s.kind === 'clip');
      const lastScreen = SHOTS.length - 1 - [...SHOTS].reverse().findIndex((s) => s.kind === 'screen' || s.kind === 'clip');
      const inU = i === firstScreen ? ease(local / .9) : 1;
      const outU = i === lastScreen ? ease((shot.seconds - local) / .7) : 1;
      lapOpacity = Math.min(inU, outU); lapRise = (1 - inU) * 40;
    } else if (shot.kind === 'outro' && local < .5) {
      lapOpacity = 1 - smooth(local / .5); lapRise = smooth(local / .5) * 30;
    }
    const c = camera[i]; const cu = smooth(u);
    // A recording is shot flat and close; the other styles lean the laptop into the light.
    const flat = STYLE === 'recording';
    const scale = flat ? lerp(1.0 + (c.s0 - 1) * .5, 1.0 + (c.s1 - 1) * .5, cu) : lerp(c.s0, c.s1, cu);
    const x = lerp(c.x0, c.x1, cu) * (flat ? .5 : 1), y = lerp(c.y0, c.y1, cu) * (flat ? .5 : 1) + lapRise;
    const ry = flat ? 0 : lerp(c.ry0, c.ry1, cu) - 6, rx = flat ? 0 : lerp(c.rx0, c.rx1, cu);
    laptop.style.opacity = lapOpacity.toFixed(3);
    laptop.style.transform = 'translate(calc(-50% + ' + x.toFixed(1) + 'px), calc(-55% + ' + y.toFixed(1) + 'px)) scale(' + scale.toFixed(4) + ')';
    rig.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)';

    // Screen contents: each shot's still or clip, crossfading at the cut, with a slow inner drift.
    for (const cnt of contents) {
      const s = SHOTS[cnt.shot]; const st = starts[cnt.shot];
      const loc = t - st; let op = 0;
      if (loc >= -.5 && loc <= s.seconds + .5) op = fadeWindow(loc + .5, s.seconds + 1, .55, .55);
      if (cnt.shot === i) op = Math.max(op, fadeWindow(local, s.seconds, .55, .55));
      cnt.el.style.opacity = op.toFixed(3);
      if (op > 0) {
        const lu = clamp(loc / s.seconds, 0, 1);
        // A recording pushes further into the screen, alternating direction shot by shot.
        const push = STYLE === 'recording' ? 1.07 : 1.03;
        const zoom = lerp(1.0, push, smooth(lu)); const drift = lerp(0, STYLE === 'recording' ? (cnt.shot % 2 ? -14 : 6) : -6, smooth(lu));
        cnt.el.style.transform = 'scale(' + zoom.toFixed(4) + ') translateY(' + drift.toFixed(1) + 'px)';
        if (cnt.index) {
          const k = clamp(Math.floor(lu * cnt.index.length), 0, cnt.index.length - 1);
          const which = cnt.index[k];
          cnt.imgs.forEach((im, idx) => im.classList.toggle('on', idx === which));
        } else cnt.imgs.forEach((im) => im.classList.add('on'));
      }
    }

    // Captions: rise in, hold, fall out.
    for (const cap of captions) {
      const s = SHOTS[cap.shot]; const loc = t - starts[cap.shot];
      const show = (s.kind === 'screen' || s.kind === 'clip') && loc >= .35 && loc <= s.seconds - .2;
      const op = show ? fadeWindow(loc - .35, s.seconds - .55, .6, .4) : 0;
      cap.el.style.opacity = op.toFixed(3);
      cap.el.style.transform = 'translateY(' + ((1 - op) * 18).toFixed(1) + 'px)';
    }

    // Cards.
    const tcOp = shot.kind === 'title' ? fadeWindow(local, shot.seconds, .9, .7) : 0;
    titlecard.style.opacity = tcOp.toFixed(3);
    titlecard.style.transform = 'scale(' + lerp(.97, 1.01, shot.kind === 'title' ? u : 0).toFixed(4) + ')';
    const outOp = shot.kind === 'outro' ? fadeWindow(local, shot.seconds, .9, .6) : 0;
    outro.style.opacity = outOp.toFixed(3);
    outro.style.transform = 'scale(' + lerp(.98, 1.0, shot.kind === 'outro' ? u : 0).toFixed(4) + ')';

    // Light and grain.
    sheen.style.transform = 'translateX(' + lerp(-55, 55, smooth(u)).toFixed(1) + '%) rotate(0.001deg)';
    grain.style.transform = 'translate(' + (rand(frame) * 40 - 20).toFixed(1) + 'px,' + (rand(frame + 7) * 40 - 20).toFixed(1) + 'px)';
    return true;
  };

  window.__ready = Promise.all([...document.images].map((img) => img.complete ? Promise.resolve() : new Promise((res) => { img.onload = res; img.onerror = res; }))).then(() => (document.fonts ? document.fonts.ready : null)).then(() => true);
  window.__setFrame(0);
})();
</script></body></html>`;
}
