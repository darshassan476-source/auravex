import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/server/auth";
import { guarded, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = guarded(async () => {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (id) await destroySession(id);

  const response = json({ ok: true });
  response.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", expires: new Date(0) });
  return response;
});
