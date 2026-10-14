import { createSessionToken, isValidEmail, toHex } from "../../../src/legacy-prototype/auth.mjs";

export const EMAIL_CONFIRM_SUBJECT = "[HERMES ACCOUNT] [EMAIL VERIFICATION]";
export const EMAIL_ACCOUNT_PATH = "https://lead-email.internal/v1/send-account";
export const EMAIL_CONFIRM_TTL_MS = 15 * 60_000;
export const PRIVATE_HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };
export const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase().slice(0, 160);
export const hashSecret = async (token) => toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(token))));
export const validToken = (token) => typeof token === "string" && /^[a-f0-9]{64}$/.test(token);

export function emailMagicEnabled(env) {
  // ALL gates must be explicitly approved for transactional email.  No defaults.
  // The account email worker does not yet accept EMAIL_CONFIRM_SUBJECT: the
  // owner must approve a separate, tested Worker allowlist rollout before READY.
  return env.HERMES_EMAIL_MAGIC_ENABLED === "true"
    && env.HERMES_AUTH_TRANSACTIONAL_EMAIL_APPROVED === "true"
    && env.HERMES_AUTH_EMAIL_DELIVERY_READY === "true"
    && typeof env.HERMES_EMAIL_RATE_SALT === "string"
    && env.HERMES_EMAIL_RATE_SALT.length >= 16
    && Boolean(env.LEAD_EMAIL_SERVICE && env.LEAD_SERVICE_TOKEN);
}
export async function ensureEmailIdentitySchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_email_login_challenges (
    token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, email_hash TEXT NOT NULL,
    ip_hash TEXT NOT NULL, display_name TEXT NOT NULL, created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL, used_at TEXT
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_email_login_email_rate ON hermes_email_login_challenges(email_hash,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_email_login_ip_rate ON hermes_email_login_challenges(ip_hash,created_at)").run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_verified_emails (
    specialist_id TEXT PRIMARY KEY, email TEXT NOT NULL, verified_at TEXT NOT NULL, method TEXT NOT NULL
  )`).run();
}
export const magicLink = (token) => {
  const url = new URL("https://hermeslogisticsus.com/services/hermes-connect/confirm-email/");
  // A URL fragment is never transmitted in the HTTP request or Referer.
  // Keep this credential out of server logs, edge analytics and page-load metadata.
  url.hash = new URLSearchParams({ token }).toString();
  return url.toString();
};
export const magicEmailText = (link) => [
  "Hermes Connect email verification",
  "",
  "You requested a secure email sign-in or account registration for Hermes Connect.",
  "Open the link below within 15 minutes, then select Confirm to complete sign-in.",
  "This link works once and cannot be used to access any company workspace without permission.",
  "",
  link, "",
  "If you did not request this link, ignore this message.",
  "Hermes Connect",
].join("\n");
export function validateEmailRequest(email) {
  return isValidEmail(email) && email.length <= 160 && !email.includes("..");
}
export const verifiedEmailQuery = `SELECT specialist_id FROM hermes_verified_emails
  WHERE specialist_id=? AND lower(email)=? AND method='email_magic' LIMIT 1`;
export const requestToken = () => createSessionToken();
