import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import {
  ensureBusinessSocialSchema,
  resolveOwnedSocialBusiness,
} from "../../_lib/business-social.mjs";
import { readBusinessSocialDriveConnection } from "../../_lib/business-social-drive.mjs";

type Env = {
  DB?: any;
  GOOGLE_SOCIAL_DRIVE_CLIENT_ID?: string;
  GOOGLE_SOCIAL_DRIVE_CLIENT_SECRET?: string;
  GOOGLE_SOCIAL_DRIVE_REDIRECT_URI?: string;
  GOOGLE_SOCIAL_DRIVE_TOKEN_KEY?: string;
  HERMES_SOCIAL_AI_API_KEY?: string;
  HERMES_SOCIAL_AI_MODEL?: string;
};
const headers={ "Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow" };
const clean=(value:unknown,max=240)=>String(value??"").trim().slice(0,max);

function googleDriveUrl(value:unknown){
  try{
    const url=new URL(String(value||"").trim());
    if(url.protocol!=="https:") return null;
    const host=url.hostname.toLowerCase();
    if(host!=="drive.google.com" && host!=="docs.google.com") return null;
    return url.toString();
  }catch{return null;}
}
function publicIntake(row:any){
  return row?{
    id:String(row.id||""),source_kind:String(row.source_kind||""),
    source_url:String(row.source_url||""),brief:String(row.brief||""),
    language:String(row.language||""),market:row.market?String(row.market):null,
    status:String(row.status||""),created_at:String(row.created_at||""),
    updated_at:String(row.updated_at||""),
  }:null;
}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  if(!env.DB)return jsonResponse(503,{success:false,error:"database_not_configured"},headers);
  const specialist=await getAuthenticatedSpecialist(request,env.DB);
  if(!specialist)return jsonResponse(401,{success:false,error:"authentication_required"},headers);
  const vertical=new URL(request.url).searchParams.get("vertical")||"";
  const business=await resolveOwnedSocialBusiness(env.DB,specialist.id,vertical);
  if(!business)return jsonResponse(409,{success:false,error:"business_profile_required"},headers);
  await ensureBusinessSocialSchema(env.DB);
  const rows=await env.DB.prepare(`
    SELECT * FROM hermes_business_social_creative_intakes
    WHERE business_key=? AND owner_specialist_id=?
    ORDER BY created_at DESC LIMIT 20
  `).bind(business.business_key,String(specialist.id)).all();
  const drive=await readBusinessSocialDriveConnection(env.DB,env,business,specialist.id);
  const aiConfigured=Boolean(String(env.HERMES_SOCIAL_AI_API_KEY||"").trim()&&String(env.HERMES_SOCIAL_AI_MODEL||"").trim());
  const aiState=!drive.configured?"drive_configuration_required":!drive.connected?"drive_authorization_required":!aiConfigured?"ai_configuration_required":"ready";
  return jsonResponse(200,{
    success:true,
    intakes:(rows?.results||[]).map(publicIntake),
    drive,
    ai:{
      state:aiState,
      auto_generation:drive.connected&&aiConfigured,
      model_configured:aiConfigured,
      note:aiState==="ready"
        ?"Drive ingestion and AI draft generation are ready. External publishing still requires human approval."
        :"Source registration is live. Drive ingestion and AI generation fail closed until both business-scoped Drive OAuth and the approved AI runtime are configured.",
    },
  },headers);
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"same_origin_required"},headers);
  if(!env.DB)return jsonResponse(503,{success:false,error:"database_not_configured"},headers);
  const specialist=await getAuthenticatedSpecialist(request,env.DB);
  if(!specialist)return jsonResponse(401,{success:false,error:"authentication_required"},headers);
  let body:Record<string,unknown>;
  try{body=await request.json() as Record<string,unknown>;}catch{return jsonResponse(400,{success:false,error:"invalid_json"},headers);}
  const business=await resolveOwnedSocialBusiness(env.DB,specialist.id,String(body.vertical||""));
  if(!business)return jsonResponse(409,{success:false,error:"business_profile_required"},headers);
  const sourceUrl=googleDriveUrl(body.source_url);
  if(!sourceUrl)return jsonResponse(400,{success:false,error:"google_drive_source_url_required"},headers);
  await ensureBusinessSocialSchema(env.DB);
  const id=`hbci_${crypto.randomUUID()}`;
  const now=new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO hermes_business_social_creative_intakes
      (id,business_key,owner_specialist_id,vertical_key,business_id,source_kind,source_url,brief,language,market,status,created_at,updated_at)
    VALUES (?,?,?,?,?,'google_drive',?,?,?,?, 'source_registered',?,?)
  `).bind(
    id,business.business_key,String(specialist.id),business.vertical_key,business.business_id,
    sourceUrl,clean(body.brief,4000),clean(body.language,40)||"en",clean(body.market,120)||null,now,now
  ).run();
  const row=await env.DB.prepare("SELECT * FROM hermes_business_social_creative_intakes WHERE id=? LIMIT 1").bind(id).first();
  const drive=await readBusinessSocialDriveConnection(env.DB,env,business,specialist.id);
  const aiConfigured=Boolean(String(env.HERMES_SOCIAL_AI_API_KEY||"").trim()&&String(env.HERMES_SOCIAL_AI_MODEL||"").trim());
  const nextGate=!drive.configured?"google_drive_configuration_required":!drive.connected?"google_drive_authorization_required":!aiConfigured?"social_ai_configuration_required":"ready_to_generate";
  return jsonResponse(201,{
    success:true,intake:publicIntake(row),drive,next_gate:nextGate,
    note:nextGate==="ready_to_generate"
      ?"Source registered. Drive and AI runtime are ready for owner-requested draft generation."
      :"The source is registered. No AI-generated copy, media, or publishing is claimed until the remaining authorization/configuration gate is complete.",
  },headers);
}
