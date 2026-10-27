import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import {githubCIWorkflowIdentityVerified} from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";
import {canonicalGithubCIIndependentQaReceipt} from "../workers/automation-engine/src/github-ci-independent-qa-runtime-intake.mjs";
import {executeBoundedRepair} from "./hae-bounded-repair-executor.mjs";

const REPO="officeus-create/Hermes";
const API="https://api.cloudflare.com/client/v4";
const UUID=/^[a-f0-9-]{32,36}$/;
const SHA=/^[a-f0-9]{40}$/;
const DIGEST=/^sha256:[a-f0-9]{64}$/;
const JOB_ID=/^job:[A-Za-z0-9._:-]{6,180}$/;
const WORK_ID=/^HAE-SELF:[A-Za-z0-9._:-]{3,180}$/;
const PATCHABLE_TEST_PATH=/^scripts\/(?:automation-engine|hae)-[a-z0-9][a-z0-9._-]*\.test\.mjs$/;
const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
function fail(code){const error=new Error(code);error.code=code;throw error;}
const hash=(value)=>"sha256:"+createHash("sha256").update(String(value),"utf8").digest("hex");

async function jsonFetch(url,token,fetchImpl,postBody){
  const options={
    method:postBody===undefined?"GET":"POST",
    headers:{Authorization:"Bearer "+token,Accept:"application/json",...(postBody===undefined?{}:{"Content-Type":"application/json"})},
    ...(postBody===undefined?{}:{body:JSON.stringify(postBody)}),
    signal:AbortSignal.timeout(12000),
  };
  let response;
  try{response=await fetchImpl(url,options);}catch{fail("github_ci_qa_source_transport_ambiguous_no_retry");}
  if(!response?.ok)fail("github_ci_qa_source_http_rejected");
  try{return await response.json();}catch{fail("github_ci_qa_source_json_invalid");}
}
function d1Rows(payload){
  if(payload?.success!==true||!Array.isArray(payload.result)||payload.result.length!==1||
     payload.result[0]?.success===false||!Array.isArray(payload.result[0]?.results))
    fail("github_ci_qa_source_d1_response_invalid");
  return payload.result[0].results;
}
function safeResult(value){
  if(value==null||value==="")return null;
  try{return JSON.parse(String(value));}catch{fail("github_ci_qa_source_d1_json_invalid");}
}
async function canonicalD1(accountId,token,fetchImpl){
  const pages=await jsonFetch(API+"/accounts/"+accountId+"/pages/projects/hermes",token,fetchImpl);
  if(pages?.success!==true)fail("github_ci_qa_source_pages_invalid");
  const binding=pages.result?.deployment_configs?.production?.d1_databases?.DB;
  if(!UUID.test(binding?.id||""))fail("github_ci_qa_source_d1_id_missing");
  const dbId=binding.id;
  let name=binding.database_name||binding.name;
  if(!name){
    const detail=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId,token,fetchImpl);
    if(detail?.success!==true||!detail?.result)fail("github_ci_qa_source_d1_metadata_invalid");
    if(detail.result.uuid&&detail.result.uuid!==dbId)fail("github_ci_qa_source_d1_metadata_id_mismatch");
    name=detail.result.name||detail.result.database_name;
  }
  if(name!=="hermes-connect-prototype")fail("github_ci_qa_source_d1_name_mismatch");
  return dbId;
}
async function d1Query(accountId,dbId,token,fetchImpl,sql,params=[]){
  const payload=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId+"/query",token,fetchImpl,{sql,params});
  return d1Rows(payload);
}
function validatePatchReceipt(receipt,{runId,runAttempt}){
  if(!receipt||Array.isArray(receipt)||typeof receipt!=="object"||
     receipt.status!=="HOLD_INDEPENDENT_QA"||
     receipt.candidate_status!=="HOLD_INDEPENDENT_QA"||
     receipt.run_id!==runId||receipt.run_attempt!==runAttempt||
     !JOB_ID.test(receipt.proposal_job_id||"")||
     !WORK_ID.test(receipt.work_id||"")||
     typeof receipt.finding_id!=="string"||receipt.work_id!=="HAE-SELF:"+receipt.finding_id||
     !PATCHABLE_TEST_PATH.test(receipt.artifact_key||"")||
     !SHA.test(receipt.base_sha||"")||
     !DIGEST.test(receipt.patch_sha256||"")||
     !DIGEST.test(receipt.patched_file_sha256||"")||
     receipt.required_independent_verifier!=="hermes-qa-evidence-auditor"||
     receipt.automatic_branch_creation!==false||
     receipt.automatic_commit!==false||
     receipt.automatic_git_provider_write!==false||
     receipt.automatic_d1_or_queue_write!==false||
     receipt.automatic_merge!==false||
     receipt.automatic_deploy!==false||
     receipt.production_change_performed!==false||
     receipt.paid_ai_cost_usd!==0){
    fail("github_ci_qa_patch_receipt_invalid");
  }
  return receipt;
}
function releaseReceiptMatches(row,{workId,findingId,artifactKey,repairJobId,proposalJobId,sourceHeadSha,patchSha,qaDigest}){
  if(!row||row.job_type!=="hae.self.release.verify"||String(row.state||"")!=="SUCCEEDED")return false;
  const parsed=safeResult(row.result_json);
  return parsed?.external_write===false&&
    parsed?.result?.work_id===workId&&
    parsed?.result?.finding_id===findingId&&
    parsed?.result?.artifact_key===artifactKey&&
    parsed?.result?.repair_job_id===repairJobId&&
    parsed?.result?.proposal_job_id===proposalJobId&&
    parsed?.result?.source_head_sha===sourceHeadSha&&
    parsed?.result?.patch_sha256===patchSha&&
    parsed?.result?.qa_receipt_sha256===qaDigest&&
    parsed?.result?.release_state==="BLOCKED"&&
    parsed?.result?.blocker==="AUTHENTICATED_RELEASE_EVIDENCE_INCOMPLETE"&&
    parsed?.result?.hold_release_reachable===false&&
    parsed?.result?.independent_verifier_identity_ok===false&&
    parsed?.result?.qa_identity_provenance==="SELF_ASSERTED_UNVERIFIED"&&
    parsed?.result?.exact_head_ci_verified===false&&
    parsed?.result?.rollback_verified===false&&
    parsed?.result?.automatic_merge_allowed===false&&
    parsed?.result?.automatic_deploy_allowed===false&&
    parsed?.result?.cost_usd===0;
}

export async function dispatchGithubCIIndependentQa({
  runId,runAttempt,expectedMainSha,githubToken,cloudflareToken,accountId,
  repoRoot,patchReceipt,fetchImpl=fetch,sleepImpl=wait,maxReadbackAttempts=30,
  executeImpl=executeBoundedRepair,
}={}){
  if(!Number.isSafeInteger(runId)||runId<=0||!Number.isSafeInteger(runAttempt)||runAttempt<=0||
     !SHA.test(expectedMainSha||"")||!githubToken||!cloudflareToken||!UUID.test(accountId||"")||
     typeof repoRoot!=="string"||!repoRoot||!Number.isSafeInteger(maxReadbackAttempts)||
     maxReadbackAttempts<1||maxReadbackAttempts>60||typeof executeImpl!=="function")
    fail("github_ci_qa_source_preflight_invalid");
  const receipt=validatePatchReceipt(patchReceipt,{runId,runAttempt});

  const main=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(main?.commit?.sha!==expectedMainSha)fail("github_ci_qa_source_main_moved");
  const run=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId,githubToken,fetchImpl);
  if(run?.id!==runId||run?.run_attempt!==runAttempt||
     run?.repository?.full_name!==REPO||run?.head_repository?.full_name!==REPO||
     !githubCIWorkflowIdentityVerified(run)||run?.status!=="completed"||
     !["failure","timed_out"].includes(run?.conclusion)||
     run?.head_sha!==receipt.base_sha||
     run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+runId)
    fail("github_ci_qa_source_run_invalid");

  const settings=await jsonFetch(API+"/accounts/"+accountId+"/workers/scripts/hermes-automation-engine/settings",cloudflareToken,fetchImpl);
  if(settings?.success!==true||!Array.isArray(settings?.result?.bindings))fail("github_ci_qa_source_worker_settings_invalid");
  const value=(name)=>{
    const b=settings.result.bindings.find(item=>item?.name===name);
    return b?.text??b?.value??null;
  };
  if(value("HERMES_AUTOMATION_SOURCE_SHA")!==expectedMainSha||
     value("HERMES_AUTOMATION_MODE")!=="dry_run"||
     value("HERMES_AUTOMATION_PUBLISH")!=="disabled")
    fail("github_ci_qa_source_worker_not_exact_dry_run_main");

  const dbId=await canonicalD1(accountId,cloudflareToken,fetchImpl);
  const proposalRows=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,
    "SELECT job_id,job_type,state,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=? LIMIT 2",
    [receipt.proposal_job_id]);
  if(proposalRows.length!==1)fail("github_ci_qa_source_proposal_missing_or_ambiguous");
  const proposal=proposalRows[0];
  if(proposal.job_type!=="hae.self.patch.propose"||proposal.state!=="SUCCEEDED")
    fail("github_ci_qa_source_proposal_not_accepted");
  const proposalPayload=safeResult(proposal.payload_json);
  const proposalResult=safeResult(proposal.result_json);
  const pr=proposalResult?.result;
  if(proposalPayload?.work_id!==receipt.work_id||
     proposalPayload?.finding_id!==receipt.finding_id||
     proposalPayload?.artifact_key!==receipt.artifact_key||
     proposalPayload?.base_sha!==receipt.base_sha||
     proposalPayload?.observed_base_sha!==receipt.base_sha||
     proposalPayload?.source_status!=="HOLD_REPAIR"||
     proposalPayload?.source_coverage_complete!==true||
     proposalPayload?.finding_verified!==true||
     proposalPayload?.writer_state_verified!==true||
     proposalPayload?.writer_active!==false||
     !JOB_ID.test(proposalPayload?.repair_job_id||"")||
     pr?.work_id!==receipt.work_id||
     pr?.finding_id!==receipt.finding_id||
     pr?.repair_job_id!==proposalPayload.repair_job_id||
     pr?.artifact_key!==receipt.artifact_key||
     pr?.base_sha!==receipt.base_sha||
     pr?.proposal_status!=="HOLD_BOUNDED_REPAIR_PREFLIGHT"||
     pr?.automatic_git_write!==false||pr?.automatic_merge!==false||pr?.automatic_deploy!==false||
     proposalResult?.external_write!==false||
     proposalResult?.semantic_execution?.cost_usd!==0||
     typeof pr?.diff!=="string"||
     hash(pr.diff)!==receipt.patch_sha256)
    fail("github_ci_qa_source_proposal_contract_mismatch");

  const repairRows=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,
    "SELECT job_id,job_type,state,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=? LIMIT 2",
    [proposalPayload.repair_job_id]);
  if(repairRows.length!==1)fail("github_ci_qa_source_repair_missing_or_ambiguous");
  const repair=repairRows[0];
  const repairPayload=safeResult(repair.payload_json);
  const repairResult=safeResult(repair.result_json);
  if(repair.job_type!=="hae.self.repair.packet"||repair.state!=="SUCCEEDED"||
     repairPayload?.work_id!==receipt.work_id||repairPayload?.finding_id!==receipt.finding_id||
     repairPayload?.artifact_key!==receipt.artifact_key||
     repairResult?.result?.repair_state!=="HOLD_REPAIR")
    fail("github_ci_qa_source_repair_contract_mismatch");

  // Derive replay identity before readback, without executing the repair or enqueuing.
  const qaMessage={
    type:"github.ci.qa.verify",
    run_id:runId,run_attempt:runAttempt,producer_main_sha:expectedMainSha,
    repository:REPO,workflow_name:run.name,workflow_path:run.path,workflow_id:run.workflow_id,
    source_head_sha:receipt.base_sha,work_id:receipt.work_id,finding_id:receipt.finding_id,
    repair_job_id:proposalPayload.repair_job_id,proposal_job_id:receipt.proposal_job_id,
    artifact_key:receipt.artifact_key,patch_sha256:receipt.patch_sha256,
    qa_role:"hermes-qa-evidence-auditor",qa_verdict:"PASS",
    qa_receipt_sha256:"",
  };
  qaMessage.qa_receipt_sha256=hash(canonicalGithubCIIndependentQaReceipt(qaMessage));
  const expectedQaReceipt={
    workId:receipt.work_id,findingId:receipt.finding_id,artifactKey:receipt.artifact_key,
    repairJobId:proposalPayload.repair_job_id,proposalJobId:receipt.proposal_job_id,
    sourceHeadSha:receipt.base_sha,patchSha:receipt.patch_sha256,
    qaDigest:qaMessage.qa_receipt_sha256,
  };

  const releaseKey="hae:receipt:self.qa.verify:"+receipt.work_id;
  const releaseSql="SELECT job_id,job_type,state,result_json,last_error_class FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 2";
  let releases=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,releaseSql,[releaseKey]);
  if(releases.length>1)fail("github_ci_qa_source_duplicate_release_receipts");
  if(releases.length===1&&releaseReceiptMatches(releases[0],expectedQaReceipt)){
    return Object.freeze({
      status:"INDEPENDENT_QA_EVIDENCE_ONLY",duplicate:true,queue_sent:false,
      release_job_id:String(releases[0].job_id||""),work_id:receipt.work_id,
      patch_sha256:receipt.patch_sha256,model_cost_usd:0,
      automatic_merge:false,automatic_deploy:false,
    });
  }
  if(releases.length===1)fail("github_ci_qa_source_existing_release_conflict");

  const qaInput={
    job_type:"hae.self.repair.packet",
    work_id:receipt.work_id,
    finding_id:receipt.finding_id,
    source_status:"HOLD_REPAIR",
    source_coverage_complete:true,
    finding_verified:true,
    writer_state_verified:true,
    writer_active:false,
    base_sha:receipt.base_sha,
    observed_base_sha:receipt.base_sha,
    artifact_key:receipt.artifact_key,
    allowed_paths:[receipt.artifact_key],
    diff:pr.diff,
    writer_role:"hermes-automatic-engineer",
    independent_verifier_role:"hermes-qa-evidence-auditor",
    defect_evidence_ref:proposalPayload.defect_evidence_ref,
  };
  const qaProof=executeImpl({repoRoot,input:qaInput});
  if(qaProof?.candidate_status!=="HOLD_INDEPENDENT_QA"||
     qaProof?.work_id!==receipt.work_id||qaProof?.finding_id!==receipt.finding_id||
     qaProof?.artifact_key!==receipt.artifact_key||qaProof?.base_sha!==receipt.base_sha||
     qaProof?.patch_sha256!==receipt.patch_sha256||
     qaProof?.patched_file_sha256!==receipt.patched_file_sha256||
     qaProof?.required_independent_verifier!=="hermes-qa-evidence-auditor"||
     qaProof?.automatic_merge!==false||qaProof?.automatic_deploy!==false||
     qaProof?.paid_ai_cost_usd!==0)
    fail("github_ci_qa_source_independent_reproof_mismatch");

  const mainAgain=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(mainAgain?.commit?.sha!==expectedMainSha)fail("github_ci_qa_source_main_moved");
  const queues=await jsonFetch(API+"/accounts/"+accountId+"/queues",cloudflareToken,fetchImpl);
  if(queues?.success!==true||!Array.isArray(queues.result))fail("github_ci_qa_source_queue_inventory_invalid");
  const matches=queues.result.filter(q=>q.queue_name==="hermes-automation"&&UUID.test(q.queue_id||""));
  if(matches.length!==1)fail("github_ci_qa_source_canonical_queue_missing_or_ambiguous");
  const accepted=await jsonFetch(API+"/accounts/"+accountId+"/queues/"+matches[0].queue_id+"/messages",cloudflareToken,fetchImpl,{body:qaMessage});
  if(accepted?.success!==true)fail("github_ci_qa_source_enqueue_unconfirmed_no_retry");
  const queueSent=true;

  for(let attempt=0;attempt<maxReadbackAttempts;attempt+=1){
    releases=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,releaseSql,[releaseKey]);
    if(releases.length>1)fail("github_ci_qa_source_duplicate_release_receipts");
    if(releases.length===1){
      if(releases[0].state==="FAILED")fail("github_ci_qa_source_release_failed");
      if(releaseReceiptMatches(releases[0],expectedQaReceipt)){
        return Object.freeze({
          status:"INDEPENDENT_QA_EVIDENCE_ONLY",duplicate:false,queue_sent:queueSent,
          release_job_id:String(releases[0].job_id||""),work_id:receipt.work_id,
          patch_sha256:receipt.patch_sha256,qa_receipt_sha256:qaMessage.qa_receipt_sha256,
          model_cost_usd:0,automatic_merge:false,automatic_deploy:false,
        });
      }
      if(releases[0].state==="SUCCEEDED")fail("github_ci_qa_source_release_contract_mismatch");
    }
    if(attempt+1<maxReadbackAttempts)await sleepImpl(2000);
  }
  fail("github_ci_qa_source_d1_readback_timeout_no_resend");
}

export async function main(){
  const runnerTemp=process.env.RUNNER_TEMP;
  const receiptPath=process.env.HAE_QA_PATCH_RECEIPT_PATH;
  const repoRoot=process.env.HAE_QA_SOURCE_REPO;
  if(!runnerTemp||!receiptPath||!repoRoot)fail("github_ci_qa_source_env_invalid");
  let cfg,patchReceipt;
  try{cfg=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8"));}catch{fail("github_ci_qa_source_account_config_invalid");}
  try{patchReceipt=JSON.parse(fs.readFileSync(receiptPath,"utf8"));}catch{fail("github_ci_qa_patch_receipt_json_invalid");}
  const result=await dispatchGithubCIIndependentQa({
    runId:Number(process.env.HAE_CI_RUN_ID),
    runAttempt:Number(process.env.HAE_CI_RUN_ATTEMPT),
    expectedMainSha:process.env.HAE_CI_EXPECTED_MAIN_SHA,
    githubToken:process.env.GH_TOKEN,
    cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,
    accountId:cfg.account_id,
    repoRoot,patchReceipt,
  });
  const out=JSON.stringify(result,null,2)+"\n";
  fs.writeFileSync(path.join(runnerTemp,"hae-ci-independent-qa-receipt.json"),out,{mode:0o600});
  process.stdout.write(out);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{console.error(error?.code||"github_ci_qa_source_failed");process.exitCode=1;});
}
