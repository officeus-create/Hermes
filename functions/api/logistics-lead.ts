type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type EmailSender = {
  send(message: {
    to: string;
    from: string;
    subject: string;
    text: string;
    replyTo?: string;
  }): Promise<{ messageId: string }>;
};

type Env = {
  LEAD_EMAIL?: EmailSender;
  LEAD_LIMITS?: KvNamespace;
  SALES_DESTINATION?: string;
  SALES_SENDER?: string;
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
};

const DEFAULT_ORIGIN = "https://hermeslogisticsus.com";
const DEFAULT_DESTINATION = "officeus@hermeslogisticsus.com";
const DEFAULT_SENDER = "website@hermeslogisticsus.com";
const MAX_BODY_BYTES = 16_000;
const MAX_EMAIL_BODY = 8_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 60 * 60;

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
  return "";
};

const extractReplyTo = (body: string) => {
  const match = body.match(/^Email:\s*([^\s]+@[^\s]+)$/im);
  return match && isEmail(match[1]) ? match[1].toLowerCase() : "";
};

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
  if (!env.LEAD_EMAIL || !env.LEAD_LIMITS) {
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
  const leadType = clean(input.lead_type, 40);
  const salesTag = clean(input.sales_tag, 80).toUpperCase();
  const emailBody = clean(input.email_body, MAX_EMAIL_BODY);
  const pagePath = clean(input.page_path, 160);
  const submittedAt = clean(input.submitted_at, 40);
  const subject = leadSubject(leadType, salesTag);

  if (!isRequestId(requestId) || requestId !== headerRequestId || !subject || emailBody.length < 80) {
    return json(allowedOrigin, 400, { success: false, error: "invalid_lead" });
  }
  if (!emailBody.includes("Phone:") || !emailBody.includes("Email:")) {
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
    "Delivery: securely received by the Hermes Logistics Sales website endpoint.",
  );
  const messageText = [
    deliveredBody,
    "",
    "Server delivery record",
    `Request ID: ${requestId}`,
    `Submitted at: ${submittedAt || "not provided"}`,
    `Page: ${pagePath || "/load-board/"}`,
  ].join("\n");

  try {
    const delivery = await env.LEAD_EMAIL.send({
      to: env.SALES_DESTINATION || DEFAULT_DESTINATION,
      from: env.SALES_SENDER || DEFAULT_SENDER,
      subject,
      text: messageText,
      ...(replyTo ? { replyTo } : {}),
    });
    await Promise.all([
      env.LEAD_LIMITS.put(requestKey, delivery.messageId, { expirationTtl: 24 * 60 * 60 }),
      env.LEAD_LIMITS.put(rateKey, String(currentRate + 1), { expirationTtl: RATE_WINDOW_SECONDS }),
    ]);
    return json(allowedOrigin, 200, { success: true, request_id: requestId });
  } catch {
    return json(allowedOrigin, 502, { success: false, error: "delivery_failed" });
  }
}

export async function onRequest(context: Context) {
  if (context.request.method === "OPTIONS") return onRequestOptions(context);
  if (context.request.method === "POST") return onRequestPost(context);
  const allowedOrigin = context.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  return json(allowedOrigin, 405, { success: false, error: "method_not_allowed" });
}
