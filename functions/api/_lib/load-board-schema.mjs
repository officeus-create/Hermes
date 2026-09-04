export async function ensureLoadBoardSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_sources (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      mailbox_email TEXT,
      source_name TEXT NOT NULL,
      source_type TEXT NOT NULL DEFAULT 'email',
      credential_ref TEXT,
      history_cursor TEXT,
      watch_expires_at TEXT,
      read_enabled INTEGER NOT NULL DEFAULT 1,
      send_enabled INTEGER NOT NULL DEFAULT 0,
      ingest_enabled INTEGER NOT NULL DEFAULT 1,
      car_hauling_ingest_allowed INTEGER NOT NULL DEFAULT 0,
      car_hauling_outreach_hold INTEGER NOT NULL DEFAULT 1,
      redistribution_permission TEXT NOT NULL DEFAULT 'internal_only',
      contact_reveal_permission TEXT NOT NULL DEFAULT 'hidden',
      last_successful_sync TEXT,
      last_error TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_records (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      source_message_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL,
      record_type TEXT NOT NULL,
      source_name TEXT NOT NULL,
      equipment TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT,
      pickup_window TEXT,
      availability_text TEXT,
      team INTEGER NOT NULL DEFAULT 0,
      rate_amount REAL,
      rate_currency TEXT,
      received_at TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      visibility TEXT NOT NULL DEFAULT 'internal_only',
      raw_evidence_ref TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(source_id, source_message_id, fingerprint)
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_quarantine (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      source_message_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL,
      source_name TEXT NOT NULL,
      reason TEXT NOT NULL,
      subject TEXT,
      received_at TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      raw_evidence_ref TEXT,
      status TEXT NOT NULL DEFAULT 'pending_review',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(source_id, source_message_id, fingerprint)
    )
  `).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_sources_mailbox ON hermes_load_sources(mailbox_email)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_sources_status ON hermes_load_sources(status, ingest_enabled)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_active ON hermes_load_records(status, visibility, expires_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_source ON hermes_load_records(source_id, last_seen_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_type_equipment ON hermes_load_records(record_type, equipment, expires_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_quarantine_pending ON hermes_load_quarantine(status, observed_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_quarantine_source ON hermes_load_quarantine(source_id, observed_at DESC)").run();
}
