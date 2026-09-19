import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any };

const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const ACTIONS = new Set(["initialize", "verify_connection", "enable_ingest", "verify_first_record", "revoke"]);
const SECRET_PATTERN = /(?:bearer\s+|api[_ -]?key\s*[:=]|password\s*[:=]|secret\s*[:=]|token\s*[:=]|access[_ -]?token|refresh[_ -]?token)/i;

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

function clean(value: unknown, max = 500) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").trim().slice(0, max);
}

function boolValue(value: unknown) {
  return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true";
}

function safeLifecycle(row: any) {
  return {
    request_id: row.id,
    request_status: row.status,
    source_name: row.source_name,
    source_type: row.source_type,
    provider_name: row.provider_name || null,
    connection_state: row.connection_state || "not_started",
    redistribution_permission: row.requested_redistribution_permission,
    contact_reveal_permission: row.requested_contact_reveal_permission,
    car_hauling_ingest_allowed: Number(row.car_hauling_ingest_allowed || 0) === 1,
    connection_evidence_recorded: Boolean(row.connection_evidence_ref),
    data_rights_evidence_recorded: Boolean(row.data_rights_evidence_ref),
    retention_rule_recorded: Boolean(row.retention_rule),
    revocation_rule_recorded: Boolean(row.revocation_rule),
    connection_verified_at: row.connection_verified_at || null,
    ingest_enabled_at: row.ingest_enabled_at || null,
    first_record_verified_at: row.first_record_verified_at || null,
    revoked_at: row.revoked_at || null,
    revocation_note_recorded: Boolean(row.revocation_note),
    updated_at: row.updated_at,
    outbound_enabled: false,
  };
}

async function loadRequest(db: any, requestId: string) {
  return db.prepare(`
    SELECT *
    FROM hermes_load_source_requests
    WHERE id = ?
    LIMIT 1
  `).bind(requestId).first();
}

async function loadSource(db: any, sourceId: string) {
  if (!sourceId) return null;
  return db.prepare(`
    SELECT id, provider, source_name, source_type, read_enabled, send_enabled, ingest_enabled,
           car_hauling_ingest_allowed, car_hauling_outreach_hold,
           redistribution_permission, contact_reveal_permission,
           last_successful_sync, last_error, status, created_at, updated_at
    FROM hermes_load_sources
    WHERE id = ?
    LIMIT 1
  `).bind(sourceId).first();
}

function safeSource(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    provider: row.provider,
    source_name: row.source_name,
    source_type: row.source_type,
    read_enabled: Number(row.read_enabled || 0) === 1,
    send_enabled: false,
    ingest_enabled: Number(row.ingest_enabled || 0) === 1,
    car_hauling_ingest_allowed: Number(row.car_hauling_ingest_allowed || 0) === 1,
    car_hauling_outreach_hold: Number(row.car_hauling_outreach_hold || 0) === 1,
    redistribution_permission: row.redistribution_permission,
    contact_reveal_permission: row.contact_reveal_permission,
    status: row.status,
    last_successful_sync: row.last_successful_sync || null,
    last_error_present: Boolean(row.last_error),
    updated_at: row.updated_at,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureLoadBoardSchema(env.DB);

  const requestId = clean(new URL(request.url).searchParams.get("request_id"), 160).replace(/[^a-zA-Z0-9_:-]/g, "");
  if (!requestId) return jsonResponse(400, { success: false, error: "request_id_required" }, privateHeaders);

  const row = await loadRequest(env.DB, requestId);
  if (!row) return jsonResponse(404, { success: false, error: "source_request_not_found" }, privateHeaders);
  const source = await loadSource(env.DB, clean(row.source_id, 180));

  return jsonResponse(200, {
    success: true,
    lifecycle: safeLifecycle(row),
    source: safeSource(source),
    boundary: "Approval, connection verification, ingest enablement and first-current-record proof are separate states. No source connection enables outbound messaging.",
  }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "cross_site_mutation_blocked" }, privateHeaders);
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  await ensureLoadBoardSchema(env.DB);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders); }

  const requestId = clean(body.request_id ?? body.requestId, 160).replace(/[^a-zA-Z0-9_:-]/g, "");
  const action = clean(body.action, 40).toLowerCase();
  if (!requestId) return jsonResponse(400, { success: false, error: "request_id_required" }, privateHeaders);
  if (!ACTIONS.has(action)) return jsonResponse(400, { success: false, error: "connection_action_invalid" }, privateHeaders);

  const row = await loadRequest(env.DB, requestId);
  if (!row) return jsonResponse(404, { success: false, error: "source_request_not_found" }, privateHeaders);
  if (row.status !== "approved" && action !== "revoke") {
    return jsonResponse(409, { success: false, error: "source_request_must_be_approved" }, privateHeaders);
  }

  const currentState = clean(row.connection_state, 40) || "not_started";
  const now = new Date().toISOString();

  if (action === "initialize") {
    if (currentState !== "not_started") {
      return jsonResponse(409, { success: false, error: "connection_already_initialized", connection_state: currentState }, privateHeaders);
    }

    const dataRightsEvidenceRef = clean(body.data_rights_evidence_ref ?? body.dataRightsEvidenceRef, 500);
    const retentionRule = clean(body.retention_rule ?? body.retentionRule, 500);
    const revocationRule = clean(body.revocation_rule ?? body.revocationRule, 500);
    if (dataRightsEvidenceRef.length < 3) return jsonResponse(400, { success: false, error: "data_rights_evidence_required" }, privateHeaders);
    if (retentionRule.length < 3) return jsonResponse(400, { success: false, error: "retention_rule_required" }, privateHeaders);
    if (revocationRule.length < 3) return jsonResponse(400, { success: false, error: "revocation_rule_required" }, privateHeaders);
    if (SECRET_PATTERN.test(`${dataRightsEvidenceRef} ${retentionRule} ${revocationRule}`)) {
      return jsonResponse(400, { success: false, error: "secret_material_not_allowed" }, privateHeaders);
    }

    const sourceId = `lbsrc_${crypto.randomUUID()}`;
    const provider = clean(row.provider_name || row.source_name, 140) || "approved_partner_source";
    const sourceName = clean(row.source_name, 140);
    const sourceType = clean(row.source_type, 30);
    const carHaulingAllowed = boolValue(body.car_hauling_ingest_allowed ?? body.carHaulingIngestAllowed) ? 1 : 0;

    await env.DB.prepare(`
      INSERT INTO hermes_load_sources (
        id, provider, source_name, source_type,
        read_enabled, send_enabled, ingest_enabled,
        car_hauling_ingest_allowed, car_hauling_outreach_hold,
        redistribution_permission, contact_reveal_permission,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 0, 0, 0, ?, 1, ?, ?, 'connection_pending', ?, ?)
    `).bind(
      sourceId, provider, sourceName, sourceType, carHaulingAllowed,
      row.requested_redistribution_permission, row.requested_contact_reveal_permission,
      now, now,
    ).run();

    await env.DB.prepare(`
      UPDATE hermes_load_source_requests
      SET connection_state = 'connection_pending',
          source_id = ?,
          data_rights_evidence_ref = ?,
          retention_rule = ?,
          revocation_rule = ?,
          car_hauling_ingest_allowed = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(sourceId, dataRightsEvidenceRef, retentionRule, revocationRule, carHaulingAllowed, now, requestId).run();
  }

  if (action === "verify_connection") {
    if (currentState !== "connection_pending") {
      return jsonResponse(409, { success: false, error: "connection_pending_required", connection_state: currentState }, privateHeaders);
    }
    const connectionEvidenceRef = clean(body.connection_evidence_ref ?? body.connectionEvidenceRef, 500);
    if (connectionEvidenceRef.length < 3) return jsonResponse(400, { success: false, error: "connection_evidence_required" }, privateHeaders);
    if (SECRET_PATTERN.test(connectionEvidenceRef)) return jsonResponse(400, { success: false, error: "secret_material_not_allowed" }, privateHeaders);
    if (body.runtime_verified !== true && body.runtimeVerified !== true) {
      return jsonResponse(400, { success: false, error: "runtime_verification_required" }, privateHeaders);
    }
    const sourceId = clean(row.source_id, 180);
    if (!sourceId) return jsonResponse(409, { success: false, error: "source_connection_not_initialized" }, privateHeaders);

    await env.DB.prepare(`
      UPDATE hermes_load_sources
      SET status = 'connection_verified', read_enabled = 0, ingest_enabled = 0, send_enabled = 0, updated_at = ?
      WHERE id = ?
    `).bind(now, sourceId).run();
    await env.DB.prepare(`
      UPDATE hermes_load_source_requests
      SET connection_state = 'connection_verified',
          connection_evidence_ref = ?,
          connection_verified_at = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(connectionEvidenceRef, now, now, requestId).run();
  }

  if (action === "enable_ingest") {
    if (currentState !== "connection_verified") {
      return jsonResponse(409, { success: false, error: "verified_connection_required", connection_state: currentState }, privateHeaders);
    }
    if (!row.data_rights_evidence_ref || !row.connection_evidence_ref) {
      return jsonResponse(409, { success: false, error: "connection_and_rights_evidence_required" }, privateHeaders);
    }
    const sourceId = clean(row.source_id, 180);
    if (!sourceId) return jsonResponse(409, { success: false, error: "source_connection_not_initialized" }, privateHeaders);

    await env.DB.prepare(`
      UPDATE hermes_load_sources
      SET status = 'ingest_enabled', read_enabled = 1, ingest_enabled = 1, send_enabled = 0, updated_at = ?
      WHERE id = ?
    `).bind(now, sourceId).run();
    await env.DB.prepare(`
      UPDATE hermes_load_source_requests
      SET connection_state = 'ingest_enabled', ingest_enabled_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(now, now, requestId).run();
  }

  if (action === "verify_first_record") {
    if (currentState !== "ingest_enabled") {
      return jsonResponse(409, { success: false, error: "ingest_enabled_required", connection_state: currentState }, privateHeaders);
    }
    const sourceId = clean(row.source_id, 180);
    if (!sourceId) return jsonResponse(409, { success: false, error: "source_connection_not_initialized" }, privateHeaders);

    const currentRecord = await env.DB.prepare(`
      SELECT id, last_seen_at
      FROM hermes_load_records
      WHERE source_id = ? AND status = 'active' AND expires_at > ?
      ORDER BY last_seen_at DESC
      LIMIT 1
    `).bind(sourceId, now).first();
    if (!currentRecord) {
      return jsonResponse(409, { success: false, error: "current_source_record_required" }, privateHeaders);
    }

    await env.DB.prepare(`
      UPDATE hermes_load_sources
      SET status = 'active', read_enabled = 1, ingest_enabled = 1, send_enabled = 0,
          last_successful_sync = COALESCE(?, last_successful_sync), updated_at = ?
      WHERE id = ?
    `).bind(currentRecord.last_seen_at || now, now, sourceId).run();
    await env.DB.prepare(`
      UPDATE hermes_load_source_requests
      SET connection_state = 'active', first_record_verified_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(now, now, requestId).run();
  }

  if (action === "revoke") {
    if (currentState === "not_started") {
      return jsonResponse(409, { success: false, error: "connection_not_initialized" }, privateHeaders);
    }
    const sourceId = clean(row.source_id, 180);
    if (!sourceId) return jsonResponse(409, { success: false, error: "source_connection_not_initialized" }, privateHeaders);
    const reason = clean(body.reason, 500);
    if (reason.length < 3) return jsonResponse(400, { success: false, error: "revocation_reason_required" }, privateHeaders);
    if (SECRET_PATTERN.test(reason)) return jsonResponse(400, { success: false, error: "secret_material_not_allowed" }, privateHeaders);

    await env.DB.prepare(`
      UPDATE hermes_load_sources
      SET status = 'revoked', read_enabled = 0, ingest_enabled = 0, send_enabled = 0,
          updated_at = ?
      WHERE id = ?
    `).bind(now, sourceId).run();
    await env.DB.prepare(`
      UPDATE hermes_load_source_requests
      SET connection_state = 'revoked', revoked_at = ?, revocation_note = ?, updated_at = ?
      WHERE id = ?
    `).bind(now, reason, now, requestId).run();
  }

  const saved = await loadRequest(env.DB, requestId);
  const source = await loadSource(env.DB, clean(saved?.source_id, 180));
  return jsonResponse(200, {
    success: true,
    lifecycle: safeLifecycle(saved),
    source: safeSource(source),
    boundary: "Outbound stays disabled. ACTIVE requires a verified connection, enabled ingestion and at least one current active D1 record from this exact source.",
  }, privateHeaders);
}
