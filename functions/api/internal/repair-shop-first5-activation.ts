import { bearerToken, verifyGitHubFirst5ActivationOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRepairShopAccessSchema, REPAIR_SHOP_PLAN_ID } from "../_lib/repair-shop-access.mjs";
import { ensureRegistrationOpsSchema } from "../_lib/registration-ops.mjs";

type Env = { DB?: any };

const OPERATION_ID = "activate_kittles_garage_2026_09_23";
const PROFILE = {
  name: "Kittle's Garage",
  phone: "+1 501-376-1519",
  addressLine1: "1300 N Poplar St",
  city: "North Little Rock",
  state: "AR",
  postalCode: "72114",
  countryCode: "US",
  timezone: "America/Chicago",
  website: "http://www.kittlesgarage.com/",
};

const asRows = (value: any) => (Array.isArray(value?.results) ? value.results : []);

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
  if (String(body.operation || "") !== OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" });
  }

  await ensureRepairShopProfileSchema(env.DB);
  await ensureRepairShopAccessSchema(env.DB);
  await ensureRegistrationOpsSchema(env.DB);

  const match = await env.DB.prepare(`
    SELECT
      r.id,
      r.owner_specialist_id,
      r.slug,
      r.name,
      r.phone,
      s.role,
      COALESCE(f.synthetic,0) AS synthetic
    FROM repair_shops r
    JOIN specialists s ON s.id=r.owner_specialist_id
    LEFT JOIN hermes_registration_flags f ON f.specialist_id=s.id
    WHERE
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(r.phone,''),'+',''),' ',''),'-',''),'(',''),')','')
        IN ('5013761519','15013761519')
      OR (
        LOWER(TRIM(r.name))=LOWER(TRIM(?))
        AND UPPER(COALESCE(r.state,''))='AR'
      )
    LIMIT 5
  `).bind(PROFILE.name).all();

  const rows = asRows(match);
  if (rows.length === 0) {
    return jsonResponse(404, { success: false, error: "production_shop_not_found" });
  }
  if (rows.length !== 1) {
    return jsonResponse(409, { success: false, error: "production_shop_ambiguous" });
  }

  const row = rows[0];
  if (String(row.role || "") !== "Shop Owner") {
    return jsonResponse(409, { success: false, error: "owner_role_mismatch" });
  }
  if (Number(row.synthetic || 0) === 1) {
    return jsonResponse(409, { success: false, error: "synthetic_registration_rejected" });
  }

  const shopId = String(row.id || "");
  const ownerId = String(row.owner_specialist_id || "");
  const slug = String(row.slug || "");
  if (!shopId || !ownerId || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug)) {
    return jsonResponse(409, { success: false, error: "production_identity_incomplete" });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const nextReport = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const results = await env.DB.batch([
    env.DB.prepare(`
      UPDATE repair_shops
      SET
        name=?,
        phone=?,
        address_line1=?,
        city=?,
        state=?,
        region=?,
        country_code=?,
        postal_code=?,
        timezone=?,
        website=?,
        catalog_opt_in=1,
        catalog_opt_in_at=COALESCE(catalog_opt_in_at,?),
        catalog_published_at=COALESCE(catalog_published_at,?),
        seo_geo_started_at=COALESCE(seo_geo_started_at,?),
        next_seo_report_at=COALESCE(next_seo_report_at,?),
        updated_at=?
      WHERE id=? AND owner_specialist_id=?
    `).bind(
      PROFILE.name,
      PROFILE.phone,
      PROFILE.addressLine1,
      PROFILE.city,
      PROFILE.state,
      PROFILE.state,
      PROFILE.countryCode,
      PROFILE.postalCode,
      PROFILE.timezone,
      PROFILE.website,
      nowIso,
      nowIso,
      nowIso,
      nextReport,
      nowIso,
      shopId,
      ownerId,
    ),
    env.DB.prepare(`
      INSERT INTO repair_shop_access
        (shop_id,access_state,plan_id,started_at,current_period_end,updated_at)
      VALUES (?, 'trialing', ?, ?, NULL, ?)
      ON CONFLICT(shop_id) DO UPDATE SET
        access_state=CASE
          WHEN repair_shop_access.access_state IN ('founding','active','comped')
          THEN repair_shop_access.access_state
          ELSE 'trialing'
        END,
        plan_id=excluded.plan_id,
        updated_at=excluded.updated_at
    `).bind(shopId, REPAIR_SHOP_PLAN_ID, nowIso, nowIso),
    env.DB.prepare(`
      INSERT INTO hermes_registration_flags
        (specialist_id,synthetic,reviewed_at,updated_at)
      VALUES (?,0,?,?)
      ON CONFLICT(specialist_id) DO UPDATE SET
        reviewed_at=excluded.reviewed_at,
        updated_at=excluded.updated_at
    `).bind(ownerId, nowIso, nowIso),
  ]);

  if (Number(results?.[0]?.meta?.changes || 0) !== 1) {
    return jsonResponse(409, { success: false, error: "profile_update_conflict" });
  }

  const readback = await env.DB.prepare(`
    SELECT
      r.name,
      r.slug,
      r.phone,
      r.address_line1,
      r.city,
      r.state,
      r.country_code,
      r.postal_code,
      r.timezone,
      r.website,
      r.catalog_opt_in,
      r.catalog_published_at,
      r.seo_geo_started_at,
      r.next_seo_report_at,
      a.access_state,
      a.plan_id
    FROM repair_shops r
    LEFT JOIN repair_shop_access a ON a.shop_id=r.id
    WHERE r.id=? AND r.owner_specialist_id=?
    LIMIT 1
  `).bind(shopId, ownerId).first();

  const accessState = String(readback?.access_state || "");
  const validAccess = new Set(["trialing", "founding", "active", "comped"]);
  const readbackOk =
    readback?.name === PROFILE.name &&
    readback?.phone === PROFILE.phone &&
    readback?.address_line1 === PROFILE.addressLine1 &&
    readback?.city === PROFILE.city &&
    readback?.state === PROFILE.state &&
    readback?.country_code === PROFILE.countryCode &&
    readback?.postal_code === PROFILE.postalCode &&
    readback?.timezone === PROFILE.timezone &&
    readback?.website === PROFILE.website &&
    Number(readback?.catalog_opt_in || 0) === 1 &&
    readback?.plan_id === REPAIR_SHOP_PLAN_ID &&
    validAccess.has(accessState);

  if (!readbackOk) {
    return jsonResponse(409, { success: false, error: "activation_readback_mismatch" });
  }

  return jsonResponse(200, {
    success: true,
    business_name: PROFILE.name,
    city: PROFILE.city,
    state: PROFILE.state,
    access_state: accessState,
    plan_id: REPAIR_SHOP_PLAN_ID,
    catalog_opt_in: true,
    public_profile_path: `/businesses/connect/repair-shop/${slug}/`,
  });
}
