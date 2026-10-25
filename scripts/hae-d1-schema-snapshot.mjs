import { createHash } from "node:crypto";
import fs from "node:fs";

const SHA40 = /^[0-9a-f]{40}$/;
const FINGERPRINT = /^sha256:[0-9a-f]{64}$/;
const ALLOWED_TYPES = new Set(["table", "index", "trigger", "view"]);
const RESERVED_D1_OBJECTS = new Set(["_cf_KV"]);
const SNAPSHOT_FIELDS = new Set([
  "schema_version",
  "evidence_type",
  "target_sha",
  "database_name",
  "normalization",
  "object_count",
  "objects",
  "fingerprint",
  "safety",
]);
const SAFETY_FIELDS = new Set([
  "d1_write",
  "provider_write",
  "queue_provision",
  "worker_deploy",
  "migration_baseline_mutated",
]);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function stableCompare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function hasExactKeys(value, allowed) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === allowed.size && keys.every((key) => allowed.has(key));
}

export function normalizeSchemaObjects(rows) {
  if (!Array.isArray(rows)) fail("schema_rows_invalid");

  const seen = new Set();
  const objects = [];

  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) fail("schema_row_invalid");

    const type = text(row.type).toLowerCase();
    const name = text(row.name);
    const tableName = text(row.tbl_name);
    const sql = typeof row.sql === "string" ? row.sql.replace(/\r\n?/g, "\n").trim() : "";

    if (!ALLOWED_TYPES.has(type)) fail("schema_object_type_invalid");
    if (!name) fail("schema_object_name_missing");
    if (name.startsWith("sqlite_") || RESERVED_D1_OBJECTS.has(name)) continue;
    if (!tableName) fail("schema_table_name_missing");
    if (!sql) fail("schema_sql_missing");

    const identity = `${type}\0${name}`;
    if (seen.has(identity)) fail("schema_object_duplicate");
    seen.add(identity);

    objects.push({ type, name, tbl_name: tableName, sql });
  }

  objects.sort((left, right) => {
    for (const key of ["type", "name", "tbl_name", "sql"]) {
      const order = stableCompare(left[key], right[key]);
      if (order) return order;
    }
    return 0;
  });

  if (objects.length === 0) fail("schema_empty");
  return objects;
}

export function extractRowsFromCloudflareResponse(response) {
  if (!response || typeof response !== "object" || Array.isArray(response)) fail("cloudflare_response_invalid");
  if (response.success !== true) fail("cloudflare_response_unsuccessful");
  if (!Array.isArray(response.result) || response.result.length !== 1) fail("cloudflare_result_invalid");

  const statement = response.result[0];
  if (!statement || typeof statement !== "object" || statement.success !== true) fail("cloudflare_statement_unsuccessful");
  if (!Array.isArray(statement.results)) fail("cloudflare_results_invalid");
  return statement.results;
}

export function schemaFingerprint(objects) {
  const canonical = JSON.stringify({ schema_version: 1, objects });
  return `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
}

export function buildSchemaSnapshot({ response, targetSha, databaseName }) {
  const sourceSha = text(targetSha);
  const canonicalDatabase = text(databaseName);

  if (!SHA40.test(sourceSha)) fail("target_sha_invalid");
  if (!canonicalDatabase) fail("database_name_missing");

  const objects = normalizeSchemaObjects(extractRowsFromCloudflareResponse(response));
  const fingerprint = schemaFingerprint(objects);

  return {
    schema_version: 1,
    evidence_type: "hae_d1_schema_snapshot",
    target_sha: sourceSha,
    database_name: canonicalDatabase,
    normalization: "sqlite_master_non_internal_v2",
    object_count: objects.length,
    objects,
    fingerprint,
    safety: {
      d1_write: false,
      provider_write: false,
      queue_provision: false,
      worker_deploy: false,
      migration_baseline_mutated: false,
    },
  };
}

export function validateMigrationManifestForSnapshot(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) fail("migration_manifest_invalid");
  if (manifest.baseline_status !== "PENDING_RUNTIME_SNAPSHOT") fail("migration_baseline_not_pending");
  if (!Array.isArray(manifest.migration_files) || manifest.migration_files.length !== 0) fail("migration_files_present_before_snapshot");
  if (text(manifest.canonical_database) === "") fail("migration_canonical_database_missing");
  return manifest.canonical_database;
}

export function validateSchemaSnapshotArtifact(artifact, { expectedTargetSha, expectedDatabaseName } = {}) {
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) fail("snapshot_artifact_invalid");
  if (!hasExactKeys(artifact, SNAPSHOT_FIELDS)) fail("snapshot_top_level_fields_invalid");
  if (artifact.schema_version !== 1 || artifact.evidence_type !== "hae_d1_schema_snapshot") fail("snapshot_identity_invalid");
  if (artifact.normalization !== "sqlite_master_non_internal_v2") fail("snapshot_normalization_invalid");

  const targetSha = text(artifact.target_sha);
  if (!SHA40.test(targetSha)) fail("snapshot_target_sha_invalid");
  if (expectedTargetSha !== undefined && targetSha !== text(expectedTargetSha)) fail("snapshot_target_sha_mismatch");

  const databaseName = text(artifact.database_name);
  if (!databaseName) fail("snapshot_database_name_missing");
  if (expectedDatabaseName !== undefined && databaseName !== text(expectedDatabaseName)) fail("snapshot_database_name_mismatch");

  const normalized = normalizeSchemaObjects(artifact.objects);
  if (JSON.stringify(normalized) !== JSON.stringify(artifact.objects)) fail("snapshot_objects_not_canonical");
  if (!Number.isInteger(artifact.object_count) || artifact.object_count !== normalized.length) fail("snapshot_object_count_mismatch");

  const expectedFingerprint = schemaFingerprint(normalized);
  if (!FINGERPRINT.test(String(artifact.fingerprint || ""))) fail("snapshot_fingerprint_invalid");
  if (artifact.fingerprint !== expectedFingerprint) fail("snapshot_fingerprint_mismatch");

  const safety = artifact.safety;
  if (!safety || typeof safety !== "object" || Array.isArray(safety)) fail("snapshot_safety_missing");
  if (!hasExactKeys(safety, SAFETY_FIELDS)) fail("snapshot_safety_fields_invalid");
  for (const key of SAFETY_FIELDS) {
    if (safety[key] !== false) fail("snapshot_safety_violation_" + key);
  }

  return { target_sha: targetSha, database_name: databaseName, object_count: normalized.length, fingerprint: expectedFingerprint };
}

function argValue(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

function readJson(path, code) {
  if (!path) fail(code);
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    fail(code);
  }
}

function writeJson(path, value) {
  if (!path) fail("snapshot_output_missing");
  fs.writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

export function runCli(argv = process.argv.slice(2)) {
  const command = argv[0];

  if (command === "build") {
    const responsePath = argValue(argv, "--response");
    const outputPath = argValue(argv, "--output");
    const targetSha = argValue(argv, "--target-sha");
    const databaseName = argValue(argv, "--database-name");
    const response = readJson(responsePath, "cloudflare_response_read_failed");
    const artifact = buildSchemaSnapshot({ response, targetSha, databaseName });
    writeJson(outputPath, artifact);
    process.stdout.write(`schema_snapshot_built objects=${artifact.object_count} fingerprint=${artifact.fingerprint}\n`);
    return artifact;
  }

  if (command === "verify") {
    const artifactPath = argValue(argv, "--artifact");
    const manifestPath = argValue(argv, "--migration-manifest");
    const expectedTargetSha = argValue(argv, "--target-sha");
    const artifact = readJson(artifactPath, "snapshot_artifact_read_failed");
    const manifest = readJson(manifestPath, "migration_manifest_read_failed");
    const expectedDatabaseName = validateMigrationManifestForSnapshot(manifest);
    const verified = validateSchemaSnapshotArtifact(artifact, { expectedTargetSha, expectedDatabaseName });
    process.stdout.write(`schema_snapshot_verified objects=${verified.object_count} fingerprint=${verified.fingerprint}\n`);
    return verified;
  }

  fail("schema_snapshot_command_invalid");
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  try {
    runCli();
  } catch (error) {
    console.error(error?.code || error?.message || "schema_snapshot_failed");
    process.exit(1);
  }
}
