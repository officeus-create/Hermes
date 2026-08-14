import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

const isProductionSmokeAccount = (email: unknown) =>
  typeof email === "string" &&
  email.startsWith("repair-auth-test-") &&
  email.endsWith("@hermesconnect.app");

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });
  if (!isProductionSmokeAccount(specialist.email)) {
    return jsonResponse(403, { success: false, error: "cleanup_not_allowed" });
  }

  await env.DB.prepare("DELETE FROM sessions WHERE specialist_id = ?").bind(specialist.id).run();
  await env.DB.prepare("DELETE FROM specialists WHERE id = ?").bind(specialist.id).run();

  return jsonResponse(
    200,
    { success: true, deleted: specialist.email },
    { "Set-Cookie": "hermes_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" },
  );
}
