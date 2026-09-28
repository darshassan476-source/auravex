import { revalidateTag } from "next/cache";
import { SITE_TAG } from "@/server/cache";
import { col, logActivity } from "@/server/db";
import { fail, json, withUser } from "@/server/http";
import { deleteMedia } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DELETE = withUser<{ params: Promise<{ id: string }> }>(
  async (_request, user, { params }) => {
    const { id } = await params;
    const row = await (await col("media")).findOne({ _id: id }, { projection: { name: 1 } });
    if (!(await deleteMedia(id))) return fail(404, "That file is already gone.");
    await logActivity(user.name, "delete", "deleted the image", String(row?.name ?? id));
    revalidateTag(SITE_TAG);
    return json({ ok: true });
  },
);
