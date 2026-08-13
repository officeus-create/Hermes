-- Adds a private per-specialist note per client, keyed by the client's email
-- (the only stable identifier we collect from clients today).

CREATE TABLE IF NOT EXISTS client_notes (
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (specialist_id, client_email)
);
