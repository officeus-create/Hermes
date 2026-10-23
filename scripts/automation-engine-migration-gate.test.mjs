import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../workers/automation-engine/migrations/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", dir), "utf8"));
const sqlFiles = readdirSync(dir).filter((name) => /^\d+.*\.sql$/i.test(name)).sort();

assert.equal(manifest.schema_version, 1);
assert.equal(manifest.canonical_database, "hermes-connect-prototype");
assert.equal(manifest.destructive_migration_requires_owner_confirmation, true);
assert.ok(["PENDING_RUNTIME_SNAPSHOT", "VERIFIED"].includes(manifest.baseline_status));

if (manifest.baseline_status !== "VERIFIED") {
  assert.deepEqual(sqlFiles, [], "No D1 SQL migration may exist before the authenticated runtime schema baseline is VERIFIED");
  assert.equal(manifest.baseline_source_sha, null);
} else {
  assert.match(String(manifest.baseline_source_sha || ""), /^[0-9a-f]{40}$/, "Verified migration baseline requires exact source SHA");
  assert.deepEqual(manifest.migration_files, sqlFiles, "Migration manifest must list every numbered SQL migration exactly once and in order");
}

console.log(`HAE migration gate PASS: baseline=${manifest.baseline_status}, migrations=${sqlFiles.length}`);
