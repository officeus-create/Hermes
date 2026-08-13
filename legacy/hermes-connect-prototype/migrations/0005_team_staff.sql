-- Adds a team layer: a business account (specialists row) can add staff
-- members, each with their own services/availability. Businesses with zero
-- staff rows keep booking directly against the specialist's own catalog,
-- exactly as before — this is additive, not a breaking change.

CREATE TABLE IF NOT EXISTS staff_members (
  id TEXT PRIMARY KEY,
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

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

-- ON DELETE SET NULL: removing a staff member must not delete or block
-- deletion of their past bookings — the booking just falls back to being
-- attributed to the business account only.
ALTER TABLE bookings ADD COLUMN staff_id TEXT REFERENCES staff_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_staff_members_specialist ON staff_members(specialist_id);
