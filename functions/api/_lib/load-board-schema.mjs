async function ensureColumns(db, table, columns) {
  const existing = await db.prepare(`PRAGMA table_info(${table})`).all();
  const names = new Set((existing?.results || []).map((row) => String(row.name)));
  for (const [name, definition] of Object.entries(columns)) {
    if (names.has(name)) continue;
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`).run();
  }
}

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
      provider_record_id TEXT,
      origin_city TEXT,
      origin_state TEXT,
      origin_zip TEXT,
      destination_city TEXT,
      destination_state TEXT,
      destination_zip TEXT,
      distance_miles REAL,
      deadhead_miles REAL,
      vehicle_count INTEGER,
      operable INTEGER,
      enclosed INTEGER,
      payment_terms TEXT,
      rate_per_mile REAL,
      source_quality_score REAL,
      dedupe_key TEXT,
      provider_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(source_id, source_message_id, fingerprint)
    )
  `).run();

  await ensureColumns(db, "hermes_load_records", {
    provider_record_id: "TEXT",
    origin_city: "TEXT",
    origin_state: "TEXT",
    origin_zip: "TEXT",
    destination_city: "TEXT",
    destination_state: "TEXT",
    destination_zip: "TEXT",
    distance_miles: "REAL",
    deadhead_miles: "REAL",
    vehicle_count: "INTEGER",
    operable: "INTEGER",
    enclosed: "INTEGER",
    payment_terms: "TEXT",
    rate_per_mile: "REAL",
    source_quality_score: "REAL",
    dedupe_key: "TEXT",
    provider_url: "TEXT",
  });

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

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_interest_requests (
      id TEXT PRIMARY KEY,
      load_record_id TEXT NOT NULL,
      specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      action_type TEXT NOT NULL DEFAULT 'request_details',
      status TEXT NOT NULL DEFAULT 'requested',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(load_record_id, company_id, action_type)
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_source_requests (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      specialist_id TEXT NOT NULL,
      source_name TEXT NOT NULL,
      source_type TEXT NOT NULL,
      provider_name TEXT,
      feed_reference TEXT,
      requested_redistribution_permission TEXT NOT NULL DEFAULT 'internal_only',
      requested_contact_reveal_permission TEXT NOT NULL DEFAULT 'hidden',
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending_review',
      review_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(company_id, source_name)
    )
  `).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_sources_mailbox ON hermes_load_sources(mailbox_email)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_sources_status ON hermes_load_sources(status, ingest_enabled)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_active ON hermes_load_records(status, visibility, expires_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_source ON hermes_load_records(source_id, last_seen_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_type_equipment ON hermes_load_records(record_type, equipment, expires_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_lane ON hermes_load_records(origin_state, destination_state, equipment, expires_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_provider_id ON hermes_load_records(provider_record_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_dedupe ON hermes_load_records(dedupe_key, observed_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_records_score ON hermes_load_records(source_quality_score DESC, observed_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_quarantine_pending ON hermes_load_quarantine(status, observed_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_quarantine_source ON hermes_load_quarantine(source_id, observed_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_interest_company ON hermes_load_interest_requests(company_id, status, updated_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_interest_record ON hermes_load_interest_requests(load_record_id, status, updated_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_source_requests_company ON hermes_load_source_requests(company_id, status, updated_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_load_source_requests_status ON hermes_load_source_requests(status, updated_at DESC)").run();
}
