// HAE #2067: independently verify a minimal GitHub Actions run ID against
// GitHub's authoritative read-only API, then reuse the existing HAE audit job.
// A Queue message never supplies "verified", writer state, diffs or raw logs.
import { normalizeGithubCIEvent } from "./github-ci-event-sensor.mjs";
import { githubCIWorkflowIdentityVerified } from "./github-ci-workflow-identity.mjs";

const REPO="officeus-create/Hermes";
const API="https://api.github.com/repos/"+REPO;
const SHA=/^[a-f0-9]{40}$/;
const MAX_CHANGED_PATHS=100;
const MAX_ACTIVE_REPAIR_JOBS=100;

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

async function sha256Text(value){
  const bytes=new TextEncoder().encode(String(value));
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}

async function changedPathsEvidence(headSha,fetchImpl){
  const commit=await githubGet("/commits/"+headSha,fetchImpl);
  if(commit?.sha!==headSha||!Array.isArray(commit.files)||commit.files.length<1||
     commit.files.length>MAX_CHANGED_PATHS) invalid("github_ci_changed_paths_incomplete");
  const paths=commit.files.map(item=>item?.filename).filter(x=>typeof x==="string"&&x.length>0);
  if(paths.length!==commit.files.length||paths.some(p=>p.length>240||p.startsWith("/")||p.includes("..")||p.includes("\\")))
    invalid("github_ci_changed_path_invalid");
  const sorted=[...new Set(paths)].sort();
  if(sorted.length!==paths.length)invalid("github_ci_changed_path_duplicate");
  return {
    paths:sorted,
    fingerprint:"sha256:"+await sha256Text(sorted.join("\n")),
  };
}

async function verifyNoActiveHaeWriter(db,artifactKey){
  if(!db?.prepare)invalid("github_ci_writer_state_db_unavailable");
  let result;
  try{
    result=await db.prepare(
      "SELECT job_id,payload_json FROM hermes_automation_jobs WHERE job_type='hae.self.repair.packet' AND state IN ('QUEUED','RUNNING','RETRY_SCHEDULED','WAITING_FREE_AI') LIMIT 101"
    ).all();
  }catch{invalid("github_ci_writer_state_read_failed");}
  const rows=Array.isArray(result?.results)?result.results:(Array.isArray(result)?result:null);
  if(!rows||rows.length>MAX_ACTIVE_REPAIR_JOBS)invalid("github_ci_writer_state_ambiguous");
  for(const row of rows){
    let payload;
    try{payload=JSON.parse(String(row?.payload_json||"{}"));}catch{invalid("github_ci_writer_state_payload_invalid");}
    if(payload?.artifact_key===artifactKey)return {verified:true,active:true};
  }
  return {verified:true,active:false};
}

export async function verifyGithubCIQueueEnvelope(message,{fetchImpl=fetch,db=null}={}){
  const {run_id,run_attempt}=validateGithubCIQueueEnvelope(message);
  const run=await githubGet("/actions/runs/"+run_id,fetchImpl);
  if(run?.id!==run_id||run?.run_attempt!==run_attempt ||
     run?.repository?.full_name!==REPO ||
     run?.head_repository?.full_name!==REPO ||
     !githubCIWorkflowIdentityVerified(run)||run?.status!=="completed" ||
     !["failure","timed_out"].includes(run?.conclusion)||!SHA.test(run?.head_sha||"") ||
     run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+run_id) {
    invalid("github_ci_source_evidence_mismatch");
  }
  let prNumber=null,baseSha=null;
  const runPrs=Array.isArray(run.pull_requests)?run.pull_requests:[];
  if(runPrs.length===1&&positiveSafe(runPrs[0]?.number)){
    prNumber=runPrs[0].number;
    if(SHA.test(runPrs[0]?.base?.sha||""))baseSha=runPrs[0].base.sha;
  }

  // Commit paths are immutable evidence for the observed head. They provide
  // bounded coverage without persisting diffs or source contents.
  const changed=await changedPathsEvidence(run.head_sha,fetchImpl);
  const artifactKey="github-workflow:"+String(run.workflow_id||run.name).slice(0,100);
  // D1 is the sole HAE writer coordination surface: only absence of an active
  // HAE repair packet for this exact artifact establishes a clear writer lease.
  const writerState=await verifyNoActiveHaeWriter(db,artifactKey);

  const normalized=normalizeGithubCIEvent({
    action:"completed",
    repository:{full_name:REPO},
    workflow_run:run,
  },{
    authenticated:true,
    workflowIdentityVerified:true,
    writerStateVerified:writerState.verified,
    writerActive:writerState.active,
    baseSha,
    changedPathsFingerprint:changed.fingerprint,
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
        writer_state:writerState.active?"ACTIVE":"VERIFIED_CLEAR",
        changed_paths_fingerprint:changed.fingerprint,
        changed_path_count:changed.paths.length,
      },
    },
    source_verified:true,
    coverage_complete:normalized.coverage_complete,
    automatic_repair_allowed:false,
    model_cost_usd:0,
  };
}
