/**
 * Runs once when the server starts. The Node-only work lives in a separate
 * module so the edge compiler, which also compiles this file, never sees it:
 * the import must sit inside the runtime check, because the bundler drops a
 * dead `if` block but not code after an early return. `next build` spawns
 * Node workers too; they must not create a database. A frontend-only
 * deployment (AURAVEX_BACKEND_URL set) has no database and runs no jobs.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build" && !process.env.AURAVEX_BACKEND_URL) {
    await import("./instrumentation-node");
  }
}
