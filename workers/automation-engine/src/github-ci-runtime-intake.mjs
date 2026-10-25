// HAE #2067: independently verify a minimal GitHub Actions run ID against
// GitHub's authoritative read-only API, then reuse the existing HAE audit job.
// A Queue message never supplies "verified", writer state, diffs or raw logs.
import { normalizeGithubCIEvent } from "./github-ci-event-sensor.mjs";

const REPO="officeus-create/Hermes";
const API="https://api.github.com/repos/"+REPO;
const ALLOWED=new Set(["Hermes Automation Engine Contract","Website checks"]);
const SHA=/^[a-f0-9]{40}$/;

function invalid(code){const e=new Error(code);e.code=code;throw e;}
function positiveSafe(v){return Number.isSafeInteger(v)&&v>0;}

export function validateGithubCIQueueEnvelope(message={}){
  if(message?.type!=="github.ci.audit" ||
     !positiveSafe(message.run_id) ||
     !positiveSafe(message.run_attempt) ||
     Object.keys(message).some(k=>!["type","run_id","run_attempt"].includes(k))) {
    invalid("github_ci_queue_envelope_invalid");
  }
  return {run_id:message.run_id,run_attempt:message.run_attempt};
}

async function githubGet(path,fetchImpl){
  const url=API+path;
  let response;
  try{response=await fetchImpl(url,{headers:{
    Accept:"application/vnd.github+json",
    "User-Agent":"hermes-automation-engine-ci-readonly",
  },redirect:"error",signal:AbortSignal.timeout(10000)});}
  catch{invalid("github_ci_source_fetch_failed");}
  if(!response?.ok)invalid("github_ci_source_http_not_ok");
  try{return await response.json();}catch{invalid("github_ci_source_json_invalid");}
}
export async function verifyGithubCIQueueEnvelope(message,{fetchImpl=fetch}={}){
  const {run_id,run_attempt}=validateGithubCIQueueEnvelope(message);
  const run=await githubGet("/actions/runs/"+run_id,fetchImpl);
  if(run?.id!==run_id||run?.run_attempt!==run_attempt ||
     run?.repository?.full_name!==REPO ||
     !ALLOWED.has(run?.name)||run?.status!=="completed" ||
     !["failure","timed_out"].includes(run?.conclusion)||!SHA.test(run?.head_sha||"") ||
     run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+run_id) {
    invalid("github_ci_source_evidence_mismatch");
  }
  let prNumber=null,baseSha=null,changedPathsFingerprint=null;
  // Use the immutable workflow_run source snapshot, NEVER a later mutable
  // PR detail response: replaying the same run must yield the same D1 payload
  // even if the PR was rebased or the repository main moved afterwards.
  const runPrs=Array.isArray(run.pull_requests)?run.pull_requests:[];
  if(runPrs.length===1&&positiveSafe(runPrs[0]?.number)){
    prNumber=runPrs[0].number;
    if(SHA.test(runPrs[0]?.base?.sha||""))baseSha=runPrs[0].base.sha;
  }
  const normalized=normalizeGithubCIEvent({
    action:"completed",
    repository:{full_name:REPO},
    workflow_run:run,
  },{
    authenticated:true,
    workflowIdentityVerified:true,
    writerStateVerified:false, // #2070 must supply an independently bound writer lease.
    writerActive:false,
    baseSha,
    changedPathsFingerprint,
  });
  return {
    job_type:"hae.self.improvement.audit",
    business_lane:"automation",
    account_key:"hermes_logistics",
    project_key:"hae-ci-audit",
    priority:75,
    max_attempts:2,
    internal_submission:true,
    idempotency_key:"hae:ci:audit:"+normalized.intake_key,
    policy_version:"hae-ci-intake-v1",
    payload:{
      ...normalized.self_improvement_input,
      _source:{
        event_id:normalized.intake_key,
        source_ref:normalized.source_ref,
        repository:REPO,
        head_sha:run.head_sha,
        base_sha:baseSha,
        pr_number:prNumber,
        workflow_name:normalized.workflow_name,
        conclusion:normalized.conclusion,
        writer_state:"UNVERIFIED",
        changed_paths_fingerprint:null,
      },
    },
    source_verified:true,
    coverage_complete:false,
    automatic_repair_allowed:false,
    model_cost_usd:0,
  };
}
