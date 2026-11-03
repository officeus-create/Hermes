import assert from "node:assert/strict";
import {readbackGithubCIEvent} from "./hae-github-ci-readback.mjs";

const mainSha="e".repeat(40), sourceSha="a".repeat(40), accountId="b".repeat(32), dbId="c".repeat(32);
const runId=40421315430, runAttempt=2;
const run={
  id:runId,run_attempt:runAttempt,status:"completed",conclusion:"failure",head_sha:sourceSha,
  name:"Website checks",path:".github/workflows/ci.yml",workflow_id:311612557,
  repository:{full_name:"officeus-create/Hermes"},head_repository:{full_name:"officeus-create/Hermes"},
  html_url:"https://github.com/officeus-create/Hermes/actions/runs/"+runId,
};
const response=(results)=>({success:true,result:[{success:true,results}]});
const trace=[];
let mode="missing";
const fetchImpl=async(url,options={})=>{
  trace.push({url,method:options.method||"GET",body:options.body||null});
  if(url.endsWith("/branches/main"))return {ok:true,json:async()=>({commit:{sha:mainSha}})};
  if(url.endsWith("/actions/runs/"+runId))return {ok:true,json:async()=>run};
  if(url.endsWith("/pages/projects/hermes"))return {ok:true,json:async()=>({success:true,result:{deployment_configs:{production:{d1_databases:{DB:{id:dbId,database_name:"hermes-connect-prototype"}}}}}})};
  if(url.endsWith("/query")){
    const q=JSON.parse(options.body);
    if(q.sql.includes("FROM hermes_automation_runtime_events"))
      return {ok:true,json:async()=>response([{event_type:"queue.message_retry",error_class:"github_ci_source_runtime_failed",created_at:"2026-10-27T03:00:20Z"}])};
    if(q.sql.includes("WHERE idempotency_key=?")&&q.params[0].startsWith("hae:ci:audit:")){
      if(mode==="missing")return {ok:true,json:async()=>response([])};
      return {ok:true,json:async()=>response([{
        job_id:"job-audit-1",state:"SUCCEEDED",
        result_json:JSON.stringify({result:{next_work_id:"HAE-SELF:ci-40421315430-2-aaaaaaaaaaaa"}}),
        last_error_class:null,created_at:"2026-10-27T03:00:19Z",updated_at:"2026-10-27T03:00:25Z"
      }])};
    }
    if(q.sql.includes("WHERE idempotency_key=?")&&q.params[0].startsWith("hae:followup:self.repair:")){
      if(mode==="partial")return {ok:true,json:async()=>response([])};
      return {ok:true,json:async()=>response([{
        job_id:"job-repair-1",state:mode==="failed"?"FAILED":"SUCCEEDED",
        result_json:mode==="failed"?null:JSON.stringify({result:{repair_state:"HOLD_REPAIR"}}),
        last_error_class:mode==="failed"?"repair_failed":null,
        created_at:"2026-10-27T03:00:26Z",updated_at:"2026-10-27T03:00:29Z"
      }])};
    }
  }
  throw new Error("unexpected_fetch:"+url);
};
const opts={runId,runAttempt,expectedMainSha:mainSha,githubToken:"gh",cloudflareToken:"cf",accountId,fetchImpl};

const missing=await readbackGithubCIEvent(opts);
assert.equal(missing.status,"NOT_MATERIALIZED");
assert.equal(missing.queue_resend_allowed,false);
assert.equal(missing.queue_write_performed,false);
assert.equal(missing.d1_write_performed,false);
assert.equal(missing.provider_write_performed,false);
assert.equal(missing.runtime_event_count,1);

mode="partial";
const partial=await readbackGithubCIEvent(opts);
assert.equal(partial.status,"PARTIAL");
assert.equal(partial.audit_state,"SUCCEEDED");
assert.equal(partial.repair_job_present,false);

mode="done";
const done=await readbackGithubCIEvent(opts);
assert.equal(done.status,"SELF_WORK_MATERIALIZED");
assert.equal(done.work_id,"HAE-SELF:ci-40421315430-2-aaaaaaaaaaaa");
assert.equal(done.repair_state,"SUCCEEDED");
assert.equal(done.repair_contract_state,"HOLD_REPAIR");

mode="failed";
const failed=await readbackGithubCIEvent(opts);
assert.equal(failed.status,"FAILED");
assert.equal(failed.repair_error_class,"repair_failed");

const writes=trace.filter(x=>x.url.includes("cloudflare.com"));
assert.ok(writes.every(x=>x.method==="GET" || (x.method==="POST"&&x.url.endsWith("/query"))));
assert.equal(writes.some(x=>x.url.includes("/queues/")||x.url.endsWith("/messages")),false);
assert.equal(writes.some(x=>/deployments|subdomain|scripts\/hermes-automation-engine$/.test(x.url)),false);

await assert.rejects(()=>readbackGithubCIEvent({...opts,expectedMainSha:"f".repeat(40)}),e=>e.code==="github_ci_readback_main_moved");
await assert.rejects(()=>readbackGithubCIEvent({...opts,runAttempt:0}),e=>e.code==="github_ci_readback_preflight_invalid");


import fs from "node:fs";
const workflow=fs.readFileSync(new URL("../.github/workflows/automation-engine-release.yml",import.meta.url),"utf8");
const router=fs.readFileSync(new URL("../.github/workflows/issue-comment-command-router.yml",import.meta.url),"utf8");
const ciBlock=workflow.slice(workflow.indexOf("\n  ci_readback:\n"));
assert.ok(ciBlock.includes("GH_TOKEN: " + "$" + "{{ github.token }}"));
assert.ok(ciBlock.includes("CLOUDFLARE_HAE_RELEASE_TOKEN: " + "$" + "{{ secrets.CLOUDFLARE_HAE_RELEASE_TOKEN }}"));
assert.ok(ciBlock.includes("HAE_CI_READBACK_COMMAND: " + "$" + "{{ inputs.command_body }}"));
assert.match(ciBlock,/inputs\.caller_actor == 'officeus-create'/);
assert.match(ciBlock,/inputs\.issue_number == 2033/);
assert.match(router,/startsWith\(github\.event\.comment\.body, 'HAE_CI_READBACK '\)/);
assert.ok(ciBlock.includes("path: " + "$" + "{{ runner.temp }}/hae-ci-readback.json"));
assert.equal((workflow.match(/\$\{\{[^}\n]+\}(?!\})/g)||[]).length,0,"single-closing-brace GitHub expressions must not enter release workflow");
assert.equal((workflow.match(/\$\{\{[^}\n]+\}\}\}/g)||[]).length,0,"triple-closing-brace GitHub expressions must not enter release workflow");

console.log("HAE CI readback PASS: existing source event only; D1 SELECTs; zero Queue/provider/model writes");
