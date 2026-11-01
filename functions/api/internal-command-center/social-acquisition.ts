import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

async function safeAll(db:any, sql:string) {
  try {
    const result = await db.prepare(sql).all();
    return { state:"CONNECTED", rows: result?.results || [] };
  } catch (error:any) {
    return { state:"SOURCE_UNAVAILABLE", rows:[], error_class:String(error?.name || "Error") };
  }
}

export async function onRequestGet({ request, env }:{ request:Request; env:Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503,{success:false,error:"database_not_configured"},headers);

  const [content, publications] = await Promise.all([
    safeAll(env.DB, `SELECT content_id,account_key,platform,slot_key,template_id,variant_key,state,
      provider_post_id,permalink,last_error_class,created_at,updated_at
      FROM hermes_automation_content
      ORDER BY updated_at DESC LIMIT 30`),
    safeAll(env.DB, `SELECT content_id,account_key,platform,status,attempt_count,readback_attempt,next_readback_at,
      provider_post_id,permalink,last_error_class,created_at,updated_at
      FROM hermes_automation_publications
      ORDER BY updated_at DESC LIMIT 30`),
  ]);

  return jsonResponse(200,{
    success:true,
    checked_at:new Date().toISOString(),
    architecture_owner:"HAE_2033_SHARED_SOCIAL_RUNTIME",
    source_policy:"READ_ONLY_CANONICAL_HAE_D1_NO_SECOND_SOCIAL_STORE",
    publication_policy:{
      automatic_external_publish_authorized:false,
      automatic_reply_authorized:false,
      reply_capability:"social.reply.prepare",
      reply_permission_class:"DRAFT_ONLY",
    },
    content_queue:{
      source_state:content.state,
      items:content.rows,
    },
    publication_receipts:{
      source_state:publications.state,
      items:publications.rows,
    },
    carrier_leads:{
      source_state:"UNKNOWN",
      count:null,
      reason:"NO_CANONICAL_CROSS_SOURCE_CARRIER_LEAD_AGGREGATE",
    },
  },headers);
}
