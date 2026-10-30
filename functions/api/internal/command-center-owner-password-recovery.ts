import { hashPassword } from "../../../src/legacy-prototype/auth.mjs";
import { bearerToken, verifyGitHubFirst5ActivationOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

const OWNER_EMAIL = "officeus@hermeslogisticsus.com";
const OPERATION_ID = "recover_command_center_owner_password_2026_10_30";
const RECEIPT_ID = "command-center-owner-password-2026-10-30";
const noStore = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAySmge0mCU5IT8gh3Pa+v
7T9KkwRdnooHcuKZqXo+vSvlNkgWs6TzNig9Q1xFiJEUQDpuEV/m4dRAyte8pJrj
rBbUzpy0uks8xm+yh6OdWC9/jlFZMq7mayGbCSZ/BpeOf+REHhj2YxIoV+LaDr2d
xXP+sM00vxF7k8ZLdrDeenm/QQVpjr5E7AS7PQaDPj9XS6VvVEw1ukH7X3dvUWtd
xG+qlt3WmCNJz4pHsPtLHdHIlEWhp3HquxKgHetv506EpH/6JAw3c5b9TcbzYaXD
LCm7OrTXlgNeGT3yyRY2jdDGRFJogaEtBUA8x8lockAZM9MxHHX2AabHw5wR9T0R
sQIDAQAB
-----END PUBLIC KEY-----`;

function randomPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function pemBytes(pem: string) {
  const base64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, "");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64(bytes: ArrayBuffer) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function encryptCredentials(email: string, password: string) {
  const key = await crypto.subtle.importKey(
    "spki",
    pemBytes(PUBLIC_KEY_PEM),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
  const payload = new TextEncoder().encode(JSON.stringify({ email, password }));
  return bytesToBase64(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, payload));
}

async function proveLogin(origin: string, password: string) {
  const login = await fetch(origin + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email: OWNER_EMAIL, password }),
    redirect: "manual",
  });
  if (!login.ok) return null;
  const cookie = (login.headers.get("set-cookie") || "").split(";")[0];
  if (!cookie.startsWith("hermes_session=")) return null;

  const me = await fetch(origin + "/api/auth/me", { headers: { Cookie: cookie } });
  if (!me.ok) return null;
  const status = await fetch(origin + "/api/internal-ai/status", { headers: { Cookie: cookie } });
  if (!status.ok) return null;
  const projects = await fetch(origin + "/api/internal-command-center/projects", { headers: { Cookie: cookie } });
  if (!projects.ok) return null;
  return cookie.slice("hermes_session=".length);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, noStore);

  const token = bearerToken(request);
  if (!token || !await verifyGitHubFirst5ActivationOidcToken(token)) {
    return jsonResponse(403, { success: false, error: "operator_not_authorized" }, noStore);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, noStore);
  }
  if (String(body.operation || "") !== OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" }, noStore);
  }

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS hermes_owner_password_recovery_receipts (
    id TEXT PRIMARY KEY,
    specialist_id TEXT NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    completed_at TEXT NOT NULL
  )`).run();

  const previous = await env.DB.prepare(
    "SELECT specialist_id,encrypted_credentials,completed_at FROM hermes_owner_password_recovery_receipts WHERE id=? LIMIT 1",
  ).bind(RECEIPT_ID).first();
  if (previous?.encrypted_credentials) {
    return jsonResponse(200, {
      success: true,
      state: "already_completed",
      owner_email: OWNER_EMAIL,
      encrypted_credentials: String(previous.encrypted_credentials),
      completed_at: previous.completed_at || null,
      login_proof: "pass",
      internal_ai_status_proof: "pass",
      command_center_projects_proof: "pass",
      login_url: "/services/hermes-connect/access/?lang=ru",
      command_center_url: "/services/hermes-connect/internal/command-center/?lang=ru",
    }, noStore);
  }

  const owners = await env.DB.prepare(`
    SELECT a.specialist_id,s.email,s.password_hash,s.password_salt
    FROM hermes_internal_owner_access a
    JOIN specialists s ON s.id=a.specialist_id
    WHERE a.active=1 AND a.capability='HERMES_INTERNAL_OWNER'
    LIMIT 2
  `).all();
  const rows = Array.isArray(owners?.results) ? owners.results : [];
  if (rows.length !== 1) {
    return jsonResponse(409, { success: false, error: "internal_owner_identity_ambiguous" }, noStore);
  }

  const owner = rows[0];
  if (String(owner.email || "").toLowerCase() !== OWNER_EMAIL) {
    return jsonResponse(409, { success: false, error: "internal_owner_identity_mismatch" }, noStore);
  }
  const specialistId = String(owner.specialist_id || "");
  const oldHash = String(owner.password_hash || "");
  const oldSalt = String(owner.password_salt || "");
  if (!specialistId || !oldHash || !oldSalt) {
    return jsonResponse(409, { success: false, error: "owner_password_state_incomplete" }, noStore);
  }

  const password = randomPassword();
  const { hash, salt } = await hashPassword(password);
  const updated = await env.DB.prepare(
    "UPDATE specialists SET password_hash=?,password_salt=? WHERE id=? AND lower(email)=lower(?)",
  ).bind(hash, salt, specialistId, OWNER_EMAIL).run();
  if (Number(updated?.meta?.changes || 0) !== 1) {
    return jsonResponse(409, { success: false, error: "credential_update_conflict" }, noStore);
  }

  await env.DB.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(specialistId).run();

  let proofSession = "";
  try {
    const sessionToken = await proveLogin(new URL(request.url).origin, password);
    if (!sessionToken) throw new Error("login_proof_failed");
    proofSession = sessionToken;

    const bundle = await encryptCredentials(OWNER_EMAIL, password);
    await env.DB.prepare(
      "INSERT INTO hermes_owner_password_recovery_receipts (id,specialist_id,encrypted_credentials,completed_at) VALUES (?,?,?,?)",
    ).bind(RECEIPT_ID, specialistId, bundle, new Date().toISOString()).run();

    await env.DB.prepare("DELETE FROM sessions WHERE token=? AND specialist_id=?").bind(proofSession, specialistId).run();

    return jsonResponse(200, {
      success: true,
      state: "completed",
      owner_email: OWNER_EMAIL,
      encrypted_credentials: bundle,
      login_proof: "pass",
      internal_ai_status_proof: "pass",
      command_center_projects_proof: "pass",
      login_url: "/services/hermes-connect/access/?lang=ru",
      command_center_url: "/services/hermes-connect/internal/command-center/?lang=ru",
    }, noStore);
  } catch {
    if (proofSession) {
      await env.DB.prepare("DELETE FROM sessions WHERE token=? AND specialist_id=?").bind(proofSession, specialistId).run().catch(() => undefined);
    }
    await env.DB.prepare("UPDATE specialists SET password_hash=?,password_salt=? WHERE id=?")
      .bind(oldHash, oldSalt, specialistId).run();
    return jsonResponse(409, { success: false, error: "owner_password_recovery_proof_failed" }, noStore);
  }
}
