import { githubCIWorkflowIdentityVerified } from "./github-ci-workflow-identity.mjs";

const REPO="officeus-create/Hermes";
const SHA=/^[a-f0-9]{40}$/;
const DIGEST=/^sha256:[a-f0-9]{64}$/;
const JOB_ID=/^job:[A-Za-z0-9._:-]{6,180}$/;
const WORK_ID=/^HAE-SELF:[A-Za-z0-9._:-]{3,180}$/;
const PATCHABLE_TEST_PATH=/^scripts\/(?:automation-engine|hae)-[a-z0-9][a-z0-9._-]*\.test\.mjs$/;
const KEYS=new Set([
  "type","run_id","run_attempt","producer_main_sha","repository",
  "workflow_name","workflow_path","workflow_id","source_head_sha",
  "work_id","finding_id","repair_job_id","proposal_job_id","artifact_key",
  "patch_sha256","qa_role","qa_verdict","qa_receipt_sha256"
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
export function canonicalGithubCIIndependentQaReceipt(source){
  return [
    source.run_id,
    source.run_attempt,
    source.producer_main_sha,
    source.source_head_sha,
    source.work_id,
    source.finding_id,
    source.repair_job_id,
    source.proposal_job_id,
    source.artifact_key,
    source.patch_sha256,
    source.qa_role,
    source.qa_verdict,
  ].join("|");
}

export function validateGithubCIIndependentQaEnvelope(message={}){
  if(!message||Array.isArray(message)||typeof message!=="object"||
     Object.keys(message).length!==KEYS.size||
     Object.keys(message).some(key=>!KEYS.has(key))) invalid("github_ci_qa_envelope_invalid");
  if(message.type!=="github.ci.qa.verify"||
     message.repository!==REPO||
     !positiveInt(message.run_id)||!positiveInt(message.run_attempt)||
     !SHA.test(message.producer_main_sha||"")||!SHA.test(message.source_head_sha||"")||
     !positiveInt(message.workflow_id)||
     !githubCIWorkflowIdentityVerified({
       name:message.workflow_name,path:message.workflow_path,workflow_id:message.workflow_id
     })||
     !WORK_ID.test(message.work_id||"")||
     typeof message.finding_id!=="string"||
     message.work_id!=="HAE-SELF:"+message.finding_id||
     !JOB_ID.test(message.repair_job_id||"")||
     !JOB_ID.test(message.proposal_job_id||"")||
     !PATCHABLE_TEST_PATH.test(message.artifact_key||"")||
     String(message.artifact_key).includes("..")||
     !DIGEST.test(message.patch_sha256||"")||
     message.qa_role!=="hermes-qa-evidence-auditor"||
     message.qa_verdict!=="PASS"||
     !DIGEST.test(message.qa_receipt_sha256||"")) {
    invalid("github_ci_qa_envelope_invalid");
  }
  return Object.freeze({...message});
}

export async function verifyGithubCIIndependentQaEnvelope(message,{
  db=null,deployedSourceSha=null,
}={}){
  const source=validateGithubCIIndependentQaEnvelope(message);
  if(!db?.prepare) invalid("github_ci_qa_db_unavailable");
  if(!SHA.test(deployedSourceSha||"")||source.producer_main_sha!==deployedSourceSha)
    invalid("github_ci_qa_producer_main_sha_mismatch");
  if(await sha256(canonicalGithubCIIndependentQaReceipt(source))!==source.qa_receipt_sha256)
    invalid("github_ci_qa_receipt_digest_mismatch");

  let repair,proposal;
  try{
    repair=await db.prepare(
      "SELECT job_id,job_type,state,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
    ).bind(source.repair_job_id).first();
    proposal=await db.prepare(
      "SELECT job_id,job_type,state,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
    ).bind(source.proposal_job_id).first();
  }catch{
    invalid("github_ci_qa_evidence_read_failed");
  }
  if(!repair||!proposal) invalid("github_ci_qa_evidence_missing");
  if(String(repair.job_type||"")!=="hae.self.repair.packet"||String(repair.state||"")!=="SUCCEEDED")
    invalid("github_ci_qa_repair_not_accepted");
  if(String(proposal.job_type||"")!=="hae.self.patch.propose"||String(proposal.state||"")!=="SUCCEEDED")
    invalid("github_ci_qa_proposal_not_accepted");

  const repairPayload=parseJson(repair.payload_json,"github_ci_qa_repair_payload_invalid");
  const repairResult=parseJson(repair.result_json,"github_ci_qa_repair_result_invalid");
  const proposalPayload=parseJson(proposal.payload_json,"github_ci_qa_proposal_payload_invalid");
  const proposalResult=parseJson(proposal.result_json,"github_ci_qa_proposal_result_invalid");
  const rr=repairResult?.result;
  const pr=proposalResult?.result;
  const semantic=proposalResult?.semantic_execution;

  if(repairPayload?.work_id!==source.work_id||
     repairPayload?.finding_id!==source.finding_id||
     repairPayload?.artifact_key!==source.artifact_key||
     rr?.work_id!==source.work_id||
     rr?.finding_id!==source.finding_id||
     rr?.artifact_key!==source.artifact_key||
     rr?.repair_state!=="HOLD_REPAIR"||
     rr?.source_change_performed!==false||
     rr?.automatic_merge_performed!==false||
     rr?.automatic_deploy_performed!==false) {
    invalid("github_ci_qa_repair_identity_mismatch");
  }

  if(proposalPayload?.work_id!==source.work_id||
     proposalPayload?.finding_id!==source.finding_id||
     proposalPayload?.repair_job_id!==source.repair_job_id||
     proposalPayload?.artifact_key!==source.artifact_key||
     proposalPayload?.base_sha!==source.source_head_sha||
     proposalPayload?.observed_base_sha!==source.source_head_sha||
     proposalPayload?.source_status!=="HOLD_REPAIR"||
     proposalPayload?.source_coverage_complete!==true||
     proposalPayload?.finding_verified!==true||
     proposalPayload?.writer_state_verified!==true||
     proposalPayload?.writer_active!==false||
     pr?.work_id!==source.work_id||
     pr?.finding_id!==source.finding_id||
     pr?.repair_job_id!==source.repair_job_id||
     pr?.artifact_key!==source.artifact_key||
     pr?.base_sha!==source.source_head_sha||
     pr?.proposal_status!=="HOLD_BOUNDED_REPAIR_PREFLIGHT"||
     pr?.automatic_git_write!==false||
     pr?.automatic_merge!==false||
     pr?.automatic_deploy!==false||
     semantic?.cost_usd!==0||
     proposalResult?.external_write!==false||
     typeof pr?.diff!=="string"||
     await sha256(pr.diff)!==source.patch_sha256) {
    invalid("github_ci_qa_proposal_identity_mismatch");
  }

  return Object.freeze({
    job_type:"hae.self.release.verify",
    business_lane:"automation",
    account_key:"hermes_logistics",
    project_key:"hae-independent-qa",
    priority:95,
    max_attempts:1,
    idempotency_key:"hae:receipt:self.qa.verify:"+source.work_id,
    policy_version:"hae-independent-qa-v1",
    payload:Object.freeze({
      work_id:source.work_id,
      artifact_key:source.artifact_key,
      repair_job_id:source.repair_job_id,
    }),
    verified_result:Object.freeze({
      receipt_version:"hae-independent-qa-v1",
      work_id:source.work_id,
      finding_id:source.finding_id,
      artifact_key:source.artifact_key,
      repair_job_id:source.repair_job_id,
      proposal_job_id:source.proposal_job_id,
      source_head_sha:source.source_head_sha,
      patch_sha256:source.patch_sha256,
      qa_receipt_sha256:source.qa_receipt_sha256,
      release_state:"BLOCKED",
      blocker:"AUTHENTICATED_RELEASE_EVIDENCE_INCOMPLETE",
      hold_release_reachable:false,
      verifier:Object.freeze({
        role_id:"hermes-qa-evidence-auditor",
        verdict:"PASS",
      }),
      independent_verifier_identity_ok:true,
      exact_head_ci_verified:false,
      rollback_required:true,
      rollback_verified:false,
      automatic_merge_allowed:false,
      automatic_deploy_allowed:false,
      human_hold_release_required:true,
      self_improvement_should_pause:false,
      next_lane:"SELF_IMPROVEMENT",
      next_action:"VERIFY_ROLLBACK_AND_REQUIRED_GITHUB_CHECKS_BEFORE_HOLD_RELEASE",
      cost_usd:0,
    }),
  });
}
