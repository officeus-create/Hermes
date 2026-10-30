import { hashPassword } from "../../../src/legacy-prototype/auth.mjs";
import { verifyGithubActionsOidcToken } from "../_lib/github-actions-oidc.mjs";
import { ensureInternalAiSchema, nowIso } from "../_lib/internal-ai.mjs";
import { jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

const OWNER_EMAIL = "officeus@hermeslogisticsus.com";
const OPERATION_ID = "activate_command_center_owner_2026_10_30";
const OIDC_AUDIENCE = "hermes-command-center-owner-activation";
const ALLOWED_WORKFLOW_REFS = [
  "officeus-create/Hermes/.github/workflows/command-center-owner-activation.yml@refs/heads/main",
];
const RECEIPT_ID = "command-center-owner-activation-2026-10-30";
const noStore = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtoC7TnAhDD5kfd+Xbfas
3mGhY0TMlO3vTL18lH2OpEeoJmmVYUTcfhjHRja+NfeURBS3g/FxyAGmlTXf6ngU
6Mlv5u1h8EWUM4bE5o4WH9044fjWa5vHJJk+Sgjgs//NyH6wrCt4PtfuFlpm1WX/
wudXs9DBWclDwBJSu4RhNo8Cr8QD6JZy4hpp0x0duiez8NnYiezQ1aKB+n6wW0PC
GWNIJv79ub59aoytZikL6ucsY4QgwPhX17vajDFdKqnUR2fvyEXNv72T069xJlGk
+HnAGP0hBWsgGeiHbTL1XDUOLQJzj+HiVCii1LLPDsAmJxmYl4OFqU+/uVLSry3E
yQIDAQAB
-----END PUBLIC KEY-----`;

function bearerToken(request: Request) {
  const header = request.headers.get("Authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : "";
}

function randomPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = crypto.getRandomValues(new Uint8Array(28));
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

async function encryptCredentialBundle(email: string, password: string) {
  const key = await crypto.subtle.importKey(
    "spki",
    pemBytes(PUBLIC_KEY_PEM),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
  const plaintext = new TextEncoder().encode(JSON.stringify({ email, password }));
  return bytesToBase64(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, plaintext));
}

async function cleanupFailedAttempt(db: any, specialistId: string, createdSpecialist: boolean, previousPassword: any) {
  try {
    await db.prepare("DELETE FROM hermes_internal_owner_access WHERE specialist_id=? AND capability='HERMES_INTERNAL_OWNER'")
      .bind(specialistId).run();
    await db.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(specialistId).run();
    if (createdSpecialist) {
      await db.prepare("DELETE FROM specialists WHERE id=? AND lower(email)=lower(?)").bind(specialistId, OWNER_EMAIL).run();
    } else if (previousPassword?.password_hash && previousPassword?.password_salt) {
      await db.prepare("UPDATE specialists SET password_hash=?,password_salt=? WHERE id=?")
        .bind(previousPassword.password_hash, previousPassword.password_salt, specialistId).run();
    }
    await db.prepare("DELETE FROM hermes_internal_owner_bootstrap_receipts WHERE id=? AND state='processing'")
      .bind(RECEIPT_ID).run();
  } catch {
    console.error("command_center_owner_activation_cleanup_failed");
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, noStore);

  const token = bearerToken(request);
  const authorized = token && await verifyGithubActionsOidcToken({
    token,
    expectedAudience: OIDC_AUDIENCE,
    allowedWorkflowRefs: ALLOWED_WORKFLOW_REFS,
  });
  if (!authorized) return jsonResponse(403, { success: false, error: "operator_not_authorized" }, noStore);

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, noStore);
  }
  if (String(body.operation || "") !== OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" }, noStore);
  }

  await ensureInternalAiSchema(env.DB);
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS hermes_internal_owner_bootstrap_receipts (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('processing','completed')),
    specialist_id TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT
  )`).run();

  const existingOwner = await env.DB.prepare(
    "SELECT specialist_id FROM hermes_internal_owner_access WHERE active=1 AND capability='HERMES_INTERNAL_OWNER' LIMIT 1",
  ).first();
  if (existingOwner) {
    return jsonResponse(409, { success: false, error: "internal_owner_already_provisioned" }, noStore);
  }

  const now = nowIso();
  const claim = await env.DB.prepare(`
    INSERT INTO hermes_internal_owner_bootstrap_receipts (id,source,state,specialist_id,created_at,completed_at)
    SELECT ?,'github_oidc','processing',NULL,?,NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM hermes_internal_owner_access
      WHERE active=1 AND capability='HERMES_INTERNAL_OWNER'
    )
    ON CONFLICT(id) DO NOTHING
  `).bind(RECEIPT_ID, now).run();

  if (Number(claim?.meta?.changes || 0) !== 1) {
    return jsonResponse(409, { success: false, error: "owner_activation_already_claimed" }, noStore);
  }

  let specialist = await env.DB.prepare(
    "SELECT id,email,password_hash,password_salt FROM specialists WHERE lower(email)=lower(?) LIMIT 1",
  ).bind(OWNER_EMAIL).first();
  const createdSpecialist = !specialist;
  const specialistId = specialist ? String(specialist.id) : `specialist-${crypto.randomUUID()}`;
  const previousPassword = specialist ? {
    password_hash: specialist.password_hash,
    password_salt: specialist.password_salt,
  } : null;

  try {
    const password = randomPassword();
    const { hash, salt } = await hashPassword(password);

    if (createdSpecialist) {
      await env.DB.prepare(`
        INSERT INTO specialists
          (id,email,password_hash,password_salt,name,role,location,bio,created_at)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).bind(
        specialistId,
        OWNER_EMAIL,
        hash,
        salt,
        "Hermes Command Center Owner",
        "Business Owner",
        "United States",
        "Canonical owner identity for the Hermes Business Command Center.",
        now,
      ).run();
    } else {
      await env.DB.prepare("UPDATE specialists SET password_hash=?,password_salt=? WHERE id=?")
        .bind(hash, salt, specialistId).run();
    }

    await env.DB.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(specialistId).run();

    const granted = await env.DB.prepare(`
      INSERT INTO hermes_internal_owner_access
        (specialist_id,active,capability,created_at,updated_at)
      SELECT ?,1,'HERMES_INTERNAL_OWNER',?,?
      WHERE NOT EXISTS (
        SELECT 1 FROM hermes_internal_owner_access
        WHERE active=1 AND capability='HERMES_INTERNAL_OWNER'
      )
      ON CONFLICT(specialist_id) DO UPDATE SET
        active=1,
        capability='HERMES_INTERNAL_OWNER',
        updated_at=excluded.updated_at
    `).bind(specialistId, now, now).run();

    if (Number(granted?.meta?.changes || 0) !== 1) throw new Error("owner_claim_lost");

    await env.DB.prepare(
      "UPDATE hermes_internal_owner_bootstrap_receipts SET specialist_id=? WHERE id=? AND state='processing'",
    ).bind(specialistId, RECEIPT_ID).run();

    const base = new URL(request.url).origin;
    const loginResponse = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base },
      body: JSON.stringify({ email: OWNER_EMAIL, password }),
    });
    if (!loginResponse.ok) throw new Error("login_proof_failed");

    const setCookie = loginResponse.headers.get("set-cookie") || "";
    const cookie = setCookie.split(";")[0];
    if (!cookie.startsWith("hermes_session=")) throw new Error("session_cookie_missing");

    const meResponse = await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } });
    if (!meResponse.ok) throw new Error("auth_me_proof_failed");

    const statusResponse = await fetch(`${base}/api/internal-ai/status`, { headers: { Cookie: cookie } });
    if (!statusResponse.ok) throw new Error("owner_status_proof_failed");

    const projectsResponse = await fetch(`${base}/api/internal-command-center/projects`, { headers: { Cookie: cookie } });
    if (!projectsResponse.ok) throw new Error("command_center_projects_proof_failed");

    const bundle = await encryptCredentialBundle(OWNER_EMAIL, password);
    await env.DB.prepare(
      "UPDATE hermes_internal_owner_bootstrap_receipts SET state='completed',completed_at=? WHERE id=? AND state='processing'",
    ).bind(nowIso(), RECEIPT_ID).run();

    return jsonResponse(200, {
      success: true,
      state: "activated",
      capability: "HERMES_INTERNAL_OWNER",
      owner_email: OWNER_EMAIL,
      authentication_method: "email_password",
      login_proof: "pass",
      auth_me_proof: "pass",
      internal_ai_status_proof: "pass",
      command_center_projects_proof: "pass",
      encrypted_credentials: bundle,
      login_url: "/services/hermes-connect/access/?lang=ru",
      command_center_url: "/services/hermes-connect/internal/command-center/?lang=ru",
    }, noStore);
  } catch (error) {
    await cleanupFailedAttempt(env.DB, specialistId, createdSpecialist, previousPassword);
    console.error("command_center_owner_activation_failed", {
      class: error instanceof Error ? error.message : "unknown_error",
    });
    return jsonResponse(409, { success: false, error: "owner_activation_proof_failed" }, noStore);
  }
}
