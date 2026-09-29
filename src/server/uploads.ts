import "server-only";
import { randomBytes } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, rmSync, statSync, writeFileSync, appendFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { MediaItem } from "@/lib/cms";
import { saveMediaFile, sniffImage } from "./site";

/**
 * Uploads too big for one request, sent as a run of chunks.
 *
 * The public site reaches this server through Netlify, which refuses any
 * request over 8 MB, so a video is sent in pieces well under that. Pieces are
 * appended to a file in the temp directory in order; the finished file is
 * checked by its bytes and streamed into GridFS, never held in memory whole.
 * An upload left unfinished is swept after a day.
 */

/** Small enough that one piece lands quickly even on a slow uplink. */
export const CHUNK_BYTES = 2 * 1024 * 1024;
export const MAX_UPLOAD = 120 * 1024 * 1024;
/** Chunked uploads are for films and music beds; images go through the ordinary route. */
const ALLOWED = new Set(["video/mp4", "audio/mpeg", "audio/wav", "audio/mp4"]);
const STALE_MS = 24 * 60 * 60_000;

const DIR = path.join(os.tmpdir(), "auravex-uploads");

interface Session {
  name: string;
  size: number;
  received: number;
  next: number;
  startedAt: number;
}

const metaPath = (id: string) => path.join(DIR, `${id}.json`);
const dataPath = (id: string) => path.join(DIR, `${id}.part`);

function read(id: string): Session | null {
  if (!/^[a-f0-9]{24}$/.test(id) || !existsSync(metaPath(id))) return null;
  return JSON.parse(readFileSync(metaPath(id), "utf8")) as Session;
}

function write(id: string, session: Session) {
  writeFileSync(metaPath(id), JSON.stringify(session));
}

function discard(id: string) {
  rmSync(metaPath(id), { force: true });
  rmSync(dataPath(id), { force: true });
}

function sweep() {
  if (!existsSync(DIR)) return;
  for (const entry of readdirSync(DIR)) {
    const full = path.join(DIR, entry);
    try {
      if (Date.now() - statSync(full).mtimeMs > STALE_MS) rmSync(full, { force: true });
    } catch {
      /* already gone */
    }
  }
}

export class UploadError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function startUpload(name: string, size: number): { id: string; chunkSize: number } {
  if (!Number.isFinite(size) || size <= 0) throw new UploadError(400, "The file is empty.");
  if (size > MAX_UPLOAD) throw new UploadError(413, "Video and audio must be under 120 MB.");
  mkdirSync(DIR, { recursive: true });
  sweep();
  const id = randomBytes(12).toString("hex");
  writeFileSync(dataPath(id), "");
  write(id, { name, size, received: 0, next: 0, startedAt: Date.now() });
  return { id, chunkSize: CHUNK_BYTES };
}

/** Appends chunk `index`. Chunks must arrive in order; a repeat of the last one is ignored, so a retry is safe. */
export function appendChunk(id: string, index: number, bytes: Buffer): { received: number; size: number } {
  const session = read(id);
  if (!session) throw new UploadError(404, "That upload has expired. Start it again.");
  if (index === session.next - 1) return { received: session.received, size: session.size };
  if (index !== session.next) throw new UploadError(409, `Expected piece ${session.next + 1}, got piece ${index + 1}.`);
  if (bytes.length === 0 || bytes.length > CHUNK_BYTES) throw new UploadError(400, "A piece of the upload had the wrong size.");
  if (session.received + bytes.length > session.size) {
    discard(id);
    throw new UploadError(400, "The upload was larger than announced.");
  }
  appendFileSync(dataPath(id), bytes);
  session.received += bytes.length;
  session.next += 1;
  write(id, session);
  return { received: session.received, size: session.size };
}

export async function finishUpload(id: string): Promise<MediaItem> {
  const session = read(id);
  if (!session) throw new UploadError(404, "That upload has expired. Start it again.");
  if (session.received !== session.size) {
    throw new UploadError(400, `Only ${session.received} of ${session.size} bytes arrived. Send the rest first.`);
  }
  try {
    // The bytes decide the type, exactly as for a single-request upload.
    const head = Buffer.alloc(64);
    const fd = openSync(dataPath(id), "r");
    try {
      readSync(fd, head, 0, head.length, 0);
    } finally {
      closeSync(fd);
    }
    const mime = sniffImage(head);
    if (!mime || !ALLOWED.has(mime)) {
      throw new UploadError(415, "Only MP4 video or MP3/WAV/M4A audio can be uploaded this way.");
    }
    return await saveMediaFile({ name: session.name, mime, path: dataPath(id), size: session.size, width: 0, height: 0 });
  } finally {
    discard(id);
  }
}
