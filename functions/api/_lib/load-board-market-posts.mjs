import { ensureHermesCompanyProfilesSchema } from "./hermes-company-profiles.mjs";
import { ensureInternalAiSchema } from "./internal-ai.mjs";

const CONTROL_CHARS = /[\u0000-\u001f\u007f<>]/g;
export const LOAD_POST_COMPANY_TYPES = new Set(["broker", "shipper", "dealer"]);
export const TRUCK_POST_COMPANY_TYPES = new Set(["carrier", "owner_operator", "fleet", "dispatcher"]);

export function cleanMarketText(value, max = 240) {
  return String(value ?? "").replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function sameOriginMutation(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const secFetchSite = request.headers.get("Sec-Fetch-Site");
  return secFetchSite !== "cross-site" && (!origin || origin === url.origin);
}

export async function ensureLoadBoardMarketPostSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_market_posts (
      id TEXT PRIMARY KEY,
      record_id TEXT NOT NULL UNIQUE,
      company_id TEXT NOT NULL,
      specialist_id TEXT NOT NULL,
      post_type TEXT NOT NULL CHECK (post_type IN ('load','capacity')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','expired')),
      rights_attested INTEGER NOT NULL DEFAULT 0 CHECK (rights_attested IN (0,1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_market_posts_company ON hermes_load_market_posts(company_id, status, updated_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_market_posts_record ON hermes_load_market_posts(record_id, status)").run();
}

export async function getOwnedHermesCompany(db, specialistId) {
  await ensureHermesCompanyProfilesSchema(db);
  return db.prepare(`
    SELECT id, company_name, company_type, city, state, catalog_status, load_board_access
    FROM hermes_company_profiles
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(specialistId).first();
}

export async function specialistHasInternalOwnerCapability(db, specialistId) {
  if (!db || !specialistId) return false;
  await ensureInternalAiSchema(db);
  const row = await db.prepare(`
    SELECT specialist_id
    FROM hermes_internal_owner_access
    WHERE specialist_id = ? AND active = 1 AND capability = 'HERMES_INTERNAL_OWNER'
    LIMIT 1
  `).bind(String(specialistId)).first();
  return Boolean(row);
}

export function canCompanyPost(companyType, postType, fullMarketplaceAccess = false) {
  if (fullMarketplaceAccess) return postType === "load" || postType === "capacity";
  const type = String(companyType || "");
  return postType === "load" ? LOAD_POST_COMPANY_TYPES.has(type) : TRUCK_POST_COMPANY_TYPES.has(type);
}

export function publicPostPermissions(companyType, fullMarketplaceAccess = false) {
  return {
    company_type: String(companyType || "other"),
    can_post_load: fullMarketplaceAccess || LOAD_POST_COMPANY_TYPES.has(String(companyType || "")),
    can_post_truck: fullMarketplaceAccess || TRUCK_POST_COMPANY_TYPES.has(String(companyType || "")),
    owner_full_marketplace_access: Boolean(fullMarketplaceAccess),
  };
}
