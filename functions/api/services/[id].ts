import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

export async function onRequestDelete({ request, env, params }: { request: Request; env: Env; params: { id?: string } }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const id = String(params.id ?? "").trim();
  if (!id) return jsonResponse(400, { success: false, error: "service_id_required" });

  const service = await env.DB
    .prepare("SELECT id FROM services WHERE id = ? AND owner_specialist_id = ? LIMIT 1")
    .bind(id, specialist.id)
    .first();

  if (!service) return jsonResponse(404, { success: false, error: "service_not_found" });

  const booking = await env.DB
    .prepare("SELECT id FROM bookings WHERE service_id = ? LIMIT 1")
    .bind(id)
    .first();

  if (booking) return jsonResponse(409, { success: false, error: "service_has_bookings" });

  await env.DB
    .prepare("DELETE FROM services WHERE id = ? AND owner_specialist_id = ?")
    .bind(id, specialist.id)
    .run();

  return jsonResponse(200, { success: true, deleted: id });
}
