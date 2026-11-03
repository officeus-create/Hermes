import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { selectWorkItemPluginRoute } from "../functions/api/_lib/internal-command-center.mjs";
import { buildCommandCenterHaeJobRequest } from "../functions/api/_lib/command-center-hae-bridge.mjs";

const observedAt="2026-11-03T20:30:00.000Z";
const item={
  id:"hcwi_test_001",
  workstream:"sales",
  priority:"p1",
  status:"ready",
  updated_at:observedAt,
  title:"PRIVATE TITLE MUST NOT ENTER HAE",
  details:"PRIVATE DETAILS MUST NOT ENTER HAE",
};
const route=selectWorkItemPluginRoute(item);
assert.equal(route.owner.role_id,"hermes-agent-coordinator");

const plan=await buildCommandCenterHaeJobRequest(item,route,"aitask_test_001",observedAt);
assert.equal(plan.ok,true);
assert.equal(plan.request.job_type,"work.portfolio.reconcile");
assert.equal(plan.request.business_lane,"automation");
assert.equal(plan.request.policy_version,"command-center-plugin-bridge-v1");
assert.match(plan.request.idempotency_key,/hermes_internal:hcwi_test_001:aitask_test_001/);
assert.equal(plan.request.payload.source_kind,"CHATGPT_SELECTED");
assert.equal(plan.request.payload.coverage_complete,true);
assert.equal(plan.request.payload.tasks.length,1);
assert.equal(plan.request.payload.tasks[0].permission_class,"READ_ONLY");
assert.equal(plan.request.payload.tasks[0].source_ref,"chatgpt-selected://command-center/hcwi_test_001");
const serialized=JSON.stringify(plan.request);
for(const forbidden of [item.title,item.details,"prompt","email","customer_data"]){
  assert.equal(serialized.includes(forbidden),false,"HAE bridge must not persist private free-text field: "+forbidden);
}
assert.equal(plan.expected.role_id,route.owner.role_id);
assert.equal(plan.expected.plugin_version,route.owner.plugin_version);
assert.match(plan.expected.contract_sha,/^[a-f0-9]{64}$/);

const stale=await buildCommandCenterHaeJobRequest(item,{
  ...route,
  owner:{...route.owner,plugin_version:"0.0.0-stale"},
},"aitask_test_001",observedAt);
assert.equal(stale.ok,false);
assert.equal(stale.state,"PLUGIN_ROUTE_VERSION_DRIFT");

const marketingItem={...item,id:"hcwi_marketing",workstream:"marketing",title:"Campaign plan",details:"Generic campaign"};
const marketingRoute=selectWorkItemPluginRoute(marketingItem);
assert.equal(marketingRoute.owner.role_id,"hermes-marketing-growth");
const unsupported=await buildCommandCenterHaeJobRequest(marketingItem,marketingRoute,"aitask_test_002",observedAt);
assert.equal(unsupported.ok,false);
assert.equal(unsupported.state,"PLUGIN_EXECUTION_UNAVAILABLE");
assert.equal(unsupported.reason,"safe_role_contract_mapping_missing");

const endpoint=await readFile(new URL("../functions/api/internal-command-center/work-items/[id].ts",import.meta.url),"utf8");
const helper=await readFile(new URL("../functions/api/_lib/command-center-hae-bridge.mjs",import.meta.url),"utf8");
const schema=await readFile(new URL("../functions/api/_lib/internal-command-center.mjs",import.meta.url),"utf8");
assert.match(endpoint,/action==="execute_plugin"/);
assert.match(endpoint,/readWorkItemPluginRoute\(row\)/);
assert.doesNotMatch(endpoint,/payload\?\.role_id|payload\?\.plugin_version/);
assert.match(helper,/receipt\.external_write===false/);
assert.match(helper,/receipt\.role_contract\?\.role_id===plan\.role_id/);
assert.match(helper,/receipt\.role_contract\?\.plugin_version===plan\.plugin_version/);
assert.match(helper,/receipt\.role_contract\?\.sha256===expectedSha/);
assert.match(schema,/hae_job_id TEXT/);
assert.doesNotMatch(schema,/hae_result_json|plugin_result_json/);

console.log("Command Center HAE plugin receipt bridge: PASS");
