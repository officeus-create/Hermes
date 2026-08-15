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
      postal_code TEXT,
      timezone TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shops_owner ON repair_shops(owner_specialist_id)").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shops_slug ON repair_shops(slug)").run();
}
