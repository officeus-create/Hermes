// HAE #2067: real Worker queue handler + in-memory SQLite D1 analog.
// ISOLATED LOCAL INTEGRATION TEST, never production evidence.
// The GitHub Action producer has already authenticated/minimized source evidence;
// the Worker must perform zero GitHub network reads.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {DatabaseSync} from "node:sqlite";
import worker from "../workers/automation-engine/src/index.mjs";

const runId=40888881234,runAttempt=1;
const repo="officeus-create/Hermes",head="a".repeat(40),base="b".repeat(40),producerMain="c".repeat(40);
const patchablePath="scripts/hae-github-ci-integration-sqlite.test.mjs";
const pathFingerprint=paths=>"sha256:"+createHash("sha256").update(paths.join("\n"),"utf8").digest("hex");
function sourcePacket(overrides={}){
 const id=overrides.run_id??runId;
 const attempt=overrides.run_attempt??runAttempt;
 return {
  type:"github.ci.audit",
  run_id:id,
  run_attempt:attempt,
  producer_main_sha:producerMain,
  repository:repo,
  workflow_name:"Hermes Automation Engine Contract",
  workflow_path:".github/workflows/automation-engine-contract.yml",
  workflow_id:382680939,
  event:"pull_request",
  status:"completed",
  conclusion:"failure",
  head_sha:head,
  html_url:"https://github.com/"+repo+"/actions/runs/"+id,
  updated_at:"2026-10-26T14:00:00.000Z",
  changed_paths_fingerprint:pathFingerprint([patchablePath]),
  changed_path_count:1,
  repair_artifact_key:patchablePath,
  base_sha:base,
  pr_number:2094,
  ...overrides,
 };
}

const originalFetch=globalThis.fetch;
let unexpectedFetches=0;
globalThis.fetch=async()=>{unexpectedFetches+=1;throw Error("worker_github_network_forbidden");};

const raw=new DatabaseSync(":memory:");
const queueWrites=[];
const db={
 prepare(sql){
  const stmt=raw.prepare(sql);
  return {
   bind(...params){
    return {
     run:async()=>stmt.run(...params),
     first:async()=>stmt.get(...params)||null,
     all:async()=>({results:stmt.all(...params)}),
    };
   },
   run:async()=>stmt.run(),
   first:async()=>stmt.get()||null,
   all:async()=>({results:stmt.all()}),
  };
 },
 batch:async(statements)=>{
  raw.exec("BEGIN");
  try{
   const results=[];
   for(const stmt of statements){
    const result=await stmt.run();
    results.push({...result,meta:{changes:Number(result?.changes||0)}});
   }
   raw.exec("COMMIT");
   return results;
  }catch(e){raw.exec("ROLLBACK");throw e;}
 },
};
const env={
 DB:db,
 HERMES_AUTOMATION_SOURCE_SHA:producerMain,
 AUTOMATION_QUEUE:{send:async packet=>queueWrites.push(packet)}
};
function batch(overrides={}){
 const state={ack:0,retry:0};
 return {state,object:{
  queue:"hermes-automation",
  messages:[{
   body:sourcePacket(overrides),
   id:"synthetic_message_id",attempts:1,
   ack(){state.ack++},retry(){state.retry++}
  }]
 }};
}
try{
 // Malformed Queue evidence cannot reserve D1 work.
 const malformed=batch({extra:"PRIVATE_SECRET"});
 await worker.queue(malformed.object,env);
 assert.deepEqual(malformed.state,{ack:0,retry:1});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,0);
 assert.equal(queueWrites.length,0);
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_runtime_events WHERE event_type='queue.message_retry' AND error_class='github_ci_queue_envelope_invalid'"
 ).get().count,1);

 // A forged canonical-name workflow with wrong immutable workflow ID fails closed.
 const wrongWorkflowId=batch({workflow_id:999999999});
 await worker.queue(wrongWorkflowId.object,env);
 assert.deepEqual(wrongWorkflowId.state,{ack:0,retry:1});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,0);
 assert.equal(queueWrites.length,0);
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_runtime_events WHERE event_type='queue.message_retry' AND error_class='github_ci_workflow_identity_invalid'"
 ).get().count,1);

 // Snapshot must be produced by the exact source SHA deployed in this Worker.
 const wrongProducer=batch({producer_main_sha:"f".repeat(40)});
 await worker.queue(wrongProducer.object,env);
 assert.deepEqual(wrongProducer.state,{ack:0,retry:1});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,0);
 assert.equal(queueWrites.length,0);
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_runtime_events WHERE event_type='queue.message_retry' AND error_class='github_ci_producer_main_sha_mismatch'"
 ).get().count,1);

 const first=batch();
 await worker.queue(first.object,env);
 assert.deepEqual(first.state,{ack:1,retry:0});
 const second=batch();
 await worker.queue(second.object,env);
 assert.deepEqual(second.state,{ack:1,retry:0});
 const rows=raw.prepare("SELECT job_id,job_type,state,idempotency_key,payload_json,priority,attempt_count FROM hermes_automation_jobs").all();
 assert.equal(rows.length,1,"Exactly one D1 job persists after duplicated CI delivery");
 assert.equal(rows[0].job_type,"hae.self.improvement.audit");
 assert.equal(rows[0].state,"QUEUED");
 assert.equal(rows[0].priority,75);
 assert.equal(rows[0].attempt_count,0);
 assert.equal(rows[0].idempotency_key,"hae:ci:audit:github-ci:"+runId+":"+runAttempt+":"+head);
 assert.equal(queueWrites.length,1,"Only first reservation enqueues execution");
 assert.deepEqual(queueWrites[0],{type:"job.execute",job_id:rows[0].job_id});
 const job=JSON.parse(rows[0].payload_json);
 assert.equal(job.coverage_complete,true);
 assert.equal(job._source.writer_state,"VERIFIED_CLEAR");
 assert.equal(job._source.head_sha,head);
 assert.equal(job._source.pr_number,2094);
 assert.equal(job._source.producer_main_sha,producerMain);
 assert.equal(job._source.trust_class,"GITHUB_ACTIONS_EPHEMERAL_TOKEN_TO_PRIVATE_CLOUDFLARE_QUEUE");
 assert.match(job._source.changed_paths_fingerprint,/^sha256:[a-f0-9]{64}$/);
 assert.equal(job._source.changed_path_count,1);
 assert.equal(job._source.patchable_artifact_key,patchablePath);
 assert.equal(job.findings[0].artifact_key,patchablePath);
 assert.equal(job.findings[0].status,"OPEN");
 assert.equal(rows[0].payload_json.includes("PRIVATE_SECRET"),false);
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_job_events WHERE event_type='job.created'").get().count,1);
 assert.equal(unexpectedFetches,0,"Worker runtime CI intake must perform zero GitHub/network fetches");

 function executionBatch(packet,id){
  const state={ack:0,retry:0};
  return {state,object:{queue:"hermes-automation",messages:[{
   body:packet,id,attempts:1,ack(){state.ack++},retry(){state.retry++}
  }]}};
 }
 const auditExec=executionBatch(queueWrites[0],"audit_execute_message");
 await worker.queue(auditExec.object,env);
 assert.deepEqual(auditExec.state,{ack:1,retry:0});
 const auditRow=raw.prepare("SELECT state,result_json FROM hermes_automation_jobs WHERE job_id=?").get(rows[0].job_id);
 assert.equal(auditRow.state,"SUCCEEDED");
 const auditResult=JSON.parse(auditRow.result_json);
 assert.equal(auditResult.result.next_action,"HOLD_REPAIR");
 const expectedWorkId="HAE-SELF:ci-"+runId+"-"+runAttempt+"-"+head.slice(0,12);
 assert.equal(auditResult.result.next_work_id,expectedWorkId);
 assert.equal(queueWrites.length,2,"Successful audit must enqueue exactly one repair packet execution");
 const repairRow=raw.prepare(
   "SELECT job_id,state,idempotency_key,payload_json FROM hermes_automation_jobs WHERE job_type='hae.self.repair.packet'"
 ).get();
 assert.ok(repairRow,"Autonomous HAE-SELF repair packet must be durable in D1");
 assert.equal(repairRow.state,"QUEUED");
 assert.equal(repairRow.idempotency_key,"hae:followup:self.repair:"+expectedWorkId);
 const repairPayload=JSON.parse(repairRow.payload_json);
 assert.equal(repairPayload.work_id,expectedWorkId);
 assert.equal(repairPayload.artifact_key,patchablePath);

 const repairExec=executionBatch(queueWrites[1],"repair_execute_message");
 await worker.queue(repairExec.object,env);
 assert.deepEqual(repairExec.state,{ack:1,retry:0});
 const repairDone=raw.prepare("SELECT state,result_json FROM hermes_automation_jobs WHERE job_id=?").get(repairRow.job_id);
 assert.equal(repairDone.state,"SUCCEEDED");
 const repairResult=JSON.parse(repairDone.result_json);
 assert.equal(repairResult.result.repair_state,"HOLD_REPAIR");
 assert.equal(repairResult.result.source_change_performed,false);
 assert.equal(repairResult.result.automatic_merge_performed,false);
 assert.equal(repairResult.result.automatic_deploy_performed,false);

 // Authenticated exact-test source may create exactly one internal semantic patch proposal.
 const findingId="ci-"+runId+"-"+runAttempt+"-"+head.slice(0,12);
 const patchSource='import assert from "node:assert/strict";\nassert.equal(0, 1);\n';
 const patchSourceDigest="sha256:"+createHash("sha256").update(patchSource,"utf8").digest("hex");
 const patchState={ack:0,retry:0};
 const patchMessage={
  queue:"hermes-automation",
  messages:[{
   body:{
    type:"github.ci.patch.propose",
    run_id:runId,
    run_attempt:runAttempt,
    producer_main_sha:producerMain,
    repository:repo,
    workflow_name:"Hermes Automation Engine Contract",
    workflow_path:".github/workflows/automation-engine-contract.yml",
    workflow_id:382680939,
    head_sha:head,
    repair_job_id:repairRow.job_id,
    work_id:expectedWorkId,
    finding_id:findingId,
    artifact_key:patchablePath,
    source_excerpt:patchSource,
    source_excerpt_sha256:patchSourceDigest,
    failure_summary:"The exact-head deterministic contract failed in the single changed test file."
   },
   id:"patch_source_message",attempts:1,
   ack(){patchState.ack++},retry(){patchState.retry++}
  }]
 };
 await worker.queue(patchMessage,env);
 assert.deepEqual(patchState,{ack:1,retry:0});
 const patchJob=raw.prepare(
  "SELECT job_id,state,idempotency_key,payload_json,attempt_count FROM hermes_automation_jobs WHERE job_type='hae.self.patch.propose'"
 ).get();
 assert.ok(patchJob,"Patch proposal semantic job must be durable in D1");
 assert.equal(patchJob.state,"QUEUED");
 assert.equal(patchJob.idempotency_key,"hae:followup:self.patch.propose:"+expectedWorkId);
 const patchPayload=JSON.parse(patchJob.payload_json);
 assert.equal(patchPayload.work_id,expectedWorkId);
 assert.equal(patchPayload.repair_job_id,repairRow.job_id);
 assert.equal(patchPayload.artifact_key,patchablePath);
 assert.equal(patchPayload.base_sha,head);
 assert.equal(patchPayload.source_excerpt_sha256,patchSourceDigest);
 assert.equal(queueWrites.length,3,"Patch proposal admission must enqueue exactly one semantic execution");
 const patchExec=executionBatch(queueWrites[2],"patch_execute_message");
 await worker.queue(patchExec.object,env);
 assert.deepEqual(patchExec.state,{ack:1,retry:0});
 const patchWaiting=raw.prepare(
  "SELECT state,attempt_count,last_error_class FROM hermes_automation_jobs WHERE job_id=?"
 ).get(patchJob.job_id);
 assert.equal(patchWaiting.state,"WAITING_FREE_AI");
 assert.equal(patchWaiting.attempt_count,0,"WAITING_FREE_AI must not consume a retry");
 assert.ok(patchWaiting.last_error_class,"WAITING_FREE_AI must retain a bounded provider reason");

 // Same run/attempt with incompatible authenticated snapshot cannot overwrite the reservation.
 const conflictingReplay=batch({updated_at:"2026-10-26T15:00:00.000Z"});
 await worker.queue(conflictingReplay.object,env);
 assert.deepEqual(conflictingReplay.state,{ack:0,retry:1});
 assert.equal(queueWrites.length,3);
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,3);

 // D1 reservation survives downstream Queue outage and retains existing recovery semantics.
 const newRun=runId+1;
 const originalSend=env.AUTOMATION_QUEUE.send;
 env.AUTOMATION_QUEUE.send=async()=>{throw Error("synthetic_queue_unavailable");};
 const failedEnqueue=batch({run_id:newRun,html_url:"https://github.com/"+repo+"/actions/runs/"+newRun,updated_at:"2026-10-26T15:10:00.000Z"});
 await worker.queue(failedEnqueue.object,env);
 assert.deepEqual(failedEnqueue.state,{ack:1,retry:0});
 const deferred=raw.prepare(
   "SELECT job_id,state,last_error_class,available_at FROM hermes_automation_jobs WHERE idempotency_key=?"
 ).get("hae:ci:audit:github-ci:"+newRun+":"+runAttempt+":"+head);
 assert.ok(deferred,"D1 reservation must survive Queue outage");
 assert.equal(deferred.state,"RETRY_SCHEDULED");
 assert.equal(deferred.last_error_class,"job_enqueue_failed");
 assert.ok(Date.parse(deferred.available_at)>Date.now());
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_job_events WHERE job_id=? AND event_type='job.enqueue_failed'"
 ).get(deferred.job_id).count,1);
 env.AUTOMATION_QUEUE.send=originalSend;
 const replayAfterOutage=batch({run_id:newRun,html_url:"https://github.com/"+repo+"/actions/runs/"+newRun,updated_at:"2026-10-26T15:10:00.000Z"});
 await worker.queue(replayAfterOutage.object,env);
 assert.deepEqual(replayAfterOutage.state,{ack:1,retry:0});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,4);
 assert.equal(queueWrites.length,3,"Replay must not bypass durable retry recovery");

 console.log("HAE_CI_QUEUE_D1_LOCAL_INTEGRATION_PASS",JSON.stringify({
  duplicated_deliveries:2,malformed_source_rejected_without_job:1,
  spoofed_workflow_id_rejected_without_job:1,producer_sha_mismatch_rejected_without_job:1,
  worker_github_fetches:unexpectedFetches,d1_jobs:4,job_created_events:4,
  autonomous_self_work_packets:1,hold_repair_completed:1,patch_proposal_waiting_free_ai:1,
  failed_queue_send_jobs_recoverable:1,conflicting_replays_rejected:1,
  queued_executions:queueWrites.length,external_provider_writes:0,
  real_cloud_runtime_proven:false,producer_snapshot_live_authenticated:false,
  model_cost_usd:0,automatic_repair_allowed:false
 }));
}finally{
 globalThis.fetch=originalFetch;
 raw.close();
}
