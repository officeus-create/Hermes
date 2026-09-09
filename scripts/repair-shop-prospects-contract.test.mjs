import assert from "node:assert/strict";
import fs from "node:fs";

const helper = fs.readFileSync("functions/api/_lib/repair-shop-prospects.mjs", "utf8");
const api = fs.readFileSync("functions/api/internal/repair-shop-prospects.ts", "utf8");
const page = fs.readFileSync("src/pages/services/hermes-connect/internal/prospects/index.astro", "utf8");

for (const ref of ["VY-0001", "VY-0002", "VY-0003", "VY-0007", "VY-0024"]) {
  assert.match(helper, new RegExp(ref), `Expected selected VADYM prospect ${ref}`);
}
for (const excluded of ["VY-0004", "VY-0005", "VY-0009", "VY-0019"]) {
  assert.doesNotMatch(helper, new RegExp(excluded), `Active/duplicate sales row ${excluded} must not be seeded`);
}

assert.match(helper, /CREATE TABLE IF NOT EXISTS repair_shop_prospects/);
assert.match(helper, /source_ref TEXT NOT NULL UNIQUE/);
assert.match(helper, /profile_state TEXT NOT NULL DEFAULT 'prefilled'/);
assert.match(helper, /claim_state TEXT NOT NULL DEFAULT 'unclaimed'/);
assert.match(helper, /public_profile_enabled INTEGER NOT NULL DEFAULT 0/);
assert.match(helper, /INSERT OR IGNORE INTO repair_shop_prospects/);
assert.doesNotMatch(helper, /INSERT(?:\s+OR\s+\w+)?\s+INTO\s+repair_shops\b/i, "Prospect seed must never create a live repair_shop");
assert.doesNotMatch(helper, /owner_specialist_id\s*:/i, "Prospect fixtures must not impersonate a real owner");
assert.match(helper, /PUBLIC-WEB-SEANS-AUTOPRO-20260909/);
assert.match(helper, /ensurePublicDirectoryProspects/);
assert.match(helper, /public_profile_enabled=1/);


assert.match(api, /requireInternalOwner/);
assert.match(api, /ensureVadymPrefilledProspects/);
assert.match(api, /counted_as_registration:\s*false/);
assert.match(api, /public_booking_enabled:\s*false/);
assert.match(api, /claim_ready:\s*false/);
assert.doesNotMatch(api, /onRequestPost/, "Initial prospect ledger must remain read-only; claim is a separate verified-owner flow");
assert.doesNotMatch(api, /INSERT(?:\s+OR\s+\w+)?\s+INTO\s+repair_shops\b/i);

assert.match(page, /robots="noindex,nofollow"/);
assert.match(page, /\/api\/internal\/repair-shop-prospects/);
assert.match(page, /Booking off until claim/);
assert.match(page, /Not counted as registrations/);
assert.doesNotMatch(page, /\/api\/repair-shop\/booking|\/api\/public\/repair-shop/i, "Private prospect screen must not create public booking/profile state");

const selectedCount = (helper.match(/source_ref:\s*"VY-/g) || []).length;
assert.equal(selectedCount, 5, "Exactly five VADYM prospects must be prefilled in this slice");

console.log("Repair Shop prospect prefill contract: PASS");
