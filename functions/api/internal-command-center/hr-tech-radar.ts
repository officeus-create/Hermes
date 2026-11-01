import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { ensureHrTechRadarSchema } from "../../../workers/automation-engine/src/hr-tech-radar.mjs";

type Env={DB?:any};
const HEADERS={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const owner=await requireInternalOwner(request,env);
  if(owner.response)return owner.response;
  if(!env.DB)return jsonResponse(503,{success:false,error:"hr_tech_radar_db_unavailable"},HEADERS);
  await ensureHrTechRadarSchema(env.DB);
  const rows=await env.DB.prepare("SELECT report_key,monday_date,state,report_json,checked_at,source_sha,updated_at FROM hermes_hr_tech_radar_reports WHERE organization_scope=? ORDER BY monday_date DESC LIMIT 8").bind("hermes_internal").all();
  const reports=(rows.results||[]).map((row:any)=>{
    let report=null;
    try{report=row.report_json?JSON.parse(String(row.report_json)):null;}catch{report=null;}
    return {id:String(row.report_key),monday_date:String(row.monday_date),state:String(row.state),checked_at:row.checked_at||null,source_sha:row.source_sha||null,updated_at:row.updated_at||null,report};
  });
  return jsonResponse(200,{success:true,reports},HEADERS);
}
