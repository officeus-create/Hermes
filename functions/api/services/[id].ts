import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";

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

  const legacyBooking = await env.DB
    .prepare("SELECT id FROM bookings WHERE service_id = ? LIMIT 1")
    .bind(id)
    .first();

  await ensureRepairShopBookingsSchema(env.DB);
  const repairBooking = await env.DB
    .prepare("SELECT id FROM repair_shop_bookings WHERE service_id = ? AND owner_specialist_id = ? LIMIT 1")
    .bind(id, specialist.id)
    .first();

  if (legacyBooking || repairBooking) return jsonResponse(409, { success: false, error: "service_has_bookings" });

  await env.DB
    .prepare("DELETE FROM services WHERE id = ? AND owner_specialist_id = ?")
    .bind(id, specialist.id)
    .run();

  return jsonResponse(200, { success: true, deleted: id });
}
