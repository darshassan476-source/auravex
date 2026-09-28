import "server-only";
import dns from "node:dns";
import path from "node:path";
import { GridFSBucket, MongoClient, type Collection, type Db, type Document } from "mongodb";

/**
 * The database.
 *
 * MongoDB (Atlas) through the official driver. The client is opened once per
 * process and kept on `globalThis`, so hot reloads in development reuse the
 * connection pool instead of opening a new one on every edit.
 *
 * Documents keep the field names the SQLite tables used (snake_case), and a
 * record with a string id stores it both as `_id` and as `id`, so the row
 * mappers read a document exactly as they read a row. JSON blobs (settings
 * values, job steps, ...) stay JSON strings: CMS keys may contain dots, which
 * MongoDB field names do not handle well.
 *
 * Configure with MONGODB_URI (required) and MONGODB_DB (default "auravex").
 */

export const DATA_DIR = process.env.AURAVEX_DATA_DIR
  ? path.resolve(process.env.AURAVEX_DATA_DIR)
  : path.join(process.cwd(), "data");

/** A stored record. Fields are read defensively by the row mappers, as SQLite rows were. */
export interface Row extends Document {
  /** Records with an id keep it here too; visits and activity let the driver assign one. */
  _id?: string;
}

export type CollectionName =
  | "settings"
  | "media"
  | "visits"
  | "threads"
  | "messages"
  | "bookings"
  | "users"
  | "sessions"
  | "ai_jobs"
  | "push_subscriptions"
  | "activity"
  | "links"
  | "credentials"
  | "app_secrets"
  | "ai_watches";

interface Handle {
  client: MongoClient;
  db: Db;
}

declare global {
  var __auravexMongo: Promise<Handle> | undefined;
}

/**
 * Some local resolvers (VPN clients, DNS filters) refuse the SRV lookup a
 * `mongodb+srv://` address needs. MONGODB_DNS_SERVERS names resolvers to use
 * instead; without it, a refused lookup falls back to public resolvers once.
 */
async function prepareDns(uri: string) {
  const custom = process.env.MONGODB_DNS_SERVERS?.split(",").map((s) => s.trim()).filter(Boolean);
  if (custom?.length) {
    dns.setServers(custom);
    return;
  }
  if (!uri.startsWith("mongodb+srv://")) return;
  const host = new URL(uri.replace("mongodb+srv://", "https://")).hostname;
  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
  } catch {
    console.warn("[db] SRV lookup failed with the system resolver; retrying through 1.1.1.1 / 8.8.8.8.");
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  }
}

async function ensureIndexes(d: Db) {
  await Promise.all([
    d.collection("users").createIndex({ email: 1 }, { unique: true }),
    d.collection("sessions").createIndex({ user_id: 1 }),
    d.collection("sessions").createIndex({ expires_at: 1 }),
    d.collection("messages").createIndex({ thread_id: 1, at: 1 }),
    d.collection("visits").createIndex({ at: 1 }),
    d.collection("activity").createIndex({ at: -1 }),
    d.collection("push_subscriptions").createIndex({ endpoint: 1 }, { unique: true }),
    d.collection("ai_jobs").createIndex({ state: 1, created_at: 1 }),
    d.collection("ai_jobs").createIndex({ created_at: -1 }),
    d.collection("settings").createIndex({ updated_at: -1 }),
    d.collection("bookings").createIndex({ date: 1, time: 1 }),
    d.collection("threads").createIndex({ created_at: -1 }),
  ]);
}

async function connect(): Promise<Handle> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add your Atlas connection string to .env.local.");
  await prepareDns(uri);
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20_000 });
  await client.connect();
  const handle = { client, db: client.db(process.env.MONGODB_DB || "auravex") };
  await ensureIndexes(handle.db);
  return handle;
}

/** The database handle, connecting on first use. A failed connect is retried on the next call. */
export async function database(): Promise<Db> {
  if (!globalThis.__auravexMongo) {
    globalThis.__auravexMongo = connect().catch((error) => {
      globalThis.__auravexMongo = undefined;
      throw error;
    });
  }
  return (await globalThis.__auravexMongo).db;
}

export async function col<T extends Document = Row>(name: CollectionName): Promise<Collection<T>> {
  return (await database()).collection<T>(name);
}

/** Uploaded media bytes live in GridFS, next to the `media` metadata collection. */
export async function mediaBucket() {
  return new GridFSBucket(await database(), { bucketName: "media_files" });
}

/* ---------------- Activity log ---------------- */

export type ActivityKind = "create" | "update" | "delete" | "publish" | "login";

/** One line in the portal's activity log: "<actor> <action> <target>". */
export async function logActivity(actor: string, kind: ActivityKind, action: string, target: string) {
  await (await col("activity")).insertOne({ at: now(), actor, kind, action, target: target.slice(0, 200) });
}

/* ---------------- Small conveniences ---------------- */

export const now = () => new Date().toISOString();

export function uid(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

/** Flags are stored as 0/1, as they were in SQLite, so every reader stays the same. */
export const bool = (v: boolean | undefined | null) => (v ? 1 : 0);

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await (await col("settings")).findOne({ _id: key });
  if (!row) return fallback;
  try {
    return JSON.parse(String(row.value)) as T;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: unknown) {
  await (await col("settings")).updateOne(
    { _id: key },
    { $set: { key, value: JSON.stringify(value), updated_at: now() } },
    { upsert: true },
  );
}

export async function deleteSetting(key: string) {
  await (await col("settings")).deleteOne({ _id: key });
}

export async function allSettings(): Promise<Record<string, unknown>> {
  const rows = await (await col("settings")).find({}).toArray();
  const out: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      out[String(row.key ?? row._id)] = JSON.parse(String(row.value));
    } catch {
      /* skip a corrupt row rather than fail the whole read */
    }
  }
  return out;
}
