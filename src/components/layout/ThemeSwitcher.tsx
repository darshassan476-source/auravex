"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useText } from "@/cms/CmsProvider";
import { THEMES } from "@/themes/themes";
import { describeCustom, useTheme } from "@/themes/ThemeProvider";
import { cn } from "@/lib/utils";
import { AX_EASE } from "../fx/Reveal";
import { Icon } from "../ui/Icon";

/**
 * Compact theme picker, used in the footer and in the admin top bar.
 *
 * It opens upward or downward depending on the room available. It used to be
 * pinned to `bottom-full`, which is right at the foot of a page and wrong in a
 * top bar — there the menu opened up and off the top of the screen.
 */
export function ThemeSwitcher({
  align = "center",
  direction = "auto",
}: {
  align?: "center" | "right";
  /** `auto` measures the space below the trigger before opening. */
  direction?: "up" | "down" | "auto";
}) {
  const { themeId, theme, setThemeId, ready, customThemes } = useTheme();
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(direction !== "down");
  const ref = useRef<HTMLDivElement>(null);
  const themeLabel = useText("theme.label");
  const ownLabel = useText("theme.group.own");
  const darkLabel = useText("theme.group.dark");
  const lightLabel = useText("theme.group.light");

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dark = THEMES.filter((t) => t.mode === "dark");
  const light = THEMES.filter((t) => t.mode === "light");
  const own = customThemes.map(describeCustom);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          if (direction === "auto") {
            const rect = ref.current?.getBoundingClientRect();
            // The menu is ~420px tall with both groups; flip only if it fits.
            if (rect) setUp(rect.bottom + 440 > window.innerHeight && rect.top > 440);
          } else {
            setUp(direction === "up");
          }
          setOpen((v) => !v);
        }}
        className="ax-glass ax-focus flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-[12px] font-medium text-[var(--ax-ink-muted)] transition-all duration-300 hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]"
      >
        <span className="flex -space-x-1">
          {theme.swatch.map((color) => (
            <span
              key={color}
              className="size-3 rounded-full border border-[var(--ax-bg)]"
              style={{ background: color }}
            />
          ))}
        </span>
        {ready ? theme.name : themeLabel}
        <Icon
          name="chevron-down"
          className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")}
          strokeWidth={2.2}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: up ? 8 : -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.26, ease: AX_EASE }}
            className={cn(
              "ax-edge-light ax-glow-md absolute z-50 max-h-[70vh] w-[300px] overflow-y-auto rounded-2xl border border-[var(--ax-line-strong)] bg-[var(--ax-bg-elevated)] p-3 shadow-2xl",
              up ? "bottom-full mb-3" : "top-full mt-3",
              align === "right" ? "right-0" : "left-1/2 -translate-x-1/2",
            )}
          >
            {[
              ...(own.length ? [{ id: "own", label: ownLabel, items: own }] : []),
              { id: "dark", label: darkLabel, items: dark },
              { id: "light", label: lightLabel, items: light },
            ].map((group) => (
              <div key={group.id} className="mb-2 last:mb-0">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ax-ink-dim)]">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setThemeId(t.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-200",
                        themeId === t.id
                          ? "bg-[rgba(var(--ax-glow),0.14)]"
                          : "hover:bg-[rgba(var(--ax-glow),0.08)]",
                      )}
                    >
                      <span
                        className="size-7 shrink-0 rounded-lg border border-[var(--ax-line)]"
                        style={{
                          background: `linear-gradient(135deg, ${t.swatch[0]} 0%, ${t.swatch[1]} 55%, ${t.swatch[2]} 100%)`,
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-[var(--ax-ink)]">
                          {t.name}
                        </span>
                      </span>
                      {themeId === t.id && (
                        <Icon
                          name="check"
                          className="size-4 shrink-0 text-[var(--ax-accent)]"
                          strokeWidth={2.6}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
