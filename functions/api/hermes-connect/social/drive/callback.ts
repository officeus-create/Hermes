import { getAuthenticatedSpecialist } from "../../../_lib/session.mjs";
import { resolveOwnedSocialBusiness } from "../../../_lib/business-social.mjs";
import {
  consumeBusinessSocialDriveOAuthState,
  exchangeBusinessSocialDriveCode,
  saveBusinessSocialDriveConnection,
} from "../../../_lib/business-social-drive.mjs";

type Env={DB?:any;GOOGLE_SOCIAL_DRIVE_CLIENT_ID?:string;GOOGLE_SOCIAL_DRIVE_CLIENT_SECRET?:string;GOOGLE_SOCIAL_DRIVE_REDIRECT_URI?:string;GOOGLE_SOCIAL_DRIVE_TOKEN_KEY?:string};

function socialRoute(vertical:string){
  if(vertical==="repair_shop")return "/services/hermes-connect/repair-shops/social/";
  if(vertical==="beauty_salon")return "/services/hermes-connect/beauty/workspace/social/";
  return "/services/hermes-connect/dealers/social/";
}
function redirect(request:Request,vertical:string,result:string){
  const url=new URL(socialRoute(vertical),request.url);
  url.searchParams.set("drive",result);
  return Response.redirect(url.toString(),302);
}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  if(!env.DB)return new Response("Database not configured.",{status:503});
  const specialist=await getAuthenticatedSpecialist(request,env.DB);
  if(!specialist)return new Response("Authentication required.",{status:401});
  const url=new URL(request.url);
  const providerError=url.searchParams.get("error");
  if(providerError)return redirect(request,"repair_shop","authorization_not_completed");
  const code=url.searchParams.get("code")||"";
  const state=url.searchParams.get("state")||"";
  if(!code||!state)return new Response("Google Drive authorization response is incomplete.",{status:400});

  const stored=await consumeBusinessSocialDriveOAuthState(env.DB,state);
  if(!stored)return new Response("Google Drive OAuth state is invalid or expired.",{status:400});
  const vertical=String(stored.vertical_key||"");
  if(String(stored.owner_specialist_id)!==String(specialist.id))return new Response("Owner authorization mismatch.",{status:403});
  const business=await resolveOwnedSocialBusiness(env.DB,specialist.id,vertical);
  if(!business||String(business.business_key)!==String(stored.business_key))return new Response("Business authorization mismatch.",{status:403});

  const exchange=await exchangeBusinessSocialDriveCode(env,code);
  if(!exchange.ok)return redirect(request,vertical,exchange.error_class||"authorization_failed");
  await saveBusinessSocialDriveConnection(env.DB,env,{business,ownerId:specialist.id,exchange});
  return redirect(request,vertical,"connected");
}
