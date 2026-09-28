import { revalidateTag } from "next/cache";
import { SITE_TAG } from "@/server/cache";
import { logActivity } from "@/server/db";
import { fail, json, str, withUser } from "@/server/http";
import { listMedia, saveMedia, sniffImage } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE = 15 * 1024 * 1024;
const MAX_MEDIA = 120 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
]);

export const GET = withUser(async () => json({ media: await listMedia() }));

/** Multipart upload: `file`, plus `name`, `width`, `height` measured by the browser. */
export const POST = withUser(async (request, user) => {
  // Browsers always declare the multipart length; refuse before buffering anything oversized.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (!declared) return fail(411, "Content-Length is required for uploads.");
  if (declared > MAX_MEDIA + 64 * 1024) return fail(413, "Files must be under 120 MB.");

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) return fail(400, "Attach a file as `file`.");

  // The bytes decide the type; the upload's own Content-Type is only a hint.
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = sniffImage(bytes);
  if (!mime || !ALLOWED.has(mime)) {
    return fail(415, "Only PNG, JPG, WebP, AVIF, GIF, SVG images, MP4 video or MP3/WAV/M4A audio are accepted.");
  }
  const limit = mime.startsWith("image/") ? MAX_IMAGE : MAX_MEDIA;
  if (bytes.length > limit) return fail(413, mime.startsWith("image/") ? "Images must be under 15 MB." : "Video and audio must be under 120 MB.");

  const width = Math.max(0, Math.round(Number(form.get("width")) || 0));
  const height = Math.max(0, Math.round(Number(form.get("height")) || 0));
  const name = str(form.get("name"), 160) || file.name.replace(/\.[^.]+$/, "") || "Upload";

  const item = await saveMedia({ name, mime, bytes, width, height });
  await logActivity(user.name, "create", "uploaded", name);
  revalidateTag(SITE_TAG);
  return json(item, { status: 201 });
});
