import assert from "node:assert/strict";
import fs from "node:fs";

const schema = fs.readFileSync(new URL("../functions/api/_lib/load-board-schema.mjs", import.meta.url), "utf8");
const intake = fs.readFileSync(new URL("../functions/api/load-board/intake.ts", import.meta.url), "utf8");
const active = fs.readFileSync(new URL("../functions/api/load-board/active.ts", import.meta.url), "utf8");

assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_sources/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_records/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_quarantine/);
assert.match(schema, /UNIQUE\(source_id, source_message_id, fingerprint\)/);
assert.match(schema, /credential_ref TEXT/);
assert.match(schema, /car_hauling_ingest_allowed INTEGER NOT NULL DEFAULT 0/);
assert.match(schema, /pending_review/);
assert.doesNotMatch(schema, /password_hash|password_salt|refresh_token|access_token/i);

assert.match(intake, /HERMES_LOADBOARD_INGEST_TOKEN/);
assert.match(intake, /Authorization/);
assert.match(intake, /send_enabled = 0/);
assert.match(intake, /car_hauling_ingest_allowed = 1/);
assert.match(intake, /car_hauling_outreach_hold = 1/);
assert.doesNotMatch(intake, /reason: "car_hauling_hold"/);
assert.match(intake, /car_hauling_ingest_allowed: true/);
assert.match(intake, /car_hauling_broker_outreach_hold: true/);
assert.match(intake, /ON CONFLICT\(source_id, source_message_id, fingerprint\)/);
assert.match(intake, /INSERT INTO hermes_load_quarantine/);
assert.match(intake, /quarantined/);
assert.match(intake, /items_required/);
assert.match(intake, /clampVisibility/);
assert.match(intake, /outbound_enabled: false/);

assert.match(active, /getAuthenticatedSpecialist/);
assert.match(active, /carrier\|owner\[- \]\?operator\|dispatcher/i);
assert.match(active, /visibility IN \('public', 'carrier_only'\)/);
assert.match(active, /visibility = 'public'/);
for (const equipment of [
  "dry_van",
  "reefer",
  "flatbed",
  "step_deck",
  "power_only",
  "hotshot",
  "box_truck",
  "sprinter_van",
  "car_hauler",
]) {
  assert.match(active, new RegExp(`"${equipment}"`));
}
assert.match(active, /contact_details_exposed: false/);
assert.match(active, /X-Robots-Tag/);
assert.doesNotMatch(active, /source_message_id|raw_evidence_ref|mailbox_email|credential_ref/);
assert.doesNotMatch(active, /hermes_load_quarantine/);

console.log("load-board-intake-api-contract: general-freight intake, quarantine, complete equipment projection, Car Hauling ingestion allowed with broker outreach HOLD, visibility and safe projection verified");
await import("./load-board-email-bridge-contract.test.mjs");