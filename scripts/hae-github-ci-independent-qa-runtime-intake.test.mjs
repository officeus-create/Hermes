import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {
  validateGithubCIIndependentQaEnvelope,
  verifyGithubCIIndependentQaEnvelope,
} from "../workers/automation-engine/src/github-ci-independent-qa-runtime-intake.mjs";

const sha256=(value)=>"sha256:"+createHash("sha256").update(String(value),"utf8").digest("hex");
const runId=40421315430,runAttempt=5;
const producer="a".repeat(40),sourceHead="b".repeat(40);
const workId="HAE-SELF:ci-"+runId+"-"+runAttempt+"-"+sourceHead.slice(0,12);
const findingId=workId.slice(9);
const repairJob="job:repair-12345678";
const proposalJob="job:proposal-12345678";
const artifact="scripts/hae-github-ci-patch-runtime-intake.test.mjs";
const diff='diff --git a/'+artifact+' b/'+artifact+'\n--- a/'+artifact+'\n+++ b/'+artifact+'\n@@ -1,1 +1,1 @@\n-assert.equal(0,1);\n+assert.equal(1,1);\n';
const patchSha=sha256(diff);
const base={
  type:"github.ci.qa.verify",
  run_id:runId,run_attempt:runAttempt,producer_main_sha:producer,
  repository:"officeus-create/Hermes",
  workflow_name:"Hermes Automation Engine Contract",
  workflow_path:".github/workflows/automation-engine-contract.yml",
  workflow_id:382680939,
  source_head_sha:sourceHead,
  work_id:workId,finding_id:findingId,
  repair_job_id:repairJob,proposal_job_id:proposalJob,
  artifact_key:artifact,patch_sha256:patchSha,
  qa_role:"hermes-qa-evidence-auditor",qa_verdict:"PASS",
};
const canonical=[
  base.run_id,base.run_attempt,base.producer_main_sha,base.source_head_sha,
  base.work_id,base.finding_id,base.repair_job_id,base.proposal_job_id,
  base.artifact_key,base.patch_sha256,base.qa_role,base.qa_verdict,
].join("|");
const message={...base,qa_receipt_sha256:sha256(canonical)};

const repair={
  job_id:repairJob,job_type:"hae.self.repair.packet",state:"SUCCEEDED",
  payload_json:JSON.stringify({work_id:workId,finding_id:findingId,artifact_key:artifact}),
  result_json:JSON.stringify({result:{
    work_id:workId,finding_id:findingId,artifact_key:artifact,repair_state:"HOLD_REPAIR",
    source_change_performed:false,automatic_merge_performed:false,automatic_deploy_performed:false,
  }}),
};
const proposalPayload={
  work_id:workId,finding_id:findingId,repair_job_id:repairJob,artifact_key:artifact,
  base_sha:sourceHead,observed_base_sha:sourceHead,source_status:"HOLD_REPAIR",
  source_coverage_complete:true,finding_verified:true,writer_state_verified:true,writer_active:false,
};
const proposal={
  job_id:proposalJob,job_type:"hae.self.patch.propose",state:"SUCCEEDED",
  payload_json:JSON.stringify(proposalPayload),
  result_json:JSON.stringify({
    external_write:false,semantic_execution:{cost_usd:0},
    result:{
      work_id:workId,finding_id:findingId,repair_job_id:repairJob,artifact_key:artifact,
      base_sha:sourceHead,proposal_status:"HOLD_BOUNDED_REPAIR_PREFLIGHT",diff,
      automatic_git_write:false,automatic_merge:false,automatic_deploy:false,
    }
  }),
};

const db={
  prepare(sql){
    let bound=[];
    return {
      bind(...values){bound=values;return this;},
      async first(){
        if(!sql.includes("WHERE job_id=?"))throw new Error("unexpected_sql");
        if(bound[0]===repairJob)return repair;
        if(bound[0]===proposalJob)return proposal;
        return null;
      }
    };
  }
};

assert.equal(validateGithubCIIndependentQaEnvelope(message).qa_verdict,"PASS");
const verified=await verifyGithubCIIndependentQaEnvelope(message,{db,deployedSourceSha:producer});
assert.equal(verified.job_type,"hae.self.release.verify");
assert.equal(verified.idempotency_key,"hae:receipt:self.qa.verify:"+workId);
assert.deepEqual(verified.payload,{work_id:workId,artifact_key:artifact,repair_job_id:repairJob});
assert.equal(verified.verified_result.release_state,"BLOCKED");
assert.equal(verified.verified_result.blocker,"AUTHENTICATED_RELEASE_EVIDENCE_INCOMPLETE");
assert.equal(verified.verified_result.hold_release_reachable,false);
// A self-declared QA role plus SHA-256 does not prove independent runner identity.
assert.equal(verified.verified_result.independent_verifier_identity_ok,false);
assert.equal(verified.verified_result.qa_identity_provenance,"SELF_ASSERTED_UNVERIFIED");
assert.equal(verified.verified_result.exact_head_ci_verified,false);
assert.equal(verified.verified_result.rollback_verified,false);
assert.equal(verified.verified_result.automatic_merge_allowed,false);
assert.equal(verified.verified_result.automatic_deploy_allowed,false);
assert.equal(verified.verified_result.cost_usd,0);

const invalid=[
  {...message,qa_verdict:"UNKNOWN"},
  {...message,qa_role:"hermes-automatic-engineer"},
  {...message,producer_main_sha:"c".repeat(40)},
  {...message,patch_sha256:"sha256:"+"d".repeat(64)},
  {...message,qa_receipt_sha256:"sha256:"+"e".repeat(64)},
  {...message,artifact_key:"../secret"},
];
for(const candidate of invalid){
  await assert.rejects(
    ()=>verifyGithubCIIndependentQaEnvelope(candidate,{db,deployedSourceSha:producer}),
    /github_ci_qa_/,
  );
}
await assert.rejects(
  ()=>verifyGithubCIIndependentQaEnvelope(message,{db,deployedSourceSha:"f".repeat(40)}),
  /github_ci_qa_producer_main_sha_mismatch/,
);

const badProposal={...proposal,result_json:JSON.stringify({
  external_write:false,semantic_execution:{cost_usd:0},
  result:{...JSON.parse(proposal.result_json).result,diff:diff+"\n"},
})};
const badDb={
  prepare(sql){
    let bound=[];
    return {
      bind(...values){bound=values;return this;},
      async first(){
        if(bound[0]===repairJob)return repair;
        if(bound[0]===proposalJob)return badProposal;
        return null;
      }
    };
  }
};
await assert.rejects(
  ()=>verifyGithubCIIndependentQaEnvelope(message,{db:badDb,deployedSourceSha:producer}),
  /github_ci_qa_proposal_identity_mismatch/,
);

console.log("HAE independent QA runtime intake PASS: trusted QA evidence persisted; HOLD_RELEASE remains blocked");
