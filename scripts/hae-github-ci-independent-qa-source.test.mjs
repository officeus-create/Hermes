import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {dispatchGithubCIIndependentQa} from "./hae-github-ci-independent-qa-source.mjs";

// Fail closed at GitHub job admission: unset/false cannot reach Queue or credentials.
const sensorWorkflow=fs.readFileSync(new URL("../.github/workflows/hae-github-ci-sensor.yml",import.meta.url),"utf8");
const intakeGate=sensorWorkflow.split("\n  intake:\n")[1]?.split("\n    runs-on:")[0];
assert.ok(intakeGate,"sensor_intake_job_missing");
assert.match(intakeGate,/^\s*if: >-\s*\n\s*vars\.HAE_CI_SENSOR_ENABLED == 'true' &&/m,"sensor_job_must_be_default_off");
// A re-run of the dependent QA job must also fail closed after owner disables the sensor.
const independentQaGate=sensorWorkflow.split("\n  independent_qa:\n")[1]?.split("\n    runs-on:")[0];
assert.ok(independentQaGate,"sensor_independent_qa_job_missing");
assert.match(independentQaGate,/vars\.HAE_CI_SENSOR_ENABLED == 'true' && needs\.intake\.result == 'success' && needs\.intake\.outputs\.patch_candidate_ready == 'true'/,"independent_qa_must_obey_current_owner_gate");


const sha256=(v)=>"sha256:"+createHash("sha256").update(String(v),"utf8").digest("hex");
const runId=40421315430,runAttempt=6;
const producer="a".repeat(40),head="b".repeat(40);
const account="c".repeat(32),db="d".repeat(32),queue="e".repeat(32);
const artifact="scripts/hae-github-ci-patch-runtime-intake.test.mjs";
const workId="HAE-SELF:ci-"+runId+"-"+runAttempt+"-"+head.slice(0,12);
const findingId=workId.slice(9);
const repairJob="job:repair-qa-source-1";
const proposalJob="job:proposal-qa-source-1";
const releaseJob="job:release-qa-source-1";
const diff='diff --git a/'+artifact+' b/'+artifact+'\n--- a/'+artifact+'\n+++ b/'+artifact+'\n@@ -1,1 +1,1 @@\n-assert.equal(0,1);\n+assert.equal(1,1);\n';
const patchSha=sha256(diff);
const patchedFileSha=sha256('import assert from "node:assert/strict";\nassert.equal(1,1);\n');
const patchReceipt={
  status:"HOLD_INDEPENDENT_QA",candidate_status:"HOLD_INDEPENDENT_QA",
  run_id:runId,run_attempt:runAttempt,proposal_job_id:proposalJob,
  work_id:workId,finding_id:findingId,artifact_key:artifact,base_sha:head,
  patch_sha256:patchSha,patched_file_sha256:patchedFileSha,
  defect_evidence_ref:"HAE-EVIDENCE:github_ci_"+runId+"_"+runAttempt+"_"+head.slice(0,12),
  required_independent_verifier:"hermes-qa-evidence-auditor",
  automatic_branch_creation:false,automatic_commit:false,automatic_git_provider_write:false,
  automatic_d1_or_queue_write:false,automatic_merge:false,automatic_deploy:false,
  production_change_performed:false,paid_ai_cost_usd:0,
};
const proposalPayload={
  work_id:workId,finding_id:findingId,repair_job_id:repairJob,artifact_key:artifact,
  base_sha:head,observed_base_sha:head,source_status:"HOLD_REPAIR",
  source_coverage_complete:true,finding_verified:true,writer_state_verified:true,writer_active:false,
  defect_evidence_ref:patchReceipt.defect_evidence_ref,
};
const proposal={
  job_id:proposalJob,job_type:"hae.self.patch.propose",state:"SUCCEEDED",
  payload_json:JSON.stringify(proposalPayload),
  result_json:JSON.stringify({
    external_write:false,semantic_execution:{provider_id:"synthetic-free",cost_usd:0,usage_id:"usage:1"},
    result:{work_id:workId,finding_id:findingId,repair_job_id:repairJob,artifact_key:artifact,
      base_sha:head,proposal_status:"HOLD_BOUNDED_REPAIR_PREFLIGHT",diff,
      automatic_git_write:false,automatic_merge:false,automatic_deploy:false}
  })
};
const repair={
  job_id:repairJob,job_type:"hae.self.repair.packet",state:"SUCCEEDED",
  payload_json:JSON.stringify({work_id:workId,finding_id:findingId,artifact_key:artifact}),
  result_json:JSON.stringify({result:{work_id:workId,finding_id:findingId,artifact_key:artifact,repair_state:"HOLD_REPAIR"}})
};
const run={
  id:runId,run_attempt:runAttempt,status:"completed",conclusion:"failure",head_sha:head,
  name:"Hermes Automation Engine Contract",path:".github/workflows/automation-engine-contract.yml",workflow_id:382680939,
  repository:{full_name:"officeus-create/Hermes"},head_repository:{full_name:"officeus-create/Hermes"},
  html_url:"https://github.com/officeus-create/Hermes/actions/runs/"+runId,
};
const settings={success:true,result:{bindings:[
  {name:"HERMES_AUTOMATION_SOURCE_SHA",text:producer},
  {name:"HERMES_AUTOMATION_MODE",text:"dry_run"},
  {name:"HERMES_AUTOMATION_PUBLISH",text:"disabled"},
]}};
const d1=(results)=>({success:true,result:[{success:true,results}]});

function fixture({preexisting=false,badRelease=false}={}){
  const calls=[];let sent=false;let executeCalls=0;
  const release=()=>({
    job_id:releaseJob,state:"SUCCEEDED",last_error_class:null,
    result_json:JSON.stringify({
      external_write:false,
      result:{
        work_id:workId,patch_sha256:badRelease?"sha256:"+"f".repeat(64):patchSha,
        release_state:"BLOCKED",blocker:"AUTHENTICATED_RELEASE_EVIDENCE_INCOMPLETE",hold_release_reachable:false,independent_verifier_identity_ok:false,qa_identity_provenance:"SELF_ASSERTED_UNVERIFIED",
        exact_head_ci_verified:false,rollback_verified:false,automatic_merge_allowed:false,automatic_deploy_allowed:false,cost_usd:0
      }
    })
  });
  const fetchImpl=async(url,request={})=>{
    calls.push({url,method:request.method||"GET",body:request.body||null});
    if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:producer}})};
    if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>run};
    if(url.endsWith("/workers/scripts/hermes-automation-engine/settings"))return {ok:true,json:async()=>settings};
    if(url.endsWith("/pages/projects/hermes"))return {ok:true,json:async()=>({
      success:true,result:{deployment_configs:{production:{d1_databases:{DB:{id:db,database_name:"hermes-connect-prototype"}}}}}
    })};
    if(url.endsWith("/d1/database/"+db+"/query")){
      const q=JSON.parse(request.body);
      if(q.sql.includes("WHERE job_id=?")){
        if(q.params[0]===proposalJob)return {ok:true,json:async()=>d1([proposal])};
        if(q.params[0]===repairJob)return {ok:true,json:async()=>d1([repair])};
      }
      if(q.sql.includes("WHERE idempotency_key=?")){
        return {ok:true,json:async()=>d1((preexisting||sent)?[release()]:[])};
      }
      throw new Error("unexpected_d1_query");
    }
    if(url.endsWith("/queues"))return {ok:true,json:async()=>({success:true,result:[{queue_name:"hermes-automation",queue_id:queue}]})};
    if(url.endsWith("/queues/"+queue+"/messages")){
      sent=true;
      return {ok:true,json:async()=>({success:true,result:{}})};
    }
    throw new Error("unexpected_url:"+url);
  };
  const executeImpl=({repoRoot,input})=>{
    executeCalls+=1;
    assert.equal(repoRoot,"/tmp/qa-source");
    assert.equal(input.work_id,workId);
    assert.equal(input.diff,diff);
    assert.equal(input.independent_verifier_role,"hermes-qa-evidence-auditor");
    return {
      candidate_status:"HOLD_INDEPENDENT_QA",work_id:workId,finding_id:findingId,
      artifact_key:artifact,base_sha:head,patch_sha256:patchSha,patched_file_sha256:patchedFileSha,
      required_independent_verifier:"hermes-qa-evidence-auditor",
      automatic_merge:false,automatic_deploy:false,paid_ai_cost_usd:0,
    };
  };
  return {calls,fetchImpl,executeImpl,get sent(){return sent},get executeCalls(){return executeCalls}};
}

const f=fixture();
const result=await dispatchGithubCIIndependentQa({
  runId,runAttempt,expectedMainSha:producer,githubToken:"gh",cloudflareToken:"cf",accountId:account,
  repoRoot:"/tmp/qa-source",patchReceipt,fetchImpl:f.fetchImpl,executeImpl:f.executeImpl,
  sleepImpl:async()=>{},maxReadbackAttempts:2,
});
assert.equal(result.status,"INDEPENDENT_QA_EVIDENCE_ONLY");
assert.equal(result.duplicate,false);
assert.equal(result.queue_sent,true);
assert.equal(result.release_job_id,releaseJob);
assert.equal(result.patch_sha256,patchSha);
assert.equal(result.model_cost_usd,0);
assert.equal(result.automatic_merge,false);
assert.equal(result.automatic_deploy,false);
assert.equal(f.executeCalls,1);
const sends=f.calls.filter(x=>x.url.endsWith("/queues/"+queue+"/messages"));
assert.equal(sends.length,1);
const sentBody=JSON.parse(sends[0].body);
assert.equal(sentBody.body.type,"github.ci.qa.verify");
assert.equal(sentBody.body.qa_role,"hermes-qa-evidence-auditor");
assert.equal(sentBody.body.qa_verdict,"PASS");
assert.match(sentBody.body.qa_receipt_sha256,/^sha256:[a-f0-9]{64}$/);
assert.equal(sentBody.body.patch_sha256,patchSha);

const replay=fixture({preexisting:true});
const replayResult=await dispatchGithubCIIndependentQa({
  runId,runAttempt,expectedMainSha:producer,githubToken:"gh",cloudflareToken:"cf",accountId:account,
  repoRoot:"/tmp/qa-source",patchReceipt,fetchImpl:replay.fetchImpl,executeImpl:replay.executeImpl,
  sleepImpl:async()=>{},maxReadbackAttempts:1,
});
assert.equal(replayResult.status,"INDEPENDENT_QA_EVIDENCE_ONLY");
assert.equal(replayResult.duplicate,true);
assert.equal(replayResult.queue_sent,false);
assert.equal(replay.executeCalls,0);
assert.equal(replay.calls.some(x=>x.url.endsWith("/queues/"+queue+"/messages")),false);

const mismatch=fixture();
await assert.rejects(()=>dispatchGithubCIIndependentQa({
  runId,runAttempt,expectedMainSha:producer,githubToken:"gh",cloudflareToken:"cf",accountId:account,
  repoRoot:"/tmp/qa-source",patchReceipt,fetchImpl:mismatch.fetchImpl,
  executeImpl:()=>({...mismatch.executeImpl({repoRoot:"/tmp/qa-source",input:{
    work_id:workId,diff,independent_verifier_role:"hermes-qa-evidence-auditor"
  }}),patched_file_sha256:"sha256:"+"0".repeat(64)}),
  sleepImpl:async()=>{},maxReadbackAttempts:1,
}),/github_ci_qa_source_independent_reproof_mismatch/);
assert.equal(mismatch.calls.some(x=>x.url.endsWith("/queues/"+queue+"/messages")),false);

const conflict=fixture({preexisting:true,badRelease:true});
await assert.rejects(()=>dispatchGithubCIIndependentQa({
  runId,runAttempt,expectedMainSha:producer,githubToken:"gh",cloudflareToken:"cf",accountId:account,
  repoRoot:"/tmp/qa-source",patchReceipt,fetchImpl:conflict.fetchImpl,executeImpl:conflict.executeImpl,
  sleepImpl:async()=>{},maxReadbackAttempts:1,
}),/github_ci_qa_source_existing_release_conflict/);
assert.equal(conflict.calls.some(x=>x.url.endsWith("/queues/"+queue+"/messages")),false);

console.log("HAE independent QA source PASS: clean reproof -> one Queue receipt -> D1 QA receipt; HOLD_RELEASE blocked; replay no resend");
