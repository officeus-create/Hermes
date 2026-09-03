import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopSalesAttributionSchema } from "../_lib/repair-shop-sales-attribution.mjs";
import {
  deliverTelegramRegistrationAlert,
  ensureRegistrationOpsSchema,
  syncSyntheticFlagForAccount,
} from "../_lib/registration-ops.mjs";

type Env = {
  DB?: any;
  HERMES_CONNECT_TELEGRAM_BOT_TOKEN?: string;
  HERMES_CONNECT_TELEGRAM_OWNER_CHAT_ID?: string;
  HERMES_SYNTHETIC_ACCOUNT_EMAILS?: string;
};

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

const cleanId = (value: unknown) => {
  const id = String(value ?? "").trim();
  return /^specialist-[A-Za-z0-9-]{8,120}$/.test(id) ? id : "";
};

async function ensureSchemas(db: any) {
  await ensureRegistrationOpsSchema(db);
  await ensureRepairShopProfileSchema(db);
  await ensureRepairShopSalesAttributionSchema(db);
}

async function syncConfiguredSyntheticAccounts(db: any, env: Env) {
  const emails = [...new Set(
    String(env.HERMES_SYNTHETIC_ACCOUNT_EMAILS || "")
      .split(/[;,\n]/)
      .map((value) => value.trim().toLowerCase())
      .filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)),
  )].slice(0, 50);
  for (const email of emails) {
    const row = await db.prepare("SELECT id, email, created_at FROM specialists WHERE email = ? LIMIT 1").bind(email).first();
    if (row?.id) {
      await syncSyntheticFlagForAccount({ db, env, specialistId: row.id, email: row.email, createdAt: row.created_at });
    }
  }
}

async function registrationSummary(db: any) {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return db.prepare(`
    SELECT
      SUM(CASE WHEN COALESCE(f.synthetic,0)=0 THEN 1 ELSE 0 END) AS total_real,
      SUM(CASE WHEN COALESCE(f.synthetic,0)=0 AND s.created_at>=? THEN 1 ELSE 0 END) AS today,
      SUM(CASE WHEN COALESCE(f.synthetic,0)=0 AND s.created_at>=? THEN 1 ELSE 0 END) AS last_7d,
      SUM(CASE WHEN COALESCE(f.synthetic,0)=0 AND s.created_at>=? THEN 1 ELSE 0 END) AS last_30d,
      SUM(CASE WHEN COALESCE(f.synthetic,0)=0 AND f.reviewed_at IS NULL THEN 1 ELSE 0 END) AS unreviewed,
      SUM(CASE WHEN COALESCE(f.synthetic,0)=1 THEN 1 ELSE 0 END) AS synthetic
    FROM specialists s
    LEFT JOIN hermes_registration_flags f ON f.specialist_id=s.id
  `).bind(todayStart, sevenDaysAgo, thirtyDaysAgo).first();
}

async function registrationRows(db: any) {
  const result = await db.prepare(`
    SELECT
      s.id, s.name, s.email, s.role, s.location, s.created_at,
      rs.name AS shop_name, rs.phone, rs.city, rs.state, rs.updated_at AS shop_updated_at,
      a.salesperson_code, a.source,
      COALESCE(f.synthetic,0) AS synthetic, f.reviewed_at,
      ra.status AS registration_alert_status, ra.sent_at AS registration_alert_sent_at, ra.last_error AS registration_alert_error
    FROM specialists s
    LEFT JOIN repair_shops rs ON rs.owner_specialist_id=s.id
    LEFT JOIN repair_shop_sales_attribution a ON a.owner_specialist_id=s.id
    LEFT JOIN hermes_registration_flags f ON f.specialist_id=s.id
    LEFT JOIN hermes_registration_alerts ra ON ra.id=('registration:' || s.id)
    ORDER BY s.created_at DESC
    LIMIT 250
  `).all();
  return Array.isArray(result?.results) ? result.results : [];
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureSchemas(env.DB);
  await syncConfiguredSyntheticAccounts(env.DB, env);
  const [summary, registrations] = await Promise.all([registrationSummary(env.DB), registrationRows(env.DB)]);
  return jsonResponse(200, {
    success: true,
    summary: {
      total_real: Number(summary?.total_real || 0),
      today: Number(summary?.today || 0),
      last_7d: Number(summary?.last_7d || 0),
      last_30d: Number(summary?.last_30d || 0),
      unreviewed: Number(summary?.unreviewed || 0),
      synthetic: Number(summary?.synthetic || 0),
      today_basis: "UTC",
    },
    registrations,
  });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureSchemas(env.DB);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const specialistId = cleanId(body.specialist_id);
  if (!specialistId) return jsonResponse(400, { success: false, error: "invalid_specialist_id" });
  const exists = await env.DB.prepare("SELECT id FROM specialists WHERE id=? LIMIT 1").bind(specialistId).first();
  if (!exists) return jsonResponse(404, { success: false, error: "registration_not_found" });

  const action = String(body.action || "").trim();
  if (action === "review") {
    const now = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO hermes_registration_flags (specialist_id, synthetic, reviewed_at, updated_at)
      VALUES (?, 0, ?, ?)
      ON CONFLICT(specialist_id) DO UPDATE SET reviewed_at=excluded.reviewed_at, updated_at=excluded.updated_at`)
      .bind(specialistId, now, now).run();
    return jsonResponse(200, { success: true, specialist_id: specialistId, reviewed_at: now });
  }

  if (action === "set_synthetic") {
    if (typeof body.synthetic !== "boolean") return jsonResponse(400, { success: false, error: "synthetic_boolean_required" });
    const now = new Date().toISOString();
    const synthetic = body.synthetic ? 1 : 0;
    await env.DB.prepare(`INSERT INTO hermes_registration_flags (specialist_id, synthetic, reviewed_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(specialist_id) DO UPDATE SET synthetic=excluded.synthetic, reviewed_at=excluded.reviewed_at, updated_at=excluded.updated_at`)
      .bind(specialistId, synthetic, now, now).run();
    if (synthetic) {
      await env.DB.prepare(`UPDATE hermes_registration_alerts SET status='skipped', last_error='synthetic_excluded', updated_at=?
        WHERE specialist_id=? AND status IN ('pending','failed')`).bind(now, specialistId).run();
    }
    return jsonResponse(200, { success: true, specialist_id: specialistId, synthetic: Boolean(synthetic) });
  }

  if (action === "retry_registration_alert") {
    const result = await deliverTelegramRegistrationAlert({ db: env.DB, env, specialistId, kind: "registration" });
    return jsonResponse(result.ok ? 200 : 503, { success: result.ok, specialist_id: specialistId, alert: result });
  }

  return jsonResponse(400, { success: false, error: "unsupported_action" });
}
