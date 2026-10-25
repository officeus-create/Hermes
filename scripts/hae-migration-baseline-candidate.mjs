import { createHash } from "node:crypto";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import {
  validateMigrationManifestForSnapshot,
  validateSchemaSnapshotArtifact,
} from "./hae-d1-schema-snapshot.mjs";
import { evaluateHaeRuntimeEvidence } from "./hae-runtime-evidence-check.mjs";

const SHA40 = /^[0-9a-f]{40}$/;
const FINGERPRINT = /^sha256:[0-9a-f]{64}$/;
const EVIDENCE_FIELDS = new Set([
  "evidence_type",
  "candidate_version",
  "promotion_state",
  "canonical_database",
  "baseline_source_sha",
  "baseline_schema_fingerprint",
  "schema_evidence_ref",
  "runtime_evidence_ref",
  "combined_evidence_fingerprint",
  "manifest_patch",
  "safety",
]);
const SAFETY_FIELDS = new Set([
  "d1_write",
  "provider_write",
  "queue_provision",
  "worker_deploy",
  "manifest_mutated",
  "migration_created",
]);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function clean(value, max = 800) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function exactKeys(value, allowed) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === allowed.size && keys.every((key) => allowed.has(key));
}

function stableJson(value) {
  if (Array.isArray(value)) return "[" + value.map(stableJson).join(",") + "]";
  if (value && typeof value === "object") {
    return "{" + Object.keys(value).sort().map((key) => JSON.stringify(key) + ":" + stableJson(value[key])).join(",") + "}";
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return "sha256:" + createHash("sha256").update(value, "utf8").digest("hex");
}

function requireEvidenceRef(value, code) {
  const ref = clean(value, 800);
  if (!ref) fail(code);
  return ref;
}

export function buildMigrationBaselineCandidate({
  schemaSnapshot,
  runtimeEvidence,
  migrationManifest,
  schemaEvidenceRef,
  runtimeEvidenceRef,
}) {
  const canonicalDatabase = validateMigrationManifestForSnapshot(migrationManifest);
  const schema = validateSchemaSnapshotArtifact(schemaSnapshot, {
    expectedDatabaseName: canonicalDatabase,
  });

  const runtime = evaluateHaeRuntimeEvidence(runtimeEvidence);
  if (runtime.status !== "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW") {
    fail("baseline_runtime_evidence_not_accepted");
  }

  const runtimeTargetSha = clean(runtimeEvidence?.target_sha, 40).toLowerCase();
  const deployedSourceSha = clean(runtimeEvidence?.deployment?.source_sha, 40).toLowerCase();
  const healthSourceSha = clean(runtimeEvidence?.health?.source_sha, 40).toLowerCase();

  if (!SHA40.test(runtimeTargetSha) || !SHA40.test(deployedSourceSha) || !SHA40.test(healthSourceSha)) {
    fail("baseline_runtime_source_sha_invalid");
  }
  if (
    schema.target_sha !== runtimeTargetSha
    || schema.target_sha !== deployedSourceSha
    || schema.target_sha !== healthSourceSha
  ) {
    fail("baseline_schema_runtime_sha_mismatch");
  }

  const schemaRef = requireEvidenceRef(schemaEvidenceRef, "baseline_schema_evidence_ref_missing");
  const runtimeRef = requireEvidenceRef(runtimeEvidenceRef, "baseline_runtime_evidence_ref_missing");

  const proof = {
    canonical_database: canonicalDatabase,
    baseline_source_sha: schema.target_sha,
    baseline_schema_fingerprint: schema.fingerprint,
    schema_evidence_ref: schemaRef,
    runtime_evidence_ref: runtimeRef,
  };

  const combinedFingerprint = sha256(stableJson(proof));

  return {
    evidence_type: "hae_migration_baseline_candidate",
    candidate_version: 1,
    promotion_state: "ELIGIBLE_FOR_MANUAL_PROMOTION",
    canonical_database: canonicalDatabase,
    baseline_source_sha: schema.target_sha,
    baseline_schema_fingerprint: schema.fingerprint,
    schema_evidence_ref: schemaRef,
    runtime_evidence_ref: runtimeRef,
    combined_evidence_fingerprint: combinedFingerprint,
    manifest_patch: {
      baseline_status: "VERIFIED",
      baseline_source_sha: schema.target_sha,
      baseline_evidence_ref: "REPLACE_WITH_ACCEPTED_BASELINE_CANDIDATE_ARTIFACT_REF",
      baseline_schema_fingerprint: schema.fingerprint,
    },
    safety: {
      d1_write: false,
      provider_write: false,
      queue_provision: false,
      worker_deploy: false,
      manifest_mutated: false,
      migration_created: false,
    },
  };
}

export function validateMigrationBaselineCandidate(candidate, {
  expectedSourceSha,
  expectedDatabaseName,
} = {}) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) fail("baseline_candidate_invalid");
  if (!exactKeys(candidate, EVIDENCE_FIELDS)) fail("baseline_candidate_fields_invalid");
  if (candidate.evidence_type !== "hae_migration_baseline_candidate" || candidate.candidate_version !== 1) {
    fail("baseline_candidate_identity_invalid");
  }
  if (candidate.promotion_state !== "ELIGIBLE_FOR_MANUAL_PROMOTION") {
    fail("baseline_candidate_promotion_state_invalid");
  }

  const database = clean(candidate.canonical_database, 240);
  if (!database) fail("baseline_candidate_database_missing");
  if (expectedDatabaseName !== undefined && database !== clean(expectedDatabaseName, 240)) {
    fail("baseline_candidate_database_mismatch");
  }

  const sourceSha = clean(candidate.baseline_source_sha, 40).toLowerCase();
  if (!SHA40.test(sourceSha)) fail("baseline_candidate_source_sha_invalid");
  if (expectedSourceSha !== undefined && sourceSha !== clean(expectedSourceSha, 40).toLowerCase()) {
    fail("baseline_candidate_source_sha_mismatch");
  }

  const schemaFingerprint = clean(candidate.baseline_schema_fingerprint, 80).toLowerCase();
  if (!FINGERPRINT.test(schemaFingerprint)) fail("baseline_candidate_schema_fingerprint_invalid");

  const schemaRef = requireEvidenceRef(candidate.schema_evidence_ref, "baseline_candidate_schema_ref_missing");
  const runtimeRef = requireEvidenceRef(candidate.runtime_evidence_ref, "baseline_candidate_runtime_ref_missing");

  const expectedCombined = sha256(stableJson({
    canonical_database: database,
    baseline_source_sha: sourceSha,
    baseline_schema_fingerprint: schemaFingerprint,
    schema_evidence_ref: schemaRef,
    runtime_evidence_ref: runtimeRef,
  }));
  if (candidate.combined_evidence_fingerprint !== expectedCombined) {
    fail("baseline_candidate_combined_fingerprint_mismatch");
  }

  const patch = candidate.manifest_patch;
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) fail("baseline_candidate_manifest_patch_invalid");
  if (patch.baseline_status !== "VERIFIED") fail("baseline_candidate_manifest_status_invalid");
  if (patch.baseline_source_sha !== sourceSha) fail("baseline_candidate_manifest_source_sha_mismatch");
  if (patch.baseline_schema_fingerprint !== schemaFingerprint) fail("baseline_candidate_manifest_fingerprint_mismatch");
  if (clean(patch.baseline_evidence_ref, 800) !== "REPLACE_WITH_ACCEPTED_BASELINE_CANDIDATE_ARTIFACT_REF") {
    fail("baseline_candidate_manifest_evidence_ref_not_placeholder");
  }

  const safety = candidate.safety;
  if (!exactKeys(safety, SAFETY_FIELDS)) fail("baseline_candidate_safety_fields_invalid");
  for (const key of SAFETY_FIELDS) {
    if (safety[key] !== false) fail("baseline_candidate_safety_violation_" + key);
  }

  return {
    source_sha: sourceSha,
    database_name: database,
    schema_fingerprint: schemaFingerprint,
    combined_evidence_fingerprint: expectedCombined,
  };
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
  if (!path) fail("baseline_candidate_output_missing");
  fs.writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

function argValue(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

export function runCli(argv = process.argv.slice(2)) {
  const command = argv[0];

  if (command === "build") {
    const schemaSnapshot = readJson(argValue(argv, "--schema-artifact"), "baseline_schema_artifact_read_failed");
    const runtimeEvidence = readJson(argValue(argv, "--runtime-evidence"), "baseline_runtime_evidence_read_failed");
    const migrationManifest = readJson(argValue(argv, "--migration-manifest"), "baseline_manifest_read_failed");
    const candidate = buildMigrationBaselineCandidate({
      schemaSnapshot,
      runtimeEvidence,
      migrationManifest,
      schemaEvidenceRef: argValue(argv, "--schema-evidence-ref"),
      runtimeEvidenceRef: argValue(argv, "--runtime-evidence-ref"),
    });
    writeJson(argValue(argv, "--output"), candidate);
    process.stdout.write(
      `hae_baseline_candidate_built source_sha=${candidate.baseline_source_sha} fingerprint=${candidate.baseline_schema_fingerprint}\n`,
    );
    return candidate;
  }

  if (command === "verify") {
    const candidate = readJson(argValue(argv, "--candidate"), "baseline_candidate_read_failed");
    const verified = validateMigrationBaselineCandidate(candidate, {
      expectedSourceSha: argValue(argv, "--source-sha"),
      expectedDatabaseName: argValue(argv, "--database-name"),
    });
    process.stdout.write(
      `hae_baseline_candidate_verified source_sha=${verified.source_sha} fingerprint=${verified.schema_fingerprint}\n`,
    );
    return verified;
  }

  fail("baseline_candidate_command_invalid");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runCli();
  } catch (error) {
    console.error(error?.code || error?.message || "baseline_candidate_failed");
    process.exit(1);
  }
}
