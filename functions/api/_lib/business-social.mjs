import { ensureRepairShopProfileSchema } from "./repair-shop-schema.mjs";
import { ensureHermesCompanyProfilesSchema } from "./hermes-company-profiles.mjs";
import { getOwnedBeautySalon } from "./beauty-salon-context.mjs";
import { getOwnedHermesCompany } from "./load-board-market-posts.mjs";
import { cleanConnectionText, upsertCompanyConnection } from "./company-connections.mjs";
import {
  exchangeThreadsAuthorizationCode,
  fetchThreadsProfile,
  publishThreadsText,
  readThreadsMedia,
  threadsAuthorizationUrl,
  threadsBrandRuntimeConfig,
  validateThreadsText,
} from "./threads-brand-connector.mjs";

const PROVIDERS = Object.freeze(["facebook", "instagram", "threads"]);
const PROVIDER_SET = new Set(PROVIDERS);
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_META_VERSION = "v26.0";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const clean = (value, max = 240) => cleanConnectionText(value, max);

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

function socialTokenKey(env) {
  return clean(env?.HERMES_SOCIAL_TOKEN_KEY || env?.THREADS_BRAND_TOKEN_KEY, 2048);
}

async function importSocialTokenKey(env) {
  const raw = socialTokenKey(env);
  if (!raw) return null;
  let bytes;
  try { bytes = base64ToBytes(raw); } catch { return null; }
  if (bytes.byteLength !== 32) return null;
  return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptBusinessSocialPayload(env, payload) {
  const key = await importSocialTokenKey(env);
  if (!key) throw new Error("social_token_key_invalid");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(JSON.stringify(payload || {}));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptBusinessSocialPayload(env, value) {
  const key = await importSocialTokenKey(env);
  if (!key) throw new Error("social_token_key_invalid");
  const parts = String(value || "").split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new Error("social_token_payload_invalid");
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(parts[1]) },
    key,
    base64ToBytes(parts[2]),
  );
  const payload = JSON.parse(decoder.decode(plaintext));
  if (!payload || typeof payload !== "object") throw new Error("social_token_payload_invalid");
  return payload;
}

export function normalizeBusinessSocialProvider(value) {
  const provider = clean(value, 32).toLowerCase();
  return PROVIDER_SET.has(provider) ? provider : null;
}

function metaGraphVersion(env) {
  const configured = clean(env?.HERMES_META_GRAPH_VERSION, 24);
  return /^v\d+\.\d+$/.test(configured) ? configured : DEFAULT_META_VERSION;
}

function validHttpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function businessSocialProviderConfigured(env, provider) {
  const normalized = normalizeBusinessSocialProvider(provider);
  if (!normalized || !socialTokenKey(env)) return false;
  if (normalized === "threads") return Boolean(threadsBrandRuntimeConfig(env));
  return Boolean(
    clean(env?.HERMES_META_APP_ID, 512)
    && clean(env?.HERMES_META_APP_SECRET, 512)
    && validHttpsUrl(env?.HERMES_META_OAUTH_REDIRECT_URI),
  );
}

export function businessSocialScopes(provider) {
  const normalized = normalizeBusinessSocialProvider(provider);
  if (normalized === "facebook") {
    return ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "pages_manage_engagement", "pages_read_user_engagement"];
  }
  if (normalized === "instagram") {
    return ["pages_show_list", "pages_read_engagement", "instagram_basic", "instagram_content_publish"];
  }
  if (normalized === "threads") {
    return ["threads_basic", "threads_content_publish", "threads_manage_insights"];
  }
  return [];
}

export async function ensureBusinessSocialSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_business_social_credentials (
      id TEXT PRIMARY KEY,
      business_key TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      vertical_key TEXT NOT NULL,
      business_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'ready_for_owner_auth',
      account_name TEXT,
      username TEXT,
      external_account_ref TEXT,
      token_ciphertext TEXT,
      token_expires_at TEXT,
      granted_scope TEXT,
      candidate_labels_json TEXT,
      connected_at TEXT,
      updated_at TEXT NOT NULL,
      last_error_class TEXT,
      UNIQUE(business_key, provider)
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_business_social_credentials_owner
    ON hermes_business_social_credentials(owner_specialist_id, business_key, provider)
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_business_social_oauth_states (
      state_hash TEXT PRIMARY KEY,
      business_key TEXT NOT NULL,
      business_id TEXT NOT NULL,
      vertical_key TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_business_social_publications (
      id TEXT PRIMARY KEY,
      business_key TEXT NOT NULL,
      provider TEXT NOT NULL,
      object_type TEXT NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      payload_fingerprint TEXT NOT NULL,
      status TEXT NOT NULL,
      provider_media_id TEXT,
      permalink TEXT,
      requested_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_error_class TEXT
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_business_social_publications_business
    ON hermes_business_social_publications(business_key, provider, created_at DESC)
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_business_social_creative_intakes (
      id TEXT PRIMARY KEY,
      business_key TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      vertical_key TEXT NOT NULL,
      business_id TEXT NOT NULL,
      source_kind TEXT NOT NULL DEFAULT 'google_drive',
      source_url TEXT NOT NULL,
      brief TEXT,
      language TEXT,
      market TEXT,
      status TEXT NOT NULL DEFAULT 'source_registered',
      draft_json TEXT,
      analyzed_at TEXT,
      last_error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_business_social_creative_intakes_business
    ON hermes_business_social_creative_intakes(business_key, created_at DESC)
  `).run();
}

async function findRepairShop(db, ownerId) {
  await ensureRepairShopProfileSchema(db);
  return db.prepare(`
    SELECT id,name,slug,city,state
    FROM repair_shops
    WHERE owner_specialist_id = ?
    LIMIT 1
  `).bind(String(ownerId)).first();
}

async function findHermesCompany(db, ownerId) {
  await ensureHermesCompanyProfilesSchema(db);
  return getOwnedHermesCompany(db, String(ownerId));
}

async function findBeautySalon(db, ownerId) {
  return getOwnedBeautySalon(db, String(ownerId));
}

export async function resolveOwnedSocialBusiness(db, ownerId, preferredVertical = "") {
  const preferred = clean(preferredVertical, 48).toLowerCase();
  const owner = String(ownerId || "");
  if (!owner) return null;

  if (preferred === "dealer" || preferred === "company") {
    const company = await findHermesCompany(db, owner);
    if (!company) return null;
    return {
      business_key: String(company.id),
      business_id: String(company.id),
      vertical_key: String(company.company_type || "company"),
      business_name: String(company.company_name || "Company"),
      city: String(company.city || ""),
      state: String(company.state || ""),
    };
  }

  if (preferred === "repair_shop") {
    const shop = await findRepairShop(db, owner);
    if (!shop) return null;
    return {
      business_key: `repair_shop:${shop.id}`,
      business_id: String(shop.id),
      vertical_key: "repair_shop",
      business_name: String(shop.name || "Repair Shop"),
      city: String(shop.city || ""),
      state: String(shop.state || ""),
    };
  }

  if (preferred === "beauty_salon" || preferred === "beauty") {
    const salon = await findBeautySalon(db, owner);
    if (!salon) return null;
    return {
      business_key: `beauty_salon:${salon.id}`,
      business_id: String(salon.id),
      vertical_key: "beauty_salon",
      business_name: String(salon.name || "Beauty Salon"),
      city: String(salon.city || ""),
      state: String(salon.region || ""),
    };
  }

  const shop = await findRepairShop(db, owner);
  if (shop) {
    return {
      business_key: `repair_shop:${shop.id}`,
      business_id: String(shop.id),
      vertical_key: "repair_shop",
      business_name: String(shop.name || "Repair Shop"),
      city: String(shop.city || ""),
      state: String(shop.state || ""),
    };
  }

  const salon = await findBeautySalon(db, owner);
  if (salon) {
    return {
      business_key: `beauty_salon:${salon.id}`,
      business_id: String(salon.id),
      vertical_key: "beauty_salon",
      business_name: String(salon.name || "Beauty Salon"),
      city: String(salon.city || ""),
      state: String(salon.region || ""),
    };
  }

  const company = await findHermesCompany(db, owner);
  if (!company) return null;
  return {
    business_key: String(company.id),
    business_id: String(company.id),
    vertical_key: String(company.company_type || "company"),
    business_name: String(company.company_name || "Company"),
    city: String(company.city || ""),
    state: String(company.state || ""),
  };
}

async function mirrorConnectionState(db, business, provider, state, options = {}) {
  await upsertCompanyConnection(db, {
    companyId: business.business_key,
    provider,
    state,
    mode: state === "connected_write" ? "read_write" : "none",
    externalAccountRef: options.externalAccountRef || null,
    lastVerifiedAt: options.lastVerifiedAt || null,
    lastError: options.lastError || null,
    metadata: {
      oauth_required: true,
      owner_authorization_required: state !== "connected_write",
      auto_publish_enabled: false,
      dm_automation_enabled: false,
      vertical_key: business.vertical_key,
      business_id: business.business_id,
      account_name: options.accountName || null,
      username: options.username || null,
    },
  });
}

export async function upsertBusinessSocialCredential(db, env, options) {
  const provider = normalizeBusinessSocialProvider(options.provider);
  if (!provider) throw new Error("social_provider_invalid");
  await ensureBusinessSocialSchema(db);
  const now = new Date().toISOString();
  const tokenCiphertext = options.tokenPayload
    ? await encryptBusinessSocialPayload(env, options.tokenPayload)
    : (options.tokenCiphertext ?? null);
  const candidateLabelsJson = Array.isArray(options.candidateLabels)
    ? JSON.stringify(options.candidateLabels).slice(0, 8000)
    : null;
  const id = `hbs_${crypto.randomUUID()}`;

  await db.prepare(`
    INSERT INTO hermes_business_social_credentials (
      id,business_key,owner_specialist_id,vertical_key,business_id,provider,state,
      account_name,username,external_account_ref,token_ciphertext,token_expires_at,
      granted_scope,candidate_labels_json,connected_at,updated_at,last_error_class
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(business_key,provider) DO UPDATE SET
      owner_specialist_id=excluded.owner_specialist_id,
      vertical_key=excluded.vertical_key,
      business_id=excluded.business_id,
      state=excluded.state,
      account_name=excluded.account_name,
      username=excluded.username,
      external_account_ref=excluded.external_account_ref,
      token_ciphertext=COALESCE(excluded.token_ciphertext,hermes_business_social_credentials.token_ciphertext),
      token_expires_at=COALESCE(excluded.token_expires_at,hermes_business_social_credentials.token_expires_at),
      granted_scope=excluded.granted_scope,
      candidate_labels_json=excluded.candidate_labels_json,
      connected_at=COALESCE(excluded.connected_at,hermes_business_social_credentials.connected_at),
      updated_at=excluded.updated_at,
      last_error_class=excluded.last_error_class
  `).bind(
    id,
    options.business.business_key,
    String(options.ownerId),
    options.business.vertical_key,
    options.business.business_id,
    provider,
    clean(options.state || "ready_for_owner_auth", 48),
    options.accountName ? clean(options.accountName, 240) : null,
    options.username ? clean(options.username, 160) : null,
    options.externalAccountRef ? clean(options.externalAccountRef, 240) : null,
    tokenCiphertext,
    options.tokenExpiresAt ? clean(options.tokenExpiresAt, 100) : null,
    options.grantedScope ? clean(options.grantedScope, 1200) : null,
    candidateLabelsJson,
    options.connectedAt || (options.state === "connected_write" ? now : null),
    now,
    options.lastError ? clean(options.lastError, 240) : null,
  ).run();

  await mirrorConnectionState(db, options.business, provider, options.state || "ready_for_owner_auth", {
    externalAccountRef: options.externalAccountRef,
    lastVerifiedAt: options.state === "connected_write" ? now : null,
    lastError: options.lastError,
    accountName: options.accountName,
    username: options.username,
  });

  return db.prepare(`
    SELECT * FROM hermes_business_social_credentials
    WHERE business_key=? AND provider=?
    LIMIT 1
  `).bind(options.business.business_key, provider).first();
}

function parseCandidateLabels(value) {
  try {
    const parsed = value ? JSON.parse(String(value)) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function publicBusinessSocialConnection(row, env, provider) {
  const normalized = normalizeBusinessSocialProvider(provider || row?.provider);
  if (!normalized) return null;
  if (!row) {
    return {
      provider: normalized,
      state: businessSocialProviderConfigured(env, normalized) ? "ready_for_owner_auth" : "configuration_required",
      configured: businessSocialProviderConfigured(env, normalized),
      account_name: null,
      username: null,
      token_expires_at: null,
      candidates: [],
      error_class: null,
    };
  }
  return {
    provider: normalized,
    state: clean(row.state, 48) || "ready_for_owner_auth",
    configured: businessSocialProviderConfigured(env, normalized),
    account_name: row.account_name ? String(row.account_name) : null,
    username: row.username ? String(row.username) : null,
    token_expires_at: row.token_expires_at ? String(row.token_expires_at) : null,
    candidates: parseCandidateLabels(row.candidate_labels_json),
    error_class: row.last_error_class ? String(row.last_error_class) : null,
  };
}

export async function listBusinessSocialConnections(db, env, business) {
  await ensureBusinessSocialSchema(db);
  const result = await db.prepare(`
    SELECT provider,state,account_name,username,token_expires_at,candidate_labels_json,last_error_class
    FROM hermes_business_social_credentials
    WHERE business_key=?
  `).bind(business.business_key).all();
  const byProvider = new Map((result?.results || []).map((row) => [String(row.provider), row]));
  return PROVIDERS.map((provider) => publicBusinessSocialConnection(byProvider.get(provider), env, provider));
}

async function sha256Base64(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value || "")));
  return bytesToBase64(new Uint8Array(digest));
}

export async function createBusinessSocialOAuthState(db, options) {
  const provider = normalizeBusinessSocialProvider(options.provider);
  if (!provider) throw new Error("social_provider_invalid");
  await ensureBusinessSocialSchema(db);
  const rawState = `${crypto.randomUUID()}.${crypto.randomUUID()}`;
  const stateHash = await sha256Base64(rawState);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OAUTH_STATE_TTL_MS).toISOString();
  await db.prepare(`
    DELETE FROM hermes_business_social_oauth_states
    WHERE expires_at <= ? OR (owner_specialist_id=? AND business_key=? AND provider=?)
  `).bind(now.toISOString(), String(options.ownerId), options.business.business_key, provider).run();
  await db.prepare(`
    INSERT INTO hermes_business_social_oauth_states
    (state_hash,business_key,business_id,vertical_key,owner_specialist_id,provider,expires_at,created_at)
    VALUES (?,?,?,?,?,?,?,?)
  `).bind(
    stateHash,
    options.business.business_key,
    options.business.business_id,
    options.business.vertical_key,
    String(options.ownerId),
    provider,
    expiresAt,
    now.toISOString(),
  ).run();
  return rawState;
}

export async function consumeBusinessSocialOAuthState(db, rawState) {
  await ensureBusinessSocialSchema(db);
  const stateHash = await sha256Base64(rawState);
  const row = await db.prepare(`
    SELECT state_hash,business_key,business_id,vertical_key,owner_specialist_id,provider,expires_at
    FROM hermes_business_social_oauth_states
    WHERE state_hash=?
    LIMIT 1
  `).bind(stateHash).first();
  await db.prepare("DELETE FROM hermes_business_social_oauth_states WHERE state_hash=?").bind(stateHash).run();
  if (!row) return null;
  const expiry = Date.parse(String(row.expires_at || ""));
  if (!Number.isFinite(expiry) || expiry <= Date.now()) return null;
  return row;
}

export function businessSocialAuthorizationUrl(env, provider, rawState) {
  const normalized = normalizeBusinessSocialProvider(provider);
  if (!normalized || !businessSocialProviderConfigured(env, normalized)) return null;
  if (normalized === "threads") return threadsAuthorizationUrl(env, rawState);

  const version = metaGraphVersion(env);
  const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
  url.searchParams.set("client_id", clean(env.HERMES_META_APP_ID, 512));
  url.searchParams.set("redirect_uri", String(env.HERMES_META_OAUTH_REDIRECT_URI));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", String(rawState || ""));
  url.searchParams.set("scope", businessSocialScopes(normalized).join(","));
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

function metaGraphBase(env) {
  return `https://graph.facebook.com/${metaGraphVersion(env)}/`;
}

export async function exchangeMetaBusinessAuthorizationCode(env, code) {
  if (!businessSocialProviderConfigured(env, "facebook")) return { ok: false, error_class: "runtime_not_configured" };
  const base = metaGraphBase(env);
  const shortUrl = new URL("oauth/access_token", base);
  shortUrl.searchParams.set("client_id", clean(env.HERMES_META_APP_ID, 512));
  shortUrl.searchParams.set("client_secret", clean(env.HERMES_META_APP_SECRET, 512));
  shortUrl.searchParams.set("redirect_uri", String(env.HERMES_META_OAUTH_REDIRECT_URI));
  shortUrl.searchParams.set("code", clean(code, 4096));
  const shortResult = await providerJson(shortUrl.toString(), { headers: { Accept: "application/json" } });
  if (!shortResult.ok || !shortResult.data?.access_token) {
    return { ok: false, error_class: shortResult.network_error ? "authorization_exchange_unavailable" : "authorization_exchange_failed" };
  }

  const longUrl = new URL("oauth/access_token", base);
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", clean(env.HERMES_META_APP_ID, 512));
  longUrl.searchParams.set("client_secret", clean(env.HERMES_META_APP_SECRET, 512));
  longUrl.searchParams.set("fb_exchange_token", String(shortResult.data.access_token));
  const longResult = await providerJson(longUrl.toString(), { headers: { Accept: "application/json" } });
  const token = longResult.ok && longResult.data?.access_token
    ? String(longResult.data.access_token)
    : String(shortResult.data.access_token);
  const expiresIn = Math.max(300, Number(longResult.data?.expires_in || shortResult.data?.expires_in || 60 * 24 * 60 * 60));
  return {
    ok: true,
    access_token: token,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

export async function fetchMetaBusinessCandidates(env, accessToken, provider) {
  const normalized = normalizeBusinessSocialProvider(provider);
  if (normalized !== "facebook" && normalized !== "instagram") return { ok: false, error_class: "social_provider_invalid" };
  const url = new URL("me/accounts", metaGraphBase(env));
  url.searchParams.set("fields", "id,name,access_token,tasks,instagram_business_account{id,username,name,profile_picture_url}");
  url.searchParams.set("limit", "100");
  url.searchParams.set("access_token", String(accessToken));
  const result = await providerJson(url.toString(), { headers: { Accept: "application/json" } });
  if (!result.ok || !Array.isArray(result.data?.data)) {
    return { ok: false, error_class: result.network_error ? "account_readback_unavailable" : "account_readback_failed" };
  }

  const candidates = [];
  for (const page of result.data.data) {
    const pageToken = clean(page?.access_token, 4096);
    if (!pageToken) continue;
    const tasks = Array.isArray(page?.tasks) ? page.tasks.map((item) => clean(item, 64)) : [];
    if (normalized === "facebook" && tasks.length && !["CREATE_CONTENT", "MANAGE", "MODERATE"].every((task) => tasks.includes(task))) continue;
    if (normalized === "instagram" && tasks.length && !tasks.includes("CREATE_CONTENT")) continue;

    if (normalized === "facebook") {
      candidates.push({
        page_id: clean(page?.id, 160),
        page_name: clean(page?.name, 240),
        access_token: pageToken,
        tasks,
      });
      continue;
    }

    const ig = page?.instagram_business_account;
    if (!ig?.id) continue;
    candidates.push({
      page_id: clean(page?.id, 160),
      page_name: clean(page?.name, 240),
      ig_user_id: clean(ig?.id, 160),
      username: clean(ig?.username, 160),
      account_name: clean(ig?.name, 240),
      profile_picture_url: clean(ig?.profile_picture_url, 1500),
      access_token: pageToken,
      tasks,
    });
  }

  return candidates.length
    ? { ok: true, candidates }
    : { ok: false, error_class: "no_eligible_account" };
}

export function publicCandidateLabels(provider, candidates) {
  return (candidates || []).map((candidate, index) => ({
    index,
    label: provider === "instagram"
      ? (candidate.username ? `@${candidate.username}` : candidate.account_name || candidate.page_name || `Instagram ${index + 1}`)
      : candidate.page_name || `Facebook Page ${index + 1}`,
  }));
}

export async function saveMetaCandidateSelection(db, env, options) {
  const index = Number(options.candidateIndex);
  const row = await db.prepare(`
    SELECT * FROM hermes_business_social_credentials
    WHERE business_key=? AND provider=? AND owner_specialist_id=? AND state='selection_required'
    LIMIT 1
  `).bind(options.business.business_key, options.provider, String(options.ownerId)).first();
  if (!row?.token_ciphertext) return { ok: false, error_class: "selection_state_missing" };

  let pending;
  try { pending = await decryptBusinessSocialPayload(env, row.token_ciphertext); }
  catch { return { ok: false, error_class: "selection_state_invalid" }; }
  const candidates = Array.isArray(pending?.candidates) ? pending.candidates : [];
  if (!Number.isInteger(index) || index < 0 || index >= candidates.length) return { ok: false, error_class: "candidate_invalid" };
  const candidate = candidates[index];
  const tokenPayload = {
    access_token: String(candidate.access_token || ""),
    expires_at: String(pending.expires_at || ""),
    page_id: String(candidate.page_id || ""),
    ig_user_id: String(candidate.ig_user_id || ""),
  };
  if (!tokenPayload.access_token) return { ok: false, error_class: "candidate_token_missing" };

  const saved = await upsertBusinessSocialCredential(db, env, {
    business: options.business,
    ownerId: options.ownerId,
    provider: options.provider,
    state: "connected_write",
    accountName: options.provider === "instagram"
      ? (candidate.account_name || candidate.page_name)
      : candidate.page_name,
    username: options.provider === "instagram" ? candidate.username : null,
    externalAccountRef: options.provider === "instagram" ? candidate.ig_user_id : candidate.page_id,
    tokenPayload,
    tokenExpiresAt: pending.expires_at || null,
    grantedScope: businessSocialScopes(options.provider).join(" "),
    candidateLabels: [],
    connectedAt: new Date().toISOString(),
  });
  return { ok: true, connection: saved };
}

export async function getBusinessSocialCredential(db, env, business, provider, ownerId) {
  const normalized = normalizeBusinessSocialProvider(provider);
  if (!normalized) return { ok: false, error_class: "social_provider_invalid" };
  await ensureBusinessSocialSchema(db);
  const row = await db.prepare(`
    SELECT * FROM hermes_business_social_credentials
    WHERE business_key=? AND provider=? AND owner_specialist_id=?
    LIMIT 1
  `).bind(business.business_key, normalized, String(ownerId)).first();
  if (!row || String(row.state) !== "connected_write" || !row.token_ciphertext) {
    return { ok: false, error_class: "authorization_required" };
  }
  let payload;
  try { payload = await decryptBusinessSocialPayload(env, row.token_ciphertext); }
  catch { return { ok: false, error_class: "token_decrypt_failed" }; }

  const expiresAt = Date.parse(String(payload?.expires_at || row.token_expires_at || ""));
  if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
    await db.prepare(`
      UPDATE hermes_business_social_credentials
      SET state='ready_for_owner_auth',last_error_class='authorization_expired',updated_at=?
      WHERE id=?
    `).bind(new Date().toISOString(), row.id).run();
    await mirrorConnectionState(db, business, normalized, "ready_for_owner_auth", { lastError: "authorization_expired" });
    return { ok: false, error_class: "authorization_expired" };
  }
  return { ok: true, row, payload };
}

export async function disconnectBusinessSocial(db, business, provider, ownerId) {
  const normalized = normalizeBusinessSocialProvider(provider);
  if (!normalized) return false;
  await ensureBusinessSocialSchema(db);
  const now = new Date().toISOString();
  const result = await db.prepare(`
    UPDATE hermes_business_social_credentials
    SET state='revoked',token_ciphertext=NULL,token_expires_at=NULL,candidate_labels_json=NULL,last_error_class=NULL,updated_at=?
    WHERE business_key=? AND provider=? AND owner_specialist_id=?
  `).bind(now, business.business_key, normalized, String(ownerId)).run();
  await mirrorConnectionState(db, business, normalized, "revoked");
  return Boolean(result?.meta?.changes);
}

export function validBusinessSocialIdempotencyKey(value) {
  const key = clean(value, 120);
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{7,119}$/.test(key) ? key : null;
}

export async function businessSocialPayloadFingerprint(provider, payload) {
  return sha256Base64(`${provider}:${JSON.stringify(payload || {})}`);
}

export async function reserveBusinessSocialPublication(db, options) {
  await ensureBusinessSocialSchema(db);
  const now = new Date().toISOString();
  const id = `hbsp_${crypto.randomUUID()}`;
  const insert = await db.prepare(`
    INSERT OR IGNORE INTO hermes_business_social_publications
    (id,business_key,provider,object_type,idempotency_key,payload_fingerprint,status,requested_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,'reserved',?,?,?)
  `).bind(
    id,
    options.business.business_key,
    options.provider,
    options.objectType,
    options.idempotencyKey,
    options.fingerprint,
    String(options.ownerId),
    now,
    now,
  ).run();
  const row = await db.prepare(`
    SELECT * FROM hermes_business_social_publications
    WHERE idempotency_key=?
    LIMIT 1
  `).bind(options.idempotencyKey).first();
  return { inserted: Boolean(insert?.meta?.changes), row };
}

export async function completeBusinessSocialPublication(db, id, patch = {}) {
  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE hermes_business_social_publications
    SET status=?,provider_media_id=?,permalink=?,last_error_class=?,updated_at=?
    WHERE id=?
  `).bind(
    clean(patch.status || "unknown_outcome", 64),
    patch.providerMediaId ? clean(patch.providerMediaId, 240) : null,
    patch.permalink ? clean(patch.permalink, 1500) : null,
    patch.lastError ? clean(patch.lastError, 240) : null,
    now,
    id,
  ).run();
  return db.prepare("SELECT * FROM hermes_business_social_publications WHERE id=? LIMIT 1").bind(id).first();
}

export function publicBusinessSocialPublication(row) {
  if (!row) return null;
  return {
    provider: String(row.provider || ""),
    object_type: String(row.object_type || ""),
    idempotency_key: String(row.idempotency_key || ""),
    status: String(row.status || ""),
    provider_media_id: row.provider_media_id ? String(row.provider_media_id) : null,
    permalink: row.permalink ? String(row.permalink) : null,
    error_class: row.last_error_class ? String(row.last_error_class) : null,
    created_at: row.created_at ? String(row.created_at) : null,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  };
}

export async function publishFacebookPagePost(env, credential, message, imageUrls = []) {
  const text = String(message || "").trim();
  const images = normalizeImageUrls(imageUrls);
  if (text.length > 5000 || (!text && images.length === 0)) return { ok: false, error_class: "facebook_content_invalid" };
  const pageId = clean(credential?.page_id, 160);
  const accessToken = clean(credential?.access_token, 4096);
  if (!pageId || !accessToken) return { ok: false, error_class: "authorization_required" };

  const readPost = async (objectId) => {
    const readUrl = new URL(objectId, metaGraphBase(env));
    readUrl.searchParams.set("fields", "id,permalink_url,created_time");
    readUrl.searchParams.set("access_token", accessToken);
    return providerJson(readUrl.toString(), { headers: { Accept: "application/json" } });
  };
  const readPhoto = async (photoId) => {
    const readUrl = new URL(photoId, metaGraphBase(env));
    readUrl.searchParams.set("fields", "id,link,page_story_id,created_time");
    readUrl.searchParams.set("access_token", accessToken);
    return providerJson(readUrl.toString(), { headers: { Accept: "application/json" } });
  };

  if (images.length === 1) {
    const url = new URL(`${pageId}/photos`, metaGraphBase(env));
    const result = await providerJson(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        url: images[0],
        message: text,
        published: "true",
        access_token: accessToken,
      }),
    });
    if (!result.ok || (!result.data?.id && !result.data?.post_id)) {
      return { ok: false, error_class: result.network_error ? "provider_outcome_unknown" : "provider_rejected" };
    }
    const postId = clean(result.data?.post_id, 240);
    const photoId = clean(result.data?.id, 240);
    let permalink = null;
    let readbackOk = false;
    if (postId) {
      const readback = await readPost(postId);
      readbackOk = readback.ok;
      if (readback.ok) permalink = clean(readback.data?.permalink_url, 1500);
    }
    if (!permalink && photoId) {
      const photoReadback = await readPhoto(photoId);
      readbackOk = readbackOk || photoReadback.ok;
      if (photoReadback.ok) {
        permalink = clean(photoReadback.data?.link, 1500);
        const storyId = clean(photoReadback.data?.page_story_id, 240);
        if (!permalink && storyId) {
          const storyReadback = await readPost(storyId);
          readbackOk = readbackOk || storyReadback.ok;
          if (storyReadback.ok) permalink = clean(storyReadback.data?.permalink_url, 1500);
        }
      }
    }
    return { ok: true, media_id: postId || photoId, permalink, readback_ok: readbackOk };
  }

  if (images.length > 1) {
    const stagedPhotoIds = [];
    for (const imageUrl of images) {
      const url = new URL(`${pageId}/photos`, metaGraphBase(env));
      const staged = await providerJson(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({ url: imageUrl, published: "false", access_token: accessToken }),
      });
      if (!staged.ok || !staged.data?.id) {
        return { ok: false, error_class: staged.network_error ? "provider_outcome_unknown" : "provider_rejected" };
      }
      stagedPhotoIds.push(clean(staged.data.id, 240));
    }
    const feedUrl = new URL(`${pageId}/feed`, metaGraphBase(env));
    const body = new URLSearchParams({
      attached_media: JSON.stringify(stagedPhotoIds.map((mediaFbid) => ({ media_fbid: mediaFbid }))),
      access_token: accessToken,
    });
    if (text) body.set("message", text);
    const published = await providerJson(feedUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    if (!published.ok || !published.data?.id) {
      return { ok: false, error_class: published.network_error ? "provider_outcome_unknown" : "provider_rejected" };
    }
    const mediaId = clean(published.data.id, 240);
    const readback = await readPost(mediaId);
    return {
      ok: true,
      media_id: mediaId,
      permalink: readback.ok ? clean(readback.data?.permalink_url, 1500) : null,
      readback_ok: readback.ok,
    };
  }

  const url = new URL(`${pageId}/feed`, metaGraphBase(env));
  const result = await providerJson(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ message: text, access_token: accessToken }),
  });
  if (!result.ok || !result.data?.id) {
    return { ok: false, error_class: result.network_error ? "provider_outcome_unknown" : "provider_rejected" };
  }
  const mediaId = clean(result.data.id, 240);
  const readback = await readPost(mediaId);
  return {
    ok: true,
    media_id: mediaId,
    permalink: readback.ok ? clean(readback.data?.permalink_url, 1500) : null,
    readback_ok: readback.ok,
  };
}

function normalizeImageUrls(values) {
  if (!Array.isArray(values)) return [];
  const urls = [];
  for (const value of values) {
    const normalized = validHttpsUrl(value);
    if (normalized && !urls.includes(normalized)) urls.push(normalized);
  }
  return urls.slice(0, 10);
}

export async function publishInstagramCarousel(env, credential, caption, imageUrls) {
  const urls = normalizeImageUrls(imageUrls);
  if (urls.length < 2 || urls.length > 10) return { ok: false, error_class: "instagram_carousel_requires_2_to_10_https_images" };
  const text = String(caption || "").trim();
  if (text.length > 2200) return { ok: false, error_class: "instagram_caption_too_long" };
  const igUserId = clean(credential?.ig_user_id, 160);
  const accessToken = clean(credential?.access_token, 4096);
  if (!igUserId || !accessToken) return { ok: false, error_class: "authorization_required" };

  const childIds = [];
  for (const imageUrl of urls) {
    const childUrl = new URL(`${igUserId}/media`, metaGraphBase(env));
    const child = await providerJson(childUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        image_url: imageUrl,
        is_carousel_item: "true",
        access_token: accessToken,
      }),
    });
    if (!child.ok || !child.data?.id) {
      return { ok: false, error_class: child.network_error ? "provider_outcome_unknown" : "provider_rejected" };
    }
    childIds.push(clean(child.data.id, 240));
  }

  const parentUrl = new URL(`${igUserId}/media`, metaGraphBase(env));
  const parent = await providerJson(parentUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      media_type: "CAROUSEL",
      children: childIds.join(","),
      caption: text,
      access_token: accessToken,
    }),
  });
  if (!parent.ok || !parent.data?.id) {
    return { ok: false, error_class: parent.network_error ? "provider_outcome_unknown" : "provider_rejected" };
  }

  const publishUrl = new URL(`${igUserId}/media_publish`, metaGraphBase(env));
  const published = await providerJson(publishUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      creation_id: clean(parent.data.id, 240),
      access_token: accessToken,
    }),
  });
  if (!published.ok || !published.data?.id) {
    return { ok: false, error_class: published.network_error ? "provider_outcome_unknown" : "provider_rejected" };
  }

  const mediaId = clean(published.data.id, 240);
  const readUrl = new URL(mediaId, metaGraphBase(env));
  readUrl.searchParams.set("fields", "id,permalink,timestamp,media_type");
  readUrl.searchParams.set("access_token", accessToken);
  const readback = await providerJson(readUrl.toString(), { headers: { Accept: "application/json" } });
  return {
    ok: true,
    media_id: mediaId,
    permalink: readback.ok ? clean(readback.data?.permalink, 1500) : null,
    readback_ok: readback.ok,
  };
}

export async function publishBusinessThreadsText(credential, text) {
  const validated = validateThreadsText(text);
  if (!validated.ok) return { ok: false, error_class: validated.error };
  const accessToken = clean(credential?.access_token, 4096);
  const userId = clean(credential?.threads_user_id, 160);
  if (!accessToken || !userId) return { ok: false, error_class: "authorization_required" };
  const published = await publishThreadsText(accessToken, userId, validated.text);
  if (!published.ok) return published;
  const readback = await readThreadsMedia(accessToken, published.media_id);
  return {
    ok: true,
    media_id: published.media_id,
    permalink: readback.ok ? readback.media.permalink : null,
    readback_ok: readback.ok,
  };
}

export async function connectBusinessThreadsFromCode(db, env, options) {
  const exchange = await exchangeThreadsAuthorizationCode(env, options.code);
  if (!exchange.ok) return exchange;
  const profile = await fetchThreadsProfile(exchange.payload.access_token, exchange.user_id);
  if (!profile.ok) return profile;
  if (String(profile.profile.id) !== String(exchange.user_id)) return { ok: false, error_class: "profile_identity_mismatch" };
  const tokenPayload = {
    ...exchange.payload,
    threads_user_id: String(exchange.user_id),
  };
  const row = await upsertBusinessSocialCredential(db, env, {
    business: options.business,
    ownerId: options.ownerId,
    provider: "threads",
    state: "connected_write",
    accountName: profile.profile.name || profile.profile.username,
    username: profile.profile.username,
    externalAccountRef: profile.profile.id,
    tokenPayload,
    tokenExpiresAt: exchange.expires_at,
    grantedScope: exchange.scope,
    candidateLabels: [],
    connectedAt: new Date().toISOString(),
  });
  return { ok: true, connection: row };
}

export const BUSINESS_SOCIAL_PROVIDERS = PROVIDERS;
