export async function ensureRepairShopBookingsSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_bookings (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_bookings_owner_date ON repair_shop_bookings(owner_specialist_id, appointment_date, start_time)",
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_bookings_shop_date ON repair_shop_bookings(shop_id, appointment_date, start_time)",
  ).run();
}
