import { currentUser, demoAccountActive, seedAdmin } from "@/server/auth";
import { guarded, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Who this browser is. `demo` tells the login screen whether the seeded
 * demo password is still in force, so it can offer it — and stop offering
 * it the moment the password is changed.
 */
export const GET = guarded(async () => {
  await seedAdmin();
  const user = await currentUser();
  // Not being signed in is an answer, not an error: the login page asks this on every visit.
  if (!user) return json({ user: null, demo: await demoAccountActive() });
  return json({ user });
});
