import { repairShopDirectory } from "../../src/data/repair-shop-directory";
import { ensureRepairShopProfileSchema } from "./_lib/repair-shop-schema.mjs";
import { saveCatalogBusinessInquiry, markCatalogBusinessInquiryInternalDelivery } from "./_lib/catalog-business-inquiries.mjs";

type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type ServiceFetcher = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

type Env = {
  DB?: any;
  LEAD_EMAIL_SERVICE?: ServiceFetcher;
  LEAD_LIMITS?: KvNamespace;
  LEAD_SERVICE_TOKEN?: string;
  LEAD_DELIVERY_MODE?: string;
  ALLOWED_ORIGIN?: string;
};

type Context = {
  request: Request;
  env: Env;
};

type AttributionInput = {
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_term?: unknown;
  utm_content?: unknown;
  gclid?: unknown;
  gbraid?: unknown;
  wbraid?: unknown;
  referrer?: unknown;
};

type BusinessLeadInput = {
  request_id?: unknown;
  submitted_at?: unknown;
  source_path?: unknown;
  interest?: unknown;
  name?: unknown;
  email?: unknown;
  company?: unknown;
  city_country?: unknown;
  phone?: unknown;
  whatsapp?: unknown;
  telegram?: unknown;
  website_or_social?: unknown;
  planning_budget?: unknown;
  planning_horizon?: unknown;
  preferred_language?: unknown;
  preferred_contact_time?: unknown;
  services?: unknown;
  message?: unknown;
  catalog_business_id?: unknown;
  catalog_profile?: unknown;
  catalog_source_ref?: unknown;
  consent?: unknown;
  attribution?: unknown;
};

const DEFAULT_ORIGIN = "https://hermeslogisticsus.com";
const EMAIL_SERVICE_URL = "https://lead-email.internal/v1/send";
const MAX_BODY_BYTES = 16_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 60 * 60;
const DELIVERY_TIMEOUT_MS = 8_000;
const CATALOG_INQUIRY_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

const allowedServices = new Set([
  "Website development",
  "Web applications",
  "CRM & business automation",
  "AI bots / AI sales assistant",
  "SEO",
  "Google Ads",
  "Meta Ads (Facebook / Instagram)",
  "Social media marketing & organic growth",
  "TikTok / Threads / X growth",
  "Video & content production",
  "Marketing / sales consulting",
  "Training / courses",
  "Catalog claim / verification",
  "Catalog business listing",
  "Catalog SEO / GEO",
  "Catalog business request",
]);

const allowedBudgets = new Set([
  "Not sure yet",
  "Under $1,000",
  "$1,000–$3,000",
  "$3,000–$10,000",
  "$10,000–$25,000",
  "$25,000+",
]);
const allowedHorizons = new Set(["Not sure yet", "3 months", "6 months", "9 months", "12 months"]);
const allowedLanguages = new Set(["Russian", "Ukrainian", "English"]);
const allowedInterests = new Set(["ProgressoPro", "IT Development", "Hermes Catalog"]);

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

const clean = (value: unknown, max: number) =>
  typeof value === "string"
    ? value.replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max)
    : "";

const isRequestId = (value: string) => /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,79}$/.test(value);
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const hash = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
};

const normalizeCatalogProfilePath = (value: string) => {
  if (!value) return "";
  try {
    const url = new URL(value, DEFAULT_ORIGIN);
    if (url.origin !== DEFAULT_ORIGIN) return "";
    const path = url.pathname.replace(/\/{2,}/g, "/");
    return path.endsWith("/") ? path : path + "/";
  } catch {
    return "";
  }
};

async function resolveCatalogRepairShop(db: any, catalogBusinessId: string, catalogProfile: string, catalogSourceRef: string) {
  const path = normalizeCatalogProfilePath(catalogProfile);
  if (!path) return { linked: false, trusted: false, businessName: "" };
  await ensureRepairShopProfileSchema(db);

  const staticEntry = repairShopDirectory.find((entry) =>
    path === `/businesses/${entry.stateSlug}/${entry.citySlug}/${entry.slug}/`
  );
  if (staticEntry) {
    const expectedBusinessId = `repair-shop:${staticEntry.stateSlug}/${staticEntry.citySlug}/${staticEntry.slug}`;
    if (catalogBusinessId !== expectedBusinessId || (catalogSourceRef && catalogSourceRef !== staticEntry.sourceRef)) {
      return { linked: false, trusted: false, businessName: staticEntry.businessName };
    }
    const result = await db.prepare(`
      SELECT id, owner_specialist_id, name
      FROM repair_shops
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
        AND LOWER(TRIM(city)) = LOWER(TRIM(?))
        AND UPPER(TRIM(state)) = UPPER(TRIM(?))
      LIMIT 2
    `).bind(staticEntry.businessName, staticEntry.city, staticEntry.state).all();
    const rows = result?.results || [];
    if (rows.length !== 1) return { linked: false, trusted: true, businessName: staticEntry.businessName };
    return {
      linked: true,
      trusted: true,
      businessName: staticEntry.businessName,
      shopId: String(rows[0].id || ""),
      ownerSpecialistId: String(rows[0].owner_specialist_id || ""),
    };
  }

  const dynamic = path.match(/^\/businesses\/connect\/repair-shop\/([a-z0-9-]+)\/$/);
  if (dynamic) {
    const result = await db.prepare(`
      SELECT id, owner_specialist_id, name
      FROM repair_shops
      WHERE slug = ? AND catalog_opt_in = 1
      LIMIT 2
    `).bind(dynamic[1]).all();
    const rows = result?.results || [];
    if (rows.length !== 1) return { linked: false, trusted: false, businessName: "" };
    const row = rows[0];
    if (catalogBusinessId !== `repair-shop-crm:${String(row.id || "")}`) {
      return { linked: false, trusted: false, businessName: String(row.name || "") };
    }
    return {
      linked: true,
      trusted: true,
      businessName: String(row.name || ""),
      shopId: String(row.id || ""),
      ownerSpecialistId: String(row.owner_specialist_id || ""),
    };
  }

  return { linked: false, trusted: false, businessName: "" };
}

const getServices = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  const services = value
    .map((item) => clean(item, 100))
    .filter((item) => allowedServices.has(item));
  return [...new Set(services)].slice(0, 12);
};

const getAttribution = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {} as Record<string, string>;
  const input = value as AttributionInput;
  return {
    utm_source: clean(input.utm_source, 120),
    utm_medium: clean(input.utm_medium, 120),
    utm_campaign: clean(input.utm_campaign, 180),
    utm_term: clean(input.utm_term, 180),
    utm_content: clean(input.utm_content, 180),
    gclid: clean(input.gclid, 240),
    gbraid: clean(input.gbraid, 240),
    wbraid: clean(input.wbraid, 240),
    referrer: clean(input.referrer, 500),
  };
};

const subjectForInterest = (interest: string) =>
  interest === "IT Development"
    ? "[HERMES INQUIRY] [IT DEVELOPMENT]"
    : interest === "Hermes Catalog"
      ? "[HERMES INQUIRY] [CATALOG]"
      : "[HERMES INQUIRY] [MARKETING]";

export async function onRequestOptions({ request, env }: Context) {
  const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const origin = request.headers.get("Origin") || "";
  if (origin !== allowedOrigin) return json(allowedOrigin, 403, { success: false, error: "origin_not_allowed" });
  return new Response(null, { status: 204, headers: responseHeaders(allowedOrigin) });
}

export async function onRequestPost({ request, env }: Context) {
  const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const origin = request.headers.get("Origin") || "";
  if (origin !== allowedOrigin) return json(allowedOrigin, 403, { success: false, error: "origin_not_allowed" });

  if (
    env.LEAD_DELIVERY_MODE !== "live" ||
    !env.LEAD_EMAIL_SERVICE ||
    !env.LEAD_LIMITS ||
    !env.LEAD_SERVICE_TOKEN
  ) {
    return json(allowedOrigin, 503, { success: false, error: "delivery_not_configured" });
  }

  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json(allowedOrigin, 415, { success: false, error: "content_type_required" });
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) return json(allowedOrigin, 413, { success: false, error: "request_too_large" });

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json(allowedOrigin, 413, { success: false, error: "request_too_large" });
  }

  let input: BusinessLeadInput;
  try {
    input = JSON.parse(raw) as BusinessLeadInput;
  } catch {
    return json(allowedOrigin, 400, { success: false, error: "invalid_json" });
  }

  const requestId = clean(input.request_id, 80);
  const headerRequestId = clean(request.headers.get("Idempotency-Key"), 80);
  const interest = clean(input.interest, 120);
  const name = clean(input.name, 100);
  const email = clean(input.email, 160).toLowerCase();
  const company = clean(input.company, 140);
  const cityCountry = clean(input.city_country, 120);
  const phone = clean(input.phone, 120);
  const whatsapp = clean(input.whatsapp, 120);
  const telegram = clean(input.telegram, 120);
  const websiteOrSocial = clean(input.website_or_social, 240);
  const planningBudget = clean(input.planning_budget, 80);
  const planningHorizon = clean(input.planning_horizon, 40);
  const preferredLanguage = clean(input.preferred_language, 40);
  const preferredContactTime = clean(input.preferred_contact_time, 120);
  const services = getServices(input.services);
  const message = clean(input.message, 2_000);
  const catalogBusinessId = clean(input.catalog_business_id, 180);
  const catalogProfile = clean(input.catalog_profile, 240);
  const catalogSourceRef = clean(input.catalog_source_ref, 180);
  const sourcePathRaw = clean(input.source_path, 160);
  const sourcePath = sourcePathRaw.startsWith("/") ? sourcePathRaw : "/business-growth/";
  const submittedAt = clean(input.submitted_at, 40);
  const attribution = getAttribution(input.attribution);
  const catalogBusinessRequest = services.includes("Catalog business request");

  const invalid =
    !isRequestId(requestId) ||
    requestId !== headerRequestId ||
    !allowedInterests.has(interest) ||
    input.consent !== true ||
    name.length < 2 ||
    !isEmail(email) ||
    company.length < 2 ||
    cityCountry.length < 2 ||
    (catalogBusinessRequest ? (phone.replace(/\D/g, "").length < 7 && !whatsapp && !telegram) : (!whatsapp && !telegram)) ||
    websiteOrSocial.length < 2 ||
    (planningBudget && !allowedBudgets.has(planningBudget)) ||
    (planningHorizon && !allowedHorizons.has(planningHorizon)) ||
    !allowedLanguages.has(preferredLanguage) ||
    preferredContactTime.length < 2 ||
    services.length < 1 ||
    (catalogBusinessRequest && (!catalogBusinessId || !catalogProfile)) ||
    message.length < 10;

  if (invalid) return json(allowedOrigin, 400, { success: false, error: "invalid_lead" });

  const requestKey = `business-lead:id:${await hash(requestId)}`;
  const alreadyDelivered = await env.LEAD_LIMITS.get(requestKey);
  let catalogRecord: { linked: boolean } | null = null;
  if (catalogBusinessRequest) {
    if (!env.DB) return json(allowedOrigin, 503, { success: false, error: "catalog_crm_not_configured" });
    try {
      const repairShop = await resolveCatalogRepairShop(env.DB, catalogBusinessId, catalogProfile, catalogSourceRef);
      const payloadHash = await hash(JSON.stringify({
        catalogBusinessId, catalogProfile: normalizeCatalogProfilePath(catalogProfile), catalogSourceRef,
        name, email, phone, whatsapp, telegram, message, services,
      }));
      const createdAt = new Date().toISOString();
      const retentionUntil = new Date(Date.now() + CATALOG_INQUIRY_RETENTION_MS).toISOString();
      const saved = await saveCatalogBusinessInquiry(env.DB, {
        requestId,
        payloadHash,
        catalogBusinessId,
        catalogProfile: normalizeCatalogProfilePath(catalogProfile) || catalogProfile,
        catalogSourceRef,
        shopId: repairShop.linked ? repairShop.shopId : "",
        ownerSpecialistId: repairShop.linked ? repairShop.ownerSpecialistId : "",
        businessName: repairShop.businessName || company,
        contactName: name,
        contactEmail: email,
        contactPhone: phone,
        contactWhatsapp: whatsapp,
        contactTelegram: telegram,
        preferredLanguage,
        preferredContactTime,
        message,
        services,
        attribution,
        retentionUntil,
        createdAt,
      });
      if (saved.conflict) return json(allowedOrigin, 409, { success: false, error: "request_id_payload_conflict" });
      catalogRecord = { linked: Boolean(repairShop.linked) };
    } catch (error) {
      console.error("catalog_inquiry_persist_failed", { request_id: requestId, error: error instanceof Error ? error.message : "unknown_error" });
      return json(allowedOrigin, 503, { success: false, error: "catalog_crm_temporarily_unavailable" });
    }
  }
  if (alreadyDelivered) {
    return json(allowedOrigin, 200, {
      success: true,
      duplicate: true,
      request_id: requestId,
      ...(catalogRecord ? { crm_saved: true, crm_linked: catalogRecord.linked } : {}),
    });
  }

  const clientAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `business-lead:rate:${await hash(clientAddress)}`;
  const currentRate = Number(await env.LEAD_LIMITS.get(rateKey) || "0");
  if (currentRate >= RATE_LIMIT) {
    return json(allowedOrigin, 429, { success: false, error: "rate_limit_exceeded" });
  }

  const attributionLines = [
    attribution.utm_source ? `UTM source: ${attribution.utm_source}` : "",
    attribution.utm_medium ? `UTM medium: ${attribution.utm_medium}` : "",
    attribution.utm_campaign ? `UTM campaign: ${attribution.utm_campaign}` : "",
    attribution.utm_term ? `UTM term: ${attribution.utm_term}` : "",
    attribution.utm_content ? `UTM content: ${attribution.utm_content}` : "",
    attribution.gclid ? `GCLID: ${attribution.gclid}` : "",
    attribution.gbraid ? `GBRAID: ${attribution.gbraid}` : "",
    attribution.wbraid ? `WBRAID: ${attribution.wbraid}` : "",
    attribution.referrer ? `Referrer: ${attribution.referrer}` : "",
  ].filter(Boolean);

  const emailBody = [
    "Hermes Business Lead",
    "--------------------",
    `Direction: ${interest}`,
    `Name: ${name}`,
    `Company / project: ${company}`,
    `City / country: ${cityCountry}`,
    `Email: ${email}`,
    `Phone: ${phone || "not provided"}`,
    `WhatsApp: ${whatsapp || "not provided"}`,
    `Telegram: ${telegram || "not provided"}`,
    `Website / social: ${websiteOrSocial}`,
    ...(catalogBusinessId ? [`Catalog business ID: ${catalogBusinessId}`] : []),
    ...(catalogProfile ? [`Catalog profile: ${catalogProfile}`] : []),
    ...(catalogSourceRef ? [`Catalog source ref: ${catalogSourceRef}`] : []),
    `Planning budget: ${planningBudget || "not provided"}`,
    `Roadmap horizon: ${planningHorizon || "not provided"}`,
    `Preferred language: ${preferredLanguage}`,
    `Best time to contact: ${preferredContactTime}`,
    `Services: ${services.join(", ")}`,
    "Goal:",
    message,
    ...(attributionLines.length ? ["", "Attribution:", ...attributionLines] : []),
    "",
    ...(submittedAt ? [`Submitted at: ${submittedAt}`] : []),
    `Submitted from: ${sourcePath}`,
  ].join("\n").slice(0, 12_000);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

  try {
    const serviceResponse = await env.LEAD_EMAIL_SERVICE.fetch(EMAIL_SERVICE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.LEAD_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        request_id: requestId,
        subject: subjectForInterest(interest),
        text: emailBody,
        reply_to: email,
      }),
      signal: controller.signal,
    });

    if (!serviceResponse.ok) {
      if (catalogRecord && env.DB) await markCatalogBusinessInquiryInternalDelivery(env.DB, requestId, "failed").catch(() => undefined);
      if ([429, 503, 504].includes(serviceResponse.status)) {
        return json(allowedOrigin, 503, { success: false, error: "delivery_temporarily_unavailable" });
      }
      return json(allowedOrigin, 502, { success: false, error: "delivery_failed" });
    }

    await Promise.all([
      env.LEAD_LIMITS.put(requestKey, "delivered", { expirationTtl: 24 * 60 * 60 }),
      env.LEAD_LIMITS.put(rateKey, String(currentRate + 1), { expirationTtl: RATE_WINDOW_SECONDS }),
      ...(catalogRecord && env.DB ? [markCatalogBusinessInquiryInternalDelivery(env.DB, requestId, "delivered")] : []),
    ]);

    return json(allowedOrigin, 200, {
      success: true,
      request_id: requestId,
      ...(catalogRecord ? { crm_saved: true, crm_linked: catalogRecord.linked } : {}),
    });
  } catch (error) {
    if (catalogRecord && env.DB) await markCatalogBusinessInquiryInternalDelivery(env.DB, requestId, "failed").catch(() => undefined);
    if (error instanceof DOMException && error.name === "AbortError") {
      return json(allowedOrigin, 503, { success: false, error: "delivery_temporarily_unavailable" });
    }
    return json(allowedOrigin, 502, { success: false, error: "delivery_failed" });
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequest(context: Context) {
  if (context.request.method === "OPTIONS") return onRequestOptions(context);
  if (context.request.method === "POST") return onRequestPost(context);
  const allowedOrigin = context.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  return json(allowedOrigin, 405, { success: false, error: "method_not_allowed" });
}
