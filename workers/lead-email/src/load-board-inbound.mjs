const MAX_INBOUND_EMAIL_BYTES = 4_500_000;
const DEFAULT_TTL_HOURS = 12;
const MAX_TTL_HOURS = 72;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const VISIBILITY = new Set(["internal_only", "carrier_only", "public"]);
const REDISTRIBUTION = new Set(["internal_only", "carrier_only", "public"]);
const CAR_HAULING_PATTERNS = [
  /\bcar[ -]?haul(?:er|ing)?\b/i,
  /\bauto[ -]?transport(?:er|ation)?\b/i,
  /\bauto[ -]?hauling\b/i,
  /\bvehicle[ -]?(?:transport|shipping|hauling)\b/i,
  /\b(?:open|enclosed)[ -]?car[ -]?carrier\b/i,
  /\b\d+[ -]?car[ -]?(?:wedge|hauler)\b/i,
];

const clean = (value, max = 240) => String(value ?? "")
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
  .trim()
  .slice(0, max);

const normalizeEmail = (value) => clean(value, 320).toLowerCase();
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getHeader = (headers, name) => {
  if (!headers) return "";
  if (typeof headers.get === "function") return clean(headers.get(name), 4_000);
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (String(key).toLowerCase() === target) return clean(value, 4_000);
  }
  return "";
};

const mailboxFromHeader = (value) => {
  const normalized = clean(value, 500);
  const angle = normalized.match(/<([^<>\s]+@[^<>\s]+)>/);
  if (angle?.[1]) return normalizeEmail(angle[1]);
  const direct = normalized.match(/\b([^\s<>()",;:]+@[^\s<>()",;:]+)\b/);
  return normalizeEmail(direct?.[1] || normalized);
};

const safeIso = (value, fallback = new Date()) => {
  const date = value ? new Date(String(value)) : fallback;
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
};

const sha256 = async (value) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value)));
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
};

const parseHeaders = (block) => {
  const headers = {};
  const unfolded = String(block || "").replace(/\n[ \t]+/g, " ");
  for (const line of unfolded.split("\n")) {
    const colon = line.indexOf(":");
    if (colon < 1) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    headers[key] = headers[key] ? `${headers[key]}, ${value}` : value;
  }
  return headers;
};

const splitHeaderBody = (raw) => {
  const normalized = String(raw || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const index = normalized.indexOf("\n\n");
  if (index < 0) return { headers: {}, body: normalized };
  return {
    headers: parseHeaders(normalized.slice(0, index)),
    body: normalized.slice(index + 2),
  };
};

const decodeBase64Text = (value) => {
  try {
    const binary = atob(String(value || "").replace(/\s+/g, ""));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return decoder.decode(bytes);
  } catch {
    return "";
  }
};

const decodeQuotedPrintable = (value) => {
  const input = String(value || "").replace(/=\n/g, "");
  const bytes = [];
  for (let index = 0; index < input.length; index += 1) {
    if (input[index] === "=" && /^[0-9A-Fa-f]{2}$/.test(input.slice(index + 1, index + 3))) {
      bytes.push(Number.parseInt(input.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }
    const encoded = encoder.encode(input[index]);
    bytes.push(...encoded);
  }
  return decoder.decode(new Uint8Array(bytes));
};

const decodeTransfer = (body, encoding) => {
  const mode = clean(encoding, 40).toLowerCase();
  if (mode === "base64") return decodeBase64Text(body);
  if (mode === "quoted-printable") return decodeQuotedPrintable(body);
  return String(body || "");
};

const stripHtml = (value) => String(value || "")
  .replace(/<\s*br\s*\/?>/gi, "\n")
  .replace(/<\/(?:p|div|li|tr|h[1-6])\s*>/gi, "\n")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&#39;/gi, "'")
  .replace(/&quot;/gi, '"');

const boundaryFromContentType = (contentType) => {
  const match = String(contentType || "").match(/boundary\s*=\s*(?:"([^"]+)"|([^;\s]+))/i);
  return clean(match?.[1] || match?.[2], 180);
};

const extractMimeText = (rawEntity, depth = 0) => {
  if (depth > 5) return { plain: "", html: "" };
  const { headers, body } = splitHeaderBody(rawEntity);
  const contentType = clean(headers["content-type"] || "text/plain", 500).toLowerCase();
  const transferEncoding = headers["content-transfer-encoding"] || "";

  if (contentType.startsWith("multipart/")) {
    const boundary = boundaryFromContentType(contentType);
    if (!boundary) return { plain: "", html: "" };
    const marker = `--${boundary}`;
    const result = { plain: "", html: "" };
    for (const rawPart of body.split(marker)) {
      const part = rawPart.trim();
      if (!part || part === "--" || part.startsWith("--\n")) continue;
      const nested = extractMimeText(part.replace(/\n--$/, ""), depth + 1);
      if (!result.plain && nested.plain) result.plain = nested.plain;
      if (!result.html && nested.html) result.html = nested.html;
      if (result.plain) break;
    }
    return result;
  }

  if (contentType.startsWith("text/plain")) {
    return { plain: decodeTransfer(body, transferEncoding), html: "" };
  }
  if (contentType.startsWith("text/html")) {
    return { plain: "", html: stripHtml(decodeTransfer(body, transferEncoding)) };
  }
  return { plain: "", html: "" };
};

const readRawEmail = async (stream, maxBytes = MAX_INBOUND_EMAIL_BYTES) => {
  if (!stream || typeof stream.getReader !== "function") throw new Error("email_raw_unavailable");
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
      total += bytes.byteLength;
      if (total > maxBytes) throw new Error("email_too_large");
      chunks.push(bytes);
    }
  } finally {
    try { reader.releaseLock(); } catch {}
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return decoder.decode(merged);
};

const parseSourceConfig = (rawConfig) => {
  const raw = String(rawConfig || "").trim();
  if (!raw) return [];
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return []; }
  const items = Array.isArray(parsed)
    ? parsed
    : Object.entries(parsed || {}).map(([matchFrom, config]) => ({ match_from: matchFrom, ...(config || {}) }));

  return items.map((item) => {
    const matchFrom = normalizeEmail(item?.match_from || item?.email);
    const id = clean(item?.id, 160);
    const name = clean(item?.name, 160);
    const redistribution = REDISTRIBUTION.has(String(item?.redistribution_permission))
      ? String(item.redistribution_permission)
      : "internal_only";
    const requested = VISIBILITY.has(String(item?.requested_visibility))
      ? String(item.requested_visibility)
      : redistribution;
    const ttlRaw = Number(item?.ttl_hours ?? DEFAULT_TTL_HOURS);
    const ttlHours = Number.isFinite(ttlRaw) ? Math.max(1, Math.min(MAX_TTL_HOURS, ttlRaw)) : DEFAULT_TTL_HOURS;
    return {
      matchFrom,
      id,
      name,
      redistributionPermission: redistribution,
      contactRevealPermission: clean(item?.contact_reveal_permission || "hidden", 60) || "hidden",
      requestedVisibility: requested,
      ttlHours,
      requireAuthentication: item?.require_authentication !== false,
    };
  }).filter((item) => isEmail(item.matchFrom) && item.id && item.name);
};

const sourceAuthenticationPassed = (headers) => {
  const evidence = [
    getHeader(headers, "authentication-results"),
    getHeader(headers, "arc-authentication-results"),
    getHeader(headers, "received-spf"),
  ].join(" ");
  return /\b(?:spf|dkim|dmarc)=pass\b/i.test(evidence) || /\bpass\b/i.test(getHeader(headers, "received-spf"));
};

const containsCarHauling = (text) => CAR_HAULING_PATTERNS.some((pattern) => pattern.test(text));

const normalizeLocation = (value) => clean(value, 160)
  .replace(/\s+\d{5}(?:-\d{4})?\b.*$/, "")
  .replace(/\s+/g, " ")
  .trim();

const extractLabeledLocation = (text, labels) => {
  const locationPattern = "([A-Za-z][A-Za-z .'-]{1,70},\\s*[A-Z]{2})(?:\\s+\\d{5}(?:-\\d{4})?)?";
  for (const label of labels) {
    const regex = new RegExp(`(?:^|\\n)\\s*${label}\\s*[:\\-]\\s*${locationPattern}`, "im");
    const match = String(text || "").match(regex);
    if (match?.[1]) return normalizeLocation(match[1]);
  }
  return "";
};

const extractLane = (text) => {
  const pattern = /\b([A-Za-z][A-Za-z .'-]{1,70},\s*[A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?\s*(?:->|→|\bto\b)\s*([A-Za-z][A-Za-z .'-]{1,70},\s*[A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?/i;
  const match = String(text || "").match(pattern);
  return match ? [normalizeLocation(match[1]), normalizeLocation(match[2])] : ["", ""];
};

const normalizeEquipment = (text) => {
  const value = clean(text, 240).toLowerCase();
  if (!value) return "";
  if (containsCarHauling(value)) return "car_hauler";
  if (/\breefer\b|\brefrigerated\b|\btemperature[ -]?controlled\b/.test(value)) return "reefer";
  if (/\bstep[ -]?deck\b/.test(value)) return "step_deck";
  if (/\bflatbed\b/.test(value)) return "flatbed";
  if (/\bpower[ -]?only\b/.test(value)) return "power_only";
  if (/\bhot[ -]?shot\b|\bhotshot\b/.test(value)) return "hotshot";
  if (/\bbox[ -]?truck\b/.test(value)) return "box_truck";
  if (/\bsprinter\b/.test(value)) return "sprinter_van";
  if (/\bdry[ -]?van\b|\b53\s*(?:ft|foot|')?\s*van\b/.test(value)) return "dry_van";
  return "";
};

const extractEquipment = (text) => {
  const labeled = String(text || "").match(/(?:^|\n)\s*(?:equipment|trailer(?: type)?|truck(?: type)?)\s*[:\-]\s*([^\n]{2,120})/im);
  const fromLabel = normalizeEquipment(labeled?.[1] || "");
  return fromLabel || normalizeEquipment(text);
};

const extractRate = (text) => {
  const patterns = [
    /(?:^|\n)\s*(?:rate|all[ -]?in|offer|linehaul)\s*[:\-]?\s*\$\s*([\d,]+(?:\.\d{1,2})?)/im,
    /(?:^|\n)\s*(?:rate|all[ -]?in|offer|linehaul)\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:USD|dollars?)\b/im,
  ];
  for (const pattern of patterns) {
    const match = String(text || "").match(pattern);
    if (!match?.[1]) continue;
    const amount = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000) return amount;
  }
  return null;
};

const extractPickupWindow = (text) => {
  const match = String(text || "").match(/(?:^|\n)\s*(?:pickup(?: window| date| time)?|pick up|pu)\s*[:\-]\s*([^\n]{2,160})/im);
  return clean(match?.[1], 160);
};

const isCapacityMessage = (text) => /\b(?:truck|capacity)\s+available\b|\bavailable\s+(?:truck|capacity)\b|\bempty\s+(?:in|at)\b/i.test(text);

const parseFreightEmail = async ({ subject, body, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef }) => {
  const combined = `${clean(subject, 300)}\n${String(body || "").slice(0, 120_000)}`;
  const fingerprint = `sha256:${await sha256(combined.replace(/\s+/g, " ").trim().toLowerCase())}`;

  if (containsCarHauling(combined)) {
    return { quarantine: { source_message_id: sourceMessageId, fingerprint, reason: "car_hauling_hold", subject: clean(subject, 200), received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef } };
  }

  const [laneOrigin, laneDestination] = extractLane(combined);
  const origin = extractLabeledLocation(combined, ["origin", "from", "pickup(?: location)?", "pu"]) || laneOrigin;
  const destination = extractLabeledLocation(combined, ["destination", "to", "delivery(?: location)?", "drop(?: off)?"]) || laneDestination;
  const equipment = extractEquipment(combined);
  const recordType = isCapacityMessage(combined) ? "capacity" : "load";
  const missing = [];
  if (!origin) missing.push("origin");
  if (!equipment) missing.push("equipment");
  if (recordType === "load" && !destination) missing.push("destination");

  const expiresAt = new Date(new Date(receivedAt).getTime() + source.ttlHours * 60 * 60 * 1000).toISOString();
  if (new Date(expiresAt).getTime() <= new Date(observedAt).getTime()) {
    return { quarantine: { source_message_id: sourceMessageId, fingerprint, reason: "stale_email", subject: clean(subject, 200), received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef } };
  }
  if (missing.length) {
    return { quarantine: { source_message_id: sourceMessageId, fingerprint, reason: `missing_${missing.join("_")}`, subject: clean(subject, 200), received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef } };
  }

  const rateAmount = extractRate(combined);
  const pickupWindow = extractPickupWindow(combined);
  return {
    record: {
      source_message_id: sourceMessageId,
      fingerprint,
      record_type: recordType,
      equipment,
      origin,
      ...(destination ? { destination } : {}),
      ...(pickupWindow ? { pickup_window: pickupWindow } : {}),
      ...(rateAmount !== null ? { rate_amount: rateAmount, rate_currency: "USD" } : {}),
      received_at: receivedAt,
      observed_at: observedAt,
      expires_at: expiresAt,
      visibility: source.requestedVisibility,
      raw_evidence_ref: rawEvidenceRef,
    },
  };
};

const buildSourcePayload = (source, recipient) => ({
  id: source.id,
  provider: "cloudflare_email_routing",
  name: source.name,
  mailbox_email: normalizeEmail(recipient),
  credential_ref: `cloudflare_email_routing:${normalizeEmail(recipient)}`,
  redistribution_permission: source.redistributionPermission,
  contact_reveal_permission: source.contactRevealPermission,
  read_enabled: true,
  ingest_enabled: true,
});

const submitIntake = async (env, payload, fetchImpl = fetch) => {
  const endpoint = clean(env.LOADBOARD_INGEST_URL, 500);
  const token = String(env.LOADBOARD_INGEST_TOKEN || "");
  if (!endpoint || !/^https:\/\//i.test(endpoint) || !token) throw new Error("loadboard_bridge_not_configured");
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = new Error(`loadboard_intake_http_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response;
};

const logEvent = (event, details = {}) => {
  console.log(JSON.stringify({ event, ...details }));
};

const handleLoadBoardInboundEmail = async (message, env, _ctx, deps = {}) => {
  const recipient = normalizeEmail(message?.to);
  const configuredRecipient = normalizeEmail(env.LOADBOARD_EMAIL_RECIPIENT);
  if (!configuredRecipient || recipient !== configuredRecipient) return;

  const sources = parseSourceConfig(env.LOADBOARD_EMAIL_SOURCE_CONFIG);
  const headerFrom = mailboxFromHeader(getHeader(message?.headers, "from"));
  const envelopeFrom = normalizeEmail(message?.from);
  const source = sources.find((candidate) => candidate.matchFrom === headerFrom || candidate.matchFrom === envelopeFrom);
  if (!source) {
    logEvent("loadboard_email_source_rejected", { recipient, reason: "source_not_approved" });
    return;
  }

  const observedAt = new Date().toISOString();
  const receivedAt = safeIso(getHeader(message?.headers, "date"), new Date(observedAt));
  const providedMessageId = clean(getHeader(message?.headers, "message-id").replace(/[<>]/g, ""), 220);
  const rawEvidenceBase = providedMessageId || `no-message-id-${observedAt}`;
  const rawEvidenceRef = `email:${source.id}:${rawEvidenceBase}`;
  const authenticated = sourceAuthenticationPassed(message?.headers);

  let raw = "";
  let body = "";
  let subject = clean(getHeader(message?.headers, "subject"), 200);
  let sourceMessageId = providedMessageId;
  let parseFailure = "";

  try {
    raw = await readRawEmail(message?.raw, Number(env.LOADBOARD_MAX_EMAIL_BYTES) || MAX_INBOUND_EMAIL_BYTES);
    const parsedEnvelope = splitHeaderBody(raw);
    subject ||= clean(parsedEnvelope.headers.subject, 200);
    sourceMessageId ||= clean((parsedEnvelope.headers["message-id"] || "").replace(/[<>]/g, ""), 220);
    const extracted = extractMimeText(raw);
    body = clean(extracted.plain || extracted.html, 120_000);
    if (!body) parseFailure = "email_body_unreadable";
  } catch (error) {
    parseFailure = clean(error?.message || "email_read_failed", 100);
  }

  if (!sourceMessageId) {
    sourceMessageId = `email_${(await sha256(`${source.id}|${subject}|${raw.slice(0, 20_000)}`)).slice(0, 48)}`;
  }
  const evidenceRef = `email:${source.id}:${sourceMessageId}`;
  const sourcePayload = buildSourcePayload(source, recipient);

  let item;
  if (source.requestedVisibility === "public" && source.requireAuthentication && !authenticated) {
    const fingerprint = `sha256:${await sha256(`${sourceMessageId}|source_authentication_unverified`)}`;
    item = { quarantine: { source_message_id: sourceMessageId, fingerprint, reason: "source_authentication_unverified", subject, received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: evidenceRef } };
  } else if (parseFailure) {
    const fingerprint = `sha256:${await sha256(`${sourceMessageId}|${parseFailure}`)}`;
    item = { quarantine: { source_message_id: sourceMessageId, fingerprint, reason: parseFailure, subject, received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: evidenceRef } };
  } else {
    item = await parseFreightEmail({ subject, body, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef: evidenceRef });
  }

  const payload = {
    source: sourcePayload,
    records: item.record ? [item.record] : [],
    quarantine: item.quarantine ? [item.quarantine] : [],
  };

  try {
    const response = await submitIntake(env, payload, deps.fetch || fetch);
    logEvent("loadboard_email_ingested", {
      source_id: source.id,
      source_message_id: sourceMessageId,
      outcome: item.record ? "record" : "quarantine",
      intake_status: response.status,
    });
  } catch (error) {
    const status = Number(error?.status || 0);
    console.error(JSON.stringify({
      event: "loadboard_email_ingest_failed",
      source_id: source.id,
      source_message_id: sourceMessageId,
      category: status >= 400 && status < 500 ? "intake_rejected" : "intake_unavailable",
      status: status || null,
    }));
    if (!status || status >= 500) throw error;
  }
};

export {
  buildSourcePayload,
  containsCarHauling,
  extractMimeText,
  handleLoadBoardInboundEmail,
  mailboxFromHeader,
  parseFreightEmail,
  parseSourceConfig,
  readRawEmail,
  sourceAuthenticationPassed,
  submitIntake,
};
