import fs from "node:fs";
import path from "node:path";
import { validateMigrationBaselineCandidate } from "./hae-migration-baseline-candidate.mjs";

const SHA40 = /^[0-9a-f]{40}$/;
const FINGERPRINT = /^sha256:[0-9a-f]{64}$/;
const REPO_EVIDENCE_REF = /^repo:\/\/workers\/automation-engine\/migrations\/baseline-evidence\/([0-9a-f]{64})\.json#sha256:\1$/;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

export function validateVerifiedMigrationBaseline({ manifest, migrationsDir }) {
  const sourceSha = String(manifest?.baseline_source_sha || "").trim().toLowerCase();
  const schemaFingerprint = String(manifest?.baseline_schema_fingerprint || "").trim().toLowerCase();
  const evidenceRef = String(manifest?.baseline_evidence_ref || "").trim();

  if (!SHA40.test(sourceSha)) fail("verified_baseline_source_sha_invalid");
  if (!FINGERPRINT.test(schemaFingerprint)) fail("verified_baseline_schema_fingerprint_invalid");

  const match = evidenceRef.match(REPO_EVIDENCE_REF);
  if (!match) fail("verified_baseline_evidence_ref_invalid");
  const proofHash = match[1];

  const evidencePath = path.join(migrationsDir, "baseline-evidence", proofHash + ".json");
  let candidate;
  try {
    candidate = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  } catch {
    fail("verified_baseline_evidence_file_missing_or_invalid");
  }

  const verified = validateMigrationBaselineCandidate(candidate, {
    expectedSourceSha: sourceSha,
    expectedDatabaseName: manifest.canonical_database,
  });
  if (verified.schema_fingerprint !== schemaFingerprint) fail("verified_baseline_manifest_schema_fingerprint_mismatch");
  if (verified.combined_evidence_fingerprint !== "sha256:" + proofHash) fail("verified_baseline_evidence_hash_mismatch");
  if (candidate.manifest_patch?.baseline_evidence_ref !== evidenceRef) fail("verified_baseline_candidate_ref_mismatch");
  if (candidate.manifest_patch?.baseline_source_sha !== sourceSha) fail("verified_baseline_candidate_source_mismatch");
  if (candidate.manifest_patch?.baseline_schema_fingerprint !== schemaFingerprint) fail("verified_baseline_candidate_schema_mismatch");

  return {
    source_sha: sourceSha,
    schema_fingerprint: schemaFingerprint,
    evidence_ref: evidenceRef,
    evidence_path: evidencePath,
    database_binding_fingerprint: verified.database_binding_fingerprint,
  };
}
