import "server-only";
import type { AiJob, AuditReport } from "@/lib/aiJobs";
import { mediaBytes } from "./site";

/**
 * A product audit as one self-contained HTML file: the verdict, the scores
 * with their reasons, every finding with its evidence embedded, so it can be
 * saved, printed to PDF or sent on without the portal.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const TONE: Record<string, string> = { critical: "#d64545", high: "#d64545", medium: "#c98a1a", low: "#6b7a99" };
const VERDICT: Record<AuditReport["readiness"], { label: string; tone: string }> = {
  ready: { label: "Ready to publish", tone: "#1f9d61" },
  review: { label: "Review before publishing", tone: "#c98a1a" },
  "not-ready": { label: "Not ready to publish", tone: "#d64545" },
};

/** An evidence image as a data URL, or nothing if the media is gone. */
async function dataUrl(src: string): Promise<string | null> {
  const id = src.replace(/^\/api\/media\//, "");
  try {
    const file = await mediaBytes(id);
    return file ? `data:${file.mime};base64,${file.bytes.toString("base64")}` : null;
  } catch {
    return null;
  }
}

export async function auditReportHtml(job: AiJob, audit: AuditReport, site: string): Promise<string> {
  // Every image is read up front, so the markup below can stay a plain template.
  const sources = [...new Set([...audit.issues.map((i) => i.screen), ...(job.artifacts?.screens ?? []).map((s) => s.src)].filter((s): s is string => Boolean(s)))];
  const images = new Map(await Promise.all(sources.map(async (src) => [src, await dataUrl(src)] as const)));
  const inline = (src: string | undefined) => (src ? (images.get(src) ?? null) : null);

  const v = VERDICT[audit.readiness];
  const overall = Math.round(audit.scores.reduce((a, s) => a + s.score, 0) / Math.max(1, audit.scores.length));
  const count = (sev: string) => audit.issues.filter((i) => i.severity === sev).length;
  const when = new Date(job.finishedAt ?? job.createdAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });
  const url = job.options?.url ?? "";
  const scoreRows = audit.scores
    .map(
      (s) => `<tr><td>${esc(s.label)}</td><td class="n">${s.score}</td><td><div class="bar"><span style="width:${s.score}%;background:${s.score >= 85 ? "#1f9d61" : s.score >= 70 ? "#c98a1a" : "#d64545"}"></span></div></td><td class="why">${s.reasons.map((r) => esc(r)).join("<br>")}</td></tr>`,
    )
    .join("\n");
  const findings = audit.issues
    .map((it) => {
      const img = inline(it.screen);
      return `<div class="finding"><div class="head"><span class="sev" style="background:${TONE[it.severity]}">${it.severity}</span><span class="area">${esc(it.area)}</span><strong>${esc(it.title)}</strong></div><p>${esc(it.detail)}</p>${img ? `<img src="${img}" alt="">` : ""}</div>`;
    })
    .join("\n");
  const screens = (job.artifacts?.screens ?? [])
    .map((s) => {
      const img = inline(s.src);
      return img ? `<figure><img src="${img}" alt=""><figcaption>${esc(s.label)}</figcaption></figure>` : "";
    })
    .join("\n");
  const c = audit.checks;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Product audit — ${esc(job.title)}</title>
<style>
:root{color-scheme:light}
body{margin:0;background:#f6f8fd;color:#0f1730;font:15px/1.55 -apple-system,"Segoe UI",Inter,system-ui,sans-serif}
main{max-width:920px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:28px;margin:0 0 4px;letter-spacing:-.02em}h2{font-size:18px;margin:36px 0 12px;letter-spacing:-.01em}
.meta{color:#5b6785;font-size:13px;margin:0 0 24px}
.verdict{display:flex;gap:18px;align-items:center;padding:18px 20px;border-radius:14px;border:1px solid ${v.tone}55;background:${v.tone}12}
.verdict .n{width:64px;height:64px;border-radius:50%;background:${v.tone};color:#fff;font-weight:700;font-size:22px;display:grid;place-items:center;flex:none}
.verdict strong{font-size:17px;display:block}.verdict small{color:#5b6785}
.counts{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 0}.counts span{border:1px solid #d6dcea;border-radius:999px;padding:3px 10px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#5b6785}
.summary{margin:18px 0 0;font-size:15.5px}
table{width:100%;border-collapse:collapse;font-size:13.5px}td{padding:9px 10px;border-top:1px solid #e3e8f2;vertical-align:top}td.n{font-family:ui-monospace,Menlo,monospace;text-align:right;width:36px}td.why{color:#5b6785;font-size:12.5px;width:52%}
.bar{width:120px;height:6px;border-radius:6px;background:#e3e8f2;overflow:hidden}.bar span{display:block;height:100%;border-radius:6px}
.finding{border:1px solid #e3e8f2;border-radius:12px;padding:14px 16px;margin:0 0 12px;background:#fff}.finding .head{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.finding p{margin:8px 0 0;color:#3a4661}
.sev{color:#fff;border-radius:999px;padding:2px 9px;font-size:11px;text-transform:uppercase;letter-spacing:.06em}.area{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#5b6785}
.finding img{display:block;max-width:100%;border-radius:8px;border:1px solid #e3e8f2;margin-top:12px}
ol{padding-left:22px}.checks{color:#5b6785;font-size:13px}
.screens{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}figure{margin:0}figure img{width:100%;border-radius:8px;border:1px solid #e3e8f2}figcaption{font-size:12px;color:#5b6785;margin-top:4px}
pre{white-space:pre-wrap;font:12px/1.5 ui-monospace,Menlo,monospace;color:#5b6785;background:#fff;border:1px solid #e3e8f2;border-radius:10px;padding:12px 14px}
footer{margin-top:48px;color:#8a94ad;font-size:12px}
@media print{body{background:#fff}main{padding:0}}
</style></head><body><main>
<h1>Product audit</h1>
<p class="meta">${esc(url)} · ${esc(when)} · ${esc(job.model)}${audit.persona ? ` · as ${esc(audit.persona)}` : ""}</p>
<div class="verdict"><div class="n">${overall}</div><div><strong>${v.label}</strong><small>Overall ${overall} of 100 · ${c.screens} screens seen · ${c.linksChecked} links followed · ${c.mobileChecked} phone-width checks</small>
<div class="counts">${["critical", "high", "medium", "low"].map((s) => `<span>${count(s)} ${s}</span>`).join("")}</div></div></div>
<p class="summary">${esc(audit.summary)}</p>
<h2>Scores, with the reasons</h2>
<table>${scoreRows}</table>
${audit.issues.length ? `<h2>Findings, most serious first</h2>${findings}` : ""}
${audit.recommended.length ? `<h2>Recommended next</h2><ol>${audit.recommended.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>` : ""}
<h2>What was measured</h2>
<p class="checks">Console errors ${c.consoleErrors} · failed requests ${c.failedRequests} · broken links ${c.brokenLinks} of ${c.linksChecked} · slow screens ${c.slowPages} · phone overflow ${c.mobileOverflow} of ${c.mobileChecked} · images without alt ${c.missingAlt} · unlabeled fields ${c.unlabeledFields} · screens without title or description ${c.missingMeta} · insecure links ${c.insecureLinks}</p>
${screens ? `<h2>Screens the agent captured</h2><div class="screens">${screens}</div>` : ""}
${audit.map.length ? `<h2>The product as the agent found it</h2><pre>${esc(audit.map.join("\n"))}</pre>` : ""}
<footer>Made by ${esc(site)} AI Studio. Scores in the measured rows come from what the page itself reported; the rest are the agent's judgement after using the product.</footer>
</main></body></html>`;
}
