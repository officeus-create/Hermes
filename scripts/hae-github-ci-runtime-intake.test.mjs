import assert from "node:assert/strict";
import fs from "node:fs";
import {verifyGithubCIQueueEnvelope,validateGithubCIQueueEnvelope} from "../workers/automation-engine/src/github-ci-runtime-intake.mjs";
import {evaluateHaeSelfImprovementSnapshot} from "../workers/automation-engine/src/hae-self-improvement.mjs";

const repo="officeus-create/Hermes",runId=40249991001,runAttempt=1;
const sha="a".repeat(40),baseSha="b".repeat(40);
const envelope={type:"github.ci.audit",run_id:runId,run_attempt:runAttempt};
const run={
  id:runId,run_attempt:runAttempt,status:"completed",conclusion:"failure",
  repository:{full_name:repo},head_repository:{full_name:repo},name:"Hermes Automation Engine Contract",
  head_sha:sha,html_url:"https://github.com/"+repo+"/actions/runs/"+runId,
  event:"pull_request",workflow_id:382680939,path:".github/workflows/automation-engine-contract.yml",updated_at:"2026-10-26T00:38:00Z",
  pull_requests:[{number:2088,base:{sha:baseSha}}],secrets:{raw:"NEVER_PERSIST_THIS"},
};
const commit={sha,files:[
  {filename:"workers/automation-engine/capability-policy.json",patch:"PRIVATE_DIFF_MUST_NOT_PERSIST"},
  {filename:"scripts/automation-engine-capability-policy.test.mjs",patch:"PRIVATE_TEST_DIFF"},
]};
const calls=[];
const fetchImpl=async(url,init)=>{
  calls.push({url,init});
  if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>run};
  if(url.endsWith("/commits/"+sha))return {ok:true,json:async()=>commit};
  if(url.includes("/pulls/"))throw Error("CI replay must never read mutable PR state");
  throw new Error("unexpected_request");
};
const dbWith=(rows=[])=>({
  prepare(sql){
    assert.match(sql,/hermes_automation_jobs/);
    assert.match(sql,/hae\.self\.repair\.packet/);
    return {all:async()=>({results:rows})};
  },
});
const clearDb=dbWith([]);
const obj=await verifyGithubCIQueueEnvelope(envelope,{fetchImpl,db:clearDb});
assert.equal(obj.job_type,"hae.self.improvement.audit");
assert.equal(obj.business_lane,"automation");
assert.equal(obj.idempotency_key,"hae:ci:audit:github-ci:"+runId+":"+runAttempt+":"+sha);
assert.equal(obj.payload.coverage_complete,true);
assert.equal(obj.coverage_complete,true);
assert.equal(obj.payload._source.pr_number,2088);
assert.equal(obj.payload._source.base_sha,baseSha);
assert.equal(obj.payload._source.changed_path_count,2);
assert.match(obj.payload._source.changed_paths_fingerprint,/^sha256:[a-f0-9]{64}$/);
assert.equal(obj.payload._source.writer_state,"VERIFIED_CLEAR");
assert.equal(calls.length,2,"Only immutable workflow run + exact commit metadata are read");
assert.equal(obj.model_cost_usd,0);
assert.equal(obj.automatic_repair_allowed,false,"CI intake may create HOLD_REPAIR work but never source-write automatically");
const evaluated=evaluateHaeSelfImprovementSnapshot(obj.payload);
assert.equal(evaluated.next_action,"HOLD_REPAIR");
assert.equal(evaluated.next_work_id,"HAE-SELF:ci-"+runId+"-1-"+sha.slice(0,12));
assert.equal(evaluated.routing_blocked_reason,null);
assert.ok(calls.every(x=>x.init?.method===undefined),"GitHub source requests are read-only GET");
assert.ok(calls.every(x=>x.url.startsWith("https://api.github.com/repos/"+repo+"/")));
assert.ok(!JSON.stringify(obj).includes("NEVER_PERSIST_THIS"));
assert.ok(!JSON.stringify(obj).includes("PRIVATE_DIFF_MUST_NOT_PERSIST"));
assert.ok(!JSON.stringify(obj).includes("PRIVATE_TEST_DIFF"));
const repeat=await verifyGithubCIQueueEnvelope(envelope,{fetchImpl,db:clearDb});
assert.deepEqual(repeat,obj,"Immutable run+commit+D1-clear lease replay must be deterministic");

const artifactKey="github-workflow:382680939";
const activeDb=dbWith([{job_id:"repair:active",payload_json:JSON.stringify({artifact_key:artifactKey})}]);
const active=await verifyGithubCIQueueEnvelope(envelope,{fetchImpl,db:activeDb});
assert.equal(active.payload.coverage_complete,true);
assert.equal(active.payload._source.writer_state,"ACTIVE");
assert.equal(evaluateHaeSelfImprovementSnapshot(active.payload).next_action,"NO_ACTION");
assert.equal(evaluateHaeSelfImprovementSnapshot(active.payload).routing_blocked_reason,null);
assert.equal(evaluateHaeSelfImprovementSnapshot(active.payload).repair_candidate_count,0);

const failSync=(f,code)=>assert.throws(f,e=>e.code===code);
for(const payload of [
  {...envelope,run_id:"40249991001"}, {...envelope,type:"job.execute"},
  {...envelope,writer_state_verified:true},{...envelope,run_attempt:0},
  {...envelope,findings:[{verified:true}]},
]) failSync(()=>validateGithubCIQueueEnvelope(payload),"github_ci_queue_envelope_invalid");

await assert.rejects(()=>verifyGithubCIQueueEnvelope(envelope,{fetchImpl:async()=>({ok:true,json:async()=>({...run,conclusion:"success"})}),db:clearDb}),e=>e.code==="github_ci_source_evidence_mismatch");
await assert.rejects(()=>verifyGithubCIQueueEnvelope(envelope,{fetchImpl:async()=>({ok:true,json:async()=>({...run,repository:{full_name:"evil/repo"}})}),db:clearDb}),e=>e.code==="github_ci_source_evidence_mismatch");
await assert.rejects(()=>verifyGithubCIQueueEnvelope(envelope,{fetchImpl:async()=>({ok:false,status:403}),db:clearDb}),e=>e.code==="github_ci_source_http_not_ok");

for(const override of [
  {path:".github/workflows/impostor.yml"},{workflow_id:999999999},{path:null},{name:"Website checks"},{name:"__proto__"},
]){
  await assert.rejects(
    ()=>verifyGithubCIQueueEnvelope(envelope,{fetchImpl:async()=>({ok:true,json:async()=>({...run,...override})}),db:clearDb}),
    e=>e.code==="github_ci_source_evidence_mismatch"
  );
}
await assert.rejects(
  ()=>verifyGithubCIQueueEnvelope(envelope,{fetchImpl:async(url)=>url.endsWith("/actions/runs/"+runId)
    ?{ok:true,json:async()=>run}:{ok:true,json:async()=>({sha,files:[]})},db:clearDb}),
  e=>e.code==="github_ci_changed_paths_incomplete"
);
await assert.rejects(
  ()=>verifyGithubCIQueueEnvelope(envelope,{fetchImpl,db:null}),
  e=>e.code==="github_ci_writer_state_db_unavailable"
);
const tooMany=Array.from({length:101},(_,i)=>({job_id:"j"+i,payload_json:"{}"}));
await assert.rejects(
  ()=>verifyGithubCIQueueEnvelope(envelope,{fetchImpl,db:dbWith(tooMany)}),
  e=>e.code==="github_ci_writer_state_ambiguous"
);

const source=fs.readFileSync(new URL("../workers/automation-engine/src/github-ci-runtime-intake.mjs",import.meta.url),"utf8");
assert.doesNotMatch(source,/github_pat_|ghp_|api\.openai\.com|\/repos\/.*\/pulls\/.*\/merge|\/sendMessage/);
assert.match(source,/MAX_CHANGED_PATHS=100/);
assert.match(source,/MAX_ACTIVE_REPAIR_JOBS=100/);
const worker=fs.readFileSync(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
assert.match(worker,/if \(messageType === "github\.ci\.audit"\)\s*\{[\s\S]*?verifyGithubCIQueueEnvelope\(payload, \{ db: env\.DB \}\)[\s\S]*?createGenericJob\(env, authenticated\)[\s\S]*?item\.ack\(\)/);
const wf=fs.readFileSync(new URL("../.github/workflows/hae-github-ci-sensor.yml",import.meta.url),"utf8");
assert.ok(!wf.includes("vars.HAE_CI_SENSOR_ENABLED"));
assert.ok(wf.includes("CLOUDFLARE_HAE_RELEASE_TOKEN"));
assert.ok(wf.includes("HAE_CI_EXPECTED_MAIN_SHA"));
assert.ok(wf.includes("github.event.workflow_run.head_repository.full_name == 'officeus-create/Hermes'"));
assert.ok(wf.includes("persist-credentials: false"));
assert.ok(!wf.includes("pull_request_target:"));
assert.ok(!wf.includes("secrets.GITHUB_ADMIN_TOKEN"));
console.log("HAE #2067 verified CI Queue intake PASS: immutable changed-path fingerprint + D1 writer lease -> stable HOLD_REPAIR work, $0");
