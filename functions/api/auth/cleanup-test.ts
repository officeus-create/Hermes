import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

const TARGET_ID = "specialist-01ceaa4d-cf68-405a-a65a-de1e0dc88491";
const TARGET_EMAIL = "repair-auth-test-1786748818-31849184929@hermesconnect.app";

export async function onRequestPost({ env }: { env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const target = await env.DB
    .prepare("SELECT id,email FROM specialists WHERE id = ? AND email = ?")
    .bind(TARGET_ID, TARGET_EMAIL)
    .first();

  if (!target) return jsonResponse(200, { success: true, deleted: false, already_absent: true });

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
