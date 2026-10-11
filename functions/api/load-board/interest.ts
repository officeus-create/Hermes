import {onRequestPost as carrierPost} from "./carrier-workspace";
import {jsonResponse} from "../_lib/session.mjs";

// Keep the historic Load Board CTA compatible without creating a second interest queue.
// Authorization, idempotency, assigned-dispatcher evidence and freshness are enforced by
// the canonical carrier-workspace handler.
export async function onRequestPost({request,env}:{request:Request;env:{DB?:any}}){
  let body:Record<string,unknown>;
  try{body=await request.json() as Record<string,unknown>;}
  catch{return jsonResponse(400,{success:false,error:"invalid_json"},{ "Cache-Control":"private, no-store" });}
  const adapted=new Request(request.url,{
    method:"POST",headers:request.headers,
    body:JSON.stringify({action:"interest",loadId:body.load_id||body.loadId,message:body.message||""}),
  });
  return carrierPost({request:adapted,env});
}
