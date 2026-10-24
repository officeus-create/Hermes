import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/load-board/intake.ts";

// Execute the real Cloudflare Pages handler with an in-memory D1 boundary.
// Only schema DDL is permitted before authorization. No provider/network calls.
const valid = {
  request_status: "approved",
  connection_state: "ingest_enabled",
  registered_source_id: "src_verified",
  registered_source_status: "ingest_enabled",
  registered_read_enabled: 1,
  registered_ingest_enabled: 1,
  approved_source_type: "email",
  approved_redistribution_permission: "carrier_only",
  approved_contact_reveal_permission: "hidden",
  car_hauling_ingest_allowed: 1,
};
const basePayload = () => ({
  source: {
    id: "src_verified",
    name: "Approved Freight Distribution",
    provider: "email",
    source_type: "email",
    redistribution_permission: "public", // Must not upgrade the approved source.
    contact_reveal_permission: "source_direct",
  },
  quarantine: [{
    source_message_id: "mail-fixture-0001",
    fingerprint: "fixture-sha",
    reason: "missing_load_fields",
    received_at: "2026-10-24T12:00:00.000Z",
    observed_at: "2026-10-24T12:00:00.000Z",
  }],
});

function stubDb(source, { sourceUpdateChanges = 1 } = {}) {
  const dataWrites = [];
  const db = {
    prepare(sql) {
      return {
        bind(...args) { this.args = args; return this; },
        async first() {
          if (sql.includes("FROM hermes_load_source_requests r")) return source;
          return null;
        },
        async all() { return { results: [] }; },
        async run() {
          if (/\b(UPDATE|INSERT INTO|DELETE FROM) hermes_load_(sources|records|quarantine)\b/i.test(sql)) {
            dataWrites.push({ sql: sql.trim().split("\n")[0].trim(), args: this.args || [] });
          }
          return { success: true, meta: { changes: /UPDATE hermes_load_sources/i.test(sql) ? sourceUpdateChanges : 1 } };
        },
      };
    },
  };
  return { db, dataWrites };
}

async function attempt(source, payload = basePayload(), token = "fixture-token", options = {}) {
  const { db, dataWrites } = stubDb(source, options);
  const request = new Request("https://hermes.example/api/load-board/intake", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const response = await onRequestPost({ request, env: { DB: db, HERMES_LOADBOARD_INGEST_TOKEN: "fixture-token" } });
  return { status: response.status, body: await response.json(), dataWrites };
}

const negatives = [
  ["unknown source", null, "source_approval_required"],
  ["request not approved", { ...valid, request_status: "pending_review" }, "source_request_not_approved"],
  ["unknown approval status", { ...valid, request_status: null }, "source_request_not_approved"],
  ["connection pending", { ...valid, connection_state: "connection_pending" }, "source_connection_not_ingest_enabled"],
  ["revoked connection", { ...valid, connection_state: "revoked" }, "source_connection_not_ingest_enabled"],
  ["missing registered source", { ...valid, registered_source_id: null }, "source_ingest_not_enabled"],
  ["disabled registered source", { ...valid, registered_source_status: "revoked" }, "source_ingest_not_enabled"],
  ["registered read off", { ...valid, registered_read_enabled: 0 }, "source_ingest_not_enabled"],
  ["registered ingest off", { ...valid, registered_ingest_enabled: null }, "source_ingest_not_enabled"],
  ["no source type", { ...valid, approved_source_type: null }, "source_type_mismatch"],
  ["source type mismatch", { ...valid, approved_source_type: "webhook" }, "source_type_mismatch"],
];
for (const [name, source, expected] of negatives) {
  const result = await attempt(source);
  assert.equal(result.status, 409, name);
  assert.equal(result.body.error, expected, name);
  assert.deepEqual(result.dataWrites, [], `${name}: data mutation before source authorization`);
}

const deniedToken = await attempt(valid, basePayload(), "not-the-secret");
assert.equal(deniedToken.status, 401);
assert.deepEqual(deniedToken.dataWrites, []);

const concurrentUnknown = await Promise.all([attempt(null), attempt(null)]);
for (const result of concurrentUnknown) {
  assert.equal(result.status, 409, "concurrent unknown source must fail closed");
  assert.equal(result.body.error, "source_approval_required");
  assert.deepEqual(result.dataWrites, [], "concurrent reject must not create or mutate source data");
}

const repeatedUnknown = [await attempt(null), await attempt(null)];
for (const result of repeatedUnknown) {
  assert.equal(result.status, 409, "repeated unknown-source reject must stay idempotent");
  assert.equal(result.body.error, "source_approval_required");
  assert.deepEqual(result.dataWrites, [], "repeated reject must not create or mutate source data");
}

const rejectionLogs = [];
const originalInfo = console.info;
console.info = (...args) => rejectionLogs.push(args.join(" "));
try {
  const rejectedUnknown = await attempt(null);
  assert.equal(rejectedUnknown.status, 409);
} finally {
  console.info = originalInfo;
}
assert.ok(rejectionLogs.some(line => line.includes('"metric":"source_rejected_total"')), "source rejection metric must be emitted");
assert.ok(rejectionLogs.every(line => !line.includes("fixture-token") && !line.includes("not-the-secret")), "rejection logs must not contain bearer tokens");

const granted = await attempt(valid);
assert.equal(granted.status, 202, "approved source must retain the positive ingest path");
assert.equal(granted.body.quarantined, 1);
assert.equal(granted.body.accepted, 0);
assert.equal(granted.body.managed_source_lifecycle, true);
assert.equal(granted.body.outbound_enabled, false);
assert.equal(granted.dataWrites.filter(x => x.sql.includes("hermes_load_quarantine")).length, 1);
assert.equal(granted.dataWrites.filter(x => x.sql.includes("hermes_load_sources")).length, 1);
assert.ok(!granted.dataWrites.some(x => x.sql.includes("INSERT INTO hermes_load_sources")));

// Simulated mid-request revocation: the guarded UPDATE finds zero eligible rows.
const raced = await attempt(valid, basePayload(), "fixture-token", { sourceUpdateChanges: 0 });
assert.equal(raced.status, 409);
assert.equal(raced.body.error, "source_ingest_state_changed");
assert.equal(raced.dataWrites.length, 1, "only the attempted guarded UPDATE is allowed");

const livePayload = basePayload();
livePayload.quarantine = [];
livePayload.records = [{
  source_message_id: "approved-load-0001",
  fingerprint: "f-car-haul-0001",
  record_type: "load",
  origin: "Chicago, IL",
  destination: "Milwaukee, WI",
  equipment: "car_hauler",
  vehicle_count: 2,
  rate_amount: 800,
  visibility: "public", // Caller requests public, approved source permits carrier_only.
  status: "available",
  received_at: "2026-10-24T12:00:00.000Z",
  observed_at: "2026-10-24T12:00:00.000Z",
  expires_at: "2090-10-25T12:00:00.000Z",
}];
const live = await attempt(valid, livePayload);
assert.equal(live.status, 202, "authorized LOAD must be accepted");
assert.equal(live.body.accepted, 1, "authorized LOAD count");
const recordWrites = live.dataWrites.filter(x => x.sql.includes("INSERT INTO hermes_load_records"));
assert.equal(recordWrites.length, 1, "exactly one LOAD record insert");
assert.ok(recordWrites[0].args.includes("carrier_only"), "approved source rights must cap caller's public request");
assert.ok(!recordWrites[0].args.includes("public"), "no public visibility escalation");

const spoofed = basePayload();
spoofed.source.source_type = "webhook";
const mismatch = await attempt(valid, spoofed);
assert.equal(mismatch.status, 409);
assert.equal(mismatch.body.error, "source_type_mismatch");
assert.deepEqual(mismatch.dataWrites, []);

console.log("load-board-source-admission-runtime: unknown/pending/revoked/disabled/missing/forged sources fail closed; approved source quarantines and imports private LOAD; revoked D1 update denies writes; no provider writes");
