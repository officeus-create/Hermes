import assert from "node:assert/strict";
import fs from "node:fs";
import {dispatchGithubCIEvent} from "./hae-github-ci-source.mjs";
import {githubCIWorkflowIdentityVerified} from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";
const repo="officeus-create/Hermes",runId=40249991001,runAttempt=1;
const account="a".repeat(32),queue="b".repeat(32);
const r={id:runId,run_attempt:runAttempt,repository:{full_name:repo},head_repository:{full_name:repo},
  name:"Hermes Automation Engine Contract",path:".github/workflows/automation-engine-contract.yml",workflow_id:382680939,status:"completed",conclusion:"failure",
  html_url:"https://github.com/"+repo+"/actions/runs/"+runId};
assert.equal(githubCIWorkflowIdentityVerified(r),true);
assert.equal(githubCIWorkflowIdentityVerified({
  name:"Website checks",path:".github/workflows/ci.yml",workflow_id:311612557
}),true);
assert.equal(githubCIWorkflowIdentityVerified({
  name:"Website checks",path:".github/workflows/ci.yml",workflow_id:382680939
}),false);
const calls=[];
const mock=async(url,request)=>{
  calls.push({url,request});
  if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>r};
  if(url.endsWith("/queues"))return {ok:true,json:async()=>({success:true,result:[{queue_name:"hermes-automation",queue_id:queue}]})};
  if(url.endsWith("/queues/"+queue+"/messages"))return {ok:true,json:async()=>({success:true})};
  throw Error("unanticipated_network");
};
const args={runId,runAttempt,accountId:account,githubToken:"mock-gh",cloudflareToken:"mock-cf",fetchImpl:mock};
const got=await dispatchGithubCIEvent(args);
assert.equal(got.queue_receipt,"CLOUDFLARE_ACCEPTED_NOT_YET_D1_VERIFIED");
assert.equal(got.automatic_repair_allowed,false);
assert.equal(got.model_cost_usd,0);
assert.equal(calls.length,3);
const writes=calls.filter(c=>c.request.method==="POST");
assert.equal(writes.length,1);
assert.equal(writes[0].url,"https://api.cloudflare.com/client/v4/accounts/"+account+"/queues/"+queue+"/messages");
assert.deepEqual(JSON.parse(writes[0].request.body),{body:{type:"github.ci.audit",run_id:runId,run_attempt:1}});
const fail=async(opts,code)=>assert.rejects(()=>dispatchGithubCIEvent({...args,...opts}),e=>e.code===code);
const callsBefore=calls.length;
await fail({runId:"40249991001"},"github_ci_source_preflight_invalid");
assert.equal(calls.length,callsBefore);
let mismatched=async(url,request)=>{
  if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>({...r,conclusion:"success"})};
  return mock(url,request);
};
await fail({fetchImpl:mismatched},"github_ci_source_run_verification_failed");
// Producer must not enqueue a same-name workflow from a different file/ID.
for(const override of [
  {path:".github/workflows/impostor.yml"},
  {workflow_id:999999999},
  {path:null},
  {name:"Website checks"},
]){
  const requests=[];
  await fail({fetchImpl:async(url,request)=>{
    requests.push({url,request});
    if(url.endsWith("/actions/runs/"+runId))
      return {ok:true,json:async()=>({...r,...override})};
    throw Error("producer must reject before Cloudflare request");
  }},"github_ci_source_run_verification_failed");
  assert.equal(requests.length,1,"Spoofed workflow must never reach Cloudflare");
}

const afterValidation=calls.length;
assert.equal(afterValidation,callsBefore);
await fail({fetchImpl:async(url,request)=>{
  if(url.endsWith("/queues/"+queue+"/messages"))throw Error("unknown_outcome");
  return mock(url,request);
}},"github_ci_source_transport_ambiguous_no_retry");
assert.equal(calls.length,afterValidation+2);
const workflow=fs.readFileSync(new URL("../.github/workflows/hae-github-ci-sensor.yml",import.meta.url),"utf8");
assert.match(workflow,/secrets\.HAE_CI_SENSOR_QUEUE_TOKEN/);
assert.doesNotMatch(workflow,/CLOUDFLARE_HAE_RELEASE_TOKEN/);
const src=fs.readFileSync(new URL("./hae-github-ci-source.mjs",import.meta.url),"utf8");
assert.doesNotMatch(src,/CLOUDFLARE_HAE_RELEASE_TOKEN|\/v1\/tick|publication\.write|\/sendMessage|wrangler@4 deploy/);
console.log("HAE #2067 CI source producer PASS: one verified event -> one minimized Queue post; fail-closed no retry");
