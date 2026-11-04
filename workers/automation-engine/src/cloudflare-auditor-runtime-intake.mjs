const REPO="officeus-create/Hermes";
const SHA=/^[a-f0-9]{40}$/;
const WORKFLOW_RESULTS=new Set(["success","failure","cancelled","skipped"]);
const KEYS=new Set([
  "type","producer_main_sha","workflow_run_id","workflow_run_attempt","workflow_result",
  "observed_at","pages_project","source_type","source_owner","source_repository",
  "production_branch","production_deployment_sha","production_environment",
  "production_stage_status","source_ref"
]);

function invalid(code){const error=new Error(code);error.code=code;throw error;}
function exactKeys(value){
  const keys=Object.keys(value||{});
  return keys.length===KEYS.size&&keys.every((key)=>KEYS.has(key));
}
function positiveInt(value){return Number.isSafeInteger(value)&&value>0;}
function validIso(value){
  return typeof value==="string"&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;
}
function nullableText(value,max=120){
  return value===null||(typeof value==="string"&&value.length>0&&value.length<=max);
}

export function validateCloudflareAuditorEnvelope(message={}){
  if(!exactKeys(message)||
     message.type!=="cloudflare.audit.snapshot"||
     !SHA.test(message.producer_main_sha||"")||
     !positiveInt(message.workflow_run_id)||
     !positiveInt(message.workflow_run_attempt)||
     !WORKFLOW_RESULTS.has(message.workflow_result)||
     !validIso(message.observed_at)||
     message.pages_project!=="hermes"||
     !nullableText(message.source_type)||
     !nullableText(message.source_owner)||
     !nullableText(message.source_repository)||
     !nullableText(message.production_branch)||
     !(message.production_deployment_sha===null||SHA.test(message.production_deployment_sha||""))||
     !nullableText(message.production_environment)||
     !nullableText(message.production_stage_status)||
     message.source_ref!=="github://"+REPO+"/actions/runs/"+message.workflow_run_id)
    invalid("cloudflare_auditor_envelope_invalid");
  return Object.freeze({...message});
}

function finding(id,category,severity,status="OPEN"){
  return {finding_id:id,category,severity,status};
}

export function cloudflareAuditorJobFromEnvelope(message,{deployedSourceSha=null}={}){
  const source=validateCloudflareAuditorEnvelope(message);
  if(!SHA.test(deployedSourceSha||"")||source.producer_main_sha!==deployedSourceSha)
    invalid("cloudflare_auditor_producer_main_sha_mismatch");

  const findings=[];
  if(source.workflow_result!=="success"){
    findings.push(finding(
      "cloudflare-public-synthetic-"+source.workflow_run_id+"-"+source.workflow_run_attempt,
      "PUBLIC_SYNTHETIC_FAILURE","P0"
    ));
  }
  if(source.source_type!=="github"||source.source_owner!=="officeus-create"||source.source_repository!=="Hermes"){
    findings.push(finding("cloudflare-pages-source-owner","PAGES_SOURCE_OWNERSHIP_DRIFT","P0"));
  }
  if(source.production_branch!=="main"){
    findings.push(finding("cloudflare-pages-production-branch","PAGES_PRODUCTION_BRANCH_DRIFT","P0"));
  }
  if(!source.production_deployment_sha){
    findings.push(finding("cloudflare-pages-production-sha","PAGES_DEPLOYMENT_SHA_UNKNOWN","P1","UNKNOWN"));
  }else if(source.production_deployment_sha!==source.producer_main_sha){
    findings.push(finding("cloudflare-pages-production-sha","PAGES_DEPLOYMENT_SHA_DRIFT","P0"));
  }
  if(source.production_environment!=="production"){
    findings.push(finding("cloudflare-pages-production-environment","PAGES_PRODUCTION_ENVIRONMENT_DRIFT","P0"));
  }
  if(source.production_stage_status!=="success"){
    findings.push(finding("cloudflare-pages-production-stage","PAGES_PRODUCTION_STAGE_NOT_SUCCESS","P0"));
  }

  const p0=findings.some((item)=>item.severity==="P0");
  return Object.freeze({
    job_type:"audit.cloudflare.runtime",
    business_lane:"automation",
    account_key:"hermes_logistics",
    project_key:"ecosystem-cloudflare-audit",
    priority:p0?90:findings.length?70:50,
    max_attempts:2,
    internal_submission:true,
    idempotency_key:"hae:audit:cloudflare:run:"+source.workflow_run_id+":"+source.workflow_run_attempt+":"+(source.production_deployment_sha||"unknown"),
    policy_version:"hae-cloudflare-auditor-source-v1",
    payload:{
      observed_at:source.observed_at,
      coverage_complete:false,
      source_authenticated:true,
      source_trusted:true,
      findings,
    },
    source_verified:true,
    coverage_complete:false,
    automatic_repair_allowed:false,
    model_cost_usd:0,
  });
}
