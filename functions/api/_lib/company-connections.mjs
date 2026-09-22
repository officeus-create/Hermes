const CONNECTION_STATES = new Set([
  "not_configured",
  "configuration_required",
  "ready_for_owner_auth",
  "connected_read_only",
  "connected_write",
  "degraded",
  "revoked",
]);

const CONNECTION_MODES = new Set(["none", "read_only", "read_write"]);
const CONTROL_CHARS = /[\u0000-\u001f\u007f<>]/g;

export function cleanConnectionText(value, max = 240) {
  return String(value ?? "").replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function normalizeConnectionState(value, fallback = "not_configured") {
  const state = cleanConnectionText(value, 48).toLowerCase();
  return CONNECTION_STATES.has(state) ? state : fallback;
}

export function normalizeConnectionMode(value, fallback = "none") {
  const mode = cleanConnectionText(value, 24).toLowerCase();
  return CONNECTION_MODES.has(mode) ? mode : fallback;
}

export async function ensureCompanyConnectionsSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_company_connections (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'not_configured',
      mode TEXT NOT NULL DEFAULT 'none',
      source_url TEXT,
      external_account_ref TEXT,
      last_verified_at TEXT,
      last_error TEXT,
      metadata_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(company_id, provider)
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_company_connections_company ON hermes_company_connections(company_id, provider, state)").run();
}

/**
 * @param {any} db
 * @param {{
 *   companyId: any,
 *   provider: any,
 *   state: any,
 *   mode?: any,
 *   sourceUrl?: any,
 *   externalAccountRef?: any,
 *   lastVerifiedAt?: any,
 *   lastError?: any,
 *   metadata?: any
 * }} options
 */
export async function upsertCompanyConnection(db, options) {
  const {
    companyId,
    provider,
    state,
    mode = "none",
    sourceUrl = null,
    externalAccountRef = null,
    lastVerifiedAt = null,
    lastError = null,
    metadata = null,
  } = options;
  await ensureCompanyConnectionsSchema(db);
  const safeProvider = cleanConnectionText(provider, 48).toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
  if (!safeProvider) throw new Error("provider_required");
  const now = new Date().toISOString();
  const id = `hcc_${crypto.randomUUID()}`;
  const safeState = normalizeConnectionState(state);
  const safeMode = normalizeConnectionMode(mode);
  const safeSourceUrl = sourceUrl ? cleanConnectionText(sourceUrl, 600) : null;
  const safeExternalRef = externalAccountRef ? cleanConnectionText(externalAccountRef, 240) : null;
  const safeError = lastError ? cleanConnectionText(lastError, 240) : null;
  const metadataJson = metadata == null ? null : JSON.stringify(metadata).slice(0, 12_000);

  await db.prepare(`
    INSERT INTO hermes_company_connections (
      id, company_id, provider, state, mode, source_url, external_account_ref,
      last_verified_at, last_error, metadata_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(company_id, provider) DO UPDATE SET
      state = excluded.state,
      mode = excluded.mode,
      source_url = excluded.source_url,
      external_account_ref = excluded.external_account_ref,
      last_verified_at = excluded.last_verified_at,
      last_error = excluded.last_error,
      metadata_json = excluded.metadata_json,
      updated_at = excluded.updated_at
  `).bind(
    id, String(companyId), safeProvider, safeState, safeMode, safeSourceUrl, safeExternalRef,
    lastVerifiedAt || null, safeError, metadataJson, now, now,
  ).run();

  return db.prepare(`
    SELECT id, company_id, provider, state, mode, source_url, external_account_ref,
           last_verified_at, last_error, metadata_json, created_at, updated_at
    FROM hermes_company_connections
    WHERE company_id = ? AND provider = ?
    LIMIT 1
  `).bind(String(companyId), safeProvider).first();
}

export async function listCompanyConnections(db, companyId) {
  await ensureCompanyConnectionsSchema(db);
  const result = await db.prepare(`
    SELECT id, company_id, provider, state, mode, source_url, external_account_ref,
           last_verified_at, last_error, metadata_json, created_at, updated_at
    FROM hermes_company_connections
    WHERE company_id = ?
    ORDER BY provider
  `).bind(String(companyId)).all();

  return (result?.results || []).map((row) => ({
    id: row.id,
    company_id: row.company_id,
    provider: row.provider,
    state: row.state,
    mode: row.mode,
    source_url: row.source_url || null,
    external_account_ref: row.external_account_ref || null,
    last_verified_at: row.last_verified_at || null,
    last_error: row.last_error || null,
    metadata: (() => {
      try { return row.metadata_json ? JSON.parse(row.metadata_json) : null; }
      catch { return null; }
    })(),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}
