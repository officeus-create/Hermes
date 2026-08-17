import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import {
  REPAIR_SHOP_VEHICLE_TYPES,
  defaultRepairShopCapabilities,
  ensureRepairShopCapabilitiesSchema,
  serializeRepairShopCapabilities,
} from "../_lib/repair-shop-capabilities-schema.mjs";

type Env = { DB?: any };
type CapabilitiesInput = {
  vehicle_types?: unknown;
  fleet_service?: unknown;
  mobile_roadside?: unknown;
  emergency_24_7?: unknown;
  parallel_booking_capacity?: unknown;
};

async function getOwnerShop(db: any, ownerId: string) {
  await ensureRepairShopProfileSchema(db);
  return db
    .prepare("SELECT id FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(ownerId)
    .first();
}

async function getStoredCapabilities(db: any, shopId: string) {
  await ensureRepairShopCapabilitiesSchema(db);
  return db
    .prepare(
      `SELECT shop_id,vehicle_types,fleet_service,mobile_roadside,emergency_24_7,parallel_booking_capacity,updated_at
       FROM repair_shop_capabilities WHERE shop_id = ? LIMIT 1`,
    )
    .bind(shopId)
    .first();
}

function parseVehicleTypes(value: unknown) {
  if (!Array.isArray(value)) return null;
  const allowed = new Set(REPAIR_SHOP_VEHICLE_TYPES);
  const normalized = [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
  if (normalized.length > REPAIR_SHOP_VEHICLE_TYPES.length || normalized.some((item) => !allowed.has(item))) return null;
  return normalized;
}

function parseBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function parseCapacity(value: unknown) {
  const capacity = Number(value);
  return Number.isInteger(capacity) && capacity >= 1 && capacity <= 10 ? capacity : null;
}

async function requireShopOwner(request: Request, env: Env) {
  if (!env.DB) return { error: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  if (specialist.role !== "Shop Owner") return { error: jsonResponse(403, { success: false, error: "shop_owner_required" }) };
  const shop = await getOwnerShop(env.DB, specialist.id);
  if (!shop) return { error: jsonResponse(409, { success: false, error: "shop_profile_required" }) };
  return { specialist, shop };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireShopOwner(request, env);
  if (auth.error) return auth.error;
  const stored = await getStoredCapabilities(env.DB, auth.shop.id);
  return jsonResponse(200, {
    success: true,
    capabilities: stored ? serializeRepairShopCapabilities(stored, auth.shop.id) : defaultRepairShopCapabilities(auth.shop.id),
  });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const auth = await requireShopOwner(request, env);
  if (auth.error) return auth.error;

  let body: CapabilitiesInput;
  try {
    body = (await request.json()) as CapabilitiesInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const vehicleTypes = parseVehicleTypes(body.vehicle_types);
  const fleetService = parseBoolean(body.fleet_service);
  const mobileRoadside = parseBoolean(body.mobile_roadside);
  const emergency247 = parseBoolean(body.emergency_24_7);
  if (!vehicleTypes) return jsonResponse(400, { success: false, error: "invalid_vehicle_types" });
  if (fleetService === null || mobileRoadside === null || emergency247 === null) {
    return jsonResponse(400, { success: false, error: "invalid_capability_flags" });
  }
  if (emergency247 && !mobileRoadside) {
    return jsonResponse(400, { success: false, error: "emergency_requires_roadside" });
  }

  await ensureRepairShopCapabilitiesSchema(env.DB);
  const existing = await getStoredCapabilities(env.DB, auth.shop.id);
  const existingCapacity = existing ? serializeRepairShopCapabilities(existing, auth.shop.id).parallel_booking_capacity : 1;
  const capacity = body.parallel_booking_capacity === undefined ? existingCapacity : parseCapacity(body.parallel_booking_capacity);
  if (capacity === null) return jsonResponse(400, { success: false, error: "invalid_parallel_booking_capacity" });
  const now = new Date().toISOString();
  const serializedVehicleTypes = JSON.stringify(vehicleTypes);

  if (existing) {
    await env.DB
      .prepare(
        `UPDATE repair_shop_capabilities
         SET vehicle_types=?,fleet_service=?,mobile_roadside=?,emergency_24_7=?,parallel_booking_capacity=?,updated_at=?
         WHERE shop_id=?`,
      )
      .bind(serializedVehicleTypes, fleetService ? 1 : 0, mobileRoadside ? 1 : 0, emergency247 ? 1 : 0, capacity, now, auth.shop.id)
      .run();
  } else {
    await env.DB
      .prepare(
        `INSERT INTO repair_shop_capabilities
          (shop_id,vehicle_types,fleet_service,mobile_roadside,emergency_24_7,parallel_booking_capacity,updated_at)
         VALUES (?,?,?,?,?,?,?)`,
      )
      .bind(auth.shop.id, serializedVehicleTypes, fleetService ? 1 : 0, mobileRoadside ? 1 : 0, emergency247 ? 1 : 0, capacity, now)
      .run();
  }

  const stored = await getStoredCapabilities(env.DB, auth.shop.id);
  return jsonResponse(200, { success: true, capabilities: serializeRepairShopCapabilities(stored, auth.shop.id) });
}