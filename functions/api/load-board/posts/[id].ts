import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../../_lib/load-board-schema.mjs";
import {
  ensureLoadBoardMarketPostSchema,
  getOwnedHermesCompany,
  sameOriginMutation,
} from "../../_lib/load-board-market-posts.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env; params: { id?: string } };
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestDelete({ request, env, params }: Context) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, privateHeaders);

  await ensureLoadBoardSchema(env.DB);
  await ensureLoadBoardMarketPostSchema(env.DB);
  const company = await getOwnedHermesCompany(env.DB, specialist.id);
  if (!company || Number(company.load_board_access) !== 1) {
    return jsonResponse(403, { success: false, error: "registered_company_required" }, privateHeaders);
  }

  const postId = String(params?.id || "").trim().slice(0, 120);
  if (!postId) return jsonResponse(400, { success: false, error: "post_id_required" }, privateHeaders);
  const post = await env.DB.prepare(`
    SELECT id, record_id, status
    FROM hermes_load_market_posts
    WHERE id = ? AND company_id = ?
    LIMIT 1
  `).bind(postId, company.id).first();
  if (!post) return jsonResponse(404, { success: false, error: "post_not_found" }, privateHeaders);

  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE hermes_load_market_posts SET status = 'archived', updated_at = ? WHERE id = ? AND company_id = ?")
    .bind(now, postId, company.id).run();
  await env.DB.prepare("UPDATE hermes_load_records SET status = 'archived', updated_at = ? WHERE id = ?")
    .bind(now, post.record_id).run();

  return jsonResponse(200, {
    success: true,
    post: { id: postId, record_id: post.record_id, status: "archived" },
  }, privateHeaders);
}
