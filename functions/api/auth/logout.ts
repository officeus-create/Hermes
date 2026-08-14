import { parseCookies, sessionCookieHeader } from "../../../src/legacy-prototype/auth.mjs";
import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = (cookies as any).hermes_session;
  const clearCookie = { "Set-Cookie": sessionCookieHeader("", { clear: true }) };

  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, clearCookie);

  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  }
  return jsonResponse(200, { success: true }, clearCookie);
}
