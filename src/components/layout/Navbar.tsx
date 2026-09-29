"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AX_EASE } from "../fx/Reveal";
import { Text } from "@/cms/Text";
import { useNavItems } from "@/cms/useSiteLists";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ModeToggle } from "./ModeToggle";
import { SearchOverlay } from "./SearchOverlay";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navItems = useNavItems();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  // Close transient UI on navigation.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Cmd/Ctrl+K opens search.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (event.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "ax-rv ax-rv-down fixed inset-x-0 top-0 z-[100] transition-all duration-500",
          scrolled
            ? "border-b border-[var(--ax-line)] bg-[color-mix(in_srgb,var(--ax-bg)_82%,transparent)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="ax-container-wide">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-500",
              scrolled ? "h-[68px]" : "h-[88px]",
            )}
          >
            <Logo size={scrolled ? "sm" : "md"} />

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.children ? item.href : null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "ax-focus relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-medium transition-colors duration-300",
                      isActive(item.href)
                        ? "text-[var(--ax-ink)]"
                        : "text-[var(--ax-ink-muted)] hover:text-[var(--ax-ink)]",
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <Icon
                        name="chevron-down"
                        className={cn(
                          "size-3.5 transition-transform duration-300",
                          openMenu === item.href && "rotate-180",
                        )}
                        strokeWidth={2.2}
                      />
                    )}
                    {isActive(item.href) && (
                      <motion.span
                        layoutId="nav-active"
                        transition={{ duration: 0.45, ease: AX_EASE }}
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-[linear-gradient(90deg,transparent,var(--ax-accent),transparent)]"
                      />
                    )}
                  </Link>

                  {/* Mega menu */}
                  <AnimatePresence>
                    {item.children && openMenu === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: AX_EASE }}
                        className="absolute left-1/2 top-full w-[540px] -translate-x-1/2 pt-4"
                      >
                        <div className="ax-glass-strong ax-edge-light ax-glow-md grid grid-cols-2 gap-1 rounded-2xl p-2.5">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="group ax-focus flex flex-col gap-1 rounded-xl px-4 py-3 transition-colors duration-300 hover:bg-[rgba(var(--ax-glow),0.10)]"
                            >
                              <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ax-ink)]">
                                {child.label}
                                <Icon
                                  name="arrow-right"
                                  className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                                  strokeWidth={2.4}
                                />
                              </span>
                              <span className="text-[12px] leading-snug text-[var(--ax-ink-dim)]">
                                {child.description}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="ax-focus grid size-10 place-items-center rounded-full text-[var(--ax-ink-muted)] transition-colors duration-300 hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
              >
                <Icon name="search" className="size-[18px]" strokeWidth={2} />
              </button>

              <ModeToggle />

              <Button href="/contact" size="sm" className="hidden md:inline-flex" icon="arrow-right">
                <Text id="nav.cta" />
              </Button>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="ax-focus grid size-10 place-items-center rounded-full text-[var(--ax-ink)] transition-colors duration-300 hover:bg-[rgba(var(--ax-glow),0.10)] lg:hidden"
              >
                <Icon name="menu" className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
