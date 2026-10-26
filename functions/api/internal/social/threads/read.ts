// Owner-only read path; never publishes, replies, follows or edits Threads content.
// Canonical social/growth owner: GitHub #1018.
import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  normalizeThreadsBrand,
  usableThreadsAccessToken,
} from "../../../_lib/threads-brand-connector.mjs";
import {
  parsePublicThreadsPostUrl,
  threadsConversationRead,
  threadsOwnedRead,
  threadsReadMode,
  threadsRequiredScope,
  threadsResolvePublicPost,
  threadsSearchRead,
} from "../../../_lib/threads-discovery.mjs";

type Env = {
  DB?: any;
  THREADS_BRAND_APP_ID?: string;
  THREADS_BRAND_APP_SECRET?: string;
  THREADS_BRAND_REDIRECT_URI?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
  THREADS_BRAND_SCOPES?: string;
};
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);

  const url = new URL(request.url);
  const brand = normalizeThreadsBrand(url.searchParams.get("brand"));
  const mode = threadsReadMode(url.searchParams.get("mode"));
  if (!brand || !mode) return jsonResponse(400, { success: false, error: "brand_and_mode_required" }, headers);

  const postUrl = url.searchParams.get("post_url") || "";
  const threadId = url.searchParams.get("thread_id") || "";
  if (mode === "thread" && Boolean(postUrl) === Boolean(threadId)) {
    return jsonResponse(400, { success: false, error: "provide_exactly_one_post_url_or_thread_id" }, headers);
  }
  if (postUrl && !parsePublicThreadsPostUrl(postUrl)) {
    return jsonResponse(400, { success: false, error: "invalid_public_post_url" }, headers);
  }
  if (mode === "search" && (url.searchParams.get("q") || "").trim().length < 2) {
    return jsonResponse(400, { success: false, error: "query_too_short" }, headers);
  }

  // Do not ask Meta for public search/profile discovery without the precise approved scopes.
  const token: any = await usableThreadsAccessToken(env.DB, env, brand);
  if (!token.ok) return jsonResponse(409, { success: false, error: token.error_class }, headers);
  const scopes = new Set(String(token.connection.granted_scope || "").split(/[\s,]+/).filter(Boolean));
  const missing = threadsRequiredScope(mode, Boolean(postUrl)).filter(scope => !scopes.has(scope));
  if (missing.length) {
    return jsonResponse(403, {
      success: false, error: "threads_provider_scope_required", missing_scopes: missing,
      next_action: "complete_owner_meta_app_review_and_reconnect_account",
    }, headers);
  }

  let result: any;
  if (mode === "search") {
    result = await threadsSearchRead({
      token: token.access_token, query: url.searchParams.get("q"),
      searchType: url.searchParams.get("search_type") === "TOP" ? "TOP" : "RECENT",
      limit: Number(url.searchParams.get("limit") || 25),
    });
  } else if (mode === "owned") {
    result = await threadsOwnedRead({ token: token.access_token });
  } else {
    let realId = threadId;
    let resolvedPost = null;
    if (postUrl) {
      const resolved: any = await threadsResolvePublicPost({ token: token.access_token, postUrl });
      if (!resolved.ok) {
        return jsonResponse(resolved.error === "invalid_public_post_url" ? 400 : 424, {
          success: false, error: resolved.error, pages_checked: resolved.pages_checked || 0,
          provider_status: resolved.provider_status || null,
          complete: resolved.complete ?? false,
        }, headers);
      }
      realId = resolved.post.id;
      resolvedPost = resolved.post;
    }
    result = await threadsConversationRead({ token: token.access_token, threadId: realId });
    if (result.ok && resolvedPost) result.source_post = resolvedPost;
  }

  if (!result.ok) {
    const status = result.error === "provider_permission_denied" ? 403 :
      result.error === "provider_rate_limited" ? 429 :
      result.error === "invalid_threads_media_id" || result.error === "query_too_short" ? 400 : 502;
    return jsonResponse(status, { success: false, ...result }, headers);
  }
  return jsonResponse(200, {
    success: true, brand, ...result,
    read_only: true, provider_write_performed: false,
    coverage_note: "Search and third-party conversations depend on Meta app review, API visibility and pagination; complete=false is not an exhaustive archive.",
  }, headers);
}
