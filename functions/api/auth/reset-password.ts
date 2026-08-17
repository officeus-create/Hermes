import { hashPassword, isValidPassword, sessionCookieHeader } from "../../../src/legacy-prototype/auth.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import {
  ensurePasswordResetSchema,
  hashPasswordResetToken,
  isPasswordResetTokenShape,
} from "../_lib/password-reset.mjs";

type Env = { DB?: any };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const token = typeof body.token === "string" ? body.token.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!isPasswordResetTokenShape(token)) return jsonResponse(400, { success: false, error: "invalid_or_expired_token" });
  if (!isValidPassword(password)) return jsonResponse(400, { success: false, error: "password_too_short" });

  await ensurePasswordResetSchema(env.DB);
  const tokenHash = await hashPasswordResetToken(token);
  const nowIso = new Date().toISOString();
  const reset = await env.DB
    .prepare("SELECT specialist_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ? LIMIT 1")
    .bind(tokenHash)
    .first() as { specialist_id: string; expires_at: string; used_at: string | null } | null;

  if (!reset || reset.used_at || new Date(reset.expires_at).getTime() <= Date.now()) {
    return jsonResponse(400, { success: false, error: "invalid_or_expired_token" });
  }

  const claim = await env.DB
    .prepare("UPDATE password_reset_tokens SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?")
    .bind(nowIso, tokenHash, nowIso)
    .run();
  if (Number(claim?.meta?.changes ?? 0) !== 1) {
    return jsonResponse(400, { success: false, error: "invalid_or_expired_token" });
  }

  const { hash, salt } = await hashPassword(password);
  await env.DB
    .prepare("UPDATE specialists SET password_hash = ?, password_salt = ? WHERE id = ?")
    .bind(hash, salt, reset.specialist_id)
    .run();
  await env.DB.prepare("DELETE FROM sessions WHERE specialist_id = ?").bind(reset.specialist_id).run();
  await env.DB.prepare("DELETE FROM password_reset_tokens WHERE specialist_id = ? AND token_hash <> ?").bind(reset.specialist_id, tokenHash).run();

  return jsonResponse(
    200,
    { success: true, message: "Password updated. Sign in again with your new password." },
    { "Set-Cookie": sessionCookieHeader("", { clear: true }) },
  );
}
