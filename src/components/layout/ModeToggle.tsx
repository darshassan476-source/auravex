"use client";

import { useTheme } from "@/themes/ThemeProvider";
import { THEMES } from "@/themes/themes";
import { cn } from "@/lib/utils";
import { Icon } from "../ui/Icon";

/** Paired themes, so switching mode keeps the accent family the user picked. */
const COUNTERPART: Record<string, string> = {
  // Dark → light
  "futuristic-enterprise": "clean-enterprise",
  "cyber-city": "blush-quartz",
  "space-universe": "crystal-world",
  "neon-mountains": "ai-landscape",
  "ai-world": "crystal-world",
  "midnight-gold": "warm-linen",
  "emerald-vault": "sage-studio",
  "crimson-atlas": "blush-quartz",
  "arctic-steel": "porcelain-navy",
  // Light → dark
  "clean-enterprise": "futuristic-enterprise",
  "white-future-city": "arctic-steel",
  "crystal-world": "ai-world",
  "ai-landscape": "neon-mountains",
  "warm-linen": "midnight-gold",
  "sage-studio": "emerald-vault",
  "porcelain-navy": "arctic-steel",
  "blush-quartz": "crimson-atlas",
};

/**
 * Light/dark switch for the navbar. The footer and the portal keep the full
 * preset picker; this is the one-tap version people actually reach for.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { themeId, theme, setThemeId, custom } = useTheme();
  const dark = theme.mode === "dark";

  function flip() {
    // A custom theme flips through the preset it was built on.
    const target = COUNTERPART[custom ? custom.base : themeId];
    // Fall back to the first theme of the opposite mode if the pair is missing.
    const next =
      target ?? THEMES.find((t) => t.mode !== theme.mode)?.id ?? themeId;
    setThemeId(next);
  }

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "ax-focus grid size-10 place-items-center rounded-full text-[var(--ax-ink-muted)]",
        "transition-colors duration-300 hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]",
        className,
      )}
    >
      <Icon
        name={dark ? "sun" : "moon"}
        className="size-[18px]"
        strokeWidth={1.9}
      />
    </button>
  );
}
