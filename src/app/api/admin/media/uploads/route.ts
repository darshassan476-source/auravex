import { fail, json, readJson, str, withUser } from "@/server/http";
import { startUpload, UploadError } from "@/server/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Starts a chunked upload: `{ name, size }` → `{ id, chunkSize }`. */
export const POST = withUser(async (request) => {
  const body = await readJson<{ name?: unknown; size?: unknown }>(request, 2_000);
  const name = str(body.name, 160) || "Upload";
  try {
    return json(startUpload(name, Number(body.size)), { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) return fail(error.status, error.message);
    throw error;
  }
});
