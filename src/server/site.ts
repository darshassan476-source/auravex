import "server-only";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { PRODUCTS } from "@/data/products";
import {
  EMPTY_CMS,
  type CmsState,
  type ManagedLink,
  type MediaItem,
} from "@/lib/cms";
import type { LeadStatus, Product } from "@/lib/types";
import {
  allSettings,
  bool,
  col,
  deleteSetting,
  getSetting,
  mediaBucket,
  now,
  setSetting,
  uid,
  type Row,
} from "./db";

/**
 * The site's content, as the public bundle and as the admin's writable view.
 *
 * Everything the portal edits lives in the `settings` collection as JSON, one
 * document per top-level key, so a write touches only the key that changed. The shape
 * handed to the client is exactly the `CmsState` the front end already uses —
 * the store simply moved from the browser to here.
 */

/** Keys the portal may write through /api/admin/settings. Nothing else. */
export const SETTING_KEYS = [
  "text",
  "backgrounds",
  "palette",
  "portalPalette",
  "products",
  "customProducts",
  "caseStudies",
  "blocks",
  "logoId",
  "heroImageId",
  "remindersEnabled",
  "customThemes",
  "siteTheme",
  "portalTheme",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export function mediaFromRow(row: Row): MediaItem {
  const id = String(row.id);
  return {
    id,
    name: String(row.name),
    src: `/api/media/${id}`,
    mime: String(row.mime ?? "image/jpeg"),
    width: Number(row.width),
    height: Number(row.height),
    size: Number(row.size),
    addedAt: String(row.created_at),
  };
}

export async function listMedia(): Promise<MediaItem[]> {
  const rows = await (await col("media"))
    .find({}, { projection: { file: 0 } })
    .sort({ created_at: -1 })
    .toArray();
  return rows.map(mediaFromRow);
}

/** What a visitor's browser receives: content and media, never the inbox. */
export async function publicBundle(): Promise<
  Omit<CmsState, "visits" | "threads" | "bookings">
> {
  const [stored, media, updatedAt] = await Promise.all([
    allSettings(),
    listMedia(),
    latestUpdate(),
  ]);
  const pick = <K extends SettingKey>(key: K) =>
    (stored[key] as CmsState[K] | undefined) ?? EMPTY_CMS[key];

  return {
    version: EMPTY_CMS.version,
    text: pick("text"),
    backgrounds: pick("backgrounds"),
    palette: pick("palette"),
    portalPalette: pick("portalPalette"),
    products: pick("products"),
    customProducts: pick("customProducts"),
    caseStudies: pick("caseStudies"),
    blocks: pick("blocks"),
    logoId: stored.logoId as string | undefined,
    customThemes: pick("customThemes"),
    siteTheme: stored.siteTheme as string | undefined,
    portalTheme: stored.portalTheme as string | undefined,
    heroImageId: stored.heroImageId as string | undefined,
    remindersEnabled: Boolean(stored.remindersEnabled),
    media,
    updatedAt,
  };
}

/** A product created in the portal, for the server-rendered product page. */
export async function findCustomProduct(slug: string): Promise<Product | undefined> {
  const list = await getSetting<unknown>("customProducts", []);
  if (!Array.isArray(list)) return undefined;
  return (list as Product[]).find((p) => p && p.slug === slug);
}

/** Every product the site knows: bundled first, then the portal's own. */
export async function fullCatalogue(): Promise<Product[]> {
  const list = await getSetting<unknown>("customProducts", []);
  return [...PRODUCTS, ...(Array.isArray(list) ? (list as Product[]) : [])];
}

/** When the site's content last changed; every rendered page carries this stamp. */
export async function latestUpdate(): Promise<string | null> {
  const row = await (await col("settings"))
    .find({}, { projection: { updated_at: 1 } })
    .sort({ updated_at: -1 })
    .limit(1)
    .next();
  return row?.updated_at ? String(row.updated_at) : null;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * What each key must look like before it is stored. A value that does not
 * fit is refused with the key named, so a bad client cannot leave the public
 * bundle in a shape the site cannot render.
 */
const GUARDS: Record<SettingKey, (v: unknown) => boolean> = {
  text: (v) =>
    isRecord(v) &&
    Object.values(v).every((s) => typeof s === "string" && s.length <= 20_000),
  backgrounds: (v) =>
    isRecord(v) &&
    Object.values(v).every(
      (c) =>
        isRecord(c) &&
        ((c.kind === "plate" && typeof c.id === "string") ||
          (c.kind === "media" && typeof c.mediaId === "string")),
    ),
  palette: (v) =>
    isRecord(v) &&
    Object.values(v).every((s) => typeof s === "string" && s.length <= 64),
  portalPalette: (v) =>
    isRecord(v) &&
    Object.values(v).every((s) => typeof s === "string" && s.length <= 64),
  products: (v) => isRecord(v) && Object.values(v).every(isRecord),
  customProducts: (v) =>
    Array.isArray(v) &&
    v.length <= 200 &&
    v.every(
      (p) =>
        isRecord(p) &&
        typeof p.slug === "string" &&
        /^[a-z0-9-]{1,80}$/.test(p.slug) &&
        typeof p.name === "string",
    ),
  caseStudies: (v) => isRecord(v) && Object.values(v).every(isRecord),
  blocks: (v) =>
    isRecord(v) &&
    Object.values(v).every(
      (list) =>
        Array.isArray(list) &&
        list.every(
          (b) =>
            isRecord(b) &&
            typeof b.id === "string" &&
            typeof b.type === "string" &&
            typeof b.slot === "string",
        ),
    ),
  logoId: (v) => typeof v === "string" && v.length <= 64,
  heroImageId: (v) => typeof v === "string" && v.length <= 64,
  remindersEnabled: (v) => typeof v === "boolean",
  customThemes: (v) =>
    Array.isArray(v) &&
    v.length <= 24 &&
    v.every(
      (t) =>
        isRecord(t) &&
        typeof t.id === "string" &&
        t.id.length <= 40 &&
        typeof t.name === "string" &&
        t.name.length <= 40 &&
        (t.mode === "dark" || t.mode === "light") &&
        typeof t.base === "string" &&
        t.base.length <= 40 &&
        isRecord(t.palette) &&
        Object.values(t.palette).every(
          (s) => typeof s === "string" && s.length <= 64,
        ),
    ),
  siteTheme: (v) => typeof v === "string" && v.length <= 64,
  portalTheme: (v) => typeof v === "string" && v.length <= 64,
};

/**
 * Applies a partial settings patch. Unknown keys are ignored; a known key
 * with the wrong shape throws a 400 naming it, and nothing is written.
 */
export async function applySettings(patch: Record<string, unknown>) {
  const writes: { key: SettingKey; value: unknown }[] = [];
  for (const key of SETTING_KEYS) {
    if (!(key in patch)) continue;
    const value = patch[key];
    // `undefined`/`null` mean "clear"; otherwise the value must fit its guard.
    if (value !== undefined && value !== null && !GUARDS[key](value)) {
      throw new Response(
        JSON.stringify({
          error: `The value for "${key}" is not in the expected shape.`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    writes.push({ key, value });
  }
  for (const { key, value } of writes) {
    if (value === undefined || value === null) await deleteSetting(key);
    else await setSetting(key, value);
  }
  return writes.map((w) => w.key);
}

/* ---------------- Media files ---------------- */

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/mp4": "m4a",
};

/**
 * The image type according to the bytes, not the upload's own claim.
 * Returns null for anything that is not one of the six types served.
 */
export function sniffImage(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (bytes.subarray(0, 4).toString("latin1") === "GIF8") return "image/gif";
  if (
    bytes.subarray(0, 4).toString("latin1") === "RIFF" &&
    bytes.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes.subarray(4, 8).toString("latin1") === "ftyp") {
    const brand = bytes.subarray(8, 12).toString("latin1");
    if (brand === "avif" || brand === "avis") return "image/avif";
    if (brand === "M4A ") return "audio/mp4";
    return "video/mp4";
  }
  if (
    bytes.subarray(0, 3).toString("latin1") === "ID3" ||
    (bytes[0] === 0xff && (bytes[1] & 0xe6) === 0xe2)
  )
    return "audio/mpeg";
  if (
    bytes.subarray(0, 4).toString("latin1") === "RIFF" &&
    bytes.subarray(8, 12).toString("latin1") === "WAVE"
  )
    return "audio/wav";
  const head = bytes.subarray(0, 2048).toString("utf8");
  if (
    /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(
      head,
    )
  )
    return "image/svg+xml";
  return null;
}

/**
 * Stores the bytes in GridFS and the metadata in `media`. The GridFS file is
 * named `<id>.<ext>` and its name is kept in `file`, as the disk name was.
 */
export async function saveMedia(input: {
  name: string;
  mime: string;
  bytes: Buffer;
  width: number;
  height: number;
}): Promise<MediaItem> {
  const ext = EXT[input.mime] ?? "bin";
  const id = uid("m");
  const file = `${id}.${ext}`;
  const addedAt = now();

  const bucket = await mediaBucket();
  await new Promise<void>((resolve, reject) => {
    const upload = bucket.openUploadStream(file, { metadata: { mediaId: id, mime: input.mime } });
    upload.once("finish", () => resolve());
    upload.once("error", reject);
    upload.end(input.bytes);
  });

  await (await col("media")).insertOne({
    _id: id,
    id,
    name: input.name,
    mime: input.mime,
    width: input.width,
    height: input.height,
    size: input.bytes.length,
    file,
    created_at: addedAt,
  });

  return {
    id,
    name: input.name,
    src: `/api/media/${id}`,
    mime: input.mime,
    width: input.width,
    height: input.height,
    size: input.bytes.length,
    addedAt,
  };
}

export interface StoredMedia {
  mime: string;
  size: number;
  /** A byte range of the file, end inclusive, as a web stream. */
  stream(start: number, end: number): ReadableStream;
}

async function gridFile(file: string) {
  const bucket = await mediaBucket();
  const found = await bucket.find({ filename: file }).sort({ uploadDate: -1 }).limit(1).next();
  return found ? { bucket, found } : null;
}

/** An uploaded file, ready to stream. Null when the record or its bytes are gone. */
export async function mediaFile(id: string): Promise<StoredMedia | null> {
  const row = await (await col("media")).findOne({ _id: id });
  if (!row) return null;
  const grid = await gridFile(String(row.file));
  if (!grid) return null;
  return {
    mime: String(row.mime),
    size: grid.found.length,
    stream: (start, end) =>
      Readable.toWeb(
        // GridFS takes an exclusive end.
        grid.bucket.openDownloadStream(grid.found._id, { start, end: end + 1 }),
      ) as ReadableStream,
  };
}

/** The whole file in memory — for inlining small images, not for serving video. */
export async function mediaBytes(id: string): Promise<{ mime: string; bytes: Buffer } | null> {
  const file = await mediaFile(id);
  if (!file) return null;
  if (file.size === 0) return { mime: file.mime, bytes: Buffer.alloc(0) };
  const chunks: Buffer[] = [];
  const reader = file.stream(0, file.size - 1).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
  }
  return { mime: file.mime, bytes: Buffer.concat(chunks) };
}

/**
 * A copy of the file on local disk, for tools that need a path (ffmpeg).
 * Cached under the OS temp directory by id, since ids never change content.
 */
export async function mediaLocalPath(id: string): Promise<string | undefined> {
  const row = await (await col("media")).findOne({ _id: id });
  if (!row) return undefined;
  const dir = path.join(os.tmpdir(), "auravex-media");
  const full = path.join(dir, String(row.file));
  if (existsSync(full)) return full;
  const data = await mediaBytes(id);
  if (!data) return undefined;
  mkdirSync(dir, { recursive: true });
  writeFileSync(full, data.bytes);
  return full;
}

/**
 * Removes the file, the record, and every reference to it in settings, so
 * nothing on the site is left pointing at an image that no longer exists.
 */
export async function deleteMedia(id: string) {
  const media = await col("media");
  const row = await media.findOne({ _id: id });
  if (!row) return false;

  const bucket = await mediaBucket();
  for await (const f of bucket.find({ filename: String(row.file) })) {
    await bucket.delete(f._id);
  }
  await media.deleteOne({ _id: id });

  const stored = await allSettings();
  const patch: Record<string, unknown> = {};

  if (stored.logoId === id) patch.logoId = null;
  if (stored.heroImageId === id) patch.heroImageId = null;

  // Each block is read defensively: a stored value that is not the expected
  // shape is left alone rather than allowed to throw mid-delete.
  const backgrounds = isRecord(stored.backgrounds)
    ? (stored.backgrounds as Record<
        string,
        { kind?: string; mediaId?: string }
      >)
    : {};
  const cleanedBg = Object.fromEntries(
    Object.entries(backgrounds).filter(
      ([, c]) => !(isRecord(c) && c.kind === "media" && c.mediaId === id),
    ),
  );
  if (Object.keys(cleanedBg).length !== Object.keys(backgrounds).length)
    patch.backgrounds = cleanedBg;

  const products = isRecord(stored.products)
    ? (stored.products as Record<
        string,
        {
          imageId?: string;
          imageIds?: string[];
          videoId?: string;
          posterId?: string;
        }
      >)
    : {};
  let touchedProducts = false;
  const cleanedProducts = Object.fromEntries(
    Object.entries(products).map(([slug, p]) => {
      if (!isRecord(p)) return [slug, p];
      const next = { ...p };
      for (const field of ["imageId", "videoId", "posterId"] as const) {
        if (next[field] === id) {
          touchedProducts = true;
          next[field] = undefined;
        }
      }
      if (Array.isArray(next.imageIds) && next.imageIds.includes(id)) {
        touchedProducts = true;
        next.imageIds = next.imageIds.filter((m) => m !== id);
      }
      return [slug, next];
    }),
  );
  if (touchedProducts) patch.products = cleanedProducts;

  const blocks = isRecord(stored.blocks)
    ? (stored.blocks as Record<string, { mediaId?: string }[]>)
    : {};
  let touchedBlocks = false;
  const cleanedBlocks = Object.fromEntries(
    Object.entries(blocks).map(([page, list]) => [
      page,
      (Array.isArray(list) ? list : []).map((b) => {
        if (isRecord(b) && b.mediaId === id) {
          touchedBlocks = true;
          return { ...b, mediaId: undefined };
        }
        return b;
      }),
    ]),
  );
  if (touchedBlocks) patch.blocks = cleanedBlocks;

  if (Object.keys(patch).length) await applySettings(patch);
  return true;
}

/* ---------------- Bookings & threads helpers shared by routes ---------------- */

export function bookingFromRow(row: Row) {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    company: row.company ? String(row.company) : undefined,
    subject: row.subject ? String(row.subject) : undefined,
    date: String(row.date),
    time: String(row.time),
    status: String(row.status) as
      "pending" | "confirmed" | "done" | "cancelled",
    notes: row.notes ? String(row.notes) : undefined,
    remindMinutes: Number(row.remind_minutes),
    remindedAt: row.reminded_at ? String(row.reminded_at) : undefined,
    createdAt: String(row.created_at),
  };
}

/** A thread with its messages. Pass several rows to `threadsFromRows` to fetch messages in one query. */
export async function threadFromRow(row: Row) {
  return (await threadsFromRows([row]))[0];
}

export async function threadsFromRows(rows: Row[]) {
  const ids = rows.map((r) => String(r.id));
  const all = await (await col("messages"))
    .find({ thread_id: { $in: ids } })
    .sort({ at: 1 })
    .toArray();
  const byThread = new Map<string, Row[]>();
  for (const m of all) {
    const key = String(m.thread_id);
    byThread.set(key, [...(byThread.get(key) ?? []), m]);
  }
  return rows.map((row) => threadShape(row, byThread.get(String(row.id)) ?? []));
}

function threadShape(row: Row, rawMessages: Row[]) {
  const messages = rawMessages
    .map((m) => ({
      id: String(m.id),
      from: String(m.sender) as "them" | "me",
      body: String(m.body),
      at: String(m.at),
    }));

  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    company: row.company ? String(row.company) : undefined,
    subject: row.subject ? String(row.subject) : undefined,
    unread: Number(row.unread) === 1,
    archived: Number(row.archived) === 1,
    status: String(row.status || "new") as LeadStatus,
    createdAt: String(row.created_at),
    messages,
  };
}

/* ---------------- Tracked links ---------------- */

export function linkFromRow(row: Row): ManagedLink {
  return {
    id: String(row.id),
    label: String(row.label),
    url: String(row.url),
    group: String(row.grp),
    clicks: Number(row.clicks),
    createdAt: String(row.created_at),
  };
}

export async function listLinks(): Promise<ManagedLink[]> {
  const rows = await (await col("links")).find({}).sort({ grp: 1, created_at: 1 }).toArray();
  return rows.map(linkFromRow);
}

export { bool };
