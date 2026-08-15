export async function ensureRepairShopBookingVehicleSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_booking_vehicles (
      booking_id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      vehicle_year INTEGER,
      vehicle_make TEXT NOT NULL,
      vehicle_model TEXT NOT NULL,
      mileage INTEGER,
      vin TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_booking_vehicles_owner ON repair_shop_booking_vehicles(owner_specialist_id, updated_at)",
  ).run();
}
