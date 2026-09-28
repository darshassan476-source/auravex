/**
 * One-off copy of the old SQLite store (data/auravex.db + data/media) into
 * MongoDB. Safe to run more than once: every record is upserted under a
 * stable _id, and a media file already in GridFS is not uploaded again.
 *
 *   node scripts/migrate-sqlite-to-mongo.mjs
 *
 * Reads MONGODB_URI / MONGODB_DB (and AURAVEX_DATA_DIR) from the environment,
 * falling back to .env.local and .env in the project folder.
 */
import dns from "node:dns";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { GridFSBucket, MongoClient } from "mongodb";

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set (looked in the environment, .env.local and .env).");
  process.exit(1);
}
const dataDir = process.env.AURAVEX_DATA_DIR ? path.resolve(process.env.AURAVEX_DATA_DIR) : path.join(process.cwd(), "data");
const dbFile = path.join(dataDir, "auravex.db");
if (!existsSync(dbFile)) {
  console.error(`No SQLite database at ${dbFile}; nothing to migrate.`);
  process.exit(1);
}

// The same SRV fallback the app uses, for resolvers that refuse SRV lookups.
if (process.env.MONGODB_DNS_SERVERS) {
  dns.setServers(process.env.MONGODB_DNS_SERVERS.split(",").map((s) => s.trim()));
} else if (uri.startsWith("mongodb+srv://")) {
  const host = new URL(uri.replace("mongodb+srv://", "https://")).hostname;
  await dns.promises.resolveSrv(`_mongodb._tcp.${host}`).catch(() => dns.setServers(["1.1.1.1", "8.8.8.8"]));
}

const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
const sqlite = new DatabaseSync(dbFile);

/** Tables keyed by a string id: stored with _id = id, as the app expects. */
const KEYED = [
  "settings:key",
  "media:id",
  "threads:id",
  "messages:id",
  "bookings:id",
  "users:id",
  "sessions:id",
  "ai_jobs:id",
  "push_subscriptions:id",
  "links:id",
  "credentials:id",
  "app_secrets:key",
  "ai_watches:id",
];
/** Tables with an autoincrement id: given a stable string _id so a re-run does not duplicate them. */
const COUNTED = ["visits", "activity"];

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20_000 });
await client.connect();
const mongo = client.db(process.env.MONGODB_DB || "auravex");
console.log(`Connected to MongoDB database "${mongo.databaseName}". Copying from ${dbFile}\n`);

const tables = new Set(sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((r) => r.name));
const plain = (row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : v]));

async function copy(table, idOf) {
  if (!tables.has(table)) {
    console.log(`  ${table.padEnd(20)} (no table)`);
    return;
  }
  const rows = sqlite.prepare(`SELECT * FROM ${table}`).all().map(plain);
  if (rows.length) {
    await mongo.collection(table).bulkWrite(
      rows.map((row) => {
        const _id = idOf(row);
        return { replaceOne: { filter: { _id }, replacement: { _id, ...row }, upsert: true } };
      }),
      { ordered: false },
    );
  }
  console.log(`  ${table.padEnd(20)} ${rows.length}`);
}

for (const spec of KEYED) {
  const [table, key] = spec.split(":");
  await copy(table, (row) => String(row[key]));
}
for (const table of COUNTED) {
  await copy(table, (row) => `${table}-${row.id}`);
}

// Uploaded files: disk → GridFS, under the same file name the record keeps.
const mediaDir = path.join(dataDir, "media");
const bucket = new GridFSBucket(mongo, { bucketName: "media_files" });
let uploaded = 0;
let missing = 0;
for (const row of tables.has("media") ? sqlite.prepare("SELECT id, file, mime FROM media").all() : []) {
  const file = String(row.file);
  if (await bucket.find({ filename: file }).limit(1).next()) continue;
  const full = path.join(mediaDir, file);
  if (!existsSync(full)) {
    missing += 1;
    console.warn(`  ! media ${row.id}: ${full} is missing on disk`);
    continue;
  }
  await new Promise((resolve, reject) => {
    const upload = bucket.openUploadStream(file, { metadata: { mediaId: String(row.id), mime: String(row.mime) } });
    upload.once("finish", resolve);
    upload.once("error", reject);
    upload.end(readFileSync(full));
  });
  uploaded += 1;
}
console.log(`  ${"media files".padEnd(20)} ${uploaded} uploaded${missing ? `, ${missing} missing` : ""}`);

sqlite.close();
await client.close();
console.log("\nDone. The app now reads everything from MongoDB; data/auravex.db is no longer used.");
