import { aiKey, aiKeySource, mailSettings, saveAiKey, saveMailSettings } from "@/server/appSecrets";
import { logActivity } from "@/server/db";
import { fail, isEmail, json, readJson, str, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function view() {
  const [m, key, source] = await Promise.all([mailSettings(), aiKey(), aiKeySource()]);
  return {
    mail: { host: m.host, port: m.port, secure: m.secure, user: m.user, from: m.from, adminEmail: m.adminEmail, hasPassword: m.hasPassword, source: m.source },
    ai: { hasKey: Boolean(key), source, hint: key ? `…${key.slice(-4)}` : "" },
  };
}

/** What is connected, without the secrets themselves. */
export const GET = withUser(async () => json(await view()));

/** Saves the mail server and/or the model key. A blank password or key keeps what is stored. */
export const PUT = withUser(async (request, user) => {
  const body = await readJson<{ mail?: Record<string, unknown>; aiKey?: unknown; clearAiKey?: unknown }>(request, 10_000);
  if (body.mail && typeof body.mail === "object") {
    const m = body.mail;
    const host = str(m.host, 200);
    const adminEmail = str(m.adminEmail, 200);
    const from = str(m.from, 200);
    if (adminEmail && !isEmail(adminEmail)) return fail(400, "The notification address is not a valid email.");
    if (from && !/^[^<>]*<?[^\s<>@]+@[^\s<>@]+>?$/.test(from)) return fail(400, "The From address is not a valid email.");
    const port = Math.min(65535, Math.max(1, Math.round(Number(m.port) || 587)));
    await saveMailSettings({ host, port, secure: Boolean(m.secure), user: str(m.user, 200), pass: typeof m.pass === "string" ? m.pass.slice(0, 500) : undefined, from, adminEmail });
    await logActivity(user.name, "update", "changed the mail settings", host || "cleared");
  }
  if (body.clearAiKey === true) {
    await saveAiKey(null);
    await logActivity(user.name, "update", "removed the model key", "AI Studio");
  } else if (typeof body.aiKey === "string" && body.aiKey.trim()) {
    const key = body.aiKey.trim();
    if (key.length < 20 || key.length > 300 || /\s/.test(key)) return fail(400, "That does not look like an API key.");
    await saveAiKey(key);
    await logActivity(user.name, "update", "set the model key", "AI Studio");
  }
  return json(await view());
});
