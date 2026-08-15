import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopBookingsSchema } from "../_lib/repair-shop-bookings-schema.mjs";

type Env = { DB?: any };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureRepairShopBookingsSchema(env.DB);
  const result = await env.DB
    .prepare(
      `SELECT id,shop_id,service_id,service_name,duration_minutes,appointment_date,start_time,end_time,status,
              client_name,client_email,client_phone,created_at,updated_at
       FROM repair_shop_bookings
       WHERE owner_specialist_id = ?
       ORDER BY appointment_date ASC, start_time ASC, created_at ASC
       LIMIT 250`,
    )
    .bind(specialist.id)
    .all();

  return jsonResponse(200, { success: true, bookings: result?.results ?? [] });
}
