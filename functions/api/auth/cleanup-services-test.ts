import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

const TARGET_ID = "specialist-cdb93a6b-1e9d-4e2d-9714-40414c98a002";
const TARGET_EMAIL = "repair-services-test-1786750333-31850701722@hermesconnect.app";

export async function onRequestPost({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const target = await env.DB
    .prepare("SELECT id,email FROM specialists WHERE id = ? AND email = ?")
    .bind(TARGET_ID, TARGET_EMAIL)
    .first();

  if (!target) return jsonResponse(200, { success: true, deleted: false, already_absent: true });

  const serviceCount = await env.DB
    .prepare("SELECT COUNT(*) AS count FROM services WHERE owner_specialist_id = ?")
    .bind(TARGET_ID)
    .first();
  if (Number(serviceCount?.count || 0) !== 0) {
    return jsonResponse(409, { success: false, error: "test_services_still_exist" });
  }

  await env.DB.prepare("DELETE FROM sessions WHERE specialist_id = ?").bind(TARGET_ID).run();
  await env.DB.prepare("DELETE FROM specialists WHERE id = ? AND email = ?").bind(TARGET_ID, TARGET_EMAIL).run();

  const remaining = await env.DB
    .prepare("SELECT COUNT(*) AS count FROM specialists WHERE id = ? AND email = ?")
    .bind(TARGET_ID, TARGET_EMAIL)
    .first();

  if (Number(remaining?.count || 0) !== 0) {
    return jsonResponse(500, { success: false, error: "cleanup_verification_failed" });
  }

  return jsonResponse(200, { success: true, deleted: true });
}
