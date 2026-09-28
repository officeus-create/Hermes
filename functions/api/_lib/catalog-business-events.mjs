export const CATALOG_EVENT_TYPES = new Set([
  "profile_view",
  "call_click",
  "maps_click",
  "website_click",
  "request_start",
]);

export async function ensureCatalogBusinessEventSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS catalog_business_events_daily (
      day TEXT NOT NULL,
      catalog_business_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(day, catalog_business_id, event_type)
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_catalog_business_events_business_day ON catalog_business_events_daily(catalog_business_id, day DESC)"
  ).run();
}

export async function recordCatalogBusinessEvent(db, { day, catalogBusinessId, eventType, now }) {
  await ensureCatalogBusinessEventSchema(db);
  await db.prepare(`
    INSERT INTO catalog_business_events_daily
      (day, catalog_business_id, event_type, event_count, updated_at)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(day, catalog_business_id, event_type) DO UPDATE SET
      event_count = catalog_business_events_daily.event_count + 1,
      updated_at = excluded.updated_at
  `).bind(day, catalogBusinessId, eventType, now).run();
}
