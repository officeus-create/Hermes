import {
  createSessionToken,
  hashPassword,
  isValidEmail,
  sessionCookieHeader,
  sessionExpiry,
} from "../../../src/legacy-prototype/auth.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import {
  deliverTelegramRegistrationAlert,
  enqueueRegistrationAlert,
  syncSyntheticFlagForAccount,
} from "../_lib/registration-ops.mjs";

type Env = {
  DB?: any;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  HERMES_CONNECT_TELEGRAM_BOT_TOKEN?: string;
  HERMES_CONNECT_TELEGRAM_OWNER_CHAT_ID?: string;
  HERMES_SYNTHETIC_ACCOUNT_EMAILS?: string;
};

type GoogleTokenInfo = {
  aud?: string;
  iss?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  exp?: string | number;
  name?: string;
  given_name?: string;
};

const privateHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const CONTROL_CHARS = /[<>\u0000-\u001f\u007f]/g;
const clean = (value: unknown, max: number) => String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

function sameOriginMutation(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const secFetchSite = request.headers.get("Sec-Fetch-Site");
  return secFetchSite !== "cross-site" && (!origin || origin === url.origin);
}

async function ensureGoogleIdentitySchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_auth_identities (
      provider TEXT NOT NULL,
      provider_subject TEXT NOT NULL,
      specialist_id TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(provider, provider_subject),
      UNIQUE(provider, specialist_id)
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_auth_identities_email ON hermes_auth_identities(provider, email)").run();
}

async function registrationOperations(env: Env, specialistId: string, email: string, createdAt: string) {
  try {
    await syncSyntheticFlagForAccount({ db: env.DB, env, specialistId, email, createdAt });
    await enqueueRegistrationAlert({ db: env.DB, specialistId, kind: "registration", createdAt });
    await deliverTelegramRegistrationAlert({ db: env.DB, env, specialistId, kind: "registration" });
  } catch {
    console.error("google_registration_ops_failed", { category: "background_processing" });
  }
}

async function verifiedGoogleIdentity(credential: string, clientId: string): Promise<GoogleTokenInfo | null> {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  const info = await response.json() as GoogleTokenInfo;
  const issuer = String(info.iss || "");
  const expiresAt = Number(info.exp || 0);
  const verifiedEmail = info.email_verified === true || String(info.email_verified).toLowerCase() === "true";
  if (String(info.aud || "") !== clientId) return null;
  if (!new Set(["accounts.google.com", "https://accounts.google.com"]).has(issuer)) return null;
  if (!verifiedEmail || !info.sub || expiresAt <= Math.floor(Date.now() / 1000) - 30) return null;
  const email = clean(info.email, 160).toLowerCase();
  return isValidEmail(email) ? { ...info, email } : null;
}

export async function onRequestPost({ request, env, waitUntil }: { request: Request; env: Env; waitUntil?: (promise: Promise<unknown>) => void }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);

  const clientId = String(env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
  if (!/^\d+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(clientId)) {
    return jsonResponse(503, { success: false, error: "google_login_not_configured" }, privateHeaders);
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders); }
  const credential = typeof body.credential === "string" ? body.credential.trim() : "";
  if (credential.length < 100 || credential.length > 8000) {
    return jsonResponse(400, { success: false, error: "google_credential_invalid" }, privateHeaders);
  }

  let identity: GoogleTokenInfo | null = null;
  try { identity = await verifiedGoogleIdentity(credential, clientId); }
  catch { return jsonResponse(502, { success: false, error: "google_identity_verification_unavailable" }, privateHeaders); }
  if (!identity?.email || !identity.sub) {
    return jsonResponse(401, { success: false, error: "google_identity_invalid" }, privateHeaders);
  }

  await ensureGoogleIdentitySchema(env.DB);
  const linked = await env.DB.prepare(`
    SELECT s.id,s.email,s.name,s.role,s.location,s.bio
    FROM hermes_auth_identities i
    JOIN specialists s ON s.id = i.specialist_id
    WHERE i.provider = 'google' AND i.provider_subject = ?
    LIMIT 1
  `).bind(String(identity.sub)).first();

  const email = String(identity.email).toLowerCase();
  let specialist = linked;
  let accountState = linked ? "signed_in" : "linked";
  let createdAt = new Date().toISOString();

  if (!specialist) {
    specialist = await env.DB.prepare(
      "SELECT id,email,name,role,location,bio FROM specialists WHERE lower(email) = ? LIMIT 1",
    ).bind(email).first();
  }

  if (!specialist) {
    const id = `specialist-${crypto.randomUUID()}`;
    const name = clean(identity.name || identity.given_name || email.split("@")[0], 100) || "Hermes User";
    const { hash, salt } = await hashPassword(crypto.randomUUID() + crypto.randomUUID());
    await env.DB.prepare(
      "INSERT INTO specialists (id,email,password_hash,password_salt,name,role,location,bio,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    ).bind(
      id,
      email,
      hash,
      salt,
      name,
      "Business Owner",
      "Not provided",
      "Created with verified Google sign-in. Complete the Hermes company profile to unlock company workspaces.",
      createdAt,
    ).run();
    specialist = { id, email, name, role: "Business Owner", location: "Not provided", bio: "Google identity" };
    accountState = "created";
    const opsPromise = registrationOperations(env, id, email, createdAt);
    if (typeof waitUntil === "function") waitUntil(opsPromise);
    else await opsPromise;
  }

  await env.DB.prepare(`
    INSERT INTO hermes_auth_identities (provider,provider_subject,specialist_id,email,created_at,updated_at)
    VALUES ('google',?,?,?,?,?)
    ON CONFLICT(provider,provider_subject) DO UPDATE SET
      specialist_id=excluded.specialist_id,email=excluded.email,updated_at=excluded.updated_at
  `).bind(String(identity.sub), specialist.id, email, createdAt, createdAt).run();

  const token = createSessionToken();
  const expiresAt = sessionExpiry();
  await env.DB.prepare("INSERT INTO sessions (token,specialist_id,created_at,expires_at) VALUES (?,?,?,?)")
    .bind(token, specialist.id, createdAt, expiresAt)
    .run();

  return jsonResponse(200, {
    success: true,
    provider: "google",
    state: accountState,
    specialist: {
      id: specialist.id,
      email: specialist.email || email,
      name: specialist.name,
      role: specialist.role,
      location: specialist.location,
    },
  }, {
    ...privateHeaders,
    "Set-Cookie": sessionCookieHeader(token),
  });
}
