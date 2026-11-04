import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { executeBoundedRepair } from "./hae-bounded-repair-executor.mjs";

const SHA=/^[a-f0-9]{40}$/;
function fail(code){const error=new Error(code);error.code=code;throw error;}

export function executeGithubCIBoundedRepair({repoRoot,candidate,expectedSourceHead}={}){
  if(!candidate||Array.isArray(candidate)||typeof candidate!=="object"||
     Object.keys(candidate).sort().join(",")!=="input,proposal_job_id,run_attempt,run_id"||
     !Number.isSafeInteger(candidate.run_id)||candidate.run_id<=0||
     !Number.isSafeInteger(candidate.run_attempt)||candidate.run_attempt<=0||
     typeof candidate.proposal_job_id!=="string"||!/^job:[A-Za-z0-9._:-]{6,180}$/.test(candidate.proposal_job_id)||
     !candidate.input||Array.isArray(candidate.input)||typeof candidate.input!=="object"||
     !SHA.test(expectedSourceHead||"")||
     candidate.input.base_sha!==expectedSourceHead||
     candidate.input.observed_base_sha!==expectedSourceHead){
    fail("github_ci_patch_execute_candidate_invalid");
  }
  const receipt=executeBoundedRepair({repoRoot,input:candidate.input});
  if(receipt.work_id!==candidate.input.work_id||
     receipt.finding_id!==candidate.input.finding_id||
     receipt.artifact_key!==candidate.input.artifact_key||
     receipt.base_sha!==expectedSourceHead||
     receipt.candidate_status!=="HOLD_INDEPENDENT_QA"||
     receipt.automatic_git_provider_write!==false||
     receipt.automatic_merge!==false||
     receipt.automatic_deploy!==false||
     receipt.paid_ai_cost_usd!==0){
    fail("github_ci_patch_execute_receipt_invalid");
  }
  return Object.freeze({
    status:"HOLD_INDEPENDENT_QA",
    run_id:candidate.run_id,
    run_attempt:candidate.run_attempt,
    proposal_job_id:candidate.proposal_job_id,
    work_id:receipt.work_id,
    finding_id:receipt.finding_id,
    artifact_key:receipt.artifact_key,
    base_sha:receipt.base_sha,
    patch_sha256:receipt.patch_sha256,
    patched_file_sha256:receipt.patched_file_sha256,
    defect_evidence_ref:receipt.defect_evidence_ref,
    required_independent_verifier:receipt.required_independent_verifier,
    pre_patch_test:receipt.pre_patch_test,
    post_patch_test:receipt.post_patch_test,
    execution_state:receipt.execution_state,
    candidate_status:receipt.candidate_status,
    automatic_branch_creation:false,
    automatic_commit:false,
    automatic_git_provider_write:false,
    automatic_d1_or_queue_write:false,
    automatic_merge:false,
    automatic_deploy:false,
    knowledge_auto_promotion:false,
    production_change_performed:false,
    paid_ai_cost_usd:0,
    next_action:"INDEPENDENT_QA_BIND_RECEIPT_THEN_HOLD_RELEASE",
  });
}

export function main(){
  const runnerTemp=process.env.RUNNER_TEMP;
  const repoRoot=process.env.HAE_REPAIR_SOURCE_REPO;
  const expectedSourceHead=process.env.HAE_CI_SOURCE_HEAD_SHA;
  if(!runnerTemp||!repoRoot||!SHA.test(expectedSourceHead||"")) fail("github_ci_patch_execute_env_invalid");
  const candidatePath=path.join(runnerTemp,"hae-ci-patch-candidate.json");
  const receiptPath=path.join(runnerTemp,"hae-ci-bounded-repair-receipt.json");
  if(!fs.existsSync(candidatePath)){
    const skipped={status:"SKIPPED_NO_PATCH_CANDIDATE",automatic_git_provider_write:false,automatic_merge:false,automatic_deploy:false,paid_ai_cost_usd:0};
    fs.writeFileSync(receiptPath,JSON.stringify(skipped,null,2)+"\n",{mode:0o600});
    process.stdout.write(JSON.stringify(skipped)+"\n");
    return skipped;
  }
  try{
    let candidate;
    try{candidate=JSON.parse(fs.readFileSync(candidatePath,"utf8"));}catch{fail("github_ci_patch_execute_candidate_json_invalid");}
    const result=executeGithubCIBoundedRepair({repoRoot,candidate,expectedSourceHead});
    fs.writeFileSync(receiptPath,JSON.stringify(result,null,2)+"\n",{mode:0o600});
    process.stdout.write(JSON.stringify({status:result.status,work_id:result.work_id,patch_sha256:result.patch_sha256,paid_ai_cost_usd:0})+"\n");
    return result;
  } finally {
    try{fs.rmSync(candidatePath,{force:true});}catch{}
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{main();}catch(error){console.error(error?.code||"github_ci_patch_execute_failed");process.exitCode=1;}
}
