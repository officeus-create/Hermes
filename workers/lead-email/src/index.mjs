const MAX_LEAD_BODY_BYTES = 16_000;
const MAX_CONTRACT_BODY_BYTES = 4_500_000;
const MAX_MESSAGE_TEXT = 20_000;
const MAX_ATTACHMENT_BYTES = 2_200_000;
const MAX_TOTAL_ATTACHMENT_BYTES = 3_500_000;
const MAX_SEND_ATTEMPTS = 3;
const RETIRED_INTERNAL_RECIPIENTS = new Set(["freight_301@hermeslogisticsus.com"]);
const DEFAULT_CONTRACT_INTERNAL_RECIPIENTS = ["officeus@hermeslogisticsus.com"];
const DEFAULT_CAR_HAULING_INTERNAL_RECIPIENTS = ["dispatchtruck107@gmail.com", "volkogon.v@gmail.com"];
const CAR_HAULING_SALES_SUBJECT = "[HERMES SALES] [CAR HAULING] [CARRIER]";
const CAR_HAULING_TEST_SUBJECT = "[HERMES TEST] [CAR HAULING] [CARRIER]";
const GMAIL_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_ENDPOINT = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const GMAIL_REQUEST_TIMEOUT_MS = 8_000;
const CAR_HAULING_TELEGRAM_TIME_ZONE = "America/Chicago";
const CAR_HAULING_TELEGRAM_START_MINUTE = 9 * 60;
const CAR_HAULING_TELEGRAM_END_MINUTE = 17 * 60 + 45;
const CAR_HAULING_OUTBOX_RETENTION_MS = 7 * 24 * 60 * 60 * 1_000;
const CAR_HAULING_DELIVERY_LEASE_MS = 60 * 1_000;
const encoder = new TextEncoder();

const json = (status, payload) =>
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

const clean = (value, max) =>
  typeof value === "string"
    ? value.replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max)
    : "";

const cleanHeader = (value, max) => clean(value, max).replace(/[\r\n]+/g, " ");
const isRequestId = (value) => /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,79}$/.test(value);
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isAllowedSubject = (value) =>
  value === "[HERMES SALES] [LOAD BOARD ACCESS] [CARRIER]" ||
  value === CAR_HAULING_SALES_SUBJECT ||
  value === CAR_HAULING_TEST_SUBJECT ||
  value === "[HERMES CONTRACT] [CARRIER ONBOARDING]" ||
  /^\[HERMES SALES\] \[POSTED LOAD\] \[(CUSTOMER|SHIPPER|DEALER|BROKER|OTHER BUSINESS)\]$/.test(value) ||
  /^\[HERMES INQUIRY\] \[(LOGISTICS|MARKETING|ACADEMY|IT DEVELOPMENT|GENERAL)\]$/.test(value);
const isAccountSubject = (value) => value === "[HERMES ACCOUNT] [PASSWORD RESET]";

const constantTimeEqual = async (left, right) => {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const nativeTimingSafeEqual = crypto.subtle.timingSafeEqual;

  if (typeof nativeTimingSafeEqual === "function") {
    const lengthsMatch = leftBytes.byteLength === rightBytes.byteLength;
    return lengthsMatch
      ? nativeTimingSafeEqual.call(crypto.subtle, leftBytes, rightBytes)
      : !nativeTimingSafeEqual.call(crypto.subtle, leftBytes, leftBytes);
  }

  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", leftBytes),
    crypto.subtle.digest("SHA-256", rightBytes),
  ]);
  const leftDigest = new Uint8Array(leftHash);
  const rightDigest = new Uint8Array(rightHash);
  let difference = leftBytes.byteLength ^ rightBytes.byteLength;
  for (let index = 0; index < leftDigest.length; index += 1) {
    difference |= leftDigest[index] ^ rightDigest[index];
  }
  return difference === 0;
};

const classifyProviderError = (error) => {
  const status = Number(error?.status || error?.statusCode || 0);
  const code = clean(error?.code, 80).toLowerCase();
  const name = clean(error?.name, 80).toLowerCase();
  const message = clean(error?.message, 240).toLowerCase();
  const fingerprint = `${code} ${name} ${message}`;

  if (status === 429 || /rate|quota|daily limit|too many/.test(fingerprint)) {
    return { status: 429, error: "provider_throttled" };
  }
  if (/sender|recipient|destination|verified|verification|restrict|permission|forbidden/.test(fingerprint)) {
    return { status: 503, error: "provider_configuration" };
  }
  if (status >= 500 || /timeout|temporary|unavailable|network|service/.test(fingerprint)) {
    return { status: 503, error: "provider_unavailable" };
  }
  return { status: 502, error: "provider_rejected" };
};

const base64ByteLength = (value) => {
  const normalized = value.replace(/\s+/g, "");
  const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor(normalized.length * 3 / 4) - padding);
};

const bytesToBase64 = (bytes) => {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunk, bytes.length)));
  }
  return btoa(binary);
};

const stringToBase64 = (value) => bytesToBase64(encoder.encode(value));
const wrapBase64 = (value) => value.replace(/\s+/g, "").replace(/.{1,76}/g, "$&\r\n").trimEnd();

const normalizeAttachments = (value) => {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3) return null;
  const attachments = [];
  let totalBytes = 0;
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const filename = cleanHeader(raw.filename, 120).replace(/[^a-zA-Z0-9._-]+/g, "_");
    const contentType = cleanHeader(raw.content_type, 80).toLowerCase();
    const contentBase64 = clean(raw.content_base64, 3_200_000).replace(/\s+/g, "");
    if (!filename.toLowerCase().endsWith(".pdf") || contentType !== "application/pdf" || !/^[A-Za-z0-9+/]+={0,2}$/.test(contentBase64)) return null;
    const byteLength = base64ByteLength(contentBase64);
    if (byteLength < 100 || byteLength > MAX_ATTACHMENT_BYTES) return null;
    totalBytes += byteLength;
    attachments.push({ filename, contentType, contentBase64, byteLength });
  }
  if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) return null;
  return attachments;
};

const parseRecipientList = (value) => [...new Set(
  clean(value, 1_200)
    .split(/[;,]/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => isEmail(item) && !RETIRED_INTERNAL_RECIPIENTS.has(item)),
)];

const parseInternalRecipients = (env) => {
  const configuredRecipients = parseRecipientList(env.CARRIER_CONTRACT_INTERNAL_RECIPIENTS);
  const fallbackRecipients = parseRecipientList(env.SALES_DESTINATION);
  const requiredRecipients = DEFAULT_CONTRACT_INTERNAL_RECIPIENTS.filter(
    (item) => isEmail(item) && !RETIRED_INTERNAL_RECIPIENTS.has(item),
  );

  return [...new Set([
    ...requiredRecipients,
    ...configuredRecipients,
    ...fallbackRecipients,
  ])].slice(0, 8);
};

const parseCarHaulingRecipients = (env) => {
  const primary = cleanHeader(env.SALES_DESTINATION, 320).toLowerCase();
  const configuredRecipients = parseRecipientList(env.CAR_HAULING_INTERNAL_RECIPIENTS);
  return [...new Set([
    primary,
    ...DEFAULT_CAR_HAULING_INTERNAL_RECIPIENTS,
    ...configuredRecipients,
  ])]
    .filter((item) => isEmail(item) && !RETIRED_INTERNAL_RECIPIENTS.has(item))
    .slice(0, 8);
};

const buildRawMime = ({ from, to, subject, text, replyTo, attachments, requestId, deliveryKey = "delivery" }) => {
  const boundary = `hermes_${requestId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 48)}`;
  const deliverySuffix = String(deliveryKey).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "delivery";
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${requestId}.${deliverySuffix}@hermeslogisticsus.com>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
  ];
  const body = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrapBase64(stringToBase64(text)),
  ];
  for (const attachment of attachments) {
    body.push(
      `--${boundary}`,
      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      "",
      wrapBase64(attachment.contentBase64),
    );
  }
  body.push(`--${boundary}--`, "");
  return [...headers, ...body].join("\r\n");
};

const base64UrlEncode = (value) =>
  stringToBase64(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const gmailConfig = (env) => ({
  clientId: String(env.GMAIL_OAUTH_CLIENT_ID || "").trim(),
  clientSecret: String(env.GMAIL_OAUTH_CLIENT_SECRET || "").trim(),
  refreshToken: String(env.GMAIL_OAUTH_REFRESH_TOKEN || "").trim(),
});

const providerError = (message, status, code) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

const fetchWithTimeout = async (url, init, timeoutMs = GMAIL_REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw providerError("gmail provider timeout", 503, "E_PROVIDER_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const sendGmailApiMessage = async (env, message) => {
  const { clientId, clientSecret, refreshToken } = gmailConfig(env);
  if (!clientId || !clientSecret || !refreshToken) {
    throw providerError("gmail oauth permission configuration missing", 503, "E_PROVIDER_PERMISSION");
  }
  if (message.replyTo || message.attachments.length) {
    throw providerError("gmail account transport only accepts plain account messages", 503, "E_PROVIDER_CONFIGURATION");
  }

  const tokenResponse = await fetchWithTimeout(GMAIL_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });
  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  const accessToken = typeof tokenPayload?.access_token === "string" ? tokenPayload.access_token.trim() : "";
  if (!tokenResponse.ok || !accessToken) {
    throw providerError("gmail oauth permission rejected", tokenResponse.status || 503, "E_PROVIDER_PERMISSION");
  }

  const raw = base64UrlEncode(buildRawMime(message));
  const sendResponse = await fetchWithTimeout(GMAIL_SEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  const sendPayload = await sendResponse.json().catch(() => ({}));
  if (!sendResponse.ok || typeof sendPayload?.id !== "string") {
    const code = sendResponse.status === 429 ? "E_PROVIDER_RATE" :
      sendResponse.status >= 500 ? "E_PROVIDER_UNAVAILABLE" : "E_PROVIDER_PERMISSION";
    throw providerError("gmail send permission/provider rejected", sendResponse.status || 502, code);
  }

  return { messageId: cleanHeader(sendPayload.id, 160) || null };
};

const sendMessage = async (env, message) => {
  if (env.EMAIL_TRANSPORT_MODE === "cloudflare_email_message") {
    const { EmailMessage } = await import("cloudflare:email");
    const raw = buildRawMime(message);
    return env.EMAIL.send(new EmailMessage(message.from, message.to, raw));
  }

  return env.EMAIL.send({
    to: message.to,
    from: message.from,
    subject: message.subject,
    text: message.text,
    ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    ...(message.attachments.length ? {
      attachments: message.attachments.map((attachment) => ({
        filename: attachment.filename,
        type: attachment.contentType,
        content: attachment.contentBase64,
        disposition: "attachment",
      })),
    } : {}),
  });
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const sendSafely = async (env, message, transport = sendMessage) => {
  const configuredDelay = Number(env.EMAIL_RETRY_DELAY_MS ?? 250);
  const retryDelay = Number.isFinite(configuredDelay) ? Math.max(0, Math.min(configuredDelay, 1_000)) : 250;
  let lastMapped = { status: 502, error: "provider_rejected" };
  let lastAttempt = 0;

  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
    lastAttempt = attempt;
    try {
      const result = await transport(env, message);
      return {
        ok: true,
        attempts: attempt,
        providerMessageId: cleanHeader(result?.messageId, 160) || null,
      };
    } catch (error) {
      lastMapped = classifyProviderError(error);
      const retryable = ["provider_throttled", "provider_unavailable"].includes(lastMapped.error);
      if (!retryable || attempt === MAX_SEND_ATTEMPTS) break;
      await wait(retryDelay * attempt);
    }
  }

  return { ok: false, attempts: lastAttempt, mapped: lastMapped };
};

const carHaulingTelegramClock = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CAR_HAULING_TELEGRAM_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    weekday: values.weekday || "",
    minuteOfDay: Number(values.hour) * 60 + Number(values.minute),
  };
};

const isCarHaulingTelegramWorkHours = (now = new Date()) => {
  const { weekday, minuteOfDay } = carHaulingTelegramClock(now);
  return ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday)
    && minuteOfDay >= CAR_HAULING_TELEGRAM_START_MINUTE
    && minuteOfDay <= CAR_HAULING_TELEGRAM_END_MINUTE;
};

const sendCarHaulingSalesTelegram = async (env, text, requestId, now = new Date()) => {
  const botToken = String(env.CAR_HAULING_TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = String(env.CAR_HAULING_TELEGRAM_SALES_CHAT_ID || "").trim();
  if (!botToken || !chatId) return { ok: false, status: "not_configured" };
  if (!isCarHaulingTelegramWorkHours(now)) return { ok: false, status: "outside_working_hours" };

  const sourcePage = clean(text.match(/^Page:\s*(.+)$/m)?.[1], 160) || "unknown";
  const telegramText = [
    CAR_HAULING_SALES_SUBJECT,
    `Request ID: ${requestId}`,
    `Source page: ${sourcePage}`,
    "",
    text,
  ].join("\n").slice(0, 3_900);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !payload?.result?.message_id) {
      return { ok: false, status: `http_${response.status}` };
    }
    return { ok: true, status: "delivered", providerMessageId: String(payload.result.message_id) };
  } catch (error) {
    return { ok: false, status: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "network_error" };
  } finally {
    clearTimeout(timeout);
  }
};


const sha256Hex = async (value) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const durablePayloadFingerprint = (payload) => sha256Hex(JSON.stringify([
  payload.requestId,
  payload.subject,
  payload.text,
  payload.replyTo,
  payload.sender,
  payload.recipients,
]));

const nextCarHaulingTelegramWorkTime = (now = new Date()) => {
  const candidate = new Date(now.getTime() + 15 * 60 * 1_000);
  candidate.setUTCSeconds(0, 0);
  for (let offset = 0; offset < 8 * 24 * 4; offset += 1) {
    if (isCarHaulingTelegramWorkHours(candidate)) return candidate.getTime();
    candidate.setTime(candidate.getTime() + 15 * 60 * 1_000);
  }
  return now.getTime() + 60 * 60 * 1_000;
};

const durableRetryDelay = (attempts) =>
  Math.min(6 * 60 * 60 * 1_000, 60 * 1_000 * (2 ** Math.min(Math.max(attempts - 1, 0), 8)));

const createDurableDeliveryRecord = ({ requestId, payloadHash, subject, text, replyTo, sender, recipients }, now) => ({
  version: 1,
  requestId,
  payloadHash,
  subject,
  text,
  replyTo,
  sender,
  createdAt: now,
  updatedAt: now,
  leaseUntil: 0,
  completedAt: null,
  purgeAt: null,
  destinations: [
    ...recipients.map((recipient, index) => ({
      key: index === 0 ? "email:primary" : `email:secondary:${index}`,
      channel: "email",
      role: index === 0 ? "primary" : "secondary",
      recipient,
      status: "pending",
      attempts: 0,
      lastAttemptAt: null,
      deliveredAt: null,
      providerMessageId: null,
      lastError: null,
      nextAttemptAt: now,
    })),
    {
      key: "telegram:sales",
      channel: "telegram",
      role: "sales",
      status: "pending",
      attempts: 0,
      lastAttemptAt: null,
      deliveredAt: null,
      providerMessageId: null,
      lastError: null,
      nextAttemptAt: now,
    },
  ],
});

const durableDeliverySummary = (record, { accepted = false, deduplicated = false } = {}) => {
  const destinations = record.destinations.map((destination) => ({
    key: destination.key,
    channel: destination.channel,
    role: destination.role,
    ...(destination.recipient ? { recipient: destination.recipient } : {}),
    status: destination.status,
    attempts: destination.attempts,
    last_attempt_at: destination.lastAttemptAt ? new Date(destination.lastAttemptAt).toISOString() : null,
    delivered_at: destination.deliveredAt ? new Date(destination.deliveredAt).toISOString() : null,
    provider_message_id: destination.providerMessageId,
    error: destination.lastError,
    next_attempt_at: destination.status === "pending" && destination.nextAttemptAt
      ? new Date(destination.nextAttemptAt).toISOString()
      : null,
  }));
  const primary = destinations.find((destination) => destination.role === "primary");
  return {
    ok: accepted || primary?.status === "delivered",
    request_id: record.requestId,
    durable: true,
    accepted,
    deduplicated,
    complete: destinations.every((destination) => destination.status === "delivered"),
    recipient_count: destinations.filter((destination) => destination.channel === "email" && destination.status === "delivered").length,
    delivery_ledger: {
      primary: primary?.status || "pending",
      destinations,
      updated_at: new Date(record.updatedAt).toISOString(),
    },
  };
};

class CarHaulingDeliveryCoordinatorCore {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.storage = ctx.storage;
    this.env = env;
  }

  async claim(payload, payloadHash, now) {
    return this.storage.transaction(async (transaction) => {
      let record = await transaction.get("delivery");
      if (record && record.payloadHash !== payloadHash) return { conflict: true, record };
      if (!record) record = createDurableDeliveryRecord({ ...payload, payloadHash }, now);
      const hasReadyDestination = record.destinations.some(
        (destination) => destination.status === "pending" && destination.nextAttemptAt <= now,
      );
      if (record.completedAt || record.leaseUntil > now || !hasReadyDestination) {
        return { conflict: false, claimed: false, record };
      }
      record.leaseUntil = now + CAR_HAULING_DELIVERY_LEASE_MS;
      record.updatedAt = now;
      await transaction.put("delivery", record);
      return { conflict: false, claimed: true, record };
    });
  }

  async persistDestination(key, patch, now) {
    return this.storage.transaction(async (transaction) => {
      const record = await transaction.get("delivery");
      if (!record) return null;
      const destination = record.destinations.find((item) => item.key === key);
      if (!destination || destination.status === "delivered") return record;
      Object.assign(destination, patch);
      record.leaseUntil = now + CAR_HAULING_DELIVERY_LEASE_MS;
      record.updatedAt = now;
      await transaction.put("delivery", record);
      return record;
    });
  }

  async process(record, now = Date.now()) {
    for (const destination of record.destinations) {
      if (destination.status === "delivered" || destination.nextAttemptAt > now) continue;
      const attemptedAt = Date.now();
      if (destination.channel === "email") {
        const result = await sendSafely(this.env, {
          to: destination.recipient,
          from: record.sender,
          subject: record.subject,
          text: record.text,
          replyTo: record.replyTo,
          attachments: [],
          requestId: record.requestId,
          deliveryKey: destination.key,
        });
        if (result.ok) {
          record = await this.persistDestination(destination.key, {
            status: "delivered",
            attempts: destination.attempts + result.attempts,
            lastAttemptAt: attemptedAt,
            deliveredAt: Date.now(),
            providerMessageId: result.providerMessageId,
            lastError: null,
            nextAttemptAt: null,
          }, Date.now());
        } else {
          const attempts = destination.attempts + result.attempts;
          record = await this.persistDestination(destination.key, {
            status: "pending",
            attempts,
            lastAttemptAt: attemptedAt,
            lastError: result.mapped.error,
            nextAttemptAt: Date.now() + durableRetryDelay(attempts),
          }, Date.now());
        }
      } else {
        const result = await sendCarHaulingSalesTelegram(this.env, record.text, record.requestId, new Date(attemptedAt));
        const attempts = destination.attempts + 1;
        if (result.ok) {
          record = await this.persistDestination(destination.key, {
            status: "delivered",
            attempts,
            lastAttemptAt: attemptedAt,
            deliveredAt: Date.now(),
            providerMessageId: result.providerMessageId || null,
            lastError: null,
            nextAttemptAt: null,
          }, Date.now());
        } else {
          const nextAttemptAt = result.status === "outside_working_hours"
            ? nextCarHaulingTelegramWorkTime(new Date(attemptedAt))
            : Date.now() + durableRetryDelay(attempts);
          record = await this.persistDestination(destination.key, {
            status: "pending",
            attempts,
            lastAttemptAt: attemptedAt,
            lastError: result.status,
            nextAttemptAt,
          }, Date.now());
        }
      }
    }
    return record;
  }

  async finalize(record) {
    const now = Date.now();
    record = await this.storage.transaction(async (transaction) => {
      const current = await transaction.get("delivery");
      if (!current) return null;
      current.leaseUntil = 0;
      current.updatedAt = now;
      if (current.destinations.every((destination) => destination.status === "delivered")) {
        current.completedAt ||= now;
        current.purgeAt ||= now + CAR_HAULING_OUTBOX_RETENTION_MS;
        current.text = "";
        current.replyTo = "";
      }
      await transaction.put("delivery", current);
      return current;
    });
    if (!record) return null;

    const pendingTimes = record.destinations
      .filter((destination) => destination.status === "pending")
      .map((destination) => destination.nextAttemptAt || now + 60 * 1_000);
    const nextAlarm = pendingTimes.length ? Math.min(...pendingTimes) : record.purgeAt;
    if (nextAlarm) await this.storage.setAlarm(Math.max(nextAlarm, now + 1_000));
    return record;
  }

  async run(record) {
    try {
      return await this.finalize(await this.process(record));
    } catch (error) {
      console.error(JSON.stringify({
        event: "car_hauling_durable_delivery_failed",
        request_id: record.requestId,
        message: clean(error?.message, 200),
      }));
      const current = await this.storage.get("delivery");
      if (current) {
        current.leaseUntil = 0;
        current.updatedAt = Date.now();
        await this.storage.put("delivery", current);
        await this.storage.setAlarm(Date.now() + 15 * 60 * 1_000);
      }
      return current;
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/internal/car-hauling-delivery") {
      return json(404, { ok: false, error: "not_found" });
    }

    const input = await request.json().catch(() => null);
    const requestId = clean(input?.request_id, 80);
    const subject = cleanHeader(input?.subject, 160);
    const text = clean(input?.text, MAX_MESSAGE_TEXT);
    const replyTo = cleanHeader(input?.reply_to, 320).toLowerCase();
    const sender = cleanHeader(this.env.SALES_SENDER, 320);
    const recipients = parseCarHaulingRecipients(this.env);
    if (!isRequestId(requestId) || subject !== CAR_HAULING_SALES_SUBJECT || text.length < 80 ||
        (replyTo && !isEmail(replyTo)) || !isEmail(sender) || recipients.length < 1) {
      return json(400, { ok: false, error: "invalid_message" });
    }

    const payload = { requestId, subject, text, replyTo, sender, recipients };
    const payloadHash = await durablePayloadFingerprint(payload);
    const claim = await this.claim(payload, payloadHash, Date.now());
    if (claim.conflict) return json(409, { ok: false, error: "request_id_payload_conflict" });
    if (!claim.claimed) {
      const primary = claim.record.destinations.find((destination) => destination.role === "primary");
      const primaryDelivered = primary?.status === "delivered";
      return json(
        primaryDelivered ? 202 : 503,
        durableDeliverySummary(claim.record, { accepted: primaryDelivered, deduplicated: true }),
      );
    }

    const record = await this.run(claim.record);
    if (!record) return json(503, { ok: false, error: "delivery_state_unavailable" });
    const summary = durableDeliverySummary(record);
    const primary = record.destinations.find((destination) => destination.role === "primary");
    return json(primary?.status === "delivered" ? 202 : 503, summary);
  }

  async alarm() {
    const now = Date.now();
    const record = await this.storage.get("delivery");
    if (!record) return;
    if (record.purgeAt && record.purgeAt <= now) {
      await this.storage.delete("delivery");
      return;
    }
    if (record.completedAt) {
      await this.storage.setAlarm(record.purgeAt);
      return;
    }
    const claim = await this.storage.transaction(async (transaction) => {
      const current = await transaction.get("delivery");
      if (!current || current.completedAt || current.leaseUntil > now) return null;
      current.leaseUntil = now + CAR_HAULING_DELIVERY_LEASE_MS;
      current.updatedAt = now;
      await transaction.put("delivery", current);
      return current;
    });
    if (claim) {
      await this.run(claim);
      return;
    }
    const current = await this.storage.get("delivery");
    if (current && !current.completedAt) {
      const pendingTimes = current.destinations
        .filter((destination) => destination.status === "pending")
        .map((destination) => destination.nextAttemptAt || now + 60 * 1_000);
      const nextAlarm = Math.max(current.leaseUntil || 0, Math.min(...pendingTimes), now + 1_000);
      await this.storage.setAlarm(nextAlarm);
    }
  }
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!["/v1/send", "/v1/send-contract", "/v1/send-account"].includes(url.pathname)) return json(404, { ok: false, error: "not_found" });
    if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

    const isAccountPath = url.pathname === "/v1/send-account";
    const accountTransportMode = clean(env.ACCOUNT_EMAIL_TRANSPORT, 40).toLowerCase() || "cloudflare";
    if (isAccountPath && !["cloudflare", "gmail_api"].includes(accountTransportMode)) {
      return json(503, { ok: false, error: "service_not_configured" });
    }
    const accountUsesGmail = isAccountPath && accountTransportMode === "gmail_api";
    if (!env.LEAD_SERVICE_TOKEN || !env.SALES_SENDER || (!accountUsesGmail && !env.EMAIL)) {
      return json(503, { ok: false, error: "service_not_configured" });
    }

    const authorization = request.headers.get("Authorization") || "";
    const authorized = await constantTimeEqual(authorization, `Bearer ${env.LEAD_SERVICE_TOKEN}`);
    if (!authorized) return json(401, { ok: false, error: "unauthorized" });

    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
      return json(415, { ok: false, error: "content_type_required" });
    }

    const isContractPath = url.pathname === "/v1/send-contract";
    const maxBodyBytes = isContractPath ? MAX_CONTRACT_BODY_BYTES : MAX_LEAD_BODY_BYTES;
    const contentLength = Number(request.headers.get("Content-Length") || "0");
    if (contentLength > maxBodyBytes) return json(413, { ok: false, error: "request_too_large" });
    const raw = await request.text();
    if (encoder.encode(raw).byteLength > maxBodyBytes) return json(413, { ok: false, error: "request_too_large" });

    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: "invalid_json" });
    }

    const requestId = clean(input?.request_id, 80);
    const subject = cleanHeader(input?.subject, 160);
    const text = clean(input?.text, MAX_MESSAGE_TEXT);
    const replyTo = cleanHeader(input?.reply_to, 320).toLowerCase();
    const subjectAllowed = isAccountPath ? isAccountSubject(subject) : isAllowedSubject(subject);

    if (!isRequestId(requestId) || !subjectAllowed || text.length < 80) {
      return json(400, { ok: false, error: "invalid_message" });
    }
    if (replyTo && !isEmail(replyTo)) return json(400, { ok: false, error: "invalid_reply_to" });

    if (isAccountPath) {
      const recipientEmail = cleanHeader(input?.recipient_email, 320).toLowerCase();
      if (!isEmail(recipientEmail) || replyTo) return json(400, { ok: false, error: "invalid_account_delivery" });
      const accountTransport = accountUsesGmail ? sendGmailApiMessage : sendMessage;
      const result = await sendSafely(env, {
        to: recipientEmail,
        from: cleanHeader(env.SALES_SENDER, 320),
        subject,
        text,
        replyTo: "",
        attachments: [],
        requestId,
      }, accountTransport);
      if (!result.ok) {
        console.error(JSON.stringify({ event: "account_delivery_failed", category: result.mapped.error, attempts: result.attempts, request_id: requestId }));
        return json(result.mapped.status, { ok: false, error: result.mapped.error });
      }
      return json(202, { ok: true, recipient_count: 1, attempts: result.attempts });
    }

    if (isContractPath) {
      if (subject !== "[HERMES CONTRACT] [CARRIER ONBOARDING]") return json(400, { ok: false, error: "invalid_contract_subject" });
      const carrierEmail = cleanHeader(input?.carrier_email, 320).toLowerCase();
      const attachments = normalizeAttachments(input?.attachments);
      const internalRecipients = parseInternalRecipients(env);
      if (!isEmail(carrierEmail) || !attachments || internalRecipients.length < 1) {
        return json(400, { ok: false, error: "invalid_contract_delivery" });
      }

      const sender = cleanHeader(env.SALES_SENDER, 320);
      const requiredRecipients = DEFAULT_CONTRACT_INTERNAL_RECIPIENTS.filter((recipient) => internalRecipients.includes(recipient));
      let requiredInternalAttempts = 0;
      for (const recipient of requiredRecipients) {
        const result = await sendSafely(env, { to: recipient, from: sender, subject, text, replyTo, attachments, requestId });
        requiredInternalAttempts += result.attempts;
        if (!result.ok) {
          console.error(JSON.stringify({ event: "contract_internal_delivery_failed", category: result.mapped.error, attempts: result.attempts, request_id: requestId }));
          return json(result.mapped.status, {
            ok: false,
            error: result.mapped.error,
            delivery_ledger: {
              required_internal: { status: "pending", count: requiredRecipients.length, attempts: requiredInternalAttempts },
              carrier: { status: "not_attempted", attempts: 0 },
              attempted_at: new Date().toISOString(),
            },
          });
        }
      }

      const optionalInternalRecipients = internalRecipients.filter((recipient) => !requiredRecipients.includes(recipient));
      let optionalInternalDelivered = 0;
      let optionalInternalAttempts = 0;
      for (const recipient of optionalInternalRecipients) {
        const result = await sendSafely(env, { to: recipient, from: sender, subject, text, replyTo, attachments, requestId });
        optionalInternalAttempts += result.attempts;
        if (result.ok) optionalInternalDelivered += 1;
        else console.error(JSON.stringify({ event: "contract_optional_internal_delivery_pending", category: result.mapped.error, attempts: result.attempts, request_id: requestId }));
      }

      let carrierDelivered = internalRecipients.includes(carrierEmail);
      let carrierAttempts = carrierDelivered ? 0 : null;
      let carrierError = null;
      if (!carrierDelivered) {
        const carrierResult = await sendSafely(env, { to: carrierEmail, from: sender, subject, text, replyTo, attachments, requestId });
        carrierAttempts = carrierResult.attempts;
        carrierDelivered = carrierResult.ok;
        if (!carrierResult.ok) {
          carrierError = carrierResult.mapped.error;
          console.error(JSON.stringify({ event: "contract_carrier_copy_pending", category: carrierError, attempts: carrierResult.attempts, request_id: requestId }));
        }
      }

      const attemptedAt = new Date().toISOString();
      return json(202, {
        ok: true,
        required_internal_delivered: requiredRecipients.length,
        optional_internal_delivered: optionalInternalDelivered,
        carrier_copy: carrierDelivered ? "delivered" : "download_only",
        delivery_ledger: {
          required_internal: { status: "delivered", count: requiredRecipients.length, attempts: requiredInternalAttempts },
          optional_internal: {
            status: optionalInternalDelivered === optionalInternalRecipients.length ? "delivered" : "partial",
            delivered: optionalInternalDelivered,
            count: optionalInternalRecipients.length,
            attempts: optionalInternalAttempts,
          },
          carrier: {
            status: carrierDelivered ? "delivered" : "download_only",
            attempts: carrierAttempts ?? 0,
            ...(carrierError ? { error: carrierError } : {}),
          },
          attempted_at: attemptedAt,
        },
      });
    }

    if (subject === CAR_HAULING_SALES_SUBJECT) {
      if (env.CAR_HAULING_DELIVERY_COORDINATOR) {
        const coordinator = env.CAR_HAULING_DELIVERY_COORDINATOR.getByName(requestId);
        return coordinator.fetch(new Request("https://car-hauling-delivery.internal/internal/car-hauling-delivery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: requestId,
            subject,
            text,
            reply_to: replyTo,
          }),
        }));
      }
      if (clean(env.CAR_HAULING_DURABLE_OUTBOX_REQUIRED, 10).toLowerCase() === "true") {
        return json(503, { ok: false, error: "durable_outbox_not_configured" });
      }

      const primary = cleanHeader(env.SALES_DESTINATION, 320).toLowerCase();
      const recipients = parseCarHaulingRecipients(env);
      if (!isEmail(primary) || !recipients.includes(primary)) {
        return json(503, { ok: false, error: "service_not_configured" });
      }

      const sender = cleanHeader(env.SALES_SENDER, 320);
      const primaryResult = await sendSafely(env, {
        to: primary, from: sender, subject, text, replyTo, attachments: [], requestId,
      });
      if (!primaryResult.ok) {
        console.error(JSON.stringify({ event: "car_hauling_primary_delivery_failed", category: primaryResult.mapped.error, attempts: primaryResult.attempts, request_id: requestId }));
        return json(primaryResult.mapped.status, { ok: false, error: primaryResult.mapped.error });
      }

      let secondaryDelivered = 0;
      let secondaryAttempts = 0;
      const secondaryRecipients = recipients.filter((recipient) => recipient !== primary);
      for (const recipient of secondaryRecipients) {
        const result = await sendSafely(env, {
          to: recipient, from: sender, subject, text, replyTo, attachments: [], requestId,
        });
        secondaryAttempts += result.attempts;
        if (result.ok) secondaryDelivered += 1;
        else console.error(JSON.stringify({ event: "car_hauling_secondary_delivery_pending", category: result.mapped.error, attempts: result.attempts, request_id: requestId }));
      }

      const telegram = await sendCarHaulingSalesTelegram(env, text, requestId);
      if (!telegram.ok) {
        console.error(JSON.stringify({ event: "car_hauling_sales_telegram_pending", category: telegram.status, request_id: requestId }));
      }

      return json(202, {
        ok: true,
        recipient_count: 1 + secondaryDelivered,
        secondary_delivery: {
          status: secondaryDelivered === secondaryRecipients.length ? "delivered" : "partial",
          delivered: secondaryDelivered,
          count: secondaryRecipients.length,
          attempts: secondaryAttempts,
        },
        telegram: telegram.ok ? "delivered" : "pending",
      });
    }

    if (!env.SALES_DESTINATION || !isEmail(cleanHeader(env.SALES_DESTINATION, 320))) {
      return json(503, { ok: false, error: "service_not_configured" });
    }
    const message = {
      to: cleanHeader(env.SALES_DESTINATION, 320).toLowerCase(),
      from: cleanHeader(env.SALES_SENDER, 320),
      subject,
      text,
      replyTo,
      attachments: [],
      requestId,
    };
    try {
      await sendMessage(env, message);
      return json(202, { ok: true, recipient_count: 1 });
    } catch (error) {
      const mapped = classifyProviderError(error);
      console.error(JSON.stringify({ event: "lead_delivery_failed", category: mapped.error }));
      return json(mapped.status, { ok: false, error: mapped.error });
    }
  },
};

export { buildRawMime, CarHaulingDeliveryCoordinatorCore, carHaulingTelegramClock, classifyProviderError, constantTimeEqual, durableDeliverySummary, isCarHaulingTelegramWorkHours, normalizeAttachments, parseCarHaulingRecipients, parseInternalRecipients, sendCarHaulingSalesTelegram, sendMessage };
export default worker;
