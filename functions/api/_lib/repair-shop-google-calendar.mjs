const PROVIDER = "google";
const FREEBUSY_SCOPE = "https://www.googleapis.com/auth/calendar.freebusy";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const FREEBUSY_ENDPOINT = "https://www.googleapis.com/calendar/v3/freeBusy";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function clean(value, max = 240) {
  return String(value ?? "").trim().slice(0, max);
}

export function googleCalendarRuntimeConfig(env) {
  const clientId = clean(env?.GOOGLE_CALENDAR_CLIENT_ID, 512);
  const clientSecret = clean(env?.GOOGLE_CALENDAR_CLIENT_SECRET, 512);
  const redirectUri = clean(env?.GOOGLE_CALENDAR_REDIRECT_URI, 1024);
  const tokenKey = clean(env?.GOOGLE_CALENDAR_TOKEN_KEY, 1024);
  if (!clientId || !clientSecret || !redirectUri || !tokenKey) return null;
  return { clientId, clientSecret, redirectUri, tokenKey };
}

async function importTokenKey(rawKey) {
  let bytes;
  try { bytes = base64ToBytes(rawKey); } catch { return null; }
  if (bytes.byteLength !== 32) return null;
  return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptGoogleCalendarTokenPayload(env, payload) {
  const config = googleCalendarRuntimeConfig(env);
  if (!config) throw new Error("google_calendar_runtime_not_configured");
  const key = await importTokenKey(config.tokenKey);
  if (!key) throw new Error("google_calendar_token_key_invalid");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(payload)));
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptGoogleCalendarTokenPayload(env, value) {
  const config = googleCalendarRuntimeConfig(env);
  if (!config) throw new Error("google_calendar_runtime_not_configured");
  const key = await importTokenKey(config.tokenKey);
  if (!key) throw new Error("google_calendar_token_key_invalid");
  const parts = String(value || "").split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new Error("google_calendar_token_payload_invalid");
  const iv = base64ToBytes(parts[1]);
  const ciphertext = base64ToBytes(parts[2]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  const payload = JSON.parse(decoder.decode(plaintext));
  if (!payload || typeof payload !== "object") throw new Error("google_calendar_token_payload_invalid");
  return payload;
}

export async function hashGoogleCalendarState(rawState) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(rawState || "")));
  return bytesToBase64(new Uint8Array(digest));
}

export async function ensureRepairShopGoogleCalendarSchema(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS repair_shop_calendar_connections (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'google',
      status TEXT NOT NULL DEFAULT 'connected',
      token_ciphertext TEXT NOT NULL,
      calendar_ref TEXT NOT NULL DEFAULT 'primary',
      granted_scope TEXT,
      token_expires_at TEXT,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(shop_id, staff_id, provider)
    )`,
  ).run();
  await db.prepare(
    `CREATE INDEX IF NOT EXISTS idx_repair_shop_calendar_connections_shop
     ON repair_shop_calendar_connections(shop_id, owner_specialist_id, provider, status)`,
  ).run();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS repair_shop_calendar_oauth_states (
      state_hash TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      return_lang TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
  ).run();
}

export function googleCalendarAuthorizationUrl(env, rawState) {
  const config = googleCalendarRuntimeConfig(env);
  if (!config) return null;
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", FREEBUSY_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", rawState);
  return url.toString();
}

export async function exchangeGoogleCalendarCode(env, code) {
  const config = googleCalendarRuntimeConfig(env);
  if (!config) return { ok: false, error_class: "runtime_not_configured" };
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.access_token) return { ok: false, error_class: "authorization_exchange_failed" };
    const expiresAt = new Date(Date.now() + Math.max(60, Number(data.expires_in || 3600)) * 1000).toISOString();
    return {
      ok: true,
      payload: {
        access_token: String(data.access_token),
        refresh_token: data.refresh_token ? String(data.refresh_token) : null,
        expires_at: expiresAt,
      },
      scope: clean(data.scope || FREEBUSY_SCOPE, 1000),
      expires_at: expiresAt,
    };
  } catch {
    return { ok: false, error_class: "authorization_exchange_unavailable" };
  }
}

async function refreshAccessToken(env, payload) {
  const config = googleCalendarRuntimeConfig(env);
  if (!config) return { ok: false, error_class: "runtime_not_configured" };
  const refreshToken = clean(payload?.refresh_token, 4096);
  if (!refreshToken) return { ok: false, error_class: "authorization_required" };
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "refresh_token",
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.access_token) {
      const invalid = data?.error === "invalid_grant";
      return { ok: false, error_class: invalid ? "authorization_required" : "token_refresh_failed" };
    }
    const expiresAt = new Date(Date.now() + Math.max(60, Number(data.expires_in || 3600)) * 1000).toISOString();
    return {
      ok: true,
      payload: { access_token: String(data.access_token), refresh_token: refreshToken, expires_at: expiresAt },
      expires_at: expiresAt,
    };
  } catch {
    return { ok: false, error_class: "token_refresh_unavailable" };
  }
}

function localParts(instant, timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const pick = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
  return { year: pick("year"), month: pick("month"), day: pick("day"), hour: pick("hour"), minute: pick("minute"), second: pick("second") };
}

export function zonedLocalToIso(date, time, timezone) {
  const [year, month, day] = String(date).split("-").map(Number);
  const [hour, minute] = String(time).split(":").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let candidate = desiredUtc;
  for (let index = 0; index < 3; index += 1) {
    const parts = localParts(new Date(candidate), timezone);
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    candidate += desiredUtc - represented;
  }
  return new Date(candidate).toISOString();
}

function isoToLocalClock(value, timezone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const hour = parts.find((part) => part.type === "hour")?.value || "00";
  const minute = parts.find((part) => part.type === "minute")?.value || "00";
  return `${hour}:${minute}`;
}

async function usableAccessToken(db, env, connection) {
  let payload;
  try { payload = await decryptGoogleCalendarTokenPayload(env, connection.token_ciphertext); }
  catch { return { ok: false, error_class: "token_decrypt_failed" }; }
  const expiresMs = Date.parse(String(payload?.expires_at || connection.token_expires_at || ""));
  if (payload?.access_token && Number.isFinite(expiresMs) && expiresMs > Date.now() + 60_000) {
    return { ok: true, access_token: String(payload.access_token) };
  }
  const refreshed = await refreshAccessToken(env, payload);
  if (!refreshed.ok) return refreshed;
  const tokenCiphertext = await encryptGoogleCalendarTokenPayload(env, refreshed.payload);
  await db.prepare(
    `UPDATE repair_shop_calendar_connections
     SET token_ciphertext=?, token_expires_at=?, status='connected', last_error_class=NULL, updated_at=?
     WHERE id=?`,
  ).bind(tokenCiphertext, refreshed.expires_at, new Date().toISOString(), connection.id).run();
  return { ok: true, access_token: String(refreshed.payload.access_token) };
}

async function fetchFreeBusy(accessToken, calendarRef, timeMin, timeMax) {
  try {
    const response = await fetch(FREEBUSY_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarRef || "primary" }] }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error_class: response.status === 401 || response.status === 403 ? "authorization_required" : "provider_unavailable" };
    const busy = data?.calendars?.[calendarRef || "primary"]?.busy;
    if (!Array.isArray(busy)) return { ok: false, error_class: "provider_response_invalid" };
    return {
      ok: true,
      busy: busy
        .map((item) => ({ start: clean(item?.start, 80), end: clean(item?.end, 80) }))
        .filter((item) => item.start && item.end),
    };
  } catch {
    return { ok: false, error_class: "provider_unavailable" };
  }
}

export async function readGoogleBusyIntervalsForDate(db, env, { shopId, ownerId, staffIds, date, timezone }) {
  await ensureRepairShopGoogleCalendarSchema(db);
  if (!googleCalendarRuntimeConfig(env)) return { intervals: [], source: "local_only", connected: false, error_class: "runtime_not_configured" };
  const result = await db.prepare(
    `SELECT id,staff_id,status,token_ciphertext,token_expires_at,calendar_ref
     FROM repair_shop_calendar_connections
     WHERE shop_id=? AND owner_specialist_id=? AND provider='google' AND status IN ('connected','degraded','needs_authorization')`,
  ).bind(shopId, ownerId).all();
  const allowedStaff = new Set((staffIds || []).map(String));
  const connections = (result?.results || []).filter((row) => allowedStaff.has(String(row.staff_id)));
  if (!connections.length) return { intervals: [], source: "local_only", connected: false, error_class: null };

  const timeMin = zonedLocalToIso(date, "00:00", timezone);
  const nextDay = new Date(`${date}T12:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const nextDate = nextDay.toISOString().slice(0, 10);
  const timeMax = zonedLocalToIso(nextDate, "00:00", timezone);
  const intervals = [];

  for (const connection of connections) {
    if (String(connection.status) === "needs_authorization") {
      return { intervals: [], source: "google_degraded_local_only", connected: true, error_class: "authorization_required" };
    }
    const token = await usableAccessToken(db, env, connection);
    if (!token.ok) {
      await db.prepare(
        `UPDATE repair_shop_calendar_connections SET status=?, last_error_class=?, updated_at=? WHERE id=?`,
      ).bind(token.error_class === "authorization_required" ? "needs_authorization" : "degraded", token.error_class, new Date().toISOString(), connection.id).run();
      return { intervals: [], source: "google_degraded_local_only", connected: true, error_class: token.error_class };
    }
    const freebusy = await fetchFreeBusy(token.access_token, String(connection.calendar_ref || "primary"), timeMin, timeMax);
    if (!freebusy.ok) {
      await db.prepare(
        `UPDATE repair_shop_calendar_connections SET status=?, last_error_class=?, updated_at=? WHERE id=?`,
      ).bind(freebusy.error_class === "authorization_required" ? "needs_authorization" : "degraded", freebusy.error_class, new Date().toISOString(), connection.id).run();
      return { intervals: [], source: "google_degraded_local_only", connected: true, error_class: freebusy.error_class };
    }
    await db.prepare(
      `UPDATE repair_shop_calendar_connections SET status='connected', last_error_class=NULL, updated_at=? WHERE id=?`,
    ).bind(new Date().toISOString(), connection.id).run();
    for (const item of freebusy.busy) {
      const startTime = isoToLocalClock(item.start, timezone);
      const endTime = isoToLocalClock(item.end, timezone);
      if (startTime < endTime) intervals.push({ technician_id: String(connection.staff_id), start_time: startTime, end_time: endTime });
    }
  }

  return { intervals, source: "google_freebusy", connected: true, error_class: null };
}

export async function revokeGoogleCalendarConnection(env, encryptedPayload) {
  let payload;
  try { payload = await decryptGoogleCalendarTokenPayload(env, encryptedPayload); } catch { return; }
  const token = clean(payload?.refresh_token || payload?.access_token, 4096);
  if (!token) return;
  try {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
  } catch { /* disconnect must still remove the local token row */ }
}

export const GOOGLE_CALENDAR_PROVIDER = PROVIDER;
export const GOOGLE_CALENDAR_FREEBUSY_SCOPE = FREEBUSY_SCOPE;
