import { getAuthenticatedSpecialist, jsonResponse } from "./session.mjs";
import { ensureRepairShopProfileSchema } from "./repair-shop-schema.mjs";
import { ensureRepairShopStaffSchema } from "./repair-shop-staff-schema.mjs";
import {
  ensureRepairShopGoogleCalendarSchema,
  encryptGoogleCalendarTokenPayload,
  googleCalendarRuntimeConfig,
  hashGoogleCalendarState,
  revokeGoogleCalendarConnection,
} from "./repair-shop-google-calendar.mjs";

const SUPPORTED_LOCALES = new Set(["en", "ru", "uk", "es", "it", "fr"]);
const STATE_TTL_MS = 10 * 60 * 1000;
const clean = (value, max = 240) => String(value ?? "").trim().slice(0, max);

export function normalizeGoogleCalendarReturnLocale(value) {
  const locale = clean(value, 8).toLowerCase();
  return SUPPORTED_LOCALES.has(locale) ? locale : "en";
}

export function googleCalendarSettingsPath(locale, result) {
  const lang = normalizeGoogleCalendarReturnLocale(locale);
  const status = clean(result, 64).replace(/[^a-z0-9_-]/gi, "") || "calendar_status";
  return `/services/hermes-connect/repair-shops/settings/?lang=${encodeURIComponent(lang)}&calendar=${encodeURIComponent(status)}#connections`;
}

export function googleCalendarSameOriginError(request) {
  const origin = clean(request.headers.get("origin"), 1024);
  if (!origin) return null;
  try {
    if (new URL(origin).origin === new URL(request.url).origin) return null;
  } catch {
    // handled below
  }
  return jsonResponse(403, { success: false, error: "invalid_origin" });
}

export async function requireGoogleCalendarOwner(request, env) {
  if (!env?.DB) return { response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  if (specialist.role !== "Shop Owner") return { response: jsonResponse(403, { success: false, error: "shop_owner_required" }) };

  await ensureRepairShopProfileSchema(env.DB);
  const shop = await env.DB
    .prepare("SELECT id,timezone FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1")
    .bind(specialist.id)
    .first();
  if (!shop) return { response: jsonResponse(409, { success: false, error: "shop_profile_required" }) };

  await ensureRepairShopStaffSchema(env.DB);
  await ensureRepairShopGoogleCalendarSchema(env.DB);
  return { specialist, shop };
}

export async function requireGoogleCalendarStaff(db, ownerId, shopId, staffId) {
  const id = clean(staffId, 96);
  if (!id) return null;
  return db
    .prepare("SELECT id,name,active FROM repair_shop_staff WHERE id=? AND owner_specialist_id=? AND shop_id=? LIMIT 1")
    .bind(id, ownerId, shopId)
    .first();
}

export async function createGoogleCalendarOAuthState(db, { shopId, ownerId, staffId, returnLang }) {
  await ensureRepairShopGoogleCalendarSchema(db);
  const rawState = `${crypto.randomUUID()}.${crypto.randomUUID()}`;
  const stateHash = await hashGoogleCalendarState(rawState);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + STATE_TTL_MS).toISOString();
  await db.prepare("DELETE FROM repair_shop_calendar_oauth_states WHERE expires_at <= ? OR owner_specialist_id = ?")
    .bind(now.toISOString(), ownerId)
    .run();
  await db.prepare(
    `INSERT INTO repair_shop_calendar_oauth_states
      (state_hash,shop_id,owner_specialist_id,staff_id,return_lang,expires_at,created_at)
     VALUES (?,?,?,?,?,?,?)`,
  ).bind(stateHash, shopId, ownerId, staffId, normalizeGoogleCalendarReturnLocale(returnLang), expiresAt, now.toISOString()).run();
  return rawState;
}

export async function consumeGoogleCalendarOAuthState(db, rawState) {
  await ensureRepairShopGoogleCalendarSchema(db);
  const stateHash = await hashGoogleCalendarState(rawState);
  const row = await db.prepare(
    `SELECT state_hash,shop_id,owner_specialist_id,staff_id,return_lang,expires_at
     FROM repair_shop_calendar_oauth_states WHERE state_hash=? LIMIT 1`,
  ).bind(stateHash).first();
  await db.prepare("DELETE FROM repair_shop_calendar_oauth_states WHERE state_hash=?").bind(stateHash).run();
  if (!row) return null;
  if (!Number.isFinite(Date.parse(String(row.expires_at))) || Date.parse(String(row.expires_at)) <= Date.now()) return null;
  return row;
}

export async function readGoogleCalendarConnectionState(db, { shopId, ownerId }) {
  await ensureRepairShopGoogleCalendarSchema(db);
  const result = await db.prepare(
    `SELECT staff_id,status,calendar_ref,granted_scope,token_expires_at,last_error_class,created_at,updated_at
     FROM repair_shop_calendar_connections
     WHERE shop_id=? AND owner_specialist_id=? AND provider='google'
     ORDER BY staff_id ASC`,
  ).bind(shopId, ownerId).all();
  return (result?.results || []).map((row) => ({
    staff_id: String(row.staff_id),
    state: String(row.status || "needs_authorization"),
    calendar_ref: String(row.calendar_ref || "primary"),
    scope: String(row.granted_scope || ""),
    token_expires_at: row.token_expires_at ? String(row.token_expires_at) : null,
    error_class: row.last_error_class ? String(row.last_error_class) : null,
    connected_at: row.created_at ? String(row.created_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  }));
}

export async function saveGoogleCalendarConnection(db, env, { shopId, ownerId, staffId, tokenPayload, scope, expiresAt }) {
  await ensureRepairShopGoogleCalendarSchema(db);
  const tokenCiphertext = await encryptGoogleCalendarTokenPayload(env, tokenPayload);
  const now = new Date().toISOString();
  const existing = await db.prepare(
    "SELECT id,created_at FROM repair_shop_calendar_connections WHERE shop_id=? AND staff_id=? AND provider='google' LIMIT 1",
  ).bind(shopId, staffId).first();
  const id = existing?.id ? String(existing.id) : `repair-calendar-${crypto.randomUUID()}`;
  const createdAt = existing?.created_at ? String(existing.created_at) : now;
  await db.prepare(
    `INSERT INTO repair_shop_calendar_connections
      (id,shop_id,owner_specialist_id,staff_id,provider,status,token_ciphertext,calendar_ref,granted_scope,token_expires_at,last_error_class,created_at,updated_at)
     VALUES (?,?,?,?,?,'connected',?,'primary',?,?,NULL,?,?)
     ON CONFLICT(shop_id,staff_id,provider) DO UPDATE SET
       owner_specialist_id=excluded.owner_specialist_id,
       status='connected',
       token_ciphertext=excluded.token_ciphertext,
       calendar_ref='primary',
       granted_scope=excluded.granted_scope,
       token_expires_at=excluded.token_expires_at,
       last_error_class=NULL,
       updated_at=excluded.updated_at`,
  ).bind(id, shopId, ownerId, staffId, "google", tokenCiphertext, clean(scope, 1000), expiresAt || null, createdAt, now).run();
}

export async function disconnectGoogleCalendar(db, env, { shopId, ownerId, staffId }) {
  await ensureRepairShopGoogleCalendarSchema(db);
  const connection = await db.prepare(
    `SELECT id,token_ciphertext FROM repair_shop_calendar_connections
     WHERE shop_id=? AND owner_specialist_id=? AND staff_id=? AND provider='google' LIMIT 1`,
  ).bind(shopId, ownerId, staffId).first();
  if (!connection) return false;
  await db.prepare(
    "DELETE FROM repair_shop_calendar_connections WHERE id=? AND shop_id=? AND owner_specialist_id=?",
  ).bind(connection.id, shopId, ownerId).run();
  await revokeGoogleCalendarConnection(env, connection.token_ciphertext);
  return true;
}

export function googleCalendarConfigurationState(env) {
  return googleCalendarRuntimeConfig(env) ? "ready" : "configuration_required";
}
