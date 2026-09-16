import { getAuthenticatedSpecialist, jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureConnectorRuntimeSchema,
  getOwnedConnection,
} from "../../../_lib/connector-runtime.mjs";
import { searchTelegramMessages } from "../../../_lib/telegram-connector.mjs";

type Env = { DB?: any };

const privateHeaders = { "Cache-Control": "no-store" };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);

  const url = new URL(request.url);
  const connectionId = url.searchParams.get("connection_id") || "";
  await ensureConnectorRuntimeSchema(env.DB);
  const connection = await getOwnedConnection(env.DB, connectionId, specialist.id);
  if (!connection || connection.provider !== "telegram") {
    return jsonResponse(404, { success: false, error: "connection_not_found" }, privateHeaders);
  }

  const messages = await searchTelegramMessages(env.DB, connection.id, {
    query: url.searchParams.get("q") || "",
    limit: Number(url.searchParams.get("limit") || 50),
    before: url.searchParams.get("before"),
  });

  return jsonResponse(200, {
    success: true,
    connection_id: connection.id,
    messages,
    count: messages.length,
    next_before: messages.length ? (messages[messages.length - 1].sent_at || messages[messages.length - 1].created_at) : null,
  }, privateHeaders);
}
