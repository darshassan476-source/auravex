"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useText } from "@/cms/CmsProvider";
import { AX_EASE } from "@/components/fx/Reveal";
import { Icon } from "@/components/ui/Icon";

/**
 * Sticky conversion bar — reference 6.
 *
 * Phones only. It arrives once the hero has been scrolled past, so it never
 * competes with the headline, and it stays out of the way on the pages where
 * the ask is already the whole point.
 */
const HIDDEN_ON = ["/contact", "/admin"];

export function MobileCTABar() {
  const pathname = usePathname();
  const message = useText("mobile.cta.body");
  const label = useText("mobile.cta.button");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const suppressed = HIDDEN_ON.some((path) => pathname.startsWith(path));

  return (
    <AnimatePresence>
      {shown && !suppressed && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.5, ease: AX_EASE }}
          className="fixed inset-x-3 bottom-3 z-40 md:hidden"
        >
          <div className="ax-glass-strong ax-edge-light ax-glow-md flex items-center gap-3 rounded-2xl p-3 pl-3.5">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl text-[var(--ax-accent-soft)]"
              style={{
                background:
                  "linear-gradient(145deg, rgba(var(--ax-glow),0.26), rgba(var(--ax-glow),0.07))",
                boxShadow: "inset 0 0 0 1px rgba(var(--ax-glow),0.26)",
              }}
            >
              <Icon name="layers" className="size-[18px]" strokeWidth={1.8} />
            </span>

            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-[var(--ax-ink)]">
              {message}
            </p>

            <Link
              href="/contact"
              className="ax-focus inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-4 text-[13px] font-semibold text-white shadow-[0_10px_34px_-14px_rgba(var(--ax-glow),0.95)]"
            >
              {label}
              <Icon name="arrow-right" className="size-3.5" strokeWidth={2.4} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
