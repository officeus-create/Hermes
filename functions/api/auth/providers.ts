import { jsonResponse } from "../_lib/session.mjs";

type Env = {
  GOOGLE_OAUTH_CLIENT_ID?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_BOT_USERNAME?: string;
};

const googleClientId = (env: Env) => String(env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
const googleClientIdLooksValid = (value: string) => /^\d+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(value);

export async function onRequestGet({ env }: { env: Env }) {
  const clientId = googleClientId(env);
  const googleEnabled = googleClientIdLooksValid(clientId);
  const telegramEnabled = Boolean(String(env.TELEGRAM_BOT_TOKEN || "").trim() && String(env.TELEGRAM_BOT_USERNAME || "").trim());

  return jsonResponse(200, {
    success: true,
    email_password: { enabled: true },
    google: {
      enabled: googleEnabled,
      client_id: googleEnabled ? clientId : null,
    },
    telegram: {
      enabled: telegramEnabled,
      username: telegramEnabled ? String(env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "") : null,
    },
  }, {
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
