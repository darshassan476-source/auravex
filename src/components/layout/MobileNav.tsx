"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Text } from "@/cms/Text";
import { useNavItems } from "@/cms/useSiteLists";
import { AX_EASE } from "../fx/Reveal";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Logo } from "./Logo";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const navItems = useNavItems();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] lg:hidden"
        >
          <div className="absolute inset-0 bg-[var(--ax-bg)]/95 backdrop-blur-2xl" />
          <div className="ax-grid-bg absolute inset-0 opacity-30" />

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.4, ease: AX_EASE }}
            className="relative flex h-full flex-col"
          >
            <div className="ax-container flex h-[88px] shrink-0 items-center justify-between">
              <Logo size="sm" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="ax-focus grid size-10 place-items-center rounded-full text-[var(--ax-ink)] hover:bg-[rgba(var(--ax-glow),0.10)]"
              >
                <Icon name="x" className="size-5" strokeWidth={2} />
              </button>
            </div>

            <nav className="ax-container flex-1 overflow-y-auto py-6">
              <ul className="flex flex-col">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1, duration: 0.5, ease: AX_EASE }}
                    className="border-b border-[var(--ax-line)]"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="ax-display flex-1 py-5 text-[28px] text-[var(--ax-ink)]"
                      >
                        {item.label}
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          aria-label={`Toggle ${item.label}`}
                          onClick={() =>
                            setExpanded(expanded === item.href ? null : item.href)
                          }
                          className="ax-focus grid size-10 place-items-center rounded-full text-[var(--ax-ink-muted)]"
                        >
                          <Icon
                            name="chevron-down"
                            className={`size-5 transition-transform duration-300 ${
                              expanded === item.href ? "rotate-180" : ""
                            }`}
                            strokeWidth={2}
                          />
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {item.children && expanded === item.href && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.34, ease: AX_EASE }}
                          className="overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                className="flex items-center justify-between py-3 pl-4 text-[15px] text-[var(--ax-ink-muted)]"
                              >
                                {child.label}
                                <Icon name="arrow-up-right" className="size-4" strokeWidth={2} />
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="ax-container shrink-0 space-y-4 border-t border-[var(--ax-line)] py-6">
              <Button href="/contact" size="lg" icon="arrow-right" className="w-full">
                <Text id="nav.mobile.cta" />
              </Button>
              <p className="text-center text-[12px] text-[var(--ax-ink-dim)]">
                <Text id="site.email" /> · <Text id="site.location" />
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
