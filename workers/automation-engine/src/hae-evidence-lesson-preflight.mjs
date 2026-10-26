import { createHash } from "node:crypto";

// HAE #2069: compile a reviewable lesson ONLY from a fully referenced accepted
// repair packet. This library cannot update One Brain, a plugin or a GitHub repo.
const SHA=/^[a-f0-9]{40}$/;
const DIGEST=/^sha256:[a-f0-9]{64}$/;
const IDENT=/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,95}$/;
const REFERENCE=/^HAE-(?:EVIDENCE|CI|VERIFY|REPAIR):[a-zA-Z0-9._-]{6,110}$/;
const KEYS=new Set(["work_id","finding_id","acceptance","base_sha","accepted_head_sha",
  "patch_sha256","exact_head_ci","independent_verifier","original_defect_ref",
  "repair_receipt_ref","defect_class","contract_key","contract_version",
  "root_cause","failed_assumption","prevention_rule","regression_test_ref",
  "proposed_delta","confidence","prior_lessons"]);
const PRIOR_KEYS=new Set(["lesson_id","work_id","contract_key","contract_version","defect_class","rule_fingerprint"]);
const CI_KEYS=new Set(["sha","verdict","receipt_ref"]);
const QA_KEYS=new Set(["verdict","role","receipt_ref"]);
function block(reason){throw new Error("hae_lesson_blocked:"+reason)}
function keysOnly(obj,valid){
  return obj && !Array.isArray(obj) && typeof obj==="object" &&
    Object.keys(obj).every(k=>valid.has(k));
}
function ref(x){return typeof x==="string"&&REFERENCE.test(x)}
function text(x,min=16,max=240){
  if(typeof x!=="string"||x.length<min||x.length>max ||
     x.trim()!==x||/[\r\n\0\x01-\x1f\x7f]/.test(x))return false;
  if(/(?:\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)|(?:https?:\/\/)|(?:sk-proj-|ghp_|Bearer\s)|(?:password|api.key|private.key)\s*[:=]/i.test(x))return false;
  return true;
}
function sha256(s){return "sha256:"+createHash("sha256").update(s,"utf8").digest("hex")}
function priorValid(x){
  return keysOnly(x,PRIOR_KEYS) && Object.keys(x).length===PRIOR_KEYS.size &&
    /^HAE-LESSON:[a-f0-9]{64}$/.test(x.lesson_id) &&
    x.work_id.startsWith("HAE-SELF:")&&IDENT.test(x.work_id.slice(9)) &&
    IDENT.test(x.contract_key)&&IDENT.test(x.contract_version)&&
    IDENT.test(x.defect_class)&&DIGEST.test(x.rule_fingerprint);
}
export function proposeHaeEvidenceLesson(input={}){
  if(!keysOnly(input,KEYS)||Object.keys(input).length!==KEYS.size)
    block("incomplete_or_unexpected_contract");
  const i=input;
  if(!IDENT.test(i.finding_id||"")||i.work_id!=="HAE-SELF:"+i.finding_id)
    block("work_identity_invalid");
  if(i.acceptance!=="ACCEPTED_BY_INDEPENDENT_QA"||!SHA.test(i.base_sha||"")||
    !SHA.test(i.accepted_head_sha||"")||!DIGEST.test(i.patch_sha256||""))
    block("unverified_repair_acceptance");
  if(!keysOnly(i.exact_head_ci,CI_KEYS)||Object.keys(i.exact_head_ci).length!==3||
    i.exact_head_ci.sha!==i.accepted_head_sha||i.exact_head_ci.verdict!=="SUCCESS"||
    !ref(i.exact_head_ci.receipt_ref))block("exact_head_ci_missing");
  if(!keysOnly(i.independent_verifier,QA_KEYS)||
    Object.keys(i.independent_verifier).length!==3||
    i.independent_verifier.role!=="hermes-qa-evidence-auditor"||
    i.independent_verifier.verdict!=="PASS"||
    !ref(i.independent_verifier.receipt_ref))
    block("independent_verifier_missing");
  if(!ref(i.original_defect_ref)||!ref(i.repair_receipt_ref)||
    new Set([i.original_defect_ref,i.repair_receipt_ref,i.exact_head_ci.receipt_ref,
      i.independent_verifier.receipt_ref]).size!==4)
    block("missing_distinct_evidence");
  for(const key of ["defect_class","contract_key","contract_version"])
    if(!IDENT.test(i[key]||""))block("invalid_"+key);
  for(const key of ["root_cause","failed_assumption","prevention_rule","proposed_delta"])
    if(!text(i[key]))block("unsafe_or_weak_"+key);
  if(!ref(i.regression_test_ref)||!["VERIFIED_FACT","INFERENCE","UNKNOWN"].includes(i.confidence))
    block("unsupported_regression_or_confidence");
  // Source-only summaries are not proof. Even a verified-fact assertion is
  // queued for an external auditor; the model cannot promote its own answer.
  if(!Array.isArray(i.prior_lessons)||i.prior_lessons.length>100||
    i.prior_lessons.some(x=>!priorValid(x)))block("prior_registry_not_verified");
  const rule_fingerprint=sha256(i.prevention_rule.trim().toLowerCase());
  const lesson_id="HAE-LESSON:"+sha256(
    [i.work_id,i.contract_key,i.contract_version,i.defect_class,rule_fingerprint].join("|")
  ).slice(7);
  const same=i.prior_lessons.filter(x=>x.contract_key===i.contract_key&&
    x.contract_version===i.contract_version&&x.defect_class===i.defect_class);
  if(same.some(x=>x.work_id===i.work_id||x.rule_fingerprint===rule_fingerprint)){
    return Object.freeze({lesson_id,status:"DUPLICATE_REPLAY",next_action:"NO_ACTION",
      knowledge_promotion_allowed:false,external_writes:0});
  }
  if(same.length){
    return Object.freeze({lesson_id,status:"HOLD_CONFLICTING_LESSON",
      next_action:"SEPARATE_CONTRACT_OWNER_REVIEW",
      knowledge_promotion_allowed:false,external_writes:0});
  }
  return Object.freeze({
    lesson_id,work_id:i.work_id,contract_key:i.contract_key,
    contract_version:i.contract_version,defect_class:i.defect_class,
    rule_fingerprint,root_cause:i.root_cause,failed_assumption:i.failed_assumption,
    prevention_rule:i.prevention_rule,regression_test_ref:i.regression_test_ref,
    proposed_delta:i.proposed_delta,confidence:i.confidence,
    evidence_refs:[i.original_defect_ref,i.repair_receipt_ref,
      i.exact_head_ci.receipt_ref,i.independent_verifier.receipt_ref],
    accepted_patch_sha256:i.patch_sha256,accepted_head_sha:i.accepted_head_sha,
    status:"HOLD_INDEPENDENT_KNOWLEDGE_REVIEW",
    next_action:"CONTRACT_OWNER_VALIDATE_EVIDENCE_BEFORE_VERSION_PROMOTION",
    canonical_runtime:"EXISTING_HAE",auto_create_agent:false,
    knowledge_promotion_allowed:false,contract_version_change_allowed:false,
    one_brain_write_allowed:false,plugin_write_allowed:false,
    queue_job_submission_allowed:false,git_write_allowed:false,
    paid_ai_cost_usd:0,external_writes:0,
    evidence_state:"USER_SUPPLIED_ACCEPTANCE_REQUIRES_PROVIDER_READBACK"
  });
}
