import { revalidateTag } from "next/cache";
import { SITE_TAG } from "@/server/cache";
import { logActivity } from "@/server/db";
import { fail, json, withUser } from "@/server/http";
import { appendChunk, CHUNK_BYTES, finishUpload, UploadError } from "@/server/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function answer(error: unknown) {
  if (error instanceof UploadError) return fail(error.status, error.message);
  throw error;
}

/** One piece of the file, as the raw request body: `PUT ?index=<n>`. */
export const PUT = withUser<Ctx>(async (request, _user, { params }) => {
  const { id } = await params;
  const index = Number(new URL(request.url).searchParams.get("index"));
  if (!Number.isInteger(index) || index < 0) return fail(400, "Say which piece this is with ?index=.");
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > CHUNK_BYTES) return fail(413, "A piece of the upload was too large.");
  try {
    return json(appendChunk(id, index, Buffer.from(await request.arrayBuffer())));
  } catch (error) {
    return answer(error);
  }
});

/** Every piece has arrived: store the file and answer with its `MediaItem`. */
export const POST = withUser<Ctx>(async (_request, user, { params }) => {
  const { id } = await params;
  try {
    const item = await finishUpload(id);
    await logActivity(user.name, "create", "uploaded", item.name);
    revalidateTag(SITE_TAG);
    return json(item, { status: 201 });
  } catch (error) {
    return answer(error);
  }
});
