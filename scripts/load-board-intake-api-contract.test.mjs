import assert from "node:assert/strict";
import fs from "node:fs";

const schema = fs.readFileSync(new URL("../functions/api/_lib/load-board-schema.mjs", import.meta.url), "utf8");
const intake = fs.readFileSync(new URL("../functions/api/load-board/intake.ts", import.meta.url), "utf8");
const active = fs.readFileSync(new URL("../functions/api/load-board/active.ts", import.meta.url), "utf8");

assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_sources/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_records/);
assert.match(schema, /UNIQUE\(source_id, source_message_id, fingerprint\)/);
assert.match(schema, /credential_ref TEXT/);
assert.doesNotMatch(schema, /password_hash|password_salt|refresh_token|access_token/i);

assert.match(intake, /HERMES_LOADBOARD_INGEST_TOKEN/);
assert.match(intake, /Authorization/);
assert.match(intake, /send_enabled = 0/);
assert.match(intake, /car_hauling_ingest_allowed = 1/);
assert.match(intake, /car_hauling_outreach_hold = 1/);
assert.match(intake, /ON CONFLICT\(source_id, source_message_id, fingerprint\)/);
assert.match(intake, /clampVisibility/);
assert.match(intake, /outbound_enabled: false/);

assert.match(active, /getAuthenticatedSpecialist/);
assert.match(active, /carrier\|owner\[- \]\?operator\|dispatcher/i);
assert.match(active, /visibility IN \('public', 'carrier_only'\)/);
assert.match(active, /visibility = 'public'/);
assert.match(active, /contact_details_exposed: false/);
assert.match(active, /X-Robots-Tag/);
assert.doesNotMatch(active, /source_message_id|raw_evidence_ref|mailbox_email|credential_ref/);

console.log("load-board-intake-api-contract: source registry, intake HOLD, visibility and safe projection verified");
