import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  enqueueNextOwnerWorkPlan,
  ensureOwnerWorkRuntimeSchema,
  ownerWorkRuntimeSnapshot,
  reconcileOwnerWorkRuntime,
} from "../workers/automation-engine/src/owner-work-runtime.mjs";

class D1Statement {
  constructor(sql, statement) { this.sql=sql; this.statement=statement; this.values=[]; }
  bind(...values) { this.values=values; return this; }
  async run() { const result=this.statement.run(...this.values); return { meta:{ changes:Number(result.changes||0) } }; }
  async first() { return this.statement.get(...this.values) || null; }
  async all() { return { results:this.statement.all(...this.values) }; }
}
class D1Database {
  constructor() { this.database=new DatabaseSync(":memory:"); }
  prepare(sql) { return new D1Statement(sql,this.database.prepare(sql)); }
  async batch(statements) {
    this.database.exec("BEGIN");
    try {
      const out=[];
      for(const statement of statements) out.push(await statement.run());
      this.database.exec("COMMIT");
      return out;
    } catch(error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }
}

const DB=new D1Database();
DB.database.exec(`
CREATE TABLE hermes_automation_jobs (
  job_id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  state TEXT NOT NULL,
  result_json TEXT,
  last_error_class TEXT
);
`);
await ensureOwnerWorkRuntimeSchema(DB);

const seeded=await DB.prepare("SELECT COUNT(*) AS count FROM hermes_owner_work_items").first();
assert.ok(Number(seeded.count)>=50,"historical Command Center backlog must be available to HAE without a ChatGPT scheduler");
await DB.prepare("UPDATE hermes_owner_work_items SET status='done',acceptance_status='accepted'").run();

const now="2026-11-05T21:30:00.000Z";
await DB.prepare(`
INSERT INTO hermes_owner_work_items
(id,organization_scope,workstream,priority,title,details,source,status,created_by,created_at,updated_at,project_id,source_kind,source_label,next_action)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`).bind(
  "hcwi_test_runtime_001","hermes_internal","technology","p1",
  "Continue the Command Center autonomous runtime",
  "Use the existing HAE control plane and local zero-cost semantic node.",
  "imported","ready","test",now,now,"hermes-command-center","history","canonical owner backlog",
  "Route this work through HAE without ChatGPT or Codex runtime."
).run();

let counter=0;
const created=[];
async function createJob(env,input){
  counter+=1;
  const jobId=`job:test-${counter}`;
  created.push({jobId,input});
  await env.DB.prepare("INSERT INTO hermes_automation_jobs (job_id,job_type,state,result_json,last_error_class) VALUES (?,?,?,?,NULL)")
    .bind(jobId,input.job_type,"QUEUED",null).run();
  return {created:true,duplicate:false,job:{job_id:jobId,state:"QUEUED"}};
}
const env={DB};

const queued=await enqueueNextOwnerWorkPlan(env,new Date(now),{createJob});
assert.equal(queued.status,"PLAN_QUEUED");
assert.equal(queued.work_id,"hcwi_test_runtime_001");
assert.equal(created[0].input.job_type,"work.item.plan");
assert.equal(created[0].input.internal_submission,true);
assert.equal(created[0].input.max_attempts,1);
assert.equal(created[0].input.payload.work_id,"hcwi_test_runtime_001");
assert.equal(created[0].input.payload.selected_owner_role,"hermes-technology-developer");

let work=await DB.prepare("SELECT * FROM hermes_owner_work_items WHERE id=?").bind("hcwi_test_runtime_001").first();
assert.equal(work.status,"in_progress");
assert.equal(work.hae_plan_job_id,queued.job_id);
assert.equal(work.hae_job_id,queued.job_id);
assert.equal(work.hae_dispatch_state,"PLAN_QUEUED");

const snapshot=await ownerWorkRuntimeSnapshot(DB);
assert.equal(snapshot.chatgpt_runtime_required,false);
assert.equal(snapshot.codex_runtime_required,false);
assert.equal(snapshot.execution_owner,"HAE");
assert.equal(snapshot.semantic_node,"VIKTOR-WINDOWS");

const planResult={
  capability:"work.item.plan",
  external_write:false,
  result:{
    work_id:"hcwi_test_runtime_001",
    disposition:"EXECUTE_EXISTING_CAPABILITY",
    recommended_job_type:"ai.gateway.readiness.audit",
    rationale:"A bounded read-only HAE capability already exists.",
    next_action:"Run the existing readiness audit and keep its D1 receipt.",
  },
};
await DB.prepare("UPDATE hermes_automation_jobs SET state='SUCCEEDED',result_json=? WHERE job_id=?")
  .bind(JSON.stringify(planResult),queued.job_id).run();

const deps={
  createJob,
  buildPayload:async(_env,contract)=>({
    binding_ready:false,
    gateway_id_present:false,
    free_provider_ready:false,
    paid_fallback_enabled:false,
    budget_usd:0,
    owner_work_test_contract:contract.job_type,
  }),
  contractForJobType:(jobType)=>jobType==="ai.gateway.readiness.audit"?{
    job_type:jobType,business_lane:"automation",permission_class:"READ_ONLY",semantic_required:false,
  }:null,
};
await reconcileOwnerWorkRuntime(env,new Date(Date.parse(now)+60_000),deps);
assert.equal(created.length,2);
assert.equal(created[1].input.job_type,"ai.gateway.readiness.audit");
assert.equal(created[1].input.payload.owner_work_id,"hcwi_test_runtime_001");
assert.equal(created[1].input.internal_submission,true);

work=await DB.prepare("SELECT * FROM hermes_owner_work_items WHERE id=?").bind("hcwi_test_runtime_001").first();
assert.equal(work.hae_execution_job_id,created[1].jobId);
assert.equal(work.hae_job_id,created[1].jobId);
assert.equal(work.hae_dispatch_state,"EXECUTION_QUEUED");

await DB.prepare("UPDATE hermes_automation_jobs SET state='SUCCEEDED',result_json=? WHERE job_id=?")
  .bind(JSON.stringify({capability:"ai.gateway.readiness.audit",external_write:false,result:{ready:false}}),created[1].jobId).run();
await reconcileOwnerWorkRuntime(env,new Date(Date.parse(now)+120_000),deps);
work=await DB.prepare("SELECT * FROM hermes_owner_work_items WHERE id=?").bind("hcwi_test_runtime_001").first();
assert.equal(work.status,"in_progress");
assert.equal(work.acceptance_status,"awaiting");
assert.equal(work.hae_dispatch_state,"EXECUTION_SUCCEEDED");

const revenueOld="2026-11-05T10:00:00.000Z";
await DB.prepare(`
INSERT INTO hermes_owner_work_items
(id,organization_scope,workstream,priority,title,details,source,status,created_by,created_at,updated_at,project_id,source_kind,source_label,next_action,
 revenue_gate_usd,revenue_target_usd,revenue_actual_usd,revenue_rank,revenue_status,revenue_source_work_id)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`).bind(
  "hcwi_test_revenue_001","hermes_internal","sales","p2",
  "[REVENUE] Website Pricing & Sales System",
  "Keep working until verified paid revenue is at least one dollar.",
  "imported","ready","test",revenueOld,revenueOld,"revenue-website-progresso","one_brain_revenue_4m","REVENUE_4M_BACKLOG",
  "Advance the smallest safe revenue step.",1,990,0,1,"active","W-TEST-REVENUE"
).run();

const revenueQueued=await enqueueNextOwnerWorkPlan(env,new Date(Date.parse(now)+180_000),{createJob});
assert.equal(revenueQueued.work_id,"hcwi_test_revenue_001","active revenue mission must outrank ordinary technical backlog");
await DB.prepare("UPDATE hermes_automation_jobs SET state='SUCCEEDED',result_json=? WHERE job_id=?")
  .bind(JSON.stringify({
    capability:"work.item.plan",external_write:false,
    result:{work_id:"hcwi_test_revenue_001",disposition:"NEEDS_CAPABILITY",recommended_job_type:null,
      rationale:"No bounded sales capability exists yet.",next_action:"Create the smallest safe quote-preparation capability."}
  }),revenueQueued.job_id).run();
await reconcileOwnerWorkRuntime(env,new Date(Date.parse(now)+240_000),deps);
let revenueWork=await DB.prepare("SELECT * FROM hermes_owner_work_items WHERE id=?").bind("hcwi_test_revenue_001").first();
assert.equal(revenueWork.status,"ready","revenue mission must remain open when no money was earned");
assert.equal(revenueWork.hae_dispatch_state,"REVENUE_NEEDS_CAPABILITY");
assert.equal(revenueWork.hae_plan_job_id,null,"revenue mission must be retryable after bounded capability improvement");
const tooSoon=await enqueueNextOwnerWorkPlan(env,new Date(Date.parse(now)+60*60*1000),{createJob});
assert.equal(tooSoon.status,"NO_READY_OWNER_WORK","revenue loop must not spin every five minutes");
const revenueRetry=await enqueueNextOwnerWorkPlan(env,new Date(Date.parse(now)+7*60*60*1000),{createJob});
assert.equal(revenueRetry.work_id,"hcwi_test_revenue_001","unfinished revenue mission must retry after the bounded cooldown");
await DB.prepare("UPDATE hermes_owner_work_items SET status='done',revenue_status='proven',revenue_actual_usd=1 WHERE id=?").bind("hcwi_test_revenue_001").run();

await DB.prepare(`
INSERT INTO hermes_owner_work_items
(id,organization_scope,workstream,priority,title,details,source,status,created_by,created_at,updated_at,project_id,source_kind,source_label,next_action)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`).bind(
  "hcwi_test_sensitive_002","hermes_internal","technology","p0",
  "Unsafe token ghp_12345678901234567890",
  "Must fail closed before local semantic execution.",
  "imported","ready","test",now,now,"hermes-command-center","history","canonical owner backlog","Do not expose secrets."
).run();
await assert.rejects(
  ()=>enqueueNextOwnerWorkPlan(env,new Date(Date.parse(now)+180_000),{createJob}),
  /owner_work_sensitive_or_invalid/
);
const sensitive=await DB.prepare("SELECT hae_dispatch_state FROM hermes_owner_work_items WHERE id=?").bind("hcwi_test_sensitive_002").first();
assert.equal(sensitive.hae_dispatch_state,"RETRY_READY");

console.log("HAE autonomous owner work runtime: PASS");
