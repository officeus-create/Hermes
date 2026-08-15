export async function ensureRepairShopFeedbackSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shop_feedback (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      category TEXT NOT NULL,
      rating INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      retention_until TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_repair_shop_feedback_owner_created ON repair_shop_feedback(owner_specialist_id, created_at DESC)",
  ).run();
}

export async function deleteExpiredRepairShopFeedback(db, now = new Date().toISOString()) {
  await db.prepare("DELETE FROM repair_shop_feedback WHERE retention_until <= ?").bind(now).run();
}
