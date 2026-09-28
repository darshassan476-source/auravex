import { Icon } from "@/components/ui/Icon";

/**
 * Deploy console — what a developer platform looks like: a pipeline across the
 * top, a log stream, and service health down the side. No charts at all, which
 * is the point.
 */

const STAGES = [
  { label: "Install", state: "done", time: "12s" },
  { label: "Test", state: "done", time: "1m 04s" },
  { label: "Build", state: "done", time: "48s" },
  { label: "Deploy", state: "running", time: "22s" },
  { label: "Verify", state: "queued", time: "—" },
];

const LOG = [
  { t: "10:42:01", tone: "dim", text: "› auravex deploy --env production" },
  { t: "10:42:02", tone: "dim", text: "  resolving 248 packages from lockfile" },
  { t: "10:42:14", tone: "ok", text: "✓ typecheck passed — 0 errors" },
  { t: "10:43:18", tone: "ok", text: "✓ 412 tests passed in 64s" },
  { t: "10:44:06", tone: "ok", text: "✓ bundle 184 kB gzipped (-6%)" },
  { t: "10:44:28", tone: "accent", text: "→ rolling out to 3 regions" },
  { t: "10:44:41", tone: "dim", text: "  eu-west-1 · healthy" },
  { t: "10:44:49", tone: "dim", text: "  me-central-1 · healthy" },
];

const SERVICES = [
  { name: "api-gateway", uptime: "99.99%", tone: "var(--ax-success)" },
  { name: "worker-pool", uptime: "99.97%", tone: "var(--ax-success)" },
  { name: "search-index", uptime: "99.82%", tone: "var(--ax-warning)" },
  { name: "media-cdn", uptime: "100%", tone: "var(--ax-success)" },
];

const TONE: Record<string, string> = {
  dim: "text-[var(--ax-ink-dim)]",
  ok: "text-[var(--ax-success)]",
  accent: "text-[var(--ax-accent-soft)]",
};

export function ConsoleScreen({ accent = "var(--ax-accent)" }: { accent?: string }) {
  return (
    <div className="flex h-full flex-col bg-[var(--ax-bg-elevated)] text-[var(--ax-ink)]">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--ax-line)] px-4 py-2.5">
        <span className="flex items-center gap-2">
          <Icon name="terminal" className="size-3.5" style={{ color: accent }} strokeWidth={2.2} />
          <span className="text-[12px] font-semibold">forge · production</span>
          <span className="rounded-full border border-[var(--ax-success)]/30 bg-[var(--ax-success)]/10 px-2 py-0.5 text-[8.5px] text-[var(--ax-success)]">
            main @ 7f3a91c
          </span>
        </span>
        <span className="font-mono text-[9px] text-[var(--ax-ink-dim)]">build #2,184</span>
      </header>

      {/* Pipeline */}
      <div className="flex items-center gap-1 border-b border-[var(--ax-line)] px-4 py-3">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex flex-1 items-center gap-1">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-1.5">
                <span
                  className="grid size-3.5 shrink-0 place-items-center rounded-full"
                  style={{
                    background:
                      stage.state === "done"
                        ? "var(--ax-success)"
                        : stage.state === "running"
                          ? accent
                          : "rgba(var(--ax-glow),0.16)",
                  }}
                >
                  {stage.state === "done" && (
                    <Icon name="check" className="size-2 text-white" strokeWidth={3.4} />
                  )}
                  {stage.state === "running" && (
                    <span className="size-1.5 animate-pulse rounded-full bg-white" />
                  )}
                </span>
                <span className="truncate text-[9px] font-medium text-[var(--ax-ink)]">
                  {stage.label}
                </span>
              </span>
              <span className="pl-5 font-mono text-[8px] text-[var(--ax-ink-dim)]">
                {stage.time}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <span
                className="h-px w-3 shrink-0"
                style={{
                  background:
                    stage.state === "done" ? "var(--ax-success)" : "rgba(var(--ax-glow),0.18)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-[1.7fr_1fr] overflow-hidden">
        {/* Log stream */}
        <div className="flex flex-col gap-1 overflow-hidden border-r border-[var(--ax-line)] bg-[rgba(0,0,0,0.20)] p-3">
          {LOG.map((line) => (
            <span key={line.t + line.text} className="flex gap-2 font-mono text-[8.5px] leading-relaxed">
              <span className="shrink-0 text-[var(--ax-ink-dim)] opacity-60">{line.t}</span>
              <span className={TONE[line.tone]}>{line.text}</span>
            </span>
          ))}
          <span className="flex gap-2 font-mono text-[8.5px]">
            <span className="shrink-0 text-[var(--ax-ink-dim)] opacity-60">10:44:52</span>
            <span className="flex items-center gap-1" style={{ color: accent }}>
              deploying
              <span className="inline-block size-1 animate-pulse rounded-full bg-current" />
            </span>
          </span>
        </div>

        {/* Service health */}
        <div className="flex flex-col gap-2 p-3">
          <span className="text-[9px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">
            Services
          </span>
          {SERVICES.map((service) => (
            <span key={service.name} className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: service.tone }} />
              <span className="flex-1 truncate font-mono text-[9px] text-[var(--ax-ink-muted)]">
                {service.name}
              </span>
              <span className="shrink-0 font-mono text-[8.5px] text-[var(--ax-ink)]">
                {service.uptime}
              </span>
            </span>
          ))}

          <span className="mt-auto flex flex-col gap-1 rounded-lg border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] p-2">
            <span className="text-[8.5px] font-semibold text-[var(--ax-ink)]">Rollback ready</span>
            <span className="text-[8px] leading-snug text-[var(--ax-ink-dim)]">
              Previous build retained for 30 days.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
