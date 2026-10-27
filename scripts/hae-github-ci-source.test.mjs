import assert from "node:assert/strict";
import fs from "node:fs";
import {dispatchGithubCIEvent} from "./hae-github-ci-source.mjs";
import {githubCIWorkflowIdentityVerified} from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";

const repo="officeus-create/Hermes",runId=40249991001,runAttempt=1;
const account="a".repeat(32),queue="b".repeat(32),db="c".repeat(32),mainSha="d".repeat(40),headSha="e".repeat(40);
const workId="HAE-SELF:ci-"+runId+"-"+runAttempt+"-"+headSha.slice(0,12);
const auditJobId="job:audit:1",repairJobId="job:repair:1";
const r={id:runId,run_attempt:runAttempt,repository:{full_name:repo},head_repository:{full_name:repo},
  name:"Hermes Automation Engine Contract",path:".github/workflows/automation-engine-contract.yml",workflow_id:382680939,status:"completed",conclusion:"failure",
  head_sha:headSha,html_url:"https://github.com/"+repo+"/actions/runs/"+runId,event:"pull_request",
  updated_at:"2026-10-27T03:00:00Z",pull_requests:[{number:2088,base:{sha:"f".repeat(40)}}]};
const patchablePath="scripts/hae-github-ci-runtime-intake.test.mjs";
const commit={sha:headSha,files:[{filename:patchablePath}]};
const settings=(sourceSha=mainSha,mode="dry_run",publish="disabled")=>({success:true,result:{bindings:[
  {name:"HERMES_AUTOMATION_SOURCE_SHA",type:"plain_text",text:sourceSha},
  {name:"HERMES_AUTOMATION_MODE",type:"plain_text",text:mode},
  {name:"HERMES_AUTOMATION_PUBLISH",type:"plain_text",text:publish},
]}});
const d1=(rows)=>({success:true,result:[{success:true,results:rows}]});
const auditRow={job_id:auditJobId,state:"SUCCEEDED",last_error_class:null,result_json:JSON.stringify({result:{next_work_id:workId}})};
const repairRow={job_id:repairJobId,state:"SUCCEEDED",last_error_class:null,result_json:JSON.stringify({result:{
  repair_state:"HOLD_REPAIR",source_change_performed:false,automatic_merge_performed:false,automatic_deploy_performed:false
}})};
assert.equal(githubCIWorkflowIdentityVerified(r),true);

function fixture({preexisting=false,settingsPayload=settings(),queueThrows=false,commitPayload=commit,auditPayload=auditRow,repairPayload=repairRow}={}){
  const calls=[]; let sent=false;
  const mock=async(url,request)=>{
    calls.push({url,request});
    if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
    if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>r};
    if(url.endsWith("/commits/"+headSha))return {ok:true,json:async()=>commitPayload};
    if(url.endsWith("/workers/scripts/hermes-automation-engine/settings"))return {ok:true,json:async()=>settingsPayload};
    if(url.endsWith("/pages/projects/hermes"))return {ok:true,json:async()=>({success:true,result:{deployment_configs:{production:{d1_databases:{DB:{id:db,database_name:"hermes-connect-prototype"}}}}}})};
    if(url.endsWith("/d1/database/"+db+"/query")){
      const q=JSON.parse(request.body);
      const key=q.params?.[0]||"";
      if(String(key).startsWith("hae:ci:audit:")){
        return {ok:true,json:async()=>d1((preexisting||sent)?[auditPayload]:[])};
      }
      if(String(key).startsWith("hae:followup:self.repair:")){
        return {ok:true,json:async()=>d1((preexisting||sent)?[repairPayload]:[])};
      }
      throw Error("unexpected_d1_key");
    }
    if(url.endsWith("/queues"))return {ok:true,json:async()=>({success:true,result:[{queue_name:"hermes-automation",queue_id:queue}]})};
    if(url.endsWith("/queues/"+queue+"/messages")){
      if(queueThrows)throw Error("unknown_outcome");
      sent=true; return {ok:true,json:async()=>({success:true})};
    }
    throw Error("unanticipated_network:"+url);
  };
  return {calls,mock};
}
const args={runId,runAttempt,accountId:account,expectedMainSha:mainSha,githubToken:"mock-gh",cloudflareToken:"mock-cf",sleepImpl:async()=>{},maxReadbackAttempts:2};

const fresh=fixture();
const got=await dispatchGithubCIEvent({...args,fetchImpl:fresh.mock});
assert.equal(got.live_self_work_receipt,true);
assert.equal(got.queue_sent,true);
assert.equal(got.audit_job_id,auditJobId);
assert.equal(got.work_id,workId);
assert.equal(got.repair_job_id,repairJobId);
assert.equal(got.repair_state,"HOLD_REPAIR");
assert.equal(got.source_change_performed,false);
assert.equal(got.automatic_merge_performed,false);
assert.equal(got.automatic_deploy_performed,false);
assert.equal(got.model_cost_usd,0);
assert.equal(fresh.calls.filter(c=>c.url.endsWith("/queues/"+queue+"/messages")).length,1);
const sentBody=JSON.parse(fresh.calls.find(c=>c.url.endsWith("/queues/"+queue+"/messages")).request.body).body;
assert.equal(sentBody.type,"github.ci.audit");
assert.equal(sentBody.run_id,runId);
assert.equal(sentBody.run_attempt,runAttempt);
assert.equal(sentBody.producer_main_sha,mainSha);
assert.equal(sentBody.repository,repo);
assert.equal(sentBody.workflow_name,r.name);
assert.equal(sentBody.workflow_path,r.path);
assert.equal(sentBody.workflow_id,r.workflow_id);
assert.equal(sentBody.head_sha,headSha);
assert.equal(sentBody.changed_path_count,1);
assert.equal(sentBody.repair_artifact_key,patchablePath);
assert.match(sentBody.changed_paths_fingerprint,/^sha256:[a-f0-9]{64}$/);
assert.equal(sentBody.pr_number,2088);
assert.equal(sentBody.base_sha,"f".repeat(40));
assert.equal(Object.hasOwn(sentBody,"changed_paths"),false,"full changed-path list must not enter Queue");
assert.equal(JSON.stringify(sentBody).includes("assert.equal("),false,"source contents must not enter Queue");
assert.ok(fresh.calls.filter(c=>c.url.includes("api.github.com")).every(c=>c.request.headers.Authorization==="Bearer mock-gh"));
assert.ok(fresh.calls.filter(c=>c.url.includes("api.cloudflare.com")).every(c=>c.request.headers.Authorization==="Bearer mock-cf"));
assert.ok(!JSON.stringify(fresh.calls.filter(c=>c.url.includes("api.github.com"))).includes("mock-cf"));
assert.ok(!JSON.stringify(fresh.calls.filter(c=>c.url.includes("api.cloudflare.com"))).includes("mock-gh"));



// Authenticated multi-file failures remain durable audit evidence but must not pretend to be patchable.
const blockedCommit={sha:headSha,files:[
  {filename:"scripts/hae-github-ci-runtime-intake.test.mjs"},
  {filename:"workers/automation-engine/src/index.mjs"},
]};
const blockedAuditRow={job_id:"job:audit:blocked",state:"SUCCEEDED",last_error_class:null,result_json:JSON.stringify({result:{
  next_action:"NO_ACTION",routing_blocked_reason:"FINDING_BLOCKED"
}})};
const blockedFixture=fixture({commitPayload:blockedCommit,auditPayload:blockedAuditRow});
const blockedGot=await dispatchGithubCIEvent({...args,fetchImpl:blockedFixture.mock});
assert.equal(blockedGot.live_audit_receipt,true);
assert.equal(blockedGot.live_self_work_receipt,false);
assert.equal(blockedGot.repair_state,"BLOCKED_UNPATCHABLE");
assert.equal(blockedGot.work_id,null);
assert.equal(blockedGot.repair_job_id,null);
assert.equal(blockedFixture.calls.filter(c=>c.url.endsWith("/queues/"+queue+"/messages")).length,1);
assert.equal(blockedFixture.calls.filter(c=>String(JSON.parse(c.request?.body||"{}").params?.[0]||"").startsWith("hae:followup:self.repair:")).length,0);

// If the same source was already materialized, read back the durable work and do not resend Queue.
const replay=fixture({preexisting:true});
const replayGot=await dispatchGithubCIEvent({...args,fetchImpl:replay.mock});
assert.equal(replayGot.live_self_work_receipt,true);
assert.equal(replayGot.queue_sent,false);
assert.equal(replay.calls.filter(c=>c.url.endsWith("/messages")).length,0);
assert.equal(replay.calls.filter(c=>c.url.endsWith("/queues")).length,0);

const fail=async(opts,code)=>assert.rejects(()=>dispatchGithubCIEvent({...args,...opts}),e=>e.code===code);
await fail({runId:"40249991001"},"github_ci_source_preflight_invalid");

// Stale main must stop before Cloudflare.
const stale=[];
await fail({fetchImpl:async(url,request)=>{stale.push({url,request});return {ok:true,json:async()=>({commit:{sha:"f".repeat(40)}})};}},"github_ci_source_main_moved");
assert.equal(stale.length,1);

// Stale deployed source/mode/publication must stop before D1/Queue.
for(const bad of [settings("f".repeat(40)),settings(mainSha,"live"),settings(mainSha,"dry_run","enabled")]){
  const f=fixture({settingsPayload:bad});
  await fail({fetchImpl:f.mock},"github_ci_worker_not_exact_dry_run_main");
  assert.equal(f.calls.some(c=>c.url.endsWith("/queues")),false);
  assert.equal(f.calls.some(c=>c.url.includes("/d1/database/")),false);
}

// Spoofed workflow identity fails before Cloudflare.
for(const override of [{path:".github/workflows/impostor.yml"},{workflow_id:999999999},{path:null},{name:"Website checks"}]){
  const calls=[];
  await fail({fetchImpl:async(url,request)=>{
    calls.push({url,request});
    if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
    if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>({...r,...override})};
    throw Error("must stop before Cloudflare");
  }},"github_ci_source_run_verification_failed");
  assert.equal(calls.some(c=>c.url.includes("api.cloudflare.com")),false);
}

// Changed-path proof is authenticated in GitHub Actions and fails before Cloudflare on incomplete/unsafe commit metadata.
for(const badCommit of [
  {sha:headSha,files:[]},
  {sha:headSha,files:[{filename:"../escape"}]},
  {sha:headSha,files:[{filename:"same"},{filename:"same"}]},
]){
  const calls=[];
  await fail({fetchImpl:async(url,request)=>{
    calls.push({url,request});
    if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
    if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>r};
    if(url.endsWith("/commits/"+headSha))return {ok:true,json:async()=>badCommit};
    throw Error("must stop before Cloudflare");
  }},badCommit.files.length===0?"github_ci_source_changed_paths_incomplete":
     badCommit.files.some(x=>x.filename.includes(".."))?"github_ci_source_changed_path_invalid":"github_ci_source_changed_path_duplicate");
  assert.equal(calls.some(c=>c.url.includes("api.cloudflare.com")),false);
}

// Unknown outcome of the only Queue POST is fail-closed; the job is single-attempt in workflow.
const ambiguous=fixture({queueThrows:true});
await fail({fetchImpl:ambiguous.mock},"github_ci_source_transport_ambiguous_no_retry");
assert.equal(ambiguous.calls.filter(c=>c.url.endsWith("/queues/"+queue+"/messages")).length,1);

// Accepted Queue but missing D1 work times out read-only and never submits a second packet.
const noReadback=fixture();
let sendCount=0;
const noMaterialize=async(url,request)=>{
  if(url.endsWith("/queues/"+queue+"/messages")){sendCount+=1;return {ok:true,json:async()=>({success:true})};}
  if(url.endsWith("/d1/database/"+db+"/query"))return {ok:true,json:async()=>d1([])};
  return noReadback.mock(url,request);
};
await fail({fetchImpl:noMaterialize,maxReadbackAttempts:2,sleepImpl:async()=>{}},"github_ci_d1_self_work_readback_timeout_no_resend");
assert.equal(sendCount,1);

const workflow=fs.readFileSync(new URL("../.github/workflows/hae-github-ci-sensor.yml",import.meta.url),"utf8");
assert.match(workflow,/github\.run_attempt == 1/);
assert.doesNotMatch(workflow,/HAE_CI_SENSOR_QUEUE_TOKEN|vars\.HAE_CI_SENSOR_ENABLED/);
assert.match(workflow,/secrets\.CLOUDFLARE_HAE_RELEASE_TOKEN/);
assert.match(workflow,/HAE_CI_EXPECTED_MAIN_SHA/);
assert.match(workflow,/hae-ci-self-work-receipt/);
assert.match(workflow,/persist-credentials: false/);
const src=fs.readFileSync(new URL("./hae-github-ci-source.mjs",import.meta.url),"utf8");
assert.doesNotMatch(src,/\/v1\/tick|publication\.write|\/sendMessage|wrangler@4 deploy/);
assert.match(src,/workers\/scripts\/hermes-automation-engine\/settings/);
assert.match(src,/hae:followup:self\.repair:/);
console.log("HAE #2067 CI source producer PASS: exact deploy -> one Queue packet -> read-only D1 HAE-SELF/HOLD_REPAIR receipt; no blind resend");
