import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopCapabilitiesSchema, serializeRepairShopCapabilities } from "../_lib/repair-shop-capabilities-schema.mjs";

type Env = { DB?: any };
type CapacityInput = { parallel_booking_capacity?: unknown };

function parseCapacity(value: unknown) {
  const capacity = Number(value);
  return Number.isInteger(capacity) && capacity >= 1 && capacity <= 10 ? capacity : null;
}

async function requireShopOwner(request: Request, env: Env) {
  if (!env.DB) return { error: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  if (specialist.role !== "Shop Owner") return { error: jsonResponse(403, { success: false, error: "shop_owner_required" }) };
  await ensureRepairShopProfileSchema(env.DB);
  const shop = await env.DB
    .prepare("SELECT id FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
  if (!shop) return { error: jsonResponse(409, { success: false, error: "shop_profile_required" }) };
  return { shop };
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const auth = await requireShopOwner(request, env);
  if (auth.error) return auth.error;

  let body: CapacityInput;
  try {
    body = (await request.json()) as CapacityInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  const capacity = parseCapacity(body.parallel_booking_capacity);
  if (capacity === null) return jsonResponse(400, { success: false, error: "invalid_parallel_booking_capacity" });

  await ensureRepairShopCapabilitiesSchema(env.DB);
  const existing = await env.DB
    .prepare(
      `SELECT shop_id,vehicle_types,fleet_service,mobile_roadside,emergency_24_7,parallel_booking_capacity,updated_at
       FROM repair_shop_capabilities WHERE shop_id = ? LIMIT 1`,
    )
    .bind(auth.shop.id)
    .first();
  const now = new Date().toISOString();

  if (existing) {
    await env.DB
      .prepare("UPDATE repair_shop_capabilities SET parallel_booking_capacity = ?, updated_at = ? WHERE shop_id = ?")
      .bind(capacity, now, auth.shop.id)
      .run();
  } else {
    await env.DB
      .prepare(
        `INSERT INTO repair_shop_capabilities
          (shop_id,vehicle_types,fleet_service,mobile_roadside,emergency_24_7,parallel_booking_capacity,updated_at)
         VALUES (?, '[]', 0, 0, 0, ?, ?)`,
      )
      .bind(auth.shop.id, capacity, now)
      .run();
  }

  const stored = await env.DB
    .prepare(
      `SELECT shop_id,vehicle_types,fleet_service,mobile_roadside,emergency_24_7,parallel_booking_capacity,updated_at
       FROM repair_shop_capabilities WHERE shop_id = ? LIMIT 1`,
    )
    .bind(auth.shop.id)
    .first();

  return jsonResponse(200, { success: true, capabilities: serializeRepairShopCapabilities(stored, auth.shop.id) });
}
