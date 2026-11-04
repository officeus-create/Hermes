import { roleContractForJobType, roleContractSha256 } from "./role-contracts.mjs";

function fail(code){const error=new Error(code);error.code=code;throw error;}
function stableJson(value){return JSON.stringify(value);}
function asText(value){return value==null?"":String(value);}

function replayMatches(existing,desired){
  return asText(existing?.job_type)===desired.jobType &&
    asText(existing?.business_lane)===desired.businessLane &&
    asText(existing?.account_key)===asText(desired.accountKey) &&
    asText(existing?.project_key)===asText(desired.projectKey) &&
    Number(existing?.priority)===desired.priority &&
    Number(existing?.max_attempts)===desired.maxAttempts &&
    asText(existing?.policy_version)===desired.policyVersion &&
    asText(existing?.payload_json)===desired.payloadJson &&
    asText(existing?.result_json)===desired.resultJson &&
    asText(existing?.state)==="SUCCEEDED";
}

export async function materializeIndependentQaReceipt(db,plan){
  if(!db?.prepare||!db?.batch)fail("hae_verified_release_db_unavailable");
  if(plan?.job_type!=="hae.self.release.verify"||
     plan?.business_lane!=="automation"||
     typeof plan?.idempotency_key!=="string"||
     !plan.idempotency_key.startsWith("hae:receipt:self.qa.verify:")||
     plan?.verified_result?.release_state!=="BLOCKED"||
     plan?.verified_result?.blocker!=="AUTHENTICATED_RELEASE_EVIDENCE_INCOMPLETE"||
     plan?.verified_result?.hold_release_reachable!==false||
     plan?.verified_result?.independent_verifier_identity_ok!==false||
     plan?.verified_result?.qa_identity_provenance!=="SELF_ASSERTED_UNVERIFIED"||
     plan?.verified_result?.exact_head_ci_verified!==false||
     plan?.verified_result?.rollback_verified!==false||
     plan?.verified_result?.automatic_merge_allowed!==false||
     plan?.verified_result?.automatic_deploy_allowed!==false||
     plan?.verified_result?.cost_usd!==0) {
    fail("hae_verified_release_plan_invalid");
  }

  const contract=roleContractForJobType("hae.self.release.verify");
  if(!contract||contract.role_id!=="hermes-qa-evidence-auditor")fail("hae_verified_release_contract_missing");
  const contractSha=await roleContractSha256(contract);
  const boundPayload={
    ...plan.payload,
    _role_contract:{
      role_id:contract.role_id,
      plugin_version:contract.plugin_version,
      contract_version:contract.contract_version,
      sha256:contractSha,
    },
  };
  const result={
    capability:"hae.self.release.verify",
    external_write:false,
    role_contract:{
      role_id:contract.role_id,
      plugin_version:contract.plugin_version,
      contract_version:contract.contract_version,
      sha256:contractSha,
      semantic_required:false,
      free_ai_policy:contract.free_ai_policy,
    },
    semantic_execution:null,
    result:plan.verified_result,
  };
  const desired={
    jobType:plan.job_type,
    businessLane:plan.business_lane,
    accountKey:plan.account_key||null,
    projectKey:plan.project_key||null,
    priority:Number(plan.priority),
    maxAttempts:Number(plan.max_attempts),
    policyVersion:String(plan.policy_version||""),
    payloadJson:stableJson(boundPayload),
    resultJson:stableJson(result),
  };
  if(!Number.isInteger(desired.priority)||desired.priority<0||desired.priority>100||
     desired.maxAttempts!==1||!desired.policyVersion)fail("hae_verified_release_plan_invalid");

  const select=()=>db.prepare(
    "SELECT job_id,job_type,business_lane,account_key,project_key,priority,state,max_attempts,idempotency_key,policy_version,payload_json,result_json,last_error_class,created_at,updated_at,completed_at FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 1"
  ).bind(plan.idempotency_key).first();

  const existing=await select();
  if(existing){
    if(!replayMatches(existing,desired))fail("hae_verified_release_idempotency_conflict");
    return {created:false,duplicate:true,job:existing};
  }

  const now=new Date().toISOString();
  const jobId="job:"+crypto.randomUUID();
  const eventId=(type)=>"evt:"+jobId+":"+type+":"+crypto.randomUUID();
  try{
    await db.batch([
      db.prepare(`
        INSERT INTO hermes_automation_jobs
          (job_id,job_type,business_lane,account_key,project_key,priority,state,current_step,available_at,
           attempt_count,max_attempts,idempotency_key,policy_version,payload_json,result_json,last_error_class,
           created_at,updated_at,completed_at)
        VALUES (?,?,?,?,?,?,'SUCCEEDED','complete',NULL,0,?,?,?,?,?,NULL,?,?,?)
      `).bind(
        jobId,desired.jobType,desired.businessLane,desired.accountKey,desired.projectKey,desired.priority,
        desired.maxAttempts,plan.idempotency_key,desired.policyVersion,desired.payloadJson,desired.resultJson,
        now,now,now
      ),
      db.prepare(`
        INSERT INTO hermes_automation_job_events
          (event_id,job_id,event_type,from_state,to_state,step,evidence_ref,provider_ref,error_class,created_at)
        VALUES (?,?,'job.created',NULL,'SUCCEEDED','verify',?,NULL,NULL,?)
      `).bind(eventId("job.created"),jobId,plan.verified_result.qa_receipt_sha256,now),
      db.prepare(`
        INSERT INTO hermes_automation_job_events
          (event_id,job_id,event_type,from_state,to_state,step,evidence_ref,provider_ref,error_class,created_at)
        VALUES (?,?,'job.succeeded','SUCCEEDED','SUCCEEDED','verify',?,NULL,NULL,?)
      `).bind(eventId("job.succeeded"),jobId,plan.verified_result.qa_receipt_sha256,now),
    ]);
  }catch(error){
    const raced=await select();
    if(!raced)throw error;
    if(!replayMatches(raced,desired))fail("hae_verified_release_idempotency_conflict");
    return {created:false,duplicate:true,job:raced};
  }
  const job=await select();
  if(!job||job.job_id!==jobId)fail("hae_verified_release_readback_missing");
  return {created:true,duplicate:false,job};
}
