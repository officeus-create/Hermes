import {
  cleanHomeServiceText,
  ensureHomeServiceCrmSchema,
  normalizeHomeServiceLead,
} from "../../_lib/home-service-crm.mjs";

type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type Env = {
  DB?: any;
  LEAD_LIMITS?: KvNamespace;
};

type Context = {
  request: Request;
  env: Env;
};

type PublicMzmLeadInput = {
  request_id?: unknown;
  submitted_at?: unknown;
  source_path?: unknown;
  source?: unknown;
  name?: unknown;
  phone?: unknown;
  zip?: unknown;
  service?: unknown;
  message?: unknown;
  preferred_time?: unknown;
  mzm_hp?: unknown;
  ts?: unknown;
  attribution?: unknown;
};

const COMPANY_ID = "home-service-managed:mzm-junk-removal";
const DATA_OWNER_ID = "hermes-managed:mzm-junk-removal";
const COMPANY_SLUG = "mzm-junk-removal";
const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT = 8;
const RATE_WINDOW_SECONDS = 60 * 60;

const ALLOWED_ORIGINS = new Set([
  "https://mzm-junk-removal.com",
  "https://www.mzm-junk-removal.com",
]);

const SERVICE_AREA_ZIPS = new Set([
  "95661", "95678", "95747", "95746",
  "95677", "95765",
  "95648",
  "95650", "95663", "95658",
  "95602", "95603", "95604",
  "95610", "95611", "95621",
  "95608", "95609",
  "95628",
  "95662",
  "95843", "95660",
  "95823", "95840",
  "95605", "95691",
  "95757", "95758", "95759",
  "95670", "95741", "95742",
  "95630", "95763",
  "95811", "95814", "95815", "95816", "95817", "95818", "95819",
  "95820", "95821", "95822", "95824", "95825", "95826", "95827", "95828",
  "95829", "95830", "95831", "95832", "95833", "95834", "95835", "95836",
  "95837", "95838", "95841", "95842", "95864",
]);

const ALLOWED_SERVICES = new Set([
  "",
  "Furniture Removal",
  "Appliance Removal",
  "Garage Cleanout",
  "Estate Cleanout",
  "Eviction Cleanout",
  "Property Cleanout",
  "Yard Debris Cleanout",
  "Mattress Removal",
  "Storage Unit Cleanout",
  "Office Cleanout",
  "Construction Debris Removal",
  "Shed Removal",
  "Not Sure Yet",
]);

const responseHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin",
});

const json = (origin: string, status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status, headers: responseHeaders(origin) });

const hashHex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const validRequestId = (value: string) => /^[A-Za-z0-9][A-Za-z0-9_-]{7,79}$/.test(value);

const cleanAttribution = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {} as Record<string, string>;
  const input = value as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const [key, max] of [
    ["utm_source", 120],
    ["utm_medium", 120],
    ["utm_campaign", 180],
    ["utm_term", 180],
    ["utm_content", 180],
    ["gclid", 240],
    ["gbraid", 240],
    ["wbraid", 240],
    ["fbclid", 240],
    ["referrer", 500],
  ] as const) {
    const cleaned = cleanHomeServiceText(input[key], max);
    if (!cleaned) continue;
    if (key === "referrer") {
      try {
        const url = new URL(cleaned);
        if (url.protocol === "https:" || url.protocol === "http:") {
          result[key] = url.origin + url.pathname;
        }
      } catch {}
      continue;
    }
    result[key] = cleaned;
  }
  return result;
};

const publicNotes = (input: {
  sourceLabel: string;
  sourcePath: string;
  preferredTime: string;
  message: string;
  attribution: Record<string, string>;
}) => {
  const lines = [
    input.sourceLabel ? `Page label: ${input.sourceLabel}` : "",
    input.sourcePath ? `Source path: ${input.sourcePath}` : "",
    input.preferredTime ? `Preferred time: ${input.preferredTime}` : "",
    input.message ? `Customer message: ${input.message}` : "",
    Object.keys(input.attribution).length
      ? `Attribution (visitor URL/referrer): ${JSON.stringify(input.attribution)}`
      : "",
  ].filter(Boolean);
  return cleanHomeServiceText(lines.join(" | "), 1200);
};

async function ensurePublicIntakeSchema(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_home_service_public_intakes (
      request_id TEXT PRIMARY KEY,
      payload_hash TEXT NOT NULL,
      lead_id TEXT NOT NULL UNIQUE,
      company_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_home_service_public_intakes_company_created ON hermes_home_service_public_intakes(company_id,created_at)"
  ).run();
}

async function canonicalMzmCompany(db: any) {
  return db.prepare(`
    SELECT id,owner_specialist_id,slug,company_type,management_mode,catalog_status
    FROM hermes_company_profiles
    WHERE id=? AND slug=? AND company_type='home_service' AND management_mode='hermes_managed'
    LIMIT 1
  `).bind(COMPANY_ID, COMPANY_SLUG).first();
}

export async function onRequestOptions({ request }: Context) {
  const origin = request.headers.get("Origin") || "";
  if (!ALLOWED_ORIGINS.has(origin)) {
    return json("https://mzm-junk-removal.com", 403, { success: false, error: "origin_not_allowed" });
  }
  return new Response(null, { status: 204, headers: responseHeaders(origin) });
}

export async function onRequestPost({ request, env }: Context) {
  const origin = request.headers.get("Origin") || "";
  if (!ALLOWED_ORIGINS.has(origin)) {
    return json("https://mzm-junk-removal.com", 403, { success: false, error: "origin_not_allowed" });
  }
  if (!env.DB || !env.LEAD_LIMITS) {
    return json(origin, 503, { success: false, error: "mzm_intake_not_configured" });
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json(origin, 415, { success: false, error: "content_type_required" });
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return json(origin, 413, { success: false, error: "request_too_large" });
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json(origin, 413, { success: false, error: "request_too_large" });
  }

  let body: PublicMzmLeadInput;
  try {
    body = JSON.parse(raw) as PublicMzmLeadInput;
  } catch {
    return json(origin, 400, { success: false, error: "invalid_json" });
  }

  const requestId = cleanHomeServiceText(body.request_id, 80);
  const idempotencyKey = cleanHomeServiceText(request.headers.get("Idempotency-Key"), 80);
  const name = cleanHomeServiceText(body.name, 140);
  const phone = cleanHomeServiceText(body.phone, 50);
  const zip = cleanHomeServiceText(body.zip, 24);
  const service = cleanHomeServiceText(body.service, 120);
  const message = cleanHomeServiceText(body.message, 500);
  const preferredTime = cleanHomeServiceText(body.preferred_time, 120);
  const sourceLabel = cleanHomeServiceText(body.source, 120);
  const sourcePathRaw = cleanHomeServiceText(body.source_path, 180);
  const sourcePath = /^\/[A-Za-z0-9_\-/.]*$/.test(sourcePathRaw) ? sourcePathRaw : "";
  const honeypot = cleanHomeServiceText(body.mzm_hp, 120);
  const formTs = Number(body.ts);
  const attribution = cleanAttribution(body.attribution);
  const phoneDigits = phone.replace(/\D/g, "");
  const ageMs = Date.now() - formTs;
  const timestampInvalid =
    !Number.isFinite(formTs) ||
    formTs <= 0 ||
    ageMs > 24 * 60 * 60 * 1000 ||
    ageMs < -5 * 60 * 1000 ||
    (ageMs >= 0 && ageMs < 1200);

  const invalid =
    !validRequestId(requestId) ||
    requestId !== idempotencyKey ||
    name.length < 2 ||
    phoneDigits.length < 10 ||
    phoneDigits.length > 15 ||
    !SERVICE_AREA_ZIPS.has(zip) ||
    !ALLOWED_SERVICES.has(service) ||
    honeypot.length > 0 ||
    timestampInvalid;

  if (invalid) {
    return json(origin, 400, { success: false, request_id: requestId, error: "invalid_submission" });
  }

  await ensureHomeServiceCrmSchema(env.DB);
  await ensurePublicIntakeSchema(env.DB);

  const company = await canonicalMzmCompany(env.DB);
  if (
    !company ||
    String(company.id || "") !== COMPANY_ID ||
    String(company.owner_specialist_id || "") !== DATA_OWNER_ID ||
    String(company.catalog_status || "") !== "verified_public"
  ) {
    return json(origin, 503, { success: false, request_id: requestId, error: "mzm_managed_client_not_ready" });
  }

  const normalizedPayload = {
    name,
    phone,
    zip,
    service,
    message,
    preferredTime,
    sourceLabel,
    sourcePath,
    attribution,
  };
  const payloadHash = await hashHex(JSON.stringify(normalizedPayload));

  const existingReceipt = await env.DB.prepare(`
    SELECT payload_hash,lead_id
    FROM hermes_home_service_public_intakes
    WHERE request_id=?
    LIMIT 1
  `).bind(requestId).first();

  if (existingReceipt) {
    if (String(existingReceipt.payload_hash || "") !== payloadHash) {
      return json(origin, 409, { success: false, request_id: requestId, error: "request_id_payload_conflict" });
    }
    return json(origin, 200, {
      success: true,
      duplicate: true,
      request_id: requestId,
      crm_saved: true,
    });
  }

  const clientAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `mzm-public-intake:rate:${await hashHex(clientAddress)}`;
  let currentRate = 0;
  try {
    currentRate = Number(await env.LEAD_LIMITS.get(rateKey) || "0");
  } catch {
    return json(origin, 503, { success: false, request_id: requestId, error: "rate_limit_unavailable" });
  }
  if (!Number.isFinite(currentRate) || currentRate >= RATE_LIMIT) {
    return json(origin, 429, { success: false, request_id: requestId, error: "rate_limit_exceeded" });
  }

  const now = new Date().toISOString();
  const leadId = `home-lead-${crypto.randomUUID()}`;
  const value = normalizeHomeServiceLead({
    source: "MZM Website",
    customerName: name,
    customerPhone: phone,
    postalCode: zip,
    jobType: service || "Junk removal quote",
    status: "new",
    notes: publicNotes({ sourceLabel, sourcePath, preferredTime, message, attribution }),
  });

  try {
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO hermes_home_service_public_intakes (
          request_id,payload_hash,lead_id,company_id,owner_specialist_id,origin,created_at
        ) VALUES (?,?,?,?,?,?,?)
      `).bind(requestId, payloadHash, leadId, COMPANY_ID, DATA_OWNER_ID, origin, now),
      env.DB.prepare(`
        INSERT INTO hermes_home_service_leads (
          id,owner_specialist_id,company_id,source,search_query,customer_name,customer_phone,customer_email,
          address_line1,postal_code,city,job_type,photo_refs_json,approximate_volume,
          lead_cost_cents,lead_cost_known,lead_cost_source_ref,quote_cents,quote_known,quote_source_ref,
          status,job_start_at,assigned_driver,
          final_amount_cents,final_amount_known,final_amount_source_ref,disposal_cost_cents,disposal_cost_known,disposal_cost_source_ref,
          duration_minutes,payment_method,loss_reason,follow_up_at,review_requested_at,review_received_at,notes,created_at,updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        leadId, DATA_OWNER_ID, COMPANY_ID, value.source, null, value.customerName, value.customerPhone || null, null,
        null, value.postalCode || null, null, value.jobType || null, "[]", null,
        0, 0, null, 0, 0, null,
        "new", null, null,
        0, 0, null, 0, 0, null,
        0, null, null, null, null, null, value.notes || null, now, now,
      ),
    ]);
  } catch {
    const racedReceipt = await env.DB.prepare(`
      SELECT payload_hash,lead_id
      FROM hermes_home_service_public_intakes
      WHERE request_id=?
      LIMIT 1
    `).bind(requestId).first();
    if (racedReceipt && String(racedReceipt.payload_hash || "") === payloadHash) {
      return json(origin, 200, {
        success: true,
        duplicate: true,
        request_id: requestId,
        crm_saved: true,
      });
    }
    console.error("mzm_public_intake_persist_failed");
    return json(origin, 503, { success: false, request_id: requestId, error: "crm_temporarily_unavailable" });
  }

  try {
    await env.LEAD_LIMITS.put(rateKey, String(currentRate + 1), { expirationTtl: RATE_WINDOW_SECONDS });
  } catch {
    // The lead is already atomically persisted in D1. Do not tell the customer it failed
    // and invite a duplicate submission merely because the abuse counter could not update.
    console.error("mzm_public_intake_rate_counter_write_failed");
  }

  return json(origin, 201, {
    success: true,
    duplicate: false,
    request_id: requestId,
    crm_saved: true,
  });
}

export async function onRequest(context: Context) {
  if (context.request.method === "OPTIONS") return onRequestOptions(context);
  if (context.request.method === "POST") return onRequestPost(context);
  const origin = context.request.headers.get("Origin") || "https://mzm-junk-removal.com";
  return json(ALLOWED_ORIGINS.has(origin) ? origin : "https://mzm-junk-removal.com", 405, {
    success: false,
    error: "method_not_allowed",
  });
}