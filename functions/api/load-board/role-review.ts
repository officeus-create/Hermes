import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  ensureLoadBoardReviewerSchema, roleReviewAccess, REVIEW_HEADERS,
  REVIEW_ROLES, REVIEW_KINDS, safeReviewNote, sameOriginRoleReview,
} from "../_lib/load-board-role-review.mjs";

type Context={request:Request;env:{DB?:any}};
const reply=(status:number,data:Record<string,unknown>)=>jsonResponse(status,data,REVIEW_HEADERS);

async function authorize(context:Context){
  if(!context.env.DB)return {error:reply(503,{success:false,error:"database_not_configured"})};
  const specialist=await getAuthenticatedSpecialist(context.request,context.env.DB);
  if(!specialist)return {error:reply(401,{success:false,error:"authentication_required"})};
  const access=await roleReviewAccess(context.env.DB,specialist);
  if(!access.allowed)return {error:reply(403,{success:false,error:"load_board_reviewer_approval_required"})};
  await ensureLoadBoardReviewerSchema(context.env.DB);
  return {specialist,access};
}

export async function onRequestGet(context:Context){
  const identity=await authorize(context);if(identity.error)return identity.error;
  const url=new URL(context.request.url);
  const role=String(url.searchParams.get("role")||"carrier");
  if(!REVIEW_ROLES.has(role))return reply(400,{success:false,error:"invalid_review_role"});
  if(role==="sources"&&!identity.access.owner)return reply(403,{success:false,error:"owner_only_source_review"});
  const rows=await context.env.DB.prepare(`
    SELECT f.id,f.view_role,f.kind,f.author_label,f.review_note,f.created_at,
      s.email AS account_email
    FROM hermes_load_board_role_feedback f
    JOIN specialists s ON s.id=f.reviewer_specialist_id
    WHERE f.view_role=? ORDER BY f.created_at DESC LIMIT 100
  `).bind(role).all();
  return reply(200,{
    success:true,role,canReview:true,owner:identity.access.owner,
    feedback:(rows.results||[]).map((r:any)=>({
      id:r.id,role:r.view_role,kind:r.kind,authorLabel:r.author_label,
      note:r.review_note,createdAt:r.created_at,accountEmail:r.account_email,
    })),
    disclosure:"Author label on a shared login is self-reported; account email is the audited identity.",
  });
}

export async function onRequestPost(context:Context){
  if(!sameOriginRoleReview(context.request))return reply(403,{success:false,error:"same_origin_required"});
  const identity=await authorize(context);if(identity.error)return identity.error;
  let body:Record<string,unknown>;
  try{body=await context.request.json() as Record<string,unknown>;}
  catch{return reply(400,{success:false,error:"invalid_json"});}
  const role=String(body.role||"");
  const kind=String(body.kind||"idea");
  const note=safeReviewNote(body.note,1300);
  const authorLabel=safeReviewNote(body.authorLabel,75);
  if(!REVIEW_ROLES.has(role)||!REVIEW_KINDS.has(kind))
    return reply(400,{success:false,error:"invalid_role_or_kind"});
  if(role==="sources"&&!identity.access.owner)return reply(403,{success:false,error:"owner_only_source_review"});
  if(note.length<12||authorLabel.length<2)
    return reply(400,{success:false,error:"note_and_reviewer_name_required"});
  const id=`hlbr_${crypto.randomUUID()}`;
  const createdAt=new Date().toISOString();
  await context.env.DB.prepare(`
    INSERT INTO hermes_load_board_role_feedback
      (id,reviewer_specialist_id,view_role,kind,author_label,review_note,created_at)
    VALUES (?,?,?,?,?,?,?)
  `).bind(id,identity.specialist.id,role,kind,authorLabel,note,createdAt).run();
  return reply(201,{
    success:true,feedback:{id,role,kind,authorLabel,note,createdAt},
    bookingCreated:false,externalMessageSent:false,
  });
}
