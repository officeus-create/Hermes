import { hashPassword } from "../../../src/legacy-prototype/auth.mjs";
import { bearerToken, verifyGitHubLoadBoardStaffProvisionOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureInternalAiSchema } from "../_lib/internal-ai.mjs";
import { ensureLoadBoardReviewerSchema } from "../_lib/load-board-role-review.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = { DB?: any; LEAD_EMAIL_SERVICE?: ServiceFetcher; LEAD_SERVICE_TOKEN?: string };

const OPERATION_ID = "provision_load_board_internal_staff_2026_10_24";
const INTERNAL_RECIPIENT = "officeus@hermeslogisticsus.com";
const ACCOUNT_EMAIL_PATH = "https://lead-email.internal/v1/send-account";
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const RECEIPT_ID = OPERATION_ID;

async function ensureReceiptSchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_load_board_staff_provisioning_receipts (
      operation_id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('pending','completed')),
      created_at TEXT NOT NULL,
      completed_at TEXT
    )
  `).run();
}

const STAFF = Object.freeze([
  {
    email: "volkogon.v@gmail.com",
    name: "Volkogon",
    role: "Dispatcher",
    location: "Kyiv, UA",
    entitlement: "internal_owner",
  },
  {
    email: "dispatchtruck107@gmail.com",
    name: "Dispatch Truck 107",
    role: "Dispatcher",
    location: "Milwaukee, WI",
    entitlement: "load_board_reviewer",
  },
]);

function temporaryPassword(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  let suffix = "";
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return prefix + "-" + suffix + "-A9!";
}

async function sendCredentials(env: Env, rows: Array<{email:string; password:string; entitlement:string}>) {
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) return false;
  const text = [
    "Hermes Load Board internal staff access",
    "",
    ...rows.flatMap((row) => [
      "Login: " + row.email,
      "Temporary password: " + row.password,
      "Access: " + row.entitlement,
      "",
    ]),
    "Sign in: https://hermeslogisticsus.com/services/hermes-connect/load-board/access/?mode=login",
    "Full role review: https://hermeslogisticsus.com/services/hermes-connect/load-board/role-preview/",
    "",
    "These credentials were generated only for the owner-approved internal Load Board evaluation.",
    "Passwords are not returned by the API and must not be copied to GitHub or Drive.",
  ].join("\n");
  try {
    const response = await env.LEAD_EMAIL_SERVICE.fetch(ACCOUNT_EMAIL_PATH, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.LEAD_SERVICE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: "load_board_staff_" + crypto.randomUUID(),
        subject: "[HERMES ACCOUNT] [LOAD BOARD INTERNAL STAFF]",
        text,
        recipient_email: INTERNAL_RECIPIENT,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function cleanupCreated(db: any, specialistIds: string[]) {
  for (const id of specialistIds) {
    await db.prepare("DELETE FROM hermes_load_board_reviewers WHERE specialist_id=?").bind(id).run();
    await db.prepare("DELETE FROM hermes_internal_owner_access WHERE specialist_id=?").bind(id).run();
    await db.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(id).run();
    await db.prepare("DELETE FROM specialists WHERE id=?").bind(id).run();
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, PRIVATE_HEADERS);
  const token = bearerToken(request);
  if (!token || !await verifyGitHubLoadBoardStaffProvisionOidcToken(token)) {
    return jsonResponse(403, { success: false, error: "operator_not_authorized" }, PRIVATE_HEADERS);
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, PRIVATE_HEADERS); }
  if (String(body.operation || "") !== OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" }, PRIVATE_HEADERS);
  }

  await ensureInternalAiSchema(env.DB);
  await ensureLoadBoardReviewerSchema(env.DB);
  await ensureReceiptSchema(env.DB);

  const receipt = await env.DB.prepare(
    "SELECT status,completed_at FROM hermes_load_board_staff_provisioning_receipts WHERE operation_id=? LIMIT 1"
  ).bind(RECEIPT_ID).first();
  if (receipt?.status === "completed") {
    const owner = await env.DB.prepare(
      "SELECT s.id,a.active,a.capability FROM specialists s JOIN hermes_internal_owner_access a ON a.specialist_id=s.id WHERE lower(s.email)=lower(?) LIMIT 1"
    ).bind(STAFF[0].email).first();
    const reviewer = await env.DB.prepare(
      "SELECT s.id,r.status,r.mailbox_ownership_verified FROM specialists s JOIN hermes_load_board_reviewers r ON r.specialist_id=s.id WHERE lower(s.email)=lower(?) LIMIT 1"
    ).bind(STAFF[1].email).first();
    if (!owner || Number(owner.active || 0) !== 1 || String(owner.capability || "") !== "HERMES_INTERNAL_OWNER"
      || !reviewer || String(reviewer.status || "") !== "active" || Number(reviewer.mailbox_ownership_verified || 0) !== 1) {
      return jsonResponse(409, {
        success: false,
        error: "completed_receipt_access_readback_mismatch",
        credentials_rotated: false,
      }, PRIVATE_HEADERS);
    }
    return jsonResponse(200, {
      success: true,
      provisioning_state: "already_completed",
      accounts_created: 2,
      owner_email: STAFF[0].email,
      reviewer_email: STAFF[1].email,
      owner_capability: "HERMES_INTERNAL_OWNER",
      reviewer_permission: "LOAD_BOARD_ROLE_PREVIEW_REVIEWER",
      credentials_delivered: "previously_delivered",
      password_returned: false,
      login_path: "/services/hermes-connect/load-board/access/?mode=login",
      role_review_path: "/services/hermes-connect/load-board/role-preview/",
    }, PRIVATE_HEADERS);
  }
  if (receipt) {
    return jsonResponse(409, {
      success: false,
      error: "provisioning_incomplete_manual_review",
      credentials_rotated: false,
    }, PRIVATE_HEADERS);
  }

  const existingRows = [];
  for (const staff of STAFF) {
    const existing = await env.DB.prepare(
      "SELECT id,email,name,role FROM specialists WHERE lower(email)=lower(?) LIMIT 1"
    ).bind(staff.email).first();
    if (existing) existingRows.push({ email: staff.email, role: String(existing.role || "") });
  }
  if (existingRows.length) {
    return jsonResponse(409, {
      success: false,
      error: "staff_identity_already_exists_manual_review",
      existing: existingRows,
      credentials_rotated: false,
    }, PRIVATE_HEADERS);
  }

  const createdIds: string[] = [];
  const credentialRows: Array<{email:string; password:string; entitlement:string}> = [];
  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      "INSERT INTO hermes_load_board_staff_provisioning_receipts (operation_id,status,created_at,completed_at) VALUES (?,'pending',?,NULL)"
    ).bind(RECEIPT_ID, now).run();
    for (const staff of STAFF) {
      const password = temporaryPassword(staff.entitlement === "internal_owner" ? "Owner" : "Dispatch");
      const { hash, salt } = await hashPassword(password);
      const specialistId = "specialist-" + crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO specialists (id,email,password_hash,password_salt,name,role,location,bio,created_at) VALUES (?,?,?,?,?,?,?,?,?)"
      ).bind(
        specialistId, staff.email, hash, salt, staff.name, staff.role, staff.location,
        "Hermes Logistics internal Load Board staff identity provisioned by owner-authorized GitHub OIDC workflow.",
        now,
      ).run();
      createdIds.push(specialistId);

      if (staff.entitlement === "internal_owner") {
        await env.DB.prepare(
          "INSERT INTO hermes_internal_owner_access (specialist_id,active,capability,created_at,updated_at) VALUES (?,1,'HERMES_INTERNAL_OWNER',?,?)"
        ).bind(specialistId, now, now).run();
      } else {
        const owner = createdIds[0];
        await env.DB.prepare(
          "INSERT INTO hermes_load_board_reviewers (specialist_id,status,mailbox_ownership_verified,granted_by_specialist_id,reviewed_at) VALUES (?,'active',1,?,?)"
        ).bind(specialistId, owner, now).run();
      }
      credentialRows.push({ email: staff.email, password, entitlement: staff.entitlement });
    }

    const ownerCheck = await env.DB.prepare(
      "SELECT s.email,a.active,a.capability FROM specialists s JOIN hermes_internal_owner_access a ON a.specialist_id=s.id WHERE lower(s.email)=lower(?) LIMIT 1"
    ).bind(STAFF[0].email).first();
    const reviewerCheck = await env.DB.prepare(
      "SELECT s.email,r.status,r.mailbox_ownership_verified FROM specialists s JOIN hermes_load_board_reviewers r ON r.specialist_id=s.id WHERE lower(s.email)=lower(?) LIMIT 1"
    ).bind(STAFF[1].email).first();

    if (!ownerCheck || Number(ownerCheck.active || 0) !== 1 || String(ownerCheck.capability || "") !== "HERMES_INTERNAL_OWNER") {
      throw new Error("owner_access_readback_failed");
    }
    if (!reviewerCheck || String(reviewerCheck.status || "") !== "active" || Number(reviewerCheck.mailbox_ownership_verified || 0) !== 1) {
      throw new Error("reviewer_access_readback_failed");
    }

    if (!await sendCredentials(env, credentialRows)) {
      throw new Error("credential_delivery_failed");
    }

    await env.DB.prepare(
      "UPDATE hermes_load_board_staff_provisioning_receipts SET status='completed',completed_at=? WHERE operation_id=? AND status='pending'"
    ).bind(new Date().toISOString(), RECEIPT_ID).run();

    return jsonResponse(200, {
      provisioning_state: "completed",
      success: true,
      accounts_created: 2,
      owner_email: STAFF[0].email,
      reviewer_email: STAFF[1].email,
      owner_capability: "HERMES_INTERNAL_OWNER",
      reviewer_permission: "LOAD_BOARD_ROLE_PREVIEW_REVIEWER",
      credentials_delivered: "office_internal_admin_mailbox",
      password_returned: false,
      login_path: "/services/hermes-connect/load-board/access/?mode=login",
      role_review_path: "/services/hermes-connect/load-board/role-preview/",
    }, PRIVATE_HEADERS);
  } catch (error) {
    await cleanupCreated(env.DB, createdIds);
    await env.DB.prepare(
      "DELETE FROM hermes_load_board_staff_provisioning_receipts WHERE operation_id=? AND status='pending'"
    ).bind(RECEIPT_ID).run();
    console.error("load_board_staff_provision_failed", {
      category: "bounded_internal_staff_provisioning",
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return jsonResponse(500, { success: false, error: "staff_provision_failed_rolled_back" }, PRIVATE_HEADERS);
  }
}
