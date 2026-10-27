// HAE #2067: verify a minimized GitHub Actions snapshot that was authenticated
// by the canonical GitHub Actions producer before it entered the private
// Cloudflare Queue. The Worker never receives a GitHub token and performs no
// outbound GitHub fetch. D1 remains the sole writer-lease authority.
import { normalizeGithubCIEvent } from "./github-ci-event-sensor.mjs";
import { githubCIWorkflowIdentityVerified } from "./github-ci-workflow-identity.mjs";

const REPO="officeus-create/Hermes";
const SHA=/^[a-f0-9]{40}$/;
const FINGERPRINT=/^sha256:[a-f0-9]{64}$/;
const MAX_CHANGED_PATHS=100;
const MAX_ACTIVE_REPAIR_JOBS=100;
const PATCHABLE_TEST_PATH=/^scripts\/(?:automation-engine|hae)-[a-z0-9][a-z0-9._-]*\.test\.mjs$/;
const KEYS=new Set([
  "type","run_id","run_attempt","producer_main_sha","repository",
  "workflow_name","workflow_path","workflow_id","event","status","conclusion",
  "head_sha","html_url","updated_at","changed_paths_fingerprint",
  "changed_path_count","repair_artifact_key","base_sha","pr_number"
]);

function invalid(code){const e=new Error(code);e.code=code;throw e;}
function positiveSafe(v){return Number.isSafeInteger(v)&&v>0;}
function exactKeys(message){
  const keys=Object.keys(message||{});
  return keys.length===KEYS.size&&keys.every(k=>KEYS.has(k));
}
function validIso(value){
  return typeof value==="string"&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
}
async function repairArtifactFingerprint(path){
  const bytes=new TextEncoder().encode(path);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return "sha256:"+[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}

export function validateGithubCIQueueEnvelope(message={}){
  if(!exactKeys(message) ||
     message.type!=="github.ci.audit" ||
     message.repository!==REPO ||
     !positiveSafe(message.run_id) ||
     !positiveSafe(message.run_attempt) ||
     !SHA.test(message.producer_main_sha||"") ||
     !SHA.test(message.head_sha||"") ||
     message.status!=="completed" ||
     !["failure","timed_out"].includes(message.conclusion) ||
     !FINGERPRINT.test(message.changed_paths_fingerprint||"") ||
     !positiveSafe(message.changed_path_count) ||
     message.changed_path_count>MAX_CHANGED_PATHS ||
     !(message.repair_artifact_key===null||PATCHABLE_TEST_PATH.test(message.repair_artifact_key||"")) ||
     (message.repair_artifact_key!==null&&message.changed_path_count!==1) ||
     !validIso(message.updated_at) ||
     message.html_url!=="https://github.com/"+REPO+"/actions/runs/"+message.run_id ||
     !(message.base_sha===null||SHA.test(message.base_sha||"")) ||
     !(message.pr_number===null||positiveSafe(message.pr_number))) {
    invalid("github_ci_queue_envelope_invalid");
  }
  const workflowProbe={
    name:message.workflow_name,
    path:message.workflow_path,
    workflow_id:message.workflow_id,
  };
  if(!githubCIWorkflowIdentityVerified(workflowProbe))
    invalid("github_ci_workflow_identity_invalid");
  if(typeof message.event!=="string"||message.event.length<1||message.event.length>80)
    invalid("github_ci_event_name_invalid");
  return Object.freeze({...message});
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

export async function verifyGithubCIQueueEnvelope(message,{db=null,deployedSourceSha=null}={}){
  const source=validateGithubCIQueueEnvelope(message);
  if(!SHA.test(deployedSourceSha||"")||source.producer_main_sha!==deployedSourceSha)
    invalid("github_ci_producer_main_sha_mismatch");
  if(source.repair_artifact_key!==null &&
     await repairArtifactFingerprint(source.repair_artifact_key)!==source.changed_paths_fingerprint)
    invalid("github_ci_changed_paths_fingerprint_mismatch");

  // #2068 may mutate only one authenticated allowlisted deterministic test file.
  // Multi-file and non-test failures remain durable findings but cannot become patch packets.
  const patchableArtifact=source.repair_artifact_key;
  const artifactKey=patchableArtifact||("github-workflow:"+String(source.workflow_id));
  const writerState=await verifyNoActiveHaeWriter(db,artifactKey);
  const run={
    id:source.run_id,
    run_attempt:source.run_attempt,
    status:source.status,
    conclusion:source.conclusion,
    repository:{full_name:REPO},
    head_repository:{full_name:REPO},
    name:source.workflow_name,
    path:source.workflow_path,
    workflow_id:source.workflow_id,
    head_sha:source.head_sha,
    html_url:source.html_url,
    event:source.event,
    updated_at:source.updated_at,
  };
  const normalized=normalizeGithubCIEvent({
    action:"completed",
    repository:{full_name:REPO},
    workflow_run:run,
  },{
    authenticated:true,
    workflowIdentityVerified:true,
    writerStateVerified:writerState.verified,
    writerActive:writerState.active,
    baseSha:source.base_sha,
    changedPathsFingerprint:source.changed_paths_fingerprint,
  });
  const selfImprovementInput={
    ...normalized.self_improvement_input,
    findings:normalized.self_improvement_input.findings.map(finding=>({
      ...finding,
      artifact_key:artifactKey,
      status:patchableArtifact?finding.status:"BLOCKED",
    })),
  };
  return {
    job_type:"hae.self.improvement.audit",
    business_lane:"automation",
    account_key:"hermes_logistics",
    project_key:"hae-ci-audit",
    priority:75,
    max_attempts:2,
    internal_submission:true,
    idempotency_key:"hae:ci:audit:"+normalized.intake_key,
    policy_version:"hae-ci-intake-v2",
    payload:{
      ...selfImprovementInput,
      _source:{
        event_id:normalized.intake_key,
        source_ref:normalized.source_ref,
        repository:REPO,
        head_sha:source.head_sha,
        base_sha:source.base_sha,
        pr_number:source.pr_number,
        workflow_name:normalized.workflow_name,
        workflow_path:source.workflow_path,
        workflow_id:source.workflow_id,
        conclusion:normalized.conclusion,
        writer_state:writerState.active?"ACTIVE":"VERIFIED_CLEAR",
        changed_paths_fingerprint:source.changed_paths_fingerprint,
        changed_path_count:source.changed_path_count,
        patchable_artifact_key:patchableArtifact,
        producer_main_sha:source.producer_main_sha,
        trust_class:"GITHUB_ACTIONS_EPHEMERAL_TOKEN_TO_PRIVATE_CLOUDFLARE_QUEUE",
      },
    },
    source_verified:true,
    coverage_complete:normalized.coverage_complete,
    automatic_repair_allowed:false,
    model_cost_usd:0,
  };
}
