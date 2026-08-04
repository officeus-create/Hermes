const MAX_BODY_BYTES = 16_000;
const MAX_MESSAGE_TEXT = 12_000;
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

const isRequestId = (value) => /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,79}$/.test(value);
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isAllowedSubject = (value) =>
  value === "[HERMES SALES] [LOAD BOARD ACCESS] [CARRIER]" ||
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

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/v1/send") return json(404, { ok: false, error: "not_found" });
    if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

    if (!env.LEAD_SERVICE_TOKEN || !env.EMAIL || !env.SALES_DESTINATION || !env.SALES_SENDER) {
      return json(503, { ok: false, error: "service_not_configured" });
    }

    const authorization = request.headers.get("Authorization") || "";
    const authorized = await constantTimeEqual(authorization, `Bearer ${env.LEAD_SERVICE_TOKEN}`);
    if (!authorized) return json(401, { ok: false, error: "unauthorized" });

    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
      return json(415, { ok: false, error: "content_type_required" });
    }

    const contentLength = Number(request.headers.get("Content-Length") || "0");
    if (contentLength > MAX_BODY_BYTES) return json(413, { ok: false, error: "request_too_large" });
    const raw = await request.text();
    if (encoder.encode(raw).byteLength > MAX_BODY_BYTES) {
      return json(413, { ok: false, error: "request_too_large" });
    }

    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: "invalid_json" });
    }

    const requestId = clean(input?.request_id, 80);
    const subject = clean(input?.subject, 160);
    const text = clean(input?.text, MAX_MESSAGE_TEXT);
    const replyTo = clean(input?.reply_to, 320).toLowerCase();

    if (!isRequestId(requestId) || !isAllowedSubject(subject) || text.length < 80) {
      return json(400, { ok: false, error: "invalid_message" });
    }
    if (replyTo && !isEmail(replyTo)) {
      return json(400, { ok: false, error: "invalid_reply_to" });
    }

    try {
      await env.EMAIL.send({
        to: env.SALES_DESTINATION,
        from: env.SALES_SENDER,
        subject,
        text,
        ...(replyTo ? { replyTo } : {}),
      });
      return json(202, { ok: true });
    } catch (error) {
      const mapped = classifyProviderError(error);
      console.error(JSON.stringify({ event: "lead_delivery_failed", category: mapped.error }));
      return json(mapped.status, { ok: false, error: mapped.error });
    }
  },
};

export { classifyProviderError, constantTimeEqual };
export default worker;
