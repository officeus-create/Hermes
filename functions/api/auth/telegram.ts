import { verifyTelegramAuth, createSessionToken, sessionExpiry, sessionCookieHeader } from "../../../src/legacy-prototype/auth.mjs";
import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any; TELEGRAM_BOT_TOKEN?: string };

type TelegramAuthPayload = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date?: number | string;
  hash?: string;
};

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (!env.TELEGRAM_BOT_TOKEN) return jsonResponse(500, { success: false, error: "telegram_login_not_configured" });

  let payload: TelegramAuthPayload;
  try {
    payload = (await request.json()) as TelegramAuthPayload;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const telegramId = String(payload.id ?? "").trim();
  if (!telegramId) return jsonResponse(400, { success: false, error: "missing_telegram_id" });

  const ok = await verifyTelegramAuth(payload, env.TELEGRAM_BOT_TOKEN);
  if (!ok) return jsonResponse(401, { success: false, error: "invalid_telegram_signature" });

  let specialist = await env.DB
    .prepare("SELECT id FROM specialists WHERE telegram_id = ?")
    .bind(telegramId)
    .first() as { id: string } | null;

  if (!specialist) {
    const name = [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim()
      || (payload.username ? `@${payload.username}` : "Specialist");
    const id = `specialist-${crypto.randomUUID()}`;
    const email = `telegram-${telegramId}@users.hermesconnect.app`;
    const { hash, salt } = await hashRandomPassword();
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO specialists (id, email, password_hash, password_salt, name, role, location, bio, created_at, telegram_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(id, email, hash, salt, name, "Specialist", "", "Signed up with Telegram — edit your profile to add details.", createdAt, telegramId)
      .run();

    specialist = { id };
  }

  const token = createSessionToken();
  const createdAt = new Date().toISOString();
  const expiresAt = sessionExpiry();
  await env.DB.prepare("INSERT INTO sessions (token, specialist_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(token, specialist.id, createdAt, expiresAt)
    .run();

  return jsonResponse(200, { success: true }, { "Set-Cookie": sessionCookieHeader(token) });
}

// Telegram-linked accounts never use password login, but the column is NOT NULL —
// store a random, unusable hash so the row satisfies the schema without a real password.
async function hashRandomPassword() {
  const { hashPassword } = await import("../../../src/legacy-prototype/auth.mjs");
  const random = crypto.randomUUID() + crypto.randomUUID();
  return hashPassword(random);
}
