-- Lets a specialist define their own services instead of only picking from
-- the fixed global seed catalog (Strategy session/Operations review/Website
-- consultation) — the actual blocker for supporting verticals beyond
-- consulting-flavored placeholders. NULL owner = shared/global seed service,
-- visible to everyone; a set owner = a private custom service, visible only
-- to that specialist and their own staff.

ALTER TABLE services ADD COLUMN owner_specialist_id TEXT REFERENCES specialists(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_services_owner ON services(owner_specialist_id);
