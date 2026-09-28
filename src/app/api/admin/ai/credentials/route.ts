import { createCredential, listCredentials } from "@/server/ai";
import { logActivity } from "@/server/db";
import { fail, json, readBody, str, withUser } from "@/server/http";
import { parseCredentialFile } from "@/server/secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withUser(async () => json({ credentials: await listCredentials() }));

/**
 * Stores a credentials file for the browser agent. Accepts multipart (`file`,
 * `name`, `host`) or JSON ({ name, host, fields }). Values are sealed at
 * rest and never returned; only the field names are.
 */
export const POST = withUser(async (request, user) => {
  const type = request.headers.get("content-type") ?? "";
  let name = "";
  let host = "";
  let fields: Record<string, string> = {};

  if (/multipart\/form-data/i.test(type)) {
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > 200_000) return fail(413, "A credentials file should be tiny.");
    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!form || !(file instanceof File)) return fail(400, "Attach the credentials file as `file`.");
    fields = parseCredentialFile(await file.text());
    name = str(form.get("name"), 80) || file.name.replace(/\.[^.]+$/, "");
    host = str(form.get("host"), 200);
  } else {
    const text = await readBody(request, 200_000);
    let body: { name?: unknown; host?: unknown; fields?: unknown } = {};
    try {
      body = JSON.parse(text);
    } catch {
      return fail(400, "Body must be valid JSON.");
    }
    name = str(body.name, 80);
    host = str(body.host, 200);
    if (body.fields && typeof body.fields === "object" && !Array.isArray(body.fields)) {
      fields = Object.fromEntries(
        Object.entries(body.fields as Record<string, unknown>)
          .filter(([, v]) => typeof v === "string" || typeof v === "number")
          .map(([k, v]) => [k.trim().slice(0, 60), String(v).slice(0, 2000)]),
      );
    }
  }

  const names = Object.keys(fields).filter(Boolean);
  if (names.length === 0) return fail(400, "No fields were found. Use JSON, KEY=value lines or key: value lines.");
  if (names.length > 40) return fail(400, "That is more than a sign-in needs; keep it to the fields the product asks for.");
  if (!name) name = host || "Credential";

  const created = await createCredential({ name, host, fields: Object.fromEntries(names.map((n) => [n, fields[n]])) });
  await logActivity(user.name, "create", "stored a credential", created.name);
  return json(created, { status: 201 });
});
