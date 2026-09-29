/**
 * Client-side image intake for the admin portal.
 *
 * Files are decoded and, when they are larger than the site will ever render
 * them, downscaled before upload — a 6MB camera shot becomes a few hundred
 * kilobytes with no visible loss. Anything already a sensible size goes up
 * untouched, so PNG logos keep their transparency and SVGs stay vectors.
 * The server stores the bytes and answers with the `MediaItem` the store
 * keeps.
 */
import { api, ApiError } from "./api";
import type { MediaItem } from "./cms";

/** Longest edge kept, in pixels. Hero plates render at 1600 wide. */
const MAX_EDGE = 2000;
/** Files under this many bytes are uploaded as they are. */
const RAW_LIMIT = 1_500_000;
const QUALITY = 0.86;

export interface UploadError {
  file: string;
  reason: string;
}

export function isSupported(file: File) {
  return /^image\/(png|jpe?g|webp|avif|gif|svg\+xml)$/i.test(file.type);
}

/** Films and music beds: stored as they are, no resizing. */
export function isMediaSupported(file: File) {
  return /^(video\/mp4|audio\/(mpeg|mp3|wav|x-wav|mp4|x-m4a))$/i.test(file.type);
}

export function isVideo(file: File) {
  return /^video\/mp4$/i.test(file.type);
}

/** The public site's proxy refuses requests over 8 MB; anything near that goes up in pieces. */
const SINGLE_REQUEST_LIMIT = 4 * 1024 * 1024;

/**
 * Stores a video or audio file as it is. Small files go in one request;
 * larger ones in pieces, reporting progress (0–1) as each piece lands.
 */
export async function uploadRaw(file: File, onProgress?: (fraction: number) => void): Promise<MediaItem> {
  const name = file.name.replace(/\.[^.]+$/, "");
  if (file.size <= SINGLE_REQUEST_LIMIT) {
    const form = new FormData();
    form.append("file", file, file.name);
    form.append("name", name);
    form.append("width", "0");
    form.append("height", "0");
    const item = await api<MediaItem>("/api/admin/media", { form });
    onProgress?.(1);
    return item;
  }

  const { id, chunkSize } = await api<{ id: string; chunkSize: number }>("/api/admin/media/uploads", {
    body: { name, size: file.size },
  });
  const pieces = Math.ceil(file.size / chunkSize);
  for (let index = 0; index < pieces; index++) {
    const piece = file.slice(index * chunkSize, Math.min(file.size, (index + 1) * chunkSize));
    // A dropped connection costs one retry of one piece, not the whole file.
    for (let attempt = 0; ; attempt++) {
      try {
        await api(`/api/admin/media/uploads/${id}?index=${index}`, { method: "PUT", raw: piece });
        break;
      } catch (error) {
        const retryable = !(error instanceof ApiError) || error.status >= 500;
        if (!retryable || attempt >= 2) throw error;
      }
    }
    onProgress?.((index + 1) / pieces);
  }
  return api<MediaItem>(`/api/admin/media/uploads/${id}`, { method: "POST" });
}

export async function fileToMedia(file: File): Promise<MediaItem> {
  const { blob, width, height } = await prepare(file);

  const form = new FormData();
  form.append("file", blob, fileName(file.name, blob.type));
  form.append("name", file.name.replace(/\.[^.]+$/, ""));
  form.append("width", String(width));
  form.append("height", String(height));

  return api<MediaItem>("/api/admin/media", { form });
}

async function prepare(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await decode(url);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const vector = file.type === "image/svg+xml" || file.type === "image/gif";
    const small = Math.max(width, height) <= MAX_EDGE && file.size <= RAW_LIMIT;
    if (vector || small) return { blob: file, width, height };

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser.");
    ctx.drawImage(img, 0, 0, w, h);

    // Transparency survives: PNG stays PNG, WebP/AVIF re-encode as WebP; photos become JPEG.
    const type =
      file.type === "image/png" ? "image/png"
      : file.type === "image/webp" || file.type === "image/avif" ? "image/webp"
      : "image/jpeg";
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Could not encode the image."))),
        type,
        QUALITY,
      ),
    );
    return { blob, width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function fileName(original: string, mime: string) {
  const base = original.replace(/\.[^.]+$/, "") || "upload";
  const ext =
    mime === "image/png" ? "png"
    : mime === "image/jpeg" ? "jpg"
    : mime === "image/webp" ? "webp"
    : mime === "image/gif" ? "gif"
    : mime === "image/avif" ? "avif"
    : mime === "image/svg+xml" ? "svg"
    : "bin";
  return `${base}.${ext}`;
}

function decode(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file is not a readable image."));
    img.src = src;
  });
}
