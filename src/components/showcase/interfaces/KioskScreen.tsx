import { Icon } from "@/components/ui/Icon";

/**
 * Visitor check-in — a touch interface rather than a desktop one.
 *
 * Shown in a tablet frame, so a visitor-experience product does not look like
 * yet another admin dashboard.
 */

const AMENITIES = [
  { icon: "calendar", label: "Meeting rooms", detail: "4 free now" },
  { icon: "users", label: "Host directory", detail: "Level 12–28" },
  { icon: "zap", label: "Fast charge", detail: "Lobby east" },
  { icon: "globe", label: "Guest Wi-Fi", detail: "Auto-connect" },
];

export function KioskScreen({ accent = "var(--ax-accent)" }: { accent?: string }) {
  return (
    <div className="flex h-full flex-col bg-[var(--ax-bg-elevated)] text-[var(--ax-ink)]">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[9px] text-[var(--ax-ink-dim)]">
        <span className="font-medium text-[var(--ax-ink)]">9:41</span>
        <span className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5">
            {[2, 3, 4, 5].map((h) => (
              <span
                key={h}
                className="w-0.5 rounded-sm bg-current"
                style={{ height: h }}
              />
            ))}
          </span>
          <Icon name="globe" className="size-2.5" strokeWidth={2.4} />
          <span className="h-2 w-4 rounded-[2px] border border-current px-px">
            <span className="block h-full w-3/4 rounded-[1px] bg-current" />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-2">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: accent }}>
            Welcome to
          </span>
          <span className="ax-display text-[20px] leading-tight">Marina Heights Tower</span>
          <span className="text-[9.5px] text-[var(--ax-ink-dim)]">
            Check in and your host is notified automatically.
          </span>
        </div>

        {/* QR check-in */}
        <div
          className="flex items-center gap-3.5 rounded-2xl border p-3.5"
          style={{ borderColor: `${accent}40`, background: `${accent}12` }}
        >
          <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-[var(--ax-bg)] p-1.5">
            <QrGlyph accent={accent} />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] font-semibold text-[var(--ax-ink)]">
              Scan to check in
            </span>
            <span className="text-[8.5px] leading-snug text-[var(--ax-ink-muted)]">
              Or tap your invitation link. Average check-in 14 seconds.
            </span>
            <span
              className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[8.5px] font-semibold text-white"
              style={{ background: accent }}
            >
              I have an invitation
              <Icon name="arrow-right" className="size-2.5" strokeWidth={2.6} />
            </span>
          </span>
        </div>

        {/* Amenities */}
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.05)] p-2.5"
            >
              <span
                className="grid size-7 shrink-0 place-items-center rounded-lg"
                style={{ background: `${accent}1f`, color: accent }}
              >
                <Icon name={item.icon} className="size-3" strokeWidth={2} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[9px] font-medium text-[var(--ax-ink)]">
                  {item.label}
                </span>
                <span className="truncate text-[8px] text-[var(--ax-ink-dim)]">
                  {item.detail}
                </span>
              </span>
            </span>
          ))}
        </div>

        {/* Live strip */}
        <div className="mt-auto flex items-center justify-between rounded-xl border border-[var(--ax-line)] px-3 py-2.5">
          <span className="flex items-center gap-2">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-[pulse-ring_2.6s_ease-out_infinite] rounded-full bg-[var(--ax-success)]" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--ax-success)]" />
            </span>
            <span className="text-[9px] text-[var(--ax-ink-muted)]">142 visitors today</span>
          </span>
          <span className="text-[9px] font-medium" style={{ color: accent }}>
            Concierge online
          </span>
        </div>
      </div>
    </div>
  );
}

/** A stylised QR block — readable as a code without pretending to be one. */
function QrGlyph({ accent }: { accent: string }) {
  const cells = [
    "1110111", "1000101", "1011101", "1010001", "1110111", "0001010", "1101011",
  ];
  return (
    <span className="grid size-full grid-cols-7 gap-[1px]">
      {cells.flatMap((row, y) =>
        row.split("").map((cell, x) => (
          <span
            key={`${x}-${y}`}
            className="rounded-[1px]"
            style={{ background: cell === "1" ? accent : "transparent" }}
          />
        )),
      )}
    </span>
  );
}
