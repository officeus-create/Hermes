CREATE TABLE IF NOT EXISTS telegram_outbox (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind = 'client_progress'),
  text TEXT NOT NULL,
  nonce TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','sending','sent','ambiguous')),
  preview_message_id INTEGER,
  telegram_message_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  attempted_at TEXT,
  sent_at TEXT
);
CREATE INDEX IF NOT EXISTS telegram_outbox_ready ON telegram_outbox(status, created_at);
CREATE TABLE IF NOT EXISTS telegram_gateway_control (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  paused INTEGER NOT NULL DEFAULT 1 CHECK (paused IN (0, 1))
);
INSERT OR IGNORE INTO telegram_gateway_control (id, paused) VALUES (1, 1);
