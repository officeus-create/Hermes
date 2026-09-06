async function ensureOptionalColumn(db, column, definition) {
  const result = await db.prepare("PRAGMA table_info(repair_shops)").all();
  const names = new Set((result?.results ?? []).map((row) => String(row.name || "")));
  if (!names.has(column)) await db.prepare(`ALTER TABLE repair_shops ADD COLUMN ${definition}`).run();
}

export async function ensureRepairShopProfileSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS repair_shops (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      phone TEXT,
      address_line1 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      region TEXT,
      country_code TEXT,
      postal_code TEXT,
      timezone TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await ensureOptionalColumn(db, "region", "region TEXT");
  await ensureOptionalColumn(db, "country_code", "country_code TEXT");
  await db.prepare(
    "UPDATE repair_shops SET region = state WHERE (region IS NULL OR TRIM(region) = '') AND state IS NOT NULL AND TRIM(state) <> ''",
  ).run();
  await db.prepare(
    "UPDATE repair_shops SET country_code = 'US' WHERE country_code IS NULL OR TRIM(country_code) = ''",
  ).run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shops_owner ON repair_shops(owner_specialist_id)").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shops_slug ON repair_shops(slug)").run();
}
