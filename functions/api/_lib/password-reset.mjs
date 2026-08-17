import { createSessionToken, toHex } from "../../../src/legacy-prototype/auth.mjs";

export const PASSWORD_RESET_TTL_MS = 45 * 60 * 1000;
export const PASSWORD_RESET_SUBJECT = "[HERMES ACCOUNT] [PASSWORD RESET]";
export const PASSWORD_RESET_EMAIL_PATH = "https://lead-email.internal/v1/send-account";
export const PASSWORD_RESET_LOCALES = ["en", "ru", "uk", "es", "it", "fr"];

export function normalizePasswordResetLocale(value) {
  const locale = String(value || "").trim().toLowerCase();
  return PASSWORD_RESET_LOCALES.includes(locale) ? locale : "en";
}

export function createPasswordResetToken() {
  return createSessionToken();
}

export async function hashPasswordResetToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(token || "")));
  return toHex(digest);
}

export function passwordResetExpiry(now = new Date()) {
  return new Date(now.getTime() + PASSWORD_RESET_TTL_MS).toISOString();
}

export function isPasswordResetTokenShape(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export async function ensurePasswordResetSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      specialist_id TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_password_reset_specialist ON password_reset_tokens(specialist_id, created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_password_reset_expiry ON password_reset_tokens(expires_at)").run();
}

export function canonicalPasswordResetUrl(token, locale) {
  const url = new URL("https://hermeslogisticsus.com/services/hermes-connect/repair-shops/reset-password/");
  url.searchParams.set("token", token);
  const normalized = normalizePasswordResetLocale(locale);
  if (normalized !== "en") url.searchParams.set("lang", normalized);
  return url.toString();
}

export function passwordResetEmailText(resetUrl) {
  return [
    "Hermes Connect Repair Shop password reset",
    "",
    "A password reset was requested for your Repair Shop owner account.",
    "Use the secure link below within 45 minutes:",
    resetUrl,
    "",
    "If you did not request this change, you can ignore this email. Your current password will remain unchanged.",
    "Hermes Connect",
  ].join("\n");
}
