import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";

const headers = { "Cache-Control":"private, no-store", "X-Robots-Tag":"noindex, nofollow" };

function sameOrigin(request: Request) {
  const origin=request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

// Legacy brand-connector publishing is intentionally disabled.
// Manual owner publishing belongs to the existing Business Social / Social Studio
// surface; recurring/autonomous execution belongs to HAE #2033. Both must
// converge on one shared provider implementation rather than keeping this route
// as an independent writer.
export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  if (!sameOrigin(request)) {
    return jsonResponse(403,{
      success:false,error:"invalid_origin",provider_write_performed:false,
    },headers);
  }
  const owner=await requireInternalOwner(request,env);
  if (owner.response) return owner.response;

  return jsonResponse(409,{
    success:false,
    error:"legacy_threads_brand_direct_publish_disabled",
    blocked:true,
    provider_write_performed:false,
    retry_allowed:false,
    architecture_owner:"github_issue_1018_growth_bridge",
    runtime_owner:"hae_2033",
    next_action:"use_owner_social_studio_or_approved_hae_job",
  },headers);
}
