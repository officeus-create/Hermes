import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { buildCommandCenterSocialSnapshot } from "../_lib/internal-command-center-social.mjs";

type Env={DB?:any;[key:string]:any};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"};

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const owner=await requireInternalOwner(request,env);
  if(owner.response)return owner.response;
  try{
    const snapshot=await buildCommandCenterSocialSnapshot(env);
    return jsonResponse(200,snapshot,headers);
  }catch{
    return jsonResponse(503,{success:false,error:"social_command_center_readback_unavailable"},headers);
  }
}
