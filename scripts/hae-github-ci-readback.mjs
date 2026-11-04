// Read-only reconciliation for an already submitted HAE GitHub CI source event.
// This module performs GitHub GETs plus D1 SELECT queries only. It NEVER sends to Queue,
// deploys a Worker, creates a job, retries provider writes, or performs model inference.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { githubCIWorkflowIdentityVerified } from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";

const REPO="officeus-create/Hermes",API="https://api.cloudflare.com/client/v4";
const UUID=/^[a-f0-9-]{32,36}$/,SHA=/^[a-f0-9]{40}$/;
function fail(code){const e=new Error(code);e.code=code;throw e;}

function parseCommand(value){
  const match=/^HAE_CI_READBACK ([a-f0-9]{40}) ([1-9][0-9]{0,17}) ([1-9][0-9]{0,4})$/.exec(String(value||"").trim());
  if(!match)fail("github_ci_readback_command_invalid");
  return {expectedMainSha:match[1],runId:Number(match[2]),runAttempt:Number(match[3])};
}
async function jsonFetch(url,token,fetchImpl,postBody){
  const opts={
    method:postBody===undefined?"GET":"POST",
    headers:{Authorization:"Bearer "+token,Accept:"application/json",...(postBody===undefined?{}:{"Content-Type":"application/json"})},
    ...(postBody===undefined?{}:{body:JSON.stringify(postBody)}),
    signal:AbortSignal.timeout(12000),
  };
  let response;
  try{response=await fetchImpl(url,opts);}catch{fail("github_ci_readback_transport_failed");}
  if(!response?.ok)fail("github_ci_readback_http_rejected");
  try{return await response.json();}catch{fail("github_ci_readback_json_invalid");}
}
function d1Rows(payload){
  if(payload?.success!==true||!Array.isArray(payload.result)||payload.result.length!==1||
     payload.result[0]?.success===false||!Array.isArray(payload.result[0]?.results))
    fail("github_ci_readback_d1_response_invalid");
  return payload.result[0].results;
}
function safeResult(value){
  if(value==null||value==="")return null;
  try{return JSON.parse(String(value));}catch{fail("github_ci_readback_result_json_invalid");}
}
async function canonicalD1(accountId,token,fetchImpl){
  const pages=await jsonFetch(API+"/accounts/"+accountId+"/pages/projects/hermes",token,fetchImpl);
  if(pages?.success!==true)fail("github_ci_readback_pages_invalid");
  const binding=pages.result?.deployment_configs?.production?.d1_databases?.DB;
  if(!UUID.test(binding?.id||""))fail("github_ci_readback_d1_id_missing");
  const dbId=binding.id;
  let name=binding.database_name||binding.name;
  if(!name){
    const detail=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId,token,fetchImpl);
    if(detail?.success!==true||!detail?.result)fail("github_ci_readback_d1_metadata_invalid");
    if(detail.result.uuid&&detail.result.uuid!==dbId)fail("github_ci_readback_d1_metadata_id_mismatch");
    name=detail.result.name||detail.result.database_name;
  }
  if(name!=="hermes-connect-prototype")fail("github_ci_readback_d1_name_mismatch");
  return dbId;
}
async function d1Query(accountId,dbId,token,fetchImpl,sql,params=[]){
  const payload=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId+"/query",token,fetchImpl,{sql,params});
  return d1Rows(payload);
}

export async function readbackGithubCIEvent({
  runId,runAttempt,expectedMainSha,githubToken,cloudflareToken,accountId,
  fetchImpl=fetch,repo=REPO,
}={}){
  if(repo!==REPO||!Number.isSafeInteger(runId)||runId<=0||!Number.isSafeInteger(runAttempt)||runAttempt<=0||
     !SHA.test(expectedMainSha||"")||!githubToken||!cloudflareToken||!UUID.test(accountId||""))
    fail("github_ci_readback_preflight_invalid");

  const main=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(main?.commit?.sha!==expectedMainSha)fail("github_ci_readback_main_moved");

  const run=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId,githubToken,fetchImpl);
  if(run?.id!==runId||run?.run_attempt!==runAttempt||run?.repository?.full_name!==REPO||
     run?.head_repository?.full_name!==REPO||!githubCIWorkflowIdentityVerified(run)||
     run?.status!=="completed"||!["failure","timed_out"].includes(run?.conclusion)||
     !SHA.test(run?.head_sha||"")||run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+runId)
    fail("github_ci_readback_source_run_invalid");

  const dbId=await canonicalD1(accountId,cloudflareToken,fetchImpl);
  const sourceKey="hae:ci:audit:github-ci:"+runId+":"+runAttempt+":"+run.head_sha;
  const audits=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,
    "SELECT job_id,state,result_json,last_error_class,created_at,updated_at FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 2",
    [sourceKey]);
  if(audits.length>1)fail("github_ci_readback_duplicate_audit_jobs");

  const events=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,
    "SELECT event_type,queue_name,message_type,job_id,attempt_count,error_class,created_at FROM hermes_automation_runtime_events WHERE message_type='github.ci.audit' ORDER BY created_at DESC LIMIT 20");
  const sourceRef="github://"+REPO+"/actions/runs/"+runId;
  if(audits.length===0){
    return Object.freeze({
      status:"NOT_MATERIALIZED",source_ref:sourceRef,run_id:runId,run_attempt:runAttempt,
      source_head_sha:run.head_sha,current_main_sha:expectedMainSha,
      audit_job_present:false,runtime_event_count:events.length,
      runtime_events:events.map(x=>({event_type:x.event_type||null,error_class:x.error_class||null,created_at:x.created_at||null})),
      queue_resend_allowed:false,queue_write_performed:false,d1_write_performed:false,
      provider_write_performed:false,model_cost_usd:0,read_only:true,
    });
  }

  const audit=audits[0];
  const parsed=safeResult(audit.result_json);
  const workId=parsed?.result?.next_work_id;
  let repair=null;
  if(typeof workId==="string"&&/^HAE-SELF:[A-Za-z0-9._:-]+$/.test(workId)){
    const repairs=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,
      "SELECT job_id,state,result_json,last_error_class,created_at,updated_at FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 2",
      ["hae:followup:self.repair:"+workId]);
    if(repairs.length>1)fail("github_ci_readback_duplicate_repair_jobs");
    repair=repairs[0]||null;
  }
  const repairResult=safeResult(repair?.result_json);
  const status=audit.state==="SUCCEEDED"&&repair?.state==="SUCCEEDED"&&
    repairResult?.result?.repair_state==="HOLD_REPAIR" ? "SELF_WORK_MATERIALIZED" :
    audit.state==="FAILED"||repair?.state==="FAILED" ? "FAILED" : "PARTIAL";

  return Object.freeze({
    status,source_ref:sourceRef,run_id:runId,run_attempt:runAttempt,
    source_head_sha:run.head_sha,current_main_sha:expectedMainSha,
    audit_job_present:true,audit_job_id:String(audit.job_id||""),audit_state:String(audit.state||"UNKNOWN"),
    audit_error_class:audit.last_error_class||null,work_id:typeof workId==="string"?workId:null,
    repair_job_present:Boolean(repair),repair_job_id:repair?String(repair.job_id||""):null,
    repair_state:repair?String(repair.state||"UNKNOWN"):null,repair_error_class:repair?.last_error_class||null,
    repair_contract_state:repairResult?.result?.repair_state||null,
    runtime_event_count:events.length,
    runtime_events:events.map(x=>({event_type:x.event_type||null,error_class:x.error_class||null,created_at:x.created_at||null})),
    queue_resend_allowed:false,queue_write_performed:false,d1_write_performed:false,
    provider_write_performed:false,model_cost_usd:0,read_only:true,
  });
}

export function main(){
  const command=parseCommand(process.env.HAE_CI_READBACK_COMMAND);
  let cfg;
  try{cfg=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8"));}
  catch{fail("github_ci_readback_account_config_invalid");}
  return readbackGithubCIEvent({
    ...command,githubToken:process.env.GH_TOKEN,
    cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,accountId:cfg.account_id,
  }).then(result=>{
    const json=JSON.stringify(result,null,2)+"\n";
    if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"hae-ci-readback.json"),json);
    process.stdout.write(json);
  });
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{console.error(error?.code||"github_ci_readback_failed");process.exitCode=1;});
}
