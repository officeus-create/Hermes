const repairShopColumnPromises = new WeakMap();
const repairShopSchemaPromises = new WeakMap();

async function repairShopColumns(db) {
  let promise = repairShopColumnPromises.get(db);
  if (!promise) {
    promise = db
      .prepare("PRAGMA table_info(repair_shops)")
      .all()
      .then((result) => new Set((result?.results ?? []).map((row) => String(row.name || ""))))
      .catch((error) => {
        repairShopColumnPromises.delete(db);
        throw error;
      });
    repairShopColumnPromises.set(db, promise);
  }
  return promise;
}

async function ensureOptionalColumn(db, column, definition) {
  const names = await repairShopColumns(db);
  if (names.has(column)) return;
  await db.prepare(`ALTER TABLE repair_shops ADD COLUMN ${definition}`).run();
  names.add(column);
}

async function applyRepairShopProfileSchema(db) {
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
  await ensureOptionalColumn(db, "website", "website TEXT");
  await ensureOptionalColumn(db, "catalog_opt_in", "catalog_opt_in INTEGER NOT NULL DEFAULT 0");
  await ensureOptionalColumn(db, "catalog_opt_in_at", "catalog_opt_in_at TEXT");
  await ensureOptionalColumn(db, "catalog_published_at", "catalog_published_at TEXT");
  await ensureOptionalColumn(db, "seo_geo_started_at", "seo_geo_started_at TEXT");
  await ensureOptionalColumn(db, "next_seo_report_at", "next_seo_report_at TEXT");
  await db.prepare(
    "UPDATE repair_shops SET region = state WHERE (region IS NULL OR TRIM(region) = '') AND state IS NOT NULL AND TRIM(state) <> ''",
  ).run();
  await db.prepare(
    "UPDATE repair_shops SET country_code = 'US' WHERE country_code IS NULL OR TRIM(country_code) = ''",
  ).run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shops_owner ON repair_shops(owner_specialist_id)").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shops_slug ON repair_shops(slug)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_repair_shops_catalog ON repair_shops(catalog_opt_in, updated_at)").run();
}

export async function ensureRepairShopProfileSchema(db) {
  let promise = repairShopSchemaPromises.get(db);
  if (!promise) {
    promise = applyRepairShopProfileSchema(db).catch((error) => {
      repairShopSchemaPromises.delete(db);
      repairShopColumnPromises.delete(db);
      throw error;
    });
    repairShopSchemaPromises.set(db, promise);
  }
  return promise;
}
