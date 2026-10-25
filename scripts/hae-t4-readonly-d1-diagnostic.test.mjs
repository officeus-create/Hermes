import assert from "node:assert/strict";
import fs from "node:fs";
import {parseT4ReadbackCommand,classifyT4DlqReceipt,runT4Readback} from "./hae-t4-readonly-d1-diagnostic.mjs";

const sha="e9fab8432dba8c7a0b86699c63acb828007a5eb4";
const id="dlq:"+"b".repeat(32);
const msg="hae.t4.canary.40241242410.1";
const command="HAE_T4_READBACK "+sha+" "+id;
const row={
  dlq_item_id:id,message_type:msg,disposition:"QUARANTINE",reason:"idempotency_key_missing",
  action_status:"QUARANTINED",alert_status:"DELIVERED",alert_attempt_count:1,
  alert_channel:"cloudflare_email",alert_receipt_ref:"cloudflare-email://accepted/"+id,
  alert_provider_message_id:null,redrive_count:0,
};
const db=(results)=>({success:true,result:[{success:true,results}]});
const fail=(fn,reason)=>assert.throws(fn,e=>e.code===reason);
assert.deepEqual(parseT4ReadbackCommand(command),{target_sha:sha,dlq_item_id:id});
for(const v of ["HAE_T4_READBACK "+sha,"HAE_T4_READBACK "+sha+" dlq:bad","HAE_T4_READBACK "+sha+" "+id+"\nanything",
    "HAE_T4_READBACK "+sha.toUpperCase()+" "+id]){
  fail(()=>parseT4ReadbackCommand(v),"t4_readback_command_invalid");
}
const normal=classifyT4DlqReceipt(db([row]),id);
assert.equal(normal.receipt_matches_existing_verifier,true);
assert.equal(normal.alert_attempt_count,1);
assert.equal(normal.receipt_prefix,"accepted");
assert.equal(normal.independent_inbox_verified,false);
assert.ok(!JSON.stringify(normal).includes(row.alert_receipt_ref),"The raw receipt must not enter the public GitHub artifact");
const punctuation=classifyT4DlqReceipt(db([{...row,alert_receipt_ref:"cloudflare-email://message/abc+123@domain.com"}]),id);
assert.equal(punctuation.receipt_prefix,"message");
assert.equal(punctuation.receipt_matches_existing_verifier,false);
assert.equal(punctuation.alert_provider_message_id_present,false);
fail(()=>classifyT4DlqReceipt(db([]),id),"t4_readback_item_missing_or_ambiguous");
fail(()=>classifyT4DlqReceipt(db([row,row]),id),"t4_readback_item_missing_or_ambiguous");
fail(()=>classifyT4DlqReceipt(db([{...row,message_type:"publication.write"}]),id),"t4_readback_source_identity_mismatch");
fail(()=>classifyT4DlqReceipt({success:true,result:[{success:false,results:[row]}]},id),"t4_readback_d1_result_invalid");
const accountId="a".repeat(32),dbId="c".repeat(32);
const trace=[];
const fetchImpl=async(url,request)=>{
  trace.push({url,method:request.method,body:request.body||null});
  if(url.endsWith("/branches/main"))return{ok:true,json:async()=>({commit:{sha}})};
  if(url.endsWith("/pages/projects/hermes"))return{ok:true,json:async()=>({success:true,result:{deployment_configs:{production:{d1_databases:{DB:{id:dbId}}}}}})};
  if(url.endsWith("/d1/database/"+dbId))return{ok:true,json:async()=>({success:true,result:{uuid:dbId,name:"hermes-connect-prototype"}})};
  if(url.endsWith("/d1/database/"+dbId+"/query")){
    const body=JSON.parse(request.body);
    assert.ok(/^SELECT /.test(body.sql));
    assert.deepEqual(body.params,[id]);
    return{ok:true,json:async()=>db([{...row,alert_receipt_ref:"cloudflare-email://message/abc+123@domain.com"}])};
  }
  throw Error("unexpected_network_request");
};
const opts={ownerComment:command,accountId,githubToken:"fake-gh",cloudflareToken:"fake-cf",
  manifest:{baseline_status:"VERIFIED",canonical_database:"hermes-connect-prototype",baseline_source_sha:"f".repeat(40)},fetchImpl};
const result=await runT4Readback(opts);
assert.equal(result.receipt_matches_existing_verifier,false);
assert.equal(result.dlq_item_id,id);
assert.equal(result.main_sha,sha);
assert.equal(trace.length,4);
assert.ok(trace.every(x=>x.method==="GET"||(x.method==="POST"&&x.url.endsWith("/query"))));
assert.equal(trace.filter(x=>x.method==="POST").length,1);
const before=trace.length;
await assert.rejects(()=>runT4Readback({...opts,manifest:{baseline_status:"PENDING"}}),e=>e.code==="t4_readback_preflight_invalid");
assert.equal(trace.length,before);
const src=fs.readFileSync(new URL("./hae-t4-readonly-d1-diagnostic.mjs",import.meta.url),"utf8");
assert.doesNotMatch(src,/\/messages"|\/send_email|sendMessage|wrangler deploy|DELETE FROM |UPDATE hermes_automation_dlq|INSERT INTO /);
console.log("HAE T4 read-only D1 diagnostic PASS: exact identity, 1 SELECT, no Queue/email writes, redacted receipt");
