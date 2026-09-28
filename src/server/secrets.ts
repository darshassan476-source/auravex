import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./db";

/**
 * Sealed storage for the credentials the browser agent signs in with.
 *
 * AES-256-GCM under a key that is either derived from AURAVEX_SECRET or
 * generated once and kept in `data/secret.key`. The model never receives a
 * secret: it asks for a field by name and the browser types the value.
 */

let cached: Buffer | null = null;

function masterKey(): Buffer {
  if (cached) return cached;
  const env = process.env.AURAVEX_SECRET;
  if (env) {
    cached = scryptSync(env, "auravex-credentials", 32);
    return cached;
  }
  const file = path.join(DATA_DIR, "secret.key");
  if (existsSync(file)) {
    cached = Buffer.from(readFileSync(file, "utf8").trim(), "hex");
    return cached;
  }
  mkdirSync(DATA_DIR, { recursive: true });
  const key = randomBytes(32);
  writeFileSync(file, key.toString("hex"), { mode: 0o600 });
  cached = key;
  return key;
}

export function seal(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${body.toString("base64url")}`;
}

export function unseal(sealed: string): string {
  const [version, iv, tag, body] = sealed.split(":");
  if (version !== "v1" || !iv || !tag || !body) throw new Error("Unreadable sealed value.");
  const decipher = createDecipheriv("aes-256-gcm", masterKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
}

/**
 * Reads a credentials file in any of the usual shapes — JSON, `.env` lines,
 * `key: value` or `key = value` lines — into a flat set of named fields.
 */
export function parseCredentialFile(text: string): Record<string, string> {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed)
          .filter(([, v]) => typeof v === "string" || typeof v === "number")
          .map(([k, v]) => [k.trim(), String(v)]),
      );
    } catch {
      /* fall through to line parsing */
    }
  }
  const fields: Record<string, string> = {};
  for (const raw of trimmed.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const m = /^(?:export\s+)?([A-Za-z0-9_.\- ]+?)\s*[:=]\s*(.*)$/.exec(line);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fields[m[1].trim()] = value;
  }
  return fields;
}

/** The names a field is likely to be: helps the agent pick username vs password. */
export function classifyField(name: string): "username" | "password" | "url" | "code" | "other" {
  const n = name.toLowerCase();
  if (/pass|pwd|secret/.test(n)) return "password";
  if (/user|email|login|account|name/.test(n)) return "username";
  if (/url|host|site|domain|link/.test(n)) return "url";
  if (/otp|code|token|2fa|totp/.test(n)) return "code";
  return "other";
}
