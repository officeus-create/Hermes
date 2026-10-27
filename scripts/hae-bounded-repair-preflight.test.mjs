import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { preflightHaeRepairCandidate as check, HAE_REPAIR_V1_LIMITS as limits } from "../workers/automation-engine/src/hae-bounded-repair-preflight.mjs";
const file="scripts/hae-t4-dlq-canary.test.mjs";
const hunk="@@ -1 +1 @@\n-assert.equal(0, 1);\n+assert.equal(1, 1);\n";
const diff=(body=hunk,path=file)=>"diff --git a/"+path+" b/"+path+"\n--- a/"+path+"\n+++ b/"+path+"\n"+body;
const good={
 job_type:"hae.self.repair.packet",work_id:"HAE-SELF:CI_001",finding_id:"CI_001",
 source_status:"HOLD_REPAIR",source_coverage_complete:true,finding_verified:true,
 writer_state_verified:true,writer_active:false,
 base_sha:"a".repeat(40),observed_base_sha:"a".repeat(40),
 artifact_key:file,allowed_paths:[file],diff:diff(),
 writer_role:"hermes-automatic-engineer",independent_verifier_role:"hermes-qa-evidence-auditor",
 defect_evidence_ref:"HAE-EVIDENCE:CI_RECEIPT_001",
};
const safe=check(good);
assert.equal(safe.candidate_status,"HOLD_INDEPENDENT_QA");
assert.equal(safe.patch_sha256,"sha256:"+createHash("sha256").update(good.diff).digest("hex"));
assert.equal(safe.changed_file_count,1);
assert.equal(safe.hunk_count,1);
assert.equal(safe.changed_line_count,2);
assert.equal(limits.max_changed_files,1);
assert.equal(safe.paid_ai_cost_usd,0);
for(const key of ["automatic_branch_creation","automatic_git_write","automatic_d1_or_queue_write","automatic_merge","automatic_deploy","knowledge_auto_promotion","production_change_performed"])assert.equal(safe[key],false,key);
assert.equal(check(good).patch_sha256,safe.patch_sha256);
const bad=[
 ["unexpected_input",{other_field:1}],
 ["wrong_job",{job_type:"other"}],
 ["wrong_id",{work_id:"HAE-SELF:ANOTHER"}],
 ["wrong_finding",{finding_id:"ALIAS"}],
 ["source_not_ready",{source_status:"PENDING"}],
 ["unverified",{finding_verified:false}],
 ["partial",{source_coverage_complete:false}],
 ["unknown_writer",{writer_state_verified:false}],
 ["writer_collision",{writer_active:true}],
 ["bad_sha",{base_sha:"a"}],
 ["stale_sha",{observed_base_sha:"b".repeat(40)}],
 ["untrusted_artifact",{artifact_key:"README.md",allowed_paths:["README.md"]}],
 ["unlisted_file",{allowed_paths:["scripts/hae-another.test.mjs"]}],
 ["multiple_files",{allowed_paths:[file,file]}],
 ["writer_role",{writer_role:"other"}],
 ["verifier_role",{independent_verifier_role:"other"}],
 ["missing_evidence",{defect_evidence_ref:""}],
 ["no_diff",{diff:""}],
 ["wrong_diff_file",{diff:diff(hunk,"scripts/hae-other.test.mjs")}],
 ["two_files",{diff:diff()+diff()}],
 ["file_creation",{diff:diff().replace("--- a/"+file,"--- /dev/null")}],
 ["incorrect_hunk",{diff:diff("@@ -1 +1 @@\n-a\n+b\n+another\n")}],
 ["truncated_hunk",{diff:diff("@@ -1,2 +1 @@\n-a\n+b\n")}],
 ["invalid_header",{diff:diff("@@ incorrect @@\n-a\n+b\n")}],
 ["no_add",{diff:diff("@@ -1 +0,0 @@\n-a\n")}],
 ["too_big",{diff:diff()+"x".repeat(8500)+"\n"}],
 ["three_hunks",{diff:diff(hunk+"@@ -5 +5 @@\n-a\n+b\n@@ -8 +8 @@\n-a\n+b\n")}],
 ["add_node_fs_import",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+import fs from \"node:fs\";\n")}],
 ["add_dynamic_import",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+await import(\"node:fs\");\n")}],
 ["add_require",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+require(\"node:fs\");\n")}],
 ["add_fs_write",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+fs.writeFileSync(\"/tmp/x\",\"x\");\n")}],
 ["add_process_exit",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+process.exit(0);\n")}],
 ["add_process_bracket_exit",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+process[\"exit\"](0);\n")}],
 ["add_fs_bracket_write",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+fs[\"writeFileSync\"](\"/tmp/x\",\"x\");\n")}],
 ["add_globalthis_bracket_fetch",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+globalThis[\"fetch\"](\"x\");\n")}],
 ["add_network_call",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+https.request(\"https://example.com\");\n")}],
 ["add_websocket",{diff:diff("@@ -1 +1 @@\n-assert.equal(0, 1);\n+new WebSocket(\"wss://example.com\");\n")}],
];
for(const [name,variation] of bad)assert.throws(()=>check({...good,...variation}),/hae_repair_blocked:/,name);
const two=check({...good,diff:diff(hunk+"@@ -5 +5 @@\n-a\n+b\n")});
assert.equal(two.hunk_count,2);
console.log("HAE_REPAIR_PREFLIGHT_QA_PASS",JSON.stringify({
 safe_candidate:true,blocked_adversarial_cases:bad.length,two_hunk_pass:true,
 git_writes:0,queue_writes:0,deploys:0}));
