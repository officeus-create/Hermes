export async function ensureRepairShopProspectSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_repair_shop_prospects (
      id TEXT PRIMARY KEY,
      source_entry_id TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'crm',
      salesperson_code TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      website TEXT,
      social_url TEXT,
      address_line1 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT,
      services TEXT,
      website_observation TEXT,
      social_observation TEXT,
      source_url TEXT,
      claim_state TEXT NOT NULL DEFAULT 'unclaimed' CHECK (claim_state IN ('unclaimed','claimed','archived')),
      claimed_shop_id TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shop_prospects_source_entry ON hermes_repair_shop_prospects(source_entry_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_repair_shop_prospects_state_city ON hermes_repair_shop_prospects(state, city)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_repair_shop_prospects_claim_state ON hermes_repair_shop_prospects(claim_state, updated_at)").run();
}
