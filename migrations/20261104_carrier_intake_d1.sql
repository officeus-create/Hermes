-- ONE-TIME, OWNER-APPROVED D1 MIGRATION. THIS PR DOES NOT APPLY IT.
-- Existing Hermes Connect DB only; never a second CRM/database.
-- Runtime capture also requires an explicit finite CARRIER_INTAKE_RETENTION_DAYS value.
CREATE TABLE IF NOT EXISTS hermes_carrier_intake (
  request_id TEXT PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('commercial','qa')),
  source_path TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  email_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','reviewed','qualified','closed')),
  status_updated_at TEXT,
  status_updated_by TEXT,
  status_review_code TEXT CHECK (
    status_review_code IS NULL OR status_review_code IN (
      'initial_owner_review','manual_carrier_qualification','manual_followup_closed'
    )
  ),
  qualification_authority_verified INTEGER NOT NULL DEFAULT 0 CHECK (qualification_authority_verified IN (0,1)),
  qualification_insurance_verified INTEGER NOT NULL DEFAULT 0 CHECK (qualification_insurance_verified IN (0,1)),
  qualification_equipment_capacity_verified INTEGER NOT NULL DEFAULT 0 CHECK (qualification_equipment_capacity_verified IN (0,1)),
  qualification_operating_fit_verified INTEGER NOT NULL DEFAULT 0 CHECK (qualification_operating_fit_verified IN (0,1)),
  delivery_state TEXT NOT NULL DEFAULT 'not_sent' CHECK (delivery_state='not_sent'),
  created_at TEXT NOT NULL,
  retention_until TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hermes_carrier_intake_status
  ON hermes_carrier_intake(classification,status,created_at DESC,request_id DESC);
CREATE INDEX IF NOT EXISTS idx_hermes_carrier_intake_retention
  ON hermes_carrier_intake(retention_until);
