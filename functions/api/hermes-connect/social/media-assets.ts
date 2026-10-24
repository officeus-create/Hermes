import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import { ensureBusinessSocialSchema, resolveOwnedSocialBusiness } from "../../_lib/business-social.mjs";

type Env = { DB?: any };

const PRIVATE_HEADERS={ "Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow" };
const PUBLIC_HEADERS={
  "Content-Type":"image/jpeg",
  "Cache-Control":"public, max-age=3600",
  "X-Robots-Tag":"noindex, nofollow, noarchive",
  "X-Content-Type-Options":"nosniff",
};
const MAX_JPEG_BYTES=1_250_000;
const MAX_ASSETS_PER_INTAKE=10;
const ASSET_TTL_MS=72*60*60*1000;

function clean(value:unknown,max=240){return String(value??"").trim().slice(0,max);}
function decodeBase64(value:string){
  const binary=atob(value);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i+=1)bytes[i]=binary.charCodeAt(i);
  return bytes;
}
function encodeBase64Url(bytes:Uint8Array){
  let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
async function sha256(value:Uint8Array){
  return encodeBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256",value)));
}
function jpegBytes(value:unknown){
  const raw=String(value||"").trim();
  const match=/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/i.exec(raw);
  if(!match)return null;
  let bytes:Uint8Array;try{bytes=decodeBase64(match[1]);}catch{return null;}
  if(bytes.byteLength<4||bytes.byteLength>MAX_JPEG_BYTES)return null;
  if(bytes[0]!==0xff||bytes[1]!==0xd8||bytes[bytes.length-2]!==0xff||bytes[bytes.length-1]!==0xd9)return null;
  return{bytes,base64:match[1]};
}
function publicUrl(request:Request,id:string){
  const url=new URL(request.url);
  url.search="";
  url.searchParams.set("id",id);
  return url.toString();
}
async function cleanupExpired(db:any){
  try{await db.prepare("DELETE FROM hermes_business_social_media_assets WHERE expires_at<=?").bind(new Date().toISOString()).run();}catch{}
}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  if(!env.DB)return new Response("Not found",{status:404,headers:PUBLIC_HEADERS});
  const id=clean(new URL(request.url).searchParams.get("id"),96);
  if(!/^hbsm_[a-f0-9]{32}$/i.test(id))return new Response("Not found",{status:404,headers:PUBLIC_HEADERS});
  await ensureBusinessSocialSchema(env.DB);
  const row=await env.DB.prepare(`
    SELECT mime_type,content_base64,expires_at,status
    FROM hermes_business_social_media_assets
    WHERE id=? LIMIT 1
  `).bind(id).first();
  if(!row||String(row.status)!=="ready_public")return new Response("Not found",{status:404,headers:PUBLIC_HEADERS});
  const expires=Date.parse(String(row.expires_at||""));
  if(!Number.isFinite(expires)||expires<=Date.now()){
    try{await env.DB.prepare("DELETE FROM hermes_business_social_media_assets WHERE id=?").bind(id).run();}catch{}
    return new Response("Expired",{status:410,headers:PUBLIC_HEADERS});
  }
  let bytes:Uint8Array;try{bytes=decodeBase64(String(row.content_base64||""));}catch{return new Response("Not found",{status:404,headers:PUBLIC_HEADERS});}
  return new Response(bytes,{status:200,headers:{...PUBLIC_HEADERS,"Content-Length":String(bytes.byteLength)}});
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"same_origin_required"},PRIVATE_HEADERS);
  if(!env.DB)return jsonResponse(503,{success:false,error:"database_not_configured"},PRIVATE_HEADERS);
  const specialist=await getAuthenticatedSpecialist(request,env.DB);
  if(!specialist)return jsonResponse(401,{success:false,error:"authentication_required"},PRIVATE_HEADERS);

  let body:Record<string,unknown>;
  try{body=await request.json() as Record<string,unknown>;}catch{return jsonResponse(400,{success:false,error:"invalid_json"},PRIVATE_HEADERS);}
  const business=await resolveOwnedSocialBusiness(env.DB,specialist.id,String(body.vertical||""));
  if(!business)return jsonResponse(409,{success:false,error:"business_profile_required"},PRIVATE_HEADERS);
  const intakeId=clean(body.intake_id,96);
  if(!/^hbci_[0-9a-f-]{36}$/i.test(intakeId))return jsonResponse(400,{success:false,error:"creative_intake_id_required"},PRIVATE_HEADERS);
  const slideIndex=Math.max(0,Math.min(9,Math.round(Number(body.slide_index)||0)));
  const width=Math.max(320,Math.min(1920,Math.round(Number(body.width)||0)));
  const height=Math.max(320,Math.min(2400,Math.round(Number(body.height)||0)));
  if(!width||!height)return jsonResponse(400,{success:false,error:"media_dimensions_invalid"},PRIVATE_HEADERS);
  const image=jpegBytes(body.data_url);
  if(!image)return jsonResponse(400,{success:false,error:"jpeg_required_or_asset_too_large",max_bytes:MAX_JPEG_BYTES},PRIVATE_HEADERS);

  await ensureBusinessSocialSchema(env.DB);
  await cleanupExpired(env.DB);
  const intake=await env.DB.prepare(`
    SELECT id,status FROM hermes_business_social_creative_intakes
    WHERE id=? AND business_key=? AND owner_specialist_id=? LIMIT 1
  `).bind(intakeId,business.business_key,String(specialist.id)).first();
  if(!intake)return jsonResponse(404,{success:false,error:"creative_intake_not_found"},PRIVATE_HEADERS);
  if(!["draft_ready","source_registered"].includes(String(intake.status||""))){
    return jsonResponse(409,{success:false,error:"creative_intake_not_renderable"},PRIVATE_HEADERS);
  }
  const countRow=await env.DB.prepare(`
    SELECT COUNT(*) AS count FROM hermes_business_social_media_assets
    WHERE intake_id=? AND business_key=? AND expires_at>?
  `).bind(intakeId,business.business_key,new Date().toISOString()).first();
  if(Number(countRow?.count||0)>=MAX_ASSETS_PER_INTAKE){
    return jsonResponse(409,{success:false,error:"creative_media_limit_reached",max_assets:MAX_ASSETS_PER_INTAKE},PRIVATE_HEADERS);
  }

  const digest=await sha256(image.bytes);
  const existing=await env.DB.prepare(`
    SELECT id,width,height,slide_index,expires_at FROM hermes_business_social_media_assets
    WHERE business_key=? AND content_sha256=? AND expires_at>? LIMIT 1
  `).bind(business.business_key,digest,new Date().toISOString()).first();
  if(existing){
    return jsonResponse(200,{success:true,duplicate:true,asset:{
      id:String(existing.id),url:publicUrl(request,String(existing.id)),width:Number(existing.width),height:Number(existing.height),
      slide_index:Number(existing.slide_index),expires_at:String(existing.expires_at),
    }},PRIVATE_HEADERS);
  }

  const id=`hbsm_${crypto.randomUUID().replaceAll("-","")}`;
  const now=new Date();
  const expiresAt=new Date(now.getTime()+ASSET_TTL_MS).toISOString();
  await env.DB.prepare(`
    INSERT INTO hermes_business_social_media_assets
      (id,business_key,owner_specialist_id,intake_id,mime_type,width,height,slide_index,content_sha256,content_base64,status,expires_at,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,'ready_public',?,?,?)
  `).bind(
    id,business.business_key,String(specialist.id),intakeId,"image/jpeg",width,height,slideIndex,digest,image.base64,
    expiresAt,now.toISOString(),now.toISOString()
  ).run();
  return jsonResponse(201,{success:true,duplicate:false,asset:{
    id,url:publicUrl(request,id),width,height,slide_index:slideIndex,expires_at:expiresAt,
    note:"Short-lived public JPEG created for owner-approved social publishing. It expires automatically after 72 hours.",
  }},PRIVATE_HEADERS);
}
