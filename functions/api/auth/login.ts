import { isValidEmail, verifyPassword, createSessionToken, sessionExpiry, sessionCookieHeader } from "../../../src/legacy-prototype/auth.mjs";
import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB: D1Database };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
  const password = typeof body.password === "string" ? body.password : "";
  if (!isValidEmail(email) || !password) return jsonResponse(400, { success: false, error: "invalid_credentials" });

  const record = await env.DB
    .prepare("SELECT id, password_hash, password_salt FROM specialists WHERE email = ?")
    .bind(email)
    .first<{ id: string; password_hash: string; password_salt: string }>();

  if (!record || !(await verifyPassword(password, record.password_salt, record.password_hash))) {
    return jsonResponse(401, { success: false, error: "invalid_credentials" });
  }

  const token = createSessionToken();
  const createdAt = new Date().toISOString();
  const expiresAt = sessionExpiry();
  await env.DB.prepare("INSERT INTO sessions (token, specialist_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(token, record.id, createdAt, expiresAt)
    .run();

  return jsonResponse(200, { success: true }, { "Set-Cookie": sessionCookieHeader(token) });
}
