"use client";

import { useEffect, useMemo, useState } from "react";
import { useCms, useText } from "@/cms/CmsProvider";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const SLOTS = ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * "Or Book a Time Directly" — the calendar column from reference 5.
 *
 * Confirming posts to /api/bookings, so the slot shows up in the portal
 * under Bookings with a reminder already attached.
 */
export function BookingPanel({
  contact,
}: {
  /** Whatever the visitor has typed into the form beside this, if anything. */
  contact?: { name: string; email: string; company?: string; subject?: string };
}) {
  const { addBooking } = useCms();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ date: string; time: string } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The calendar depends on the visitor's clock, so it is drawn only in the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const t = {
    heading: useText("contact.booking.heading"),
    intro: useText("contact.booking.intro"),
    button: useText("contact.booking.button"),
    buttonPicked: useText("contact.booking.buttonPicked"),
    holding: useText("contact.booking.holding"),
    needDetails: useText("contact.booking.needDetails"),
    held: useText("contact.booking.held"),
  };
  /** Fills `{date}`-style placeholders in an edited sentence. */
  const fill = (template: string, values: Record<string, string>) =>
    template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);

  const canBook =
    Boolean(contact?.name?.trim()) && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact?.email?.trim() ?? "");

  /** A slot earlier today cannot be booked. */
  const isPastSlot = (time: string) => {
    if (!selected) return false;
    const chosen = new Date(month.getFullYear(), month.getMonth(), selected);
    const now = new Date();
    if (chosen.toDateString() !== now.toDateString()) return false;
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time);
    if (!m) return false;
    const hours = (Number(m[1]) % 12) + (/pm/i.test(m[3]) ? 12 : 0);
    return hours * 60 + Number(m[2]) <= now.getHours() * 60 + now.getMinutes();
  };

  async function confirm() {
    if (!selected || !slot || busy) return;
    setFailure(null);
    setBusy(true);
    const iso = [
      month.getFullYear(),
      String(month.getMonth() + 1).padStart(2, "0"),
      String(selected).padStart(2, "0"),
    ].join("-");

    const result = await addBooking({
      name: contact?.name?.trim() || "Website visitor",
      email: contact?.email?.trim() || "",
      company: contact?.company?.trim() || undefined,
      subject: contact?.subject || undefined,
      date: iso,
      time: slot,
    });
    setBusy(false);

    if (!result.ok) {
      setFailure(result.reason);
      return;
    }
    setBooked({ date: `${MONTHS[month.getMonth()]} ${selected}`, time: slot });
    setSelected(null);
    setSlot(null);
  }

  const grid = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const lead = first.getDay();
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ];
  }, [month]);

  const isPast = (day: number) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < start;
  };

  function shift(delta: number) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
    setSelected(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--ax-ink)]">
          {t.heading}
        </h3>
        <p className="text-[13px] text-[var(--ax-ink-muted)]">
          {t.intro}
        </p>
      </div>

      {/* Calendar */}
      {!mounted ? (
        <div className="h-[292px] rounded-2xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)]" aria-hidden />
      ) : (
      <div className="rounded-2xl border border-[var(--ax-line)] bg-[rgba(var(--ax-glow),0.04)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="ax-focus grid size-7 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
          >
            <Icon name="chevron-left" className="size-4" strokeWidth={2.2} />
          </button>

          <span className="text-[13.5px] font-semibold text-[var(--ax-ink)]">
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </span>

          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next month"
            className="ax-focus grid size-7 place-items-center rounded-lg text-[var(--ax-ink-muted)] transition-colors hover:bg-[rgba(var(--ax-glow),0.10)] hover:text-[var(--ax-ink)]"
          >
            <Icon name="chevron-right" className="size-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1">
          {DAY_LABELS.map((day) => (
            <span
              key={day}
              className="grid h-6 place-items-center text-[10.5px] font-medium text-[var(--ax-ink-dim)]"
            >
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, i) =>
            day === null ? (
              <span key={`pad-${i}`} />
            ) : (
              <button
                key={day}
                type="button"
                disabled={isPast(day)}
                onClick={() => setSelected(day)}
                className={cn(
                  "ax-focus grid h-8 place-items-center rounded-lg text-[12px] transition-colors duration-200",
                  isPast(day)
                    ? "cursor-not-allowed text-[var(--ax-ink-dim)] opacity-35"
                    : selected === day
                      ? "bg-[var(--ax-accent)] font-semibold text-white shadow-[0_6px_18px_-6px_rgba(var(--ax-glow),1)]"
                      : "text-[var(--ax-ink-muted)] hover:bg-[rgba(var(--ax-glow),0.12)] hover:text-[var(--ax-ink)]",
                )}
              >
                {day}
              </button>
            ),
          )}
        </div>
      </div>
      )}

      {/* Slots */}
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((time) => (
          <button
            key={time}
            type="button"
            disabled={mounted && isPastSlot(time)}
            onClick={() => setSlot(time)}
            className={cn(
              "ax-focus rounded-xl border px-2 py-2.5 text-[12px] font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35",
              slot === time
                ? "border-transparent bg-[var(--ax-accent)] text-white shadow-[0_10px_26px_-10px_rgba(var(--ax-glow),1)]"
                : "border-[var(--ax-line)] text-[var(--ax-ink-muted)] hover:border-[var(--ax-line-strong)] hover:text-[var(--ax-ink)]",
            )}
          >
            {time}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={confirm}
        disabled={!selected || !slot || busy || !canBook}
        className="ax-focus inline-flex items-center justify-center gap-2.5 rounded-xl border border-[var(--ax-line-strong)] px-5 py-3 text-[13.5px] font-semibold text-[var(--ax-ink)] transition-all duration-300 hover:bg-[rgba(var(--ax-glow),0.12)] disabled:pointer-events-none disabled:opacity-45"
      >
        <Icon name="calendar" className="size-4" strokeWidth={1.9} />
        {busy
          ? t.holding
          : selected && slot
            ? fill(t.buttonPicked, { date: `${MONTHS[month.getMonth()].slice(0, 3)} ${selected}`, time: slot })
            : t.button}
      </button>

      {selected && slot && !canBook && (
        <p className="text-[12px] leading-relaxed text-[var(--ax-ink-dim)]">
          {t.needDetails}
        </p>
      )}

      {failure && (
        <p className="flex items-start gap-2 rounded-xl border border-[var(--ax-danger)]/35 bg-[var(--ax-danger)]/10 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[var(--ax-danger)]">
          <Icon name="x" className="mt-0.5 size-4 shrink-0" strokeWidth={2.2} />
          {failure}
        </p>
      )}

      {booked && (
        <p className="flex items-start gap-2 rounded-xl border border-[var(--ax-success)]/35 bg-[var(--ax-success)]/10 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[var(--ax-success)]">
          <Icon name="check-circle" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {fill(t.held, { ...booked, email: contact?.email?.trim() ?? "" })}
        </p>
      )}
    </div>
  );
}
