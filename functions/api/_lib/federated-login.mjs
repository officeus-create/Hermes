import { createSessionToken, hashPassword, isValidEmail, sessionCookieHeader, sessionExpiry, toHex } from "../../../src/legacy-prototype/auth.mjs";
import { getAuthenticatedSpecialist } from "./session.mjs";

const STATE_TTL_MS = 10 * 60_000;
export const privateAuthHeaders = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };
const text = (s, max) => String(s ?? "").replace(/[<>\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
const sha256Hex = async (s) => toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
export const codeChallenge = async (verifier) => b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));

export function secureStateCookie(provider, state, { clear = false, crossSitePost = false } = {}) {
  const parts = [
    `__Host-hermes_${provider}_oauth=${clear ? "" : state}`,
    "Path=/", "Secure", "HttpOnly",
    crossSitePost ? "SameSite=None" : "SameSite=Lax",
    clear ? "Max-Age=0" : "Max-Age=600",
  ];
  return parts.join("; ");
}
export function stateCookieValue(request, provider) {
  const cookie = request.headers.get("Cookie") || "";
  const entry = cookie.split(";").map(x => x.trim()).find(x => x.startsWith(`__Host-hermes_${provider}_oauth=`));
  return entry ? entry.split("=").slice(1).join("=") : "";
}
function constantEqual(a, b) {
  if (a.length !== b.length || a.length !== 64) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
export async function ensureOAuthStateSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_oauth_states (
    state_hash TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    code_verifier TEXT NOT NULL,
    nonce TEXT,
    link_specialist_id TEXT,
    link_session_created_at TEXT,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT
  )`).run();
}
export async function beginOAuthState(db, provider, nonce = "", verifiedStartSession = null) {
  await ensureOAuthStateSchema(db);
  const state = createSessionToken();
  const verifier = createSessionToken() + createSessionToken();
  const now = new Date();
  await db.prepare(`INSERT INTO hermes_oauth_states
    (state_hash, provider, code_verifier, nonce, link_specialist_id, link_session_created_at, created_at, expires_at, used_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`).bind(
    await sha256Hex(state), provider, verifier, nonce,
    verifiedStartSession?.specialistId || null, verifiedStartSession?.sessionCreatedAt || null,
    now.toISOString(),
    new Date(now.getTime() + STATE_TTL_MS).toISOString(),
  ).run();
  return { state, verifier };
}
export async function consumeOAuthState(db, request, provider, returnedState) {
  const cookieState = stateCookieValue(request, provider);
  if (!constantEqual(cookieState, String(returnedState || ""))) return null;
  await ensureOAuthStateSchema(db);
  const stateHash = await sha256Hex(cookieState);
  const record = await db.prepare(`SELECT code_verifier, nonce, link_specialist_id, link_session_created_at FROM hermes_oauth_states
     WHERE state_hash=? AND provider=? AND used_at IS NULL AND expires_at > ? LIMIT 1`)
    .bind(stateHash, provider, new Date().toISOString()).first();
  if (!record) return null;
  const consumed = await db.prepare(`UPDATE hermes_oauth_states SET used_at=?
    WHERE state_hash=? AND provider=? AND used_at IS NULL AND expires_at > ?`)
    .bind(new Date().toISOString(), stateHash, provider, new Date().toISOString()).run();
  if (Number(consumed?.meta?.changes || 0) !== 1) return null;
  return record;
}

async function ensureIdentitySchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_auth_identities (
    provider TEXT NOT NULL, provider_subject TEXT NOT NULL, specialist_id TEXT NOT NULL,
    email TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
    PRIMARY KEY(provider, provider_subject), UNIQUE(provider, specialist_id)
  )`).run();
}

export async function completeFederatedLogin({ db, request, provider, subject, email, name, verifiedAppleLinkOwnerId = null }) {
  const subjectId = text(subject, 180);
  const verifiedEmail = text(email, 160).toLowerCase();
  if (!["github", "apple"].includes(provider) || !subjectId || !isValidEmail(verifiedEmail)) {
    return { success: false, error: "provider_identity_invalid", status: 401 };
  }
  await ensureIdentitySchema(db);
  let specialist = await db.prepare(`SELECT s.id,s.email,s.name,s.role,s.location,s.bio
    FROM hermes_auth_identities i JOIN specialists s ON s.id = i.specialist_id
    WHERE i.provider=? AND i.provider_subject=? LIMIT 1`).bind(provider, subjectId).first();
  let state = specialist ? "signed_in" : "linked";
  let newId = null;
  if (!specialist) {
    const existing = await db.prepare(`SELECT id,email,name,role,location,bio
      FROM specialists WHERE lower(email)=? LIMIT 1`).bind(verifiedEmail).first();
    if (existing) {
      // Apple's form_post is a cross-site navigation: SameSite=Lax Hermes
      // session cookies are not necessarily sent to callback. A provider link
      // may instead use ONLY the validated, one-time, session-bound owner proof
      // established on our same-origin /apple/start endpoint and rechecked
      // against an active sessions row on callback.
      const owner = provider === "apple" && verifiedAppleLinkOwnerId
        ? { id: verifiedAppleLinkOwnerId }
        : await getAuthenticatedSpecialist(request, db);
      if (!owner || owner.id !== existing.id) {
        return { success: false, error: "existing_account_signin_required", status: 409 };
      }
      specialist = existing;
    } else {
      newId = `specialist-${crypto.randomUUID()}`;
      const displayName = text(name, 100) || verifiedEmail.split("@")[0];
      const { hash, salt } = await hashPassword(createSessionToken());
      try {
        await db.prepare(`INSERT INTO specialists
          (id,email,password_hash,password_salt,name,role,location,bio,created_at)
          VALUES (?,?,?,?,?,?,?,?,?)`).bind(
          newId, verifiedEmail, hash, salt, displayName, "Business Owner", "Not provided",
          "Created using verified federated identity. Company access requires independent owner authorization.",
          new Date().toISOString(),
        ).run();
      } catch {
        return { success: false, error: "account_create_conflict", status: 409 };
      }
      specialist = { id: newId, email: verifiedEmail, name: displayName, role: "Business Owner", location: "Not provided" };
      state = "created";
    }
  }
  const now = new Date().toISOString();
  try {
    await db.prepare(`INSERT INTO hermes_auth_identities
      (provider,provider_subject,specialist_id,email,created_at,updated_at)
      VALUES (?,?,?,?,?,?) ON CONFLICT(provider,provider_subject) DO NOTHING`)
      .bind(provider, subjectId, specialist.id, verifiedEmail, now, now).run();
    const persisted = await db.prepare(`SELECT specialist_id FROM hermes_auth_identities
      WHERE provider=? AND provider_subject=? LIMIT 1`).bind(provider, subjectId).first();
    if (!persisted || persisted.specialist_id !== specialist.id) throw new Error("identity_conflict");
  } catch {
    if (newId) {
      try { await db.prepare("DELETE FROM specialists WHERE id=?").bind(newId).run(); } catch {}
    }
    return { success: false, error: "provider_identity_conflict", status: 409 };
  }
  const sessionToken = createSessionToken();
  await db.prepare("INSERT INTO sessions (token,specialist_id,created_at,expires_at) VALUES (?,?,?,?)")
    .bind(sessionToken, specialist.id, now, sessionExpiry()).run();
  return { success: true, state, cookie: sessionCookieHeader(sessionToken) };
}
export function accountRedirect(origin, reason = "") {
  const u = new URL("/services/hermes-connect/access/", origin);
  if (reason) u.searchParams.set("auth_error", reason);
  return u.toString();
}
