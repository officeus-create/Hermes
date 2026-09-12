import { jsonResponse } from "../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";
import { ensureLoadBoardMarketPostSchema } from "../_lib/load-board-market-posts.mjs";
import { ensureRegistrationOpsSchema } from "../_lib/registration-ops.mjs";

type Env = { DB?: any };
const TARGET_EMAIL = "repair-booking-production-smoke@hermesconnect.app";
const privateHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestPost({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);

  await Promise.all([
    ensureHermesCompanyProfilesSchema(env.DB),
    ensureLoadBoardSchema(env.DB),
    ensureLoadBoardMarketPostSchema(env.DB),
    ensureRegistrationOpsSchema(env.DB),
  ]);

  const specialist = await env.DB.prepare("SELECT id FROM specialists WHERE lower(email)=lower(?) LIMIT 1")
    .bind(TARGET_EMAIL).first();
  if (!specialist) {
    return jsonResponse(200, {
      success: true,
      deleted: false,
      remaining: 0,
      synthetic: null,
      registration_alert_status: null,
    }, privateHeaders);
  }

  const specialistId = String(specialist.id);
  const flag = await env.DB.prepare("SELECT synthetic FROM hermes_registration_flags WHERE specialist_id=? LIMIT 1")
    .bind(specialistId).first();
  const alert = await env.DB.prepare("SELECT status FROM hermes_registration_alerts WHERE specialist_id=? AND kind='registration' LIMIT 1")
    .bind(specialistId).first();
  const company = await env.DB.prepare("SELECT id FROM hermes_company_profiles WHERE owner_specialist_id=? LIMIT 1")
    .bind(specialistId).first();
  const companyId = String(company?.id || "");

  if (companyId) {
    const posts = await env.DB.prepare("SELECT record_id FROM hermes_load_market_posts WHERE company_id=?")
      .bind(companyId).all();
    for (const post of posts?.results || []) {
      if (post?.record_id) await env.DB.prepare("DELETE FROM hermes_load_records WHERE id=?").bind(post.record_id).run();
    }
    await env.DB.prepare("DELETE FROM hermes_load_market_posts WHERE company_id=?").bind(companyId).run();
    await env.DB.prepare("DELETE FROM hermes_company_profiles WHERE id=? AND owner_specialist_id=?")
      .bind(companyId, specialistId).run();
  }

  await env.DB.prepare("DELETE FROM hermes_registration_alerts WHERE specialist_id=?").bind(specialistId).run();
  await env.DB.prepare("DELETE FROM hermes_registration_flags WHERE specialist_id=?").bind(specialistId).run();
  await env.DB.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(specialistId).run();
  await env.DB.prepare("DELETE FROM specialists WHERE id=? AND lower(email)=lower(?)").bind(specialistId, TARGET_EMAIL).run();

  const remaining = await env.DB.prepare("SELECT COUNT(*) AS count FROM specialists WHERE lower(email)=lower(?)")
    .bind(TARGET_EMAIL).first();
  const remainingCompany = await env.DB.prepare("SELECT COUNT(*) AS count FROM hermes_company_profiles WHERE owner_specialist_id=?")
    .bind(specialistId).first();
  if (Number(remaining?.count || 0) !== 0 || Number(remainingCompany?.count || 0) !== 0) {
    return jsonResponse(500, { success: false, error: "cleanup_verification_failed" }, privateHeaders);
  }

  return jsonResponse(200, {
    success: true,
    deleted: true,
    remaining: 0,
    synthetic: Number(flag?.synthetic || 0) === 1,
    registration_alert_status: String(alert?.status || "missing"),
    company_removed: true,
  }, privateHeaders);
}
