import assert from "node:assert/strict";
import fs from "node:fs";
import {dispatchGithubCIEvent} from "./hae-github-ci-source.mjs";
import {githubCIWorkflowIdentityVerified} from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";
const repo="officeus-create/Hermes",runId=40249991001,runAttempt=1;
const account="a".repeat(32),queue="b".repeat(32),db="c".repeat(32),mainSha="d".repeat(40);
const nowMs=Date.parse("2026-10-27T01:30:00Z");
const r={id:runId,run_attempt:runAttempt,repository:{full_name:repo},head_repository:{full_name:repo},
  name:"Hermes Automation Engine Contract",path:".github/workflows/automation-engine-contract.yml",workflow_id:382680939,status:"completed",conclusion:"failure",
  html_url:"https://github.com/"+repo+"/actions/runs/"+runId};
const heartbeat={success:true,result:[{success:true,results:[{
  trigger_type:"cron",source_sha:mainSha,automation_mode:"dry_run",publication_config:"disabled",publication_enabled:0,
  observed_at:"2026-10-27T01:29:30Z"
}]}]};
assert.equal(githubCIWorkflowIdentityVerified(r),true);
assert.equal(githubCIWorkflowIdentityVerified({name:"Website checks",path:".github/workflows/ci.yml",workflow_id:311612557}),true);
assert.equal(githubCIWorkflowIdentityVerified({name:"Website checks",path:".github/workflows/ci.yml",workflow_id:382680939}),false);
const calls=[];
const mock=async(url,request)=>{
  calls.push({url,request});
  if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
  if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>r};
  if(url.endsWith("/pages/projects/hermes"))return {ok:true,json:async()=>({success:true,result:{deployment_configs:{production:{d1_databases:{DB:{id:db,database_name:"hermes-connect-prototype"}}}}}})};
  if(url.endsWith("/d1/database/"+db+"/query"))return {ok:true,json:async()=>heartbeat};
  if(url.endsWith("/queues"))return {ok:true,json:async()=>({success:true,result:[{queue_name:"hermes-automation",queue_id:queue}]})};
  if(url.endsWith("/queues/"+queue+"/messages"))return {ok:true,json:async()=>({success:true})};
  throw Error("unanticipated_network");
};
const args={runId,runAttempt,accountId:account,expectedMainSha:mainSha,githubToken:"mock-gh",cloudflareToken:"mock-cf",fetchImpl:mock,now:()=>nowMs};
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
const d1Queries=calls.filter(c=>c.url.endsWith("/d1/database/"+db+"/query"));
assert.equal(d1Queries.length,1,"D1 is read once only for exact deployed heartbeat");
assert.match(JSON.parse(d1Queries[0].request.body).sql,/hermes_automation_heartbeats/);
const fail=async(opts,code)=>assert.rejects(()=>dispatchGithubCIEvent({...args,...opts}),e=>e.code===code);
const callsBefore=calls.length;
await fail({runId:"40249991001"},"github_ci_source_preflight_invalid");
assert.equal(calls.length,callsBefore);

// Main mismatch must stop before any Cloudflare access.
const staleCalls=[];
await fail({fetchImpl:async(url,request)=>{staleCalls.push({url,request});return {ok:true,json:async()=>({commit:{sha:"e".repeat(40)}})};}},"github_ci_source_main_moved");
assert.equal(staleCalls.length,1);
assert.ok(staleCalls[0].url.endsWith("/branches/main"));

// A valid GitHub run with stale/wrong deployed Worker SHA must stop before Queue inventory/write.
const heartbeatMismatchCalls=[];
await fail({fetchImpl:async(url,request)=>{
  heartbeatMismatchCalls.push({url,request});
  if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
  if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>r};
  if(url.endsWith("/pages/projects/hermes"))return {ok:true,json:async()=>({success:true,result:{deployment_configs:{production:{d1_databases:{DB:{id:db,database_name:"hermes-connect-prototype"}}}}}})};
  if(url.endsWith("/d1/database/"+db+"/query"))return {ok:true,json:async()=>({...heartbeat,result:[{success:true,results:[{...heartbeat.result[0].results[0],source_sha:"e".repeat(40)}]}]})};
  throw Error("must stop before Queue");
}},"github_ci_worker_not_exact_dry_run_main");
assert.equal(heartbeatMismatchCalls.some(c=>c.url.endsWith("/queues")),false);
assert.equal(heartbeatMismatchCalls.some(c=>c.url.endsWith("/messages")),false);

// Producer must reject spoofed workflow identity before any Cloudflare call.
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

// Unknown outcome of the sole Queue POST is fail-closed and never resent by this call.
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
assert.match(src,/validateT4Heartbeat/);
console.log("HAE #2067 CI source producer PASS: exact main+deployed dry-run proof -> one minimized Queue post; fail-closed no retry");
