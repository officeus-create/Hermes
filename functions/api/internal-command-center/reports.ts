import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";

type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const REPORT_TYPES = new Set(["report.catalog.weekly.build","report.hr-tech.weekly.build"]);

function safeResult(value:any){
  if(!value) return null;
  try{
    const parsed=JSON.parse(String(value));
    return parsed && typeof parsed==="object" ? parsed : null;
  }catch{return null}
}

function publicReport(row:any){
  const receipt=safeResult(row?.result_json);
  const result=receipt?.result && typeof receipt.result==="object" ? receipt.result : null;
  return {
    job_id:String(row.job_id||""),
    job_type:String(row.job_type||""),
    state:String(row.state||"UNKNOWN"),
    created_at:row.created_at||null,
    updated_at:row.updated_at||null,
    completed_at:row.completed_at||null,
    last_error_class:row.last_error_class||null,
    role_contract:receipt?.role_contract ? {
      role_id:String(receipt.role_contract.role_id||""),
      plugin_version:String(receipt.role_contract.plugin_version||""),
      contract_version:String(receipt.role_contract.contract_version||""),
      sha256:String(receipt.role_contract.sha256||""),
    } : null,
    external_write:receipt?.external_write===false ? false : null,
    report:result,
  };
}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const owner=await requireInternalOwner(request,env); if(owner.response) return owner.response;
  if(!env.DB) return jsonResponse(503,{success:false,error:"database_not_configured"},headers);
  const rows=await env.DB.prepare(`
    SELECT job_id,job_type,state,result_json,last_error_class,created_at,updated_at,completed_at
    FROM hermes_automation_jobs
    WHERE job_type IN ('report.catalog.weekly.build','report.hr-tech.weekly.build')
    ORDER BY created_at DESC LIMIT 30
  `).all().catch(()=>({results:[]}));
  const reports=(rows?.results||[]).filter((row:any)=>REPORT_TYPES.has(String(row.job_type))).map(publicReport);
  return jsonResponse(200,{
    success:true,
    checked_at:new Date().toISOString(),
    delivery_surface:"HERMES_COMMAND_CENTER_ONLY",
    ai_policy:{semantic_required:false,max_cost_usd:0,paid_fallback:false},
    schedules:[
      {id:"hr-tech-monday",job_type:"report.hr-tech.weekly.build",timezone:"Europe/Kyiv",weekday:"Monday",local_time:"10:00",state:"SOURCE_CONFIGURED_RELEASE_PENDING"},
      {id:"catalog-monday",job_type:"report.catalog.weekly.build",mode:"MONDAY_REMINDER",timezone:"Europe/Kyiv",weekday:"Monday",local_time:"12:00",state:"SOURCE_CONFIGURED_RELEASE_PENDING"},
      {id:"catalog-friday",job_type:"report.catalog.weekly.build",mode:"WEEKLY_REPORT",timezone:"Europe/Kyiv",weekday:"Friday",local_time:"12:00",state:"SOURCE_CONFIGURED_RELEASE_PENDING"},
    ],
    reports,
  },headers);
}
