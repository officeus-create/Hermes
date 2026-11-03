import assert from "node:assert/strict";
import { githubAuditorJobFromEnvelope, validateGithubAuditorEnvelope } from "../workers/automation-engine/src/github-auditor-runtime-intake.mjs";

const sha="a".repeat(40),main="b".repeat(40);
const base={
  type:"github.audit.snapshot",
  producer_main_sha:main,
  repository:"officeus-create/Hermes",
  workflow_name:"Website checks",
  workflow_path:".github/workflows/ci.yml",
  workflow_id:311612557,
  run_id:123456,
  run_attempt:1,
  status:"completed",
  conclusion:"failure",
  head_sha:sha,
  html_url:"https://github.com/officeus-create/Hermes/actions/runs/123456",
  updated_at:"2026-11-03T08:00:00.000Z",
};
assert.equal(validateGithubAuditorEnvelope(base).conclusion,"failure");
const failed=githubAuditorJobFromEnvelope(base,{deployedSourceSha:main});
assert.equal(failed.job_type,"audit.github.snapshot");
assert.equal(failed.payload.coverage_complete,false);
assert.equal(failed.payload.source_authenticated,true);
assert.equal(failed.payload.findings.length,1);
assert.equal(failed.payload.findings[0].severity,"P1");

const success=githubAuditorJobFromEnvelope({...base,run_id:123457,html_url:"https://github.com/officeus-create/Hermes/actions/runs/123457",conclusion:"success"},{deployedSourceSha:main});
assert.deepEqual(success.payload.findings,[]);
assert.equal(success.coverage_complete,false);

assert.throws(()=>githubAuditorJobFromEnvelope(base,{deployedSourceSha:"c".repeat(40)}),/github_auditor_producer_main_sha_mismatch/);
assert.throws(()=>validateGithubAuditorEnvelope({...base,workflow_id:1}),/github_auditor_workflow_identity_invalid/);
assert.throws(()=>validateGithubAuditorEnvelope({...base,unexpected:true}),/github_auditor_envelope_invalid/);

console.log("HAE GitHub auditor source adapter PASS");
