"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Panel } from "@/components/admin/Primitives";
import type { PaletteScope } from "@/lib/cms";
import { AX_EASE } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MockScreen } from "@/components/ui/MockScreen";
import { Delta, Hairline, StatusBadge, Tag } from "@/components/ui/Primitives";
import { describeCustom } from "@/themes/ThemeProvider";
import { PalettePanel } from "./PalettePanel";
import { ThemesPanel } from "./ThemesPanel";
import { MOTION_LEVELS, THEMES, type MotionLevel } from "@/themes/themes";
import { useTheme } from "@/themes/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Live theme controls. These write through the real provider, so every
 * selection repaints the whole application immediately and persists.
 */
export function ThemeStudio() {
  const {
    themeId,
    theme,
    motion: motionLevel,
    effectsEnabled,
    ready,
    setThemeId,
    setMotion,
    setEffectsEnabled,
    customThemes,
    area,
  } = useTheme();

  const dark = THEMES.filter((t) => t.mode === "dark");
  const light = THEMES.filter((t) => t.mode === "light");
  const own = customThemes.map(describeCustom);
  // One switch drives the two panels below: which half of the site is being dressed.
  const [scope, setScope] = useState<PaletteScope>(area === "portal" ? "portal" : "site");

  return (
    <div className="flex flex-col gap-5">
      {/* Both halves of the site are dressed here, full width; the preview sits with the presets below. */}
      <ThemesPanel scope={scope} onScope={setScope} />
      <PalettePanel scope={scope} onScope={setScope} />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-5">
        <p className="flex items-start gap-2.5 rounded-xl border border-[var(--ax-line)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[var(--ax-ink-muted)]">
          <Icon name="eye" className="mt-0.5 size-3.5 shrink-0 text-[var(--ax-accent-soft)]" strokeWidth={2} />
          <span>
            The presets below change what <strong className="font-semibold text-[var(--ax-ink)]">you</strong> are looking at
            {area === "portal" ? " in this portal" : ""}, so you can try one before making it everyone&apos;s. What a first-time
            visitor sees, and the colours of each half, are set in the two panels above.
          </span>
        </p>
        {[
          ...(own.length ? [{ label: "Your themes", items: own, note: "Made in Appearance from your own colours" }] : []),
          { label: "Dark themes", items: dark, note: `${dark.length} presets` },
          { label: "Light themes", items: light, note: `${light.length} presets` },
        ].map((group) => (
          <Panel key={group.label} title={group.label} description={group.note}>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((preset) => {
                const active = ready && themeId === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setThemeId(preset.id)}
                    className={cn(
                      "ax-focus group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4 text-left transition-all duration-400",
                      active
                        ? "border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.12)]"
                        : "border-[var(--ax-line)] hover:border-[var(--ax-line-strong)]",
                    )}
                  >
                    <span
                      className="h-16 w-full rounded-lg border border-[var(--ax-line)]"
                      style={{
                        background: `linear-gradient(135deg, ${preset.swatch[0]} 0%, ${preset.swatch[1]} 58%, ${preset.swatch[2]} 100%)`,
                      }}
                    />

                    <span className="flex items-start justify-between gap-3">
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-[13.5px] font-semibold text-[var(--ax-ink)]">
                          {preset.name}
                        </span>
                        <span className="text-[11.5px] leading-snug text-[var(--ax-ink-dim)]">
                          {preset.description}
                        </span>
                      </span>

                      {active && (
                        <motion.span
                          layoutId="theme-active-check"
                          transition={{ duration: 0.34, ease: AX_EASE }}
                          className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--ax-accent)] text-white"
                        >
                          <Icon name="check" className="size-3.5" strokeWidth={3} />
                        </motion.span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>
        ))}

        <Panel title="Motion" description="How much movement the interface uses">
          <div className="grid gap-3 sm:grid-cols-3">
            {MOTION_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setMotion(level.id as MotionLevel)}
                className={cn(
                  "ax-focus flex flex-col gap-2 rounded-xl border p-4 text-left transition-all duration-300",
                  motionLevel === level.id
                    ? "border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.12)]"
                    : "border-[var(--ax-line)] hover:border-[var(--ax-line-strong)]",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-[13.5px] font-semibold text-[var(--ax-ink)]">
                    {level.name}
                  </span>
                  {motionLevel === level.id && (
                    <Icon name="check" className="size-4 text-[var(--ax-accent)]" strokeWidth={3} />
                  )}
                </span>
                <span className="text-[11.5px] leading-snug text-[var(--ax-ink-dim)]">
                  {level.description}
                </span>
              </button>
            ))}
          </div>

          <Hairline className="my-6" />

          <button
            type="button"
            onClick={() => setEffectsEnabled(!effectsEnabled)}
            className="ax-focus flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--ax-line)] p-4 text-left transition-colors duration-300 hover:border-[var(--ax-line-strong)]"
          >
            <span className="flex flex-col gap-1">
              <span className="text-[13.5px] font-semibold text-[var(--ax-ink)]">
                Visual effects
              </span>
              <span className="text-[11.5px] leading-relaxed text-[var(--ax-ink-dim)]">
                The 3D field, custom cursor, magnetic buttons and card tilt. Turning these off
                lightens the page on low-powered machines.
              </span>
            </span>
            <span
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
                effectsEnabled ? "bg-[var(--ax-accent)]" : "bg-[var(--ax-line-strong)]",
              )}
            >
              <motion.span
                animate={{ x: effectsEnabled ? 20 : 2 }}
                transition={{ duration: 0.26, ease: AX_EASE }}
                className="absolute top-1 size-4 rounded-full bg-white"
              />
            </span>
          </button>
        </Panel>
      </div>

      {/* ---------- Live preview ---------- */}
      <div className="flex flex-col gap-5 xl:sticky xl:top-24 xl:self-start">
        <Panel
          title="Live preview"
          description={ready ? theme.name : "Loading preferences…"}
        >
          <div className="flex flex-col gap-5">
            <MockScreen
              seed={themeId}
              accent={theme.scene.primary}
              label={theme.name}
              variant="dashboard"
            />

            <div className="flex flex-col gap-3">
              <span className="ax-display ax-gradient-text text-[26px]">
                Building Intelligent Software
              </span>
              <p className="text-[13px] leading-relaxed text-[var(--ax-ink-muted)]">
                Body copy renders in the muted ink token. Every surface, border and glow on this
                page is repainted by the selection on the left.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="live" />
              <Tag>Enterprise</Tag>
              <Tag>AI-Powered</Tag>
              <Delta value="+32%" trend="up" />
            </div>

            <Hairline />

            {/* Samples of the three button styles, not controls: they show how the
                theme paints them, so nothing happens when they are pressed. */}
            <div className="flex flex-col gap-2">
              <span className="ax-eyebrow text-[var(--ax-ink-dim)]">Button styles</span>
              <div className="flex flex-wrap gap-2.5" aria-hidden>
                <Button size="sm" magnetic={false} disabled className="!opacity-100">
                  Primary
                </Button>
                <Button size="sm" variant="secondary" magnetic={false} disabled className="!opacity-100">
                  Secondary
                </Button>
                <Button size="sm" variant="outline" magnetic={false} disabled className="!opacity-100">
                  Outline
                </Button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Scene palette" description="Accent ramp used across gradients and charts">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["Primary", theme.scene.primary],
                ["Secondary", theme.scene.secondary],
                ["Particle", theme.scene.particle],
                ["Fog", theme.scene.fog],
              ] as const
            ).map(([label, color]) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="size-9 shrink-0 rounded-lg border border-[var(--ax-line)]"
                  style={{ background: color }}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[12px] font-medium text-[var(--ax-ink)]">{label}</span>
                  <span className="truncate font-mono text-[10.5px] uppercase text-[var(--ax-ink-dim)]">
                    {color}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      </div>
    </div>
  );
}
