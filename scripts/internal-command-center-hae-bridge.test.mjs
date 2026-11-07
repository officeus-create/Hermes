import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { selectWorkItemPluginRoute } from "../functions/api/_lib/internal-command-center.mjs";
import { buildCommandCenterHaeJobRequest, readCommandCenterHaeExecution, resetCommandCenterHaeReadbackCache, submitCommandCenterHaeExecution } from "../functions/api/_lib/command-center-hae-bridge.mjs";
import { verifyCommandCenterHaeReceipt } from "../functions/api/_lib/command-center-hae-receipt-verifier.mjs";
import { pluginRuntimeRegistrySnapshot } from "../workers/automation-engine/src/plugin-runtime-registry.mjs";
import { roleContractForJobType } from "../workers/automation-engine/src/role-contracts.mjs";

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
assert.match(plan.request.idempotency_key,/^hae:cc:v1:[a-f0-9]{64}$/);
assert.equal(plan.request.idempotency_key.includes(item.id),false);
assert.equal(plan.request.idempotency_key.includes("aitask_test_001"),false);
const replayPlan=await buildCommandCenterHaeJobRequest(item,route,"aitask_test_001",observedAt);
assert.equal(replayPlan.request.idempotency_key,plan.request.idempotency_key);
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
const marketingPlan=await buildCommandCenterHaeJobRequest(marketingItem,marketingRoute,"aitask_test_002",observedAt);
assert.equal(marketingPlan.ok,true);
assert.equal(marketingPlan.request.job_type,"work.portfolio.marketing.reconcile");
assert.equal(marketingPlan.expected.role_id,"hermes-marketing-growth");
assert.equal(marketingPlan.expected.plugin_version,marketingRoute.owner.plugin_version);
assert.equal(marketingPlan.request.payload.tasks[0].permission_class,"READ_ONLY");
assert.equal(JSON.stringify(marketingPlan.request).includes(marketingItem.title),false);
const unsupportedItem={...item,id:"hcwi_technology",workstream:"technology"};
const unsupportedRoute=selectWorkItemPluginRoute(unsupportedItem);
const unsupported=await buildCommandCenterHaeJobRequest(unsupportedItem,unsupportedRoute,"aitask_test_003",observedAt);
assert.equal(unsupported.ok,false);
assert.equal(unsupported.state,"PLUGIN_EXECUTION_UNAVAILABLE");
assert.equal(unsupported.reason,"safe_role_contract_mapping_missing");

const endpoint=await readFile(new URL("../functions/api/internal-command-center/work-items/[id].ts",import.meta.url),"utf8");
const helper=await readFile(new URL("../functions/api/_lib/command-center-hae-bridge.mjs",import.meta.url),"utf8");
const verifier=await readFile(new URL("../functions/api/_lib/command-center-hae-receipt-verifier.mjs",import.meta.url),"utf8");
const haeRuntime=await readFile(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
const schema=await readFile(new URL("../functions/api/_lib/internal-command-center.mjs",import.meta.url),"utf8");
assert.match(endpoint,/action==="execute_plugin"/);
assert.match(endpoint,/readWorkItemPluginRoute\(row\)/);
assert.doesNotMatch(endpoint,/payload\?\.role_id|payload\?\.plugin_version/);
assert.match(helper,/verifyCommandCenterHaeReceipt/);
assert.match(helper,/pluginRuntimeRegistryEvidenceStatus/);
assert.match(helper,/commandCenterHaeIdempotencyKey/);
assert.match(verifier,/IDEMPOTENCY_BINDING_MISMATCH/);
assert.match(verifier,/DURABLE_SUCCESS_EVENT_UNVERIFIED/);
assert.match(verifier,/RECEIPT_COST_OR_PROVIDER_WRITE_UNVERIFIED/);
assert.match(haeRuntime,/SELECT event_id,job_id,event_type,from_state,to_state/,"HAE job readback must retain event job_id for durable receipt binding");
assert.match(schema,/hae_job_id TEXT/);
assert.doesNotMatch(schema,/hae_result_json|plugin_result_json/);


const contract=roleContractForJobType(plan.request.job_type);
const boundItem={
  ...item,
  organization_scope:"hermes_internal",
  linked_task_id:"aitask_test_001",
  hae_job_id:"job:11111111-1111-4111-8111-111111111111",
  plugin_route_json:JSON.stringify(route),
};
const contractIdentity={
  role_id:plan.expected.role_id,
  plugin_version:plan.expected.plugin_version,
  contract_version:contract.contract_version,
  sha256:plan.expected.contract_sha,
};
const canonicalJob={
  job_id:boundItem.hae_job_id,
  job_type:plan.request.job_type,
  business_lane:plan.request.business_lane,
  account_key:plan.request.account_key,
  project_key:plan.request.project_key,
  idempotency_key:plan.request.idempotency_key,
  policy_version:plan.request.policy_version,
  state:"SUCCEEDED",
  payload_json:JSON.stringify({...plan.request.payload,_role_contract:contractIdentity}),
  result_json:JSON.stringify({
    capability:plan.request.job_type,
    external_write:false,
    role_contract:contractIdentity,
    result:{},
  }),
};
const successEvent={job_id:boundItem.hae_job_id,event_type:"job.succeeded",to_state:"SUCCEEDED"};
const oldFetch=globalThis.fetch;
const env={HERMES_AUTOMATION_BASE_URL:"https://hae.example",HERMES_AUTOMATION_TOKEN:"read-only-test-token-1234567890"};
const readFake=async(job=canonicalJob,events=[successEvent])=>{
  resetCommandCenterHaeReadbackCache();
  globalThis.fetch=async()=>new Response(JSON.stringify({success:true,job,events}),{status:200,headers:{"Content-Type":"application/json"}});
  return readCommandCenterHaeExecution(env,boundItem,route);
};
try{
  const success=await readFake();
  assert.equal(success.receipt_verified,true);
  assert.equal(success.state,"PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED");

  const marketingContract=roleContractForJobType(marketingPlan.request.job_type);
  const marketingBoundItem={
    ...marketingItem,
    organization_scope:"hermes_internal",
    linked_task_id:"aitask_test_002",
    hae_job_id:"job:22222222-2222-4222-8222-222222222222",
    plugin_route_json:JSON.stringify(marketingRoute),
  };
  const marketingContractIdentity={
    role_id:marketingPlan.expected.role_id,
    plugin_version:marketingPlan.expected.plugin_version,
    contract_version:marketingContract.contract_version,
    sha256:marketingPlan.expected.contract_sha,
  };
  const marketingJob={
    job_id:marketingBoundItem.hae_job_id,
    job_type:marketingPlan.request.job_type,
    business_lane:marketingPlan.request.business_lane,
    account_key:marketingPlan.request.account_key,
    project_key:marketingPlan.request.project_key,
    idempotency_key:marketingPlan.request.idempotency_key,
    policy_version:marketingPlan.request.policy_version,
    state:"SUCCEEDED",
    payload_json:JSON.stringify({...marketingPlan.request.payload,_role_contract:marketingContractIdentity}),
    result_json:JSON.stringify({capability:marketingPlan.request.job_type,external_write:false,role_contract:marketingContractIdentity,result:{}}),
  };
  const marketingEvent={job_id:marketingBoundItem.hae_job_id,event_type:"job.succeeded",to_state:"SUCCEEDED"};
  globalThis.fetch=async()=>new Response(JSON.stringify({job:marketingJob,events:[marketingEvent]}),{status:200,headers:{"Content-Type":"application/json"}});
  const marketingReceipt=await readCommandCenterHaeExecution(env,marketingBoundItem,marketingRoute);
  assert.equal(marketingReceipt.receipt_verified,true,"marketing receipt must be verified with exact role/version and durable event");
  assert.equal(marketingReceipt.state,"PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED");
  globalThis.fetch=async()=>new Response(JSON.stringify({job:marketingJob,events:[]}),{status:200,headers:{"Content-Type":"application/json"}});
  assert.equal((await readCommandCenterHaeExecution(env,marketingBoundItem,marketingRoute)).receipt_verified,false,"marketing receipt without durable event fails closed");

  for(const events of [[],[successEvent,successEvent]]){
    const result=await readFake(canonicalJob,events);
    assert.equal(result.receipt_verified,false,"missing or duplicate durable event must fail closed");
  }
  for(const [name,job] of [
    ["idempotency", {...canonicalJob,idempotency_key:"unrelated-job"}],
    ["owner source binding", {...canonicalJob,payload_json:JSON.stringify({...plan.request.payload,tasks:[{...plan.request.payload.tasks[0],writer_key:"internal-ai:wrong"}],_role_contract:contractIdentity})}],
    ["provider write", {...canonicalJob,result_json:JSON.stringify({capability:plan.request.job_type,external_write:false,provider_write_performed:true,role_contract:contractIdentity})}],
  ]){
    const result=await readFake(job);
    assert.equal(result.receipt_verified,false,name+" must fail closed");
  }

  // A bounded outbound HAE call must fail closed with a typed reason instead of
  // holding the Worker request until the platform turns it into an opaque 503.
  const boundedEnv={...env,HERMES_COMMAND_CENTER_HAE_TIMEOUT_MS:"250"};
  resetCommandCenterHaeReadbackCache();
  globalThis.fetch=async(_url,init)=>new Promise((_resolve,reject)=>{
    const signal=init?.signal;
    if(signal?.aborted)reject(Object.assign(new Error("aborted"),{name:"AbortError"}));
    else signal?.addEventListener("abort",()=>reject(Object.assign(new Error("aborted"),{name:"AbortError"})));
  });
  // Node keeps an AbortSignal.timeout timer unref'd, so the loop would drain before
  // the abort fires; a live Worker request keeps its isolate alive.
  const keepAlive=setTimeout(()=>{},2000);
  try{
    const timedOutRead=await readCommandCenterHaeExecution(boundedEnv,boundItem,route);
    assert.equal(timedOutRead.receipt_verified,false,"a timed out readback must not claim a verified receipt");
    assert.equal(timedOutRead.reason,"command_center_hae_bridge_timeout","a timed out readback must report a typed reason");
    const timedOutSubmit=await submitCommandCenterHaeExecution(boundedEnv,boundItem,route,boundItem.linked_task_id);
    assert.equal(timedOutSubmit.ok,false,"a timed out submission must not report success");
    assert.equal(timedOutSubmit.reason,"command_center_hae_bridge_timeout","a timed out submission must report a typed reason");
  }finally{
    clearTimeout(keepAlive);
  }
}finally{
  globalThis.fetch=oldFetch;
}

// One UI tick must not fan out into one outbound HAE call per card: the receipt
// readback is cached per job, so repeated reads of the same job cost one call.
{
  resetCommandCenterHaeReadbackCache();
  let fetchCalls=0;
  globalThis.fetch=async()=>{
    fetchCalls+=1;
    return new Response(JSON.stringify({success:true,job:canonicalJob,events:[successEvent]}),{status:200,headers:{"Content-Type":"application/json"}});
  };
  try{
    const first=await readCommandCenterHaeExecution(env,boundItem,route);
    const second=await readCommandCenterHaeExecution(env,boundItem,route);
    assert.equal(first.receipt_verified,true);
    assert.equal(second.receipt_verified,true);
    assert.equal(fetchCalls,1,"the receipt readback must be cached per job so one UI tick is not one HAE call per card");
  }finally{
    globalThis.fetch=oldFetch;
    resetCommandCenterHaeReadbackCache();
  }
}

// A receipt is a historical claim about a job that already ran. The inventory snapshot
// it is verified against ages by construction (a source timestamp decays every 24h), so
// a refresh gap must NOT invalidate work that already succeeded. The evidence is the
// attestation the server-side routing policy PINNED on the route at selection time.
const registrySnapshot=pluginRuntimeRegistrySnapshot();
const yearLater=new Date(Date.parse(registrySnapshot.observed_at)+365*24*3600000).toISOString();
const verdictBase={
  registryEntries:registrySnapshot.entries,
  registryEvidence:{fresh:false,reason:"STALE_OR_FUTURE",age_hours:8760,source_class:registrySnapshot.source_class,observed_at:registrySnapshot.observed_at},
  registryObservedAt:registrySnapshot.observed_at,
  registrySourceClass:registrySnapshot.source_class,
  binding:{
    work_item_id:boundItem.id,linked_task_id:boundItem.linked_task_id,
    hae_job_id:boundItem.hae_job_id,idempotency_key:plan.request.idempotency_key,
    job_type:plan.request.job_type,contract_sha256:plan.expected.contract_sha,
  },
  haeJob:canonicalJob,
  jobEvents:[successEvent],
  roleContract:contract,
};
const staleVerdict=await verifyCommandCenterHaeReceipt({
  ...verdictBase,
  workItem:{...boundItem,plugin_route_json:JSON.stringify(route)},
  nowIso:yearLater,
});
assert.equal(staleVerdict.state,"MATCHED_SOURCE_ONLY","a stale inventory snapshot must not invalidate a receipt of work that already ran");
assert.equal(staleVerdict.registry_evidence_fresh,false,"staleness must stay visible in the verdict instead of silently passing");

const holdReason=async(overrides,nowIso=yearLater)=>{
  const verdict=await verifyCommandCenterHaeReceipt({
    ...verdictBase,
    workItem:{...boundItem,plugin_route_json:JSON.stringify({...route,...overrides})},
    nowIso,
  });
  assert.equal(verdict.state,"PLUGIN_EXECUTION_UNAVAILABLE");
  return verdict.reason;
};
assert.equal(await holdReason({registry_observed_at:""}),"ROUTE_REGISTRY_ATTESTATION_UNVERIFIED","a route without an inventory attestation must fail closed");
assert.equal(await holdReason({registry_observed_at:"not-a-timestamp"}),"ROUTE_REGISTRY_ATTESTATION_UNVERIFIED","an unparseable attestation must fail closed");
assert.equal(await holdReason({source_class:"BROWSER_SUPPLIED"}),"ROUTE_REGISTRY_ATTESTATION_UNVERIFIED","a foreign registry source class must fail closed");
assert.equal(
  await holdReason(
    {registry_observed_at:new Date(Date.parse(registrySnapshot.observed_at)+30*24*3600000).toISOString()},
    registrySnapshot.observed_at,
  ),
  "ROUTE_REGISTRY_ATTESTATION_UNVERIFIED",
  "a future-dated attestation is fabricated evidence and must fail closed",
);
assert.equal(await holdReason({owner:{...route.owner,plugin_version:"9.9.9"}}),"PLUGIN_ROUTE_VERSION_DRIFT","a version that the canonical inventory does not attest must fail closed");
assert.equal(await holdReason({helpers:[{role_id:"hermes-qa-evidence-auditor",plugin_version:"9.9.9"}]}),"HELPER_ROUTE_VERSION_DRIFT","a helper version that the canonical inventory does not attest must fail closed");
assert.doesNotMatch(verifier,/registryEvidence\?\.fresh !== true/,"the receipt path must not depend on the wall-clock freshness of the shared inventory snapshot");
assert.match(verifier,/ROUTE_REGISTRY_ATTESTATION_UNVERIFIED/);

console.log("Command Center HAE plugin receipt bridge: PASS");
