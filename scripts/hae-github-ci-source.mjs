// GitHub Actions event producer for HAE #2067.
// Trusted default-branch workflow only. It verifies the failed GitHub run,
// exact deployed HAE dry-run settings, submits at most one source Queue packet,
// then performs READ-ONLY D1 acceptance of the autonomous HAE-SELF work packet.
// No untrusted PR code/logs, model call, deploy, D1 write, or blind resend.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { githubCIWorkflowIdentityVerified } from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";
import { pathToFileURL } from "node:url";

const REPO="officeus-create/Hermes",API="https://api.cloudflare.com/client/v4";
const UUID=/^[a-f0-9-]{32,36}$/,SHA=/^[a-f0-9]{40}$/;
const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
function fail(code){const e=new Error(code);e.code=code;throw e;}

async function jsonFetch(url,token,fetchImpl,postBody){
  const opts={
    method:postBody===undefined?"GET":"POST",
    headers:{Authorization:"Bearer "+token,Accept:"application/json",...(postBody===undefined?{}:{"Content-Type":"application/json"})},
    ...(postBody===undefined?{}:{body:JSON.stringify(postBody)}),
    signal:AbortSignal.timeout(12000),
  };
  let resp;
  try{resp=await fetchImpl(url,opts);}catch{fail("github_ci_source_transport_ambiguous_no_retry");}
  if(!resp?.ok)fail("github_ci_source_http_rejected");
  try{return await resp.json();}catch{fail("github_ci_source_json_invalid");}
}
function d1Rows(payload){
  if(payload?.success!==true||!Array.isArray(payload.result)||payload.result.length!==1||
     payload.result[0]?.success===false||!Array.isArray(payload.result[0]?.results))
    fail("github_ci_d1_response_invalid");
  return payload.result[0].results;
}
function safeResultJson(value){
  if(value==null||value==="")return null;
  try{return JSON.parse(String(value));}catch{fail("github_ci_d1_result_json_invalid");}
}
async function canonicalD1(accountId,cloudflareToken,fetchImpl){
  const pages=await jsonFetch(API+"/accounts/"+accountId+"/pages/projects/hermes",cloudflareToken,fetchImpl);
  if(pages?.success!==true)fail("github_ci_pages_lookup_invalid");
  const binding=pages.result?.deployment_configs?.production?.d1_databases?.DB;
  if(!UUID.test(binding?.id||""))fail("github_ci_canonical_d1_id_missing");
  const dbId=binding.id;
  let dbName=binding.database_name||binding.name;
  if(!dbName){
    const detail=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId,cloudflareToken,fetchImpl);
    if(detail?.success!==true||!detail?.result)fail("github_ci_d1_metadata_invalid");
    if(detail.result.uuid&&detail.result.uuid!==dbId)fail("github_ci_d1_metadata_id_mismatch");
    dbName=detail.result.name||detail.result.database_name;
  }
  if(dbName!=="hermes-connect-prototype")fail("github_ci_canonical_d1_name_mismatch");
  return dbId;
}
async function d1Query(accountId,dbId,token,fetchImpl,sql,params=[]){
  const payload=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId+"/query",token,fetchImpl,{sql,params});
  return d1Rows(payload);
}

export async function dispatchGithubCIEvent({
  runId,runAttempt,repo=REPO,githubToken,cloudflareToken,accountId,expectedMainSha,
  fetchImpl=fetch,sleepImpl=wait,maxReadbackAttempts=30,
}={}){
  if(repo!==REPO||!Number.isSafeInteger(runId)||runId<=0||
     !Number.isSafeInteger(runAttempt)||runAttempt<=0 ||
     !githubToken||!cloudflareToken||!UUID.test(accountId||"")||!SHA.test(expectedMainSha||"")||
     !Number.isSafeInteger(maxReadbackAttempts)||maxReadbackAttempts<1||maxReadbackAttempts>60)
    fail("github_ci_source_preflight_invalid");

  const main=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(main?.commit?.sha!==expectedMainSha)fail("github_ci_source_main_moved");

  const run=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId,githubToken,fetchImpl);
  if(run?.id!==runId||run?.run_attempt!==runAttempt ||
    run?.repository?.full_name!==REPO || run?.head_repository?.full_name!==REPO ||
    !githubCIWorkflowIdentityVerified(run) || run?.status!=="completed"||
    !["failure","timed_out"].includes(run?.conclusion)||!SHA.test(run?.head_sha||"")||
    run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+runId ||
    typeof run?.event!=="string" || run.event.length<1 || run.event.length>80 ||
    !Number.isFinite(Date.parse(run?.updated_at||"")))
    fail("github_ci_source_run_verification_failed");

  // GitHub Actions owns the authenticated GitHub API read. The Worker receives only
  // this minimized immutable fingerprint through the private Cloudflare Queue.
  const commit=await jsonFetch("https://api.github.com/repos/"+REPO+"/commits/"+run.head_sha,githubToken,fetchImpl);
  if(commit?.sha!==run.head_sha||!Array.isArray(commit.files)||commit.files.length<1||commit.files.length>100)
    fail("github_ci_source_changed_paths_incomplete");
  const changedPaths=commit.files.map(item=>item?.filename);
  if(changedPaths.some(name=>typeof name!=="string"||!name||name.length>240||name.startsWith("/")||name.includes("..")||name.includes("\\")))
    fail("github_ci_source_changed_path_invalid");
  const sortedPaths=[...new Set(changedPaths)].sort();
  if(sortedPaths.length!==changedPaths.length)fail("github_ci_source_changed_path_duplicate");
  const changedFingerprint="sha256:"+createHash("sha256").update(sortedPaths.join("\n"),"utf8").digest("hex");
  const prs=Array.isArray(run.pull_requests)?run.pull_requests:[];
  const prNumber=prs.length===1&&Number.isSafeInteger(prs[0]?.number)&&prs[0].number>0?prs[0].number:null;
  const baseSha=prs.length===1&&SHA.test(prs[0]?.base?.sha||"")?prs[0].base.sha:null;
  const updatedAt=new Date(run.updated_at).toISOString();

  const settings=await jsonFetch(API+"/accounts/"+accountId+"/workers/scripts/hermes-automation-engine/settings",cloudflareToken,fetchImpl);
  if(settings?.success!==true||!Array.isArray(settings?.result?.bindings))fail("github_ci_worker_settings_invalid");
  const value=(name)=>{
    const binding=settings.result.bindings.find(item=>item?.name===name);
    return binding?.text ?? binding?.value ?? null;
  };
  if(value("HERMES_AUTOMATION_SOURCE_SHA")!==expectedMainSha ||
     value("HERMES_AUTOMATION_MODE")!=="dry_run" ||
     value("HERMES_AUTOMATION_PUBLISH")!=="disabled")
    fail("github_ci_worker_not_exact_dry_run_main");

  const dbId=await canonicalD1(accountId,cloudflareToken,fetchImpl);
  const idempotencyKey="hae:ci:audit:github-ci:"+runId+":"+runAttempt+":"+run.head_sha;
  const auditSql="SELECT job_id,state,result_json,last_error_class FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 2";
  let auditRows=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,auditSql,[idempotencyKey]);
  if(auditRows.length>1)fail("github_ci_d1_duplicate_audit_jobs");

  let queueSent=false;
  if(auditRows.length===0){
    // Recheck main immediately before the sole external Queue write.
    const mainAgain=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
    if(mainAgain?.commit?.sha!==expectedMainSha)fail("github_ci_source_main_moved");

    const queues=await jsonFetch(API+"/accounts/"+accountId+"/queues",cloudflareToken,fetchImpl);
    if(queues?.success!==true||!Array.isArray(queues.result))fail("github_ci_cloudflare_queue_inventory_invalid");
    const matches=queues.result.filter(q=>q.queue_name==="hermes-automation"&&UUID.test(q.queue_id||""));
    if(matches.length!==1)fail("github_ci_canonical_queue_missing_or_ambiguous");
    const packet={body:{
      type:"github.ci.audit",
      run_id:runId,
      run_attempt:runAttempt,
      producer_main_sha:expectedMainSha,
      repository:REPO,
      workflow_name:run.name,
      workflow_path:run.path,
      workflow_id:run.workflow_id,
      event:run.event,
      status:run.status,
      conclusion:run.conclusion,
      head_sha:run.head_sha,
      html_url:run.html_url,
      updated_at:updatedAt,
      changed_paths_fingerprint:changedFingerprint,
      changed_path_count:sortedPaths.length,
      base_sha:baseSha,
      pr_number:prNumber,
    }};
    const accepted=await jsonFetch(API+"/accounts/"+accountId+"/queues/"+matches[0].queue_id+"/messages",cloudflareToken,fetchImpl,packet);
    if(accepted?.success!==true)fail("github_ci_enqueue_unconfirmed_no_retry");
    queueSent=true;
  }

  for(let attempt=0;attempt<maxReadbackAttempts;attempt+=1){
    auditRows=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,auditSql,[idempotencyKey]);
    if(auditRows.length>1)fail("github_ci_d1_duplicate_audit_jobs");
    const audit=auditRows[0]||null;
    if(audit?.state==="FAILED")fail("github_ci_d1_audit_failed");
    if(audit?.state==="SUCCEEDED"){
      const auditResult=safeResultJson(audit.result_json);
      const workId=auditResult?.result?.next_work_id;
      if(typeof workId!=="string"||!/^HAE-SELF:[A-Za-z0-9._:-]+$/.test(workId))
        fail("github_ci_d1_self_work_missing");
      const repairIdempotency="hae:followup:self.repair:"+workId;
      const repairSql="SELECT job_id,state,result_json,last_error_class FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 2";
      const repairs=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,repairSql,[repairIdempotency]);
      if(repairs.length>1)fail("github_ci_d1_duplicate_repair_jobs");
      const repair=repairs[0]||null;
      if(repair?.state==="FAILED")fail("github_ci_d1_repair_packet_failed");
      if(repair?.state==="SUCCEEDED"){
        const repairResult=safeResultJson(repair.result_json);
        if(repairResult?.result?.repair_state!=="HOLD_REPAIR" ||
           repairResult?.result?.source_change_performed!==false ||
           repairResult?.result?.automatic_merge_performed!==false ||
           repairResult?.result?.automatic_deploy_performed!==false)
          fail("github_ci_d1_repair_packet_contract_mismatch");
        return {
          source_ref:"github://"+REPO+"/actions/runs/"+runId,
          run_id:runId,run_attempt:runAttempt,deployed_source_sha:expectedMainSha,
          queue_sent:queueSent,
          audit_job_id:String(audit.job_id||""),
          audit_state:"SUCCEEDED",
          work_id:workId,
          repair_job_id:String(repair.job_id||""),
          repair_state:"HOLD_REPAIR",
          source_change_performed:false,
          automatic_merge_performed:false,
          automatic_deploy_performed:false,
          model_cost_usd:0,
          live_self_work_receipt:true,
        };
      }
    }
    if(attempt+1<maxReadbackAttempts)await sleepImpl(2000);
  }
  fail("github_ci_d1_self_work_readback_timeout_no_resend");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const runId=Number(process.env.HAE_CI_RUN_ID),runAttempt=Number(process.env.HAE_CI_RUN_ATTEMPT);
  let accountId="";
  try{accountId=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8")).account_id;}
  catch{console.error("github_ci_account_config_unavailable");process.exit(1);}
  dispatchGithubCIEvent({runId,runAttempt,accountId,expectedMainSha:process.env.HAE_CI_EXPECTED_MAIN_SHA,
    githubToken:process.env.GH_TOKEN,cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN})
  .then(result=>{
    const out=JSON.stringify(result,null,2);
    if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"hae-ci-self-work-receipt.json"),out+"\n");
    console.log(out);
  })
  .catch(error=>{console.error(error.code||"github_ci_source_failed");process.exitCode=1;});
}
