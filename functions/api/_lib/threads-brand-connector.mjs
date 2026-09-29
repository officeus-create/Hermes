const AUTH_ENDPOINT = "https://threads.com/oauth/authorize";
const SHORT_TOKEN_ENDPOINT = "https://graph.threads.com/oauth/access_token";
const LONG_TOKEN_ENDPOINT = "https://graph.threads.com/access_token";
const REFRESH_TOKEN_ENDPOINT = "https://graph.threads.com/refresh_access_token";
const GRAPH_BASE = "https://graph.threads.com/v1.0/";
const STATE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_SCOPES = [
  "threads_basic",
  "threads_content_publish",
  "threads_read_replies",
  "threads_manage_replies",
  "threads_manage_insights",
];

const BRAND_CONFIG = Object.freeze({
  office_test: { label: "Office Threads Test", publishEnv: "THREADS_OFFICE_TEST_PUBLISH_ENABLED", expectedUsername: null },
  progressopro: { label: "ProgressoPro", publishEnv: "THREADS_PROGRESSOPRO_PUBLISH_ENABLED", expectedUsername: "progressopro" },
  business_academy: { label: "Hermes Business Academy", publishEnv: "THREADS_BUSINESS_ACADEMY_PUBLISH_ENABLED", expectedUsername: null },
});

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const clean = (value, max = 240) => String(value ?? "").trim().slice(0, max);

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

function enabled(value) {
  return /^(1|true|yes|on)$/i.test(String(value || "").trim());
}

export function normalizeThreadsBrand(value) {
  const brand = clean(value, 64).toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return Object.prototype.hasOwnProperty.call(BRAND_CONFIG, brand) ? brand : null;
}

export function threadsBrandLabel(brand) {
  const key = normalizeThreadsBrand(brand);
  return key ? BRAND_CONFIG[key].label : null;
}

export function threadsBrandExpectedUsername(brand) {
  const key = normalizeThreadsBrand(brand);
  return key ? BRAND_CONFIG[key].expectedUsername : null;
}

export function threadsBrandPublishEnabled(env, brand) {
  const key = normalizeThreadsBrand(brand);
  if (!key) return false;
  if (!enabled(env?.[BRAND_CONFIG[key].publishEnv])) return false;
  if (key !== "office_test" && !enabled(env?.THREADS_SECONDARY_BRAND_PUBLISH_ENABLED)) return false;
  return true;
}

export function threadsBrandScopes(env) {
  const configured = clean(env?.THREADS_BRAND_SCOPES, 1200);
  const raw = configured ? configured.split(/[\s,]+/) : DEFAULT_SCOPES;
  const allowed = new Set([
    "threads_basic",
    "threads_content_publish",
    "threads_read_replies",
    "threads_manage_replies",
    "threads_manage_insights",
    "threads_keyword_search",
  ]);
  const scopes = [];
  for (const scope of raw) {
    const item = clean(scope, 80);
    if (!item || !allowed.has(item) || scopes.includes(item)) continue;
    scopes.push(item);
  }
  if (!scopes.includes("threads_basic")) scopes.unshift("threads_basic");
  return scopes;
}

export function threadsBrandRuntimeConfig(env) {
  const appId = clean(env?.THREADS_BRAND_APP_ID, 512);
  const appSecret = clean(env?.THREADS_BRAND_APP_SECRET, 512);
  const redirectUri = clean(env?.THREADS_BRAND_REDIRECT_URI, 1024);
  const tokenKey = clean(env?.THREADS_BRAND_TOKEN_KEY, 1024);
  if (!appId || !appSecret || !redirectUri || !tokenKey) return null;
  try {
    if (base64ToBytes(tokenKey).byteLength !== 32) return null;
    const redirect = new URL(redirectUri);
    if (redirect.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { appId, appSecret, redirectUri, tokenKey, scopes: threadsBrandScopes(env) };
}

async function importTokenKey(rawKey) {
  let bytes;
  try { bytes = base64ToBytes(rawKey); } catch { return null; }
  if (bytes.byteLength !== 32) return null;
  return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptThreadsTokenPayload(env, payload) {
  const config = threadsBrandRuntimeConfig(env);
  if (!config) throw new Error("threads_brand_runtime_not_configured");
  const key = await importTokenKey(config.tokenKey);
  if (!key) throw new Error("threads_brand_token_key_invalid");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(payload)));
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptThreadsTokenPayload(env, value) {
  const config = threadsBrandRuntimeConfig(env);
  if (!config) throw new Error("threads_brand_runtime_not_configured");
  const key = await importTokenKey(config.tokenKey);
  if (!key) throw new Error("threads_brand_token_key_invalid");
  const parts = String(value || "").split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new Error("threads_brand_token_payload_invalid");
  const iv = base64ToBytes(parts[1]);
  const ciphertext = base64ToBytes(parts[2]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  const payload = JSON.parse(decoder.decode(plaintext));
  if (!payload || typeof payload !== "object") throw new Error("threads_brand_token_payload_invalid");
  return payload;
}

export async function hashThreadsOAuthState(rawState) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(rawState || "")));
  return bytesToBase64(new Uint8Array(digest));
}

export async function ensureThreadsBrandConnectorSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_social_threads_connections (
    brand_key TEXT PRIMARY KEY,
    provider TEXT NOT NULL DEFAULT 'threads',
    state TEXT NOT NULL DEFAULT 'connected_unverified',
    threads_user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    display_name TEXT,
    biography TEXT,
    profile_picture_url TEXT,
    token_ciphertext TEXT NOT NULL,
    token_expires_at TEXT,
    granted_scope TEXT,
    identity_verified INTEGER NOT NULL DEFAULT 0 CHECK (identity_verified IN (0,1)),
    verified_by TEXT,
    verified_at TEXT,
    connected_by TEXT NOT NULL,
    connected_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_error_class TEXT
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_social_threads_oauth_states (
    state_hash TEXT PRIMARY KEY,
    brand_key TEXT NOT NULL,
    owner_specialist_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_social_threads_publications (
    id TEXT PRIMARY KEY,
    brand_key TEXT NOT NULL,
    object_type TEXT NOT NULL DEFAULT 'AUTHORED_POST',
    idempotency_key TEXT NOT NULL UNIQUE,
    text_fingerprint TEXT NOT NULL,
    status TEXT NOT NULL,
    provider_media_id TEXT,
    permalink TEXT,
    provider_timestamp TEXT,
    metrics_json TEXT,
    metrics_updated_at TEXT,
    requested_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_error_class TEXT
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_threads_publications_brand_created ON hermes_social_threads_publications(brand_key, created_at)").run();
}

export async function createThreadsOAuthState(db, { brand, ownerId }) {
  const brandKey = normalizeThreadsBrand(brand);
  if (!brandKey) throw new Error("threads_brand_not_allowed");
  await ensureThreadsBrandConnectorSchema(db);
  const rawState = `${crypto.randomUUID()}.${crypto.randomUUID()}`;
  const stateHash = await hashThreadsOAuthState(rawState);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + STATE_TTL_MS).toISOString();
  await db.prepare("DELETE FROM hermes_social_threads_oauth_states WHERE expires_at <= ? OR (brand_key = ? AND owner_specialist_id = ?)")
    .bind(now.toISOString(), brandKey, String(ownerId))
    .run();
  await db.prepare(`INSERT INTO hermes_social_threads_oauth_states
    (state_hash,brand_key,owner_specialist_id,expires_at,created_at) VALUES (?,?,?,?,?)`)
    .bind(stateHash, brandKey, String(ownerId), expiresAt, now.toISOString())
    .run();
  return rawState;
}

export async function consumeThreadsOAuthState(db, rawState) {
  await ensureThreadsBrandConnectorSchema(db);
  const stateHash = await hashThreadsOAuthState(rawState);
  const row = await db.prepare(`SELECT state_hash,brand_key,owner_specialist_id,expires_at
    FROM hermes_social_threads_oauth_states WHERE state_hash=? LIMIT 1`).bind(stateHash).first();
  await db.prepare("DELETE FROM hermes_social_threads_oauth_states WHERE state_hash=?").bind(stateHash).run();
  if (!row) return null;
  if (!Number.isFinite(Date.parse(String(row.expires_at))) || Date.parse(String(row.expires_at)) <= Date.now()) return null;
  return row;
}

export function threadsAuthorizationUrl(env, rawState) {
  const config = threadsBrandRuntimeConfig(env);
  if (!config) return null;
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", config.scopes.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", String(rawState || ""));
  return url.toString();
}

async function providerJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null, network_error: true };
  }
}

export async function exchangeThreadsAuthorizationCode(env, code) {
  const config = threadsBrandRuntimeConfig(env);
  if (!config) return { ok: false, error_class: "runtime_not_configured" };
  const shortResult = await providerJson(SHORT_TOKEN_ENDPOINT, {
    method: "POST",
    body: new URLSearchParams({
      client_id: config.appId,
      client_secret: config.appSecret,
      code: clean(code, 4096),
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
  });
  if (!shortResult.ok || !shortResult.data?.access_token || !shortResult.data?.user_id) {
    return { ok: false, error_class: shortResult.network_error ? "authorization_exchange_unavailable" : "authorization_exchange_failed" };
  }

  const longUrl = new URL(LONG_TOKEN_ENDPOINT);
  longUrl.searchParams.set("grant_type", "th_exchange_token");
  longUrl.searchParams.set("client_secret", config.appSecret);
  longUrl.searchParams.set("access_token", String(shortResult.data.access_token));
  const longResult = await providerJson(longUrl.toString(), { headers: { Accept: "application/json" } });
  if (!longResult.ok || !longResult.data?.access_token) {
    return { ok: false, error_class: longResult.network_error ? "long_token_exchange_unavailable" : "long_token_exchange_failed" };
  }

  const expiresIn = Math.max(60, Number(longResult.data.expires_in || 60 * 24 * 60 * 60));
  return {
    ok: true,
    user_id: String(shortResult.data.user_id),
    payload: {
      access_token: String(longResult.data.access_token),
      token_type: String(longResult.data.token_type || "bearer"),
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    },
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    scope: config.scopes.join(" "),
  };
}

export async function fetchThreadsProfile(accessToken, userId) {
  const url = new URL(String(userId), GRAPH_BASE);
  url.searchParams.set("fields", "id,username,name,threads_profile_picture_url,threads_biography,is_verified");
  url.searchParams.set("access_token", String(accessToken));
  const result = await providerJson(url.toString(), { headers: { Accept: "application/json" } });
  if (!result.ok || !result.data?.id || !result.data?.username) {
    return { ok: false, error_class: result.network_error ? "profile_readback_unavailable" : "profile_readback_failed" };
  }
  return {
    ok: true,
    profile: {
      id: clean(result.data.id, 160),
      username: clean(result.data.username, 160),
      name: clean(result.data.name, 240),
      biography: clean(result.data.threads_biography, 1000),
      profile_picture_url: clean(result.data.threads_profile_picture_url, 1500),
      is_verified: Boolean(result.data.is_verified),
    },
  };
}

export async function saveThreadsConnection(db, env, { brand, ownerId, tokenPayload, expiresAt, scope, profile }) {
  const brandKey = normalizeThreadsBrand(brand);
  if (!brandKey) throw new Error("threads_brand_not_allowed");
  await ensureThreadsBrandConnectorSchema(db);
  const tokenCiphertext = await encryptThreadsTokenPayload(env, tokenPayload);
  const now = new Date().toISOString();
  await db.prepare(`INSERT INTO hermes_social_threads_connections
    (brand_key,provider,state,threads_user_id,username,display_name,biography,profile_picture_url,
     token_ciphertext,token_expires_at,granted_scope,identity_verified,verified_by,verified_at,
     connected_by,connected_at,updated_at,last_error_class)
    VALUES (?,'threads','connected_unverified',?,?,?,?,?,?,?,?,0,NULL,NULL,?,?,?,NULL)
    ON CONFLICT(brand_key) DO UPDATE SET
      state='connected_unverified',
      threads_user_id=excluded.threads_user_id,
      username=excluded.username,
      display_name=excluded.display_name,
      biography=excluded.biography,
      profile_picture_url=excluded.profile_picture_url,
      token_ciphertext=excluded.token_ciphertext,
      token_expires_at=excluded.token_expires_at,
      granted_scope=excluded.granted_scope,
      identity_verified=0,
      verified_by=NULL,
      verified_at=NULL,
      connected_by=excluded.connected_by,
      connected_at=excluded.connected_at,
      updated_at=excluded.updated_at,
      last_error_class=NULL`)
    .bind(
      brandKey,
      profile.id,
      profile.username,
      profile.name || null,
      profile.biography || null,
      profile.profile_picture_url || null,
      tokenCiphertext,
      expiresAt || null,
      clean(scope, 1200),
      String(ownerId),
      now,
      now,
    ).run();
}

export function publicThreadsConnection(row, env) {
  if (!row) return null;
  const brand = normalizeThreadsBrand(row.brand_key);
  return {
    brand,
    label: threadsBrandLabel(brand),
    provider: "threads",
    state: String(row.state || "connected_unverified"),
    threads_user_id: String(row.threads_user_id || ""),
    username: String(row.username || ""),
    display_name: String(row.display_name || ""),
    biography: String(row.biography || ""),
    profile_picture_url: String(row.profile_picture_url || ""),
    identity_verified: Number(row.identity_verified || 0) === 1,
    verified_at: row.verified_at ? String(row.verified_at) : null,
    token_expires_at: row.token_expires_at ? String(row.token_expires_at) : null,
    granted_scopes: String(row.granted_scope || "").split(/\s+/).filter(Boolean),
    publish_enabled: Boolean(brand && threadsBrandPublishEnabled(env, brand)),
    updated_at: row.updated_at ? String(row.updated_at) : null,
    error_class: row.last_error_class ? String(row.last_error_class) : null,
  };
}

export async function listThreadsConnections(db, env) {
  await ensureThreadsBrandConnectorSchema(db);
  const result = await db.prepare(`SELECT brand_key,state,threads_user_id,username,display_name,biography,profile_picture_url,
    token_expires_at,granted_scope,identity_verified,verified_at,updated_at,last_error_class
    FROM hermes_social_threads_connections ORDER BY brand_key ASC`).all();
  const byBrand = new Map((result?.results || []).map((row) => [String(row.brand_key), row]));
  return Object.keys(BRAND_CONFIG).map((brand) => publicThreadsConnection(byBrand.get(brand), env) || {
    brand,
    label: threadsBrandLabel(brand),
    provider: "threads",
    state: threadsBrandRuntimeConfig(env) ? "ready_for_owner_auth" : "configuration_required",
    threads_user_id: null,
    username: null,
    display_name: null,
    biography: null,
    profile_picture_url: null,
    identity_verified: false,
    verified_at: null,
    token_expires_at: null,
    granted_scopes: [],
    publish_enabled: threadsBrandPublishEnabled(env, brand),
    updated_at: null,
    error_class: null,
  });
}

async function refreshLongLivedToken(env, payload) {
  const accessToken = clean(payload?.access_token, 4096);
  if (!accessToken) return { ok: false, error_class: "authorization_required" };
  const url = new URL(REFRESH_TOKEN_ENDPOINT);
  url.searchParams.set("grant_type", "th_refresh_token");
  url.searchParams.set("access_token", accessToken);
  const result = await providerJson(url.toString(), { headers: { Accept: "application/json" } });
  if (!result.ok || !result.data?.access_token) {
    return { ok: false, error_class: result.network_error ? "token_refresh_unavailable" : "authorization_required" };
  }
  const expiresIn = Math.max(60, Number(result.data.expires_in || 60 * 24 * 60 * 60));
  return {
    ok: true,
    payload: {
      access_token: String(result.data.access_token),
      token_type: String(result.data.token_type || "bearer"),
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    },
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

export async function usableThreadsAccessToken(db, env, brand) {
  const brandKey = normalizeThreadsBrand(brand);
  if (!brandKey) return { ok: false, error_class: "brand_not_allowed" };
  await ensureThreadsBrandConnectorSchema(db);
  const row = await db.prepare(`SELECT brand_key,state,threads_user_id,username,token_ciphertext,token_expires_at,
    granted_scope,identity_verified FROM hermes_social_threads_connections WHERE brand_key=? LIMIT 1`).bind(brandKey).first();
  if (!row || Number(row.identity_verified || 0) !== 1) return { ok: false, error_class: "identity_verification_required" };
  let payload;
  try { payload = await decryptThreadsTokenPayload(env, row.token_ciphertext); }
  catch { return { ok: false, error_class: "token_decrypt_failed" }; }
  const expiresMs = Date.parse(String(payload?.expires_at || row.token_expires_at || ""));
  if (payload?.access_token && Number.isFinite(expiresMs) && expiresMs > Date.now() + 7 * 24 * 60 * 60 * 1000) {
    return { ok: true, access_token: String(payload.access_token), connection: row };
  }
  const refreshed = await refreshLongLivedToken(env, payload);
  if (!refreshed.ok) {
    await db.prepare("UPDATE hermes_social_threads_connections SET state='needs_authorization',last_error_class=?,updated_at=? WHERE brand_key=?")
      .bind(refreshed.error_class, new Date().toISOString(), brandKey).run();
    return refreshed;
  }
  const tokenCiphertext = await encryptThreadsTokenPayload(env, refreshed.payload);
  await db.prepare(`UPDATE hermes_social_threads_connections SET token_ciphertext=?,token_expires_at=?,
    state='connected_verified',last_error_class=NULL,updated_at=? WHERE brand_key=?`)
    .bind(tokenCiphertext, refreshed.expires_at, new Date().toISOString(), brandKey).run();
  return { ok: true, access_token: String(refreshed.payload.access_token), connection: row };
}

export function validateThreadsText(value) {
  const text = String(value ?? "").trim();
  const bytes = encoder.encode(text).byteLength;
  if (!text) return { ok: false, error: "text_required", bytes };
  if (bytes > 500) return { ok: false, error: "threads_text_too_long", bytes };
  return { ok: true, text, bytes };
}

export async function threadsTextFingerprint(text) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(text || "")));
  return bytesToBase64(new Uint8Array(digest));
}

export function validThreadsIdempotencyKey(value) {
  const key = clean(value, 120);
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{7,119}$/.test(key) ? key : null;
}

export async function publishThreadsText(accessToken, userId, text) {
  const url = new URL(`${clean(userId, 160)}/threads`, GRAPH_BASE);
  const result = await providerJson(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      media_type: "TEXT",
      text,
      auto_publish_text: "true",
      access_token: String(accessToken),
    }),
  });
  if (!result.ok || !result.data?.id) {
    return {
      ok: false,
      error_class: result.network_error ? "provider_outcome_unknown" : "provider_rejected",
      provider_status: result.status,
    };
  }
  return { ok: true, media_id: clean(result.data.id, 160) };
}

export async function readThreadsMedia(accessToken, mediaId) {
  const url = new URL(clean(mediaId, 160), GRAPH_BASE);
  url.searchParams.set("fields", "id,media_product_type,media_type,permalink,username,text,timestamp,is_quote_post,is_reply,reposted_post");
  url.searchParams.set("access_token", String(accessToken));
  const result = await providerJson(url.toString(), { headers: { Accept: "application/json" } });
  if (!result.ok || !result.data?.id) {
    return { ok: false, error_class: result.network_error ? "media_readback_unavailable" : "media_readback_failed" };
  }
  return {
    ok: true,
    media: {
      id: clean(result.data.id, 160),
      media_product_type: clean(result.data.media_product_type, 80),
      media_type: clean(result.data.media_type, 80),
      permalink: clean(result.data.permalink, 1500),
      username: clean(result.data.username, 160),
      text: String(result.data.text || "").slice(0, 2000),
      timestamp: clean(result.data.timestamp, 100),
      is_quote_post: Boolean(result.data.is_quote_post),
      is_reply: Boolean(result.data.is_reply),
      reposted_post: result.data.reposted_post || null,
    },
  };
}

export async function readThreadsMediaInsights(accessToken, mediaId) {
  const url = new URL(`${clean(mediaId, 160)}/insights`, GRAPH_BASE);
  url.searchParams.set("metric", "views,likes,replies,reposts,quotes,shares");
  url.searchParams.set("access_token", String(accessToken));
  const result = await providerJson(url.toString(), { headers: { Accept: "application/json" } });
  if (!result.ok || !Array.isArray(result.data?.data)) {
    return { ok: false, error_class: result.network_error ? "insights_unavailable" : "insights_read_failed" };
  }
  const metrics = {};
  for (const item of result.data.data) {
    const name = clean(item?.name, 40);
    if (!name) continue;
    const raw = Array.isArray(item?.values) ? item.values[0]?.value : item?.total_value?.value;
    metrics[name] = Number(raw || 0);
  }
  return { ok: true, metrics };
}

export const THREADS_BRAND_KEYS = Object.freeze(Object.keys(BRAND_CONFIG));
export const THREADS_GRAPH_BASE = GRAPH_BASE;
