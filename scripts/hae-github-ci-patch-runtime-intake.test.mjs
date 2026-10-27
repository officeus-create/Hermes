import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {
  validateGithubCIPatchProposalEnvelope,
  verifyGithubCIPatchProposalEnvelope,
} from "../workers/automation-engine/src/github-ci-patch-runtime-intake.mjs";

const sourceExcerpt='import assert from "node:assert/strict";\nassert.equal(0, 1);\n';
const digest="sha256:"+createHash("sha256").update(sourceExcerpt,"utf8").digest("hex");
const findingId="ci-40421315430-4-abcdef123456";
const workId="HAE-SELF:"+findingId;
const artifactKey="scripts/hae-github-ci-patch-runtime-intake.test.mjs";
const repairJobId="job:12345678-1234-1234-1234-123456789abc";
const producerMain="a".repeat(40);
const headSha="b".repeat(40);
const message={
  type:"github.ci.patch.propose",
  run_id:40421315430,
  run_attempt:4,
  producer_main_sha:producerMain,
  repository:"officeus-create/Hermes",
  workflow_name:"Hermes Automation Engine Contract",
  workflow_path:".github/workflows/automation-engine-contract.yml",
  workflow_id:382680939,
  head_sha:headSha,
  repair_job_id:repairJobId,
  work_id:workId,
  finding_id:findingId,
  artifact_key:artifactKey,
  source_excerpt:sourceExcerpt,
  source_excerpt_sha256:digest,
  failure_summary:"The exact-head HAE contract failed after the single changed deterministic test file."
};

const repairRow={
  job_id:repairJobId,
  job_type:"hae.self.repair.packet",
  state:"SUCCEEDED",
  last_error_class:null,
  payload_json:JSON.stringify({
    work_id:workId,finding_id:findingId,artifact_key:artifactKey,
    _role_contract:{role_id:"hermes-automatic-engineer"}
  }),
  result_json:JSON.stringify({
    capability:"hae.self.repair.packet",
    result:{
      work_id:workId,
      finding_id:findingId,
      artifact_key:artifactKey,
      repair_state:"HOLD_REPAIR",
      source_change_performed:false,
      automatic_merge_performed:false,
      automatic_deploy_performed:false,
      cost_usd:0
    }
  })
};
const dbFor=(row=repairRow)=>({
  prepare(sql){
    assert.match(sql,/hermes_automation_jobs/);
    return {
      bind(jobId){
        assert.equal(jobId,repairJobId);
        return {first:async()=>row};
      }
    };
  }
});

const validated=validateGithubCIPatchProposalEnvelope(message);
assert.equal(validated.artifact_key,artifactKey);
const job=await verifyGithubCIPatchProposalEnvelope(message,{db:dbFor(),deployedSourceSha:producerMain});
assert.equal(job.job_type,"hae.self.patch.propose");
assert.equal(job.internal_submission,true);
assert.equal(job.max_attempts,1);
assert.equal(job.payload.work_id,workId);
assert.equal(job.payload.repair_job_id,repairJobId);
assert.equal(job.payload.artifact_key,artifactKey);
assert.equal(job.payload.base_sha,headSha);
assert.equal(job.payload.observed_base_sha,headSha);
assert.equal(job.payload.source_status,"HOLD_REPAIR");
assert.equal(job.payload.source_coverage_complete,true);
assert.equal(job.payload.finding_verified,true);
assert.equal(job.payload.writer_state_verified,true);
assert.equal(job.payload.writer_active,false);
assert.equal(job.payload.source_excerpt_sha256,digest);
assert.equal(job.idempotency_key,"hae:followup:self.patch.propose:"+workId);
assert.match(job.payload.defect_evidence_ref,/^HAE-EVIDENCE:github_ci_40421315430_4_[a-f0-9]{12}$/);

for(const bad of [
  {...message,repository:"other/repo"},
  {...message,workflow_id:1},
  {...message,artifact_key:"workers/automation-engine/src/index.mjs"},
  {...message,work_id:"HAE-SELF:other"},
  {...message,source_excerpt:"const token='ghp_12345678901234567890';"},
  {...message,failure_summary:"short"},
  {...message,extra:true},
]){
  assert.throws(()=>validateGithubCIPatchProposalEnvelope(bad),/github_ci_patch_envelope_invalid/);
}
await assert.rejects(
  ()=>verifyGithubCIPatchProposalEnvelope(message,{db:dbFor(),deployedSourceSha:"c".repeat(40)}),
  error=>error.code==="github_ci_patch_producer_main_sha_mismatch"
);
await assert.rejects(
  ()=>verifyGithubCIPatchProposalEnvelope({...message,source_excerpt_sha256:"sha256:"+"f".repeat(64)},{db:dbFor(),deployedSourceSha:producerMain}),
  error=>error.code==="github_ci_patch_source_digest_mismatch"
);
await assert.rejects(
  ()=>verifyGithubCIPatchProposalEnvelope(message,{db:dbFor(null),deployedSourceSha:producerMain}),
  error=>error.code==="github_ci_patch_repair_missing"
);
await assert.rejects(
  ()=>verifyGithubCIPatchProposalEnvelope(message,{
    db:dbFor({...repairRow,state:"FAILED"}),deployedSourceSha:producerMain
  }),
  error=>error.code==="github_ci_patch_repair_not_accepted"
);
await assert.rejects(
  ()=>verifyGithubCIPatchProposalEnvelope(message,{
    db:dbFor({...repairRow,payload_json:JSON.stringify({work_id:workId,finding_id:findingId,artifact_key:"scripts/hae-other.test.mjs"})}),
    deployedSourceSha:producerMain
  }),
  error=>error.code==="github_ci_patch_repair_identity_mismatch"
);

console.log("HAE CI patch runtime intake PASS: persisted HOLD_REPAIR -> internal free-only patch proposal job; zero git/provider writes");
