// The canonical Hermes Connect D1 database owns this private intake record.
// No separate CRM, public read endpoint, mailbox or outbound transport is created.
// Release remains disabled unless CARRIER_INTAKE_CAPTURE_MODE=capture_only is owner-authorized.
const classify = new Set(["commercial", "qa"]);

// Schema is provisioned once by owner-approved migrations/20261015_carrier_intake_d1.sql.
// Never re-run CREATE TABLE/INDEX for every customer request: D1 indexes cost
// both latency and rows-written. Missing schema fails closed without email.

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
