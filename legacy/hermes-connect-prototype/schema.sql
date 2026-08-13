-- Hermes Connect prototype — D1 schema (real accounts, still test-booking only)

CREATE TABLE IF NOT EXISTS specialists (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT NOT NULL,
  created_at TEXT NOT NULL,
  telegram_id TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_specialists_telegram_id ON specialists(telegram_id) WHERE telegram_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  owner_specialist_id TEXT REFERENCES specialists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_services_owner ON services(owner_specialist_id);

CREATE TABLE IF NOT EXISTS availability_slots (
  slot TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS specialist_services (
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id),
  PRIMARY KEY (specialist_id, service_id)
);

CREATE TABLE IF NOT EXISTS specialist_availability (
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  slot TEXT NOT NULL REFERENCES availability_slots(slot),
  PRIMARY KEY (specialist_id, slot)
);

CREATE TABLE IF NOT EXISTS staff_members (
  id TEXT PRIMARY KEY,
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_members_specialist ON staff_members(specialist_id);

CREATE TABLE IF NOT EXISTS staff_services (
  staff_id TEXT NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id),
  PRIMARY KEY (staff_id, service_id)
);

CREATE TABLE IF NOT EXISTS staff_availability (
  staff_id TEXT NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  slot TEXT NOT NULL REFERENCES availability_slots(slot),
  PRIMARY KEY (staff_id, slot)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id),
  slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'test_booking_created',
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  contact_method TEXT,
  contact_handle TEXT,
  booking_type TEXT NOT NULL DEFAULT 'appointment',
  meeting_topic TEXT,
  meeting_link TEXT,
  staff_id TEXT REFERENCES staff_members(id) ON DELETE SET NULL,
  access_token TEXT UNIQUE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_access_token ON bookings(access_token);

CREATE TABLE IF NOT EXISTS client_notes (
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (specialist_id, client_email)
);

INSERT OR IGNORE INTO services (id, name, duration_minutes) VALUES
  ('strategy-session', 'Strategy session', 45),
  ('operations-review', 'Operations review', 60),
  ('website-consultation', 'Website consultation', 45),
  ('personal-meeting', 'Personal meeting', 30);

INSERT OR IGNORE INTO availability_slots (slot) VALUES
  ('Tue · 10:30 AM'),
  ('Tue · 2:00 PM'),
  ('Wed · 9:00 AM'),
  ('Wed · 1:30 PM'),
  ('Thu · 11:00 AM');
