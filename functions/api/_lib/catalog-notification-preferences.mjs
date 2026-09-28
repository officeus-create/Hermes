export async function ensureCatalogNotificationSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS catalog_notification_preferences (
      owner_specialist_id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      inquiry_enabled INTEGER NOT NULL DEFAULT 0,
      weekly_report_enabled INTEGER NOT NULL DEFAULT 0,
      verified_at TEXT,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS catalog_notification_verification_tokens (
      token_hash TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      shop_id TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      inquiry_enabled INTEGER NOT NULL DEFAULT 0,
      weekly_report_enabled INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      consumed_at TEXT,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_catalog_notification_tokens_owner ON catalog_notification_verification_tokens(owner_specialist_id, created_at DESC)"
  ).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_catalog_notification_tokens_expiry ON catalog_notification_verification_tokens(expires_at)"
  ).run();
}

export async function catalogNotificationPreferenceForOwner(db, ownerSpecialistId) {
  await ensureCatalogNotificationSchema(db);
  return db.prepare(`
    SELECT owner_specialist_id, shop_id, recipient_email, inquiry_enabled,
           weekly_report_enabled, verified_at, updated_at
    FROM catalog_notification_preferences
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(ownerSpecialistId).first();
}
