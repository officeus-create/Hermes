import { getAuthenticatedSpecialist, jsonResponse } from "../../../_lib/session.mjs";
import {
  createConnection,
  ensureConnectorRuntimeSchema,
  getOwnedConnection,
  recordAudit,
  safeJson,
  setConnectionVerifier,
} from "../../../_lib/connector-runtime.mjs";

type Env = { DB?: any };

type ConnectionPayload = {
  label?: string;
  ingestion_policy?: "owner_authored_only" | "approved_sources";
  owner_telegram_user_id?: string | number;
  retain_raw_events?: boolean;
  webhook_secret?: string;
};

const privateHeaders = { "Cache-Control": "no-store" };

function publicConnection(row: any) {
  if (!row) return null;
  const { config_json, ...rest } = row;
  return { ...rest, config: safeJson(config_json) };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);

  let payload: ConnectionPayload;
  try {
    payload = (await request.json()) as ConnectionPayload;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  }

  const policy = payload.ingestion_policy || "owner_authored_only";
  if (!new Set(["owner_authored_only", "approved_sources"]).has(policy)) {
    return jsonResponse(400, { success: false, error: "invalid_ingestion_policy" }, privateHeaders);
  }
  if (policy === "owner_authored_only" && !String(payload.owner_telegram_user_id || "").trim()) {
    return jsonResponse(400, { success: false, error: "owner_telegram_user_id_required" }, privateHeaders);
  }

  const verifier = String(payload.webhook_secret || "").trim();
  const hasVerifier = Boolean(verifier);
  if (hasVerifier && !/^[A-Za-z0-9_-]{24,256}$/.test(verifier)) {
    return jsonResponse(400, { success: false, error: "invalid_webhook_secret_format" }, privateHeaders);
  }

  await ensureConnectorRuntimeSchema(env.DB);
  const connection = await createConnection(env.DB, {
    ownerSpecialistId: specialist.id,
    tenantId: specialist.id,
    provider: "telegram",
    label: String(payload.label || "Telegram knowledge"),
    mode: "read_only",
    state: "draft",
    config: {
      ingestion_policy: policy,
      owner_telegram_user_id: payload.owner_telegram_user_id == null ? null : String(payload.owner_telegram_user_id),
      retain_raw_events: payload.retain_raw_events === true,
      outbound_actions_enabled: false,
    },
  });

  if (hasVerifier) await setConnectionVerifier(env.DB, connection.id, verifier);
  await recordAudit(env.DB, {
    connectionId: connection.id,
    actorSpecialistId: specialist.id,
    action: "telegram_connection_create",
    outcome: "success",
    details: { policy, verifier_configured: hasVerifier, mode: "read_only" },
  });

  return jsonResponse(201, {
    success: true,
    connection: publicConnection(connection),
    webhook: {
      configured: hasVerifier,
      path: `/api/hermes-connect/connectors/telegram/webhook?connection_id=${encodeURIComponent(connection.id)}`,
      secret_echoed: false,
    },
  }, privateHeaders);
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);

  const connectionId = new URL(request.url).searchParams.get("connection_id") || "";
  await ensureConnectorRuntimeSchema(env.DB);
  const connection = await getOwnedConnection(env.DB, connectionId, specialist.id);
  if (!connection || connection.provider !== "telegram") {
    return jsonResponse(404, { success: false, error: "connection_not_found" }, privateHeaders);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE hc_connections SET state = 'revoked', revoked_at = ?, updated_at = ? WHERE id = ?
  `).bind(now, now, connection.id).run();
  await recordAudit(env.DB, {
    connectionId: connection.id,
    actorSpecialistId: specialist.id,
    action: "telegram_connection_revoke",
    outcome: "success",
  });

  return jsonResponse(200, { success: true, state: "revoked" }, privateHeaders);
}
