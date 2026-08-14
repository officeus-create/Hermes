const MAX_LEAD_BODY_BYTES = 16_000;
const MAX_CONTRACT_BODY_BYTES = 4_500_000;
const MAX_MESSAGE_TEXT = 20_000;
const MAX_ATTACHMENT_BYTES = 2_200_000;
const MAX_TOTAL_ATTACHMENT_BYTES = 3_500_000;
const MAX_SEND_ATTEMPTS = 3;
const RETIRED_INTERNAL_RECIPIENTS = new Set(["freight_301@hermeslogisticsus.com"]);
const DEFAULT_CONTRACT_INTERNAL_RECIPIENTS = ["officeus@hermeslogisticsus.com"];
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
  value === "[HERMES CONTRACT] [CARRIER ONBOARDING]" ||
  /^\[HERMES SALES\] \[POSTED LOAD\] \[(CUSTOMER|SHIPPER|DEALER|BROKER|OTHER BUSINESS)\]$/.test(value) ||
  /^\[HERMES INQUIRY\] \[(LOGISTICS|MARKETING|ACADEMY|IT DEVELOPMENT|GENERAL)\]$/.test(value);

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

const buildRawMime = ({ from, to, subject, text, replyTo, attachments, requestId }) => {
  const boundary = `hermes_${requestId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 48)}`;
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${requestId}.${crypto.randomUUID()}@hermeslogisticsus.com>`,
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

const sendSafely = async (env, message) => {
  const configuredDelay = Number(env.EMAIL_RETRY_DELAY_MS ?? 250);
  const retryDelay = Number.isFinite(configuredDelay) ? Math.max(0, Math.min(configuredDelay, 1_000)) : 250;
  let lastMapped = { status: 502, error: "provider_rejected" };
  let lastAttempt = 0;

  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
    lastAttempt = attempt;
    try {
      const result = await sendMessage(env, message);
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

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!["/v1/send", "/v1/send-contract"].includes(url.pathname)) return json(404, { ok: false, error: "not_found" });
    if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

    if (!env.LEAD_SERVICE_TOKEN || !env.EMAIL || !env.SALES_SENDER) {
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

    if (!isRequestId(requestId) || !isAllowedSubject(subject) || text.length < 80) {
      return json(400, { ok: false, error: "invalid_message" });
    }
    if (replyTo && !isEmail(replyTo)) return json(400, { ok: false, error: "invalid_reply_to" });

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

export { buildRawMime, classifyProviderError, constantTimeEqual, normalizeAttachments, parseInternalRecipients, sendMessage };
export default worker;
