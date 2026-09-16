import { getAuthenticatedSpecialist, jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureConnectorRuntimeSchema,
  getOwnedConnection,
  listSources,
  recordAudit,
  upsertSource,
} from "../../../_lib/connector-runtime.mjs";

type Env = { DB?: any };

type SourcePayload = {
  connection_id?: string;
  chat_id?: string | number;
  source_type?: "private" | "group" | "supergroup" | "channel" | "saved_messages" | "chat";
  title?: string;
  consent_scope?: "owner_content";
  ingestion_enabled?: boolean;
};

const privateHeaders = { "Cache-Control": "no-store" };

async function requireTelegramConnection(db: any, connectionId: string, ownerId: string) {
  const connection = await getOwnedConnection(db, connectionId, ownerId);
  if (!connection || connection.provider !== "telegram") return null;
  return connection;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);
  const connectionId = new URL(request.url).searchParams.get("connection_id") || "";

  await ensureConnectorRuntimeSchema(env.DB);
  const connection = await requireTelegramConnection(env.DB, connectionId, specialist.id);
  if (!connection) return jsonResponse(404, { success: false, error: "connection_not_found" }, privateHeaders);
  return jsonResponse(200, { success: true, sources: await listSources(env.DB, connection.id) }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);

  let payload: SourcePayload;
  try {
    payload = (await request.json()) as SourcePayload;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  }

  const connectionId = String(payload.connection_id || "").trim();
  const chatId = String(payload.chat_id ?? "").trim();
  if (!connectionId || !chatId) {
    return jsonResponse(400, { success: false, error: "connection_and_chat_required" }, privateHeaders);
  }
  if (payload.consent_scope && payload.consent_scope !== "owner_content") {
    return jsonResponse(400, { success: false, error: "telegram_v0_1_owner_content_only" }, privateHeaders);
  }

  await ensureConnectorRuntimeSchema(env.DB);
  const connection = await requireTelegramConnection(env.DB, connectionId, specialist.id);
  if (!connection) return jsonResponse(404, { success: false, error: "connection_not_found" }, privateHeaders);

  const source = await upsertSource(env.DB, {
    connectionId: connection.id,
    externalSourceId: chatId,
    sourceType: payload.source_type || "chat",
    title: payload.title || "",
    consentScope: "owner_content",
    ingestionEnabled: payload.ingestion_enabled === true,
    metadata: { approval_source: "authenticated_owner_configuration", owner_authored_only: true },
  });
  await recordAudit(env.DB, {
    connectionId: connection.id,
    actorSpecialistId: specialist.id,
    action: "telegram_source_configure",
    outcome: "success",
    details: { external_source_id: chatId, consent_scope: "owner_content", ingestion_enabled: payload.ingestion_enabled === true },
  });
  return jsonResponse(200, { success: true, source }, privateHeaders);
}
