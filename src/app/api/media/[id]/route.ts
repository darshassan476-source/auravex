import { guarded } from "@/server/http";
import { mediaFile } from "@/server/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Serves an uploaded file, streamed from GridFS. Ids are unique per upload, so caching is forever. */
export const GET = guarded<{ params: Promise<{ id: string }> }>(async (request, { params }) => {
  const { id } = await params;
  const file = await mediaFile(id);
  if (!file) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": file.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
  // An SVG opened directly could otherwise run script in this origin.
  if (file.mime === "image/svg+xml") {
    headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";
  }

  const size = file.size;

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (range && (range[1] || range[2])) {
    // A player asks for pieces; give it exactly the piece, so it can seek.
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    return new Response(file.stream(start, end), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  if (size === 0) return new Response(new Uint8Array(0), { headers: { ...headers, "Content-Length": "0" } });
  return new Response(file.stream(0, size - 1), { headers: { ...headers, "Content-Length": String(size) } });
});
