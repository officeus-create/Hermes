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

type LeadInput = {
  request_id?: unknown;
  lead_type?: unknown;
  sales_tag?: unknown;
  email_body?: unknown;
  page_path?: unknown;
  submitted_at?: unknown;
  source_path?: unknown;
  name?: unknown;
  email?: unknown;
  interest?: unknown;
  message?: unknown;
  consent?: unknown;
  direction_fields?: unknown;
};

type GeneralContact = {
  salesTag: string;
  emailBody: string;
  pagePath: string;
  submittedAt: string;
};

const DEFAULT_ORIGIN = "https://hermeslogisticsus.com";
const EMAIL_SERVICE_URL = "https://lead-email.internal/v1/send";
const LEGACY_CONTACT_SUBJECT = "[HERMES SALES] [POSTED LOAD] [OTHER BUSINESS]";
const MAX_BODY_BYTES = 16_000;
const MAX_EMAIL_BODY = 8_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 60 * 60;
const DELIVERY_TIMEOUT_MS = 8_000;

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

const leadSubject = (leadType: string, salesTag: string) => {
  if (leadType === "load_board_access" && salesTag === "LOAD BOARD ACCESS / CARRIER") {
    return "[HERMES SALES] [LOAD BOARD ACCESS] [CARRIER]";
  }
  const postedTags = new Set([
    "POSTED LOAD / CUSTOMER",
    "POSTED LOAD / SHIPPER",
    "POSTED LOAD / DEALER",
    "POSTED LOAD / BROKER",
    "POSTED LOAD / OTHER BUSINESS",
  ]);
  if (leadType === "posted_load" && postedTags.has(salesTag)) {
    return `[HERMES SALES] [POSTED LOAD] [${salesTag.replace("POSTED LOAD / ", "")}]`;
  }
  const contactTags = new Map([
    ["GENERAL CONTACT / LOGISTICS", "LOGISTICS"],
    ["GENERAL CONTACT / MARKETING", "MARKETING"],
    ["GENERAL CONTACT / ACADEMY", "ACADEMY"],
    ["GENERAL CONTACT / TECHNOLOGY", "IT DEVELOPMENT"],
    ["GENERAL CONTACT / GENERAL", "GENERAL"],
  ]);
  if (leadType === "general_contact" && contactTags.has(salesTag)) {
    return `[HERMES INQUIRY] [${contactTags.get(salesTag)}]`;
  }
  return "";
};

const contactSalesTag = (interest: string) => {
  const tags = new Map([
    ["Hermes Logistics", "GENERAL CONTACT / LOGISTICS"],
    ["ProgressoPro", "GENERAL CONTACT / MARKETING"],
    ["Hermes Business Academy", "GENERAL CONTACT / ACADEMY"],
    ["IT Development", "GENERAL CONTACT / TECHNOLOGY"],
    ["I am not sure yet", "GENERAL CONTACT / GENERAL"],
  ]);
  return tags.get(interest) || "";
};

const directionFieldLabels = new Map([
  ["phone", "Phone"],
  ["mc_dot", "MC/DOT"],
  ["equipment_type", "Equipment type"],
  ["fleet_size", "Fleet size"],
  ["preferred_lanes", "Preferred lanes/area"],
  ["service_needed", "Service needed"],
  ["platforms", "Platforms"],
  ["planning_horizon", "Planning horizon"],
  ["primary_goal", "Primary goal"],
  ["target_audience", "Target audience"],
  ["current_channels_results", "Current channels/results"],
  ["monthly_budget_range", "Monthly budget range"],
  ["target_role_or_skill", "Target role/skill"],
  ["current_level", "Current level"],
  ["weekly_learning_availability", "Weekly learning availability"],
  ["preferred_language", "Preferred language"],
  ["desired_start_period", "Desired start period"],
  ["system_or_workflow_needed", "System/workflow needed"],
  ["current_tools", "Current tools"],
  ["number_of_users", "Number of users"],
  ["integrations_needed", "Integrations needed"],
  ["data_sensitivity", "Data sensitivity"],
  ["timeline", "Timeline"],
  ["budget_range", "Budget range"],
]);

const contactDirectionLines = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const fields = (value as { fields?: unknown }).fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return [];

  const lines: string[] = [];
  for (const [key, label] of directionFieldLabels) {
    const raw = (fields as Record<string, unknown>)[key];
    const normalized = Array.isArray(raw)
      ? raw.map((item) => clean(item, 80)).filter(Boolean).slice(0, 12).join(", ")
      : clean(typeof raw === "number" ? String(raw) : raw, 240);
    if (normalized) lines.push(`${label}: ${normalized}`);
  }
  return lines.slice(0, 24);
};

const buildGeneralContact = (input: LeadInput): GeneralContact | null => {
  const name = clean(input.name, 100);
  const email = clean(input.email, 160).toLowerCase();
  const interest = clean(input.interest, 120);
  const message = clean(input.message, 2_000);
  const salesTag = contactSalesTag(interest);
  if (input.consent !== true || name.length < 2 || !isEmail(email) || message.length < 10 || !salesTag) return null;

  const sourcePath = clean(input.source_path, 160);
  const pagePath = sourcePath.startsWith("/") ? sourcePath : "/contacts/";
  const submittedAt = clean(input.submitted_at, 40);
  const directionLines = contactDirectionLines(input.direction_fields);
  const emailBody = [
    "Hermes Contact Request",
    "----------------------",
    `Direction: ${interest}`,
    `Name: ${name}`,
    `Email: ${email}`,
    "Message:",
    message,
    ...(directionLines.length ? ["", "Direction details:", ...directionLines] : []),
    "",
    `Submitted from: ${pagePath}`,
  ].join("\n").slice(0, MAX_EMAIL_BODY);

  return { salesTag, emailBody, pagePath, submittedAt };
};

const extractReplyTo = (body: string) => {
  const match = body.match(/^Email:\s*([^\s]+@[^\s]+)$/im);
  return match && isEmail(match[1]) ? match[1].toLowerCase() : "";
};

const deliveryUnavailable = (origin: string) =>
  json(origin, 503, { success: false, error: "delivery_temporarily_unavailable" });

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

  let input: LeadInput;
  try {
    input = JSON.parse(raw) as LeadInput;
  } catch {
    return json(allowedOrigin, 400, { success: false, error: "invalid_json" });
  }

  const headerRequestId = clean(request.headers.get("Idempotency-Key"), 80);
  const requestId = clean(input.request_id, 80);
  const generalContact = buildGeneralContact(input);
  const leadType = generalContact ? "general_contact" : clean(input.lead_type, 40);
  const salesTag = generalContact ? generalContact.salesTag : clean(input.sales_tag, 80).toUpperCase();
  const emailBody = generalContact ? generalContact.emailBody : clean(input.email_body, MAX_EMAIL_BODY);
  const pagePath = generalContact ? generalContact.pagePath : clean(input.page_path, 160);
  const submittedAt = generalContact ? generalContact.submittedAt : clean(input.submitted_at, 40);
  const subject = leadSubject(leadType, salesTag);

  if (!isRequestId(requestId) || requestId !== headerRequestId || !subject || emailBody.length < 80) {
    return json(allowedOrigin, 400, { success: false, error: "invalid_lead" });
  }
  const hasRequiredContact = generalContact
    ? emailBody.includes("Email:")
    : emailBody.includes("Phone:") && emailBody.includes("Email:");
  if (!hasRequiredContact) {
    return json(allowedOrigin, 400, { success: false, error: "contact_details_required" });
  }

  const requestKey = `lead:id:${await hash(requestId)}`;
  if (await env.LEAD_LIMITS.get(requestKey)) {
    return json(allowedOrigin, 200, { success: true, duplicate: true, request_id: requestId });
  }

  const clientAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `lead:rate:${await hash(clientAddress)}`;
  const currentRate = Number(await env.LEAD_LIMITS.get(rateKey) || "0");
  if (currentRate >= RATE_LIMIT) {
    return json(allowedOrigin, 429, { success: false, error: "rate_limit_exceeded" });
  }

  const replyTo = extractReplyTo(emailBody);
  const deliveredBody = emailBody.replace(
    /^Delivery:\s*preview only.*$/im,
    "Delivery: securely received by the Hermes website endpoint.",
  );
  const messageText = [
    deliveredBody,
    "",
    "Server delivery record",
    `Request ID: ${requestId}`,
    `Submitted at: ${submittedAt || "not provided"}`,
    `Page: ${pagePath || "/load-board/"}`,
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);
  const sendToEmailService = (deliverySubject: string) => env.LEAD_EMAIL_SERVICE!.fetch(EMAIL_SERVICE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.LEAD_SERVICE_TOKEN}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({
      request_id: requestId,
      subject: deliverySubject,
      text: messageText,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    signal: controller.signal,
  });

  try {
    let serviceResponse = await sendToEmailService(subject);

    if (generalContact && serviceResponse.status === 400) {
      const rejection = await serviceResponse.clone().json().catch(() => null) as { error?: unknown } | null;
      if (rejection?.error === "invalid_message") {
        serviceResponse = await sendToEmailService(LEGACY_CONTACT_SUBJECT);
      }
    }

    if (!serviceResponse.ok) {
      if (serviceResponse.status === 429 || serviceResponse.status === 503 || serviceResponse.status === 504) {
        return deliveryUnavailable(allowedOrigin);
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
      return deliveryUnavailable(allowedOrigin);
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
