import { hashPassword, isValidEmail, isValidPassword, createSessionToken, sessionExpiry, sessionCookieHeader } from "../../../src/legacy-prototype/auth.mjs";
import { REPAIR_SHOP_FREE_REGISTRATION_END_ISO } from "../../../src/data/hermes-connect-repair-shop-launch.ts";
import { jsonResponse } from "../_lib/session.mjs";
import {
  parseRepairShopReferralCookie,
  persistRepairShopSalesAttribution,
  repairShopReferralCookieHeader,
  resolveRepairShopReferral,
} from "../_lib/repair-shop-sales-attribution.mjs";
import {
  deliverTelegramRegistrationAlert,
  enqueueRegistrationAlert,
  syncSyntheticFlagForAccount,
} from "../_lib/registration-ops.mjs";

type Env = {
  DB?: any;
  REPAIR_SHOP_REFERRAL_MAP_JSON?: string;
  HERMES_CONNECT_TELEGRAM_BOT_TOKEN?: string;
  HERMES_CONNECT_TELEGRAM_OWNER_CHAT_ID?: string;
  HERMES_SYNTHETIC_ACCOUNT_EMAILS?: string;
};

type RequestContext = {
  request: Request;
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
};

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const cleanText = (value: unknown, max: number) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);
const REPAIR_SHOP_FREE_REGISTRATION_END_MS = Date.parse(REPAIR_SHOP_FREE_REGISTRATION_END_ISO);

function createdResponse(payload: Record<string, unknown>, sessionToken: string, clearReferralCookie: boolean) {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
  headers.append("Set-Cookie", sessionCookieHeader(sessionToken));
  if (clearReferralCookie) headers.append("Set-Cookie", repairShopReferralCookieHeader("", { clear: true }));
  return new Response(JSON.stringify(payload), { status: 201, headers });
}

async function processRegistrationOperations(env: Env, specialistId: string, email: string, createdAt: string) {
  try {
    await syncSyntheticFlagForAccount({ db: env.DB, env, specialistId, email, createdAt });
    await enqueueRegistrationAlert({ db: env.DB, specialistId, kind: "registration", createdAt });
    await deliverTelegramRegistrationAlert({ db: env.DB, env, specialistId, kind: "registration" });
  } catch {
    console.error("registration_ops_failed", { category: "background_processing" });
  }
}

export async function onRequestPost({ request, env, waitUntil }: RequestContext) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const email = cleanText(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const name = cleanText(body.name, 100);
  const role = cleanText(body.role, 120);
  const location = cleanText(body.location, 120);
  const bio = cleanText(body.bio, 500);

  const errors: string[] = [];
  if (!isValidEmail(email)) errors.push("email_invalid");
  if (!isValidPassword(password)) errors.push("password_too_short");
  if (name.length < 2) errors.push("name_required");
  if (role.length < 2) errors.push("role_required");
  if (location.length < 2) errors.push("location_required");
  if (bio.length < 20) errors.push("bio_too_short");
  if (errors.length) return jsonResponse(400, { success: false, errors });

  const existing = await env.DB.prepare("SELECT id FROM specialists WHERE email = ?").bind(email).first();
  if (existing) return jsonResponse(409, { success: false, error: "email_already_registered" });

  if (role === "Shop Owner" && Date.now() >= REPAIR_SHOP_FREE_REGISTRATION_END_MS) {
    return jsonResponse(403, {
      success: false,
      error: "repair_shop_free_registration_ended",
      registration_deadline: REPAIR_SHOP_FREE_REGISTRATION_END_ISO,
      next_url: "/services/hermes-connect/repair-shops/plan/",
    });
  }

  const { hash, salt } = await hashPassword(password);
  const id = `specialist-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO specialists (id, email, password_hash, password_salt, name, role, location, bio, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(id, email, hash, salt, name, role, location, bio, createdAt)
    .run();

  const referralToken = role === "Shop Owner" ? parseRepairShopReferralCookie(request.headers.get("Cookie")) : "";
  const referral = referralToken ? resolveRepairShopReferral(env, referralToken) : null;
  let attributionCaptured = false;

  if (referral && referralToken) {
    try {
      attributionCaptured = await persistRepairShopSalesAttribution({
        db: env.DB,
        ownerSpecialistId: id,
        referral,
        referralToken,
        registeredAt: createdAt,
      });
    } catch (error) {
      console.error("repair_shop_sales_attribution_failed", {
        owner_specialist_id: id,
        error: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  const token = createSessionToken();
  const expiresAt = sessionExpiry();
  await env.DB.prepare("INSERT INTO sessions (token, specialist_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(token, id, createdAt, expiresAt)
    .run();

  const opsPromise = processRegistrationOperations(env, id, email, createdAt);
  if (typeof waitUntil === "function") waitUntil(opsPromise);
  else await opsPromise;

  return createdResponse(
    {
      success: true,
      specialist: { id, email, name, role, location, bio },
      attribution_captured: attributionCaptured,
    },
    token,
    Boolean(referralToken),
  );
}
