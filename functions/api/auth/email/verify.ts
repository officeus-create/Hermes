import { createSessionToken, hashPassword, sessionCookieHeader, sessionExpiry } from "../../../../src/legacy-prototype/auth.mjs";
import { jsonResponse } from "../../_lib/session.mjs";
import {
  PRIVATE_HEADERS, emailMagicEnabled, ensureEmailIdentitySchema,
  hashSecret, validToken, verifiedEmailQuery,
} from "../../_lib/email-identity.mjs";

type Env = { DB?: any; HERMES_EMAIL_MAGIC_ENABLED?: string; HERMES_AUTH_TRANSACTIONAL_EMAIL_APPROVED?: string;
  HERMES_AUTH_EMAIL_DELIVERY_READY?: string; HERMES_EMAIL_RATE_SALT?: string;
  LEAD_EMAIL_SERVICE?: any; LEAD_SERVICE_TOKEN?: string };
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
  const token = typeof body.token === "string" ? body.token : "";
  if (!validToken(token)) return jsonResponse(400, { success: false, error: "invalid_token" }, PRIVATE_HEADERS);
  await ensureEmailIdentitySchema(env.DB);
  const tokenHash = await hashSecret(token);
  const now = new Date().toISOString();
  const challenge = await env.DB.prepare(`SELECT email,display_name FROM hermes_email_login_challenges
    WHERE token_hash=? AND used_at IS NULL AND expires_at>? LIMIT 1`).bind(tokenHash, now).first();
  if (!challenge) return jsonResponse(401, { success: false, error: "expired_or_used" }, PRIVATE_HEADERS);
  const consumed = await env.DB.prepare(`UPDATE hermes_email_login_challenges SET used_at=?
    WHERE token_hash=? AND used_at IS NULL AND expires_at>?`).bind(now, tokenHash, now).run();
  if (Number(consumed?.meta?.changes || 0) !== 1) {
    return jsonResponse(401, { success: false, error: "expired_or_used" }, PRIVATE_HEADERS);
  }

  const email = String(challenge.email);
  let specialist = await env.DB.prepare("SELECT id FROM specialists WHERE lower(email)=? LIMIT 1").bind(email).first();
  if (specialist) {
    const verified = await env.DB.prepare(verifiedEmailQuery).bind(specialist.id, email).first();
    if (!verified) return jsonResponse(409, { success: false, error: "existing_account_signin_required" }, PRIVATE_HEADERS);
  } else {
    const id = `specialist-${crypto.randomUUID()}`;
    const { hash, salt } = await hashPassword(createSessionToken());
    try {
      await env.DB.prepare(`INSERT INTO specialists
        (id,email,password_hash,password_salt,name,role,location,bio,created_at)
        VALUES (?,?,?,?,?,?,?,?,?)`).bind(
        id, email, hash, salt, String(challenge.display_name), "Business Owner",
        "Not provided", "Created using verified passwordless email. Company permissions require separate approval.", now,
      ).run();
      await env.DB.prepare(`INSERT INTO hermes_verified_emails
        (specialist_id,email,verified_at,method) VALUES (?,?,?,'email_magic')`).bind(id,email,now).run();
    } catch {
      // Only a freshly-generated, unassigned specialist can be cleaned up.
      try { await env.DB.prepare("DELETE FROM specialists WHERE id=?").bind(id).run(); } catch {}
      return jsonResponse(409, { success: false, error: "account_create_conflict" }, PRIVATE_HEADERS);
    }
    specialist = { id };
  }
  const sessionToken = createSessionToken();
  await env.DB.prepare("INSERT INTO sessions (token,specialist_id,created_at,expires_at) VALUES (?,?,?,?)")
    .bind(sessionToken, specialist.id, now, sessionExpiry()).run();
  return jsonResponse(200, { success: true }, {
    ...PRIVATE_HEADERS, "Set-Cookie": sessionCookieHeader(sessionToken),
  });
}
