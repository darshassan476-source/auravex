"use client";

import { useMemo, useState } from "react";
import { useCms } from "@/cms/CmsProvider";
import { slotTime } from "@/cms/Reminders";
import { Panel } from "@/components/admin/Primitives";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import type { Booking, BookingStatus } from "@/lib/cms";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "text-[var(--ax-warning)] border-[var(--ax-warning)]/35 bg-[var(--ax-warning)]/10",
  confirmed: "text-[var(--ax-accent-soft)] border-[var(--ax-accent)]/35 bg-[var(--ax-accent)]/10",
  done: "text-[var(--ax-success)] border-[var(--ax-success)]/35 bg-[var(--ax-success)]/10",
  cancelled: "text-[var(--ax-ink-dim)] border-[var(--ax-line-strong)] bg-[rgba(var(--ax-glow),0.06)]",
};

/** Dot colour beside each status in the picker. */
const STATUS_TONE: Record<BookingStatus, string> = {
  pending: "var(--ax-warning)",
  confirmed: "var(--ax-accent)",
  done: "var(--ax-success)",
  cancelled: "var(--ax-ink-dim)",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  done: "Done",
  cancelled: "Cancelled",
};

const LEAD_TIMES = [10, 30, 60, 120, 1440];

function leadLabel(minutes: number) {
  if (minutes >= 1440) return `${minutes / 1440}d before`;
  if (minutes >= 60) return `${minutes / 60}h before`;
  return `${minutes}m before`;
}

function countdown(ms: number) {
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `in ${hours}h`;
  return `in ${Math.round(hours / 24)}d`;
}

/**
 * Scheduled demos, and the reminders attached to them.
 *
 * Each booking carries its own lead time. The server sweeps the schedule
 * once a minute and pushes to every subscribed browser, so a reminder
 * arrives even when the site is closed; while a portal tab is open the
 * service worker also keeps a local timer.
 */
export function BookingsBoard() {
  const {
    state,
    ready,
    setBookingStatus,
    setBookingReminder,
    deleteBooking,
    enableReminders,
  } = useCms();

  const [filter, setFilter] = useState<"upcoming" | "all" | BookingStatus>("upcoming");
  const [asking, setAsking] = useState(false);
  const [testNote, setTestNote] = useState<string | null>(null);

  async function sendTest() {
    setTestNote("Sending…");
    try {
      const { api } = await import("@/lib/api");
      const result = await api<{ sent: number; dropped: number }>("/api/admin/push/test", { method: "POST" });
      setTestNote(
        result.sent > 0
          ? `Sent to ${result.sent} browser${result.sent === 1 ? "" : "s"}.`
          : "No browser is subscribed yet — allow notifications and try again.",
      );
    } catch (e) {
      setTestNote(e instanceof Error ? e.message : "Could not send.");
    }
  }

  const permission =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported";

  const sorted = useMemo(
    () => [...state.bookings].sort((a, b) => slotTime(a) - slotTime(b)),
    [state.bookings],
  );

  const shown = useMemo(() => {
    const now = Date.now();
    if (filter === "upcoming")
      return sorted.filter((b) => slotTime(b) >= now && b.status !== "cancelled");
    if (filter === "all") return sorted;
    return sorted.filter((b) => b.status === filter);
  }, [sorted, filter]);

  const upcoming = sorted.filter(
    (b) => slotTime(b) >= Date.now() && b.status !== "cancelled",
  );
  const next = upcoming[0];

  async function turnOn() {
    setAsking(true);
    await enableReminders();
    setAsking(false);
  }

  const remindersLive = state.remindersEnabled && permission === "granted";

  return (
    <div className="flex flex-col gap-5">
      {/* Reminder status */}
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
          remindersLive
            ? "border-[var(--ax-success)]/35 bg-[var(--ax-success)]/8"
            : "border-[var(--ax-accent)]/30 bg-[rgba(var(--ax-glow),0.07)]",
        )}
      >
        <span className="flex items-start gap-2.5">
          <Icon
            name={remindersLive ? "check-circle" : "bell"}
            className={cn(
              "mt-0.5 size-4 shrink-0",
              remindersLive ? "text-[var(--ax-success)]" : "text-[var(--ax-accent-soft)]",
            )}
            strokeWidth={2}
          />
          <span className="text-[12.5px] leading-relaxed text-[var(--ax-ink-muted)]">
            {permission === "unsupported" ? (
              "This browser does not support notifications."
            ) : remindersLive ? (
              <>
                Reminders are on. The server pushes to every browser that allowed
                notifications, so they arrive even when the site is closed; send a test to
                confirm this device is one of them.
                {testNote && <span className="block text-[var(--ax-ink)]">{testNote}</span>}
              </>
            ) : permission === "denied" ? (
              "Notifications are blocked for this site. Allow them in your browser's site settings to get reminders."
            ) : (
              "Turn on reminders and you will be notified before each demo, even after this tab is closed."
            )}
          </span>
        </span>

        {remindersLive && (
          <button
            type="button"
            onClick={sendTest}
            className="ax-focus inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[var(--ax-line-strong)] px-4 py-2 text-[12.5px] font-medium text-[var(--ax-ink)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)]"
          >
            <Icon name="bell" className="size-3.5" strokeWidth={2.2} />
            Send a test
          </button>
        )}

        {!remindersLive && permission === "default" && (
          <button
            type="button"
            onClick={turnOn}
            disabled={asking}
            className="ax-focus inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] px-4 py-2 text-[12.5px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
          >
            <Icon name="bell" className="size-3.5" strokeWidth={2.2} />
            {asking ? "Waiting…" : "Turn on reminders"}
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Upcoming" value={upcoming.length} icon="calendar" />
        <Stat
          label="Awaiting confirmation"
          value={state.bookings.filter((b) => b.status === "pending").length}
          icon="clock"
        />
        <Stat
          label="Completed"
          value={state.bookings.filter((b) => b.status === "done").length}
          icon="check-circle"
        />
        <Stat
          label="Next demo"
          value={next ? countdown(slotTime(next) - Date.now()) : "—"}
          sub={next ? `${next.name} · ${next.time}` : "Nothing scheduled"}
          icon="zap"
        />
      </div>

      <Panel
        title="Scheduled demos"
        description="Booked from the calendar on the contact page."
        padded={false}
        action={
          <div className="flex flex-wrap gap-1.5">
            {(["upcoming", "pending", "confirmed", "done", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "ax-focus rounded-full px-3 py-1.5 text-[11.5px] font-medium capitalize transition-all duration-300",
                  f === filter
                    ? "bg-[linear-gradient(110deg,var(--ax-accent),var(--ax-violet))] text-white"
                    : "text-[var(--ax-ink-muted)] hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        {!ready || shown.length === 0 ? (
          <p className="px-6 py-12 text-center text-[12.5px] leading-relaxed text-[var(--ax-ink-dim)]">
            {state.bookings.length === 0
              ? "No bookings yet. Pick a date and time on the contact page and it will show up here."
              : "Nothing in this view."}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--ax-line)]">
            {shown.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onStatus={(s) => setBookingStatus(booking.id, s)}
                onReminder={(m) => setBookingReminder(booking.id, m)}
                onDelete={() => deleteBooking(booking.id)}
              />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function BookingRow({
  booking,
  onStatus,
  onReminder,
  onDelete,
}: {
  booking: Booking;
  onStatus: (status: BookingStatus) => void;
  onReminder: (minutes: number) => void;
  onDelete: () => void;
}) {
  const when = slotTime(booking);
  const past = when < Date.now();

  return (
    <li className="flex flex-col gap-3 p-5 transition-colors hover:bg-[rgba(var(--ax-glow),0.04)] xl:flex-row xl:items-center xl:gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.08)]">
          <span className="text-[9.5px] uppercase tracking-[0.1em] text-[var(--ax-ink-dim)]">
            {new Date(when).toLocaleDateString(undefined, { month: "short" })}
          </span>
          <span className="ax-display text-[17px] leading-none text-[var(--ax-ink)]">
            {new Date(when).getDate()}
          </span>
        </span>

        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-[var(--ax-ink)]">
              {booking.name}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                STATUS_STYLE[booking.status],
              )}
            >
              {STATUS_LABEL[booking.status]}
            </span>
            {!past && booking.status !== "cancelled" && (
              <span className="text-[11px] text-[var(--ax-accent-soft)]">
                {countdown(when - Date.now())}
              </span>
            )}
          </span>
          <span className="truncate text-[12px] text-[var(--ax-ink-muted)]">
            {[booking.email, booking.company, booking.subject].filter(Boolean).join(" · ")}
          </span>
          <span className="font-mono text-[11.5px] text-[var(--ax-ink-dim)]">
            {booking.date} · {booking.time}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="w-[132px]"
          size="sm"
          label={`Reminder for ${booking.name}`}
          value={String(booking.remindMinutes)}
          onChange={(v) => onReminder(Number(v))}
          options={(LEAD_TIMES.includes(booking.remindMinutes)
            ? LEAD_TIMES
            : [...LEAD_TIMES, booking.remindMinutes].sort((a, b) => a - b)
          ).map((m) => ({ value: String(m), label: leadLabel(m) }))}
        />

        <Select
          className="w-[124px]"
          size="sm"
          label={`Status for ${booking.name}`}
          value={booking.status}
          onChange={(v) => onStatus(v as BookingStatus)}
          options={(Object.keys(STATUS_LABEL) as BookingStatus[]).map((k) => ({
            value: k,
            label: STATUS_LABEL[k],
            tone: STATUS_TONE[k],
          }))}
        />

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete booking for ${booking.name}`}
          className="ax-focus grid size-8 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[var(--ax-danger)]/12 hover:text-[var(--ax-danger)]"
        >
          <Icon name="trash" className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}

function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="ax-glass ax-edge-light flex items-center gap-4 rounded-2xl p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.10)] text-[var(--ax-accent-soft)]">
        <Icon name={icon} className="size-[18px]" strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="ax-display text-[24px] leading-none text-[var(--ax-ink)]">
          {value}
        </span>
        <span className="mt-1 truncate text-[12px] text-[var(--ax-ink-muted)]">{label}</span>
        {sub && <span className="truncate text-[11px] text-[var(--ax-ink-dim)]">{sub}</span>}
      </span>
    </div>
  );
}
