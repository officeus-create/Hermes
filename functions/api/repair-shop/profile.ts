import { REPAIR_SHOP_FREE_REGISTRATION_END_ISO } from "../../../src/data/hermes-connect-repair-shop-launch.ts";
import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureRepairShopProfileSchema } from "../_lib/repair-shop-schema.mjs";
import {
  deliverTelegramRegistrationAlert,
  enqueueRegistrationAlert,
} from "../_lib/registration-ops.mjs";

type Env = {
  DB?: any;
  HERMES_CONNECT_TELEGRAM_BOT_TOKEN?: string;
  HERMES_CONNECT_TELEGRAM_OWNER_CHAT_ID?: string;
  HERMES_SYNTHETIC_ACCOUNT_EMAILS?: string;
};

type RequestContext = {
  request: Request;
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
};

type ProfileInput = {
  name?: unknown;
  phone?: unknown;
  address_line1?: unknown;
  city?: unknown;
  state?: unknown;
  region?: unknown;
  country_code?: unknown;
  postal_code?: unknown;
  timezone?: unknown;
  website?: unknown;
  catalog_opt_in?: unknown;
};

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
const REPAIR_SHOP_FREE_REGISTRATION_END_MS = Date.parse(REPAIR_SHOP_FREE_REGISTRATION_END_ISO);
const REPORT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

function slugify(value: string) {
  const base = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "repair-shop";
}

async function makeUniqueSlug(db: any, name: string) {
  const base = slugify(name);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 7);
    const slug = `${base}-${suffix}`;
    const exists = await db.prepare("SELECT id FROM repair_shops WHERE slug = ? LIMIT 1").bind(slug).first();
    if (!exists) return slug;
  }
  throw new Error("unable_to_allocate_shop_slug");
}

function isValidTimezone(value: string) {
  if (!value || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function normalizeWebsite(value: unknown) {
  const raw = clean(value, 240);
  if (!raw) return "";
  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    return parsed.toString().slice(0, 240);
  } catch {
    return null;
  }
}

async function getProfile(db: any, ownerId: string) {
  return db
    .prepare(
      "SELECT id,owner_specialist_id,name,slug,phone,address_line1,city,state,region,country_code,postal_code,timezone,website,catalog_opt_in,catalog_opt_in_at,catalog_published_at,seo_geo_started_at,next_seo_report_at,created_at,updated_at FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1",
    )
    .bind(ownerId)
    .first();
}

async function processProfileAlert(env: Env, specialistId: string, createdAt: string) {
  try {
    await enqueueRegistrationAlert({ db: env.DB, specialistId, kind: "profile", createdAt });
    await deliverTelegramRegistrationAlert({ db: env.DB, env, specialistId, kind: "profile" });
  } catch {
    console.error("repair_shop_profile_alert_failed", { category: "background_processing" });
  }
}

function catalogState(shop: any) {
  const listed = Number(shop?.catalog_opt_in || 0) === 1;
  return {
    listed,
    status: listed ? "self_submitted" : "opted_out",
    profile_url: listed && shop?.slug ? `/businesses/connect/repair-shop/${encodeURIComponent(String(shop.slug))}/` : null,
    published_at: listed ? shop?.catalog_published_at || null : null,
    seo_geo_started_at: listed ? shop?.seo_geo_started_at || null : null,
    reporting_cadence: listed ? "monthly" : null,
    next_report_at: listed ? shop?.next_seo_report_at || null : null,
    organic_evaluation_horizon: listed ? "6 months+" : null,
    guarantee: false,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureRepairShopProfileSchema(env.DB);
  const shop = await getProfile(env.DB, specialist.id);
  return jsonResponse(200, { success: true, shop: shop ?? null, catalog: catalogState(shop) });
}

export async function onRequestPut({ request, env, waitUntil }: RequestContext) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  await ensureRepairShopProfileSchema(env.DB);
  const existing = await getProfile(env.DB, specialist.id);

  let body: ProfileInput;
  try {
    body = (await request.json()) as ProfileInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 32);
  const addressLine1 = clean(body.address_line1, 160);
  const city = clean(body.city, 100);
  const regionSource = body.region !== undefined
    ? body.region
    : body.state !== undefined
      ? body.state
      : existing?.region ?? existing?.state ?? "";
  const region = clean(regionSource, 100);
  const countryCode = clean(body.country_code ?? existing?.country_code ?? "US", 2).toUpperCase();
  const legacyState = region || countryCode;
  const postalCode = clean(body.postal_code, 24);
  const timezone = clean(body.timezone, 64);
  const website = normalizeWebsite(body.website !== undefined ? body.website : existing?.website ?? "");
  const catalogOptIn = typeof body.catalog_opt_in === "boolean"
    ? body.catalog_opt_in
    : Number(existing?.catalog_opt_in || 0) === 1;

  if (name.length < 2) return jsonResponse(400, { success: false, error: "invalid_shop_name" });
  if (city.length < 2) return jsonResponse(400, { success: false, error: "invalid_city" });
  if (!/^[A-Z]{2}$/.test(countryCode)) return jsonResponse(400, { success: false, error: "invalid_country_code" });
  if (!isValidTimezone(timezone)) return jsonResponse(400, { success: false, error: "invalid_timezone" });
  if (phone && phone.length < 7) return jsonResponse(400, { success: false, error: "invalid_phone" });
  if (website === null) return jsonResponse(400, { success: false, error: "invalid_website" });

  const now = new Date().toISOString();
  const previouslyListed = Number(existing?.catalog_opt_in || 0) === 1;
  const catalogOptInAt = catalogOptIn ? (existing?.catalog_opt_in_at || now) : existing?.catalog_opt_in_at || null;
  const catalogPublishedAt = catalogOptIn ? (existing?.catalog_published_at || now) : existing?.catalog_published_at || null;
  const seoGeoStartedAt = catalogOptIn ? (existing?.seo_geo_started_at || now) : existing?.seo_geo_started_at || null;
  const nextSeoReportAt = catalogOptIn
    ? (previouslyListed && existing?.next_seo_report_at ? existing.next_seo_report_at : new Date(Date.now() + REPORT_INTERVAL_MS).toISOString())
    : null;

  if (existing) {
    await env.DB
      .prepare(
        "UPDATE repair_shops SET name=?,phone=?,address_line1=?,city=?,state=?,region=?,country_code=?,postal_code=?,timezone=?,website=?,catalog_opt_in=?,catalog_opt_in_at=?,catalog_published_at=?,seo_geo_started_at=?,next_seo_report_at=?,updated_at=? WHERE owner_specialist_id=?",
      )
      .bind(
        name,
        phone || null,
        addressLine1 || null,
        city,
        legacyState,
        region || null,
        countryCode,
        postalCode || null,
        timezone,
        website || null,
        catalogOptIn ? 1 : 0,
        catalogOptInAt,
        catalogPublishedAt,
        seoGeoStartedAt,
        nextSeoReportAt,
        now,
        specialist.id,
      )
      .run();
  } else {
    if (Date.now() >= REPAIR_SHOP_FREE_REGISTRATION_END_MS) {
      return jsonResponse(403, {
        success: false,
        error: "repair_shop_free_registration_ended",
        registration_deadline: REPAIR_SHOP_FREE_REGISTRATION_END_ISO,
        next_url: "/services/hermes-connect/repair-shops/plan/",
      });
    }

    const id = `shop-${crypto.randomUUID()}`;
    const slug = await makeUniqueSlug(env.DB, name);
    await env.DB
      .prepare(
        "INSERT INTO repair_shops (id,owner_specialist_id,name,slug,phone,address_line1,city,state,region,country_code,postal_code,timezone,website,catalog_opt_in,catalog_opt_in_at,catalog_published_at,seo_geo_started_at,next_seo_report_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        id,
        specialist.id,
        name,
        slug,
        phone || null,
        addressLine1 || null,
        city,
        legacyState,
        region || null,
        countryCode,
        postalCode || null,
        timezone,
        website || null,
        catalogOptIn ? 1 : 0,
        catalogOptIn ? now : null,
        catalogOptIn ? now : null,
        catalogOptIn ? now : null,
        catalogOptIn ? new Date(Date.now() + REPORT_INTERVAL_MS).toISOString() : null,
        now,
        now,
      )
      .run();
  }

  const shop = await getProfile(env.DB, specialist.id);
  const phoneBecameAvailable = Boolean(phone) && (!existing || !clean(existing.phone, 32));
  if (phoneBecameAvailable) {
    const alertPromise = processProfileAlert(env, specialist.id, now);
    if (typeof waitUntil === "function") waitUntil(alertPromise);
    else await alertPromise;
  }
  return jsonResponse(200, { success: true, shop, catalog: catalogState(shop) });
}
