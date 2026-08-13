import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = { DB: D1Database };

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const cleanText = (value: unknown, max: number) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

export async function onRequestPut({ request, params, env }: { request: Request; params: { email: string }; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const email = decodeURIComponent(String(params.email || "")).toLowerCase().slice(0, 160);
  if (!email) return jsonResponse(400, { success: false, error: "email_required" });

  const ownsClient = await env.DB
    .prepare("SELECT 1 FROM bookings WHERE specialist_id = ? AND client_email = ? LIMIT 1")
    .bind(specialist.id, email)
    .first();
  if (!ownsClient) return jsonResponse(404, { success: false, error: "client_not_found" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const note = cleanText(body.note, 1000);
  const updatedAt = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO client_notes (specialist_id, client_email, note, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(specialist_id, client_email) DO UPDATE SET note = excluded.note, updated_at = excluded.updated_at`,
  ).bind(specialist.id, email, note, updatedAt).run();

  return jsonResponse(200, { success: true, note, updatedAt });
}
