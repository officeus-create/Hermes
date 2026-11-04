// HAE #2067: deterministic, network-free normalization of GitHub Actions evidence.
// This module is NOT a GitHub webhook endpoint, credential source or job creator.
// Only a separately authenticated source adapter may provide the explicit trusted context.

const REPO = "officeus-create/Hermes";
const SHA = /^[a-f0-9]{40}$/;
const FINGERPRINT = /^sha256:[a-f0-9]{64}$/;
const SAFE_WORKFLOW = /^[a-zA-Z0-9_. -]{1,100}$/;

function failure(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}
function positiveInt(value) {
  return Number.isSafeInteger(value) && value > 0;
}
function cleanTime(value) {
  const text = typeof value === "string" ? value : "";
  const n = Date.parse(text);
  if (!text || !Number.isFinite(n)) failure("github_ci_time_invalid");
  return new Date(n).toISOString();
}

export function normalizeGithubCIEvent(event, trusted = {}) {
  // The trusted options are provided only by a separately authorized event producer;
  // never read caller-supplied authorizations, changed path hashes or writer status from event.
  if (event?.action !== "completed" || event?.workflow_run?.event == null) {
    failure("github_ci_event_not_completed");
  }
  const run = event.workflow_run;
  if (event?.repository?.full_name !== REPO || run?.repository?.full_name !== REPO) {
    failure("github_ci_repo_mismatch");
  }
  if (run.status !== "completed") failure("github_ci_run_incomplete");
  if (!positiveInt(run.id) || !positiveInt(run.run_attempt)) failure("github_ci_identity_invalid");
  if (!SHA.test(run.head_sha || "")) failure("github_ci_head_sha_invalid");
  const workflowName = run.name;
  if (typeof workflowName !== "string" || workflowName !== workflowName.trim() || !SAFE_WORKFLOW.test(workflowName)) failure("github_ci_workflow_name_invalid");
  if (run.html_url !== "https://github.com/" + REPO + "/actions/runs/" + run.id) {
    failure("github_ci_source_url_invalid");
  }
  const observedAt = cleanTime(run.updated_at);
  const conclusion = String(run.conclusion || "").trim().toLowerCase();
  const validConclusions = new Set(["success", "failure", "timed_out", "cancelled", "skipped", "neutral", "action_required"]);
  if (!validConclusions.has(conclusion)) failure("github_ci_conclusion_unknown");

  const pathsFingerprint = typeof trusted.changedPathsFingerprint === "string"
    ? trusted.changedPathsFingerprint : "";
  const authVerified = trusted.authenticated === true;
  const writerStateVerified = trusted.writerStateVerified === true;
  const writerActive = trusted.writerActive === true;
  const actualCoverage = authVerified && FINGERPRINT.test(pathsFingerprint)
    && trusted.workflowIdentityVerified === true && writerStateVerified;
  const stableKey = "github-ci:" + run.id + ":" + run.run_attempt + ":" + run.head_sha;
  const sourceRef = "github://" + REPO + "/actions/runs/" + run.id;
  const ciDefect = conclusion === "failure" || conclusion === "timed_out";
  const finding = ciDefect
    ? {
        finding_id: "ci-" + run.id + "-" + run.run_attempt + "-" + run.head_sha.slice(0, 12),
        source_ref: sourceRef,
        category: "CI_FAILURE",
        severity: "P1",
        status: "OPEN",
        artifact_key: "github-workflow:" + String(run.workflow_id || workflowName).slice(0, 100),
        verified: authVerified && trusted.workflowIdentityVerified === true,
        writer_active: writerActive,
        writer_state_verified: writerStateVerified,
        observed_at: observedAt,
      }
    : null;

  const input = {
    observed_at: observedAt,
    coverage_complete: actualCoverage,
    findings: finding ? [finding] : [],
  };
  return {
    source_kind: "github_actions_workflow_run",
    repository: REPO,
    source_ref: sourceRef,
    intake_key: stableKey,
    head_sha: run.head_sha,
    base_sha: SHA.test(trusted.baseSha || "") ? trusted.baseSha : null,
    workflow_name: workflowName,
    workflow_id: positiveInt(run.workflow_id) ? run.workflow_id : null,
    conclusion,
    changed_paths_fingerprint: FINGERPRINT.test(pathsFingerprint) ? pathsFingerprint : null,
    source_authenticated: authVerified,
    coverage_complete: actualCoverage,
    self_improvement_input: input,
    external_writes_authorized: false,
    model_cost_usd: 0,
  };
}
