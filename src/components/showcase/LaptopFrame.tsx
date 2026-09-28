"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/themes/ThemeProvider";
import { finishFor, type LaptopFinish } from "./LaptopFinish";
import { useDeviceTilt } from "./useDeviceTilt";

/**
 * Laptop device mockup — the hero visual in references 1, 3 and 8.
 *
 * What makes it read as a machine rather than a picture of one:
 *
 * 1. **It is seen from where a camera would be.** A little above the deck
 *    and a little to one side, so the keyboard is in view and the lid keeps
 *    its turn. Square to the viewer, any device reads as a flat card.
 * 2. **The base is built, not drawn.** Lid, hinge and base share one 3D
 *    space: the deck is a real slab lying away from the viewer, with a front
 *    edge and a side standing down from it, so it takes the machine's turn
 *    with it and foreshortens the way the lid does.
 * 3. **It is made of metal.** The finish follows the theme's mode, so the
 *    deck is always clearly lighter than the black bezel and the keys always
 *    clearly darker than the deck they sit in. Each key is its own cap with a
 *    lit top edge and the recess showing between them — a black rectangle
 *    with pale stripes is what gives a drawing away.
 * 4. **It sits on something.** A contact shadow under the front edge, a wider
 *    soft shadow around it, the front edge's reflection and the screen's own
 *    light on the surface in front.
 *
 * Whatever is passed as children fills the glass at 16:10 and is clipped by
 * it, so a screenshot, a live component or a film all sit in the same machine.
 */
export function LaptopFrame({
  children,
  className,
  /** Degrees the pointer may add at the far edge. Keep this small. */
  intensity = 5,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  // The resting pose: turned a little to the left, the lid leaning back a
  // touch. The deck's own angle (below) puts the camera about 20° above it.
  const { ref, sheen, handlers, style } = useDeviceTilt(intensity, {
    rotateY: -15,
    rotateX: 2,
  });
  const { theme } = useTheme();
  const f = finishFor(theme.mode === "light" ? "light" : "dark");

  return (
    <div
      ref={ref}
      {...handlers}
      className={cn(
        "relative [--ax-lt:11px] [perspective:3000px] [perspective-origin:50%_36%] md:[--ax-lt:14px]",
        className,
      )}
    >
      {/* Ambient pool behind the machine */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-16 -top-10 bottom-10 rounded-[50%] opacity-70 blur-[100px]"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 50%, rgba(var(--ax-glow),0.42), transparent 70%)",
        }}
      />

      {/* On a phone the machine is turned less, so its near corner stays inside
          the screen; the pointer still moves it from there. */}
      <div className="relative [transform-style:preserve-3d] max-md:[transform:rotateY(8deg)]">
        <motion.div
          style={style}
          className="relative [transform-style:preserve-3d]"
        >
          {/* ---------- Lid ---------- */}
          <div
            className="relative rounded-[18px] p-[3px] md:rounded-[22px]"
            style={{ background: f.shell, boxShadow: f.shellShadow }}
          >
            {/* The black glass panel the screen is cut out of */}
            <div
              className="relative rounded-[15px] p-[9px] md:rounded-[19px] md:p-[12px]"
              style={{
                background:
                  "linear-gradient(170deg,#0d1017,#05070c 60%,#04060a)",
                boxShadow:
                  "0 0 0 1px rgba(0,0,0,0.9), 0 1px 1px rgba(255,255,255,0.06) inset",
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[15px] ring-1 ring-inset ring-white/[0.07] md:rounded-[19px]"
              />
              {/* Light catching the top chamfer */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-[-3px] h-px rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]"
              />
              {/* Camera */}
              <span
                aria-hidden
                className="absolute left-1/2 top-[3.5px] size-[3px] -translate-x-1/2 rounded-full bg-[#05070c] ring-[0.5px] ring-white/25 md:top-[5px]"
              />

              {/* ---------- Screen ---------- */}
              <div
                className="relative aspect-[16/10] overflow-hidden rounded-[7px] bg-[var(--ax-bg-elevated)] md:rounded-[9px]"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(0,0,0,0.85), 0 10px 30px -12px rgba(0,0,0,0.8) inset",
                }}
              >
                <div className="absolute inset-0 [&>*]:size-full [&_img]:size-full [&_img]:object-cover [&_img]:object-top [&_video]:size-full [&_video]:object-cover">
                  {children}
                </div>

                {/* Glass: a fixed diagonal, plus the sheen that tracks the pointer */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(122deg,rgba(255,255,255,0.10)_0%,transparent_34%,transparent_66%,rgba(255,255,255,0.05)_100%)]"
                />
                <motion.span
                  aria-hidden
                  style={{ backgroundImage: sheen }}
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 shadow-[inset_0_0_36px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* ---------- Hinge ---------- */}
          <div
            aria-hidden
            className="relative mx-auto h-[6px] w-[94%] rounded-b-[3px] md:h-[7px]"
            style={{
              background: f.hinge,
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.12) inset, 0 5px 9px -6px rgba(0,0,0,0.9)",
            }}
          >
            <span
              className="absolute left-[4%] top-0 h-full w-[6%] rounded-b-[3px]"
              style={{ background: f.hingeCap }}
            />
            <span
              className="absolute right-[4%] top-0 h-full w-[6%] rounded-b-[3px]"
              style={{ background: f.hingeCap }}
            />
          </div>

          {/* ---------- Body ---------- */}
          {/* The layout box only reserves the height the base takes up on the
              page; the base itself is built inside it, in the same 3D space as
              the lid. */}
          <div
            aria-hidden
            className="relative aspect-[100/20] [transform-style:preserve-3d] md:aspect-[100/24]"
          >
            {/* The deck's true footprint, hinged along its back edge and lying
                away from the viewer: about half as deep as it is wide. */}
            <div
              className="absolute inset-x-0 top-0 aspect-[100/42] origin-top [transform-style:preserve-3d] md:aspect-[100/48]"
              style={{ transform: "rotateX(70deg)" }}
            >
              {/* ----- Floor: a plane one base-thickness below the deck ----- */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ transform: "translateZ(calc(var(--ax-lt) * -1))" }}
              >
                {/* Occlusion under the machine, just past its edges */}
                <span
                  className="absolute inset-x-[-2.5%] inset-y-[-3%] rounded-[10px] blur-md"
                  style={{ background: f.shadow.occlusion }}
                />
                {/* Contact shadow along the front edge */}
                <span
                  className="absolute inset-x-[1%] top-[96%] h-[8%] rounded-[50%] blur-[5px]"
                  style={{ background: f.shadow.contact }}
                />
                {/* Soft cast shadow spreading in front */}
                <span
                  className="absolute inset-x-[-7%] top-[92%] h-[36%] rounded-[50%] blur-2xl"
                  style={{ background: f.shadow.cast }}
                />
                {/* The front edge mirrored in the surface */}
                <span
                  className="absolute inset-x-[0.5%] top-full h-[14%] blur-[1px]"
                  style={{ background: f.shadow.mirror }}
                />
                {/* The screen's light on the surface in front of the machine */}
                <span
                  className="absolute inset-x-[14%] top-[98%] h-[80%] rounded-[50%] opacity-50 blur-xl"
                  style={{
                    background:
                      "radial-gradient(50% 100% at 50% 0%, rgba(var(--ax-glow),0.5), transparent 76%)",
                  }}
                />
              </div>

              {/* ----- Deck surface ----- */}
              {/* Authored at two-fifths of its depth and stretched back up, so
                  it is rasterised close to the size it is finally seen at: keys
                  drawn at full depth and squeezed by the angle turn to moiré. */}
              <div
                className="absolute inset-x-0 top-0 h-[40%] origin-top"
                style={{
                  transform: "scaleY(2.5)",
                  borderRadius: "0 0 12px 12px / 0 0 4px 4px",
                  background: f.deck,
                }}
              >
                {/* Brushed grain, then the light across the deck and the
                    hinge's own shadow at the back */}
                <span
                  className="absolute inset-0 opacity-60"
                  style={{ borderRadius: "inherit", backgroundImage: f.grain }}
                />
                <span
                  className="absolute inset-0"
                  style={{ borderRadius: "inherit", background: f.deckSheen }}
                />
                {/* The screen's glow falling on the deck, brightest at the hinge */}
                <span
                  className="absolute inset-x-0 top-0 h-[42%]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(var(--ax-glow),0.18), transparent 92%)",
                  }}
                />

                {/* Speaker grilles either side of the keyboard */}
                <Grille side="left" finish={f} />
                <Grille side="right" finish={f} />

                {/* Keyboard well */}
                <div
                  className="absolute"
                  style={{
                    left: "9.5%",
                    right: "9.5%",
                    top: "8%",
                    height: "54%",
                    borderRadius: "4px / 1.6px",
                    background: f.well,
                    boxShadow: f.wellShadow,
                  }}
                >
                  <Keys finish={f} />
                </div>

                {/* Trackpad */}
                <span
                  className="absolute"
                  style={{
                    left: "30%",
                    right: "30%",
                    top: "68%",
                    height: "27%",
                    borderRadius: "5px / 2px",
                    background: f.trackpad,
                    boxShadow: f.trackpadShadow,
                  }}
                />
              </div>

              {/* ----- Front edge: standing down from the deck's front ----- */}
              <div
                className="absolute inset-x-0 top-full h-[var(--ax-lt)] origin-top"
                style={{
                  transform: "rotateX(-90deg)",
                  borderRadius: "0 0 7px 7px",
                  background: f.front,
                  boxShadow: f.frontShadow,
                }}
              >
                {/* The dip where a finger lifts the lid */}
                <span
                  className="absolute left-1/2 top-0 h-[38%] w-[12%] -translate-x-1/2 rounded-b-[5px]"
                  style={{ background: f.notch }}
                />
              </div>

              {/* ----- Side: the edge the turn brings into view ----- */}
              <div
                className="absolute right-0 top-0 h-full w-[var(--ax-lt)] origin-right rounded-bl-[7px]"
                style={{ transform: "rotateY(-90deg)", background: f.side }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- pieces ---------------- */

/**
 * Key widths, row by row, in units of one key: the function row, the number
 * row and delete, tab and the letters, caps to return, the shifts, then the
 * modifiers, space and the arrows. Legends are left off; at this size and
 * angle they would only read as noise.
 */
const KEY_ROWS: number[][] = [
  [1.45, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.55],
  [1.55, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1.85, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7],
  [2.35, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.35],
  [1, 1, 1, 1.25, 5.2, 1.25, 1, 1, 1, 1],
];

function Keys({ finish }: { finish: LaptopFinish }) {
  const cap: CSSProperties = {
    borderRadius: "2.5px / 1.1px",
    background: finish.key,
    boxShadow: finish.keyShadow,
  };
  return (
    <div
      className="absolute flex flex-col"
      style={{ inset: "4.5% 1.6%", gap: "5.5% 0" }}
    >
      {KEY_ROWS.map((row, r) => (
        <div
          key={r}
          className="flex min-h-0"
          style={{ flex: r === 0 ? "0.62 0.62 0%" : "1 1 0%", gap: "0 0.95%" }}
        >
          {row.map((w, k) => (
            <span
              key={k}
              className="min-w-0"
              style={{
                ...cap,
                // The power key, top right, is a shade lighter than the rest.
                ...(r === 0 && k === row.length - 1
                  ? { background: finish.keyPower }
                  : null),
                flex: `${w} ${w} 0%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Grille({
  side,
  finish,
}: {
  side: "left" | "right";
  finish: LaptopFinish;
}) {
  return (
    <span
      className="absolute opacity-80"
      style={{
        [side]: "3.2%",
        width: "5%",
        top: "9%",
        height: "52%",
        backgroundImage: `radial-gradient(circle, ${finish.grille} 0.55px, transparent 0.9px)`,
        backgroundSize: "3.6px 1.7px",
      }}
    />
  );
}
