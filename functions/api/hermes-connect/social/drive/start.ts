import { getAuthenticatedSpecialist, jsonResponse } from "../../../_lib/session.mjs";
import { sameOriginMutation } from "../../../_lib/load-board-market-posts.mjs";
import { resolveOwnedSocialBusiness } from "../../../_lib/business-social.mjs";
import {
  businessSocialDriveAuthorizationUrl,
  createBusinessSocialDriveOAuthState,
  googleSocialDriveRuntimeConfig,
} from "../../../_lib/business-social-drive.mjs";

type Env={DB?:any;GOOGLE_SOCIAL_DRIVE_CLIENT_ID?:string;GOOGLE_SOCIAL_DRIVE_CLIENT_SECRET?:string;GOOGLE_SOCIAL_DRIVE_REDIRECT_URI?:string;GOOGLE_SOCIAL_DRIVE_TOKEN_KEY?:string};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"same_origin_required"},headers);
  if(!env.DB)return jsonResponse(503,{success:false,error:"database_not_configured"},headers);
  const specialist=await getAuthenticatedSpecialist(request,env.DB);
  if(!specialist)return jsonResponse(401,{success:false,error:"authentication_required"},headers);
  if(!googleSocialDriveRuntimeConfig(env))return jsonResponse(409,{success:false,error:"google_drive_configuration_required"},headers);
  let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>;}catch{return jsonResponse(400,{success:false,error:"invalid_json"},headers);}
  const business=await resolveOwnedSocialBusiness(env.DB,specialist.id,String(body.vertical||""));
  if(!business)return jsonResponse(409,{success:false,error:"business_profile_required"},headers);
  const state=await createBusinessSocialDriveOAuthState(env.DB,{business,ownerId:specialist.id});
  const authorizationUrl=businessSocialDriveAuthorizationUrl(env,state);
  if(!authorizationUrl)return jsonResponse(409,{success:false,error:"google_drive_configuration_required"},headers);
  return jsonResponse(200,{success:true,state:"authorizing",authorization_url:authorizationUrl},headers);
}
