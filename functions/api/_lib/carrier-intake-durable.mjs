// The canonical Hermes Connect D1 database owns this private intake record.
// No separate CRM, public read endpoint, mailbox or outbound transport is created.
// Release remains disabled unless CARRIER_INTAKE_CAPTURE_MODE=capture_only is owner-authorized.
const classify = new Set(["commercial", "qa"]);

export async function ensureCarrierIntakeSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_carrier_intake (
      request_id TEXT PRIMARY KEY,
      payload_hash TEXT NOT NULL,
      classification TEXT NOT NULL CHECK (classification IN ('commercial','qa')),
      source_path TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      email_body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new','reviewed','qualified','closed')),
      delivery_state TEXT NOT NULL DEFAULT 'not_sent'
        CHECK (delivery_state = 'not_sent'),
      created_at TEXT NOT NULL,
      retention_until TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hermes_carrier_intake_status ON hermes_carrier_intake(classification, status, created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hermes_carrier_intake_retention ON hermes_carrier_intake(retention_until)").run();
}

export async function readCarrierIntake(db, requestId) {
  return db.prepare("SELECT request_id, payload_hash, classification, delivery_state FROM hermes_carrier_intake WHERE request_id = ? LIMIT 1")
    .bind(requestId).first();
}

export async function persistCarrierIntake(db, input) {
  const existing = await readCarrierIntake(db, input.requestId);
  if (existing) return { created: false, conflict: existing.payload_hash !== input.payloadHash, row: existing };
  if (!classify.has(input.classification)) throw new Error("invalid_carrier_classification");

  const createdAt = new Date().toISOString();
  const retentionUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
  let inserted = false;
  try {
    // D1 SQLite uniqueness provides idempotency across concurrent requests.
    const result = await db.prepare(`INSERT OR IGNORE INTO hermes_carrier_intake
      (request_id, payload_hash, classification, source_path, contact_email, email_body, created_at, retention_until)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(input.requestId, input.payloadHash, input.classification, input.sourcePath,
        input.contactEmail, input.emailBody, createdAt, retentionUntil).run();
    inserted = Number(result?.meta?.changes || 0) === 1;
  } catch (error) {
    const raced = await readCarrierIntake(db, input.requestId).catch(() => null);
    if (!raced) throw error;
  }
  const row = await readCarrierIntake(db, input.requestId);
  if (!row) throw new Error("carrier_capture_not_persisted");
  return { created: inserted, conflict: row.payload_hash !== input.payloadHash, row };
}
