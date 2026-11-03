import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  claimWindowsNodeJob,
  completeWindowsNodeJob,
  ensureWindowsNodeSchema,
  heartbeatWindowsNode,
  recoverExpiredWindowsNodeLeases,
  WINDOWS_NODE_CONTRACT_VERSION,
  WINDOWS_NODE_ID,
  windowsNodeAuthorized,
  windowsNodeSnapshot,
} from "../workers/automation-engine/src/windows-node-runtime.mjs";
import {
  roleContractForJobType,
  roleContractSha256,
} from "../workers/automation-engine/src/role-contracts.mjs";

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
      for (const statement of statements) out.push(await statement.run());
      this.database.exec("COMMIT");
      return out;
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }
}
const DB=new D1Database();
const TOKEN="windows-node-test-token-with-more-than-32-characters";
const env={DB,HERMES_WINDOWS_NODE_ENABLED:"enabled",HERMES_WINDOWS_NODE_TOKEN:TOKEN};

DB.database.exec(`
CREATE TABLE hermes_automation_jobs (
  job_id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  business_lane TEXT NOT NULL,
  account_key TEXT,
  project_key TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  state TEXT NOT NULL,
  current_step TEXT,
  available_at TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  idempotency_key TEXT NOT NULL UNIQUE,
  policy_version TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT,
  last_error_class TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE TABLE hermes_automation_job_events (
  event_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT NOT NULL,
  step TEXT,
  evidence_ref TEXT,
  provider_ref TEXT,
  error_class TEXT,
  created_at TEXT NOT NULL
);
`);
await ensureWindowsNodeSchema(DB);

const request=(token=TOKEN)=>new Request("https://hae.example/v1/nodes/windows/claim",{headers:{Authorization:`Bearer ${token}`}});
assert.equal(windowsNodeAuthorized(request(),env).ok,true);
assert.equal(windowsNodeAuthorized(request("wrong"),env).status,401);
assert.equal(windowsNodeAuthorized(request(),{...env,HERMES_WINDOWS_NODE_ENABLED:"disabled"}).status,503);

const t0="2026-11-02T18:10:00.000Z";
const heartbeat=await heartbeatWindowsNode(env,{
  node_id:WINDOWS_NODE_ID,
  contract_version:WINDOWS_NODE_CONTRACT_VERSION,
  model:"qwen2.5:1.5b-instruct",
  status:"IDLE",
},t0);
assert.equal(heartbeat.status,"HEARTBEAT_ACCEPTED");
let snapshot=await windowsNodeSnapshot(env);
assert.equal(snapshot.node_id,WINDOWS_NODE_ID);
assert.equal(snapshot.production_write_authorized,false);
assert.equal(snapshot.inbound_exposure_required,false);

const semanticContract=roleContractForJobType("search.defect.prioritize");
assert.ok(semanticContract);
const contractSha=await roleContractSha256(semanticContract);
const payload={
  parent_job_id:"job:parent-search",
  defects:[{defect_type:"http_error",url:"https://hermeslogisticsus.com/load-board/"}],
  _role_contract:{
    role_id:semanticContract.role_id,
    plugin_version:semanticContract.plugin_version,
    contract_version:semanticContract.contract_version,
    sha256:contractSha,
  },
};
await DB.prepare(`INSERT INTO hermes_automation_jobs
(job_id,job_type,business_lane,priority,state,current_step,available_at,attempt_count,max_attempts,idempotency_key,policy_version,payload_json,created_at,updated_at)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
  "job:semantic-1","search.defect.prioritize","search",80,"WAITING_FREE_AI","free_ai",t0,0,1,
  "idem:semantic-1","hae-free-ai-v1",JSON.stringify(payload),t0,t0
).run();
await DB.prepare(`INSERT INTO hermes_automation_jobs
(job_id,job_type,business_lane,priority,state,current_step,available_at,attempt_count,max_attempts,idempotency_key,policy_version,payload_json,created_at,updated_at)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
  "job:nonsemantic","system.health.snapshot","automation",100,"WAITING_FREE_AI","free_ai",t0,0,1,
  "idem:nonsemantic","hae-readonly-v1","{}",t0,t0
).run();

await DB.prepare(`INSERT INTO hermes_automation_jobs
(job_id,job_type,business_lane,priority,state,current_step,available_at,attempt_count,max_attempts,idempotency_key,policy_version,payload_json,created_at,updated_at)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
  "job:wrong-lane","search.defect.prioritize","automation",95,"WAITING_FREE_AI","free_ai",t0,0,1,
  "idem:wrong-lane","hae-free-ai-v1",JSON.stringify(payload),t0,t0
).run();

const claim=await claimWindowsNodeJob(env,{
  node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,model:"qwen2.5:1.5b-instruct",
},t0);
assert.equal(claim.status,"LEASE_ACCEPTED");
assert.equal(claim.lease.job_id,"job:semantic-1");
assert.equal(claim.lease.role_contract.semantic_required,true);
assert.equal(claim.lease.role_contract.permission_class,"READ_ONLY");
assert.equal(claim.lease.role_contract.max_cost_usd,0);
assert.equal(claim.lease.node_id,WINDOWS_NODE_ID);
assert.ok(claim.lease.semantic_request.system_prompt);
assert.ok(claim.lease.semantic_request.user_prompt);
let nonsemantic=await DB.prepare("SELECT state FROM hermes_automation_jobs WHERE job_id='job:nonsemantic'").first();
assert.equal(nonsemantic.state,"WAITING_FREE_AI");

const wrongLane=await DB.prepare("SELECT state FROM hermes_automation_jobs WHERE job_id='job:wrong-lane'").first();
assert.equal(wrongLane.state,"WAITING_FREE_AI","same job type in the wrong business lane must never be leased");

const replayClaim=await claimWindowsNodeJob(env,{
  node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,model:"qwen2.5:1.5b-instruct",
},new Date(Date.parse(t0)+1000).toISOString());
assert.equal(replayClaim.status,"LEASE_REPLAY");
assert.equal(replayClaim.lease.lease_id,claim.lease.lease_id);
assert.equal(replayClaim.lease.fence,claim.lease.fence);

const semanticResult={
  priorities:[{
    url:"https://hermeslogisticsus.com/load-board/",
    defect_type:"http_error",
    priority:90,
    reason:"HTTP failure blocks reliable discovery.",
    next_action:"Recheck the public URL and repair the HTTP defect before promotion.",
  }],
};

await assert.rejects(
  ()=>completeWindowsNodeJob(env,{
    node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,
    job_id:claim.lease.job_id,lease_id:claim.lease.lease_id,fence:claim.lease.fence+1,
    model:"qwen2.5:1.5b-instruct",cost_usd:0,semantic_result:semanticResult,
    usage:{input_chars:100,output_chars:200},
  },new Date(Date.parse(t0)+2000).toISOString()),
  /windows_node_stale_fence/
);
await assert.rejects(
  ()=>completeWindowsNodeJob(env,{
    node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,
    job_id:claim.lease.job_id,lease_id:claim.lease.lease_id,fence:claim.lease.fence,
    model:"qwen2.5:1.5b-instruct",cost_usd:0.01,semantic_result:semanticResult,
    usage:{input_chars:100,output_chars:200},
  },new Date(Date.parse(t0)+2000).toISOString()),
  /windows_node_paid_inference_forbidden/
);

const completed=await completeWindowsNodeJob(env,{
  node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,
  job_id:claim.lease.job_id,lease_id:claim.lease.lease_id,fence:claim.lease.fence,
  model:"qwen2.5:1.5b-instruct",cost_usd:0,semantic_result:semanticResult,
  usage:{input_tokens:20,output_tokens:30,input_chars:100,output_chars:200},
},new Date(Date.parse(t0)+3000).toISOString());
assert.equal(completed.status,"SUCCEEDED");
assert.equal(completed.result.external_write,false);
assert.equal(completed.result.semantic_execution.provider_id,"viktor-windows-ollama");
assert.equal(completed.result.semantic_execution.cost_usd,0);
let job=await DB.prepare("SELECT state,current_step,result_json,attempt_count FROM hermes_automation_jobs WHERE job_id=?").bind(claim.lease.job_id).first();
assert.equal(job.state,"SUCCEEDED");
assert.equal(job.current_step,"complete");
assert.equal(job.attempt_count,0);
assert.equal(JSON.parse(job.result_json).result.prioritized_defect_count,1);
let usageRows=await DB.prepare("SELECT * FROM hermes_automation_ai_usage WHERE job_id=?").bind(claim.lease.job_id).all();
assert.equal(usageRows.results.length,1);
assert.equal(usageRows.results[0].cost_usd,0);
let successEvents=await DB.prepare("SELECT * FROM hermes_automation_job_events WHERE job_id=? AND event_type='job.windows_node_succeeded'").bind(claim.lease.job_id).all();
assert.equal(successEvents.results.length,1);

canonicalSuccessEvents=await DB.prepare("SELECT * FROM hermes_automation_job_events WHERE job_id=? AND event_type='job.succeeded'").bind(claim.lease.job_id).all();
assert.equal(canonicalSuccessEvents.results.length,1);

let canonicalSuccessEvents=await DB.prepare("SELECT * FROM hermes_automation_job_events WHERE job_id=? AND event_type='job.succeeded'").bind(claim.lease.job_id).all();
assert.equal(canonicalSuccessEvents.results.length,1,"Windows semantic completion must emit the canonical durable success event");

const replayComplete=await completeWindowsNodeJob(env,{
  node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,
  job_id:claim.lease.job_id,lease_id:claim.lease.lease_id,fence:claim.lease.fence,
  model:"qwen2.5:1.5b-instruct",cost_usd:0,semantic_result:semanticResult,
  usage:{input_tokens:20,output_tokens:30,input_chars:100,output_chars:200},
},new Date(Date.parse(t0)+4000).toISOString());
assert.equal(replayComplete.status,"IDEMPOTENT_REPLAY");
usageRows=await DB.prepare("SELECT * FROM hermes_automation_ai_usage WHERE job_id=?").bind(claim.lease.job_id).all();
assert.equal(usageRows.results.length,1);
successEvents=await DB.prepare("SELECT * FROM hermes_automation_job_events WHERE job_id=? AND event_type='job.windows_node_succeeded'").bind(claim.lease.job_id).all();
assert.equal(successEvents.results.length,1);

await assert.rejects(
  ()=>completeWindowsNodeJob(env,{
    node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,
    job_id:claim.lease.job_id,lease_id:claim.lease.lease_id,fence:claim.lease.fence,
    model:"qwen2.5:1.5b-instruct",cost_usd:0,
    semantic_result:{priorities:[]},
    usage:{input_chars:100,output_chars:20},
  },new Date(Date.parse(t0)+5000).toISOString()),
  /windows_node_output_replay_mismatch/
);

await DB.prepare(`INSERT INTO hermes_automation_jobs
(job_id,job_type,business_lane,priority,state,current_step,available_at,attempt_count,max_attempts,idempotency_key,policy_version,payload_json,created_at,updated_at)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
  "job:semantic-expire","search.defect.prioritize","search",80,"WAITING_FREE_AI","free_ai",t0,0,1,
  "idem:semantic-expire","hae-free-ai-v1",JSON.stringify(payload),t0,t0
).run();
const claim2=await claimWindowsNodeJob(env,{
  node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,model:"qwen2.5:1.5b-instruct",
},new Date(Date.parse(t0)+6000).toISOString());
assert.equal(claim2.status,"LEASE_ACCEPTED");
assert.equal(claim2.lease.job_id,"job:semantic-expire");

await DB.prepare("UPDATE hermes_automation_node_leases SET state='COMPLETING' WHERE job_id=? AND state='ACTIVE'")
  .bind(claim2.lease.job_id).run();
const completingClaim=await claimWindowsNodeJob(env,{
  node_id:WINDOWS_NODE_ID,contract_version:WINDOWS_NODE_CONTRACT_VERSION,model:"qwen2.5:1.5b-instruct",
},new Date(Date.parse(t0)+7000).toISOString());
assert.equal(completingClaim.status,"LEASE_COMPLETING","COMPLETING must fence the node from a second lease");
assert.equal(completingClaim.lease,null);

const afterExpiry=new Date(Date.parse(claim2.lease.lease_until)+1000).toISOString();
const recovered=await recoverExpiredWindowsNodeLeases(DB,afterExpiry);
assert.equal(recovered,1);
const expiredJob=await DB.prepare("SELECT state,current_step,attempt_count,last_error_class FROM hermes_automation_jobs WHERE job_id=?").bind(claim2.lease.job_id).first();
assert.equal(expiredJob.state,"WAITING_FREE_AI");
assert.equal(expiredJob.current_step,"free_ai");
assert.equal(expiredJob.attempt_count,0);
assert.equal(expiredJob.last_error_class,"windows_node_lease_expired");
const expiredLease=await DB.prepare("SELECT state FROM hermes_automation_node_leases WHERE job_id=?").bind(claim2.lease.job_id).first();
assert.equal(expiredLease.state,"EXPIRED");

const expiredEvent=await DB.prepare("SELECT * FROM hermes_automation_job_events WHERE job_id=? AND event_type='job.windows_node_lease_expired'").bind(claim2.lease.job_id).all();
assert.equal(expiredEvent.results.length,1,"expired COMPLETING lease must recover the canonical job without deadlocking the node");

console.log("HAE Windows semantic node canary: PASS");
