import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildEngineStatus,
  LAUNCHABLE_WORK_ITEMS_SQL,
  ENGINE_CRON_STALE_MS,
  ENGINE_REVENUE_COOLDOWN_MS,
  ENGINE_SOURCE_CONNECTED,
  ENGINE_SOURCE_UNAVAILABLE,
  revenueCooldownCutoff,
} from "../functions/api/_lib/command-center-engine-status.mjs";

const endpointSource=readFileSync(new URL("../functions/api/internal-command-center/execution-map.ts",import.meta.url),"utf8");
const workerSource=readFileSync(new URL("../workers/automation-engine/src/owner-work-runtime.mjs",import.meta.url),"utf8");

// The launch predicate must stay identical to the worker intake predicate.
// If the worker stops picking an item that the Command Center shows as
// launchable, the owner is told a lie about what will run next.
const SHARED_PREDICATE_CLAUSES=[
  "status IN ('ready','planned')",
  "hae_plan_job_id IS NULL OR hae_plan_job_id=''",
  "hae_execution_job_id IS NULL OR hae_execution_job_id=''",
  "hae_dispatch_state IS NULL OR hae_dispatch_state IN ('','RETRY_READY','REVENUE_NEEDS_CAPABILITY','REVENUE_CYCLE_SUCCEEDED')",
  "revenue_status IS NULL OR revenue_status!='active' OR updated_at<=?",
];
for(const clause of SHARED_PREDICATE_CLAUSES){
  assert.ok(workerSource.includes(clause),`worker intake must keep the clause: ${clause}`);
  assert.ok(LAUNCHABLE_WORK_ITEMS_SQL.includes(clause),`Command Center launch predicate must keep the clause: ${clause}`);
}
for(const ordering of ["revenue_status='active'","status WHEN 'ready'","priority WHEN 'p0'","revenue_rank"]){
  assert.ok(LAUNCHABLE_WORK_ITEMS_SQL.includes(ordering),`launch ordering must keep: ${ordering}`);
}

// The owner read model stays owner-gated and stays read-only.
assert.match(endpointSource,/requireInternalOwner\(request, env\)/,"engine status must stay behind the owner gate");
assert.match(endpointSource,/hermes_automation_heartbeats/,"engine status must read the canonical HAE cron heartbeat");
assert.match(endpointSource,/LAUNCHABLE_WORK_ITEMS_SQL/,"engine status must reuse the shared launch predicate");
assert.match(endpointSource,/buildEngineStatus\(/,"engine status must use the shared projection");
assert.doesNotMatch(endpointSource,/payload_json|result_json|evidence_ref|provider_ref/,"engine status must not expose HAE payload/result/provider internals");
assert.doesNotMatch(endpointSource,/reconcileWorkItems\s*\(/,"engine status must not mutate canonical owner work state");

const CHECKED_AT="2026-11-06T20:00:00.000Z";
const freshHeartbeat={
  trigger_type:"cron",
  cron_expression:"*/5 * * * *",
  scheduled_at:"2026-11-06T19:55:00.000Z",
  observed_at:"2026-11-06T19:55:01.000Z",
  execution_lag_ms:1000,
  chicago_slot_key:"2026-11-06T19:00",
  eligible:1,
  source_sha:"c74bc7835c17a30da7ccc4ead8618f0388b90d61",
  automation_mode:"dry_run",
  publication_config:"disabled",
  publication_enabled:0,
};

{
  const status=buildEngineStatus({heartbeat:freshHeartbeat,launchableRows:[],lastJob:null,checkedAt:CHECKED_AT});
  assert.equal(status.source_state,ENGINE_SOURCE_CONNECTED);
  assert.equal(status.cron_alive,true,"a pulse five minutes old is alive");
  assert.equal(status.cron_expression,"*/5 * * * *");
  assert.equal(status.execution_lag_ms,1000);
  assert.equal(status.eligible,true);
  assert.equal(status.automation_mode,"dry_run");
  assert.equal(status.publication_config,"disabled");
  assert.equal(status.publication_enabled,false,"publication stays off while the mode is not live");
  assert.equal(status.deployed_source_sha,"c74bc7835c17a30da7ccc4ead8618f0388b90d61");
  assert.equal(status.launchable_work_items.count,0);
  assert.equal(status.launchable_work_items.next,null);
  assert.equal(status.last_owner_work_job,null);
}

{
  const stale=buildEngineStatus({
    heartbeat:{...freshHeartbeat,scheduled_at:new Date(Date.parse(CHECKED_AT)-ENGINE_CRON_STALE_MS-1000).toISOString()},
    launchableRows:[],lastJob:null,checkedAt:CHECKED_AT,
  });
  assert.equal(stale.cron_alive,false,"a pulse older than the stale window means the engine stopped");
}

{
  const future=buildEngineStatus({
    heartbeat:{...freshHeartbeat,scheduled_at:new Date(Date.parse(CHECKED_AT)+60000).toISOString()},
    launchableRows:[],lastJob:null,checkedAt:CHECKED_AT,
  });
  assert.equal(future.cron_alive,false,"a future-dated pulse is clock skew, not liveness");
}

{
  const missing=buildEngineStatus({heartbeat:null,launchableRows:[],lastJob:null,checkedAt:CHECKED_AT});
  assert.equal(missing.source_state,ENGINE_SOURCE_CONNECTED,"the source is reachable even without a pulse");
  assert.equal(missing.cron_alive,false);
  assert.equal(missing.automation_mode,null);
  assert.equal(missing.deployed_source_sha,null);
}

{
  const unavailable=buildEngineStatus({heartbeat:freshHeartbeat,launchableRows:[],lastJob:null,checkedAt:CHECKED_AT,sourceAvailable:false});
  assert.equal(unavailable.source_state,ENGINE_SOURCE_UNAVAILABLE,"a missing HAE table must stay explicit");
}

{
  const status=buildEngineStatus({
    heartbeat:freshHeartbeat,
    launchableRows:[
      {id:"hcwi_rev4m_w_20261019_015",status:"ready",title:"[REVENUE] Reconcile and finish the 150-task SEO/GEO program",priority:"p0",workstream:"marketing",revenue_gate_usd:1,revenue_target_usd:1,revenue_status:"active",next_action:"Reconcile and finish"},
      {id:"hcwi_hist_ready_002",status:"ready",title:"Second candidate",priority:"p1",workstream:"logistics",revenue_gate_usd:1,revenue_target_usd:37.5,revenue_status:"queued",next_action:"Produce one real paid logistics outcome"},
    ],
    lastJob:{job_id:"job:e1ca350c-dbf0-4dd8-bdf2-0800a281e1fb",job_type:"work.item.plan",state:"WAITING_FREE_AI",current_step:"free_ai",last_error_class:"windows_node_required",attempt_count:0,max_attempts:1,updated_at:"2026-11-06T19:24:42.000Z"},
    checkedAt:CHECKED_AT,
  });
  assert.equal(status.launchable_work_items.count,2);
  assert.equal(status.launchable_work_items.next.id,"hcwi_rev4m_w_20261019_015","the next candidate must be the first row of the shared predicate");
  assert.equal(status.launchable_work_items.next.priority,"p0");
  assert.equal(status.launchable_work_items.next.revenue_gate_usd,1);
  assert.equal(status.last_owner_work_job.state,"WAITING_FREE_AI");
  assert.equal(status.last_owner_work_job.error_class,"windows_node_required");
  assert.equal(status.last_owner_work_job.attempt_count,0,"a parked job must not burn an attempt");
  assert.equal(status.last_owner_work_job.max_attempts,1);
}

{
  const cutoff=revenueCooldownCutoff(CHECKED_AT);
  const expected=new Date(Date.parse(CHECKED_AT)-ENGINE_REVENUE_COOLDOWN_MS).toISOString();
  assert.equal(cutoff,expected,"the revenue cooldown must match the worker cutoff");
}

assert.match(endpointSource,/engine_status/,"the owner read model must expose engine status");
assert.match(endpointSource,/revenueCooldownCutoff\(checkedAt\)/,"the endpoint must bind the same revenue cooldown cutoff as the worker");

console.log("internal command center engine status: OK");
