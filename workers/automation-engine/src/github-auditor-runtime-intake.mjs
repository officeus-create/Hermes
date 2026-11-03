import { githubCIWorkflowIdentityVerified } from "./github-ci-workflow-identity.mjs";

const REPO="officeus-create/Hermes";
const SHA=/^[a-f0-9]{40}$/;
const SAFE_CONCLUSIONS=new Set(["success","failure","timed_out","cancelled","skipped","neutral","action_required"]);
const KEYS=new Set([
  "type","producer_main_sha","repository","workflow_name","workflow_path","workflow_id",
  "run_id","run_attempt","status","conclusion","head_sha","html_url","updated_at"
]);

function invalid(code){const e=new Error(code);e.code=code;throw e;}
function exactKeys(message){
  const keys=Object.keys(message||{});
  return keys.length===KEYS.size&&keys.every((key)=>KEYS.has(key));
}
function positiveInt(value){return Number.isSafeInteger(value)&&value>0;}
function validIso(value){
  return typeof value==="string"&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
}

export function validateGithubAuditorEnvelope(message={}){
  if(!exactKeys(message)||
     message.type!=="github.audit.snapshot"||
     message.repository!==REPO||
     !SHA.test(message.producer_main_sha||"")||
     !positiveInt(message.run_id)||
     !positiveInt(message.run_attempt)||
     message.status!=="completed"||
     !SAFE_CONCLUSIONS.has(message.conclusion)||
     !SHA.test(message.head_sha||"")||
     !validIso(message.updated_at)||
     message.html_url!=="https://github.com/"+REPO+"/actions/runs/"+message.run_id)
    invalid("github_auditor_envelope_invalid");

  if(!githubCIWorkflowIdentityVerified({
    name:message.workflow_name,
    path:message.workflow_path,
    workflow_id:message.workflow_id,
  })) invalid("github_auditor_workflow_identity_invalid");

  return Object.freeze({...message});
}

export function githubAuditorJobFromEnvelope(message,{deployedSourceSha=null}={}){
  const source=validateGithubAuditorEnvelope(message);
  if(!SHA.test(deployedSourceSha||"")||source.producer_main_sha!==deployedSourceSha)
    invalid("github_auditor_producer_main_sha_mismatch");

  const defect=source.conclusion==="failure"||source.conclusion==="timed_out";
  const findings=defect?[{
    finding_id:"github-ci-"+source.workflow_id+"-"+source.run_id+"-"+source.run_attempt,
    category:"CI_FAILURE",
    severity:"P1",
    status:"OPEN",
  }]:[];

  return Object.freeze({
    job_type:"audit.github.snapshot",
    business_lane:"automation",
    account_key:"hermes_logistics",
    project_key:"ecosystem-github-audit",
    priority:defect?75:45,
    max_attempts:2,
    internal_submission:true,
    idempotency_key:"hae:audit:github:workflow:"+source.workflow_id+":"+source.run_id+":"+source.run_attempt+":"+source.head_sha,
    policy_version:"hae-github-auditor-source-v1",
    payload:{
      observed_at:source.updated_at,
      coverage_complete:false,
      source_authenticated:true,
      findings,
    },
    source_verified:true,
    coverage_complete:false,
    automatic_repair_allowed:false,
    model_cost_usd:0,
  });
}
