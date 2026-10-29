import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSchemaSnapshot } from "./hae-d1-schema-snapshot.mjs";
import {
  buildMigrationBaselineCandidate,
  validateMigrationBaselineCandidate,
} from "./hae-migration-baseline-candidate.mjs";
import { validateVerifiedMigrationBaseline } from "./hae-migration-baseline-promotion-gate.mjs";

const sha = "a".repeat(40);
const otherSha = "b".repeat(40);
const databaseName = "hermes-connect-prototype";
const databaseBindingFingerprint = "sha256:" + "1".repeat(64);

const schemaSnapshot = buildSchemaSnapshot({
  targetSha: sha,
  databaseName,
  databaseBindingFingerprint,
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
  database_binding_fingerprint: databaseBindingFingerprint,
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
assert.equal(candidate.database_binding_fingerprint, databaseBindingFingerprint);
assert.deepEqual(candidate.schema_snapshot, schemaSnapshot, "Accepted candidate must durably embed the normalized schema snapshot used for promotion");
assert.equal(candidate.baseline_schema_fingerprint, schemaSnapshot.fingerprint);
assert.equal(candidate.manifest_patch.baseline_status, "VERIFIED");
assert.equal(candidate.manifest_patch.baseline_source_sha, sha);
assert.equal(candidate.manifest_patch.baseline_schema_fingerprint, schemaSnapshot.fingerprint);
assert.match(candidate.manifest_patch.baseline_evidence_ref, /^repo:\/\/workers\/automation-engine\/migrations\/baseline-evidence\/[0-9a-f]{64}\.json#sha256:[0-9a-f]{64}$/);
assert.equal(candidate.safety.manifest_mutated, false);
assert.equal(candidate.safety.migration_created, false);

const promotionDir = mkdtempSync(join(tmpdir(), "hae-baseline-promotion-"));
mkdirSync(join(promotionDir, "baseline-evidence"));
const proofHash = candidate.combined_evidence_fingerprint.slice("sha256:".length);
const durablePath = join(promotionDir, "baseline-evidence", proofHash + ".json");
writeFileSync(durablePath, JSON.stringify(candidate, null, 2) + "\n");
const promotedManifest = { ...manifest, ...candidate.manifest_patch };
const durableVerified = validateVerifiedMigrationBaseline({ manifest: promotedManifest, migrationsDir: promotionDir });
assert.equal(durableVerified.evidence_path, durablePath);
rmSync(durablePath);
assert.throws(
  () => validateVerifiedMigrationBaseline({ manifest: promotedManifest, migrationsDir: promotionDir }),
  /verified_baseline_evidence_file_missing_or_invalid/,
);
rmSync(promotionDir, { recursive: true, force: true });

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

const wrongBinding = structuredClone(runtimeEvidence);
wrongBinding.database_binding_fingerprint = "sha256:" + "2".repeat(64);
assert.throws(
  () => buildMigrationBaselineCandidate({
    schemaSnapshot,
    runtimeEvidence: wrongBinding,
    migrationManifest: manifest,
    schemaEvidenceRef: "github-actions://schema",
    runtimeEvidenceRef: "github-actions://runtime",
  }),
  /baseline_database_binding_fingerprint_mismatch/,
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

const tamperedEmbeddedSchema = structuredClone(candidate);
tamperedEmbeddedSchema.schema_snapshot.objects[0].sql += " /* tampered */";
assert.throws(
  () => validateMigrationBaselineCandidate(tamperedEmbeddedSchema),
  /snapshot_fingerprint_mismatch/,
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
      baseline_evidence_ref: "repo://workers/automation-engine/migrations/baseline-evidence/fake.json#sha256:" + "0".repeat(64),
    },
  }),
  /baseline_candidate_manifest_evidence_ref_not_content_addressed/,
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
assert.match(workflow, /\.github\/workflows\/automation-engine-release\.yml/, "Evidence run IDs may come from direct manual HAE release recovery");
assert.match(workflow, /\.github\/workflows\/issue-comment-command-router\.yml/, "Owner-comment evidence may come only through the canonical command router");
assert.match(workflow, /baseline_\$\{kind\}_run_wrong_workflow/, "Evidence provenance must fail closed on a different workflow");
assert.match(workflow, /baseline_\$\{kind\}_run_head_mismatch/, "Evidence provenance must bind each run head to the exact target SHA");
assert.match(workflow, /baseline_\$\{kind\}_run_timestamp_missing/, "Evidence chronology must fail closed when run timestamps are unavailable");
assert.match(workflow, /baseline_schema_not_after_runtime/, "Schema evidence must be captured only after the runtime proof fully completes");
assert.match(workflow, /SCHEMA_STARTED_AT/, "Schema run start time must participate in chronology verification");
assert.match(workflow, /RUNTIME_COMPLETED_AT/, "Runtime proof completion time must participate in chronology verification");
assert.match(workflow, /baseline_target_stale_during_candidate_qa/, "Independent candidate QA must recheck current main before acceptance");
assert.match(workflow, /hae-migration-baseline-candidate-accepted/, "Baseline candidate must have a separate QA artifact");
assert.match(workflow, /repo:\/\/workers\/automation-engine\/migrations\/baseline-evidence\//, "Workflow must require a durable content-addressed repository baseline evidence reference");
assert.match(workflow, /retention-days: 90/, "Accepted candidate transport artifact should retain a bounded 90-day review window while repository promotion becomes the durable record");
assert.doesNotMatch(workflow, /update_file|git commit|git push|wrangler d1 execute|CREATE TABLE|ALTER TABLE|DROP TABLE/i, "Baseline candidate workflow must not mutate repository or D1");

const router = readFileSync(new URL("../.github/workflows/issue-comment-command-router.yml", import.meta.url), "utf8");
assert.doesNotMatch(workflow, /issue_comment:/, "Reusable baseline workflow must not subscribe directly to every issue comment");
assert.match(workflow, /workflow_call:/, "Baseline candidate must remain owner-triggerable through the bounded router");
assert.match(workflow, /inputs\.caller_actor == 'officeus-create'/, "Reusable baseline command must revalidate repository owner identity");
assert.match(workflow, /inputs\.issue_number == 2033/, "Reusable baseline command must revalidate canonical HAE owner issue");
assert.match(workflow, /HAE_BASELINE_CANDIDATE/, "Baseline candidate owner command must remain explicit and parse exact evidence run ids");
assert.match(router, /github\.actor == 'officeus-create'/, "Router must restrict baseline command to repository owner");
assert.match(router, /github\.event\.issue\.number == 2033/, "Router must restrict baseline command to canonical HAE owner issue");
assert.match(router, /startsWith\(github\.event\.comment\.body, 'HAE_BASELINE_CANDIDATE '\)/, "Router must dispatch only the explicit baseline command");
