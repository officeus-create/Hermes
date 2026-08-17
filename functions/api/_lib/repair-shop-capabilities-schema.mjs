const DEFAULT_VEHICLE_TYPES = [];

export const REPAIR_SHOP_VEHICLE_TYPES = [
  "passenger_light",
  "commercial_truck",
  "trailer",
  "reefer",
  "flatbed_open_deck",
  "other",
];

export function defaultRepairShopCapabilities(shopId = "") {
  return {
    shop_id: shopId,
    vehicle_types: [...DEFAULT_VEHICLE_TYPES],
    fleet_service: false,
    mobile_roadside: false,
    emergency_24_7: false,
    parallel_booking_capacity: 1,
    updated_at: null,
  };
}

export function parseRepairShopVehicleTypes(value) {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    const allowed = new Set(REPAIR_SHOP_VEHICLE_TYPES);
    return [...new Set(parsed.map((item) => String(item || "").trim()).filter((item) => allowed.has(item)))];
  } catch {
    return [];
  }
}

export function serializeRepairShopCapabilities(row, shopId = "") {
  if (!row) return defaultRepairShopCapabilities(shopId);
  const rawCapacity = Number(row.parallel_booking_capacity ?? 1);
  const capacity = Number.isInteger(rawCapacity) ? Math.max(1, Math.min(rawCapacity, 10)) : 1;
  return {
    shop_id: String(row.shop_id || shopId || ""),
    vehicle_types: parseRepairShopVehicleTypes(row.vehicle_types),
    fleet_service: Number(row.fleet_service) === 1,
    mobile_roadside: Number(row.mobile_roadside) === 1,
    emergency_24_7: Number(row.emergency_24_7) === 1,
    parallel_booking_capacity: capacity,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  };
}

export async function ensureRepairShopCapabilitiesSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_capabilities (
      shop_id TEXT PRIMARY KEY,
      vehicle_types TEXT NOT NULL DEFAULT '[]',
      fleet_service INTEGER NOT NULL DEFAULT 0,
      mobile_roadside INTEGER NOT NULL DEFAULT 0,
      emergency_24_7 INTEGER NOT NULL DEFAULT 0,
      parallel_booking_capacity INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    )
  `).run();
}