import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";

const API="https://api.cloudflare.com/client/v4";
const REPO="officeus-create/Hermes";
const SHA=/^[a-f0-9]{40}$/;
const UUID=/^[a-f0-9-]{32,36}$/;
const ACTIVE_STATES=new Set(["TRIAL","PROVISIONED","PAID","AWAITINGPAYMENT"]);
const KNOWN_PAID_WORKERS_PLANS=new Set([
  "WORKERS_PAID",
  "PARTNERS_WORKERS_ENT",
  "PARTNERS_WORKERS_SS",
  "PARTNERS_WORKERS_BASIC",
]);
const APPROVED_FREE_MODEL="@cf/zai-org/glm-4.7-flash";

function fail(code){const error=new Error(code);error.code=code;throw error;}
function clean(value,max=300){
  return typeof value==="string"
    ? value.replace(/[\u0000-\u001f\u007f]+/g," ").replace(/\s+/g," ").trim().slice(0,max)
    : "";
}
function upper(value){return clean(value,200).toUpperCase();}
function subscriptionRiskState(subscription,nowMs){
  const state=upper(subscription?.state);
  if(ACTIVE_STATES.has(state))return "ACTIVE";
  if(state==="CANCELLED"){
    const endMs=Date.parse(clean(subscription?.current_period_end,80));
    // Unknown/future cancelled period remains a billing risk.
    return !Number.isFinite(endMs)||endMs>nowMs?"ACTIVE":"INACTIVE";
  }
  // Do not treat new/unknown provider states as inactive or free.
  return "UNKNOWN";
}

export function classifyWorkersSubscriptionSnapshot(subscriptions,{nowMs=Date.now()}={}){
  if(!Array.isArray(subscriptions))fail("hae_free_ai_subscriptions_invalid");
  const activeWorkers=[];
  const unknownStates=[];
  for(const item of subscriptions){
    const planId=upper(item?.rate_plan?.id);
    if(planId&&!planId.includes("WORKERS"))continue;
    const risk=subscriptionRiskState(item,nowMs);
    if(risk==="INACTIVE")continue;
    const entry=Object.freeze({
      rate_plan_id:planId||"UNKNOWN",
      state:upper(item?.state)||"UNKNOWN",
    });
    if(risk==="UNKNOWN")unknownStates.push(entry);
    else activeWorkers.push(entry);
  }
  const paid=activeWorkers.filter(item=>KNOWN_PAID_WORKERS_PLANS.has(item.rate_plan_id));
  const unknown=activeWorkers.filter(item=>!KNOWN_PAID_WORKERS_PLANS.has(item.rate_plan_id));
  if(paid.length){
    return Object.freeze({
      status:"WORKERS_PAID_DETECTED",
      workers_free_verified:false,
      paid_workers_plan_detected:true,
      active_workers_rate_plans:Object.freeze(activeWorkers),
    });
  }
  if(unknownStates.length){
    return Object.freeze({
      status:"UNKNOWN_WORKERS_SUBSCRIPTION_STATE",
      workers_free_verified:false,
      paid_workers_plan_detected:false,
      active_workers_rate_plans:Object.freeze([...activeWorkers,...unknownStates]),
    });
  }
  if(unknown.length){
    return Object.freeze({
      status:"UNKNOWN_WORKERS_PLAN",
      workers_free_verified:false,
      paid_workers_plan_detected:false,
      active_workers_rate_plans:Object.freeze(activeWorkers),
    });
  }
  // Cloudflare Workers Free is the default account tier; Workers Paid is represented
  // as an account subscription. This verdict is valid only after a complete authenticated
  // Billing Read snapshot (enforced by the caller), never from Worker env text alone.
  return Object.freeze({
    status:"WORKERS_FREE_VERIFIED",
    workers_free_verified:true,
    paid_workers_plan_detected:false,
    active_workers_rate_plans:Object.freeze([]),
  });
}

async function requestJson(url,token,fetchImpl){
  let response;
  try{
    response=await fetchImpl(url,{
      method:"GET",
      headers:{Authorization:"Bearer "+token,Accept:"application/json"},
      signal:AbortSignal.timeout(12000),
    });
  }catch{
    return {ok:false,http_status:null,payload:null,error:"transport_failed"};
  }
  let payload=null;
  try{payload=await response.json();}catch{}
  const cloudflareResponse=url.startsWith(API+"/");
  const payloadAccepted=cloudflareResponse ? payload?.success===true : payload!==null;
  return {
    ok:Boolean(response.ok&&payloadAccepted),
    http_status:Number(response.status)||null,
    payload,
    error:response.ok?"provider_payload_invalid":"provider_http_rejected",
  };
}

async function subscriptionSnapshot(accountId,token,fetchImpl){
  const all=[];
  let page=1;
  let totalCount=null;
  while(page<=10){
    const result=await requestJson(
      API+"/accounts/"+accountId+"/subscriptions?page="+page+"&per_page=50",
      token,fetchImpl
    );
    if(!result.ok){
      return {
        complete:false,
        billing_read_available:result.http_status!==401&&result.http_status!==403,
        http_status:result.http_status,
        error:result.error,
        subscriptions:[],
        page_count:page-1,
      };
    }
    if(!Array.isArray(result.payload?.result)){
      return {
        complete:false,billing_read_available:true,http_status:result.http_status,
        error:"subscriptions_result_invalid",subscriptions:[],page_count:page-1,
      };
    }
    const items=result.payload.result;
    const info=result.payload?.result_info;
    const count=info?.count;
    const reportedTotal=info?.total_count;
    const metadataValid=Number.isInteger(reportedTotal)&&reportedTotal>=0&&
      Number.isInteger(count)&&count===items.length&&count<=50&&
      (info.page===undefined||info.page===page)&&
      (info.per_page===undefined||info.per_page===50)&&
      (totalCount===null||reportedTotal===totalCount)&&
      all.length+items.length<=reportedTotal;
    if(!metadataValid){
      return {
        complete:false,billing_read_available:true,http_status:result.http_status,
        error:"subscriptions_pagination_inconsistent",subscriptions:all,page_count:page,
      };
    }
    totalCount=reportedTotal;
    all.push(...items);
    if(all.length===totalCount){
      return {
        complete:true,billing_read_available:true,http_status:result.http_status,
        error:null,subscriptions:all,page_count:page,
      };
    }
    if(count<50){
      return {
        complete:false,billing_read_available:true,http_status:result.http_status,
        error:"subscriptions_pagination_incomplete",subscriptions:all,page_count:page,
      };
    }
    page+=1;
  }
  return {
    complete:false,billing_read_available:true,http_status:200,
    error:"subscriptions_pagination_exceeded",subscriptions:all,page_count:10,
  };
}

function bindingValue(bindings,name){
  const binding=bindings.find(item=>item?.name===name);
  return binding?.text??binding?.value??null;
}
function aiBindingPresent(bindings){
  return bindings.some(item=>item?.name==="AI"&&
    ["ai","ai_binding","workers_ai"].includes(String(item?.type||"").toLowerCase()));
}

export async function readbackWorkersFreePlan({
  expectedMainSha,githubToken,cloudflareToken,accountId,
  fetchImpl=fetch,nowMs=Date.now(),
}={}){
  if(!SHA.test(expectedMainSha||"")||!githubToken||!cloudflareToken||!UUID.test(accountId||""))
    fail("hae_free_ai_plan_readback_preflight_invalid");

  const main=await requestJson("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(!main.ok||main.payload?.commit?.sha!==expectedMainSha)
    fail("hae_free_ai_plan_readback_main_mismatch");

  const subscriptions=await subscriptionSnapshot(accountId,cloudflareToken,fetchImpl);
  const settings=await requestJson(
    API+"/accounts/"+accountId+"/workers/scripts/hermes-automation-engine/settings",
    cloudflareToken,fetchImpl
  );
  const bindings=settings.ok&&Array.isArray(settings.payload?.result?.bindings)
    ? settings.payload.result.bindings
    : [];

  let plan;
  if(!subscriptions.complete){
    plan=Object.freeze({
      status:subscriptions.billing_read_available
        ? "UNKNOWN_SUBSCRIPTION_SNAPSHOT_INCOMPLETE"
        : "UNKNOWN_BILLING_READ_UNAVAILABLE",
      workers_free_verified:false,
      paid_workers_plan_detected:false,
      active_workers_rate_plans:Object.freeze([]),
    });
  }else{
    plan=classifyWorkersSubscriptionSnapshot(subscriptions.subscriptions,{nowMs});
  }

  const deployedSource=clean(bindingValue(bindings,"HERMES_AUTOMATION_SOURCE_SHA"),80)||null;
  const runtimeMode=clean(bindingValue(bindings,"HERMES_AUTOMATION_MODE"),40)||null;
  const publication=clean(bindingValue(bindings,"HERMES_AUTOMATION_PUBLISH"),40)||null;
  const currentEnabled=clean(bindingValue(bindings,"HERMES_FREE_AI_CLOUDFLARE_ENABLED"),40)||null;
  const currentAttestation=clean(bindingValue(bindings,"HERMES_FREE_AI_CLOUDFLARE_PLAN_ATTESTED"),80)||null;
  const currentModel=clean(bindingValue(bindings,"HERMES_FREE_AI_CLOUDFLARE_MODEL"),200)||null;
  const currentExpiry=clean(bindingValue(bindings,"HERMES_FREE_AI_CLOUDFLARE_FREE_ASSERTION_EXPIRES_AT"),80)||null;

  const finalMain=await requestJson("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(!finalMain.ok||finalMain.payload?.commit?.sha!==expectedMainSha)
    fail("hae_free_ai_plan_readback_main_drift");

  const exactRuntime=Boolean(settings.ok&&deployedSource===expectedMainSha&&
    runtimeMode==="dry_run"&&publication==="disabled");
  const modelApproved=currentModel===APPROVED_FREE_MODEL;
  const bindingReady=aiBindingPresent(bindings);

  return Object.freeze({
    status:plan.status,
    expected_main_sha:expectedMainSha,
    deployed_source_sha:deployedSource,
    exact_dry_run_main:exactRuntime,
    publication_disabled:publication==="disabled",
    billing_read_available:subscriptions.billing_read_available,
    subscription_snapshot_complete:subscriptions.complete,
    subscription_page_count:subscriptions.page_count,
    workers_free_verified:plan.workers_free_verified,
    paid_workers_plan_detected:plan.paid_workers_plan_detected,
    active_workers_rate_plans:plan.active_workers_rate_plans,
    ai_binding_present:bindingReady,
    approved_free_model_configured:modelApproved,
    configured_model:currentModel,
    current_provider_enabled:currentEnabled,
    current_plan_attestation:currentAttestation,
    current_free_assertion_expires_at:currentExpiry,
    inference_currently_allowed:false,
    activation_candidate:Boolean(
      plan.workers_free_verified&&exactRuntime&&bindingReady&&modelApproved
    ),
    activation_requires_separate_reviewed_source_change:true,
    provider_write_performed:false,
    model_inference_performed:false,
    cost_usd:0,
  });
}

export async function main(){
  let cfg;
  try{cfg=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8"));}
  catch{fail("hae_free_ai_plan_account_config_invalid");}
  const expectedMainSha=clean(process.env.HAE_FREE_AI_PLAN_READBACK_SHA,80);
  const result=await readbackWorkersFreePlan({
    expectedMainSha,
    githubToken:process.env.GH_TOKEN,
    cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,
    accountId:cfg.account_id,
  });
  const out=JSON.stringify(result,null,2)+"\n";
  if(process.env.RUNNER_TEMP){
    fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"hae-free-ai-plan-readback.json"),out,{mode:0o600});
  }
  process.stdout.write(out);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{console.error(error?.code||"hae_free_ai_plan_readback_failed");process.exitCode=1;});
}
