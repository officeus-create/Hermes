import {getAuthenticatedSpecialist,jsonResponse} from "../_lib/session.mjs";
import {ensureCarrierDispatchWorkspaceSchema,isApprovedDispatcher,privateWorkspaceHeaders,safeWorkspaceText,workspaceSameOrigin} from "../_lib/carrier-dispatch-workspace.mjs";
type Context={request:Request;env:{DB?:any}};
const respond=(code:number,data:Record<string,unknown>)=>jsonResponse(code,data,privateWorkspaceHeaders);
const AREAS=new Set(["carrier","dispatcher","dealer_shipper","broker","source"]);
async function authorized(context:Context){
 if(!context.env.DB)return {error:respond(503,{success:false,error:"database_not_configured"})};
 const specialist=await getAuthenticatedSpecialist(context.request,context.env.DB);
 if(!specialist)return {error:respond(401,{success:false,error:"authentication_required"})};
 if(!(await isApprovedDispatcher(context.env.DB,specialist)))return {error:respond(403,{success:false,error:"dispatcher_access_required"})};
 await ensureCarrierDispatchWorkspaceSchema(context.env.DB);
 await context.env.DB.prepare(`
  CREATE TABLE IF NOT EXISTS hermes_load_board_staff_feedback (
   id TEXT PRIMARY KEY, author_specialist_id TEXT NOT NULL,
   area TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL
  )`).run();
 return {specialist};
}
export async function onRequestGet(context:Context){
 const auth=await authorized(context);if(auth.error)return auth.error;
 const result=await context.env.DB.prepare(`
  SELECT f.id,f.area,f.note,f.created_at,f.author_specialist_id,s.name AS author_name
  FROM hermes_load_board_staff_feedback f
  JOIN specialists s ON s.id=f.author_specialist_id
  ORDER BY f.created_at DESC LIMIT 100
 `).all();
 return respond(200,{success:true,feedback:(result.results||[]).map((row:any)=>({
  id:row.id,area:row.area,note:row.note,createdAt:row.created_at,
  authorName:row.author_name||"Hermes dispatcher",isOwn:row.author_specialist_id===auth.specialist.id
 }))});
}
export async function onRequestPost(context:Context){
 if(!workspaceSameOrigin(context.request))return respond(403,{success:false,error:"same_origin_required"});
 const auth=await authorized(context);if(auth.error)return auth.error;
 let input:Record<string,unknown>;
 try{input=await context.request.json() as Record<string,unknown>}
 catch{return respond(400,{success:false,error:"invalid_json"})}
 const area=String(input.area||"");const note=safeWorkspaceText(input.note,1200);
 if(!AREAS.has(area)||note.length<10)return respond(400,{success:false,error:"area_and_note_required"});
 const id="hlbf_"+crypto.randomUUID(),createdAt=new Date().toISOString();
 await context.env.DB.prepare(`
 INSERT INTO hermes_load_board_staff_feedback
 (id,author_specialist_id,area,note,created_at) VALUES(?,?,?,?,?)
 `).bind(id,auth.specialist.id,area,note,createdAt).run();
 return respond(201,{success:true,feedback:{id,area,note,createdAt},
  externalMessageSent:false,bookingCreated:false});
}