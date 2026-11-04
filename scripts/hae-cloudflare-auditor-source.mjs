import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO="officeus-create/Hermes";
const API="https://api.cloudflare.com/client/v4";
const SHA=/^[a-f0-9]{40}$/;
const UUID=/^[a-f0-9-]{32,36}$/;
const RUN_RESULTS=new Set(["success","failure","cancelled","skipped"]);

function fail(code){const error=new Error(code);error.code=code;throw error;}
async function jsonFetch(url,token,fetchImpl=fetch,body=null){
  const response=await fetchImpl(url,{
    method:body===null?"GET":"POST",
    headers:{
      accept:"application/json",
      ...(token?{authorization:"Bearer "+token}:{}),
      ...(body===null?{}:{"content-type":"application/json"}),
      ...(url.startsWith("https://api.github.com/")?{"user-agent":"HermesAutomationEngine/1.0 cloudflare-auditor"}:{}),
    },
    ...(body===null?{}:{body:JSON.stringify(body)}),
  });
  if(!response.ok)fail("cloudflare_auditor_source_http_"+response.status);
  return response.json();
}

function text(value,max=120){
  if(typeof value!=="string")return null;
  const clean=value.trim();
  return clean?clean.slice(0,max):null;
}

export async function dispatchCloudflareAuditorSnapshot({
  runId,runAttempt,runResult,githubToken,cloudflareToken,accountId,expectedMainSha,fetchImpl=fetch,
}={}){
  if(!Number.isSafeInteger(runId)||runId<=0||
     !Number.isSafeInteger(runAttempt)||runAttempt<=0||
     !RUN_RESULTS.has(runResult)||
     !githubToken||!cloudflareToken||!UUID.test(accountId||"")||!SHA.test(expectedMainSha||""))
    fail("cloudflare_auditor_source_preflight_invalid");

  const main=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(main?.commit?.sha!==expectedMainSha)fail("cloudflare_auditor_source_main_moved");

  const run=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId,githubToken,fetchImpl);
  if(run?.id!==runId||
     run?.run_attempt!==runAttempt||
     run?.repository?.full_name!==REPO||
     run?.head_repository?.full_name!==REPO||
     run?.name!=="Cloudflare five-surface synthetic"||
     run?.path!==".github/workflows/cloudflare-five-surface-synthetic.yml"||
     run?.head_branch!=="main"||
     run?.head_sha!==expectedMainSha||
     !["schedule","workflow_dispatch"].includes(run?.event))
    fail("cloudflare_auditor_source_workflow_identity_invalid");

  const workerSettings=await jsonFetch(API+"/accounts/"+accountId+"/workers/scripts/hermes-automation-engine/settings",cloudflareToken,fetchImpl);
  if(workerSettings?.success!==true||!Array.isArray(workerSettings?.result?.bindings))
    fail("cloudflare_auditor_worker_settings_invalid");
  const bindingValue=(name)=>{
    const binding=workerSettings.result.bindings.find((item)=>item?.name===name);
    return binding?.text??binding?.value??null;
  };
  if(bindingValue("HERMES_AUTOMATION_SOURCE_SHA")!==expectedMainSha||
     bindingValue("HERMES_AUTOMATION_MODE")!=="dry_run"||
     bindingValue("HERMES_AUTOMATION_PUBLISH")!=="disabled")
    fail("cloudflare_auditor_worker_not_exact_dry_run_main");

  const project=await jsonFetch(API+"/accounts/"+accountId+"/pages/projects/hermes",cloudflareToken,fetchImpl);
  if(project?.success!==true||!project?.result||project.result.name!=="hermes")
    fail("cloudflare_auditor_pages_project_invalid");

  const deployments=await jsonFetch(API+"/accounts/"+accountId+"/pages/projects/hermes/deployments?env=production&page=1&per_page=1",cloudflareToken,fetchImpl);
  if(deployments?.success!==true||!Array.isArray(deployments.result)||deployments.result.length<1)
    fail("cloudflare_auditor_production_deployment_missing");
  const deployment=deployments.result[0];

  const queues=await jsonFetch(API+"/accounts/"+accountId+"/queues",cloudflareToken,fetchImpl);
  if(queues?.success!==true||!Array.isArray(queues.result))fail("cloudflare_auditor_queue_inventory_invalid");
  const queueMatches=queues.result.filter((item)=>item?.queue_name==="hermes-automation"&&UUID.test(item?.queue_id||""));
  if(queueMatches.length!==1)fail("cloudflare_auditor_canonical_queue_missing_or_ambiguous");

  const sourceConfig=project.result?.source?.config||{};
  const metadata=deployment?.deployment_trigger?.metadata||{};
  const packet={body:{
    type:"cloudflare.audit.snapshot",
    producer_main_sha:expectedMainSha,
    workflow_run_id:runId,
    workflow_run_attempt:runAttempt,
    workflow_result:runResult,
    observed_at:new Date().toISOString(),
    pages_project:"hermes",
    source_type:text(project.result?.source?.type),
    source_owner:text(sourceConfig.owner),
    source_repository:text(sourceConfig.repo_name),
    production_branch:text(sourceConfig.production_branch||project.result?.production_branch),
    production_deployment_sha:SHA.test(metadata.commit_hash||"")?metadata.commit_hash:null,
    production_environment:text(deployment?.environment),
    production_stage_status:text(deployment?.latest_stage?.status),
    source_ref:"github://"+REPO+"/actions/runs/"+runId,
  }};

  const accepted=await jsonFetch(API+"/accounts/"+accountId+"/queues/"+queueMatches[0].queue_id+"/messages",cloudflareToken,fetchImpl,packet);
  if(accepted?.success!==true)fail("cloudflare_auditor_enqueue_unconfirmed_no_retry");

  return {
    source_ref:packet.body.source_ref,
    workflow_result:runResult,
    pages_project:"hermes",
    production_branch:packet.body.production_branch,
    production_deployment_sha:packet.body.production_deployment_sha,
    production_environment:packet.body.production_environment,
    production_stage_status:packet.body.production_stage_status,
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
  const runId=Number(process.env.HAE_CLOUDFLARE_RUN_ID);
  const runAttempt=Number(process.env.HAE_CLOUDFLARE_RUN_ATTEMPT);
  let accountId="";
  try{accountId=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8")).account_id;}
  catch{console.error("cloudflare_auditor_account_config_unavailable");process.exit(1);}
  dispatchCloudflareAuditorSnapshot({
    runId,
    runAttempt,
    runResult:process.env.HAE_CLOUDFLARE_SYNTHETIC_RESULT,
    githubToken:process.env.GH_TOKEN,
    cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,
    accountId,
    expectedMainSha:process.env.HAE_CLOUDFLARE_EXPECTED_MAIN_SHA,
  }).then((result)=>{
    const output=JSON.stringify(result,null,2);
    if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"hae-cloudflare-auditor-receipt.json"),output+"\n");
    console.log(output);
  }).catch((error)=>{console.error(error.code||"cloudflare_auditor_source_failed");process.exitCode=1;});
}
