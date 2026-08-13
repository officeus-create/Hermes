-- Adds messenger contact identity and personal-meeting-mode support to bookings.
-- Run against both local and remote D1.

ALTER TABLE bookings ADD COLUMN contact_method TEXT;
ALTER TABLE bookings ADD COLUMN contact_handle TEXT;
ALTER TABLE bookings ADD COLUMN booking_type TEXT NOT NULL DEFAULT 'appointment';
ALTER TABLE bookings ADD COLUMN meeting_topic TEXT;
ALTER TABLE bookings ADD COLUMN meeting_link TEXT;

-- Placeholder service row so meeting-mode bookings can satisfy the existing
-- services FK without a real service being offered by the specialist.
INSERT OR IGNORE INTO services (id, name, duration_minutes) VALUES
  ('personal-meeting', 'Personal meeting', 30);
