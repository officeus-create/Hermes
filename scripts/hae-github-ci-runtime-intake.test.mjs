import assert from "node:assert/strict";
import fs from "node:fs";
import {verifyGithubCIQueueEnvelope,validateGithubCIQueueEnvelope} from "../workers/automation-engine/src/github-ci-runtime-intake.mjs";
import {evaluateHaeSelfImprovementSnapshot} from "../workers/automation-engine/src/hae-self-improvement.mjs";

const repo="officeus-create/Hermes",runId=40249991001,runAttempt=1;
const sha="a".repeat(40),baseSha="b".repeat(40);
const env={type:"github.ci.audit",run_id:runId,run_attempt:runAttempt};
const run={
  id:runId,run_attempt:runAttempt,status:"completed",conclusion:"failure",
  repository:{full_name:repo},head_repository:{full_name:repo},name:"Hermes Automation Engine Contract",
  head_sha:sha,html_url:"https://github.com/"+repo+"/actions/runs/"+runId,
  event:"pull_request",workflow_id:445566,updated_at:"2026-10-26T00:38:00Z",
  pull_requests:[{number:2088,base:{sha:baseSha}}],secrets:{raw:"NEVER_PERSIST_THIS"},
};
const pr={number:2088,head:{sha},base:{sha:baseSha,repo:{full_name:repo}},body:"PRIVATE_UNTRUSTED_BODY"};
const calls=[];
const fetchImpl=async(url,init)=>{
  calls.push({url,init});
  if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>run};
  if(url.endsWith("/pulls/2088"))throw Error("CI replay must never read mutable PR state");
  throw new Error("unexpected_request");
};
const obj=await verifyGithubCIQueueEnvelope(env,{fetchImpl});
assert.equal(obj.job_type,"hae.self.improvement.audit");
assert.equal(obj.business_lane,"automation");
assert.equal(obj.idempotency_key,"hae:ci:audit:github-ci:"+runId+":"+runAttempt+":"+sha);
assert.equal(obj.payload.coverage_complete,false);
assert.equal(obj.payload._source.pr_number,2088);
assert.equal(obj.payload._source.base_sha,baseSha);
assert.equal(calls.length,1,"Only immutable workflow run endpoint is needed");
assert.equal(obj.payload._source.writer_state,"UNVERIFIED");
assert.equal(obj.model_cost_usd,0);
assert.equal(obj.automatic_repair_allowed,false);
assert.equal(evaluateHaeSelfImprovementSnapshot(obj.payload).next_action,"NO_ACTION");
assert.ok(calls.every(x=>x.init?.method===undefined),"GitHub source requests are read-only GET");
assert.ok(calls.every(x=>x.url.startsWith("https://api.github.com/repos/"+repo+"/")));
assert.ok(!JSON.stringify(obj).includes("NEVER_PERSIST_THIS"));
assert.ok(!JSON.stringify(obj).includes("PRIVATE_UNTRUSTED_BODY"));
assert.deepEqual(await verifyGithubCIQueueEnvelope(env,{fetchImpl}),obj);
const fail=(f,code)=>assert.throws(f,e=>e.code===code);
for(const payload of [
  {...env,run_id:"40249991001"}, {...env,type:"job.execute"},
  {...env,writer_state_verified:true},{...env,run_attempt:0},
  {...env,findings:[{verified:true}]},
]){
  fail(()=>validateGithubCIQueueEnvelope(payload),"github_ci_queue_envelope_invalid");
}
await assert.rejects(()=>verifyGithubCIQueueEnvelope(env,{fetchImpl:async()=>({ok:true,json:async()=>({...run,conclusion:"success"})})}),e=>e.code==="github_ci_source_evidence_mismatch");
await assert.rejects(()=>verifyGithubCIQueueEnvelope(env,{fetchImpl:async()=>({ok:true,json:async()=>({...run,repository:{full_name:"evil/repo"}})})}),e=>e.code==="github_ci_source_evidence_mismatch");
await assert.rejects(()=>verifyGithubCIQueueEnvelope(env,{fetchImpl:async()=>({ok:false,status:403})}),e=>e.code==="github_ci_source_http_not_ok");
const source=fs.readFileSync(new URL("../workers/automation-engine/src/github-ci-runtime-intake.mjs",import.meta.url),"utf8");
assert.doesNotMatch(source,/github_pat_|ghp_|api\.openai\.com|\/repos\/.*\/pulls\/.*\/merge|\/sendMessage/);
const worker=fs.readFileSync(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
assert.match(worker,/if \(messageType === "github\.ci\.audit"\)\s*\{[\s\S]*?verifyGithubCIQueueEnvelope\(payload\)[\s\S]*?createGenericJob\(env, authenticated\)[\s\S]*?item\.ack\(\)/);
const wf=fs.readFileSync(new URL("../.github/workflows/hae-github-ci-sensor.yml",import.meta.url),"utf8");
assert.ok(wf.includes("vars.HAE_CI_SENSOR_ENABLED == 'true'"));
assert.ok(wf.includes("github.event.workflow_run.head_repository.full_name == 'officeus-create/Hermes'"));
assert.ok(wf.includes("persist-credentials: false"));
assert.ok(!wf.includes("pull_request_target:"));
assert.ok(!wf.includes("secrets.GITHUB_ADMIN_TOKEN"));
console.log("HAE #2067 verified CI Queue intake PASS: source readback, dedupe, minimized payload, PARTIAL writer coverage, $0");
