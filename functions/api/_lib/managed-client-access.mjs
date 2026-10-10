export async function ensureManagedClientAccessSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_managed_client_access (
      specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      access_level TEXT NOT NULL DEFAULT 'viewer' CHECK (access_level IN ('viewer','editor')),
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
      source TEXT NOT NULL DEFAULT 'internal_provisioning',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (specialist_id, company_id)
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_managed_client_access_company ON hermes_managed_client_access(company_id,active,access_level)"
  ).run();
}

export async function getManagedClientAccess(db, specialistId, companyId) {
  await ensureManagedClientAccessSchema(db);
  return db.prepare(`
    SELECT specialist_id,company_id,access_level,active,source,created_at,updated_at
    FROM hermes_managed_client_access
    WHERE specialist_id=? AND company_id=? AND active=1
    LIMIT 1
  `).bind(specialistId, companyId).first();
}
