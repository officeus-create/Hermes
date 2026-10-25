import assert from "node:assert/strict";
import fs from "node:fs";
import {
  parseT4OwnerCommand, buildT4CanaryBody, d1Rows,
  validateT4Heartbeat, validateT4Receipt,
} from "./hae-t4-dlq-canary.mjs";

const sourceSha = "f58eba92af8adac8bf88132c5d795d65df49df96";
const targetSha = "cd61500831a48c9541736ed5357e3bfc57ad8b4a";
const runId = "40241234567";
const attempt = "1";
const messageType = `hae.t4.canary.${runId}.${attempt}`;
const response = (results) => ({ success: true, result: [{ success: true, results }] });
const fail = (fn, code) => assert.throws(fn, (error) => error.code === code);

assert.equal(parseT4OwnerCommand(`HAE_T4_DLQ_CANARY ${targetSha}`), targetSha);
for (const input of [
  `HAE_T4_DLQ_CANARY ${targetSha} extra`,
  `HAE_T4_DLQ_CANARY ${targetSha}\nHAE_VERIFY ${targetSha}`,
  `HAE_T4_DLQ_CANARY ${targetSha.toUpperCase()}`,
  "HAE_T4_DLQ_CANARY ",
]) fail(() => parseT4OwnerCommand(input), "t4_command_invalid");
assert.deepEqual(buildT4CanaryBody(runId, attempt), {body:{type: messageType}});
for (const pair of [["0","1"],["1","0"],["a","1"],["1","100000"],["1","1\nfoo"]]) {
  fail(() => buildT4CanaryBody(...pair), "t4_canary_identity_invalid");
}
fail(() => d1Rows({success:false,result:[{results:[]}]}), "t4_d1_response_invalid");
fail(() => d1Rows({success:true,result:[{results:null}]}), "t4_d1_response_invalid");
const now = Date.parse("2026-10-25T21:17:30.000Z");
const heartbeat = {source_sha: sourceSha, automation_mode:"dry_run", publication_config:"disabled",publication_enabled:0,trigger_type:"cron",observed_at:"2026-10-25T21:17:00.000Z"};
assert.equal(validateT4Heartbeat(response([heartbeat]), sourceSha, now).status, "PASS");
fail(() => validateT4Heartbeat(response([{...heartbeat, source_sha:targetSha}]), sourceSha, now), "t4_heartbeat_runtime_mismatch");
fail(() => validateT4Heartbeat(response([{...heartbeat, publication_enabled:1}]), sourceSha, now), "t4_heartbeat_runtime_mismatch");
fail(() => validateT4Heartbeat(response([{...heartbeat, observed_at:"2026-10-25T15:17:00Z"}]), sourceSha, now), "t4_heartbeat_stale_or_future");
fail(() => validateT4Heartbeat(response([]), sourceSha, now), "t4_heartbeat_missing_or_ambiguous");
const delivered={
  dlq_item_id:"dlq:example-cloudflare-message-1",
  message_type:messageType, disposition:"QUARANTINE", reason:"idempotency_key_missing",
  action_status:"QUARANTINED",alert_status:"DELIVERED",
  alert_attempt_count:1,alert_channel:"cloudflare_email",
  alert_receipt_ref:"cloudflare-email://accepted/dlq:example-cloudflare-message-1",
  redrive_count:0,
};
assert.deepEqual(validateT4Receipt(response([]), messageType),{status:"PENDING"});
assert.equal(validateT4Receipt(response([delivered]), messageType).status,"PASS");
assert.equal(validateT4Receipt(response([{...delivered,alert_status:"PENDING_OWNER_ALERT",alert_attempt_count:0}]), messageType).status,"PENDING");
fail(() => validateT4Receipt(response([delivered,delivered]),messageType),"t4_duplicate_d1_items");
fail(() => validateT4Receipt(response([{...delivered,alert_attempt_count:2}]),messageType),"t4_alert_receipt_invalid");
fail(() => validateT4Receipt(response([{...delivered,redrive_count:1}]),messageType),"t4_receipt_policy_mismatch");
fail(() => validateT4Receipt(response([{...delivered,alert_status:"ALERT_DELIVERY_AMBIGUOUS"}]),messageType),"t4_alert_ambiguous_or_failed");
fail(() => validateT4Receipt(response([{...delivered,alert_channel:"telegram"}]),messageType),"t4_alert_receipt_invalid");
fail(() => validateT4Receipt(response([{...delivered,message_type:"publication.write"}]),messageType),"t4_receipt_identity_mismatch");

// Release is the ONLY producer: the script is pure validation, never Cloudflare/Gmail transport.
const source=fs.readFileSync(new URL("./hae-t4-dlq-canary.mjs",import.meta.url),"utf8");
assert.doesNotMatch(source,/\bfetch\s*\(|\bsend\s*\(|\bspawn\s*\(|\bexec\s*\(/);

const workflow=fs.readFileSync(new URL("../.github/workflows/automation-engine-release.yml",import.meta.url),"utf8");
assert.match(workflow,/t4_dlq_canary:/);
assert.match(workflow,/github\.event\.issue\.number == 2033/);
assert.match(workflow,/github\.actor == 'officeus-create'/);
assert.match(workflow,/startsWith\(github\.event\.comment\.body, 'HAE_T4_DLQ_CANARY '\)/);
assert.match(workflow,/node scripts\\/hae-t4-cloudflare-transport\\.mjs/);
assert.match(workflow,/CLOUDFLARE_HAE_RELEASE_TOKEN/);
assert.doesNotMatch(workflow.slice(workflow.indexOf("  t4_dlq_canary:")), /wrangler@4 deploy/);
const transport=fs.readFileSync(new URL("./hae-t4-cloudflare-transport.mjs",import.meta.url),"utf8");
assert.match(transport,/hermes-automation-dlq/);
assert.match(transport,/validateT4Heartbeat/);
assert.match(transport,/validateT4Receipt/);
assert.match(transport,/cloudflareToken/);
assert.match(transport,/t4_same_run_retry_forbidden/);
assert.match(transport,/t4_queue_send_unconfirmed_no_retry/);
assert.match(transport,/method: "POST"/);

// Fixture: one real DLQ HTTP send, D1 transition to DELIVERED, no source/deploy/provider writes.
const { executeT4Canary }=await import("./hae-t4-cloudflare-transport.mjs");
const accountId="a".repeat(32), dbId="b".repeat(32),queueId="c".repeat(32);
const trace=[];
let sendCount=0, didSend=false;
const fakeFetch=async(url,options={})=>{
  const method=options.method||"GET";
  trace.push({url,method});
  if(url.includes("api.github.com/"))return {ok:true,json:async()=>({commit:{sha:targetSha}})};
  if(url.endsWith("/pages/projects/hermes"))return {ok:true,json:async()=>({success:true,result:{deployment_configs:{production:{d1_databases:{DB:{id:dbId,database_name:"hermes-connect-prototype"}}}}}})};
  if(url.endsWith("/queues"))return {ok:true,json:async()=>({success:true,result:[{queue_name:"hermes-automation-dlq",queue_id:queueId}]})};
  if(url.endsWith("/messages")){
    sendCount++;
    assert.equal(method,"POST");
    assert.deepEqual(JSON.parse(options.body),{body:{type:messageType}});
    didSend=true;
    return {ok:true,json:async()=>({success:true})};
  }
  if(url.endsWith("/query")){
    const q=JSON.parse(options.body);
    if(q.sql.includes("FROM hermes_automation_heartbeats"))return {ok:true,json:async()=>response([heartbeat])};
    if(q.sql.includes("FROM hermes_automation_dlq_items")){
      assert.deepEqual(q.params,[messageType]);
      return {ok:true,json:async()=>response(didSend?[delivered]:[])};
    }
  }
  throw Error("unexpected_api_call");
};
const opts={ownerComment:`HAE_T4_DLQ_CANARY ${targetSha}`,runId,runAttempt:attempt,
  githubToken:"test-github",cloudflareToken:"test-cloudflare",expectedGithubSha:targetSha,
  fetchImpl:fakeFetch,sleepImpl:async()=>{},now:()=>now,accountId,
  manifest:{baseline_status:"VERIFIED",canonical_database:"hermes-connect-prototype",baseline_source_sha:sourceSha,migration_files:[]}};
const successful=await executeT4Canary(opts);
assert.equal(successful.dlq_item_id,delivered.dlq_item_id);
assert.equal(successful.inbox_verified,false);
assert.equal(sendCount,1);
assert.equal(trace.filter(x=>x.url.endsWith("/messages")).length,1);
await assert.rejects(()=>executeT4Canary({...opts,runAttempt:"2"}), e=>e.code==="t4_same_run_retry_forbidden");
assert.equal(sendCount,1);
const ambiguous=async(url,options)=>{
  if(url.endsWith("/messages"))throw Error("ambiguous_send");
  return fakeFetch(url,options);
};
didSend=false;
sendCount=0;
await assert.rejects(()=>executeT4Canary({...opts,fetchImpl:ambiguous}),e=>e.code==="t4_transport_ambiguous_no_retry");
assert.equal(sendCount,0);

console.log("HAE T4 canary contract PASS: strict owner input, one canary, heartbeat gate, quarantine/email receipt, no retry");
