-- Hermes Automation Engine V1 durable runtime schema
-- Canonical owner: GitHub #1018 Growth Bridge

CREATE TABLE IF NOT EXISTS hermes_automation_runs (
  id TEXT PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  slot_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  last_error_class TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hermes_automation_content (
  content_id TEXT PRIMARY KEY,
  account_key TEXT NOT NULL,
  platform TEXT NOT NULL,
  slot_key TEXT NOT NULL UNIQUE,
  template_id TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  body TEXT NOT NULL,
  state TEXT NOT NULL,
  provider_post_id TEXT,
  permalink TEXT,
  last_error_class TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hae_content_state
ON hermes_automation_content(state, updated_at);

CREATE TABLE IF NOT EXISTS hermes_automation_publications (
  idempotency_key TEXT PRIMARY KEY,
  content_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  readback_attempt INTEGER NOT NULL DEFAULT 0,
  next_readback_at TEXT,
  provider_post_id TEXT,
  permalink TEXT,
  last_error_class TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hae_publication_status
ON hermes_automation_publications(status, updated_at);

-- V1.1 generic job/event tables are included now so the social pilot can grow
-- into the Hermes Connect Automation Center without a second execution store.
CREATE TABLE IF NOT EXISTS hermes_automation_jobs (
  job_id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  business_lane TEXT NOT NULL,
  account_key TEXT,
  project_key TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  state TEXT NOT NULL,
  current_step TEXT,
  available_at TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  idempotency_key TEXT NOT NULL UNIQUE,
  policy_version TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT,
  last_error_class TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_hae_jobs_state_available
ON hermes_automation_jobs(state, available_at, priority DESC);

CREATE TABLE IF NOT EXISTS hermes_automation_job_events (
  event_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT NOT NULL,
  step TEXT,
  evidence_ref TEXT,
  provider_ref TEXT,
  error_class TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(job_id) REFERENCES hermes_automation_jobs(job_id)
);

CREATE INDEX IF NOT EXISTS idx_hae_job_events_job_created
ON hermes_automation_job_events(job_id, created_at);