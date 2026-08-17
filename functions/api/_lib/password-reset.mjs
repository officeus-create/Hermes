import { createSessionToken, toHex } from "../../../src/legacy-prototype/auth.mjs";

export const PASSWORD_RESET_TTL_MS = 45 * 60 * 1000;
export const PASSWORD_RESET_SUBJECT = "[HERMES ACCOUNT] [PASSWORD RESET]";
export const PASSWORD_RESET_EMAIL_PATH = "https://lead-email.internal/v1/send-account";
export const PASSWORD_RESET_LOCALES = ["en", "ru", "uk", "es", "it", "fr"];

const PASSWORD_RESET_EMAIL_COPY = {
  en: {
    title: "Hermes Connect Repair Shop password reset",
    requested: "A password reset was requested for your Repair Shop owner account.",
    action: "Use the secure link below within 45 minutes:",
    ignore: "If you did not request this change, you can ignore this email. Your current password will remain unchanged.",
  },
  ru: {
    title: "Сброс пароля Hermes Connect для СТО",
    requested: "Для аккаунта владельца СТО был запрошен сброс пароля.",
    action: "Используйте защищённую ссылку ниже в течение 45 минут:",
    ignore: "Если вы не запрашивали изменение пароля, просто проигнорируйте это письмо. Текущий пароль останется без изменений.",
  },
  uk: {
    title: "Скидання пароля Hermes Connect для СТО",
    requested: "Для акаунта власника СТО було запитано скидання пароля.",
    action: "Скористайтеся захищеним посиланням нижче протягом 45 хвилин:",
    ignore: "Якщо ви не запитували зміну пароля, просто проігноруйте цей лист. Поточний пароль залишиться без змін.",
  },
  es: {
    title: "Restablecimiento de contraseña de Hermes Connect para talleres",
    requested: "Se solicitó restablecer la contraseña de tu cuenta de propietario del taller.",
    action: "Usa el enlace seguro siguiente dentro de los próximos 45 minutos:",
    ignore: "Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá funcionando.",
  },
  it: {
    title: "Reimpostazione password Hermes Connect per officine",
    requested: "È stata richiesta la reimpostazione della password per il tuo account proprietario officina.",
    action: "Usa il link sicuro qui sotto entro 45 minuti:",
    ignore: "Se non hai richiesto questa modifica, puoi ignorare questa email. La password attuale resterà invariata.",
  },
  fr: {
    title: "Réinitialisation du mot de passe Hermes Connect pour atelier",
    requested: "Une réinitialisation du mot de passe a été demandée pour votre compte propriétaire d’atelier.",
    action: "Utilisez le lien sécurisé ci-dessous dans les 45 minutes :",
    ignore: "Si vous n’avez pas demandé cette modification, ignorez cet e-mail. Votre mot de passe actuel restera inchangé.",
  },
};

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

export function passwordResetEmailText(resetUrl, locale = "en") {
  const copy = PASSWORD_RESET_EMAIL_COPY[normalizePasswordResetLocale(locale)] || PASSWORD_RESET_EMAIL_COPY.en;
  return [
    copy.title,
    "",
    copy.requested,
    copy.action,
    resetUrl,
    "",
    copy.ignore,
    "Hermes Connect",
  ].join("\n");
}
