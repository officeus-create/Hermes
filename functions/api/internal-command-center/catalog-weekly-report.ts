import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { ensureCatalogWeeklyOwnerSchema } from "../../../workers/automation-engine/src/catalog-owner-weekly.mjs";

type Env = { DB?: any };
const HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const owner=await requireInternalOwner(request,env);
  if(owner.response)return owner.response;
  if(!env.DB)return jsonResponse(503,{success:false,error:"catalog_report_db_unavailable"},HEADERS);
  await ensureCatalogWeeklyOwnerSchema(env.DB);
  const rows=await env.DB.prepare("SELECT report_key,state,week_date,checked_at,source_sha,report_json FROM hermes_catalog_owner_weekly_reports WHERE organization_scope=? ORDER BY week_date DESC LIMIT 8").bind("hermes_internal").all();
  const reports=(rows.results||[]).map((row:any)=>{
    let report=null;
    try{report=row.report_json?JSON.parse(String(row.report_json)):null;}catch{report=null;}
    return {id:String(row.report_key),state:String(row.state),week_date:String(row.week_date),checked_at:row.checked_at||null,source_sha:row.source_sha||null,report};
  });
  return jsonResponse(200,{
    success:true,runtime_owner:"hermes-automation-engine",timezone:"Europe/Kyiv",
    schedule:"Friday 12:00",delivery:"private_command_center_only",
    chatgpt_scheduled_runs:0,paid_ai_cost_usd:0,reports,
  },HEADERS);
}
