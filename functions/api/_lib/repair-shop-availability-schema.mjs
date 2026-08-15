export async function ensureRepairShopAvailabilitySchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_availability (
      shop_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      is_open INTEGER NOT NULL DEFAULT 0,
      start_time TEXT,
      end_time TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (shop_id, day_of_week)
    )
  `).run();
}
