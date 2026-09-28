"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/cms";
import { useCms } from "./CmsProvider";

/**
 * Keeps this browser wired for reminders.
 *
 * Two layers, both driven by the same bookings:
 *
 *  1. Web Push. Once reminders are on, the browser's push subscription is
 *     registered with the server, which sweeps the bookings every minute and
 *     pushes when a slot's lead time arrives — this is what reaches a device
 *     whose browser is closed.
 *  2. The worker's own timer, fed the upcoming schedule from here, which
 *     covers the time a portal tab is open on a network that blocks push.
 *     Both use the booking id as the notification tag, so a double never
 *     shows twice.
 */
export function Reminders() {
  const { state, ready, refreshAdmin } = useCms();

  // Register the worker once.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration is best-effort; the portal works without reminders */
    });
  }, []);

  // Subscribe this browser to push once reminders are on.
  useEffect(() => {
    if (!ready || !state.remindersEnabled) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") return;

    let cancelled = false;
    (async () => {
      const registration = await navigator.serviceWorker.ready;
      if (cancelled) return;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const { publicKey } = await api<{ publicKey: string }>("/api/admin/push");
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: toKey(publicKey),
        });
      }
      if (cancelled) return;
      await api("/api/admin/push", { method: "POST", body: { subscription: subscription.toJSON() } });
    })().catch(() => {
      /* no push on this browser or network; the timer below still runs */
    });

    return () => {
      cancelled = true;
    };
  }, [ready, state.remindersEnabled]);

  // Push the local schedule whenever the bookings change.
  useEffect(() => {
    if (!ready) return;
    if (!("serviceWorker" in navigator)) return;
    if (!state.remindersEnabled) return;

    let cancelled = false;

    navigator.serviceWorker.ready.then((registration) => {
      if (cancelled || !registration.active) return;

      const reminders = state.bookings
        .filter((b) => b.status === "pending" || b.status === "confirmed")
        .filter((b) => !b.remindedAt)
        .map((b) => {
          const fireAt = slotTime(b) - b.remindMinutes * 60_000;
          return {
            id: b.id,
            fireAt,
            title: `Demo with ${b.name} in ${b.remindMinutes} minutes`,
            body: [b.company, b.subject, `${b.date} at ${b.time}`].filter(Boolean).join(" · "),
            url: "/admin/bookings",
          };
        })
        // Anything already past its moment is not worth firing late.
        .filter((r) => r.fireAt > Date.now());

      registration.active.postMessage({ type: "SCHEDULE", reminders });
    });

    return () => {
      cancelled = true;
    };
  }, [ready, state.bookings, state.remindersEnabled]);

  // When the worker fires one, pull the server's view so it is not re-armed.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "REMINDER_FIRED") return;
      refreshAdmin().catch(() => undefined);
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [refreshAdmin]);

  return null;
}

/** VAPID public keys are base64url; the Push API wants raw bytes. */
function toKey(base64url: string): Uint8Array<ArrayBuffer> {
  const padded = base64url + "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** Parses "2026-09-30" + "10:00 AM" into a timestamp in the local zone. */
export function slotTime(booking: Pick<Booking, "date" | "time">): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(booking.time.trim());
  let hours = 9;
  let minutes = 0;

  if (match) {
    hours = Number(match[1]) % 12;
    minutes = Number(match[2]);
    if (/pm/i.test(match[3])) hours += 12;
  }

  const [y, m, d] = booking.date.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hours, minutes, 0, 0).getTime();
}
