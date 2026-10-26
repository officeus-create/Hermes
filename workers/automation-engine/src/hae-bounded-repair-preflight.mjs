import { createHash } from "node:crypto";

// Offline source preflight for #2068. This is deliberately NOT a git/Queue
// executor: no workspace writes, no remote operations, no autonomous release.
const SHA=/^[a-f0-9]{40}$/;
const ID=/^[a-zA-Z0-9][a-zA-Z0-9._-]{1,90}$/;
const TEST_PATH=/^scripts\/(?:automation-engine|hae)-[a-z0-9][a-z0-9._-]*\.test\.mjs$/;
const FIELDS=new Set([
  "job_type","work_id","finding_id","source_status","source_coverage_complete",
  "finding_verified","writer_state_verified","writer_active",
  "base_sha","observed_base_sha","artifact_key","allowed_paths","diff",
  "writer_role","independent_verifier_role","defect_evidence_ref",
]);
export const HAE_REPAIR_V1_LIMITS=Object.freeze({
  max_changed_files:1,max_diff_bytes:8192,max_changed_lines:50,max_hunks:2,
  allowed_changes:"existing deterministic JS test files only",
  automatic_branch_creation:false,automatic_commit:false,automatic_job_submission:false,
  production_changes:false,paid_ai_cost_usd:0,
});
function deny(reason){throw new Error("hae_repair_blocked:"+reason)}
function safePath(s){
  return typeof s==="string" && s.length<=135 && TEST_PATH.test(s) &&
    !s.includes("..") && !s.includes("//") && !s.includes("\\");
}
function verifyDiff(diff,expected){
  if(typeof diff!=="string" || !diff.endsWith("\n") ||
     Buffer.byteLength(diff,"utf8")>HAE_REPAIR_V1_LIMITS.max_diff_bytes ||
     /[\r\0\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(diff))deny("invalid_diff_bytes");
  const lines=diff.trimEnd().split("\n");
  if(lines.some(l=>l.length>480))deny("diff_line_too_long");
  const head="diff --git a/"+expected+" b/"+expected;
  if(lines[0]!==head || lines.filter(x=>x.startsWith("diff --git ")).length!==1)
    deny("unexpected_changed_files");
  const from=lines.indexOf("--- a/"+expected);
  const to=lines.indexOf("+++ b/"+expected);
  if(from<1||to!==from+1)deny("missing_exact_file_headers");
  const metadata=lines.slice(1,from);
  if(metadata.length>1 ||
     metadata.some(x=>!/^index [a-f0-9]{7,64}\.\.[a-f0-9]{7,64}(?: 100644)?$/.test(x)))
    deny("unapproved_git_metadata");
  const hunkLines=lines.slice(to+1);
  if(!hunkLines.length)deny("missing_hunks");
  let hunks=0,changed=0,oldCount=null,newCount=null;
  function finishHunk(){
    if(oldCount!==null && (oldCount!==0||newCount!==0))
      deny("unbalanced_hunk");
  }
  for(const line of hunkLines){
    if(line.startsWith("@@ ")){
      finishHunk();
      const m=line.match(/^@@ -([1-9]\d*)(?:,(\d+))? \+([1-9]\d*)(?:,(\d+))? @@(?: [^\r\n]{0,80})?$/);
      if(!m)deny("invalid_hunk_header");
      hunks++;if(hunks>HAE_REPAIR_V1_LIMITS.max_hunks)deny("too_many_hunks");
      oldCount=m[2]===undefined?1:Number(m[2]);
      newCount=m[4]===undefined?1:Number(m[4]);
      if(oldCount>150||newCount>150)deny("oversized_hunk");
    }else{
      if(oldCount===null)deny("line_outside_hunk");
      const ch=line.slice(0,1);
      if(![" ","+","-"].includes(ch))deny("invalid_hunk_line");
      if(ch===" "){oldCount--;newCount--;}
      if(ch==="-"){oldCount--;changed++;}
      if(ch==="+"){newCount--;changed++;}
      if(oldCount<0||newCount<0)deny("hunk_count_mismatch");
      if(ch==="+" && (
        /(?:\b(?:token|api_key|private_key|password|secret)\b\s*[=:])|(?:sk-proj-|ghp_|BEGIN [A-Z ]*PRIVATE KEY)/i.test(line)||
        /(?:child_process|execSync|spawnSync|process\.env|fetch\s*\(|https?:\/\/|eval\s*\(|Function\s*\()/i.test(line)
      ))deny("unsafe_added_code");
    }
  }
  finishHunk();
  if(!hunks||!changed||changed>HAE_REPAIR_V1_LIMITS.max_changed_lines)
    deny("changed_lines_out_of_bounds");
  if(!hunkLines.some(x=>x.startsWith("+"))||!hunkLines.some(x=>x.startsWith("-")))
    deny("not_a_bounded_test_correction");
  return {changed_file_count:1,changed_line_count:changed,hunk_count:hunks};
}
export function preflightHaeRepairCandidate(input={}){
  if(!input||Array.isArray(input)||typeof input!=="object"||
     Object.keys(input).some(k=>!FIELDS.has(k)))deny("unknown_or_invalid_fields");
  const {work_id,finding_id,source_status,source_coverage_complete,
    finding_verified,writer_state_verified,writer_active,base_sha,observed_base_sha,
    artifact_key,allowed_paths,diff,writer_role,independent_verifier_role,
    defect_evidence_ref,job_type}=input;
  if(job_type!=="hae.self.repair.packet"||!ID.test(finding_id||"")||
     work_id!=="HAE-SELF:"+finding_id)deny("noncanonical_work_id");
  if(source_status!=="HOLD_REPAIR"||source_coverage_complete!==true||
     finding_verified!==true)deny("finding_not_independently_eligible");
  if(writer_state_verified!==true||writer_active!==false)
    deny("writer_not_independently_clear");
  if(!SHA.test(base_sha||"")||base_sha!==observed_base_sha)
    deny("stale_or_unverified_base_sha");
  if(!safePath(artifact_key)||!Array.isArray(allowed_paths)||
     allowed_paths.length!==1||allowed_paths[0]!==artifact_key)
    deny("untrusted_or_unbounded_path");
  if(writer_role!=="hermes-automatic-engineer"||
     independent_verifier_role!=="hermes-qa-evidence-auditor"||
     writer_role===independent_verifier_role)
    deny("writer_and_verifier_not_separated");
  if(typeof defect_evidence_ref!=="string"||
     !/^HAE-EVIDENCE:[a-zA-Z0-9._-]{6,90}$/.test(defect_evidence_ref))
    deny("missing_source_proof");
  const metrics=verifyDiff(diff,artifact_key);
  const patchHash=createHash("sha256").update(diff,"utf8").digest("hex");
  const packet={
    work_id,finding_id,artifact_key,base_sha,defect_evidence_ref,
    patch_sha256:"sha256:"+patchHash,
    ...metrics,
    required_independent_verifier:independent_verifier_role,
    rollback_recipe:"git revert <reviewed-exact-commit> (after a separately authorized commit exists)",
    candidate_status:"HOLD_INDEPENDENT_QA",
    evidence_state:"SOURCE_ONLY_TEST_PREVIEW_NOT_RUNTIME",
    next_action:"SEPARATE_QA_THEN_OWNER_APPROVAL",
    automatic_branch_creation:false,automatic_git_write:false,
    automatic_d1_or_queue_write:false,automatic_merge:false,
    automatic_deploy:false,knowledge_auto_promotion:false,
    production_change_performed:false,paid_ai_cost_usd:0,
  };
  return Object.freeze(packet);
}
