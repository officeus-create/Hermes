export async function ensureBeautySalonSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS beauty_salons (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      phone TEXT,
      website TEXT,
      address_line1 TEXT,
      city TEXT NOT NULL,
      region TEXT,
      postal_code TEXT,
      country_code TEXT NOT NULL,
      timezone TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_beauty_salons_owner ON beauty_salons(owner_specialist_id)").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_beauty_salons_slug ON beauty_salons(slug)").run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS beauty_salon_team_members (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role_label TEXT NOT NULL,
      public_title TEXT,
      is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0,1)),
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_beauty_salon_team_owner
    ON beauty_salon_team_members(owner_specialist_id, salon_id, is_active)
  `).run();
}
