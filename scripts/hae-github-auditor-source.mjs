import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { githubCIWorkflowIdentityVerified } from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";

const REPO="officeus-create/Hermes";
const API="https://api.cloudflare.com/client/v4";
const SHA=/^[a-f0-9]{40}$/;
const UUID=/^[a-f0-9-]{32,36}$/;
const CONCLUSIONS=new Set(["success","failure","timed_out","cancelled","skipped","neutral","action_required"]);

function fail(code){const error=new Error(code);error.code=code;throw error;}
async function jsonFetch(url,token,fetchImpl=fetch,body=null){
  const response=await fetchImpl(url,{
    method:body===null?"GET":"POST",
    headers:{
      "accept":"application/json",
      ...(token?{"authorization":"Bearer "+token}:{}),
      ...(body===null?{}:{"content-type":"application/json"}),
      ...(url.startsWith("https://api.github.com/")?{"user-agent":"HermesAutomationEngine/1.0 github-auditor"}:{}),
    },
    ...(body===null?{}:{body:JSON.stringify(body)}),
  });
  if(!response.ok)fail("github_auditor_source_http_"+response.status);
  return response.json();
}

export async function dispatchGithubAuditorHealth({
  runId,runAttempt,repo=REPO,githubToken,cloudflareToken,accountId,expectedMainSha,fetchImpl=fetch,
}={}){
  if(repo!==REPO||!Number.isSafeInteger(runId)||runId<=0||
     !Number.isSafeInteger(runAttempt)||runAttempt<=0||
     !githubToken||!cloudflareToken||!UUID.test(accountId||"")||!SHA.test(expectedMainSha||""))
    fail("github_auditor_source_preflight_invalid");

  const main=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(main?.commit?.sha!==expectedMainSha)fail("github_auditor_source_main_moved");

  const run=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId,githubToken,fetchImpl);
  if(run?.id!==runId||run?.run_attempt!==runAttempt||
     run?.repository?.full_name!==REPO||run?.head_repository?.full_name!==REPO||
     !githubCIWorkflowIdentityVerified(run)||run?.status!=="completed"||
     !CONCLUSIONS.has(run?.conclusion)||!SHA.test(run?.head_sha||"")||
     run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+runId||
     !Number.isFinite(Date.parse(run?.updated_at||"")))
    fail("github_auditor_source_run_verification_failed");

  const settings=await jsonFetch(API+"/accounts/"+accountId+"/workers/scripts/hermes-automation-engine/settings",cloudflareToken,fetchImpl);
  if(settings?.success!==true||!Array.isArray(settings?.result?.bindings))fail("github_auditor_worker_settings_invalid");
  const value=(name)=>{
    const binding=settings.result.bindings.find((item)=>item?.name===name);
    return binding?.text??binding?.value??null;
  };
  if(value("HERMES_AUTOMATION_SOURCE_SHA")!==expectedMainSha||
     value("HERMES_AUTOMATION_MODE")!=="dry_run"||
     value("HERMES_AUTOMATION_PUBLISH")!=="disabled")
    fail("github_auditor_worker_not_exact_dry_run_main");

  const queues=await jsonFetch(API+"/accounts/"+accountId+"/queues",cloudflareToken,fetchImpl);
  if(queues?.success!==true||!Array.isArray(queues.result))fail("github_auditor_queue_inventory_invalid");
  const matches=queues.result.filter((q)=>q.queue_name==="hermes-automation"&&UUID.test(q.queue_id||""));
  if(matches.length!==1)fail("github_auditor_canonical_queue_missing_or_ambiguous");

  const packet={body:{
    type:"github.audit.snapshot",
    producer_main_sha:expectedMainSha,
    repository:REPO,
    workflow_name:run.name,
    workflow_path:run.path,
    workflow_id:run.workflow_id,
    run_id:runId,
    run_attempt:runAttempt,
    status:run.status,
    conclusion:run.conclusion,
    head_sha:run.head_sha,
    html_url:run.html_url,
    updated_at:new Date(run.updated_at).toISOString(),
  }};
  const accepted=await jsonFetch(API+"/accounts/"+accountId+"/queues/"+matches[0].queue_id+"/messages",cloudflareToken,fetchImpl,packet);
  if(accepted?.success!==true)fail("github_auditor_enqueue_unconfirmed_no_retry");

  return {
    source_ref:"github://"+REPO+"/actions/runs/"+runId,
    workflow_name:run.name,
    conclusion:run.conclusion,
    queue_sent:true,
    deployed_source_sha:expectedMainSha,
    coverage_complete:false,
    source_authenticated:true,
    external_writes:1,
    external_write_kind:"private_hae_queue_only",
    model_cost_usd:0,
  };
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const runId=Number(process.env.HAE_CI_RUN_ID);
  const runAttempt=Number(process.env.HAE_CI_RUN_ATTEMPT);
  let accountId="";
  try{accountId=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8")).account_id;}
  catch{console.error("github_auditor_account_config_unavailable");process.exit(1);}
  dispatchGithubAuditorHealth({
    runId,runAttempt,accountId,
    expectedMainSha:process.env.HAE_CI_EXPECTED_MAIN_SHA,
    githubToken:process.env.GH_TOKEN,
    cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,
  }).then((result)=>{
    const output=JSON.stringify(result,null,2);
    if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"hae-github-auditor-receipt.json"),output+"\n");
    console.log(output);
  }).catch((error)=>{console.error(error.code||"github_auditor_source_failed");process.exitCode=1;});
}
