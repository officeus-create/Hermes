import { pluginRuntimeRegistryEvidenceStatus, pluginRuntimeRegistrySnapshot } from "../../../workers/automation-engine/src/plugin-runtime-registry.mjs";
import { roleContractForJobType, roleContractSha256 } from "../../../workers/automation-engine/src/role-contracts.mjs";
import { commandCenterHaeIdempotencyKey, verifyCommandCenterHaeReceipt } from "./command-center-hae-receipt-verifier.mjs";

const BRIDGE_POLICY_VERSION="command-center-plugin-bridge-v1";
const ROLE_JOB_MAP=Object.freeze({
  "hermes-agent-coordinator":"work.portfolio.reconcile",
});
const PRIORITY=Object.freeze({p0:100,p1:85,p2:60,p3:40});

async function expectedIdempotencyKey(item,route,plan,linkedTaskId=null,contractSha=null){
  const id=clean(item?.id,160);
  const taskId=clean(linkedTaskId||item?.linked_task_id,160);
  if(!id||!taskId||!plan?.contract)return null;
  return commandCenterHaeIdempotencyKey({
    workItem:{...item,organization_scope:"hermes_internal",id,linked_task_id:taskId},
    route,
    roleContract:plan.contract,
    contractSha:contractSha||await roleContractSha256(plan.contract),
  });
}

function clean(value,max=500){
  return typeof value==="string"
    ?value.replace(/[<>\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max)
    :"";
}
function automationConfig(env){
  const rawBase=clean(env?.HERMES_AUTOMATION_BASE_URL,1024);
  const token=clean(env?.HERMES_AUTOMATION_TOKEN,4096);
  if(!rawBase||token.length<20)return null;
  try{
    const base=new URL(rawBase);
    if(base.protocol!=="https:"||base.username||base.password||base.search||base.hash)return null;
    return{base,token};
  }catch{return null;}
}
async function haeJson(env,path,{method="GET",body=null}={}){
  const config=automationConfig(env);
  if(!config)return{ok:false,status:503,payload:{error:"command_center_hae_bridge_not_configured"}};
  const endpoint=new URL(path,config.base);
  try{
    const response=await fetch(endpoint.toString(),{
      method,redirect:"error",
      headers:{
        Authorization:"Bearer "+config.token,
        Accept:"application/json",
        ...(body===null?{}:{"Content-Type":"application/json"}),
      },
      ...(body===null?{}:{body:JSON.stringify(body)}),
    });
    return{ok:response.ok,status:response.status,payload:await response.json().catch(()=>({}))};
  }catch{return{ok:false,status:502,payload:{error:"command_center_hae_bridge_unavailable"}};}
}
function registryVersion(roleId){
  const registry=pluginRuntimeRegistrySnapshot();
  return registry.entries.find((entry)=>entry.role_id===roleId)?.plugin_version||null;
}
function routePlan(route){
  const roleId=clean(route?.owner?.role_id,120);
  const pluginVersion=clean(route?.owner?.plugin_version,120);
  if(!roleId||!pluginVersion)return{ok:false,state:"PLUGIN_EXECUTION_UNAVAILABLE",reason:"plugin_route_missing"};
  const liveVersion=registryVersion(roleId);
  if(!liveVersion||liveVersion!==pluginVersion)return{ok:false,state:"PLUGIN_ROUTE_VERSION_DRIFT",reason:"plugin_registry_version_drift"};
  const jobType=ROLE_JOB_MAP[roleId]||null;
  if(!jobType)return{ok:false,state:"PLUGIN_EXECUTION_UNAVAILABLE",reason:"safe_role_contract_mapping_missing"};
  const contract=roleContractForJobType(jobType);
  if(!contract||contract.role_id!==roleId||contract.plugin_version!==pluginVersion||contract.permission_class!=="READ_ONLY"||contract.semantic_required)
    return{ok:false,state:"PLUGIN_ROUTE_VERSION_DRIFT",reason:"hae_role_contract_mismatch"};
  return{ok:true,role_id:roleId,plugin_version:pluginVersion,job_type:jobType,contract};
}
function workStatus(value){
  const status=clean(value,40).toLowerCase();
  if(status==="done")return"DONE";
  if(status==="blocked")return"BLOCKED";
  if(status==="in_progress")return"IN_PROGRESS";
  if(status==="planned"||status==="ready")return"TODO";
  return"UNKNOWN";
}
function routeStateFromJob(value){
  const state=clean(value,40).toUpperCase();
  if(["QUEUED","RETRY_SCHEDULED"].includes(state))return"PLUGIN_EXECUTION_QUEUED";
  if(state==="RUNNING")return"PLUGIN_EXECUTION_RUNNING";
  if(state==="SUCCEEDED")return"PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED";
  if(["FAILED","CANCELLED","DEAD_LETTER"].includes(state))return"PLUGIN_EXECUTION_FAILED";
  return"PLUGIN_EXECUTION_RUNNING";
}

export async function buildCommandCenterHaeJobRequest(item,route,linkedTaskId,observedAt=new Date().toISOString()){
  const plan=routePlan(route);
  if(!plan.ok)return plan;
  const id=clean(item?.id,160),taskId=clean(linkedTaskId,160),policy=clean(route?.policy_version,120);
  const updatedAt=clean(item?.updated_at,80)||observedAt;
  if(!id||!taskId||!policy||!Number.isFinite(Date.parse(observedAt))||!Number.isFinite(Date.parse(updatedAt)))
    return{ok:false,state:"PLUGIN_EXECUTION_UNAVAILABLE",reason:"command_center_work_identity_invalid"};
  const contractSha=await roleContractSha256(plan.contract);
  const idempotencyKey=await expectedIdempotencyKey(item,route,plan,taskId,contractSha);
  if(!idempotencyKey)return{ok:false,state:"PLUGIN_EXECUTION_UNAVAILABLE",reason:"command_center_idempotency_identity_invalid"};
  const priority=PRIORITY[clean(item?.priority,10).toLowerCase()]??60;
  const payload={
    source_kind:"CHATGPT_SELECTED",
    snapshot_id:"command-center:"+id+":"+taskId,
    observed_at:new Date(observedAt).toISOString(),
    coverage_complete:true,
    tasks:[{
      work_id:id,
      source_ref:"chatgpt-selected://command-center/"+id,
      status:workStatus(item?.status),
      priority,
      updated_at:new Date(updatedAt).toISOString(),
      permission_class:"READ_ONLY",
      writer_key:"internal-ai:"+taskId,
      dependencies:[],
    }],
  };
  return{
    ok:true,
    state:"PLUGIN_SELECTED_NOT_EXECUTED",
    expected:{
      role_id:plan.role_id,
      plugin_version:plan.plugin_version,
      contract_sha:contractSha,
      job_type:plan.job_type,
    },
    request:{
      job_type:plan.job_type,
      business_lane:plan.contract.business_lane,
      account_key:"hermes_logistics",
      project_key:"command-center-plugin-route",
      priority,
      max_attempts:2,
      idempotency_key:idempotencyKey,
      policy_version:BRIDGE_POLICY_VERSION,
      payload,
    },
  };
}

export async function submitCommandCenterHaeExecution(env,item,route,linkedTaskId,observedAt=new Date().toISOString()){
  const plan=await buildCommandCenterHaeJobRequest(item,route,linkedTaskId,observedAt);
  if(!plan.ok)return plan;
  const response=await haeJson(env,"/v1/jobs",{method:"POST",body:plan.request});
  if(!response.ok)return{
    ok:false,state:"PLUGIN_EXECUTION_UNAVAILABLE",
    reason:clean(response.payload?.error,160)||"hae_job_submission_rejected",
    status:response.status,
  };
  const jobId=clean(response.payload?.job?.job_id,180);
  if(!jobId)return{ok:false,state:"PLUGIN_EXECUTION_UNAVAILABLE",reason:"hae_job_identity_missing"};
  return{
    ok:true,
    state:routeStateFromJob(response.payload?.job?.state||"QUEUED"),
    job_id:jobId,
    job_state:clean(response.payload?.job?.state,40)||"QUEUED",
    duplicate:Boolean(response.payload?.duplicate),
    expected:plan.expected,
  };
}

export async function readCommandCenterHaeExecution(env,item,route){
  const plan=routePlan(route);
  if(!plan.ok)return{state:plan.state,reason:plan.reason,job_id:item?.hae_job_id||null,receipt_verified:false};
  const jobId=clean(item?.hae_job_id,180);
  if(!jobId)return{state:"PLUGIN_SELECTED_NOT_EXECUTED",reason:null,job_id:null,receipt_verified:false};
  const expectedSha=await roleContractSha256(plan.contract);
  const expectedKey=await expectedIdempotencyKey(item,route,plan,item?.linked_task_id,expectedSha);
  if(!expectedKey)return{state:"PLUGIN_ROUTE_VERSION_DRIFT",reason:"command_center_idempotency_identity_invalid",job_id:jobId,receipt_verified:false};

  const response=await haeJson(env,"/v1/jobs/"+encodeURIComponent(jobId));
  if(!response.ok)return{
    state:"PLUGIN_EXECUTION_UNAVAILABLE",
    reason:clean(response.payload?.error,160)||"hae_job_readback_unavailable",
    job_id:jobId,receipt_verified:false,
  };
  const job=response.payload?.job||{};
  const basicBindingMatches=Boolean(
    clean(job.job_id,180)===jobId&&
    clean(job.job_type,120)===plan.job_type&&
    clean(job.project_key,120)==="command-center-plugin-route"&&
    clean(job.business_lane,120)===plan.contract.business_lane&&
    clean(job.account_key,120)==="hermes_logistics"&&
    clean(job.policy_version,120)===BRIDGE_POLICY_VERSION&&
    clean(job.idempotency_key,240)===expectedKey
  );
  if(!basicBindingMatches)return{state:"PLUGIN_ROUTE_VERSION_DRIFT",reason:"hae_job_identity_mismatch",job_id:jobId,receipt_verified:false};

  const jobState=clean(job.state,40).toUpperCase();
  if(jobState!=="SUCCEEDED")return{
    state:routeStateFromJob(jobState),
    reason:jobState==="FAILED"?clean(job.last_error_class,160)||"hae_job_failed":null,
    job_id:jobId,job_state:jobState,receipt_verified:false,
  };

  const registry=pluginRuntimeRegistrySnapshot();
  const registryEvidence=pluginRuntimeRegistryEvidenceStatus(new Date().toISOString(),24);
  const workItem={
    ...item,
    organization_scope:"hermes_internal",
    plugin_route_json:item?.plugin_route_json||JSON.stringify(route),
  };
  const binding={
    work_item_id:clean(item?.id,160),
    linked_task_id:clean(item?.linked_task_id,160),
    hae_job_id:jobId,
    idempotency_key:expectedKey,
    job_type:plan.job_type,
    contract_sha256:expectedSha,
  };
  const verdict=await verifyCommandCenterHaeReceipt({
    workItem,
    registryEntries:registry.entries,
    registryEvidence,
    binding,
    haeJob:job,
    jobEvents:response.payload?.events,
    roleContract:plan.contract,
  });
  const verified=verdict.state==="MATCHED_SOURCE_ONLY";
  return{
    state:verified?"PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED":"PLUGIN_ROUTE_VERSION_DRIFT",
    reason:verified?null:verdict.reason||"hae_receipt_verification_failed",
    job_id:jobId,
    job_state:jobState,
    receipt_verified:verified,
    source_verification_state:verdict.state,
    independent_qa_verified:false,
    capability:verified?plan.job_type:null,
    role_id:verified?plan.role_id:null,
    plugin_version:verified?plan.plugin_version:null,
    contract_sha:verified?expectedSha:null,
    external_write:verified?false:null,
  };
}

export const COMMAND_CENTER_HAE_BRIDGE_POLICY_VERSION=BRIDGE_POLICY_VERSION;
