/**
 * AURAVEX reminder worker.
 *
 * Holds the booking schedule and raises a notification when a slot is close,
 * so a reminder still arrives after the tab has been closed — a service worker
 * outlives its pages.
 *
 * Two sources feed it. The page posts the upcoming schedule, which the timer
 * below fires while a portal tab keeps this worker alive; and the server
 * sends Web Push messages, which wake the worker even when every tab is
 * closed. Both use the booking id as the notification tag, so a reminder
 * that arrives twice shows once.
 */

const CHECK_MS = 30_000;
/** id -> { title, body, fireAt } */
let schedule = new Map();
let timer = null;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SCHEDULE") {
    schedule = new Map(
      (data.reminders || []).map((r) => [r.id, r]),
    );
    start();
  }

  if (data.type === "CLEAR") {
    schedule = new Map();
    stop();
  }
});

function start() {
  if (timer) return;
  timer = setInterval(sweep, CHECK_MS);
  sweep();
}

function stop() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}

async function sweep() {
  const now = Date.now();
  const due = [];

  schedule.forEach((reminder, id) => {
    if (reminder.fireAt <= now) {
      due.push(reminder);
      schedule.delete(id);
    }
  });

  for (const reminder of due) {
    await self.registration.showNotification(reminder.title, {
      body: reminder.body,
      tag: reminder.id,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      requireInteraction: true,
      data: { url: reminder.url || "/admin/bookings" },
    });

    // Tell any open page so it can mark the booking as reminded.
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach((client) =>
      client.postMessage({ type: "REMINDER_FIRED", id: reminder.id }),
    );
  }

  if (schedule.size === 0) stop();
}

/** Web Push from the server: the payload is the notification, ready to show. */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "AURAVEX", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "AURAVEX";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      tag: payload.tag || undefined,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      requireInteraction: true,
      data: { url: payload.url || "/admin/bookings" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin/bookings";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Reuse an open portal tab rather than piling up new ones.
      for (const client of clients) {
        if (client.url.includes("/admin") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
