import assert from "node:assert/strict";
import fs from "node:fs";
import {dispatchGithubCIEvent} from "./hae-github-ci-source.mjs";
import {githubCIWorkflowIdentityVerified} from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";
const repo="officeus-create/Hermes",runId=40249991001,runAttempt=1;
const account="a".repeat(32),queue="b".repeat(32),mainSha="d".repeat(40);
const r={id:runId,run_attempt:runAttempt,repository:{full_name:repo},head_repository:{full_name:repo},
  name:"Hermes Automation Engine Contract",path:".github/workflows/automation-engine-contract.yml",workflow_id:382680939,status:"completed",conclusion:"failure",
  html_url:"https://github.com/"+repo+"/actions/runs/"+runId};
const settings=(sourceSha=mainSha,mode="dry_run",publish="disabled")=>({success:true,result:{bindings:[
  {name:"HERMES_AUTOMATION_SOURCE_SHA",type:"plain_text",text:sourceSha},
  {name:"HERMES_AUTOMATION_MODE",type:"plain_text",text:mode},
  {name:"HERMES_AUTOMATION_PUBLISH",type:"plain_text",text:publish},
]}});
assert.equal(githubCIWorkflowIdentityVerified(r),true);
assert.equal(githubCIWorkflowIdentityVerified({name:"Website checks",path:".github/workflows/ci.yml",workflow_id:311612557}),true);
assert.equal(githubCIWorkflowIdentityVerified({name:"Website checks",path:".github/workflows/ci.yml",workflow_id:382680939}),false);
const calls=[];
const mock=async(url,request)=>{
  calls.push({url,request});
  if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
  if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>r};
  if(url.endsWith("/workers/scripts/hermes-automation-engine/settings"))return {ok:true,json:async()=>settings()};
  if(url.endsWith("/queues"))return {ok:true,json:async()=>({success:true,result:[{queue_name:"hermes-automation",queue_id:queue}]})};
  if(url.endsWith("/queues/"+queue+"/messages"))return {ok:true,json:async()=>({success:true})};
  throw Error("unanticipated_network");
};
const args={runId,runAttempt,accountId:account,expectedMainSha:mainSha,githubToken:"mock-gh",cloudflareToken:"mock-cf",fetchImpl:mock};
const got=await dispatchGithubCIEvent(args);
assert.equal(got.queue_receipt,"CLOUDFLARE_ACCEPTED_NOT_YET_D1_VERIFIED");
assert.equal(got.deployed_source_sha,mainSha);
assert.equal(got.automatic_repair_allowed,false);
assert.equal(got.model_cost_usd,0);
assert.equal(calls.filter(c=>c.url.includes("api.github.com")).length,3,"main is checked twice plus immutable run read");
assert.ok(calls.filter(c=>c.url.includes("api.github.com")).every(c=>c.request.headers.Authorization==="Bearer mock-gh"));
assert.ok(calls.filter(c=>c.url.includes("api.cloudflare.com")).every(c=>c.request.headers.Authorization==="Bearer mock-cf"));
assert.ok(!JSON.stringify(calls.filter(c=>c.url.includes("api.github.com"))).includes("mock-cf"),"Cloudflare credential must never reach GitHub");
assert.ok(!JSON.stringify(calls.filter(c=>c.url.includes("api.cloudflare.com"))).includes("mock-gh"),"GitHub token must never reach Cloudflare");
const queueWrites=calls.filter(c=>c.url.endsWith("/queues/"+queue+"/messages"));
assert.equal(queueWrites.length,1,"exactly one external Queue write");
assert.deepEqual(JSON.parse(queueWrites[0].request.body),{body:{type:"github.ci.audit",run_id:runId,run_attempt:1}});
assert.equal(calls.filter(c=>c.url.endsWith("/workers/scripts/hermes-automation-engine/settings")).length,1,"deployed Worker settings are read once before enqueue");
const fail=async(opts,code)=>assert.rejects(()=>dispatchGithubCIEvent({...args,...opts}),e=>e.code===code);
const callsBefore=calls.length;
await fail({runId:"40249991001"},"github_ci_source_preflight_invalid");
assert.equal(calls.length,callsBefore);

const staleCalls=[];
await fail({fetchImpl:async(url,request)=>{staleCalls.push({url,request});return {ok:true,json:async()=>({commit:{sha:"e".repeat(40)}})};}},"github_ci_source_main_moved");
assert.equal(staleCalls.length,1);
assert.ok(staleCalls[0].url.endsWith("/branches/main"));

for(const [name,badSettings] of [
  ["source_sha",settings("e".repeat(40))],
  ["mode",settings(mainSha,"live","disabled")],
  ["publish",settings(mainSha,"dry_run","enabled")],
]){
  const requests=[];
  await fail({fetchImpl:async(url,request)=>{
    requests.push({url,request});
    if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
    if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>r};
    if(url.endsWith("/workers/scripts/hermes-automation-engine/settings"))return {ok:true,json:async()=>badSettings};
    throw Error("must stop before Queue");
  }},"github_ci_worker_not_exact_dry_run_main");
  assert.equal(requests.some(c=>c.url.endsWith("/queues")),false,name);
  assert.equal(requests.some(c=>c.url.endsWith("/messages")),false,name);
}

for(const override of [{path:".github/workflows/impostor.yml"},{workflow_id:999999999},{path:null},{name:"Website checks"}]){
  const requests=[];
  await fail({fetchImpl:async(url,request)=>{
    requests.push({url,request});
    if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
    if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>({...r,...override})};
    throw Error("producer must reject before Cloudflare request");
  }},"github_ci_source_run_verification_failed");
  assert.equal(requests.length,2);
  assert.equal(requests.some(x=>x.url.includes("api.cloudflare.com")),false);
}

const ambiguousCalls=[];
await fail({fetchImpl:async(url,request)=>{
  ambiguousCalls.push({url,request});
  if(url.endsWith("/queues/"+queue+"/messages"))throw Error("unknown_outcome");
  return mock(url,request);
}},"github_ci_source_transport_ambiguous_no_retry");
assert.equal(ambiguousCalls.filter(c=>c.url.endsWith("/queues/"+queue+"/messages")).length,1);

const workflow=fs.readFileSync(new URL("../.github/workflows/hae-github-ci-sensor.yml",import.meta.url),"utf8");
assert.doesNotMatch(workflow,/HAE_CI_SENSOR_QUEUE_TOKEN|vars\.HAE_CI_SENSOR_ENABLED/);
assert.match(workflow,/secrets\.CLOUDFLARE_HAE_RELEASE_TOKEN/);
assert.match(workflow,/HAE_CI_EXPECTED_MAIN_SHA/);
assert.match(workflow,/persist-credentials: false/);
const src=fs.readFileSync(new URL("./hae-github-ci-source.mjs",import.meta.url),"utf8");
assert.doesNotMatch(src,/\/v1\/tick|publication\.write|\/sendMessage|wrangler@4 deploy/);
assert.match(src,/workers\/scripts\/hermes-automation-engine\/settings/);
assert.doesNotMatch(src,/hermes_automation_heartbeats/);
console.log("HAE #2067 CI source producer PASS: exact main+deployed Worker settings -> one minimized Queue post; fail-closed no retry");
