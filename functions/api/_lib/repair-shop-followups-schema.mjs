export async function ensureRepairShopFollowupsSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_booking_followups (
      booking_id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      needed INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_followups_owner ON repair_shop_booking_followups(owner_specialist_id, needed, updated_at)",
  ).run();
}
