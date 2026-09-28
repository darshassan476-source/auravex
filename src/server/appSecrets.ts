import "server-only";
import { col, now } from "./db";
import { seal, unseal } from "./secrets";

/**
 * Settings that are secrets: the mail server's password and the model's API
 * key. Typed into the portal, sealed in the database, read back only on the
 * server. The environment still works as a fallback, so nothing that was
 * configured in .env stops working.
 */

export async function getSecret(key: string): Promise<string | null> {
  const row = await (await col("app_secrets")).findOne({ _id: key });
  if (!row) return null;
  try {
    return unseal(String(row.sealed));
  } catch {
    return null;
  }
}

export async function setSecret(key: string, value: string | null) {
  const secrets = await col("app_secrets");
  if (value === null || value === "") {
    await secrets.deleteOne({ _id: key });
    return;
  }
  await secrets.updateOne(
    { _id: key },
    { $set: { key, sealed: seal(value), updated_at: now() } },
    { upsert: true },
  );
}

/* ---------------- Mail ---------------- */

export interface MailSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  /** Where the operator's own notifications go. */
  adminEmail: string;
  hasPassword: boolean;
  /** Where the live values come from. */
  source: "portal" | "env" | "none";
}

const MAIL_KEY = "mail";

async function readMailRecord(): Promise<Partial<MailSettings & { pass: string }> | null> {
  const raw = await getSecret(MAIL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<MailSettings & { pass: string }>;
  } catch {
    return null;
  }
}

/** The mail settings in force: the portal's, else the environment's. The password stays server-side. */
export async function mailSettings(): Promise<MailSettings & { pass: string }> {
  const stored = await readMailRecord();
  if (stored?.host) {
    return {
      host: String(stored.host),
      port: Number(stored.port) || 587,
      secure: Boolean(stored.secure),
      user: String(stored.user ?? ""),
      pass: String(stored.pass ?? ""),
      from: String(stored.from ?? ""),
      adminEmail: String(stored.adminEmail ?? process.env.ADMIN_EMAIL ?? ""),
      hasPassword: Boolean(stored.pass),
      source: "portal",
    };
  }
  const host = process.env.SMTP_HOST ?? "";
  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "",
    adminEmail: String(stored?.adminEmail ?? process.env.ADMIN_EMAIL ?? ""),
    hasPassword: Boolean(process.env.SMTP_PASS),
    source: host ? "env" : "none",
  };
}

export async function saveMailSettings(input: { host: string; port: number; secure: boolean; user: string; pass?: string; from: string; adminEmail: string }) {
  const previous = await readMailRecord();
  const record = {
    host: input.host.trim(),
    port: input.port,
    secure: input.secure,
    user: input.user.trim(),
    // A blank password keeps the one already stored; the form never shows it.
    pass: input.pass !== undefined && input.pass !== "" ? input.pass : String(previous?.pass ?? ""),
    from: input.from.trim(),
    adminEmail: input.adminEmail.trim(),
  };
  if (!record.host && !record.adminEmail) {
    await setSecret(MAIL_KEY, null);
    return;
  }
  await setSecret(MAIL_KEY, JSON.stringify(record));
}

/* ---------------- The model's key ---------------- */

const AI_KEY = "anthropic";

/** The API key in force: the portal's, else the environment's. */
export async function aiKey(): Promise<string | null> {
  return (await getSecret(AI_KEY)) || process.env.ANTHROPIC_API_KEY || null;
}

export async function aiKeySource(): Promise<"portal" | "env" | "none"> {
  if (await getSecret(AI_KEY)) return "portal";
  if (process.env.ANTHROPIC_API_KEY) return "env";
  return "none";
}

export async function saveAiKey(key: string | null) {
  await setSecret(AI_KEY, key ? key.trim() : null);
}
