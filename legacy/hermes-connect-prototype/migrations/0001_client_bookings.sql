-- Adds client-facing booking support: a client books without a specialist
-- account (name/email/phone + a token to look up/cancel their own booking).
-- Run against both local and remote D1 — CREATE TABLE in schema.sql alone
-- does not retroactively alter an already-created table.

ALTER TABLE bookings ADD COLUMN client_name TEXT;
ALTER TABLE bookings ADD COLUMN client_email TEXT;
ALTER TABLE bookings ADD COLUMN client_phone TEXT;
ALTER TABLE bookings ADD COLUMN access_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_access_token ON bookings(access_token);
