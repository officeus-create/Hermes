import assert from "node:assert/strict";
import { dispatchCloudflareAuditorSnapshot } from "./hae-cloudflare-auditor-source.mjs";
import { cloudflareAuditorJobFromEnvelope, validateCloudflareAuditorEnvelope } from "../workers/automation-engine/src/cloudflare-auditor-runtime-intake.mjs";

const main="a".repeat(40);
const envelope={
  type:"cloudflare.audit.snapshot",
  producer_main_sha:main,
  workflow_run_id:456789,
  workflow_run_attempt:1,
  workflow_result:"success",
  observed_at:"2026-11-03T18:00:00.000Z",
  pages_project:"hermes",
  source_type:"github",
  source_owner:"officeus-create",
  source_repository:"Hermes",
  production_branch:"main",
  production_deployment_sha:main,
  production_environment:"production",
  production_stage_status:"success",
  source_ref:"github://officeus-create/Hermes/actions/runs/456789",
};
assert.equal(validateCloudflareAuditorEnvelope(envelope).pages_project,"hermes");
const healthy=cloudflareAuditorJobFromEnvelope(envelope,{deployedSourceSha:main});
assert.equal(healthy.job_type,"audit.cloudflare.runtime");
assert.equal(healthy.payload.source_authenticated,true);
assert.equal(healthy.payload.source_trusted,true);
assert.equal(healthy.payload.coverage_complete,false);
assert.deepEqual(healthy.payload.findings,[]);

const degraded=cloudflareAuditorJobFromEnvelope({
  ...envelope,
  workflow_result:"failure",
  production_deployment_sha:"b".repeat(40),
  production_stage_status:"failure",
},{deployedSourceSha:main});
assert.equal(degraded.payload.findings.some((item)=>item.category==="PUBLIC_SYNTHETIC_FAILURE"),true);
assert.equal(degraded.payload.findings.some((item)=>item.category==="PAGES_DEPLOYMENT_SHA_DRIFT"),true);
assert.equal(degraded.payload.findings.some((item)=>item.category==="PAGES_PRODUCTION_STAGE_NOT_SUCCESS"),true);
assert.equal(degraded.priority,90);
assert.throws(()=>cloudflareAuditorJobFromEnvelope(envelope,{deployedSourceSha:"c".repeat(40)}),/cloudflare_auditor_producer_main_sha_mismatch/);
assert.throws(()=>validateCloudflareAuditorEnvelope({...envelope,unexpected:true}),/cloudflare_auditor_envelope_invalid/);

let queued=null;
const accountId="11111111-2222-3333-4444-555555555555";
const queueId="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json"}});
const fakeFetch=async(url,options={})=>{
  const target=String(url);
  if(target==="https://api.github.com/repos/officeus-create/Hermes/branches/main")
    return json({commit:{sha:main}});
  if(target==="https://api.github.com/repos/officeus-create/Hermes/actions/runs/456789")
    return json({
      id:456789,run_attempt:1,name:"Cloudflare five-surface synthetic",
      path:".github/workflows/cloudflare-five-surface-synthetic.yml",
      repository:{full_name:"officeus-create/Hermes"},head_repository:{full_name:"officeus-create/Hermes"},
      head_branch:"main",head_sha:main,event:"schedule",
    });
  if(target.endsWith("/workers/scripts/hermes-automation-engine/settings"))
    return json({success:true,result:{bindings:[
      {name:"HERMES_AUTOMATION_SOURCE_SHA",text:main},
      {name:"HERMES_AUTOMATION_MODE",text:"dry_run"},
      {name:"HERMES_AUTOMATION_PUBLISH",text:"disabled"},
    ]}});
  if(target.endsWith("/pages/projects/hermes"))
    return json({success:true,result:{
      name:"hermes",
      source:{type:"github",config:{owner:"officeus-create",repo_name:"Hermes",production_branch:"main"}},
    }});
  if(target.includes("/pages/projects/hermes/deployments?"))
    return json({success:true,result:[{
      environment:"production",
      latest_stage:{status:"success"},
      deployment_trigger:{metadata:{commit_hash:main}},
    }]});
  if(target.endsWith("/queues"))
    return json({success:true,result:[{queue_name:"hermes-automation",queue_id:queueId}]});
  if(target.endsWith("/queues/"+queueId+"/messages")){
    queued=JSON.parse(options.body);
    return json({success:true});
  }
  throw new Error("unexpected_url:"+target);
};
const receipt=await dispatchCloudflareAuditorSnapshot({
  runId:456789,runAttempt:1,runResult:"success",githubToken:"gh-test",
  cloudflareToken:"cf-test",accountId,expectedMainSha:main,fetchImpl:fakeFetch,
});
assert.equal(receipt.queue_sent,true);
assert.equal(receipt.production_deployment_sha,main);
assert.equal(queued.body.type,"cloudflare.audit.snapshot");
assert.equal(queued.body.source_repository,"Hermes");
assert.equal(queued.body.production_deployment_sha,main);
assert.equal("account_id" in queued.body,false);
assert.equal("deployment_id" in queued.body,false);

console.log("HAE Cloudflare auditor source adapter PASS");
