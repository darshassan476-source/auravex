import { recoverInterruptedJobs, sweepWatches } from "./server/ai";
import { seedAdmin } from "./server/auth";
import { ensureSweeper } from "./server/push";

// Creates the admin account if there are no users yet, clears any AI job
// the last process left mid-flight, and starts the reminder sweep. All
// idempotent, so a hot reload is harmless. The database is remote, so a
// failure here is logged and retried by the first request, never fatal.
declare global {
  var __auravexWatchTimer: NodeJS.Timeout | undefined;
}

async function start() {
  await seedAdmin();
  await recoverInterruptedJobs();
}

start().catch((error) => console.error("[startup]", error));
ensureSweeper();

// Scheduled audits: checked every five minutes, and once shortly after boot.
if (!globalThis.__auravexWatchTimer) {
  const tick = async () => {
    try {
      await sweepWatches();
    } catch (error) {
      console.error("[ai] watch sweep failed", error);
    }
  };
  globalThis.__auravexWatchTimer = setInterval(tick, 5 * 60_000);
  globalThis.__auravexWatchTimer.unref?.();
  setTimeout(tick, 30_000).unref?.();
}
