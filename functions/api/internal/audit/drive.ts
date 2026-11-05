import { requireInternalOwner } from "../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../_lib/session.mjs";
import { sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import { ensureBusinessSocialSchema } from "../../_lib/business-social.mjs";
import { readBusinessSocialDriveGovernanceSnapshot } from "../../_lib/business-social-drive.mjs";

type Env={
  DB?:any;
  GOOGLE_SOCIAL_DRIVE_CLIENT_ID?:string;
  GOOGLE_SOCIAL_DRIVE_CLIENT_SECRET?:string;
  GOOGLE_SOCIAL_DRIVE_REDIRECT_URI?:string;
  GOOGLE_SOCIAL_DRIVE_TOKEN_KEY?:string;
  HERMES_AUTOMATION_BASE_URL?:string;
  HERMES_AUTOMATION_TOKEN?:string;
};

const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};
const clean=(value:unknown,max=240)=>String(value??"").trim().slice(0,max);

function automationConfig(env:Env){
  const rawBase=clean(env.HERMES_AUTOMATION_BASE_URL,1024);
  const token=clean(env.HERMES_AUTOMATION_TOKEN,4096);
  if(!rawBase||token.length<20)return null;
  try{
    const base=new URL(rawBase);
    if(base.protocol!=="https:"||base.username||base.password||base.search||base.hash)return null;
    return{base,token};
  }catch{return null;}
}
async function haeJson(env:Env,path:string,body:Record<string,unknown>){
  const config=automationConfig(env);
  if(!config)return{ok:false,status:503,payload:{error:"hae_drive_audit_handoff_not_configured"}};
  const endpoint=new URL(path,config.base);
  try{
    const response=await fetch(endpoint.toString(),{
      method:"POST",
      redirect:"error",
      headers:{
        Authorization:"Bearer "+config.token,
        Accept:"application/json",
        "Content-Type":"application/json",
      },
      body:JSON.stringify(body),
    });
    return{ok:response.ok,status:response.status,payload:await response.json().catch(()=>({}))};
  }catch{
    return{ok:false,status:502,payload:{error:"hae_drive_audit_handoff_unavailable"}};
  }
}
async function digest(value:string){
  const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,"0")).join("");
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"same_origin_required"},headers);
  const owner=await requireInternalOwner(request,env);
  if(owner.response)return owner.response;
  if(!env.DB)return jsonResponse(503,{success:false,error:"database_not_configured"},headers);

  await ensureBusinessSocialSchema(env.DB);
  const rows=await env.DB.prepare(`
    SELECT business_key,source_url,updated_at
    FROM hermes_business_social_creative_intakes
    WHERE owner_specialist_id=? AND source_kind='google_drive'
    ORDER BY updated_at DESC
    LIMIT 20
  `).bind(String(owner.specialist.id)).all();

  const unique=[];
  const seen=new Set<string>();
  for(const row of rows?.results||[]){
    const businessKey=clean(row?.business_key,240);
    const sourceUrl=clean(row?.source_url,2048);
    const key=businessKey+"|"+sourceUrl;
    if(!businessKey||!sourceUrl||seen.has(key))continue;
    seen.add(key);
    unique.push({business_key:businessKey,source_url:sourceUrl});
    if(unique.length>=10)break;
  }
  if(unique.length<1)return jsonResponse(409,{
    success:false,error:"drive_audit_no_registered_sources",provider_write_performed:false,
  },headers);

  const observedAt=new Date().toISOString();
  const findings=new Map<string,{finding_id:string;category:string;severity:string;status:string}>();
  let coverageComplete=true;
  for(const source of unique){
    const result:any=await readBusinessSocialDriveGovernanceSnapshot(
      env.DB,env,{business_key:source.business_key},owner.specialist.id,source.source_url,{observedAt}
    );
    if(!result||result.ok!==true||!result.snapshot){
      return jsonResponse(409,{
        success:false,
        error:clean(result?.error_class,120)||"drive_audit_source_unavailable",
        provider_write_performed:false,
      },headers);
    }
    coverageComplete=coverageComplete&&result.snapshot.coverage_complete===true;
    for(const finding of result.snapshot.findings||[])findings.set(String(finding.finding_id),finding);
  }

  const payload={
    observed_at:observedAt,
    coverage_complete:coverageComplete,
    source_authenticated:true,
    source_trusted:true,
    findings:[...findings.values()].slice(0,200),
  };
  const payloadHash=await digest(JSON.stringify(payload));
  const priority=payload.findings.some((item)=>item.severity==="P0")?90:payload.findings.length?70:50;
  const job=await haeJson(env,"/v1/jobs",{
    job_type:"audit.drive.truth",
    business_lane:"automation",
    account_key:"hermes_logistics",
    project_key:"ecosystem-drive-audit",
    priority,
    max_attempts:2,
    idempotency_key:"hae:audit:drive:"+payloadHash,
    policy_version:"hae-drive-auditor-source-v1",
    payload,
  });
  if(!job.ok)return jsonResponse(job.status,{
    success:false,
    error:clean(job.payload?.error,160)||"hae_drive_audit_handoff_rejected",
    provider_write_performed:false,
    source_authenticated:true,
  },headers);

  return jsonResponse(job.status===200?200:202,{
    success:true,
    outcome:"queued_to_hae_drive_auditor",
    provider_write_performed:false,
    google_provider_write_performed:false,
    source_authenticated:true,
    source_trusted:true,
    coverage_complete:payload.coverage_complete,
    finding_count:payload.findings.length,
    p0_count:payload.findings.filter((item)=>item.severity==="P0").length,
    p1_count:payload.findings.filter((item)=>item.severity==="P1").length,
    source_count:unique.length,
    hae_job_id:job.payload?.job?.job_id||null,
    hae_state:job.payload?.job?.state||null,
    duplicate:Boolean(job.payload?.duplicate),
  },headers);
}
