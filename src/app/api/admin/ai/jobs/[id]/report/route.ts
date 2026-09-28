import { SITE } from "@/data/site";
import { getJob } from "@/server/ai";
import { auditReportHtml } from "@/server/auditReport";
import { fail, withUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The audit as one file to keep: verdict, scores, findings and their evidence, all inside. */
export const GET = withUser<{ params: Promise<{ id: string }> }>(async (_request, _user, { params }) => {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return fail(404, "No such job.");
  const audit = job.artifacts?.audit;
  if (!audit) return fail(404, "That job has no audit report.");
  const slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "audit";
  return new Response(await auditReportHtml(job, audit, SITE.name), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.html"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
