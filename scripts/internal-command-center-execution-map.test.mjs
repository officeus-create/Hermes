import assert from "node:assert/strict";
import {
  currentStageForWorkItem,
  developmentCatalog,
  eligibleCapabilitiesForWorkstream,
  executionProjection,
  nextActionForWorkItem,
  stageChainForWorkItem,
} from "../functions/api/_lib/command-center-execution-map.mjs";

const registry=[
  {role_id:"hermes-agent-coordinator",plugin_version:"0.1.71",observed_at:"2026-10-27"},
  {role_id:"hermes-technology-developer",plugin_version:"0.1.56",observed_at:"2026-10-27"},
  {role_id:"hermes-automatic-engineer",plugin_version:"0.1.26",observed_at:"2026-10-27"},
  {role_id:"hermes-qa-evidence-auditor",plugin_version:"0.1.8",observed_at:"2026-10-27"},
  {role_id:"hermes-knowledge-curator",plugin_version:"0.1.81",observed_at:"2026-10-27"},
];

assert.deepEqual(eligibleCapabilitiesForWorkstream("sales",registry).map(x=>x.role_id),["hermes-agent-coordinator"]);
assert.equal(currentStageForWorkItem({status:"in_progress",linked_task_status:"running",linked_task_id:"t1"}),"STARTED");
assert.equal(currentStageForWorkItem({status:"in_progress",linked_task_status:"completed",linked_task_id:"t1"}),"EXECUTED");
assert.equal(currentStageForWorkItem({status:"done",acceptance_status:"accepted",linked_task_status:"completed",linked_task_id:"t1"}),"ACCEPTED");

const chain=stageChainForWorkItem({status:"done",acceptance_status:"accepted",linked_task_status:"completed",linked_task_id:"t1",linked_task_started_at:"2026-10-29T00:00:00Z"});
assert.equal(chain.find(x=>x.stage==="ACCEPTED")?.state,"done");
assert.equal(chain.find(x=>x.stage==="QA_PASS")?.state,"unknown");
assert.equal(chain.find(x=>x.stage==="LIVE")?.state,"unknown");
assert.equal(chain.find(x=>x.stage==="BUSINESS_RESULT")?.state,"unknown");

const projection=executionProjection({
  id:"w1",title:"Ship Command Center",workstream:"technology",priority:"p0",status:"in_progress",acceptance_status:"awaiting",
  linked_task_id:"t1",linked_task_status:"completed",linked_task_agent_role:"software_engineer",
  linked_task_pr_url:"https://github.com/officeus-create/Hermes/pull/2159",
},registry);
assert.equal(projection.work_id,"t1");
assert.equal(projection.executor.plugin_role_id,null);
assert.equal(projection.executor.assignment_truth,"LEGACY_INTERNAL_AI_ROLE");
assert.equal(projection.live_state,"UNKNOWN");
assert.equal(projection.business_result_state,"UNKNOWN");
assert.match(nextActionForWorkItem({status:"in_progress",linked_task_status:"completed"}),/Review the execution evidence/);

const catalog=developmentCatalog({
  registrySnapshot:{source_class:"PRIVATE_PLUGIN_CREATOR_READBACK",entries:registry},
  registryEvidence:{fresh:false},
  processes:[{id:"p1",name:"Search health",role_id:"hermes-search-growth",job_type:"search.snapshot.evaluate",status:"active",next_run_at:null,last_run_at:null,last_job_state:null,last_error_class:null}],
  runner:{online:true,last_seen_at:"2026-10-29T00:00:00Z",operations:{model:"qwen3.5:4b"}},
});
assert.equal(catalog.plugins[0].evidence_state,"STALE_SNAPSHOT");
assert.equal(catalog.automation[0].max_cost_usd,0);
assert.equal(catalog.systems[0].status,"RUNNING");

console.log("INTERNAL_COMMAND_CENTER_EXECUTION_MAP_PASS");
