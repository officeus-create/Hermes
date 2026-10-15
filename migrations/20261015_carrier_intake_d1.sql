-- ONE-TIME, OWNER-APPROVED D1 MIGRATION (NOT APPLIED BY THIS PR)
-- Scope: existing Hermes Connect production D1 binding DB; never a second database.
-- Apply only after owner Cloudflare release approval; preview must not inherit production DB.
-- No triggers, automated mail, staff notifications, or account grants.
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
);
CREATE INDEX IF NOT EXISTS idx_hermes_carrier_intake_status
  ON hermes_carrier_intake(classification, status, created_at DESC, request_id DESC);
CREATE INDEX IF NOT EXISTS idx_hermes_carrier_intake_retention
  ON hermes_carrier_intake(retention_until);
-- Release gate: private authorized Sales/CEO triage, data retention erasure,
-- Cloudflare live DB binding readback and real human receipt, all separately verified.
