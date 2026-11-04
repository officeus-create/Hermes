import assert from "node:assert/strict";
import {
  buildSchemaSnapshot,
  extractRowsFromCloudflareResponse,
  normalizeSchemaObjects,
  schemaFingerprint,
  validateMigrationManifestForSnapshot,
  validateSchemaSnapshotArtifact,
} from "./hae-d1-schema-snapshot.mjs";

const sha = "a".repeat(40);
const otherSha = "b".repeat(40);
const databaseName = "hermes-connect-prototype";
const databaseBindingFingerprint = "sha256:" + "1".repeat(64);

function response(rows, overrides = {}) {
  return {
    success: true,
    result: [{ success: true, results: rows }],
    ...overrides,
  };
}

const rows = [
  { type: "table", name: "Ω_table", tbl_name: "Ω_table", sql: "CREATE TABLE Ω_table(id INTEGER)" },
  { type: "index", name: "idx_A", tbl_name: "A_table", sql: "CREATE INDEX idx_A ON A_table(id)" },
  { type: "table", name: "é_table", tbl_name: "é_table", sql: "CREATE TABLE é_table(id INTEGER)" },
  { type: "table", name: "A_table", tbl_name: "A_table", sql: "CREATE TABLE A_table(id INTEGER)" },
  { type: "table", name: "sqlite_sequence", tbl_name: "sqlite_sequence", sql: "CREATE TABLE sqlite_sequence(name,seq)" },
  { type: "table", name: "_cf_KV", tbl_name: "_cf_KV", sql: "CREATE TABLE _cf_KV(key TEXT PRIMARY KEY,value BLOB) WITHOUT ROWID" },
];

const artifact = buildSchemaSnapshot({ response: response(rows), targetSha: sha, databaseName, databaseBindingFingerprint });
assert.equal(artifact.target_sha, sha);
assert.equal(artifact.database_name, databaseName);
assert.equal(artifact.database_binding_fingerprint, databaseBindingFingerprint);
assert.equal(artifact.object_count, 4);
assert.ok(!artifact.objects.some((item) => item.name === "_cf_KV"), "Reserved Cloudflare D1 storage table must never enter the business schema fingerprint");
assert.equal(artifact.normalization, "sqlite_master_non_internal_v2");
assert.deepEqual(
  artifact.objects.map((item) => [item.type, item.name]),
  [
    ["index", "idx_A"],
    ["table", "A_table"],
    ["table", "é_table"],
    ["table", "Ω_table"],
  ],
);
assert.match(artifact.fingerprint, /^sha256:[0-9a-f]{64}$/);
assert.deepEqual(artifact.safety, {
  d1_write: false,
  provider_write: false,
  queue_provision: false,
  worker_deploy: false,
  migration_baseline_mutated: false,
});

const reordered = buildSchemaSnapshot({ response: response([...rows].reverse()), targetSha: sha, databaseName, databaseBindingFingerprint });
assert.deepEqual(reordered.objects, artifact.objects);
assert.equal(reordered.fingerprint, artifact.fingerprint, "Input order and locale must not affect fingerprint");

const sqlChangedRows = rows.map((row) => row.name === "A_table"
  ? { ...row, sql: "CREATE TABLE A_table(id INTEGER, note TEXT)" }
  : row);
const sqlChanged = buildSchemaSnapshot({ response: response(sqlChangedRows), targetSha: sha, databaseName, databaseBindingFingerprint });
assert.notEqual(sqlChanged.fingerprint, artifact.fingerprint, "DDL change must change schema fingerprint");

assert.throws(() => normalizeSchemaObjects([]), /schema_empty/);
assert.throws(
  () => normalizeSchemaObjects([{ type: "table", name: "sqlite_sequence", tbl_name: "sqlite_sequence", sql: "CREATE TABLE sqlite_sequence(name,seq)" }]),
  /schema_empty/,
);
assert.throws(
  () => normalizeSchemaObjects([{ type: "table", name: "_cf_KV", tbl_name: "_cf_KV", sql: "CREATE TABLE _cf_KV(key TEXT PRIMARY KEY,value BLOB) WITHOUT ROWID" }]),
  /schema_empty/,
);
assert.throws(
  () => normalizeSchemaObjects([
    { type: "table", name: "dup", tbl_name: "dup", sql: "CREATE TABLE dup(id INTEGER)" },
    { type: "table", name: "dup", tbl_name: "dup", sql: "CREATE TABLE dup(id INTEGER)" },
  ]),
  /schema_object_duplicate/,
);
assert.throws(
  () => normalizeSchemaObjects([{ type: "pragma", name: "x", tbl_name: "x", sql: "x" }]),
  /schema_object_type_invalid/,
);
assert.throws(
  () => normalizeSchemaObjects([{ type: "table", name: "x", tbl_name: "x", sql: null }]),
  /schema_sql_missing/,
);

assert.throws(() => extractRowsFromCloudflareResponse(null), /cloudflare_response_invalid/);
assert.throws(() => extractRowsFromCloudflareResponse({ success: false, result: [] }), /cloudflare_response_unsuccessful/);
assert.throws(() => extractRowsFromCloudflareResponse({ success: true, result: [] }), /cloudflare_result_invalid/);
assert.throws(() => extractRowsFromCloudflareResponse({ success: true, result: [{ success: false, results: [] }] }), /cloudflare_statement_unsuccessful/);
assert.throws(() => extractRowsFromCloudflareResponse({ success: true, result: [{ success: true, results: null }] }), /cloudflare_results_invalid/);

assert.throws(() => buildSchemaSnapshot({ response: response(rows), targetSha: "bad", databaseName, databaseBindingFingerprint }), /target_sha_invalid/);
assert.throws(() => buildSchemaSnapshot({ response: response(rows), targetSha: sha, databaseName: "", databaseBindingFingerprint }), /database_name_missing/);
assert.throws(() => buildSchemaSnapshot({ response: response(rows), targetSha: sha, databaseName, databaseBindingFingerprint: "bad" }), /database_binding_fingerprint_invalid/);

const manifest = {
  canonical_database: databaseName,
  baseline_status: "PENDING_RUNTIME_SNAPSHOT",
  migration_files: [],
};
assert.equal(validateMigrationManifestForSnapshot(manifest), databaseName);
assert.throws(
  () => validateMigrationManifestForSnapshot({ ...manifest, baseline_status: "VERIFIED" }),
  /migration_baseline_not_pending/,
);
assert.throws(
  () => validateMigrationManifestForSnapshot({ ...manifest, migration_files: ["0001.sql"] }),
  /migration_files_present_before_snapshot/,
);

const verified = validateSchemaSnapshotArtifact(artifact, {
  expectedTargetSha: sha,
  expectedDatabaseName: databaseName,
  expectedDatabaseBindingFingerprint: databaseBindingFingerprint,
});
assert.equal(verified.fingerprint, artifact.fingerprint);

assert.throws(
  () => validateSchemaSnapshotArtifact({ ...artifact, database_binding_fingerprint: "sha256:" + "2".repeat(64) }, {
    expectedTargetSha: sha,
    expectedDatabaseName: databaseName,
    expectedDatabaseBindingFingerprint: databaseBindingFingerprint,
  }),
  /snapshot_database_binding_fingerprint_mismatch/,
);

assert.throws(
  () => validateSchemaSnapshotArtifact(artifact, { expectedTargetSha: otherSha, expectedDatabaseName: databaseName }),
  /snapshot_target_sha_mismatch/,
);
assert.throws(
  () => validateSchemaSnapshotArtifact(artifact, { expectedTargetSha: sha, expectedDatabaseName: "wrong-db" }),
  /snapshot_database_name_mismatch/,
);
assert.throws(
  () => validateSchemaSnapshotArtifact({ ...artifact, object_count: artifact.object_count + 1 }, {
    expectedTargetSha: sha,
    expectedDatabaseName: databaseName,
  }),
  /snapshot_object_count_mismatch/,
);
assert.throws(
  () => validateSchemaSnapshotArtifact({ ...artifact, account_id: "should-never-ship" }, {
    expectedTargetSha: sha,
    expectedDatabaseName: databaseName,
  }),
  /snapshot_top_level_fields_invalid/,
);
assert.throws(
  () => validateSchemaSnapshotArtifact({ ...artifact, normalization: "locale_dependent_v0" }, {
    expectedTargetSha: sha,
    expectedDatabaseName: databaseName,
  }),
  /snapshot_normalization_invalid/,
);
assert.throws(
  () => validateSchemaSnapshotArtifact({
    ...artifact,
    safety: { ...artifact.safety, secret: "should-never-ship" },
  }, {
    expectedTargetSha: sha,
    expectedDatabaseName: databaseName,
  }),
  /snapshot_safety_fields_invalid/,
);
assert.throws(
  () => validateSchemaSnapshotArtifact({ ...artifact, fingerprint: "sha256:" + "0".repeat(64) }, {
    expectedTargetSha: sha,
    expectedDatabaseName: databaseName,
  }),
  /snapshot_fingerprint_mismatch/,
);
assert.throws(
  () => validateSchemaSnapshotArtifact({ ...artifact, objects: [...artifact.objects].reverse() }, {
    expectedTargetSha: sha,
    expectedDatabaseName: databaseName,
  }),
  /snapshot_objects_not_canonical/,
);

for (const flag of ["d1_write", "provider_write", "queue_provision", "worker_deploy", "migration_baseline_mutated"]) {
  assert.throws(
    () => validateSchemaSnapshotArtifact({
      ...artifact,
      safety: { ...artifact.safety, [flag]: true },
    }, {
      expectedTargetSha: sha,
      expectedDatabaseName: databaseName,
    }),
    new RegExp(`snapshot_safety_violation_${flag}`),
  );
}

const fingerprintFromObjects = schemaFingerprint(artifact.objects);
assert.equal(fingerprintFromObjects, artifact.fingerprint);

console.log("HAE D1 schema snapshot contract PASS");
