import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {executeGithubCIBoundedRepair} from "./hae-github-ci-patch-execute.mjs";

const root=fs.mkdtempSync(path.join(os.tmpdir(),"hae-ci-patch-exec-"));
const repo=path.join(root,"repo");
fs.mkdirSync(repo,{recursive:true});
const run=(args,input)=>spawnSync(args[0],args.slice(1),{cwd:repo,input,encoding:"utf8",env:{...process.env,GIT_AUTHOR_NAME:"HAE Test",GIT_AUTHOR_EMAIL:"hae@example.invalid",GIT_COMMITTER_NAME:"HAE Test",GIT_COMMITTER_EMAIL:"hae@example.invalid"}});
assert.equal(run(["git","init","-q"]).status,0);
assert.equal(run(["git","config","user.name","HAE Test"]).status,0);
assert.equal(run(["git","config","user.email","hae@example.invalid"]).status,0);
fs.mkdirSync(path.join(repo,"scripts"),{recursive:true});
const artifact="scripts/hae-ci-bridge-fixture.test.mjs";
fs.writeFileSync(path.join(repo,artifact),'import assert from "node:assert/strict";\nassert.equal(0,1);\n');
assert.equal(run(["git","add","."]).status,0);
assert.equal(run(["git","commit","-q","-m","fixture"]).status,0);
const base=run(["git","rev-parse","HEAD"]).stdout.trim();
const diff='diff --git a/'+artifact+' b/'+artifact+'\n--- a/'+artifact+'\n+++ b/'+artifact+'\n@@ -1,2 +1,2 @@\n import assert from "node:assert/strict";\n-assert.equal(0,1);\n+assert.equal(1,1);\n';
const candidate={
  run_id:123456789,
  run_attempt:1,
  proposal_job_id:"job:proposal_123456",
  input:{
    job_type:"hae.self.repair.packet",
    work_id:"HAE-SELF:ci-123456789-1-"+base.slice(0,12),
    finding_id:"ci-123456789-1-"+base.slice(0,12),
    source_status:"HOLD_REPAIR",
    source_coverage_complete:true,
    finding_verified:true,
    writer_state_verified:true,
    writer_active:false,
    base_sha:base,
    observed_base_sha:base,
    artifact_key:artifact,
    allowed_paths:[artifact],
    diff,
    writer_role:"hermes-automatic-engineer",
    independent_verifier_role:"hermes-qa-evidence-auditor",
    defect_evidence_ref:"HAE-EVIDENCE:github_ci_123456789_1_"+base.slice(0,12),
  }
};
const result=executeGithubCIBoundedRepair({repoRoot:repo,candidate,expectedSourceHead:base});
assert.equal(result.status,"HOLD_INDEPENDENT_QA");
assert.equal(result.candidate_status,"HOLD_INDEPENDENT_QA");
assert.equal(result.work_id,candidate.input.work_id);
assert.equal(result.base_sha,base);
assert.equal(result.pre_patch_test.attempts,2);
assert.equal(result.post_patch_test.attempts,2);
assert.equal(result.automatic_git_provider_write,false);
assert.equal(result.automatic_merge,false);
assert.equal(result.automatic_deploy,false);
assert.equal(result.paid_ai_cost_usd,0);
assert.equal(run(["git","status","--porcelain"]).stdout.trim(),"");
assert.throws(()=>executeGithubCIBoundedRepair({repoRoot:repo,candidate:{...candidate,input:{...candidate.input,base_sha:"f".repeat(40)}},expectedSourceHead:base}),/candidate_invalid/);
fs.rmSync(root,{recursive:true,force:true});
console.log("HAE CI patch execute bridge PASS: semantic diff -> PATCH_ONLY proof -> HOLD_INDEPENDENT_QA; zero git provider writes");
