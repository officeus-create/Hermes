import { bearerToken, verifyGitHubFirst5ActivationOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRegistrationOpsSchema } from "../_lib/registration-ops.mjs";

type Env = { DB?: any };

const RECOVERY_OPERATION_ID = "recover_kittles_garage_trial_provisioning_2026_09_24";
const PROVISION_OPERATION_ID = "provision_kittles_garage_trial_2026_09_23";
const SHOP_NAME = "Kittle's Garage";
const STALE_AFTER_MS = 2 * 60 * 1000;

async function ensureReceiptSchema(db: any) {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS hermes_first5_provisioning_receipts (" +
    "operation_id TEXT PRIMARY KEY," +
    "specialist_id TEXT NOT NULL," +
    "status TEXT NOT NULL CHECK (status IN ('pending','completed'))," +
    "created_at TEXT NOT NULL," +
    "completed_at TEXT)"
  ).run();
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const token = bearerToken(request);
  if (!token || !await verifyGitHubFirst5ActivationOidcToken(token)) {
    return jsonResponse(403, { success: false, error: "operator_not_authorized" });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  if (String(body.operation || "") !== RECOVERY_OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" });
  }

  await ensureRepairShopProfileSchema(env.DB);
  await ensureRegistrationOpsSchema(env.DB);
  await ensureReceiptSchema(env.DB);

  const shopResult = await env.DB.prepare(
    "SELECT r.owner_specialist_id,s.role,COALESCE(f.synthetic,0) AS synthetic " +
    "FROM repair_shops r " +
    "JOIN specialists s ON s.id=r.owner_specialist_id " +
    "LEFT JOIN hermes_registration_flags f ON f.specialist_id=s.id " +
    "WHERE (REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(r.phone,''),'+',''),' ',''),'-',''),'(',''),')','') " +
    "IN ('5013761519','15013761519')) " +
    "OR (LOWER(TRIM(r.name))=LOWER(TRIM(?)) AND UPPER(COALESCE(r.state,''))='AR') LIMIT 5"
  ).bind(SHOP_NAME).all();

  const rows = Array.isArray(shopResult?.results) ? shopResult.results : [];
  if (rows.length === 0) return jsonResponse(404, { success: false, error: "production_shop_not_found" });
  if (rows.length !== 1) return jsonResponse(409, { success: false, error: "production_shop_ambiguous" });

  const row: any = rows[0];
  if (String(row.role || "") !== "Shop Owner") {
    return jsonResponse(409, { success: false, error: "owner_role_mismatch" });
  }
  if (Number(row.synthetic || 0) === 1) {
    return jsonResponse(409, { success: false, error: "synthetic_registration_rejected" });
  }

  const ownerId = String(row.owner_specialist_id || "");
  if (!ownerId) return jsonResponse(409, { success: false, error: "production_identity_incomplete" });

  const receipt: any = await env.DB.prepare(
    "SELECT specialist_id,status,created_at,completed_at FROM hermes_first5_provisioning_receipts " +
    "WHERE operation_id=? LIMIT 1"
  ).bind(PROVISION_OPERATION_ID).first();

  if (!receipt) {
    return jsonResponse(200, { success: true, recovery_state: "no_pending_receipt" });
  }
  if (String(receipt.specialist_id || "") !== ownerId) {
    return jsonResponse(409, { success: false, error: "provisioning_lock_owner_mismatch" });
  }
  if (String(receipt.status || "") === "completed") {
    return jsonResponse(200, { success: true, recovery_state: "already_completed" });
  }
  if (String(receipt.status || "") !== "pending") {
    return jsonResponse(409, { success: false, error: "provisioning_receipt_state_invalid" });
  }

  const createdAtMs = Date.parse(String(receipt.created_at || ""));
  if (!Number.isFinite(createdAtMs)) {
    return jsonResponse(409, { success: false, error: "provisioning_receipt_timestamp_invalid" });
  }
  const staleAgeMs = Date.now() - createdAtMs;
  if (staleAgeMs < STALE_AFTER_MS) {
    return jsonResponse(409, { success: false, error: "provisioning_lock_active" });
  }

  const deletion = await env.DB.prepare(
    "DELETE FROM hermes_first5_provisioning_receipts " +
    "WHERE operation_id=? AND specialist_id=? AND status='pending' AND created_at=?"
  ).bind(PROVISION_OPERATION_ID, ownerId, String(receipt.created_at)).run();

  if (Number(deletion?.meta?.changes || 0) !== 1) {
    return jsonResponse(409, { success: false, error: "provisioning_recovery_conflict" });
  }

  const readback = await env.DB.prepare(
    "SELECT status FROM hermes_first5_provisioning_receipts WHERE operation_id=? LIMIT 1"
  ).bind(PROVISION_OPERATION_ID).first();
  if (readback) {
    return jsonResponse(409, { success: false, error: "provisioning_recovery_readback_failed" });
  }

  return jsonResponse(200, {
    success: true,
    recovery_state: "stale_pending_cleared",
    stale_age_seconds: Math.floor(staleAgeMs / 1000),
  });
}
