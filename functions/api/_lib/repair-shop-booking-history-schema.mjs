export async function ensureRepairShopBookingHistorySchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_booking_history (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      changed_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_booking_history_booking ON repair_shop_booking_history(booking_id, changed_at)",
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_booking_history_owner ON repair_shop_booking_history(owner_specialist_id, changed_at)",
  ).run();
}
