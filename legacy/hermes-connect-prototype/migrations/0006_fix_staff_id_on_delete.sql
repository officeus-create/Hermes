-- Corrects bookings.staff_id, which shipped in 0005 without ON DELETE SET
-- NULL, so removing a staff member with any past bookings failed with a
-- foreign-key constraint error instead of just detaching the booking from
-- that staff member. SQLite can't ALTER a column's FK action in place, so
-- this rebuilds the table. Only needed on databases that already ran the
-- unfixed 0005 — a database applying the corrected 0005 fresh doesn't need
-- this migration.

PRAGMA foreign_keys=OFF;

CREATE TABLE bookings_new (
  id TEXT PRIMARY KEY,
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id),
  slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'test_booking_created',
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  access_token TEXT UNIQUE,
  created_at TEXT NOT NULL,
  contact_method TEXT,
  contact_handle TEXT,
  booking_type TEXT NOT NULL DEFAULT 'appointment',
  meeting_topic TEXT,
  meeting_link TEXT,
  staff_id TEXT REFERENCES staff_members(id) ON DELETE SET NULL
);

INSERT INTO bookings_new SELECT * FROM bookings;

DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;

CREATE INDEX IF NOT EXISTS idx_bookings_access_token ON bookings(access_token);

PRAGMA foreign_keys=ON;
