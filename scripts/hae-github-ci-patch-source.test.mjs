import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {dispatchGithubCIPatchProposal} from "./hae-github-ci-patch-source.mjs";

const repo="officeus-create/Hermes";
const runId=40421315430,runAttempt=4;
const mainSha="a".repeat(40),headSha="b".repeat(40);
const account="c".repeat(32),db="d".repeat(32),queue="e".repeat(32);
const artifact="scripts/hae-github-ci-patch-runtime-intake.test.mjs";
const source='import assert from "node:assert/strict";\nassert.equal(0, 1);\n';
const sourceDigest="sha256:"+createHash("sha256").update(source,"utf8").digest("hex");
const findingId="ci-"+runId+"-"+runAttempt+"-"+headSha.slice(0,12);
const workId="HAE-SELF:"+findingId;
const repairJob="job:12345678-1234-1234-1234-123456789abc";
const proposalJob="job:87654321-4321-4321-4321-cba987654321";
const defectEvidenceRef="HAE-EVIDENCE:github_ci_"+runId+"_"+runAttempt+"_"+headSha.slice(0,12);
const patchDiff="diff --git a/"+artifact+" b/"+artifact+"\n--- a/"+artifact+"\n+++ b/"+artifact+"\n@@ -1,2 +1,2 @@\n import assert from \"node:assert/strict\";\n-assert.equal(0, 1);\n+assert.equal(1, 1);\n";
const run={
  id:runId,run_attempt:runAttempt,status:"completed",conclusion:"failure",
  head_sha:headSha,name:"Hermes Automation Engine Contract",
  path:".github/workflows/automation-engine-contract.yml",workflow_id:382680939,
  repository:{full_name:repo},head_repository:{full_name:repo},
  html_url:"https://github.com/"+repo+"/actions/runs/"+runId
};
const settings={success:true,result:{bindings:[
  {name:"HERMES_AUTOMATION_SOURCE_SHA",text:mainSha},
  {name:"HERMES_AUTOMATION_MODE",text:"dry_run"},
  {name:"HERMES_AUTOMATION_PUBLISH",text:"disabled"},
]}};
const repairRow={
  job_id:repairJob,state:"SUCCEEDED",last_error_class:null,
  payload_json:JSON.stringify({work_id:workId,finding_id:findingId,artifact_key:artifact}),
  result_json:JSON.stringify({result:{
    work_id:workId,finding_id:findingId,artifact_key:artifact,repair_state:"HOLD_REPAIR",
    source_change_performed:false,automatic_merge_performed:false,automatic_deploy_performed:false
  }})
};
const d1=(results)=>({success:true,result:[{success:true,results}]});

function fixture({proposalState="WAITING_FREE_AI",preexisting=false,commitFiles=[{filename:artifact}],fileText=source}={}){
  const calls=[];
  let sent=false;
  const proposalPayload={
    work_id:workId,finding_id:findingId,repair_job_id:repairJob,artifact_key:artifact,
    base_sha:headSha,observed_base_sha:headSha,defect_evidence_ref:defectEvidenceRef,
    source_status:"HOLD_REPAIR",source_coverage_complete:true,finding_verified:true,
    writer_state_verified:true,writer_active:false,source_excerpt:source,
    source_excerpt_sha256:sourceDigest,failure_summary:"Verified deterministic regression failure metadata."
  };
  const proposalRow=()=>proposalState==="SUCCEEDED"?{
    job_id:proposalJob,state:"SUCCEEDED",last_error_class:null,
    payload_json:JSON.stringify(proposalPayload),
    result_json:JSON.stringify({
      external_write:false,
      semantic_execution:{provider_id:"cloudflare-workers-ai",cost_usd:0,usage_id:"usage:1"},
      result:{
        work_id:workId,finding_id:findingId,repair_job_id:repairJob,
        proposal_status:"HOLD_BOUNDED_REPAIR_PREFLIGHT",artifact_key:artifact,
        base_sha:headSha,defect_evidence_ref:defectEvidenceRef,diff:patchDiff,
        automatic_git_write:false,automatic_merge:false,automatic_deploy:false
      }
    })
  }:{
    job_id:proposalJob,state:"WAITING_FREE_AI",last_error_class:"cloudflare_workers_ai_disabled",
    result_json:null
  };
  const mock=async(url,request={})=>{
    calls.push({url,request});
    if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
    if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>run};
    if(url.endsWith("/workers/scripts/hermes-automation-engine/settings"))return {ok:true,json:async()=>settings};
    if(url.endsWith("/commits/"+headSha))return {ok:true,json:async()=>({sha:headSha,files:commitFiles})};
    if(url.includes("/contents/"))return {ok:true,json:async()=>({
      type:"file",encoding:"base64",content:Buffer.from(fileText,"utf8").toString("base64"),size:Buffer.byteLength(fileText)
    })};
    if(url.endsWith("/actions/runs/"+runId+"/jobs?per_page=100"))return {ok:true,json:async()=>({jobs:[{
      name:"contract",conclusion:"failure",steps:[
        {name:"Validate HAE contract",conclusion:"success"},
        {name:"Run deterministic regression",conclusion:"failure"}
      ]
    }]})};
    if(url.endsWith("/pages/projects/hermes"))return {ok:true,json:async()=>({
      success:true,result:{deployment_configs:{production:{d1_databases:{DB:{id:db,database_name:"hermes-connect-prototype"}}}}}
    })};
    if(url.endsWith("/d1/database/"+db+"/query")){
      const body=JSON.parse(request.body);
      const key=body.params?.[0];
      if(key==="hae:followup:self.repair:"+workId)return {ok:true,json:async()=>d1([repairRow])};
      if(key==="hae:followup:self.patch.propose:"+workId){
        return {ok:true,json:async()=>d1((preexisting||sent)?[proposalRow()]:[])};
      }
      throw new Error("unexpected_d1_key:"+key);
    }
    if(url.endsWith("/queues"))return {ok:true,json:async()=>({success:true,result:[{queue_name:"hermes-automation",queue_id:queue}]})};
    if(url.endsWith("/queues/"+queue+"/messages")){
      sent=true;
      return {ok:true,json:async()=>({success:true})};
    }
    throw new Error("unexpected_url:"+url);
  };
  return {mock,calls,get sent(){return sent;}};
}
const args={
  runId,runAttempt,repo,githubToken:"gh",cloudflareToken:"cf",accountId:account,
  expectedMainSha:mainSha,sleepImpl:async()=>{},maxReadbackAttempts:2
};

const waitFixture=fixture();
const waiting=await dispatchGithubCIPatchProposal({...args,fetchImpl:waitFixture.mock});
assert.equal(waiting.status,"WAITING_FREE_AI");
assert.equal(waiting.queue_sent,true);
assert.equal(waiting.work_id,workId);
assert.equal(waiting.repair_job_id,repairJob);
assert.equal(waiting.proposal_job_id,proposalJob);
assert.equal(waiting.artifact_key,artifact);
assert.equal(waiting.source_excerpt_sha256,sourceDigest);
assert.equal(waiting.model_cost_usd,0);
assert.equal(waiting.automatic_git_write,false);
const sends=waitFixture.calls.filter(call=>call.url.endsWith("/queues/"+queue+"/messages"));
assert.equal(sends.length,1);
const packet=JSON.parse(sends[0].request.body).body;
assert.equal(packet.type,"github.ci.patch.propose");
assert.equal(packet.producer_main_sha,mainSha);
assert.equal(packet.head_sha,headSha);
assert.equal(packet.repair_job_id,repairJob);
assert.equal(packet.work_id,workId);
assert.equal(packet.finding_id,findingId);
assert.equal(packet.artifact_key,artifact);
assert.equal(packet.source_excerpt,source);
assert.equal(packet.source_excerpt_sha256,sourceDigest);
assert.match(packet.failure_summary,/Run deterministic regression/);
assert.equal(JSON.stringify(packet).includes("Authorization"),false);

const doneFixture=fixture({proposalState:"SUCCEEDED"});
const done=await dispatchGithubCIPatchProposal({...args,fetchImpl:doneFixture.mock});
assert.equal(done.status,"HOLD_BOUNDED_REPAIR_PREFLIGHT");
assert.equal(done.queue_sent,true);
assert.equal(done.model_cost_usd,0);
assert.equal(done.usage_id,"usage:1");

const replayFixture=fixture({proposalState:"SUCCEEDED",preexisting:true});
const replay=await dispatchGithubCIPatchProposal({...args,fetchImpl:replayFixture.mock});
assert.equal(replay.status,"HOLD_BOUNDED_REPAIR_PREFLIGHT");
assert.equal(replay.queue_sent,false);
assert.equal(replayFixture.calls.filter(call=>call.url.endsWith("/queues/"+queue+"/messages")).length,0);

const multi=fixture({commitFiles:[{filename:artifact},{filename:"workers/automation-engine/src/index.mjs"}]});
const skipped=await dispatchGithubCIPatchProposal({...args,fetchImpl:multi.mock});
assert.equal(skipped.status,"SKIPPED_UNPATCHABLE");
assert.equal(skipped.queue_sent,false);
assert.equal(multi.calls.some(call=>call.url.endsWith("/messages")),false);

const unsafe=fixture({fileText:"const token='ghp_12345678901234567890';\n"});
const unsafeResult=await dispatchGithubCIPatchProposal({...args,fetchImpl:unsafe.mock});
assert.equal(unsafeResult.status,"SKIPPED_SOURCE_UNSAFE_OR_TOO_LARGE");
assert.equal(unsafeResult.queue_sent,false);

await assert.rejects(
  ()=>dispatchGithubCIPatchProposal({...args,expectedMainSha:"f".repeat(40),fetchImpl:fixture().mock}),
  error=>error.code==="github_ci_patch_source_main_moved"
);

console.log("HAE CI patch source PASS: exact one-test evidence -> one internal proposal; replay no resend; multi-file/secret source skip; cost $0");
