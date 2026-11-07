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


// First real Carrier Acquisition pilot evidence; no fake D1/Queue execution.
const {buildCarrierPrPilotEvidence} = await import("../workers/automation-engine/src/carrier-pr-pilot-evidence.mjs");
const carrierHead="4031b04ad7751f0a8ce1f21008dbd81dde54998b";
const carrierEvidence={
  observed_at:"2026-11-01T00:00:00.000Z",
  main_sha:"2ad698b3191264889d4d5ac22c7d86aff9276492",
  pr:{number:1908,url:"https://github.com/officeus-create/Hermes/pull/1908",state:"open",draft:true,merged:false,head_sha:carrierHead,base_sha:"e8edd9b76763bff1efd545c49383bf0459db1266",body:"PRIVATE_TEST_MARKER_DO_NOT_COPY"},
  compare:{base:"main",head:carrierHead,status:"diverged",ahead_by:49,behind_by:299},
  checks:[
    {name:"Website checks",head_sha:carrierHead,conclusion:"failure",raw_log:"SECRET_TEST_LOG"},
    {name:"Carrier Contract Live Activation",head_sha:carrierHead,conclusion:"success"},
    {name:"Cloudflare deployment ownership contract",head_sha:carrierHead,conclusion:"cancelled"},
  ]
};
const carrier=buildCarrierPrPilotEvidence(carrierEvidence);
assert.equal(carrier.pilot_key,"HERMES-CARRIER-INTAKE-PR-1908");
assert.equal(carrier.blocker,"STALE_BRANCH_REQUIRES_MINIMAL_RECONCILIATION");
assert.equal(carrier.behind_main,299);
assert.equal(carrier.failed_checks,1);
assert.equal(carrier.incomplete_checks,1);
assert.deepEqual(carrier.portfolio_blocked_work_ids,["HERMES-CARRIER-INTAKE-PR-1908"]);
assert.equal(carrier.hae_work_id,null);
assert.equal(carrier.d1_job_id,null);
assert.equal(carrier.independent_qa_receipt,null);
assert.equal(carrier.automatic_job_submission_allowed,false);
assert.equal(carrier.production_deploy_allowed,false);
assert.equal(carrier.outbound_messages_allowed,false);
assert.equal(carrier.one_brain_promotion_allowed,false);
assert.equal(carrier.paid_model_cost_usd,0);
assert.deepEqual(carrier,buildCarrierPrPilotEvidence(structuredClone(carrierEvidence)),"replay must be deterministic");
assert.ok(!JSON.stringify(carrier).includes("PRIVATE_TEST_MARKER_DO_NOT_COPY"));
assert.ok(!JSON.stringify(carrier).includes("SECRET_TEST_LOG"));
const carrierReject=(input,code)=>assert.throws(()=>buildCarrierPrPilotEvidence(input),e=>e.code==="hae_carrier_pr_pilot_"+code);
carrierReject({...carrierEvidence,pr:{...carrierEvidence.pr,number:1909}},"pr_identity_invalid");
carrierReject({...carrierEvidence,pr:{...carrierEvidence.pr,url:"https://evil.example/pull/1908"}},"pr_identity_invalid");
carrierReject({...carrierEvidence,pr:{...carrierEvidence.pr,state:"open",merged:true}},"pr_identity_invalid");
carrierReject({...carrierEvidence,compare:{...carrierEvidence.compare,head:"f".repeat(40)}},"comparison_invalid");
carrierReject({...carrierEvidence,compare:{...carrierEvidence.compare,ahead_by:0}},"comparison_invalid");
carrierReject({...carrierEvidence,checks:[]},"checks_incomplete");
carrierReject({...carrierEvidence,checks:[{...carrierEvidence.checks[0],head_sha:"f".repeat(40)}]},"check_invalid");
carrierReject({...carrierEvidence,checks:[carrierEvidence.checks[0],carrierEvidence.checks[0]]},"duplicate_check");
const currentCarrier=buildCarrierPrPilotEvidence({...carrierEvidence,compare:{base:"main",head:carrierHead,status:"ahead",ahead_by:49,behind_by:0},checks:carrierEvidence.checks.map(x=>({...x,conclusion:"success"}))});
assert.equal(currentCarrier.blocker,"OWNER_RELEASE_APPROVALS_UNVERIFIED");
assert.equal(currentCarrier.production_deploy_allowed,false);
console.log("HAE Carrier #1908 verified-source classifier PASS: one blocked work item, truthful CI, sanitized evidence, zero autonomous writes");


// Authenticated read-only source adapter: six GET requests, no secret/reflection or automatic dispatch.
const {readCarrierPrEvidence}=await import("./hae-carrier-pr-source.mjs");
const sourcePr={
  number:1908,html_url:"https://github.com/officeus-create/Hermes/pull/1908",
  head:{sha:carrierHead,repo:{full_name:"officeus-create/Hermes"}},
  base:{sha:carrierEvidence.pr.base_sha,repo:{full_name:"officeus-create/Hermes"}},
  state:"open",draft:true,merged_at:null,body:"SENSITIVE_PR_BODY_IGNORE"
};
const compareResponse={base_commit:{sha:carrierEvidence.main_sha},status:"diverged",ahead_by:49,behind_by:299};
const workflowResponse={total_count:3,workflow_runs:carrierEvidence.checks.map((c,i)=>({
  id:100+i,name:c.name,head_sha:carrierHead,
  repository:{full_name:"officeus-create/Hermes"},
  status:"completed",conclusion:c.conclusion
}))};
function sourceMock(overrides={}){
  const paths={
    "/pulls/1908":sourcePr,"/branches/main":{commit:{sha:carrierEvidence.main_sha}},
    ["/compare/main..."+carrierHead]:compareResponse,
    ["/actions/runs?head_sha="+carrierHead+"&event=pull_request&per_page=100"]:workflowResponse,
    ...overrides
  };
  const calls=[];
  const fetchImpl=async(url,options)=>{
    assert.equal(options.method,"GET");
    assert.equal(options.headers.Authorization,"Bearer test-github-token");
    calls.push(url);
    const key=url.replace("https://api.github.com/repos/officeus-create/Hermes","");
    return {ok:Object.hasOwn(paths,key),json:async()=>paths[key]};
  };
  return {fetchImpl,calls};
}
const goodSource=sourceMock();
const sourced=await readCarrierPrEvidence({
  githubToken:"test-github-token",fetchImpl:goodSource.fetchImpl,
  observedAt:carrierEvidence.observed_at
});
assert.equal(sourced.blocker,"STALE_BRANCH_REQUIRES_MINIMAL_RECONCILIATION");
assert.equal(sourced.github_read_only_requests,6);
assert.equal(goodSource.calls.length,6);
assert.equal(sourced.runtime_admission_verified,false);
assert.equal(sourced.automatic_job_submission_allowed,false);
assert.equal(sourced.source_identity_rechecked,true);
assert.ok(!JSON.stringify(sourced).includes("SENSITIVE_PR_BODY_IGNORE"));
await assert.rejects(()=>readCarrierPrEvidence({
  githubToken:"short",fetchImpl:goodSource.fetchImpl,
  observedAt:carrierEvidence.observed_at
}),e=>e.code==="hae_carrier_source_token_required");
await assert.rejects(()=>readCarrierPrEvidence({
  githubToken:"test-github-token",
  fetchImpl:sourceMock({["/actions/runs?head_sha="+carrierHead+"&event=pull_request&per_page=100"]:{...workflowResponse,total_count:101}}).fetchImpl,
  observedAt:carrierEvidence.observed_at
}),e=>e.code==="hae_carrier_source_source_coverage_incomplete");
await assert.rejects(()=>readCarrierPrEvidence({
  githubToken:"test-github-token",
  fetchImpl:sourceMock({"/pulls/1908":{...sourcePr,head:{...sourcePr.head,repo:{full_name:"other/repo"}}}}).fetchImpl,
  observedAt:carrierEvidence.observed_at
}),e=>e.code==="hae_carrier_source_pr_or_main_identity_invalid");
console.log("HAE carrier authenticated GitHub source adapter PASS: six GET-only reads, SHA pinning, no secrets, zero runtime writes");
