import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSchemaSnapshot } from "./hae-d1-schema-snapshot.mjs";
import {
  buildMigrationBaselineCandidate,
  validateMigrationBaselineCandidate,
} from "./hae-migration-baseline-candidate.mjs";

const sha = "a".repeat(40);
const otherSha = "b".repeat(40);
const databaseName = "hermes-connect-prototype";

const schemaSnapshot = buildSchemaSnapshot({
  targetSha: sha,
  databaseName,
  response: {
    success: true,
    result: [{
      success: true,
      results: [
        {
          type: "table",
          name: "hermes_automation_jobs",
          tbl_name: "hermes_automation_jobs",
          sql: "CREATE TABLE hermes_automation_jobs(job_id TEXT PRIMARY KEY,state TEXT NOT NULL)",
        },
        {
          type: "index",
          name: "idx_hae_jobs_state",
          tbl_name: "hermes_automation_jobs",
          sql: "CREATE INDEX idx_hae_jobs_state ON hermes_automation_jobs(state)",
        },
      ],
    }],
  },
});

const runtimeEvidence = {
  target_sha: sha,
  deployment: {
    evidence_ref: "cloudflare://workers/hermes-automation-engine/deployments/sha-a",
    source_sha: sha,
  },
  runtime: {
    automation_mode: "dry_run",
    publication_enabled: false,
  },
  health: {
    evidence_ref: "worker://private-health/sha-a",
    database: "ok",
    source_sha: sha,
    automation_mode: "dry_run",
    publication_enabled: false,
    last_cron_wake: {
      scheduled_at: "2026-10-25T01:00:00.000Z",
      source_sha: sha,
      automation_mode: "dry_run",
      publication_enabled: false,
    },
  },
  transport: {
    queue: {
      evidence_ref: "cloudflare://queues/hermes-automation",
      exists: true,
      backlog_count: 0,
    },
    dlq: {
      evidence_ref: "cloudflare://queues/hermes-automation-dlq",
      exists: true,
      backlog_count: 0,
    },
  },
  read_only_job: {
    evidence_ref: "d1://jobs/baseline-canary-1",
    job_id: "baseline-canary-1",
    job_type: "system.health.snapshot",
    idempotency_key: "hae:baseline:canary:sha-a",
    permission_class: "READ_ONLY",
    state: "SUCCEEDED",
    attempt_count: 1,
    external_write: false,
  },
  replay: {
    evidence_ref: "d1://jobs/baseline-canary-1/replay",
    idempotency_key: "hae:baseline:canary:sha-a",
    same_idempotency_key: true,
    reused_existing_job: true,
    duplicate_execution_count: 0,
    duplicate_suppressed_receipt_count: 1,
    second_external_side_effect: false,
  },
  independent_qa: {
    evidence_ref: "github-actions://runs/runtime-proof/qa",
    status: "PASS",
    independent_from_executor: true,
    reviewer: "github-actions/hae-runtime-evidence-qa",
  },
};

const manifest = {
  schema_version: 1,
  canonical_database: databaseName,
  authority: "existing Hermes Connect production D1 discovered from the canonical hermes Pages binding",
  baseline_status: "PENDING_RUNTIME_SNAPSHOT",
  baseline_source_sha: null,
  destructive_migration_requires_owner_confirmation: true,
  migration_files: [],
  baseline_evidence_ref: null,
  baseline_schema_fingerprint: null,
};

const candidate = buildMigrationBaselineCandidate({
  schemaSnapshot,
  runtimeEvidence,
  migrationManifest: manifest,
  schemaEvidenceRef: "github-actions://runs/schema-proof/hae-d1-schema-snapshot-accepted",
  runtimeEvidenceRef: "github-actions://runs/runtime-proof/hae-runtime-evidence-accepted",
});

assert.equal(candidate.promotion_state, "ELIGIBLE_FOR_MANUAL_PROMOTION");
assert.equal(candidate.baseline_source_sha, sha);
assert.equal(candidate.baseline_schema_fingerprint, schemaSnapshot.fingerprint);
assert.equal(candidate.manifest_patch.baseline_status, "VERIFIED");
assert.equal(candidate.manifest_patch.baseline_source_sha, sha);
assert.equal(candidate.manifest_patch.baseline_schema_fingerprint, schemaSnapshot.fingerprint);
assert.equal(candidate.manifest_patch.baseline_evidence_ref, "REPLACE_WITH_ACCEPTED_BASELINE_CANDIDATE_ARTIFACT_REF");
assert.equal(candidate.safety.manifest_mutated, false);
assert.equal(candidate.safety.migration_created, false);

const verified = validateMigrationBaselineCandidate(candidate, {
  expectedSourceSha: sha,
  expectedDatabaseName: databaseName,
});
assert.equal(verified.source_sha, sha);
assert.equal(verified.schema_fingerprint, schemaSnapshot.fingerprint);
assert.match(verified.combined_evidence_fingerprint, /^sha256:[0-9a-f]{64}$/);

const mismatch = structuredClone(runtimeEvidence);
mismatch.target_sha = otherSha;
mismatch.deployment.source_sha = otherSha;
mismatch.health.source_sha = otherSha;
mismatch.health.last_cron_wake.source_sha = otherSha;
assert.throws(
  () => buildMigrationBaselineCandidate({
    schemaSnapshot,
    runtimeEvidence: mismatch,
    migrationManifest: manifest,
    schemaEvidenceRef: "github-actions://schema",
    runtimeEvidenceRef: "github-actions://runtime",
  }),
  /baseline_schema_runtime_sha_mismatch/,
);

const badRuntime = structuredClone(runtimeEvidence);
badRuntime.runtime.publication_enabled = true;
assert.throws(
  () => buildMigrationBaselineCandidate({
    schemaSnapshot,
    runtimeEvidence: badRuntime,
    migrationManifest: manifest,
    schemaEvidenceRef: "github-actions://schema",
    runtimeEvidenceRef: "github-actions://runtime",
  }),
  /baseline_runtime_evidence_not_accepted/,
);

assert.throws(
  () => buildMigrationBaselineCandidate({
    schemaSnapshot,
    runtimeEvidence,
    migrationManifest: { ...manifest, baseline_status: "VERIFIED" },
    schemaEvidenceRef: "github-actions://schema",
    runtimeEvidenceRef: "github-actions://runtime",
  }),
  /migration_baseline_not_pending/,
);

assert.throws(
  () => buildMigrationBaselineCandidate({
    schemaSnapshot,
    runtimeEvidence,
    migrationManifest: manifest,
    schemaEvidenceRef: "",
    runtimeEvidenceRef: "github-actions://runtime",
  }),
  /baseline_schema_evidence_ref_missing/,
);

assert.throws(
  () => validateMigrationBaselineCandidate({
    ...candidate,
    combined_evidence_fingerprint: "sha256:" + "0".repeat(64),
  }),
  /baseline_candidate_combined_fingerprint_mismatch/,
);

assert.throws(
  () => validateMigrationBaselineCandidate({
    ...candidate,
    manifest_patch: {
      ...candidate.manifest_patch,
      baseline_evidence_ref: "github-actions://pretend-already-accepted",
    },
  }),
  /baseline_candidate_manifest_evidence_ref_not_placeholder/,
);

assert.throws(
  () => validateMigrationBaselineCandidate({
    ...candidate,
    safety: { ...candidate.safety, manifest_mutated: true },
  }),
  /baseline_candidate_safety_violation_manifest_mutated/,
);

console.log("HAE migration baseline candidate PASS: schema + deployed runtime same SHA -> manual promotion candidate only");


const workflow = readFileSync(new URL("../.github/workflows/hae-migration-baseline-candidate.yml", import.meta.url), "utf8");
assert.match(workflow, /hae-d1-schema-snapshot-accepted/, "Baseline candidate must consume independently accepted schema evidence");
assert.match(workflow, /hae-runtime-evidence-accepted/, "Baseline candidate must consume independently accepted runtime evidence");
assert.match(workflow, /baseline_target_not_current_main/, "Baseline candidate must fail closed if target SHA is no longer current main");
assert.match(workflow, /hae-migration-baseline-candidate-accepted/, "Baseline candidate must have a separate QA artifact");
assert.match(workflow, /REPLACE_WITH_ACCEPTED_BASELINE_CANDIDATE_ARTIFACT_REF/, "Workflow must preserve manual manifest evidence binding");
assert.doesNotMatch(workflow, /update_file|git commit|git push|wrangler d1 execute|CREATE TABLE|ALTER TABLE|DROP TABLE/i, "Baseline candidate workflow must not mutate repository or D1");

assert.match(workflow, /issue_comment:/, "Baseline candidate must support owner-triggered issue command execution");
assert.match(workflow, /github\.actor == 'officeus-create'/, "Issue command must be restricted to the repository owner");
assert.match(workflow, /github\.event\.issue\.number == 2033/, "Baseline command must be restricted to the canonical HAE owner issue");
assert.match(workflow, /HAE_BASELINE_CANDIDATE/, "Baseline candidate owner command must be explicit and parse exact evidence run ids");
