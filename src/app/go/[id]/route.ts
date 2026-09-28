import { col } from "@/server/db";
import { guarded } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A tracked outbound address: /go/<id> counts the click and sends the
 * visitor on to the real destination.
 */
export const GET = guarded<{ params: Promise<{ id: string }> }>(async (_request, { params }) => {
  const { id } = await params;
  const row = await (await col("links")).findOneAndUpdate({ _id: id }, { $inc: { clicks: 1 } });
  if (!row) return new Response("Not found", { status: 404 });

  return new Response(null, {
    status: 302,
    headers: { Location: String(row.url), "Cache-Control": "no-store" },
  });
});
