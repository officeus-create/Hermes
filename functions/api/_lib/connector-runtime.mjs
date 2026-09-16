export const CONNECTOR_CONTRACT_VERSION = "1.0";

export const CONNECTOR_STATES = new Set(["draft", "ready", "active", "paused", "error", "revoked"]);
export const CONNECTOR_MODES = new Set(["read_only", "read_write"]);
export const CONSENT_SCOPES = new Set(["owner_content", "explicit_opt_in"]);

let connectorSchemaReady = false;

export function validateConnectorManifest(manifest) {
  if (!manifest || typeof manifest !== "object") throw new Error("connector_manifest_required");
  for (const field of ["provider", "name", "version", "contract_version"]) {
    if (!String(manifest[field] || "").trim()) throw new Error(`connector_manifest_missing_${field}`);
  }
  if (manifest.contract_version !== CONNECTOR_CONTRACT_VERSION) throw new Error("connector_contract_version_mismatch");
  if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) throw new Error("connector_manifest_capabilities_required");
  return manifest;
}

export async function ensureConnectorRuntimeSchema(db) {
  if (!db?.prepare) throw new Error("connector_database_required");
  if (connectorSchemaReady) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS hc_connections (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      label TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'read_only',
      state TEXT NOT NULL DEFAULT 'draft',
      config_json TEXT NOT NULL DEFAULT '{}',
      last_sync_at TEXT,
      last_error_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      revoked_at TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_hc_connections_owner_provider
      ON hc_connections(owner_specialist_id, provider, state)`,
    `CREATE TABLE IF NOT EXISTS hc_connection_verifiers (
      connection_id TEXT PRIMARY KEY,
      verifier_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      rotated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS hc_sources (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      external_source_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      consent_scope TEXT NOT NULL,
      ingestion_enabled INTEGER NOT NULL DEFAULT 0,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(connection_id, external_source_id)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_hc_sources_connection_enabled
      ON hc_sources(connection_id, ingestion_enabled)`,
    `CREATE TABLE IF NOT EXISTS hc_raw_events (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      provider_event_id TEXT NOT NULL,
      source_id TEXT,
      event_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      payload_sha256 TEXT NOT NULL,
      external_created_at TEXT,
      received_at TEXT NOT NULL,
      processing_status TEXT NOT NULL DEFAULT 'accepted',
      UNIQUE(connection_id, provider_event_id)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_hc_raw_events_connection_received
      ON hc_raw_events(connection_id, received_at DESC)`,
    `CREATE TABLE IF NOT EXISTS hc_messages (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      external_chat_id TEXT NOT NULL,
      external_message_id TEXT NOT NULL,
      external_author_id TEXT,
      author_name TEXT,
      text TEXT NOT NULL DEFAULT '',
      sent_at TEXT,
      edited_at TEXT,
      raw_event_id TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(connection_id, external_chat_id, external_message_id)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_hc_messages_connection_sent
      ON hc_messages(connection_id, sent_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_hc_messages_source_sent
      ON hc_messages(source_id, sent_at DESC)`,
    `CREATE TABLE IF NOT EXISTS hc_sync_runs (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      sync_kind TEXT NOT NULL,
      state TEXT NOT NULL,
      accepted_count INTEGER NOT NULL DEFAULT 0,
      ignored_count INTEGER NOT NULL DEFAULT 0,
      error_count INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      cursor_json TEXT NOT NULL DEFAULT '{}',
      error_code TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS hc_checkpoints (
      connection_id TEXT NOT NULL,
      checkpoint_key TEXT NOT NULL,
      checkpoint_value TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(connection_id, checkpoint_key)
    )`,
    `CREATE TABLE IF NOT EXISTS hc_knowledge_items (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      source_message_id TEXT,
      kind TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'candidate',
      provenance_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_hc_knowledge_connection_kind
      ON hc_knowledge_items(connection_id, kind, status)`,
    `CREATE TABLE IF NOT EXISTS hc_audit_events (
      id TEXT PRIMARY KEY,
      connection_id TEXT,
      actor_specialist_id TEXT,
      action TEXT NOT NULL,
      outcome TEXT NOT NULL,
      details_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_hc_audit_connection_created
      ON hc_audit_events(connection_id, created_at DESC)`,
    `CREATE TABLE IF NOT EXISTS hc_dead_letters (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      provider_event_id TEXT,
      error_code TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      retry_count INTEGER NOT NULL DEFAULT 0,
      next_retry_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ];

  for (const sql of statements) await db.prepare(sql).run();
  connectorSchemaReady = true;
}

export function safeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

export function sanitizeConnectionConfig(input = {}) {
  if (Array.isArray(input)) return input.map((item) => sanitizeConnectionConfig(item));
  if (!input || typeof input !== "object") return input;
  const config = {};
  for (const [key, value] of Object.entries(input)) {
    if (/token|secret|password|cookie|session|api[_-]?key|authorization/i.test(key)) continue;
    config[key] = value && typeof value === "object" ? sanitizeConnectionConfig(value) : value;
  }
  return config;
}

export async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value ?? ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function secureEqualHex(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

export async function createConnection(db, {
  ownerSpecialistId,
  tenantId,
  provider,
  label,
  mode = "read_only",
  state = "draft",
  config = {},
}) {
  if (!CONNECTOR_MODES.has(mode)) throw new Error("invalid_connector_mode");
  if (!CONNECTOR_STATES.has(state)) throw new Error("invalid_connector_state");
  const now = new Date().toISOString();
  const id = `hc-${provider}-${crypto.randomUUID()}`;
  await db.prepare(`
    INSERT INTO hc_connections (
      id, owner_specialist_id, tenant_id, provider, label, mode, state, config_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    ownerSpecialistId,
    tenantId || ownerSpecialistId,
    provider,
    String(label || provider),
    mode,
    state,
    JSON.stringify(sanitizeConnectionConfig(config)),
    now,
    now,
  ).run();
  return getConnection(db, id);
}

export async function getConnection(db, connectionId) {
  return db.prepare(`SELECT * FROM hc_connections WHERE id = ? LIMIT 1`).bind(connectionId).first();
}

export async function getOwnedConnection(db, connectionId, ownerSpecialistId) {
  return db.prepare(`
    SELECT * FROM hc_connections
    WHERE id = ? AND owner_specialist_id = ? AND revoked_at IS NULL
    LIMIT 1
  `).bind(connectionId, ownerSpecialistId).first();
}

export async function listConnectionsForOwner(db, ownerSpecialistId) {
  const result = await db.prepare(`
    SELECT id,tenant_id,provider,label,mode,state,config_json,last_sync_at,last_error_code,created_at,updated_at
    FROM hc_connections
    WHERE owner_specialist_id = ? AND revoked_at IS NULL
    ORDER BY created_at DESC
  `).bind(ownerSpecialistId).all();
  return (result?.results || []).map((row) => ({ ...row, config: safeJson(row.config_json) }));
}

export async function setConnectionVerifier(db, connectionId, secret) {
  const value = String(secret || "").trim();
  if (!/^[A-Za-z0-9_-]{24,256}$/.test(value)) throw new Error("invalid_webhook_secret_format");
  const hash = await sha256Hex(value);
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO hc_connection_verifiers (connection_id, verifier_hash, created_at, rotated_at)
    VALUES (?, ?, ?, NULL)
    ON CONFLICT(connection_id) DO UPDATE SET
      verifier_hash = excluded.verifier_hash,
      rotated_at = excluded.created_at
  `).bind(connectionId, hash, now).run();
}

export async function verifyConnectionSecret(db, connectionId, providedSecret) {
  const row = await db.prepare(`
    SELECT verifier_hash FROM hc_connection_verifiers WHERE connection_id = ? LIMIT 1
  `).bind(connectionId).first();
  if (!row?.verifier_hash) return false;
  const candidateHash = await sha256Hex(String(providedSecret || ""));
  return secureEqualHex(row.verifier_hash, candidateHash);
}

export async function upsertSource(db, {
  connectionId,
  externalSourceId,
  sourceType,
  title = "",
  consentScope,
  ingestionEnabled = false,
  metadata = {},
}) {
  if (!CONSENT_SCOPES.has(consentScope)) throw new Error("invalid_consent_scope");
  const now = new Date().toISOString();
  const sourceId = `hc-src-${crypto.randomUUID()}`;
  await db.prepare(`
    INSERT INTO hc_sources (
      id, connection_id, external_source_id, source_type, title, consent_scope,
      ingestion_enabled, metadata_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(connection_id, external_source_id) DO UPDATE SET
      source_type = excluded.source_type,
      title = excluded.title,
      consent_scope = excluded.consent_scope,
      ingestion_enabled = excluded.ingestion_enabled,
      metadata_json = excluded.metadata_json,
      updated_at = excluded.updated_at
  `).bind(
    sourceId,
    connectionId,
    String(externalSourceId),
    String(sourceType || "chat"),
    String(title || ""),
    consentScope,
    ingestionEnabled ? 1 : 0,
    JSON.stringify(metadata || {}),
    now,
    now,
  ).run();
  return getSource(db, connectionId, String(externalSourceId));
}

export async function getSource(db, connectionId, externalSourceId) {
  return db.prepare(`
    SELECT * FROM hc_sources
    WHERE connection_id = ? AND external_source_id = ?
    LIMIT 1
  `).bind(connectionId, String(externalSourceId)).first();
}

export async function listSources(db, connectionId) {
  const result = await db.prepare(`
    SELECT id,external_source_id,source_type,title,consent_scope,ingestion_enabled,metadata_json,created_at,updated_at
    FROM hc_sources
    WHERE connection_id = ?
    ORDER BY title COLLATE NOCASE, external_source_id
  `).bind(connectionId).all();
  return (result?.results || []).map((row) => ({ ...row, metadata: safeJson(row.metadata_json) }));
}

export async function recordAudit(db, {
  connectionId = null,
  actorSpecialistId = null,
  action,
  outcome,
  details = {},
}) {
  await db.prepare(`
    INSERT INTO hc_audit_events (id,connection_id,actor_specialist_id,action,outcome,details_json,created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    `hc-audit-${crypto.randomUUID()}`,
    connectionId,
    actorSpecialistId,
    String(action),
    String(outcome),
    JSON.stringify(details || {}),
    new Date().toISOString(),
  ).run();
}
