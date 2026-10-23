import { jsonResponse } from "../../_lib/session.mjs";
import {
  EMAIL_ACCOUNT_PATH, EMAIL_CONFIRM_SUBJECT, EMAIL_CONFIRM_TTL_MS, PRIVATE_HEADERS,
  emailMagicEnabled, ensureEmailIdentitySchema, hashSecret, magicEmailText, magicLink,
  normalizeEmail, requestToken, validateEmailRequest, verifiedEmailQuery,
} from "../../_lib/email-identity.mjs";

type Env = {
  DB?: any; HERMES_EMAIL_MAGIC_ENABLED?: string; HERMES_AUTH_TRANSACTIONAL_EMAIL_APPROVED?: string;
  HERMES_AUTH_EMAIL_DELIVERY_READY?: string; HERMES_EMAIL_RATE_SALT?: string;
  LEAD_EMAIL_SERVICE?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
  LEAD_SERVICE_TOKEN?: string;
};
const generic = { success: true, message: "If this address is eligible, a confirmation link will be sent." };
export async function onRequestGet({ env }: { env: Env }) {
  return jsonResponse(200, { success: true, enabled: emailMagicEnabled(env) && Boolean(env.DB) }, PRIVATE_HEADERS);
}
export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB || !emailMagicEnabled(env)) {
    return jsonResponse(503, { success: false, error: "email_verification_not_available" }, PRIVATE_HEADERS);
  }
  if (request.headers.get("Origin") !== new URL(request.url).origin ||
      request.headers.get("Sec-Fetch-Site") === "cross-site") {
    return jsonResponse(403, { success: false, error: "same_origin_required" }, PRIVATE_HEADERS);
  }
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_request" }, PRIVATE_HEADERS); }
  const email = normalizeEmail(body.email);
  if (!validateEmailRequest(email)) return jsonResponse(400, { success: false, error: "invalid_email" }, PRIVATE_HEADERS);
  const displayName = String(body.name || email.split("@")[0]).replace(/[<>\u0000-\u001f\u007f]/g, "").trim().slice(0, 100);
  await ensureEmailIdentitySchema(env.DB);
  const existing = await env.DB.prepare("SELECT id FROM specialists WHERE lower(email)=? LIMIT 1").bind(email).first();
  if (existing) {
    const verified = await env.DB.prepare(verifiedEmailQuery).bind(existing.id, email).first();
    if (!verified) return jsonResponse(202, generic, PRIVATE_HEADERS);
  }
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const emailHash = await hashSecret(String(env.HERMES_EMAIL_RATE_SALT) + ":email:" + email);
  const ipHash = await hashSecret(String(env.HERMES_EMAIL_RATE_SALT) + ":ip:" + ip);
  const hourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
  const recentEmail = await env.DB.prepare("SELECT COUNT(*) as c FROM hermes_email_login_challenges WHERE email_hash=? AND created_at>=?")
    .bind(emailHash, hourAgo).first();
  const recentIp = await env.DB.prepare("SELECT COUNT(*) as c FROM hermes_email_login_challenges WHERE ip_hash=? AND created_at>=?")
    .bind(ipHash, hourAgo).first();
  if (Number(recentEmail?.c || 0) >= 3 || Number(recentIp?.c || 0) >= 12) {
    return jsonResponse(202, generic, PRIVATE_HEADERS);
  }
  const lastTenMinutes = new Date(Date.now() - 10 * 60_000).toISOString();
  const cooling = await env.DB.prepare("SELECT token_hash FROM hermes_email_login_challenges WHERE email_hash=? AND created_at>=? LIMIT 1")
    .bind(emailHash, lastTenMinutes).first();
  if (cooling) return jsonResponse(202, generic, PRIVATE_HEADERS);

  const token = requestToken();
  const now = new Date();
  const tokenHash = await hashSecret(token);
  await env.DB.prepare(`INSERT INTO hermes_email_login_challenges
    (token_hash,email,email_hash,ip_hash,display_name,created_at,expires_at,used_at)
    VALUES (?,?,?,?,?,?,?,NULL)`).bind(
    tokenHash, email, emailHash, ipHash, displayName, now.toISOString(),
    new Date(now.getTime() + EMAIL_CONFIRM_TTL_MS).toISOString(),
  ).run();

  // No automatic sending is possible unless *three* explicit owner/admin gates
  // plus an approved Worker account subject allowlist are configured.
  try {
    const delivery = await env.LEAD_EMAIL_SERVICE!.fetch(EMAIL_ACCOUNT_PATH, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LEAD_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: `verify_${crypto.randomUUID()}`,
        recipient_email: email, subject: EMAIL_CONFIRM_SUBJECT,
        text: magicEmailText(magicLink(token)),
      }),
    });
    if (!delivery.ok) throw new Error("delivery_unavailable");
  } catch {
    await env.DB.prepare("UPDATE hermes_email_login_challenges SET used_at=? WHERE token_hash=? AND used_at IS NULL")
      .bind(new Date().toISOString(), tokenHash).run();
    return jsonResponse(503, { success: false, error: "email_delivery_unavailable" }, PRIVATE_HEADERS);
  }
  return jsonResponse(202, generic, PRIVATE_HEADERS);
}
