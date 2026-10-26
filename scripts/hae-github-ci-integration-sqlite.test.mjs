// Hermès HAE #2067: real Worker queue handler + in-memory SQLite D1 analog.
// This is an ISOLATED LOCAL INTEGRATION TEST, never production evidence.
// It proves 2 deliveries of the same verified CI event reserve 1 job,
// enqueue 1 read-only execution, and cannot enable repair or paid inference.
import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import worker from "../workers/automation-engine/src/index.mjs";

const runId=40888881234,runAttempt=1;
const repo="officeus-create/Hermes",head="a".repeat(40),base="b".repeat(40);
const record={
  id:runId, run_attempt:runAttempt, name:"Hermes Automation Engine Contract",
  repository:{full_name:repo},head_repository:{full_name:repo},
  status:"completed",conclusion:"failure",head_sha:head,
  html_url:"https://github.com/"+repo+"/actions/runs/"+runId,
  event:"pull_request",workflow_id:382680939,path:".github/workflows/automation-engine-contract.yml",
  updated_at:"2026-10-26T14:00:00Z",
  pull_requests:[{number:2094,base:{sha:base}}],
};
const calls=[];
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,options)=>{
  calls.push({url:String(url),method:options?.method||"GET"});
  assert.equal(String(url),"https://api.github.com/repos/"+repo+"/actions/runs/"+record.id);
  return {ok:true,json:async()=>structuredClone(record)};
};
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
   for(const stmt of statements)results.push(await stmt.run());
   raw.exec("COMMIT");
   return results;
  }catch(e){raw.exec("ROLLBACK");throw e;}
 },
};
const env={
 DB:db,
 AUTOMATION_QUEUE:{send:async packet=>queueWrites.push(packet)}
};
function batch(){
 const state={ack:0,retry:0};
 return {state,object:{
  queue:"hermes-automation",
  messages:[{
   body:{type:"github.ci.audit",run_id:record.id,run_attempt:runAttempt},
   id:"synthetic_message_id",attempts:1,
   ack(){state.ack++},retry(){state.retry++}
  }]
 }};
}
try{
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
 assert.equal(job.coverage_complete,false);
 assert.equal(job._source.writer_state,"UNVERIFIED");
 assert.equal(job._source.head_sha,head);
 assert.equal(job._source.pr_number,2094);
 assert.equal(job._source.changed_paths_fingerprint,null);
 assert.ok(!rows[0].payload_json.includes("PRIVATE_SECRET"));
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_job_events WHERE event_type='job.created'").get().count,1);
 assert.equal(calls.length,2);
 assert.ok(calls.every(x=>x.method==="GET"),"Only read-only GitHub verification");
 // Same run/attempt with incompatible source snapshot must fail closed;
 // it cannot overwrite the first D1 reservation or enqueue a second job.
 record.updated_at="2026-10-26T15:00:00Z";
 const conflictingReplay=batch();
 await worker.queue(conflictingReplay.object,env);
 assert.deepEqual(conflictingReplay.state,{ack:0,retry:1});
 assert.equal(queueWrites.length,1);
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,1);
 // Independent failure injection: D1 reservation succeeds, but downstream
 // Queue send fails. The event must ACK only after durable RETRY_SCHEDULED,
 // and duplicate source delivery must not enqueue an unleased second job.
 record.id=runId+1;
 record.html_url="https://github.com/"+repo+"/actions/runs/"+record.id;
 record.updated_at="2026-10-26T15:10:00Z";
 const originalSend=env.AUTOMATION_QUEUE.send;
 env.AUTOMATION_QUEUE.send=async()=>{throw Error("synthetic_queue_unavailable");};
 const failedEnqueue=batch();
 await worker.queue(failedEnqueue.object,env);
 assert.deepEqual(failedEnqueue.state,{ack:1,retry:0});
 const deferred=raw.prepare(
   "SELECT job_id,state,last_error_class,available_at FROM hermes_automation_jobs WHERE idempotency_key=?"
 ).get("hae:ci:audit:github-ci:"+(runId+1)+":"+runAttempt+":"+head);
 assert.ok(deferred,"D1 reservation must survive Queue outage");
 assert.equal(deferred.state,"RETRY_SCHEDULED");
 assert.equal(deferred.last_error_class,"job_enqueue_failed");
 assert.ok(Date.parse(deferred.available_at)>Date.now(),"Retry deadline must be in the future");
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_job_events WHERE job_id=? AND event_type='job.enqueue_failed'"
 ).get(deferred.job_id).count,1);
 env.AUTOMATION_QUEUE.send=originalSend;
 const replayAfterOutage=batch();
 await worker.queue(replayAfterOutage.object,env);
 assert.deepEqual(replayAfterOutage.state,{ack:1,retry:0});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,2);
 assert.equal(queueWrites.length,1,"Replay must not bypass durable retry recovery");
 console.log("HAE_CI_QUEUE_D1_LOCAL_INTEGRATION_PASS",JSON.stringify({
  duplicated_deliveries:2,d1_jobs:2,job_created_events:2,
  failed_queue_send_jobs_recoverable:1,conflicting_replays_rejected:1,
  queued_executions:queueWrites.length,external_provider_writes:0,
  real_cloud_runtime_proven:false,authoritative_git_run_authenticated:false,
  model_cost_usd:0,automatic_repair_allowed:false
 }));
}finally{
 globalThis.fetch=originalFetch;
 raw.close();
}
