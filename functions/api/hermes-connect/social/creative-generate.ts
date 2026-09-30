import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import { ensureBusinessSocialSchema, resolveOwnedSocialBusiness } from "../../_lib/business-social.mjs";
import { readBusinessSocialDriveSource } from "../../_lib/business-social-drive.mjs";

type Env={DB?:any;GOOGLE_SOCIAL_DRIVE_CLIENT_ID?:string;GOOGLE_SOCIAL_DRIVE_CLIENT_SECRET?:string;GOOGLE_SOCIAL_DRIVE_REDIRECT_URI?:string;GOOGLE_SOCIAL_DRIVE_TOKEN_KEY?:string;HERMES_SOCIAL_AI_API_KEY?:string;HERMES_SOCIAL_AI_MODEL?:string};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow","Content-Type":"application/json; charset=utf-8"};
const clean=(value:unknown,max=240)=>String(value??"").trim().slice(0,max);

function extractOutputText(payload:any){
  if(typeof payload?.output_text==="string"&&payload.output_text.trim())return payload.output_text.trim();
  const chunks=[];
  for(const item of payload?.output||[]){
    for(const part of item?.content||[]){
      if(typeof part?.text==="string")chunks.push(part.text);
    }
  }
  return chunks.join("\n").trim();
}
function parseJsonText(value:string){
  const raw=String(value||"").trim().replace(/^\`\`\`(?:json)?\s*/i,"").replace(/\s*\`\`\`$/,"");
  try{return JSON.parse(raw);}catch{return null;}
}
function safeDraft(value:any){
  if(!value||typeof value!=="object")return null;
  const carousel=Array.isArray(value.carousel_plan)?value.carousel_plan.slice(0,10).map((item:any)=>({
    headline:clean(item?.headline,120),body:clean(item?.body,320),visual_direction:clean(item?.visual_direction,320)
  })).filter((item:any)=>item.headline||item.body||item.visual_direction):[];
  const draft={
    master_caption:clean(value.master_caption,2200),
    threads_text:clean(value.threads_text,500),
    facebook_text:clean(value.facebook_text,5000),
    instagram_story_text:clean(value.instagram_story_text,500),
    carousel_plan:carousel,
    source_summary:clean(value.source_summary,1800),
    claims_to_verify:Array.isArray(value.claims_to_verify)?value.claims_to_verify.slice(0,12).map((v:any)=>clean(v,280)).filter(Boolean):[],
  };
  if(!draft.master_caption&&!draft.threads_text&&!draft.facebook_text&&!carousel.length)return null;
  return draft;
}

async function generateDraft(env:Env,inputParts:any[]){
  const apiKey=clean(env.HERMES_SOCIAL_AI_API_KEY,4096);
  const model=clean(env.HERMES_SOCIAL_AI_MODEL,120);
  if(!apiKey||!model)return{ok:false,error_class:"social_ai_configuration_required"};
  const response=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},
    body:JSON.stringify({
      model,
      input:[{
        role:"user",
        content:inputParts,
      }],
      instructions:"You are Hermes Connect Social Studio. Use only the supplied source material. Do not invent customers, revenue, rankings, percentages, prices, guarantees, integrations, or outcomes. If a claim is uncertain, put it in claims_to_verify instead of asserting it. Return ONLY valid JSON with keys master_caption, threads_text, facebook_text, instagram_story_text, carousel_plan (array of 2-10 objects with headline, body, visual_direction), source_summary, claims_to_verify. Keep Threads text within 500 characters and make each platform copy native rather than identical.",
      temperature:0.3,
    })
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)return{ok:false,error_class:"social_ai_provider_rejected"};
  const parsed=parseJsonText(extractOutputText(payload));
  const draft=safeDraft(parsed);
  return draft?{ok:true,draft}:{ok:false,error_class:"social_ai_invalid_output"};
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"same_origin_required"},headers);
  if(!env.DB)return jsonResponse(503,{success:false,error:"database_not_configured"},headers);
  const specialist=await getAuthenticatedSpecialist(request,env.DB);
  if(!specialist)return jsonResponse(401,{success:false,error:"authentication_required"},headers);
  let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>;}catch{return jsonResponse(400,{success:false,error:"invalid_json"},headers);}
  const business=await resolveOwnedSocialBusiness(env.DB,specialist.id,String(body.vertical||""));
  if(!business)return jsonResponse(409,{success:false,error:"business_profile_required"},headers);
  const intakeId=clean(body.intake_id,120);
  if(!intakeId)return jsonResponse(400,{success:false,error:"creative_intake_id_required"},headers);
  await ensureBusinessSocialSchema(env.DB);
  const intake=await env.DB.prepare("SELECT * FROM hermes_business_social_creative_intakes WHERE id=? AND business_key=? AND owner_specialist_id=? LIMIT 1")
    .bind(intakeId,business.business_key,String(specialist.id)).first();
  if(!intake)return jsonResponse(404,{success:false,error:"creative_intake_not_found"},headers);

  const source:any=await readBusinessSocialDriveSource(env.DB,env,business,specialist.id,String(intake.source_url||""));
  if(!source.ok){
    await env.DB.prepare("UPDATE hermes_business_social_creative_intakes SET status='blocked',last_error_class=?,updated_at=? WHERE id=?")
      .bind(source.error_class,new Date().toISOString(),intakeId).run();
    return jsonResponse(409,{success:false,error:source.error_class},headers);
  }

  const textAssets=(source.assets||[]).filter((asset:any)=>asset.kind==="text").slice(0,8);
  const imageAssets=(source.assets||[]).filter((asset:any)=>asset.kind==="image").slice(0,4);
  const context={
    business_name:business.business_name,
    vertical:business.vertical_key,
    city:business.city||null,
    state:business.state||null,
    language:String(intake.language||"en"),
    market:intake.market||null,
    brief:intake.brief||null,
    source_name:source.source?.name||null,
    text_sources:textAssets.map((asset:any)=>({name:asset.name,mime_type:asset.mime_type,text:String(asset.text||"").slice(0,12000)})),
    non_text_assets:(source.assets||[]).filter((asset:any)=>asset.kind!=="text"&&asset.kind!=="image").map((asset:any)=>({name:asset.name,mime_type:asset.mime_type})).slice(0,10),
  };
  const inputParts:any[]=[{type:"input_text",text:JSON.stringify(context)}];
  for(const asset of imageAssets)inputParts.push({type:"input_image",image_url:asset.data_url,detail:"low"});

  const generated=await generateDraft(env,inputParts);
  const now=new Date().toISOString();
  if(!generated.ok){
    await env.DB.prepare("UPDATE hermes_business_social_creative_intakes SET status='blocked',last_error_class=?,updated_at=? WHERE id=?")
      .bind(generated.error_class,now,intakeId).run();
    return jsonResponse(409,{success:false,error:generated.error_class},headers);
  }
  await env.DB.prepare("UPDATE hermes_business_social_creative_intakes SET status='draft_ready',draft_json=?,analyzed_at=?,last_error_class=NULL,updated_at=? WHERE id=?")
    .bind(JSON.stringify(generated.draft),now,now,intakeId).run();
  return jsonResponse(200,{success:true,intake_id:intakeId,status:"draft_ready",draft:generated.draft,source:{name:source.source?.name||null,asset_count:(source.assets||[]).length}},headers);
}
