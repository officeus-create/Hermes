import assert from "node:assert/strict";
import { HAE_AUDIT_JOB_TYPES, summarizeHaeAudits } from "../src/lib/hae-audit-summary.mjs";
const now="2026-11-03T08:00:00.000Z";
const result=(x)=>JSON.stringify(x);
const full=HAE_AUDIT_JOB_TYPES.map((job_type,index)=>({
  job_type,state:"SUCCEEDED",updated_at:"2026-11-03T07:30:00.000Z",completed_at:"2026-11-03T07:30:00.000Z",
  result_json:result({
    capability:job_type,
    observed_at:"2026-11-03T07:30:00.000Z",
    external_write:false,
    role_contract:{role_id:"auditor",plugin_version:"0.1.2",contract_version:"v1",sha256:"sha256:test"},
    result:{observed_at:"2026-11-03T07:29:00.000Z",coverage_complete:true,source_authenticated:true,source_trusted:false,source_verified:true,open_count:index===0?2:0,p0_count:0,p1_count:index===0?1:0,finding_ids:["private-id-must-not-project"]},
  }),
}));
const summary=summarizeHaeAudits(full,now);
assert.equal(summary.status,"P1");
assert.equal(summary.open_count,2);
assert.equal(summary.p1_count,1);
assert.equal(summary.raw_result_exposed,false);
assert.equal(JSON.stringify(summary).includes("private-id-must-not-project"),false);
assert.equal(summary.auditors.every((x)=>!Object.hasOwn(x,"finding_ids")),true);

const missing=summarizeHaeAudits([],now);
assert.equal(missing.status,"NOT_RUN");
assert.equal(missing.not_run_count,4);
assert.equal(missing.stale_count,4);

const partial=summarizeHaeAudits(full.map((row,index)=>index===1?{...row,result_json:result({capability:row.job_type,observed_at:"2026-11-03T07:30:00.000Z",result:{observed_at:"2026-11-03T07:29:00.000Z",coverage_complete:false,source_authenticated:false,source_trusted:false,source_verified:false}})}:row),now);
assert.equal(partial.status,"P1");
assert.equal(partial.partial_count,1);

const trustedProbe=summarizeHaeAudits(full.map((row,index)=>index===3?{
  ...row,
  result_json:result({capability:row.job_type,observed_at:"2026-11-03T07:30:00.000Z",result:{
    observed_at:"2026-11-03T07:29:00.000Z",coverage_complete:true,
    source_authenticated:false,source_trusted:true,source_verified:true,
    open_count:0,p0_count:0,p1_count:0,
  }}),
}:row),now);
assert.equal(trustedProbe.auditors.find((x)=>x.job_type==="audit.website.journey")?.coverage,"COMPLETE");

const failedExecution=summarizeHaeAudits(full.map((row,index)=>index===2?{...row,state:"FAILED",result_json:null}:row),now);
assert.equal(failedExecution.status,"P1");
assert.equal(failedExecution.execution_failed_count,1);

const stale=summarizeHaeAudits(full,"2026-11-05T08:00:00.000Z");
assert.equal(stale.stale_count,4);
console.log("HAE audit owner summary PASS");
