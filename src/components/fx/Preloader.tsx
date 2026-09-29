"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Text } from "@/cms/Text";
import { AX_EASE } from "./Reveal";
import { Logo } from "../layout/Logo";

const SESSION_KEY = "auravex:booted";

/**
 * First-visit boot sequence. Runs once per browser session so navigating
 * back to the homepage does not replay the intro, and is kept under a second
 * end to end — a long intro reads as a slow site, not a considered one.
 */
export function Preloader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let booted = false;
    try {
      booted = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* storage unavailable — show the intro */
    }

    if (booted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setVisible(true);
    document.documentElement.style.overflow = "hidden";

    const start = performance.now();
    const DURATION = 420;
    let frame = 0;

    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* non-fatal */
        }
        setTimeout(() => {
          setVisible(false);
          document.documentElement.style.overflow = "";
        }, 120);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.35, ease: AX_EASE }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--ax-bg)]"
        >
          {/* Ambient field */}
          <div className="ax-grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]" />
          <div
            aria-hidden
            className="absolute size-[560px] rounded-full opacity-60 blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, rgba(var(--ax-glow),0.35), transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: AX_EASE }}
            className="relative flex flex-col items-center gap-10"
          >
            <Logo size="lg" />

            <div className="flex w-[260px] flex-col gap-3">
              <div className="h-px w-full overflow-hidden bg-[var(--ax-line)]">
                <motion.div
                  className="h-full bg-[linear-gradient(90deg,var(--ax-accent),var(--ax-violet))]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[var(--ax-ink-dim)]">
                <Text id="preloader.label" />
                <span className="tabular-nums text-[var(--ax-accent-soft)]">
                  {String(progress).padStart(3, "0")}%
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
