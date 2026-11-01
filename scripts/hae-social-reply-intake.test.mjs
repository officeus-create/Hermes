import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  createSocialReplyPrepareIntake,
  ensureSocialReplyIntakeSchema,
} from "../src/lib/hae-social-reply-intake.mjs";
import { drainSocialReplyPrepareIntake } from "../workers/automation-engine/src/social-reply-intake-runtime.mjs";

class Statement{
  constructor(stmt,args=[]){this.stmt=stmt;this.args=args}
  bind(...args){return new Statement(this.stmt,args)}
  async run(){const info=this.stmt.run(...this.args);return{success:true,meta:{changes:Number(info.changes??0)}}}
  async first(){return this.stmt.get(...this.args)??null}
  async all(){return{results:this.stmt.all(...this.args)}}
}
const sqlite=new DatabaseSync(":memory:");
const db={prepare:sql=>new Statement(sqlite.prepare(sql))};
await ensureSocialReplyIntakeSchema(db);

const base={
  business_lane:"PROGRESSOPRO",
  reply_to_id:"18180000000000001",
  root_post_id:"18170000000000001",
  text:"Thanks — I can help with that.",
  requested_by:"owner-test",
};
const key="hae:social:reply:prepare:progressopro:18180000000000001:abc123def4567890";
const first=await createSocialReplyPrepareIntake(db,base,{idempotencyKey:key,now:"2026-11-01T19:00:00Z"});
assert.equal(first.duplicate,false);
assert.equal(first.status,"PENDING");
const duplicate=await createSocialReplyPrepareIntake(db,base,{idempotencyKey:key,now:"2026-11-01T19:01:00Z"});
assert.equal(duplicate.duplicate,true);
assert.equal(duplicate.request_id,first.request_id);

const queueWrites=[];
const createCalls=[];
const env={DB:db,AUTOMATION_QUEUE:{send:async packet=>queueWrites.push(packet)}};
const createJob=async(_env,input)=>{
  createCalls.push(input);
  return{job:{job_id:"haej_social_reply_prepare_1"}};
};
const drained=await drainSocialReplyPrepareIntake(env,{createJob});
assert.equal(drained,1);
assert.equal(createCalls.length,1);
assert.equal(createCalls[0].job_type,"social.reply.prepare");
assert.equal(createCalls[0].max_attempts,1);
assert.equal(createCalls[0].internal_submission,true);
assert.equal(createCalls[0].payload.approval_class,"OWNER_APPROVED");
assert.equal(createCalls[0].payload.source,"threads_owned_reply");
assert.equal(queueWrites.length,0,"drain delegates Queue ownership to canonical createGenericJob");
const row=sqlite.prepare("SELECT status,job_id,last_error_class FROM hermes_automation_social_reply_intake WHERE request_id=?").get(first.request_id);
assert.equal(row.status,"QUEUED");
assert.equal(row.job_id,"haej_social_reply_prepare_1");
assert.equal(row.last_error_class,null);

const replay=await drainSocialReplyPrepareIntake(env,{createJob});
assert.equal(replay,0);
assert.equal(createCalls.length,1);

await assert.rejects(
  ()=>createSocialReplyPrepareIntake(db,{...base,business_lane:"ACADEMY"},{idempotencyKey:key+":bad"}),
  /social_business_lane_invalid/
);
await assert.rejects(
  ()=>createSocialReplyPrepareIntake(db,{...base,text:"x".repeat(501)},{idempotencyKey:key+":long"}),
  /social_reply_text_invalid/
);

sqlite.close();
console.log("HAE social reply intake PASS — D1 owner intake -> HAE createJob, duplicate suppressed, no direct Pages runtime handoff");
