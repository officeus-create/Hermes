import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import { ensureBusinessSocialSchema, resolveOwnedSocialBusiness } from "../../_lib/business-social.mjs";
import { readBusinessSocialDriveSource } from "../../_lib/business-social-drive.mjs";

type Env={
  DB?:any;
  AI?:any;
  GOOGLE_SOCIAL_DRIVE_CLIENT_ID?:string;
  GOOGLE_SOCIAL_DRIVE_CLIENT_SECRET?:string;
  GOOGLE_SOCIAL_DRIVE_REDIRECT_URI?:string;
  GOOGLE_SOCIAL_DRIVE_TOKEN_KEY?:string;
  HERMES_SOCIAL_CF_MODEL?:string;
};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow","Content-Type":"application/json; charset=utf-8"};
const clean=(value:unknown,max=240)=>String(value??"").trim().slice(0,max);
const DEFAULT_CF_MODEL="@cf/google/gemma-4-26b-a4b-it";
const SOCIAL_INSTRUCTIONS="You are Hermes Connect Social Studio. Use only supplied source material. Do not invent customers, revenue, rankings, percentages, prices, guarantees, integrations, or outcomes. Put uncertain claims in claims_to_verify. Decide the best content shape from the source instead of forcing a carousel. Return ONLY valid JSON with keys recommended_format (one of single_image, carousel, text_post, story_first, mixed), format_reason, recommended_destinations (subset of instagram_feed, instagram_story, threads_feed, facebook_feed), recommended_media_count (0-10), master_caption, threads_text, facebook_text, instagram_story_text, carousel_plan (array of 0-10 objects with headline, body, visual_direction; use 2-10 only when carousel is actually recommended), source_summary, claims_to_verify. Keep Threads text within 500 characters, adapt copy natively by platform, and recommend only surfaces that can truthfully carry the source.";

function outputText(payload:any){
  for(const value of [payload?.response,payload?.result?.response,payload?.output_text,payload?.choices?.[0]?.message?.content]){
    if(typeof value==="string"&&value.trim())return value.trim();
  }
  return "";
}
function parseJsonText(value:string){
  const raw=String(value||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");
  try{return JSON.parse(raw);}catch{return null;}
}
function safeDraft(value:any){
  if(!value||typeof value!=="object")return null;
  const allowedFormats=new Set(["single_image","carousel","text_post","story_first","mixed"]);
  const allowedDestinations=new Set(["instagram_feed","instagram_story","threads_feed","facebook_feed"]);
  const recommendedFormat=allowedFormats.has(String(value.recommended_format||""))?String(value.recommended_format):"mixed";
  const recommendedDestinations=Array.isArray(value.recommended_destinations)
    ? [...new Set(value.recommended_destinations.map((item:any)=>String(item||"").trim()).filter((item:string)=>allowedDestinations.has(item)))].slice(0,4)
    : [];
  const recommendedMediaCount=Math.max(0,Math.min(10,Math.round(Number(value.recommended_media_count||0)||0)));
  const carousel=Array.isArray(value.carousel_plan)?value.carousel_plan.slice(0,10).map((item:any)=>({
    headline:clean(item?.headline,120),body:clean(item?.body,320),visual_direction:clean(item?.visual_direction,320)
  })).filter((item:any)=>item.headline||item.body||item.visual_direction):[];
  const draft={
    recommended_format:recommendedFormat,
    format_reason:clean(value.format_reason,480),
    recommended_destinations:recommendedDestinations,
    recommended_media_count:recommendedMediaCount,
    master_caption:clean(value.master_caption,2200),
    threads_text:clean(value.threads_text,500),
    facebook_text:clean(value.facebook_text,5000),
    instagram_story_text:clean(value.instagram_story_text,500),
    carousel_plan:carousel,
    source_summary:clean(value.source_summary,1800),
    claims_to_verify:Array.isArray(value.claims_to_verify)?value.claims_to_verify.slice(0,12).map((v:any)=>clean(v,280)).filter(Boolean):[],
  };
  return draft.master_caption||draft.threads_text||draft.facebook_text||draft.instagram_story_text||carousel.length||draft.format_reason?draft:null;
}
function imageDocument(asset:any){
  const match=/^data:([^;,]+);base64,(.+)$/i.exec(String(asset?.data_url||""));
  if(!match)return null;
  try{
    const binary=atob(match[2]);const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i+=1)bytes[i]=binary.charCodeAt(i);
    return{name:clean(asset?.name,180)||"source-image",blob:new Blob([bytes],{type:clean(match[1],120)||"image/jpeg"})};
  }catch{return null;}
}
async function imageDescriptions(ai:any,imageAssets:any[]){
  if(!imageAssets.length||typeof ai?.toMarkdown!=="function")return[];
  const files=imageAssets.map(imageDocument).filter(Boolean);
  if(!files.length)return[];
  try{
    const converted=await ai.toMarkdown(files,{conversionOptions:{output:{format:"text"},image:{descriptionLanguage:"en"}}});
    const rows=Array.isArray(converted)?converted:[converted];
    return rows.slice(0,4).map((row:any,index)=>({
      name:clean(row?.name||files[index]?.name,180),
      description:clean(row?.data,5000),
    })).filter((row:any)=>row.description);
  }catch{return[];}
}
async function generateDraft(env:Env,context:any,imageAssets:any[]){
  if(!env.AI||typeof env.AI.run!=="function")return{ok:false,error_class:"social_ai_configuration_required"};
  const model=clean(env.HERMES_SOCIAL_CF_MODEL,160)||DEFAULT_CF_MODEL;
  const descriptions=await imageDescriptions(env.AI,imageAssets);
  try{
    const response=await env.AI.run(model,{
      messages:[
        {role:"system",content:SOCIAL_INSTRUCTIONS},
        {role:"user",content:JSON.stringify({...context,image_descriptions:descriptions})},
      ],
      temperature:0.3,
      max_completion_tokens:2600,
    },{rejectIfBusy:true});
    const draft=safeDraft(parseJsonText(outputText(response)));
    return draft?{ok:true,draft,provider:"cloudflare_workers_ai",model}:{ok:false,error_class:"social_ai_invalid_output"};
  }catch{return{ok:false,error_class:"social_ai_cloudflare_unavailable"};}
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

  const generated:any=await generateDraft(env,context,imageAssets);
  const now=new Date().toISOString();
  if(!generated.ok){
    await env.DB.prepare("UPDATE hermes_business_social_creative_intakes SET status='blocked',last_error_class=?,updated_at=? WHERE id=?")
      .bind(generated.error_class,now,intakeId).run();
    return jsonResponse(409,{success:false,error:generated.error_class},headers);
  }
  await env.DB.prepare("UPDATE hermes_business_social_creative_intakes SET status='draft_ready',draft_json=?,analyzed_at=?,last_error_class=NULL,updated_at=? WHERE id=?")
    .bind(JSON.stringify(generated.draft),now,now,intakeId).run();
  return jsonResponse(200,{
    success:true,intake_id:intakeId,status:"draft_ready",draft:generated.draft,
    ai:{provider:generated.provider,model:generated.model},
    source:{name:source.source?.name||null,asset_count:(source.assets||[]).length},
  },headers);
}
