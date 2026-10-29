import assert from "node:assert/strict";
import fs from "node:fs";
import {
  classifyWorkersSubscriptionSnapshot,
  readbackWorkersFreePlan,
} from "./hae-free-ai-plan-readback.mjs";

const now=Date.parse("2026-10-27T06:45:00Z");
const free=classifyWorkersSubscriptionSnapshot([],{nowMs:now});
assert.equal(free.status,"WORKERS_FREE_VERIFIED");
assert.equal(free.workers_free_verified,true);

const paid=classifyWorkersSubscriptionSnapshot([{
  state:"Paid",current_period_end:"2026-11-27T00:00:00Z",
  rate_plan:{id:"WORKERS_PAID"},
}],{nowMs:now});
assert.equal(paid.status,"WORKERS_PAID_DETECTED");
assert.equal(paid.workers_free_verified,false);

const partner=classifyWorkersSubscriptionSnapshot([{
  state:"Provisioned",rate_plan:{id:"PARTNERS_WORKERS_BASIC"},
}],{nowMs:now});
assert.equal(partner.status,"WORKERS_PAID_DETECTED");

const cancelledFuture=classifyWorkersSubscriptionSnapshot([{
  state:"Cancelled",current_period_end:"2026-10-28T00:00:00Z",
  rate_plan:{id:"WORKERS_PAID"},
}],{nowMs:now});
assert.equal(cancelledFuture.status,"WORKERS_PAID_DETECTED");

const cancelledPast=classifyWorkersSubscriptionSnapshot([{
  state:"Cancelled",current_period_end:"2026-10-26T00:00:00Z",
  rate_plan:{id:"WORKERS_PAID"},
}],{nowMs:now});
assert.equal(cancelledPast.status,"WORKERS_FREE_VERIFIED");

const unknown=classifyWorkersSubscriptionSnapshot([{
  state:"Paid",rate_plan:{id:"WORKERS_FUTURE_UNKNOWN"},
}],{nowMs:now});
assert.equal(unknown.status,"UNKNOWN_WORKERS_PLAN");
assert.equal(unknown.workers_free_verified,false);

const mainSha="a".repeat(40),accountId="b".repeat(32);
const json=(value,status=200)=>({
  ok:status>=200&&status<300,status,
  async json(){return value;},
});
function fixture({subscriptions=[],subscriptionStatus=200,totalCount=null}={}){
  const calls=[];
  const fetchImpl=async(url)=>{
    calls.push(url);
    if(url.endsWith("/branches/main"))return json({commit:{sha:mainSha}});
    if(url.includes("/subscriptions?")){
      if(subscriptionStatus!==200)return json({success:false,errors:[{code:9109}]},subscriptionStatus);
      return json({
        success:true,result:subscriptions,
        result_info:{count:subscriptions.length,total_count:totalCount??subscriptions.length},
      });
    }
    if(url.endsWith("/workers/scripts/hermes-automation-engine/settings"))return json({
      success:true,result:{bindings:[
        {name:"AI",type:"ai"},
        {name:"HERMES_AUTOMATION_SOURCE_SHA",type:"plain_text",text:mainSha},
        {name:"HERMES_AUTOMATION_MODE",type:"plain_text",text:"dry_run"},
        {name:"HERMES_AUTOMATION_PUBLISH",type:"plain_text",text:"disabled"},
        {name:"HERMES_FREE_AI_CLOUDFLARE_ENABLED",type:"plain_text",text:"disabled"},
        {name:"HERMES_FREE_AI_CLOUDFLARE_PLAN_ATTESTED",type:"plain_text",text:"unverified"},
        {name:"HERMES_FREE_AI_CLOUDFLARE_MODEL",type:"plain_text",text:"@cf/zai-org/glm-4.7-flash"},
      ]}
    });
    throw new Error("unexpected_url:"+url);
  };
  return {fetchImpl,calls};
}

const malformedGithub={
  fetchImpl:async(url)=>{
    if(url.endsWith("/branches/main"))return json(null);
    throw new Error("unexpected_url:"+url);
  }
};
await assert.rejects(()=>readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:malformedGithub.fetchImpl,nowMs:now,
}),/hae_free_ai_plan_readback_main_mismatch/);

const verifiedFixture=fixture();
const verified=await readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:verifiedFixture.fetchImpl,nowMs:now,
});
assert.equal(verified.status,"WORKERS_FREE_VERIFIED");
assert.equal(verified.workers_free_verified,true);
assert.equal(verified.activation_candidate,true);
assert.equal(verified.inference_currently_allowed,false);
assert.equal(verified.activation_requires_separate_reviewed_source_change,true);
assert.equal(verified.provider_write_performed,false);
assert.equal(verified.model_inference_performed,false);
assert.equal(verified.cost_usd,0);
assert.equal(
  verifiedFixture.calls.filter(url=>url.endsWith("/branches/main")).length,
  2,
  "successful attestation must verify main before and after provider reads"
);

const driftBase=fixture();
let mainReads=0;
const driftingMain=async(url,...args)=>{
  if(url.endsWith("/branches/main")){
    mainReads+=1;
    return json({commit:{sha:mainReads===1?mainSha:"b".repeat(40)}});
  }
  return driftBase.fetchImpl(url,...args);
};
await assert.rejects(()=>readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:driftingMain,nowMs:now,
}),/hae_free_ai_plan_readback_main_drift/);
assert.equal(mainReads,2,"main drift fixture must cross the provider-read window");

const deniedFixture=fixture({subscriptionStatus:403});
const denied=await readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:deniedFixture.fetchImpl,nowMs:now,
});
assert.equal(denied.status,"UNKNOWN_BILLING_READ_UNAVAILABLE");
assert.equal(denied.billing_read_available,false);
assert.equal(denied.workers_free_verified,false);
assert.equal(denied.activation_candidate,false);

const paidFixture=fixture({subscriptions:[{
  state:"Paid",rate_plan:{id:"WORKERS_PAID"},current_period_end:"2026-11-01T00:00:00Z",
}]});
const paidReadback=await readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:paidFixture.fetchImpl,nowMs:now,
});
assert.equal(paidReadback.status,"WORKERS_PAID_DETECTED");
assert.equal(paidReadback.activation_candidate,false);
assert.equal(paidReadback.paid_workers_plan_detected,true);

await assert.rejects(()=>readbackWorkersFreePlan({
  expectedMainSha:"f".repeat(40),githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:verifiedFixture.fetchImpl,nowMs:now,
}),/hae_free_ai_plan_readback_main_mismatch/);


const releaseWorkflow=fs.readFileSync(".github/workflows/automation-engine-release.yml","utf8");
assert.match(releaseWorkflow,/free_ai_plan_readback:[\s\S]*HAE_FREE_AI_PLAN_READBACK /);
const readbackJob=releaseWorkflow.split("\n  free_ai_plan_readback:\n")[1]||"";
assert.match(readbackJob,/node scripts\/hae-free-ai-plan-readback\.mjs/);
assert.doesNotMatch(readbackJob,/wrangler\s+deploy|\/queues\/[^"'\s]+\/messages|AI\.run|subscriptions\/cancel|bulk\/subscriptions/);



// Independent QA: unknown paid subscription state cannot establish Workers Free.
const unknownPaidState=classifyWorkersSubscriptionSnapshot([{
  state:"PENDING_MANUAL_REVIEW",rate_plan:{id:"WORKERS_PAID"}
}],{nowMs:now});
assert.equal(unknownPaidState.status,"UNKNOWN_WORKERS_SUBSCRIPTION_STATE");
assert.equal(unknownPaidState.workers_free_verified,false,
  "Unknown state for a known paid Workers plan must fail closed");

// Independent QA: a contradictory total_count cannot prove a complete billing snapshot.
const inconsistentCount=fixture({subscriptions:[{
  state:"Cancelled",current_period_end:"2026-10-26T00:00:00Z",
  rate_plan:{id:"WORKERS_PAID"}
}],totalCount:0});
const inconsistentReadback=await readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:inconsistentCount.fetchImpl,nowMs:now,
});
assert.equal(inconsistentReadback.workers_free_verified,false,
  "Contradictory total_count must fail closed");
assert.equal(inconsistentReadback.subscription_snapshot_complete,false);

// Independent QA: missing total_count cannot prove exhaustive pagination.
const missingCountBase=fixture();
const missingCount=async(url,...args)=>{
  const response=await missingCountBase.fetchImpl(url,...args);
  if(!url.includes("/subscriptions?"))return response;
  const payload=await response.json();
  return json({...payload,result_info:{count:0}});
};
const missingCountReadback=await readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:missingCount,nowMs:now,
});
assert.equal(missingCountReadback.workers_free_verified,false,
  "Missing total_count must fail closed");
assert.equal(missingCountReadback.subscription_snapshot_complete,false);

// Independent QA: provider count must match the actual page length.
const mismatchBase=fixture({subscriptions:[{
  state:"Cancelled",current_period_end:"2026-10-26T00:00:00Z",
  rate_plan:{id:"WORKERS_PAID"}
}]});
const mismatchedPageCount=async(url,...args)=>{
  const response=await mismatchBase.fetchImpl(url,...args);
  if(!url.includes("/subscriptions?"))return response;
  const payload=await response.json();
  return json({...payload,result_info:{count:0,total_count:1}});
};
const mismatchedReadback=await readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:mismatchedPageCount,nowMs:now,
});
assert.equal(mismatchedReadback.subscription_snapshot_complete,false);
assert.equal(mismatchedReadback.activation_candidate,false);

// Positive regression: two consistent pages with 51 subscriptions are complete.
const multiBase=fixture();
const twoPages=async(url,...args)=>{
  if(!url.includes("/subscriptions?"))return multiBase.fetchImpl(url,...args);
  const second=url.includes("page=2&");
  const items=Array.from({length:second?1:50},(_,i)=>({
    state:"Cancelled",current_period_end:"2026-10-26T00:00:00Z",
    rate_plan:{id:"WORKERS_PAID"},id:"cancelled-"+(second?50+i:i)
  }));
  return json({success:true,result:items,result_info:{
    page:second?2:1,per_page:50,count:items.length,total_count:51,
  }});
};
const validMulti=await readbackWorkersFreePlan({
  expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,
  fetchImpl:twoPages,nowMs:now,
});
assert.equal(validMulti.subscription_snapshot_complete,true);
assert.equal(validMulti.subscription_page_count,2);
assert.equal(validMulti.workers_free_verified,true);

console.log("HAE Workers Free plan readback PASS: Billing Read only; paid/unknown fail closed; zero inference");
