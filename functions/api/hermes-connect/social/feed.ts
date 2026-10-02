import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  getBusinessSocialCredential,
  resolveOwnedSocialBusiness,
} from "../../_lib/business-social.mjs";
import { readRecentSocialMedia } from "../../_lib/business-social-studio.mjs";

type Env = {
  DB?: any;
  HERMES_SOCIAL_TOKEN_KEY?: string;
  HERMES_META_GRAPH_VERSION?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
};

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const providers = ["instagram","facebook","threads"];

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503,{success:false,error:"database_not_configured"},headers);
  const specialist=await getAuthenticatedSpecialist(request,env.DB);
  if(!specialist) return jsonResponse(401,{success:false,error:"authentication_required"},headers);
  const url=new URL(request.url);
  const business=await resolveOwnedSocialBusiness(env.DB,specialist.id,url.searchParams.get("vertical")||"");
  if(!business) return jsonResponse(409,{success:false,error:"business_profile_required"},headers);
  const output:any={};
  for(const provider of providers){
    const credential=await getBusinessSocialCredential(env.DB,env,business,provider,specialist.id);
    if(!credential.ok){
      output[provider]={connected:false,error:credential.error_class,items:[]};
      continue;
    }
    const recent=await readRecentSocialMedia(env,credential.payload,provider,6);
    output[provider]={connected:true,error:recent.ok?null:recent.error_class,items:recent.items||[]};
  }
  return jsonResponse(200,{success:true,business:{name:business.business_name,vertical:business.vertical_key},feeds:output},headers);
}
