import { ensureHermesCompanyProfilesSchema } from "./hermes-company-profiles.mjs";
import { ensureLoadBoardSchema } from "./load-board-schema.mjs";
import { specialistHasInternalOwnerCapability } from "./load-board-market-posts.mjs";

export const privateWorkspaceHeaders = Object.freeze({
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
});
export const CARRIER_TYPES = new Set(["carrier", "owner_operator", "fleet"]);
export const PARTNER_TYPES = new Set(["dealer", "shipper"]);
export const REQUEST_STATES = new Set(["requested", "seen", "reviewing", "unavailable", "declined"]);
export const cleanWorkspaceId = (value) => String(value || "").trim().replace(/[^a-zA-Z0-9_:-]/g, "").slice(0, 150);
export const safeWorkspaceText = (value, length = 250) =>
  String(value ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, length);
export function workspaceSameOrigin(request) {
  const url = new URL(request.url);
  return request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
    (!request.headers.get("Origin") || request.headers.get("Origin") === url.origin);
}
export async function ensureCarrierDispatchWorkspaceSchema(db) {
  await Promise.all([ensureHermesCompanyProfilesSchema(db), ensureLoadBoardSchema(db)]);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_carrier_board_entitlements (
      company_id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('active','revoked')),
      reviewed_by_specialist_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL,
      note TEXT
    )`).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_carrier_dispatch_assignments (
      carrier_company_id TEXT PRIMARY KEY,
      dispatcher_specialist_id TEXT NOT NULL,
      business_phone TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('active','revoked')),
      assigned_by_specialist_id TEXT NOT NULL,
      assigned_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dispatch_assignments_user ON hermes_carrier_dispatch_assignments(dispatcher_specialist_id,status)").run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_carrier_saved_loads (
      company_id TEXT NOT NULL,
      load_record_id TEXT NOT NULL,
      saved_by_specialist_id TEXT NOT NULL,
      saved_at TEXT NOT NULL,
      PRIMARY KEY(company_id,load_record_id)
    )`).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_carrier_dispatch_interests (
      id TEXT PRIMARY KEY,
      carrier_company_id TEXT NOT NULL,
      load_record_id TEXT NOT NULL,
      requested_by_specialist_id TEXT NOT NULL,
      dispatcher_specialist_id TEXT NOT NULL,
      carrier_message TEXT,
      status TEXT NOT NULL CHECK(status IN ('requested','seen','reviewing','unavailable','declined')),
      updated_by_specialist_id TEXT,
      status_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(carrier_company_id,load_record_id)
    )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dispatch_interests_queue ON hermes_carrier_dispatch_interests(dispatcher_specialist_id,status,updated_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dispatch_interests_company ON hermes_carrier_dispatch_interests(carrier_company_id,updated_at DESC)").run();
}

export async function getOwnedCarrier(db, specialist) {
  if (!specialist) return null;
  await ensureCarrierDispatchWorkspaceSchema(db);
  const result = await db.prepare(`
    SELECT c.id,c.company_name,c.company_type,c.load_board_access,e.status AS entitlement_status
    FROM hermes_company_profiles c
    LEFT JOIN hermes_carrier_board_entitlements e ON e.company_id=c.id
    WHERE c.owner_specialist_id=? LIMIT 1
  `).bind(specialist.id).first();
  return result && CARRIER_TYPES.has(String(result.company_type)) ? result : null;
}
export async function authorizedCarrier(db, specialist) {
  const company = await getOwnedCarrier(db, specialist);
  return company && Number(company.load_board_access) === 1 && company.entitlement_status === "active" ? company : null;
}
export async function verifiedAssignment(db, carrierCompanyId) {
  const row = await db.prepare(`
    SELECT a.dispatcher_specialist_id,a.business_phone,a.assigned_at,s.name,s.email
    FROM hermes_carrier_dispatch_assignments a
    JOIN specialists s ON s.id=a.dispatcher_specialist_id
    WHERE a.carrier_company_id=? AND a.status='active' LIMIT 1
  `).bind(carrierCompanyId).first();
  return row ? {
    dispatcherId: row.dispatcher_specialist_id,
    name: row.name || "Assigned Hermes dispatcher",
    businessPhone: row.business_phone,
    assignedAt: row.assigned_at,
  } : null;
}
export async function isApprovedDispatcher(db, specialist) {
  if (!specialist) return false;
  await ensureCarrierDispatchWorkspaceSchema(db);
  // Only an owner-capability operator or a specially provisioned assigned dispatcher.
  if (await specialistHasInternalOwnerCapability(db, specialist.id)) return true;
  const row = await db.prepare(`
    SELECT 1 AS allowed FROM hermes_carrier_dispatch_assignments
    WHERE dispatcher_specialist_id=? AND status='active' LIMIT 1
  `).bind(specialist.id).first();
  return Boolean(row);
}
export async function isVerifiedCarrierSpecialist(db, specialist) {
  return Boolean(await authorizedCarrier(db, specialist));
}
export async function eligibleLoad(db, loadId, now = new Date().toISOString()) {
  return db.prepare(`
    SELECT r.id,r.origin_city,r.origin_state,r.destination_city,r.destination_state,
      r.equipment,r.vehicle_count,r.pickup_window,r.rate_amount,r.rate_currency,
      r.distance_miles,r.observed_at,r.expires_at,r.visibility
    FROM hermes_load_records r
    JOIN hermes_load_sources s ON s.id=r.source_id
    WHERE r.id=? AND r.record_type='load'
      AND r.status='active' AND r.expires_at > ?
      AND r.visibility IN ('public','carrier_only')
      AND s.status='active' AND s.read_enabled=1
      AND s.redistribution_permission IN ('public','carrier_only')
    LIMIT 1
  `).bind(loadId, now).first();
}
export function carrierSafeLoad(row) {
  return {
    id: row.id,
    origin: [row.origin_city,row.origin_state].filter(Boolean).join(", ") || "Location under review",
    destination: [row.destination_city,row.destination_state].filter(Boolean).join(", ") || "Location under review",
    equipment: row.equipment,
    vehicleCount: row.vehicle_count === null ? null : Number(row.vehicle_count),
    pickupWindow: row.pickup_window || null,
    rate: row.rate_amount === null ? null : { amount: Number(row.rate_amount),currency: row.rate_currency || "USD",indicative: true },
    miles: row.distance_miles === null ? null : Number(row.distance_miles),
    observedAt: row.observed_at,
    expiresAt: row.expires_at,
    status: "available_for_dispatch_review",
    bookingAvailable: false,
  };
}
