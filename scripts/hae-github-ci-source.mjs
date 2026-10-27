// GitHub Actions event producer for HAE #2067.
// Trusted default-branch workflow only. It verifies the failed GitHub run and the
// exact deployed HAE dry-run heartbeat before exactly one Queue POST.
// No untrusted PR code/logs, model call, deploy, D1 write, or blind resend.
import fs from "node:fs";
import { githubCIWorkflowIdentityVerified } from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";
import { validateT4Heartbeat } from "./hae-t4-dlq-canary.mjs";
import { pathToFileURL } from "node:url";

const REPO="officeus-create/Hermes",API="https://api.cloudflare.com/client/v4";
const UUID=/^[a-f0-9-]{32,36}$/,SHA=/^[a-f0-9]{40}$/;
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
export async function dispatchGithubCIEvent({
  runId,runAttempt,repo=REPO,githubToken,cloudflareToken,accountId,expectedMainSha,
  fetchImpl=fetch,now=()=>Date.now(),
}={}){
  if(repo!==REPO||!Number.isSafeInteger(runId)||runId<=0||
     !Number.isSafeInteger(runAttempt)||runAttempt<=0 ||
     !githubToken||!cloudflareToken||!UUID.test(accountId||"")||!SHA.test(expectedMainSha||""))
    fail("github_ci_source_preflight_invalid");

  const main=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(main?.commit?.sha!==expectedMainSha)fail("github_ci_source_main_moved");

  const run=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId,githubToken,fetchImpl);
  if(run?.id!==runId||run?.run_attempt!==runAttempt ||
    run?.repository?.full_name!==REPO || run?.head_repository?.full_name!==REPO ||
    !githubCIWorkflowIdentityVerified(run) || run?.status!=="completed"||
    !["failure","timed_out"].includes(run?.conclusion)||
    run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+runId)
    fail("github_ci_source_run_verification_failed");

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

  const heartbeatSql="SELECT trigger_type,source_sha,automation_mode,publication_config,publication_enabled,observed_at FROM hermes_automation_heartbeats ORDER BY observed_at DESC LIMIT 1";
  const heartbeat=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId+"/query",cloudflareToken,fetchImpl,{sql:heartbeatSql,params:[]});
  d1Rows(heartbeat);
  try{validateT4Heartbeat(heartbeat,expectedMainSha,now());}
  catch{fail("github_ci_worker_not_exact_dry_run_main");}

  // Recheck main immediately before the sole external Queue write.
  const mainAgain=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(mainAgain?.commit?.sha!==expectedMainSha)fail("github_ci_source_main_moved");

  const queues=await jsonFetch(API+"/accounts/"+accountId+"/queues",cloudflareToken,fetchImpl);
  if(queues?.success!==true||!Array.isArray(queues.result))fail("github_ci_cloudflare_queue_inventory_invalid");
  const matches=queues.result.filter(q=>q.queue_name==="hermes-automation"&&UUID.test(q.queue_id||""));
  if(matches.length!==1)fail("github_ci_canonical_queue_missing_or_ambiguous");
  const packet={body:{type:"github.ci.audit",run_id:runId,run_attempt:runAttempt}};
  const accepted=await jsonFetch(API+"/accounts/"+accountId+"/queues/"+matches[0].queue_id+"/messages",cloudflareToken,fetchImpl,packet);
  if(accepted?.success!==true)fail("github_ci_enqueue_unconfirmed_no_retry");
  return {source_ref:"github://"+REPO+"/actions/runs/"+runId,
    run_id:runId,run_attempt:runAttempt,deployed_source_sha:expectedMainSha,
    queue_receipt:"CLOUDFLARE_ACCEPTED_NOT_YET_D1_VERIFIED",
    model_cost_usd:0,automatic_repair_allowed:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const runId=Number(process.env.HAE_CI_RUN_ID),runAttempt=Number(process.env.HAE_CI_RUN_ATTEMPT);
  let accountId="";
  try{accountId=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8")).account_id;}
  catch{console.error("github_ci_account_config_unavailable");process.exit(1);}
  dispatchGithubCIEvent({runId,runAttempt,accountId,expectedMainSha:process.env.HAE_CI_EXPECTED_MAIN_SHA,
    githubToken:process.env.GH_TOKEN,cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN})
  .then(result=>console.log(JSON.stringify(result)))
  .catch(error=>{console.error(error.code||"github_ci_source_failed");process.exitCode=1;});
}
