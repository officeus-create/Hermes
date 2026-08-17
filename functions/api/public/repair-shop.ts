import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopAvailabilitySchema } from "../_lib/repair-shop-availability-schema.mjs";
import {
  defaultRepairShopCapabilities,
  ensureRepairShopCapabilitiesSchema,
  serializeRepairShopCapabilities,
} from "../_lib/repair-shop-capabilities-schema.mjs";

type Env = { DB?: any };

function serializeAvailability(row: any) {
  return {
    day_of_week: Number(row.day_of_week),
    is_open: Number(row.is_open) === 1,
    start_time: row.start_time ?? null,
    end_time: row.end_time ?? null,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
    return jsonResponse(400, { success: false, error: "invalid_shop_slug" });
  }

  await ensureRepairShopProfileSchema(env.DB);
  const shop = await env.DB
    .prepare(
      "SELECT id,owner_specialist_id,name,slug,phone,address_line1,city,state,postal_code,timezone FROM repair_shops WHERE slug = ? LIMIT 1",
    )
    .bind(slug)
    .first();

  if (!shop) return jsonResponse(404, { success: false, error: "shop_not_found" });

  const services = await env.DB
    .prepare(
      "SELECT id,name,duration_minutes FROM services WHERE owner_specialist_id = ? ORDER BY name COLLATE NOCASE ASC",
    )
    .bind(shop.owner_specialist_id)
    .all();

  await ensureRepairShopAvailabilitySchema(env.DB);
  const availabilityResult = await env.DB
    .prepare(
      "SELECT day_of_week,is_open,start_time,end_time FROM repair_shop_availability WHERE shop_id = ? ORDER BY day_of_week ASC",
    )
    .bind(shop.id)
    .all();
  const storedAvailability = new Map(
    (availabilityResult?.results ?? []).map((row: any) => [Number(row.day_of_week), serializeAvailability(row)]),
  );
  const availability = Array.from({ length: 7 }, (_, day) =>
    storedAvailability.get(day) ?? { day_of_week: day, is_open: false, start_time: null, end_time: null },
  );

  await ensureRepairShopCapabilitiesSchema(env.DB);
  const capabilityRow = await env.DB
    .prepare(
      `SELECT shop_id,vehicle_types,fleet_service,mobile_roadside,emergency_24_7,parallel_booking_capacity,updated_at
       FROM repair_shop_capabilities WHERE shop_id = ? LIMIT 1`,
    )
    .bind(shop.id)
    .first();
  const storedCapabilities = capabilityRow
    ? serializeRepairShopCapabilities(capabilityRow, shop.id)
    : defaultRepairShopCapabilities(shop.id);
  const publicCapabilities = {
    vehicle_types: storedCapabilities.vehicle_types,
    fleet_service: storedCapabilities.fleet_service,
    mobile_roadside: storedCapabilities.mobile_roadside,
    emergency_24_7: storedCapabilities.emergency_24_7,
  };

  const { owner_specialist_id: _owner, ...publicShop } = shop;
  return jsonResponse(200, {
    success: true,
    shop: publicShop,
    services: services?.results ?? [],
    availability,
    capabilities: publicCapabilities,
  });
}