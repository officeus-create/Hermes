import { bearerToken, verifyGitHubRepairAccessProofOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopAccessSchema, REPAIR_SHOP_PLAN_ID } from "../_lib/repair-shop-access.mjs";
import { ensureRegistrationOpsSchema } from "../_lib/registration-ops.mjs";

type Env = { DB?: any };

const OPERATION_ID = "repair_access_state_proof_2026_10_04";
const TEST_ID_RE = /^[0-9]{6,20}-[0-9]{1,3}$/;
const HEX64_RE = /^[0-9a-f]{64}$/;
const HEX32_RE = /^[0-9a-f]{32}$/;

function identity(testId: string) {
  return {
    specialistId: `specialist-access-smoke-${testId}`,
    shopId: `shop-access-smoke-${testId}`,
    slug: `hermes-access-smoke-${testId}`,
    email: `repair-access-production-smoke+${testId}@hermesconnect.app`,
  };
}

async function cleanup(db: any, ids: ReturnType<typeof identity>) {
  await db.batch([
    db.prepare("DELETE FROM repair_shop_access WHERE shop_id = ?").bind(ids.shopId),
    db.prepare("DELETE FROM sessions WHERE specialist_id = ?").bind(ids.specialistId),
    db.prepare("DELETE FROM repair_shops WHERE id = ? AND owner_specialist_id = ?").bind(ids.shopId, ids.specialistId),
    db.prepare("DELETE FROM hermes_registration_flags WHERE specialist_id = ?").bind(ids.specialistId),
    db.prepare("DELETE FROM specialists WHERE id = ? AND email = ?").bind(ids.specialistId, ids.email),
  ]);

  return db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM specialists WHERE id = ?) AS specialists_count,
      (SELECT COUNT(*) FROM sessions WHERE specialist_id = ?) AS sessions_count,
      (SELECT COUNT(*) FROM repair_shops WHERE id = ?) AS shops_count,
      (SELECT COUNT(*) FROM repair_shop_access WHERE shop_id = ?) AS access_count,
      (SELECT COUNT(*) FROM hermes_registration_flags WHERE specialist_id = ?) AS flags_count
  `).bind(ids.specialistId, ids.specialistId, ids.shopId, ids.shopId, ids.specialistId).first();
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const token = bearerToken(request);
  if (!token || !await verifyGitHubRepairAccessProofOidcToken(token)) {
    return jsonResponse(403, { success: false, error: "operator_not_authorized" });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  if (String(body.operation_id || "") !== OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" });
  }

  const action = String(body.action || "");
  const testId = String(body.test_id || "");
  if (!TEST_ID_RE.test(testId)) {
    return jsonResponse(400, { success: false, error: "invalid_test_id" });
  }

  await ensureRepairShopProfileSchema(env.DB);
  await ensureRepairShopAccessSchema(env.DB);
  await ensureRegistrationOpsSchema(env.DB);

  const ids = identity(testId);

  if (action === "setup") {
    const passwordHash = String(body.password_hash || "").toLowerCase();
    const passwordSalt = String(body.password_salt || "").toLowerCase();
    if (!HEX64_RE.test(passwordHash) || !HEX32_RE.test(passwordSalt)) {
      return jsonResponse(400, { success: false, error: "invalid_password_material" });
    }

    const prior = await cleanup(env.DB, ids);
    if (Number(prior?.specialists_count || 0) !== 0
      || Number(prior?.sessions_count || 0) !== 0
      || Number(prior?.shops_count || 0) !== 0
      || Number(prior?.access_count || 0) !== 0
      || Number(prior?.flags_count || 0) !== 0) {
      return jsonResponse(409, { success: false, error: "synthetic_cleanup_incomplete" });
    }

    const now = new Date().toISOString();
    const results = await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO specialists
          (id,email,password_hash,password_salt,name,role,location,bio,created_at)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).bind(
        ids.specialistId,
        ids.email,
        passwordHash,
        passwordSalt,
        "Hermes Access Smoke Owner",
        "Shop Owner",
        "United States",
        "Temporary production access-state verification account.",
        now,
      ),
      env.DB.prepare(`
        INSERT INTO repair_shops
          (id,owner_specialist_id,name,slug,phone,address_line1,city,state,postal_code,timezone,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        ids.shopId,
        ids.specialistId,
        "Hermes Access Smoke Shop",
        ids.slug,
        "+1 414 555 0195",
        "105 Access Test Way",
        "Milwaukee",
        "WI",
        "53202",
        "America/Chicago",
        now,
        now,
      ),
      env.DB.prepare(`
        INSERT INTO hermes_registration_flags
          (specialist_id,synthetic,reviewed_at,updated_at)
        VALUES (?,1,?,?)
        ON CONFLICT(specialist_id) DO UPDATE SET
          synthetic=1,
          reviewed_at=excluded.reviewed_at,
          updated_at=excluded.updated_at
      `).bind(ids.specialistId, now, now),
    ]);

    if (!Array.isArray(results) || results.some((result: any) => result?.success === false)) {
      await cleanup(env.DB, ids);
      return jsonResponse(409, { success: false, error: "synthetic_setup_failed" });
    }

    return jsonResponse(200, { success: true, action: "setup" });
  }

  const target = await env.DB.prepare(`
    SELECT r.id AS shop_id, r.owner_specialist_id, s.email, COALESCE(f.synthetic,0) AS synthetic
    FROM repair_shops r
    JOIN specialists s ON s.id = r.owner_specialist_id
    LEFT JOIN hermes_registration_flags f ON f.specialist_id = s.id
    WHERE r.id = ? AND r.owner_specialist_id = ? AND s.email = ?
    LIMIT 1
  `).bind(ids.shopId, ids.specialistId, ids.email).first();

  const exactSyntheticTarget =
    target?.shop_id === ids.shopId
    && target?.owner_specialist_id === ids.specialistId
    && target?.email === ids.email
    && Number(target?.synthetic || 0) === 1;

  if (action === "cleanup") {
    const remaining = await cleanup(env.DB, ids);
    const total =
      Number(remaining?.specialists_count || 0)
      + Number(remaining?.sessions_count || 0)
      + Number(remaining?.shops_count || 0)
      + Number(remaining?.access_count || 0)
      + Number(remaining?.flags_count || 0);
    return jsonResponse(total === 0 ? 200 : 409, {
      success: total === 0,
      action: "cleanup",
      remaining: total,
      error: total === 0 ? undefined : "cleanup_readback_failed",
    });
  }

  if (!exactSyntheticTarget) {
    return jsonResponse(404, { success: false, error: "synthetic_target_not_found" });
  }

  if (action === "founding") {
    const now = new Date().toISOString();
    await env.DB.prepare(`
      INSERT INTO repair_shop_access
        (shop_id,access_state,plan_id,started_at,current_period_end,updated_at)
      VALUES (?, 'founding', ?, ?, NULL, ?)
      ON CONFLICT(shop_id) DO UPDATE SET
        access_state='founding',
        plan_id=excluded.plan_id,
        current_period_end=NULL,
        updated_at=excluded.updated_at
    `).bind(ids.shopId, REPAIR_SHOP_PLAN_ID, now, now).run();
  } else if (action !== "readback") {
    return jsonResponse(400, { success: false, error: "unsupported_action" });
  }

  const access = await env.DB.prepare(`
    SELECT access_state, plan_id
    FROM repair_shop_access
    WHERE shop_id = ?
    LIMIT 1
  `).bind(ids.shopId).first();

  if (!access) {
    return jsonResponse(409, { success: false, error: "access_state_unavailable" });
  }

  return jsonResponse(200, {
    success: true,
    action,
    access_state: String(access.access_state || ""),
    plan_id: String(access.plan_id || ""),
  });
}
