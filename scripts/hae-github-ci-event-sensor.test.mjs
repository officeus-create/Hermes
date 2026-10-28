import assert from "node:assert/strict";
import { normalizeGithubCIEvent } from "../workers/automation-engine/src/github-ci-event-sensor.mjs";
import { normalizeHaeSelfImprovementSnapshot, evaluateHaeSelfImprovementSnapshot } from "../workers/automation-engine/src/hae-self-improvement.mjs";

const sha = "a".repeat(40);
const pathsFp = "sha256:" + "b".repeat(64);
const event = {
  action: "completed",
  repository: { full_name: "officeus-create/Hermes" },
  workflow_run: {
    repository: { full_name: "officeus-create/Hermes" },
    id: 40299911122,
    run_attempt: 1,
    workflow_id: 81234,
    event: "pull_request",
    name: "Hermes Automation Engine Contract",
    head_sha: sha,
    html_url: "https://github.com/officeus-create/Hermes/actions/runs/40299911122",
    status: "completed",
    conclusion: "failure",
    updated_at: "2026-10-25T21:41:00Z",
    // These raw fields are explicitly untrusted, and may contain secrets/PII.
    changedPathsFingerprint: "sha256:" + "c".repeat(64),
    writerStateVerified: true,
    secret: "NEVER_IMPORT_GITHUB_SECRET",
    jobs: [{ raw_log: "FORBIDDEN_RAW_JOB_LOG" }],
  },
};
const context = {
  authenticated: true,
  workflowIdentityVerified: true,
  changedPathsFingerprint: pathsFp,
  writerStateVerified: true,
  writerActive: false,
  baseSha: "d".repeat(40),
};
const output = normalizeGithubCIEvent(event, context);
assert.equal(output.source_kind, "github_actions_workflow_run");
assert.equal(output.source_ref, "github://officeus-create/Hermes/actions/runs/40299911122");
assert.equal(output.intake_key, "github-ci:40299911122:1:" + sha);
assert.equal(output.coverage_complete, true);
assert.equal(output.changed_paths_fingerprint, pathsFp);
assert.equal(output.model_cost_usd, 0);
assert.equal(output.external_writes_authorized, false);
assert.equal(output.self_improvement_input.findings.length, 1);
assert.equal(normalizeHaeSelfImprovementSnapshot(output.self_improvement_input).findings[0].category, "CI_FAILURE");
const evaluated = evaluateHaeSelfImprovementSnapshot(output.self_improvement_input);
assert.equal(evaluated.next_work_id, "HAE-SELF:ci-40299911122-1-aaaaaaaaaaaa");
assert.equal(evaluated.next_action, "HOLD_REPAIR");
assert.equal(evaluated.automatic_source_change_performed, false);
assert.equal(evaluated.cost_usd, 0);
assert.ok(!JSON.stringify(output).includes("NEVER_IMPORT_GITHUB_SECRET"));
assert.ok(!JSON.stringify(output).includes("FORBIDDEN_RAW_JOB_LOG"));

const repeat = normalizeGithubCIEvent(JSON.parse(JSON.stringify(event)), context);
assert.deepEqual(output, repeat, "Replay must keep one deterministic intake key, not make a new ID");

const partial = normalizeGithubCIEvent(event, {
  authenticated: true,
  workflowIdentityVerified: true,
  writerStateVerified: false,
});
assert.equal(partial.coverage_complete, false);
assert.equal(evaluateHaeSelfImprovementSnapshot(partial.self_improvement_input).next_action, "NO_ACTION");

const unauthenticated = normalizeGithubCIEvent(event, {
  ...context, authenticated: false,
});
assert.equal(unauthenticated.self_improvement_input.findings[0].verified, false);
assert.equal(evaluateHaeSelfImprovementSnapshot(unauthenticated.self_improvement_input).next_action, "NO_ACTION");

const conflicted = normalizeGithubCIEvent(event, { ...context, writerActive: true });
assert.equal(conflicted.coverage_complete, true);
assert.equal(evaluateHaeSelfImprovementSnapshot(conflicted.self_improvement_input).next_action, "NO_ACTION");

const success = normalizeGithubCIEvent({
  ...event, workflow_run: { ...event.workflow_run, conclusion: "success" },
}, context);
assert.equal(success.self_improvement_input.findings.length, 0);

const fail = (fn, code) => assert.throws(fn, e => e.code === code);
fail(() => normalizeGithubCIEvent({...event,action:"requested"},context), "github_ci_event_not_completed");
fail(() => normalizeGithubCIEvent({...event,repository:{full_name:"evil/other"}},context), "github_ci_repo_mismatch");
fail(() => normalizeGithubCIEvent({...event,workflow_run:{...event.workflow_run, status:"in_progress"}},context), "github_ci_run_incomplete");
fail(() => normalizeGithubCIEvent({...event,workflow_run:{...event.workflow_run,head_sha:"wrong"}},context), "github_ci_head_sha_invalid");
fail(() => normalizeGithubCIEvent({...event,workflow_run:{...event.workflow_run,html_url:"https://evil.example/run/42"}},context), "github_ci_source_url_invalid");
fail(() => normalizeGithubCIEvent({...event,workflow_run:{...event.workflow_run,name:"\nInjected"}},context), "github_ci_workflow_name_invalid");
fail(() => normalizeGithubCIEvent({...event,workflow_run:{...event.workflow_run,conclusion:"alien"}},context), "github_ci_conclusion_unknown");

console.log("HAE #2067 GitHub/CI sensor parser PASS: deterministic event proof, zero secrets, partial coverage HOLD, existing WORK_ID contract");
