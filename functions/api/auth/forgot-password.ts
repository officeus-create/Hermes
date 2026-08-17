import { isValidEmail } from "../../../src/legacy-prototype/auth.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import {
  PASSWORD_RESET_EMAIL_PATH,
  PASSWORD_RESET_SUBJECT,
  canonicalPasswordResetUrl,
  createPasswordResetToken,
  ensurePasswordResetSchema,
  hashPasswordResetToken,
  normalizePasswordResetLocale,
  passwordResetEmailText,
  passwordResetExpiry,
} from "../_lib/password-reset.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = {
  DB?: any;
  LEAD_EMAIL_SERVICE?: ServiceFetcher;
  LEAD_SERVICE_TOKEN?: string;
};

const acknowledgement = {
  success: true,
  message: "If an eligible Repair Shop owner account exists for that email, a reset link will be sent shortly.",
};

async function deliverResetEmail(env: Env, recipient: string, resetUrl: string) {
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) return false;
  try {
    const response = await env.LEAD_EMAIL_SERVICE.fetch(PASSWORD_RESET_EMAIL_PATH, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LEAD_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: `password_reset_${crypto.randomUUID()}`,
        subject: PASSWORD_RESET_SUBJECT,
        text: passwordResetEmailText(resetUrl),
        recipient_email: recipient,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
  const locale = normalizePasswordResetLocale(body.lang);

  await ensurePasswordResetSchema(env.DB);
  const now = new Date();
  const nowIso = now.toISOString();
  const recentWindow = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  // Keep one hour of request history so the hourly limit is real. Old expired/used
  // rows are removed only after they no longer contribute to that window.
  await env.DB
    .prepare("DELETE FROM password_reset_tokens WHERE created_at < ? AND (expires_at <= ? OR used_at IS NOT NULL)")
    .bind(recentWindow, nowIso)
    .run();

  // Keep the public response identical for unknown, malformed, and eligible accounts.
  if (!isValidEmail(email)) return jsonResponse(200, acknowledgement);

  const specialist = await env.DB
    .prepare("SELECT id, email, role FROM specialists WHERE email = ? LIMIT 1")
    .bind(email)
    .first() as { id: string; email: string; role: string } | null;

  if (!specialist || specialist.role !== "Shop Owner") return jsonResponse(200, acknowledgement);

  const recent = await env.DB
    .prepare("SELECT COUNT(*) AS count FROM password_reset_tokens WHERE specialist_id = ? AND created_at >= ?")
    .bind(specialist.id, recentWindow)
    .first() as { count?: number } | null;
  if (Number(recent?.count ?? 0) >= 3) return jsonResponse(200, acknowledgement);

  const token = createPasswordResetToken();
  const tokenHash = await hashPasswordResetToken(token);
  const expiresAt = passwordResetExpiry(now);
  // Invalidate prior links without deleting their request-history rows.
  await env.DB
    .prepare("UPDATE password_reset_tokens SET used_at = ? WHERE specialist_id = ? AND used_at IS NULL")
    .bind(nowIso, specialist.id)
    .run();
  await env.DB.prepare(`
    INSERT INTO password_reset_tokens (token_hash, specialist_id, email, created_at, expires_at, used_at)
    VALUES (?, ?, ?, ?, ?, NULL)
  `).bind(tokenHash, specialist.id, specialist.email, nowIso, expiresAt).run();

  const delivered = await deliverResetEmail(env, specialist.email, canonicalPasswordResetUrl(token, locale));
  if (!delivered) {
    await env.DB.prepare("DELETE FROM password_reset_tokens WHERE token_hash = ?").bind(tokenHash).run();
    console.error("password_reset_delivery_failed", { category: "email_unavailable" });
  }

  return jsonResponse(200, acknowledgement);
}
