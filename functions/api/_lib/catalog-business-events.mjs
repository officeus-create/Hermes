export const CATALOG_EVENT_TYPES = new Set([
  "profile_view",
  "call_click",
  "maps_click",
  "website_click",
  "request_start",
  "booking_start",
  "claim_start",
  "growth_start",
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

/** @param {any} db @param {{ day: string, catalogBusinessId: string, eventType: string, now: string, country?: string | null }} event */
export async function recordCatalogBusinessEvent(db, { day, catalogBusinessId, eventType, now, country = null }) {
  await ensureCatalogBusinessEventSchema(db);
  await db.prepare(`
    INSERT INTO catalog_business_events_daily
      (day, catalog_business_id, event_type, event_count, updated_at)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(day, catalog_business_id, event_type) DO UPDATE SET
      event_count = catalog_business_events_daily.event_count + 1,
      updated_at = excluded.updated_at
  `).bind(day, catalogBusinessId, eventType, now).run();
  if (eventType === "profile_view" && country) {
    try { await recordCatalogCountryView(db, { day, catalogBusinessId, country, now }); }
    catch { /* Preserve accepted profile view; public country coverage remains explicitly partial. */ }
  }
}

export async function recordCatalogCountryView(db, { day, catalogBusinessId, country, now }) {
  if (!/^[A-Z]{2}$/.test(country || "") || ["XX", "ZZ"].includes(country)) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS catalog_business_country_views_daily (
    day TEXT NOT NULL, catalog_business_id TEXT NOT NULL, country TEXT NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL,
    PRIMARY KEY(day, catalog_business_id, country)
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_catalog_business_country_day ON catalog_business_country_views_daily(catalog_business_id, day)").run();
  await db.prepare(`INSERT INTO catalog_business_country_views_daily (day,catalog_business_id,country,view_count,updated_at)
    VALUES (?,?,?,1,?) ON CONFLICT(day,catalog_business_id,country) DO UPDATE SET
    view_count = catalog_business_country_views_daily.view_count + 1, updated_at = excluded.updated_at`).bind(day,catalogBusinessId,country,now).run();
}
