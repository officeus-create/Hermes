import assert from "node:assert/strict";
import {
  evaluateIndependentHeartbeat,
  runIndependentHeartbeatWatch,
} from "./hae-independent-heartbeat-watch.mjs";

const sha = "a".repeat(40);
const now = "2026-11-03T12:00:00Z";

const ok = evaluateIndependentHeartbeat({
  now,
  max_age_minutes: 150,
  heartbeat: {
    trigger_type: "cron",
    observed_at: "2026-11-03T11:17:00Z",
    source_sha: sha,
  },
});
assert.equal(ok.status, "OK");
assert.equal(ok.incidents.length, 0);
assert.equal(ok.source_sha, sha);

const stale = evaluateIndependentHeartbeat({
  now,
  max_age_minutes: 150,
  heartbeat: {
    trigger_type: "cron",
    observed_at: "2026-11-03T08:17:00Z",
    source_sha: sha,
  },
});
assert.equal(stale.status, "INCIDENT");
assert.equal(stale.incidents[0].code, "HAE_HEARTBEAT_STALE");

const unknownSha = evaluateIndependentHeartbeat({
  now,
  heartbeat: {
    trigger_type: "cron",
    observed_at: "2026-11-03T11:17:00Z",
    source_sha: "",
  },
});
assert.equal(unknownSha.status, "INCIDENT");
assert.equal(unknownSha.incidents[0].code, "HAE_SOURCE_SHA_UNVERIFIED");

const calls = [];
const fetchImpl = async (url, options = {}) => {
  calls.push({ url, method: options.method || "GET", body: options.body || null });
  if (url.includes("/pages/projects/hermes")) {
    return {
      ok: true,
      async json() {
        return {
          success: true,
          result: {
            deployment_configs: {
              production: { d1_databases: { DB: { id: "12345678-1234-1234-1234-123456789012" } } },
            },
          },
        };
      },
    };
  }
  if (url.includes("/d1/database/")) {
    return {
      ok: true,
      async json() {
        return {
          success: true,
          result: [{
            results: [{
              trigger_type: "cron",
              scheduled_at: "2026-11-03T11:17:00Z",
              observed_at: "2026-11-03T11:17:03Z",
              source_sha: sha,
              automation_mode: "dry_run",
              publication_enabled: 0,
            }],
          }],
        };
      },
    };
  }
  throw new Error("unexpected mock URL");
};

const receipt = await runIndependentHeartbeatWatch({
  cloudflareToken: "test-token",
  accountId: "f".repeat(32),
  now,
  fetchImpl,
});
assert.equal(receipt.status, "OK");
assert.equal(receipt.database_binding_verified, true);
assert.equal(receipt.query_mode, "READ_ONLY_SELECT");
assert.equal(receipt.external_writes, 0);
assert.equal(calls.length, 2);
assert.equal(calls[0].method, "GET");
assert.equal(calls[1].method, "POST");
assert.match(String(calls[1].body), /SELECT trigger_type/);
assert.doesNotMatch(String(calls[1].body), /INSERT|UPDATE|DELETE|CREATE|DROP/i);

console.log("HAE independent heartbeat watchdog PASS: external read-only monitor catches stale/missing runtime heartbeat");
