import { githubCIWorkflowIdentityVerified } from "./github-ci-workflow-identity.mjs";

const REPO="officeus-create/Hermes";
const SHA=/^[a-f0-9]{40}$/;
const DIGEST=/^sha256:[a-f0-9]{64}$/;
const PATCHABLE_TEST_PATH=/^scripts\/(?:automation-engine|hae)-[a-z0-9][a-z0-9._-]*\.test\.mjs$/;
const JOB_ID=/^job:[A-Za-z0-9._:-]{6,180}$/;
const WORK_ID=/^HAE-SELF:[A-Za-z0-9._:-]{3,180}$/;
const KEYS=new Set([
  "type","run_id","run_attempt","producer_main_sha","repository",
  "workflow_name","workflow_path","workflow_id","head_sha",
  "repair_job_id","work_id","finding_id","artifact_key",
  "source_excerpt","source_excerpt_sha256","failure_summary"
]);

function invalid(code){const error=new Error(code);error.code=code;throw error;}
function positiveInt(value){return Number.isSafeInteger(value)&&value>0;}
function parseJson(value,code){
  try{return JSON.parse(String(value||"{}"));}catch{invalid(code);}
}
async function sha256(value){
  const bytes=new TextEncoder().encode(String(value));
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return "sha256:"+[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
function safeSource(value){
  return typeof value==="string" && value.length>0 &&
    new TextEncoder().encode(value).byteLength<=6000 &&
    !/[\0\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value) &&
    !/(?:sk-proj-|ghp_[A-Za-z0-9]{12,}|BEGIN [A-Z ]*PRIVATE KEY|Authorization:\s*Bearer\s+[A-Za-z0-9._-]{12,})/i.test(value);
}
function safeSummary(value){
  return typeof value==="string" && value.length>=8 && value.length<=800 &&
    value.trim()===value && !/[\r\n\0\x01-\x1f\x7f]/.test(value);
}

export function validateGithubCIPatchProposalEnvelope(message={}){
  if(!message||Array.isArray(message)||typeof message!=="object"||
     Object.keys(message).length!==KEYS.size||
     Object.keys(message).some(key=>!KEYS.has(key))) invalid("github_ci_patch_envelope_invalid");
  if(message.type!=="github.ci.patch.propose"||
     message.repository!==REPO||
     !positiveInt(message.run_id)||!positiveInt(message.run_attempt)||
     !SHA.test(message.producer_main_sha||"")||!SHA.test(message.head_sha||"")||
     !positiveInt(message.workflow_id)||
     !githubCIWorkflowIdentityVerified({
       name:message.workflow_name,path:message.workflow_path,workflow_id:message.workflow_id
     })||
     !JOB_ID.test(message.repair_job_id||"")||
     !WORK_ID.test(message.work_id||"")||
     typeof message.finding_id!=="string"||
     message.work_id!=="HAE-SELF:"+message.finding_id||
     !PATCHABLE_TEST_PATH.test(message.artifact_key||"")||
     String(message.artifact_key).includes("..")||
     !safeSource(message.source_excerpt)||
     !DIGEST.test(message.source_excerpt_sha256||"")||
     !safeSummary(message.failure_summary)) {
    invalid("github_ci_patch_envelope_invalid");
  }
  return Object.freeze({...message});
}

export async function verifyGithubCIPatchProposalEnvelope(message,{
  db=null,deployedSourceSha=null,
}={}){
  const source=validateGithubCIPatchProposalEnvelope(message);
  if(!db?.prepare) invalid("github_ci_patch_db_unavailable");
  if(!SHA.test(deployedSourceSha||"")||source.producer_main_sha!==deployedSourceSha)
    invalid("github_ci_patch_producer_main_sha_mismatch");
  if(await sha256(source.source_excerpt)!==source.source_excerpt_sha256)
    invalid("github_ci_patch_source_digest_mismatch");

  let repair;
  try{
    repair=await db.prepare(
      "SELECT job_id,job_type,state,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
    ).bind(source.repair_job_id).first();
  }catch{
    invalid("github_ci_patch_repair_read_failed");
  }
  if(!repair) invalid("github_ci_patch_repair_missing");
  if(String(repair.job_type||"")!=="hae.self.repair.packet"||String(repair.state||"")!=="SUCCEEDED")
    invalid("github_ci_patch_repair_not_accepted");
  const payload=parseJson(repair.payload_json,"github_ci_patch_repair_payload_invalid");
  const result=parseJson(repair.result_json,"github_ci_patch_repair_result_invalid");
  const repairResult=result?.result;
  if(payload?.work_id!==source.work_id||
     payload?.finding_id!==source.finding_id||
     payload?.artifact_key!==source.artifact_key||
     repairResult?.work_id!==source.work_id||
     repairResult?.finding_id!==source.finding_id||
     repairResult?.artifact_key!==source.artifact_key||
     repairResult?.repair_state!=="HOLD_REPAIR"||
     repairResult?.source_change_performed!==false||
     repairResult?.automatic_merge_performed!==false||
     repairResult?.automatic_deploy_performed!==false) {
    invalid("github_ci_patch_repair_identity_mismatch");
  }

  const defectEvidenceRef="HAE-EVIDENCE:github_ci_"+source.run_id+"_"+source.run_attempt+"_"+source.head_sha.slice(0,12);
  return Object.freeze({
    job_type:"hae.self.patch.propose",
    business_lane:"automation",
    account_key:"hermes_logistics",
    project_key:"hae-self-patch",
    priority:90,
    max_attempts:1,
    internal_submission:true,
    idempotency_key:"hae:followup:self.patch.propose:"+source.work_id,
    policy_version:"hae-self-patch-v1",
    payload:{
      work_id:source.work_id,
      finding_id:source.finding_id,
      repair_job_id:source.repair_job_id,
      artifact_key:source.artifact_key,
      base_sha:source.head_sha,
      observed_base_sha:source.head_sha,
      defect_evidence_ref:defectEvidenceRef,
      source_status:"HOLD_REPAIR",
      source_coverage_complete:true,
      finding_verified:true,
      writer_state_verified:true,
      writer_active:false,
      source_excerpt:source.source_excerpt,
      source_excerpt_sha256:source.source_excerpt_sha256,
      failure_summary:source.failure_summary,
    },
  });
}
