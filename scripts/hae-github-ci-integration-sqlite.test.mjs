// Hermès HAE #2067: real Worker queue handler + in-memory SQLite D1 analog.
// This is an ISOLATED LOCAL INTEGRATION TEST, never production evidence.
// It proves 2 deliveries of the same verified CI event reserve 1 job,
// enqueue 1 read-only execution, establish a D1-backed clear HAE writer lease, and create no paid inference.
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
const commitRecord={
 sha:head,
 files:[
  {filename:"workers/automation-engine/capability-policy.json"},
  {filename:"scripts/automation-engine-capability-policy.test.mjs"},
 ],
};
const calls=[];
let githubApiUnavailable=true;
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,options)=>{
  const value=String(url);
  calls.push({url:value,method:options?.method||"GET"});
  if(githubApiUnavailable)return {ok:false,status:403};
  if(value==="https://api.github.com/repos/"+repo+"/actions/runs/"+record.id)
    return {ok:true,json:async()=>structuredClone(record)};
  if(value==="https://api.github.com/repos/"+repo+"/commits/"+head)
    return {ok:true,json:async()=>structuredClone(commitRecord)};
  throw Error("unexpected_github_read:"+value);
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
   for(const stmt of statements){
    const result=await stmt.run();
    // Cloudflare D1 batch returns per-statement meta.changes; SQLite's native
    // adapter exposes changes directly. Mirror D1 so state-transition CAS is real.
    results.push({...result,meta:{changes:Number(result?.changes||0)}});
   }
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
 // Failure-injection gate: an upstream GitHub 403/rate-limit must NOT
 // create a D1 job or enqueue execution. Retry the source message only;
 // the next successful read of the same immutable run may then proceed.
 const githubUnavailable=batch();
 await worker.queue(githubUnavailable.object,env);
 assert.deepEqual(githubUnavailable.state,{ack:0,retry:1});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,0);
 assert.equal(queueWrites.length,0);
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_runtime_events WHERE event_type='queue.message_retry' AND error_class='github_ci_source_http_not_ok'"
 ).get().count,1);
 githubApiUnavailable=false;
 // A GitHub HTTP 200 response is not sufficient evidence: a run whose
 // head repository differs from the allowlisted repository must retry/HOLD
 // without reserving a D1 job or sending a downstream Queue message.
 record.head_repository.full_name="untrusted/fork";
 const spoofedSource=batch();
 await worker.queue(spoofedSource.object,env);
 assert.deepEqual(spoofedSource.state,{ack:0,retry:1});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,0);
 assert.equal(queueWrites.length,0);
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_runtime_events WHERE event_type='queue.message_retry' AND error_class='github_ci_source_evidence_mismatch'"
 ).get().count,1);
 // A forged workflow with the same display name and path but a different
 // GitHub workflow ID must not create a D1 reservation or Queue execution.
 record.head_repository.full_name=repo;
 record.workflow_id=999999999;
 const wrongWorkflowId=batch();
 await worker.queue(wrongWorkflowId.object,env);
 assert.deepEqual(wrongWorkflowId.state,{ack:0,retry:1});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,0);
 assert.equal(queueWrites.length,0);
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_runtime_events WHERE event_type='queue.message_retry' AND error_class='github_ci_source_evidence_mismatch'"
 ).get().count,2);
 record.workflow_id=382680939;
 // GitHub reruns must not be substituted for a different Queue attempt.
 // Verify the actual Worker handler retries/HOLDs without a D1 reservation.
 record.run_attempt=runAttempt+1;
 const mismatchedAttempt=batch();
 await worker.queue(mismatchedAttempt.object,env);
 assert.deepEqual(mismatchedAttempt.state,{ack:0,retry:1});
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,0);
 assert.equal(queueWrites.length,0);
 assert.equal(raw.prepare(
   "SELECT COUNT(*) AS count FROM hermes_automation_runtime_events WHERE event_type='queue.message_retry' AND error_class='github_ci_source_evidence_mismatch'"
 ).get().count,3);
 record.run_attempt=runAttempt;
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
 assert.match(job._source.changed_paths_fingerprint,/^sha256:[a-f0-9]{64}$/);
 assert.equal(job._source.changed_path_count,2);
 assert.ok(!rows[0].payload_json.includes("PRIVATE_SECRET"));
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_job_events WHERE event_type='job.created'").get().count,1);
 assert.equal(calls.length,8);
 assert.ok(calls.every(x=>x.method==="GET"),"Only read-only GitHub verification");

 // Execute the autonomously created audit job. Complete verified CI coverage +
 // the D1-backed clear HAE writer lease must deterministically create exactly
 // one stable HAE-SELF repair packet, still with zero source writes.
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
 assert.equal(repairPayload.artifact_key,"github-workflow:382680939");

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

 // Same run/attempt with incompatible source snapshot must fail closed;
 // it cannot overwrite the first D1 reservation or enqueue a second job.
 record.updated_at="2026-10-26T15:00:00Z";
 const conflictingReplay=batch();
 await worker.queue(conflictingReplay.object,env);
 assert.deepEqual(conflictingReplay.state,{ack:0,retry:1});
 assert.equal(queueWrites.length,2);
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,2);
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
 assert.equal(raw.prepare("SELECT COUNT(*) AS count FROM hermes_automation_jobs").get().count,3);
 assert.equal(queueWrites.length,2,"Replay must not bypass durable retry recovery");
 console.log("HAE_CI_QUEUE_D1_LOCAL_INTEGRATION_PASS",JSON.stringify({
  duplicated_deliveries:2,github_api_403_retried_without_job:1,spoofed_head_repo_rejected_without_job:1,spoofed_workflow_id_rejected_without_job:1,
  d1_jobs:3,job_created_events:3,autonomous_self_work_packets:1,hold_repair_completed:1,
  failed_queue_send_jobs_recoverable:1,conflicting_replays_rejected:1,
  queued_executions:queueWrites.length,external_provider_writes:0,
  real_cloud_runtime_proven:false,authoritative_git_run_authenticated:false,
  model_cost_usd:0,automatic_repair_allowed:false
 }));
}finally{
 globalThis.fetch=originalFetch;
 raw.close();
}
