import assert from "node:assert/strict";
import fs from "node:fs";
import {verifyGithubCIQueueEnvelope,validateGithubCIQueueEnvelope} from "../workers/automation-engine/src/github-ci-runtime-intake.mjs";
import {evaluateHaeSelfImprovementSnapshot} from "../workers/automation-engine/src/hae-self-improvement.mjs";

const repo="officeus-create/Hermes",runId=40249991001,runAttempt=1;
const sha="a".repeat(40),baseSha="b".repeat(40),producerSha="c".repeat(40);
const envelope={
  type:"github.ci.audit",
  run_id:runId,
  run_attempt:runAttempt,
  producer_main_sha:producerSha,
  repository:repo,
  workflow_name:"Hermes Automation Engine Contract",
  workflow_path:".github/workflows/automation-engine-contract.yml",
  workflow_id:382680939,
  event:"pull_request",
  status:"completed",
  conclusion:"failure",
  head_sha:sha,
  html_url:"https://github.com/"+repo+"/actions/runs/"+runId,
  updated_at:"2026-10-26T00:38:00.000Z",
  changed_paths_fingerprint:"sha256:"+"d".repeat(64),
  changed_path_count:2,
  base_sha:baseSha,
  pr_number:2088,
};
const artifactKey="github-workflow:382680939";
const dbWith=(rows=[])=>({
  prepare(sql){
    assert.match(sql,/hermes_automation_jobs/);
    assert.match(sql,/hae\.self\.repair\.packet/);
    return {all:async()=>({results:rows})};
  },
});
const clearDb=dbWith([]);

const checked=validateGithubCIQueueEnvelope(envelope);
assert.deepEqual(checked,envelope);
const obj=await verifyGithubCIQueueEnvelope(envelope,{db:clearDb,deployedSourceSha:producerSha});
assert.equal(obj.job_type,"hae.self.improvement.audit");
assert.equal(obj.business_lane,"automation");
assert.equal(obj.idempotency_key,"hae:ci:audit:github-ci:"+runId+":"+runAttempt+":"+sha);
assert.equal(obj.payload.coverage_complete,true);
assert.equal(obj.coverage_complete,true);
assert.equal(obj.payload._source.pr_number,2088);
assert.equal(obj.payload._source.base_sha,baseSha);
assert.equal(obj.payload._source.changed_path_count,2);
assert.equal(obj.payload._source.changed_paths_fingerprint,envelope.changed_paths_fingerprint);
assert.equal(obj.payload._source.writer_state,"VERIFIED_CLEAR");
assert.equal(obj.payload._source.producer_main_sha,producerSha);
assert.equal(obj.payload._source.trust_class,"GITHUB_ACTIONS_EPHEMERAL_TOKEN_TO_PRIVATE_CLOUDFLARE_QUEUE");
assert.equal(obj.model_cost_usd,0);
assert.equal(obj.automatic_repair_allowed,false);
const evaluated=evaluateHaeSelfImprovementSnapshot(obj.payload);
assert.equal(evaluated.next_action,"HOLD_REPAIR");
assert.equal(evaluated.next_work_id,"HAE-SELF:ci-"+runId+"-1-"+sha.slice(0,12));
assert.equal(evaluated.routing_blocked_reason,null);

const repeat=await verifyGithubCIQueueEnvelope({...envelope},{db:clearDb,deployedSourceSha:producerSha});
assert.deepEqual(repeat,obj,"Replay of same minimized producer snapshot must be deterministic");

const activeDb=dbWith([{job_id:"repair:active",payload_json:JSON.stringify({artifact_key:artifactKey})}]);
const active=await verifyGithubCIQueueEnvelope(envelope,{db:activeDb,deployedSourceSha:producerSha});
assert.equal(active.payload._source.writer_state,"ACTIVE");
assert.equal(evaluateHaeSelfImprovementSnapshot(active.payload).next_action,"NO_ACTION");
assert.equal(evaluateHaeSelfImprovementSnapshot(active.payload).repair_candidate_count,0);

const failSync=(payload,code)=>assert.throws(()=>validateGithubCIQueueEnvelope(payload),e=>e.code===code);
for(const payload of [
  {...envelope,run_id:"40249991001"},
  {...envelope,type:"job.execute"},
  {...envelope,repository:"evil/repo"},
  {...envelope,head_sha:"bad"},
  {...envelope,changed_paths_fingerprint:"sha256:bad"},
  {...envelope,changed_path_count:0},
  {...envelope,changed_path_count:101},
  {...envelope,updated_at:"bad"},
  {...envelope,extra:"forbidden"},
]) failSync(payload,"github_ci_queue_envelope_invalid");

for(const override of [
  {workflow_path:".github/workflows/impostor.yml"},
  {workflow_id:999999999},
  {workflow_path:null},
  {workflow_name:"Website checks"},
]){
  assert.throws(()=>validateGithubCIQueueEnvelope({...envelope,...override}),e=>e.code==="github_ci_workflow_identity_invalid");
}
await assert.rejects(
  ()=>verifyGithubCIQueueEnvelope(envelope,{db:clearDb,deployedSourceSha:"f".repeat(40)}),
  e=>e.code==="github_ci_producer_main_sha_mismatch"
);
await assert.rejects(
  ()=>verifyGithubCIQueueEnvelope(envelope,{db:null,deployedSourceSha:producerSha}),
  e=>e.code==="github_ci_writer_state_db_unavailable"
);
const tooMany=Array.from({length:101},(_,i)=>({job_id:"j"+i,payload_json:"{}"}));
await assert.rejects(
  ()=>verifyGithubCIQueueEnvelope(envelope,{db:dbWith(tooMany),deployedSourceSha:producerSha}),
  e=>e.code==="github_ci_writer_state_ambiguous"
);

const source=fs.readFileSync(new URL("../workers/automation-engine/src/github-ci-runtime-intake.mjs",import.meta.url),"utf8");
assert.doesNotMatch(source,/api\.github\.com|github_pat_|ghp_|Bearer|fetch\s*\(/,"Worker runtime intake must have no GitHub network credential/fetch dependency");
assert.match(source,/GITHUB_ACTIONS_EPHEMERAL_TOKEN_TO_PRIVATE_CLOUDFLARE_QUEUE/);
assert.match(source,/MAX_CHANGED_PATHS=100/);
assert.match(source,/MAX_ACTIVE_REPAIR_JOBS=100/);
const worker=fs.readFileSync(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
assert.match(worker,/verifyGithubCIQueueEnvelope\(payload, \{[\s\S]*?db: env\.DB,[\s\S]*?deployedSourceSha: clean\(env\.HERMES_AUTOMATION_SOURCE_SHA, 80\)/);
assert.match(worker,/createGenericJob\(env, authenticated\)[\s\S]*?item\.ack\(\)/);
console.log("HAE #2067 trusted Queue snapshot PASS: ephemeral GitHub producer -> no Worker GitHub fetch -> stable HOLD_REPAIR, $0");
