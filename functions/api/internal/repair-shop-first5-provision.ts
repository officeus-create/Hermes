import { hashPassword, verifyPassword } from "../../../src/legacy-prototype/auth.mjs";
import { bearerToken, verifyGitHubFirst5ActivationOidcToken } from "../_lib/github-oidc.mjs";
import { jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import { ensureRegistrationOpsSchema } from "../_lib/registration-ops.mjs";
import { ensureRepairShopAvailabilitySchema } from "../_lib/repair-shop-availability-schema.mjs";
import { ensureRepairShopCapabilitiesSchema } from "../_lib/repair-shop-capabilities-schema.mjs";
import { resolveDefaultRepairShopServiceContext } from "../_lib/repair-shop-service-context.mjs";
import {
  createServiceForContext,
  findDuplicateServiceForContext,
  listServicesForContext,
} from "../_lib/service-context.mjs";

type ServiceFetcher = { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
type Env = { DB?: any; LEAD_EMAIL_SERVICE?: ServiceFetcher; LEAD_SERVICE_TOKEN?: string };

const OPERATION_ID = "provision_kittles_garage_trial_2026_09_23";
const ACCOUNT_EMAIL_PATH = "https://lead-email.internal/v1/send-account";
const ACCOUNT_EMAIL_SUBJECT = "[HERMES ACCOUNT] [PASSWORD RESET]";
const INTERNAL_RECIPIENT = "officeus@hermeslogisticsus.com";
const SHOP_NAME = "Kittle's Garage";

const HOURS = [
  [0, 0, null, null],
  [1, 1, "07:30", "17:30"],
  [2, 1, "07:30", "17:30"],
  [3, 1, "07:30", "17:30"],
  [4, 1, "07:30", "17:30"],
  [5, 1, "07:30", "14:00"],
  [6, 0, null, null],
];

const SERVICES = [
  ["Computer & Engine Diagnostics", 60],
  ["Engine Performance & Tune-Up", 60],
  ["Fuel Injection Diagnostic & Repair", 60],
  ["Electrical Diagnostics & Repair", 60],
  ["Brake System Repair", 60],
  ["Steering & Suspension", 60],
  ["Wheel Alignment", 60],
  ["Heating & A/C", 60],
  ["Cooling System Diagnostic & Repair", 60],
  ["Drivetrain Service & Repair", 60],
  ["Oil Change & Preventive Maintenance", 45],
  ["Tire Service & New Tire Replacement", 60],
  ["Timing Belt Service", 60],
  ["Used Car Evaluation", 60],
  ["Emissions System Diagnostic & Repair", 60],
] as const;

function tempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let suffix = "";
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return "Friday-" + suffix;
}

async function ensureReceiptSchema(db: any) {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS hermes_first5_provisioning_receipts (" +
    "operation_id TEXT PRIMARY KEY," +
    "specialist_id TEXT NOT NULL," +
    "status TEXT NOT NULL CHECK (status IN ('pending','completed'))," +
    "created_at TEXT NOT NULL," +
    "completed_at TEXT)"
  ).run();
}

async function getReceipt(db: any) {
  await ensureReceiptSchema(db);
  return db.prepare(
    "SELECT specialist_id,status,completed_at FROM hermes_first5_provisioning_receipts " +
    "WHERE operation_id=? LIMIT 1"
  ).bind(OPERATION_ID).first();
}

async function lockProvision(db: any, ownerId: string, now: string) {
  try {
    await db.prepare(
      "INSERT INTO hermes_first5_provisioning_receipts " +
      "(operation_id,specialist_id,status,created_at,completed_at) VALUES (?,?,'pending',?,NULL)"
    ).bind(OPERATION_ID, ownerId, now).run();
    return true;
  } catch {
    return false;
  }
}

async function clearLock(db: any, ownerId: string) {
  await db.prepare(
    "DELETE FROM hermes_first5_provisioning_receipts " +
    "WHERE operation_id=? AND specialist_id=? AND status='pending'"
  ).bind(OPERATION_ID, ownerId).run();
}

async function markComplete(db: any, ownerId: string, now: string) {
  await db.prepare(
    "UPDATE hermes_first5_provisioning_receipts SET status='completed',completed_at=? " +
    "WHERE operation_id=? AND specialist_id=? AND status='pending'"
  ).bind(now, OPERATION_ID, ownerId).run();
}

async function seedAvailability(db: any, shopId: string, now: string) {
  await ensureRepairShopAvailabilitySchema(db);
  const existing = await db.prepare(
    "SELECT COUNT(*) AS count FROM repair_shop_availability WHERE shop_id=?"
  ).bind(shopId).first();
  if (Number(existing?.count || 0) > 0) return false;

  for (const day of HOURS) {
    await db.prepare(
      "INSERT INTO repair_shop_availability " +
      "(shop_id,day_of_week,is_open,start_time,end_time,updated_at) VALUES (?,?,?,?,?,?)"
    ).bind(shopId, day[0], day[1], day[2], day[3], now).run();
  }
  return true;
}

async function seedCapabilities(db: any, shopId: string, now: string) {
  await ensureRepairShopCapabilitiesSchema(db);
  const existing = await db.prepare(
    "SELECT shop_id FROM repair_shop_capabilities WHERE shop_id=? LIMIT 1"
  ).bind(shopId).first();
  if (existing) return false;

  await db.prepare(
    "INSERT INTO repair_shop_capabilities " +
    "(shop_id,vehicle_types,fleet_service,mobile_roadside,emergency_24_7,parallel_booking_capacity,updated_at) " +
    "VALUES (?,?,?,?,?,?,?)"
  ).bind(shopId, JSON.stringify(["passenger_light"]), 0, 0, 0, 1, now).run();
  return true;
}

async function seedServices(db: any, ownerId: string, shopId: string) {
  const resolved = await resolveDefaultRepairShopServiceContext(
    db,
    ownerId,
    { id: shopId, owner_specialist_id: ownerId },
  );
  let created = 0;
  for (const [name, durationMinutes] of SERVICES) {
    const existing = await findDuplicateServiceForContext(db, {
      ownerId,
      contextId: resolved.context.id,
      name,
      includeLegacyUnmapped: true,
    });
    if (existing) continue;
    await createServiceForContext(db, {
      ownerId,
      contextId: resolved.context.id,
      name,
      durationMinutes,
    });
    created += 1;
  }
  const rows = await listServicesForContext(db, {
    ownerId,
    contextId: resolved.context.id,
    includeLegacyUnmapped: true,
  });
  return { created, total: rows.length };
}

async function sendCredentials(env: Env, login: string, password: string) {
  if (!env.LEAD_EMAIL_SERVICE || !env.LEAD_SERVICE_TOKEN) return false;
  const text = [
    "Hermes Connect First-5 temporary access",
    "",
    "Business: " + SHOP_NAME,
    "Login: " + login,
    "Temporary password: " + password,
    "Sign in: https://hermeslogisticsus.com/services/hermes-connect/repair-shops/auth/",
    "",
    "This credential was generated only for the approved First-5 onboarding.",
    "Ask the shop owner to change it after first sign-in.",
  ].join("\n");

  try {
    const response = await env.LEAD_EMAIL_SERVICE.fetch(ACCOUNT_EMAIL_PATH, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.LEAD_SERVICE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: "first5_kittles_" + crypto.randomUUID(),
        subject: ACCOUNT_EMAIL_SUBJECT,
        text,
        recipient_email: INTERNAL_RECIPIENT,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const token = bearerToken(request);
  if (!token || !await verifyGitHubFirst5ActivationOidcToken(token)) {
    return jsonResponse(403, { success: false, error: "operator_not_authorized" });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }
  if (String(body.operation || "") !== OPERATION_ID) {
    return jsonResponse(400, { success: false, error: "unsupported_operation" });
  }

  await ensureRepairShopProfileSchema(env.DB);
  await ensureRegistrationOpsSchema(env.DB);

  const result = await env.DB.prepare(
    "SELECT r.id,r.owner_specialist_id,r.slug,s.email,s.password_hash,s.password_salt,s.role," +
    "COALESCE(f.synthetic,0) AS synthetic " +
    "FROM repair_shops r " +
    "JOIN specialists s ON s.id=r.owner_specialist_id " +
    "LEFT JOIN hermes_registration_flags f ON f.specialist_id=s.id " +
    "WHERE (REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(r.phone,''),'+',''),' ',''),'-',''),'(',''),')','') " +
    "IN ('5013761519','15013761519')) " +
    "OR (LOWER(TRIM(r.name))=LOWER(TRIM(?)) AND UPPER(COALESCE(r.state,''))='AR') LIMIT 5"
  ).bind(SHOP_NAME).all();

  const rows = Array.isArray(result?.results) ? result.results : [];
  if (rows.length === 0) return jsonResponse(404, { success: false, error: "production_shop_not_found" });
  if (rows.length !== 1) return jsonResponse(409, { success: false, error: "production_shop_ambiguous" });

  const row: any = rows[0];
  if (String(row.role || "") !== "Shop Owner") {
    return jsonResponse(409, { success: false, error: "owner_role_mismatch" });
  }
  if (Number(row.synthetic || 0) === 1) {
    return jsonResponse(409, { success: false, error: "synthetic_registration_rejected" });
  }

  const shopId = String(row.id || "");
  const ownerId = String(row.owner_specialist_id || "");
  const ownerEmail = String(row.email || "").trim().toLowerCase();
  const slug = String(row.slug || "");
  if (!shopId || !ownerId || !ownerEmail.endsWith("@kittlesgarage.com") || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug)) {
    return jsonResponse(409, { success: false, error: "production_identity_incomplete" });
  }

  const prior = await getReceipt(env.DB);
  if (prior?.status === "completed" && String(prior.specialist_id || "") === ownerId) {
    const resolved = await resolveDefaultRepairShopServiceContext(
      env.DB,
      ownerId,
      { id: shopId, owner_specialist_id: ownerId },
    );
    const services = await listServicesForContext(env.DB, {
      ownerId,
      contextId: resolved.context.id,
      includeLegacyUnmapped: true,
    });
    return jsonResponse(200, {
      success: true,
      business_name: SHOP_NAME,
      public_profile_path: "/businesses/connect/repair-shop/" + slug + "/",
      provisioning_state: "already_completed",
      services_total: services.length,
      credential_delivery: "previously_delivered",
    });
  }
  if (prior) {
    return jsonResponse(409, { success: false, error: "provisioning_incomplete_manual_review" });
  }

  const now = new Date().toISOString();
  if (!await lockProvision(env.DB, ownerId, now)) {
    return jsonResponse(409, { success: false, error: "provisioning_lock_conflict" });
  }

  let availabilitySeeded = false;
  let capabilitiesSeeded = false;
  let serviceState = { created: 0, total: 0 };

  try {
    await env.DB.prepare(
      "UPDATE repair_shops SET website=?,timezone=?,updated_at=? WHERE id=? AND owner_specialist_id=?"
    ).bind("https://www.kittlesgarage.com/", "America/Chicago", now, shopId, ownerId).run();

    availabilitySeeded = await seedAvailability(env.DB, shopId, now);
    capabilitiesSeeded = await seedCapabilities(env.DB, shopId, now);
    serviceState = await seedServices(env.DB, ownerId, shopId);
  } catch (error) {
    await clearLock(env.DB, ownerId);
    console.error("first5_workspace_seed_failed", {
      category: "bounded_trial_provisioning",
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return jsonResponse(500, { success: false, error: "workspace_seed_failed" });
  }

  const oldHash = String(row.password_hash || "");
  const oldSalt = String(row.password_salt || "");
  if (!oldHash || !oldSalt) {
    await clearLock(env.DB, ownerId);
    return jsonResponse(409, { success: false, error: "owner_password_state_incomplete" });
  }

  const password = tempPassword();
  const { hash, salt } = await hashPassword(password);
  let passwordChanged = false;

  try {
    const update = await env.DB.prepare(
      "UPDATE specialists SET password_hash=?,password_salt=? WHERE id=? AND email=?"
    ).bind(hash, salt, ownerId, ownerEmail).run();
    if (Number(update?.meta?.changes || 0) !== 1) {
      await clearLock(env.DB, ownerId);
      return jsonResponse(409, { success: false, error: "credential_update_conflict" });
    }
    passwordChanged = true;
    await env.DB.prepare("DELETE FROM sessions WHERE specialist_id=?").bind(ownerId).run();

    if (!await verifyPassword(password, salt, hash)) {
      throw new Error("credential_hash_readback_failed");
    }

    if (!await sendCredentials(env, ownerEmail, password)) {
      await env.DB.prepare(
        "UPDATE specialists SET password_hash=?,password_salt=? WHERE id=? AND email=?"
      ).bind(oldHash, oldSalt, ownerId, ownerEmail).run();
      passwordChanged = false;
      await clearLock(env.DB, ownerId);
      return jsonResponse(503, {
        success: false,
        error: "credential_delivery_failed_password_restored",
      });
    }

    await markComplete(env.DB, ownerId, new Date().toISOString());
  } catch (error) {
    if (passwordChanged) {
      await env.DB.prepare(
        "UPDATE specialists SET password_hash=?,password_salt=? WHERE id=? AND email=?"
      ).bind(oldHash, oldSalt, ownerId, ownerEmail).run();
    }
    await clearLock(env.DB, ownerId);
    console.error("first5_credential_provision_failed", {
      category: "bounded_trial_provisioning",
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return jsonResponse(500, { success: false, error: "credential_provision_failed" });
  }

  return jsonResponse(200, {
    success: true,
    business_name: SHOP_NAME,
    public_profile_path: "/businesses/connect/repair-shop/" + slug + "/",
    provisioning_state: "completed",
    availability_seeded: availabilitySeeded,
    capabilities_seeded: capabilitiesSeeded,
    services_created: serviceState.created,
    services_total: serviceState.total,
    credential_delivery: "internal_admin_mailbox",
  });
}
