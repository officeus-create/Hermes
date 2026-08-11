type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type ServiceFetcher = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

type Env = {
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
  whatsapp?: unknown;
  telegram?: unknown;
  website_or_social?: unknown;
  preferred_language?: unknown;
  preferred_contact_time?: unknown;
  services?: unknown;
  message?: unknown;
  consent?: unknown;
  attribution?: unknown;
};

const DEFAULT_ORIGIN = "https://hermeslogisticsus.com";
const EMAIL_SERVICE_URL = "https://lead-email.internal/v1/send";
const MAX_BODY_BYTES = 16_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 60 * 60;
const DELIVERY_TIMEOUT_MS = 8_000;

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
]);

const allowedLanguages = new Set(["Russian", "Ukrainian", "English"]);
const allowedInterests = new Set(["ProgressoPro", "IT Development"]);

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
    referrer: clean(input.referrer, 500),
  };
};

const subjectForInterest = (interest: string) =>
  interest === "IT Development"
    ? "[HERMES INQUIRY] [IT DEVELOPMENT]"
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
  const whatsapp = clean(input.whatsapp, 120);
  const telegram = clean(input.telegram, 120);
  const websiteOrSocial = clean(input.website_or_social, 240);
  const preferredLanguage = clean(input.preferred_language, 40);
  const preferredContactTime = clean(input.preferred_contact_time, 120);
  const services = getServices(input.services);
  const message = clean(input.message, 2_000);
  const sourcePathRaw = clean(input.source_path, 160);
  const sourcePath = sourcePathRaw.startsWith("/") ? sourcePathRaw : "/paths/marketing/";
  const submittedAt = clean(input.submitted_at, 40);
  const attribution = getAttribution(input.attribution);

  const invalid =
    !isRequestId(requestId) ||
    requestId !== headerRequestId ||
    !allowedInterests.has(interest) ||
    input.consent !== true ||
    name.length < 2 ||
    !isEmail(email) ||
    company.length < 2 ||
    cityCountry.length < 2 ||
    (!whatsapp && !telegram) ||
    websiteOrSocial.length < 2 ||
    !allowedLanguages.has(preferredLanguage) ||
    preferredContactTime.length < 2 ||
    services.length < 1 ||
    message.length < 10;

  if (invalid) return json(allowedOrigin, 400, { success: false, error: "invalid_lead" });

  const requestKey = `business-lead:id:${await hash(requestId)}`;
  if (await env.LEAD_LIMITS.get(requestKey)) {
    return json(allowedOrigin, 200, { success: true, duplicate: true, request_id: requestId });
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
    `WhatsApp: ${whatsapp || "not provided"}`,
    `Telegram: ${telegram || "not provided"}`,
    `Website / social: ${websiteOrSocial}`,
    `Preferred language: ${preferredLanguage}`,
    `Best time to contact: ${preferredContactTime}`,
    `Services: ${services.join(", ")}`,
    "Goal:",
    message,
    ...(attributionLines.length ? ["", "Attribution:", ...attributionLines] : []),
    "",
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
      if ([429, 503, 504].includes(serviceResponse.status)) {
        return json(allowedOrigin, 503, { success: false, error: "delivery_temporarily_unavailable" });
      }
      return json(allowedOrigin, 502, { success: false, error: "delivery_failed" });
    }

    await Promise.all([
      env.LEAD_LIMITS.put(requestKey, "delivered", { expirationTtl: 24 * 60 * 60 }),
      env.LEAD_LIMITS.put(rateKey, String(currentRate + 1), { expirationTtl: RATE_WINDOW_SECONDS }),
    ]);

    return json(allowedOrigin, 200, { success: true, request_id: requestId });
  } catch (error) {
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
