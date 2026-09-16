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
      forwardedSourceEmail: normalizeEmail(item?.forwarded_source_email || ""),
    };
  }).filter((item) => isEmail(item.matchFrom) && item.id && item.name);
};

const parseControlledForwardMetadata = (body) => {
  const text = String(body || "").replace(/\r/g, "");
  if (!/^\s*HERMES_LOADBOARD_FORWARD\s*$/im.test(text)) return null;
  const source = normalizeEmail(text.match(/^\s*Original-Source\s*:\s*([^\s]+@[^\s]+)\s*$/im)?.[1] || "");
  const receivedAt = clean(text.match(/^\s*Original-Received-At\s*:\s*([^\n]+)\s*$/im)?.[1], 100);
  const messageId = clean(text.match(/^\s*Original-Message-ID\s*:\s*([^\n]+)\s*$/im)?.[1], 220);
  const timestamp = Date.parse(receivedAt);
  if (!source || !messageId || !Number.isFinite(timestamp)) return null;
  return { source, receivedAt: new Date(timestamp).toISOString(), messageId };
};

const forwardedBodyContainsSource = (body, expectedEmail) => {
  const expected = normalizeEmail(expectedEmail);
  if (!expected) return false;
  return String(body || "").replace(/\r/g, "").split("\n").some((line) => {
    if (!/^\s*From\s*:/i.test(line)) return false;
    return normalizeEmail(line).includes(expected);
  });
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
  if (/\bdry[ -]?vans?\b|\b53\s*(?:ft|foot|')?\s*vans?\b/.test(value)) return "dry_van";
  return "";
};

const hasExplicitEquipmentAlternatives = (text) => {
  const pattern = /\b(dry[ -]?van|reefer|flatbed|step[ -]?deck|power[ -]?only|hot[ -]?shot|box[ -]?truck|sprinter(?:[ -]?van)?|car[ -]?hauler)\b\s*(?:\/|\bor\b)\s*\b(dry[ -]?van|reefer|flatbed|step[ -]?deck|power[ -]?only|hot[ -]?shot|box[ -]?truck|sprinter(?:[ -]?van)?|car[ -]?hauler)\b/i;
  return pattern.test(String(text || ""));
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

const extractLaneRate = (text) => {
  for (const line of String(text || "").replace(/\r/g, "").split("\n")) {
    const [origin, destination] = extractLane(line);
    if (!origin || !destination) continue;
    const match = line.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
    if (!match?.[1]) continue;
    const amount = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000) return amount;
  }
  return null;
};

const extractLoadCount = (text) => {
  const value = String(text || "");
  const direct = value.match(/\b(\d{1,3})\s+loads?\s+available\b/i);
  const shorthand = /\bavailable\s+loads?\b/i.test(value) ? value.match(/\b(\d{1,3})\s+available\b/i) : null;
  const count = Number(direct?.[1] || shorthand?.[1] || 0);
  return Number.isInteger(count) && count > 1 && count <= 100 ? count : null;
};

const extractPickupWindow = (text) => {
  const match = String(text || "").match(/(?:^|\n)\s*(?:pickup(?: window| date| time)?|pick up|pu)\s*[:\-]\s*([^\n]{2,160})/im);
  return clean(match?.[1], 160);
};

const isCapacityMessage = (text) => /\b(?:truck|capacity)\s+available\b|\bavailable\s+(?:truck|capacity)\b|\bempty\s+(?:in|at)\b/i.test(text);

const isCapacityListEmail = (subject, body) => {
  const combined = `${clean(subject, 300)}\n${String(body || "").slice(0, 120_000)}`;
  return /\btruck\s+list\b/i.test(subject)
    || /\bempty\b[^\n]{0,80}\b(?:dry\s*van|reefer|flatbed|truck|trailer)s?\b[^\n]{0,80}\blist\b/i.test(combined);
};

const dayHeading = (line) => {
  const match = clean(line, 80).match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:'s)?\s*:?$/i);
  return match ? `${match[1][0].toUpperCase()}${match[1].slice(1).toLowerCase()}` : "";
};

const capacityListEquipment = (text, fallback = "") => {
  const value = clean(text, 240);
  return normalizeEquipment(value) || fallback;
};

const capacityListLocation = (line) => {
  const value = clean(line, 320).replace(/^[•*-]+\s*/, "");
  const location = "([A-Za-z][A-Za-z .'-]{1,70}?,\\s*[A-Z]{2})";
  const pattern = new RegExp(`^(?:(REEFER|DRY\\s*VAN|FLATBED|STEP\\s*DECK|POWER\\s*ONLY|HOT\\s*SHOT|BOX\\s*TRUCK)\\s+)?${location}(?:\\s+(?:to|→|->)\\s+${location})?(?:\\s*[-–—]\\s*(.*))?$`, "i");
  const prefixed = value.match(pattern);
  if (!prefixed) return null;
  return {
    equipment: capacityListEquipment(prefixed[1] || ""),
    origin: normalizeLocation(prefixed[2]),
    destination: normalizeLocation(prefixed[3] || ""),
    availability: clean(prefixed[4], 160).replace(/^[-–—]\s*/, ""),
  };
};

const isCapacityListNoise = (line) => {
  const value = clean(line, 300);
  if (!value) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  if (/^(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}(?:\s*(?:ext\.?|x)\s*\d+)?$/i.test(value)) return true;
  if (/^MC\s*[-#:]?\s*\d+/i.test(value)) return true;
  if (/^(?:good\s+(?:morning|afternoon|evening)|if you have any freight|please contact dispatcher directly)\b/i.test(value)) return true;
  return false;
};

const isCapacityListTerminator = (line) => /^(?:thank\s+you\.?|sales\s+team|this e-?mail\b|how did you like\b)/i.test(clean(line, 160));

const parseCapacityListEmail = async ({ subject, body, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef }) => {
  const combined = `${clean(subject, 300)}\n${String(body || "").slice(0, 120_000)}`;
  const emailFingerprint = `sha256:${await sha256(combined.replace(/\s+/g, " ").trim().toLowerCase())}`;
  const expiresAt = new Date(new Date(receivedAt).getTime() + source.ttlHours * 60 * 60 * 1000).toISOString();
  if (new Date(expiresAt).getTime() <= new Date(observedAt).getTime()) {
    return { records: [], quarantine: [{ source_message_id: sourceMessageId, fingerprint: emailFingerprint, reason: "stale_email", subject: clean(subject, 200), received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef }] };
  }

  const lines = String(body || "").replace(/\r/g, "").split("\n").map((line) => clean(line, 400));
  let defaultEquipment = "";
  let currentDay = "";
  let listStarted = false;
  const records = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isCapacityListTerminator(line)) break;
    const headingEquipment = /\bempty\b.*\blist\b/i.test(line) ? capacityListEquipment(line) : "";
    if (headingEquipment) {
      defaultEquipment = headingEquipment;
      const headingDay = clean(line, 80).match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:'s)?\b/i)?.[1] || "";
      if (headingDay) currentDay = `${headingDay[0].toUpperCase()}${headingDay.slice(1).toLowerCase()}`;
      listStarted = true;
      continue;
    }
    const day = dayHeading(line);
    if (day) {
      currentDay = day;
      listStarted = true;
      continue;
    }
    if (!listStarted || isCapacityListNoise(line)) continue;

    const parsed = capacityListLocation(line);
    if (!parsed?.origin) continue;
    let availability = parsed.availability;
    if (!availability) {
      for (let offset = 1; offset <= 2 && index + offset < lines.length; offset += 1) {
        const candidate = clean(lines[index + offset], 180).replace(/^[-–—]\s*/, "");
        if (!candidate || isCapacityListNoise(candidate)) continue;
        if (dayHeading(candidate) || capacityListLocation(candidate) || isCapacityListTerminator(candidate)) break;
        availability = candidate;
        index += offset;
        break;
      }
    }
    const equipment = parsed.equipment || defaultEquipment;
    if (!equipment) continue;
    const pickupWindow = clean([currentDay, availability].filter(Boolean).join(" "), 160);
    const fingerprintInput = `${source.id}|${sourceMessageId}|capacity|${equipment}|${parsed.origin}|${pickupWindow}`.toLowerCase();
    records.push({
      source_message_id: sourceMessageId,
      fingerprint: `sha256:${await sha256(fingerprintInput)}`,
      record_type: "capacity",
      equipment,
      origin: parsed.origin,
      ...(parsed.destination ? { destination: parsed.destination } : {}),
      ...(pickupWindow ? { pickup_window: pickupWindow, availability_text: pickupWindow } : {}),
      team: /\bteam\b/i.test(availability),
      received_at: receivedAt,
      observed_at: observedAt,
      expires_at: expiresAt,
      visibility: source.requestedVisibility,
      raw_evidence_ref: rawEvidenceRef,
    });
  }

  if (records.length) return { records, quarantine: [] };
  return {
    records: [],
    quarantine: [{ source_message_id: sourceMessageId, fingerprint: emailFingerprint, reason: "capacity_list_no_records", subject: clean(subject, 200), received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef }],
  };
};

const parseFreightEmail = async ({ subject, body, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef }) => {
  const combined = `${clean(subject, 300)}\n${String(body || "").slice(0, 120_000)}`;
  const fingerprint = `sha256:${await sha256(combined.replace(/\s+/g, " ").trim().toLowerCase())}`;

  const [laneOrigin, laneDestination] = extractLane(combined);
  const origin = extractLabeledLocation(combined, ["origin", "from", "pickup(?: location)?", "pu"]) || laneOrigin;
  const destination = extractLabeledLocation(combined, ["destination", "to", "delivery(?: location)?", "drop(?: off)?"]) || laneDestination;
  const equipmentAmbiguous = hasExplicitEquipmentAlternatives(combined);
  const equipment = equipmentAmbiguous ? "" : extractEquipment(combined);
  const recordType = isCapacityMessage(combined) ? "capacity" : "load";
  const missing = [];
  if (!origin) missing.push("origin");
  if (!equipment && !equipmentAmbiguous) missing.push("equipment");
  if (recordType === "load" && !destination) missing.push("destination");

  const expiresAt = new Date(new Date(receivedAt).getTime() + source.ttlHours * 60 * 60 * 1000).toISOString();
  if (new Date(expiresAt).getTime() <= new Date(observedAt).getTime()) {
    return { quarantine: { source_message_id: sourceMessageId, fingerprint, reason: "stale_email", subject: clean(subject, 200), received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef } };
  }
  if (equipmentAmbiguous || missing.length) {
    const reason = equipmentAmbiguous
      ? `ambiguous_equipment${missing.length ? `_missing_${missing.join("_")}` : ""}`
      : `missing_${missing.join("_")}`;
    return { quarantine: { source_message_id: sourceMessageId, fingerprint, reason, subject: clean(subject, 200), received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef } };
  }

  const rateAmount = extractRate(combined) ?? extractLaneRate(combined);
  const pickupWindow = extractPickupWindow(combined);
  const loadCount = recordType === "load" ? extractLoadCount(combined) : null;
  return {
    record: {
      source_message_id: sourceMessageId,
      fingerprint,
      record_type: recordType,
      equipment,
      origin,
      ...(destination ? { destination } : {}),
      ...(pickupWindow ? { pickup_window: pickupWindow } : {}),
      ...(loadCount ? { availability_text: `${loadCount} loads available` } : {}),
      ...(rateAmount !== null ? { rate_amount: rateAmount, rate_currency: "USD" } : {}),
      received_at: receivedAt,
      observed_at: observedAt,
      expires_at: expiresAt,
      visibility: source.requestedVisibility,
      raw_evidence_ref: rawEvidenceRef,
    },
  };
};

const US_STATE_CODES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
const FREIGHT_ROW_DATE = /^\d{1,2}\/\d{1,2}(?:\/\d{2,4})?$/;

const normalizeTableEquipmentCode = (value) => {
  const code = clean(value, 40).toUpperCase().replace(/\s+/g, "");
  if (!code) return { equipment: "", ambiguous: false };
  if (["V", "DV", "VAN", "DRYVAN"].includes(code)) return { equipment: "dry_van", ambiguous: false };
  if (["R", "RF", "REEFER"].includes(code)) return { equipment: "reefer", ambiguous: false };
  if (["F", "FB", "FLATBED"].includes(code)) return { equipment: "flatbed", ambiguous: false };
  if (["SD", "STEPDECK"].includes(code)) return { equipment: "step_deck", ambiguous: false };
  if (["PO", "POWERONLY"].includes(code)) return { equipment: "power_only", ambiguous: false };
  if (code.includes("/") || code.includes("OR")) return { equipment: "", ambiguous: true };
  return { equipment: normalizeEquipment(code), ambiguous: false };
};

const parseTabularFreightRow = (line) => {
  const value = clean(line, 500);
  if (!value) return null;
  const tokens = value.split(/\s+/).filter(Boolean);
  if (tokens.length < 7 || !FREIGHT_ROW_DATE.test(tokens[0])) return null;
  const stateIndexes = [];
  for (let index = 1; index < tokens.length; index += 1) {
    if (US_STATE_CODES.has(tokens[index])) stateIndexes.push(index);
  }
  if (stateIndexes.length < 2) return null;
  const originStateIndex = stateIndexes[0];
  const destinationStateIndex = stateIndexes[1];
  const originCity = clean(tokens.slice(1, originStateIndex).join(" "), 120);
  const destinationCity = clean(tokens.slice(originStateIndex + 1, destinationStateIndex).join(" "), 120);
  if (!originCity || !destinationCity) return null;
  const tail = tokens.slice(destinationStateIndex + 1);
  const deliveryWindow = FREIGHT_ROW_DATE.test(tail[0] || "") ? tail[0] : "";
  const providerRecordId = tail.find((token) => /^\d{4,}$/.test(token)) || "";
  const equipmentToken = tail.length ? tail[tail.length - 1] : "";
  const equipmentState = normalizeTableEquipmentCode(equipmentToken);
  return {
    origin: `${originCity}, ${tokens[originStateIndex]}`,
    destination: `${destinationCity}, ${tokens[destinationStateIndex]}`,
    pickupWindow: tokens[0],
    deliveryWindow,
    providerRecordId,
    equipmentToken,
    equipment: equipmentState.equipment,
    ambiguousEquipment: equipmentState.ambiguous,
  };
};

const normalizeStandaloneLocation = (value) => {
  const match = clean(value, 180).match(/^([A-Za-z][A-Za-z .'-]{1,70},\s*[A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?$/);
  return match?.[1] ? normalizeLocation(match[1]).replace(/,\s*/g, ", ") : "";
};

const valueAfterLabel = (lines, pattern) => {
  const index = lines.findIndex((line) => pattern.test(line));
  return index >= 0 ? clean(lines[index + 1], 180) : "";
};

const pairAfterLabel = (lines, pattern) => {
  const index = lines.findIndex((line) => pattern.test(line));
  if (index < 0) return ["", ""];
  return [clean(lines[index + 1], 180), clean(lines[index + 2], 180)];
};

const parsePairedColumnFreightEmail = async ({ subject, body, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef }) => {
  const lines = String(body || "").replace(/\r/g, "").split("\n").map((line) => clean(line, 500)).filter(Boolean);
  const locationIndex = lines.findIndex((line) => /^location$/i.test(line));
  if (locationIndex < 0) return null;
  const origin = normalizeStandaloneLocation(lines[locationIndex + 1] || "");
  const destination = normalizeStandaloneLocation(lines[locationIndex + 2] || "");
  if (!origin || !destination) return null;

  const equipmentText = valueAfterLabel(lines, /^equipment$/i);
  const rateText = valueAfterLabel(lines, /^rate$/i);
  const [pickupDate, deliveryDate] = pairAfterLabel(lines, /^date$/i);
  const [pickupTime, deliveryTime] = pairAfterLabel(lines, /^(?:appt|appointment)\s*time$/i);
  const pickupWindow = clean([pickupDate, pickupTime].filter(Boolean).join(" "), 160);
  const deliveryWindow = clean([deliveryDate, deliveryTime].filter(Boolean).join(" "), 160);
  const weightText = valueAfterLabel(lines, /^weight\s*\(\s*lbs?\s*\)$/i);
  const weight = Number(weightText.replace(/,/g, ""));

  const reconstructed = [
    `Origin: ${origin}`,
    `Destination: ${destination}`,
    ...(equipmentText ? [`Equipment: ${equipmentText}`] : []),
    ...(rateText ? [`Rate: ${rateText}`] : []),
    ...(pickupWindow ? [`Pickup: ${pickupWindow}`] : []),
  ].join("\n");
  const item = await parseFreightEmail({ subject, body: reconstructed, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef });
  if (!item.record) return { records: [], quarantine: item.quarantine ? [item.quarantine] : [] };
  return {
    records: [{
      ...item.record,
      ...(deliveryWindow ? { delivery_window: deliveryWindow } : {}),
      ...(Number.isFinite(weight) && weight > 0 && weight <= 500_000 ? { weight_lbs: weight } : {}),
    }],
    quarantine: [],
  };
};

const extractExplicitFreightBlocks = (body) => {
  const lines = String(body || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let current = null;
  for (const rawLine of lines) {
    const line = clean(rawLine, 500);
    const marker = line.match(/^\s*(?:load|shipment)\s*#?\s*\d+\s*[:.)-]?\s*(.*)$/i);
    if (marker) {
      if (current?.length) blocks.push(current.join("\n"));
      current = [];
      if (marker[1]) current.push(marker[1]);
      continue;
    }
    if (current) current.push(rawLine);
  }
  if (current?.length) blocks.push(current.join("\n"));
  return blocks.filter((block) => block.trim());
};

const extractRouteFreightBlocks = (body) => {
  const lines = String(body || "").replace(/\r/g, "").split("\n");
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    const [origin, destination] = extractLane(lines[index]);
    if (origin && destination) starts.push(index);
  }
  if (starts.length < 2) return [];
  return starts.map((start, itemIndex) => {
    const end = itemIndex + 1 < starts.length ? starts[itemIndex + 1] : lines.length;
    return lines.slice(start, end).join("\n").trim();
  }).filter(Boolean);
};

const parseFreightEmailRecords = async ({ subject, body, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef }) => {
  const combined = `${clean(subject, 300)}\n${String(body || "").slice(0, 120_000)}`;
  const emailFingerprint = `sha256:${await sha256(combined.replace(/\s+/g, " ").trim().toLowerCase())}`;
  const expiresAt = new Date(new Date(receivedAt).getTime() + source.ttlHours * 60 * 60 * 1000).toISOString();
  if (new Date(expiresAt).getTime() <= new Date(observedAt).getTime()) {
    return {
      records: [],
      quarantine: [{ source_message_id: sourceMessageId, fingerprint: emailFingerprint, reason: "stale_email", subject: clean(subject, 200), received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: rawEvidenceRef }],
    };
  }

  const pairedColumn = await parsePairedColumnFreightEmail({ subject, body, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef });
  if (pairedColumn) return pairedColumn;

  const tableRows = String(body || "").replace(/\r/g, "").split("\n").map(parseTabularFreightRow).filter(Boolean);
  if (tableRows.length) {
    const records = [];
    const quarantine = [];
    for (const row of tableRows) {
      const fingerprintInput = `${source.id}|${sourceMessageId}|load|${row.providerRecordId}|${row.origin}|${row.destination}|${row.pickupWindow}|${row.equipmentToken}`.toLowerCase();
      const fingerprint = `sha256:${await sha256(fingerprintInput)}`;
      if (row.ambiguousEquipment || !row.equipment) {
        quarantine.push({
          source_message_id: sourceMessageId,
          fingerprint,
          reason: row.ambiguousEquipment ? "ambiguous_equipment" : "missing_equipment",
          subject: clean(subject, 200),
          received_at: receivedAt,
          observed_at: observedAt,
          raw_evidence_ref: rawEvidenceRef,
        });
        continue;
      }
      records.push({
        source_message_id: sourceMessageId,
        fingerprint,
        record_type: "load",
        equipment: row.equipment,
        origin: row.origin,
        destination: row.destination,
        ...(row.pickupWindow ? { pickup_window: row.pickupWindow } : {}),
        ...(row.deliveryWindow ? { delivery_window: row.deliveryWindow } : {}),
        ...(row.providerRecordId ? { provider_record_id: row.providerRecordId } : {}),
        received_at: receivedAt,
        observed_at: observedAt,
        expires_at: expiresAt,
        visibility: source.requestedVisibility,
        raw_evidence_ref: rawEvidenceRef,
      });
    }
    return { records, quarantine };
  }

  const explicitBlocks = extractExplicitFreightBlocks(body);
  const routeBlocks = explicitBlocks.length >= 2 ? [] : extractRouteFreightBlocks(body);
  const useRouteBlocks = explicitBlocks.length < 2 && routeBlocks.length >= 2;
  const candidateBlocks = explicitBlocks.length >= 2 ? explicitBlocks : routeBlocks;
  if (candidateBlocks.length >= 2) {
    const records = [];
    const quarantine = [];
    for (const block of candidateBlocks) {
      const item = await parseFreightEmail({ subject: useRouteBlocks ? "Freight load" : subject, body: block, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef });
      if (item.record) records.push(item.record);
      if (item.quarantine) quarantine.push(item.quarantine);
    }
    return { records, quarantine };
  }

  const item = await parseFreightEmail({ subject, body, receivedAt, observedAt, source, sourceMessageId, rawEvidenceRef });
  return {
    records: item.record ? [item.record] : [],
    quarantine: item.quarantine ? [item.quarantine] : [],
  };
};

const buildSourcePayload = (source, recipient) => ({
  id: source.id,
  provider: source.forwardedSourceEmail ? "controlled_email_forwarding" : "cloudflare_email_routing",
  source_type: "email",
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
  const token = String(env.LOADBOARD_INGEST_TOKEN || env.LEAD_SERVICE_TOKEN || "");
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
    const observedAt = new Date().toISOString();
    const receivedAt = safeIso(getHeader(message?.headers, "date"), new Date(observedAt));
    const sourceMessageId = clean(getHeader(message?.headers, "message-id").replace(/[<>]/g, ""), 220) || `unapproved_${(await sha256(`${envelopeFrom}|${observedAt}`)).slice(0, 48)}`;
    const fingerprint = `sha256:${await sha256(`${sourceMessageId}|source_not_approved`)}`;
    const payload = {
      source: {
        id: "src_unapproved_email", provider: "cloudflare_email_routing", source_type: "email",
        name: "Unapproved inbound email", mailbox_email: recipient,
        credential_ref: `cloudflare_email_routing:${recipient}`, redistribution_permission: "internal_only",
        contact_reveal_permission: "hidden", read_enabled: false, ingest_enabled: false,
      },
      records: [],
      quarantine: [{ source_message_id: sourceMessageId, fingerprint, reason: "source_not_approved", subject: "", received_at: receivedAt, observed_at: observedAt, raw_evidence_ref: `email:unapproved:${sourceMessageId}` }],
    };
    try { await submitIntake(env, payload, deps.fetch || fetch); } catch (error) {
      const status = Number(error?.status || 0);
      if (!status || status >= 500) throw error;
    }
    logEvent("loadboard_email_source_quarantined", { recipient, reason: "source_not_approved" });
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

  let effectiveReceivedAt = receivedAt;
  let effectiveSourceMessageId = sourceMessageId;
  let forwardFailure = "";
  if (!parseFailure && source.forwardedSourceEmail) {
    const forwarded = parseControlledForwardMetadata(body);
    if (!forwarded || forwarded.source !== source.forwardedSourceEmail || !forwardedBodyContainsSource(body, source.forwardedSourceEmail)) {
      forwardFailure = "forwarded_source_unverified";
    } else {
      effectiveReceivedAt = forwarded.receivedAt;
      effectiveSourceMessageId = forwarded.messageId;
    }
  }

  const evidenceRef = `email:${source.id}:${effectiveSourceMessageId}`;
  const sourcePayload = buildSourcePayload(source, recipient);

  let records = [];
  let quarantine = [];
  if (source.requireAuthentication && !authenticated) {
    const fingerprint = `sha256:${await sha256(`${effectiveSourceMessageId}|source_authentication_unverified`)}`;
    quarantine = [{ source_message_id: effectiveSourceMessageId, fingerprint, reason: "source_authentication_unverified", subject, received_at: effectiveReceivedAt, observed_at: observedAt, raw_evidence_ref: evidenceRef }];
  } else if (parseFailure || forwardFailure) {
    const reason = parseFailure || forwardFailure;
    const fingerprint = `sha256:${await sha256(`${effectiveSourceMessageId}|${reason}`)}`;
    quarantine = [{ source_message_id: effectiveSourceMessageId, fingerprint, reason, subject, received_at: effectiveReceivedAt, observed_at: observedAt, raw_evidence_ref: evidenceRef }];
  } else if (isCapacityListEmail(subject, body)) {
    ({ records, quarantine } = await parseCapacityListEmail({ subject, body, receivedAt: effectiveReceivedAt, observedAt, source, sourceMessageId: effectiveSourceMessageId, rawEvidenceRef: evidenceRef }));
  } else {
    ({ records, quarantine } = await parseFreightEmailRecords({ subject, body, receivedAt: effectiveReceivedAt, observedAt, source, sourceMessageId: effectiveSourceMessageId, rawEvidenceRef: evidenceRef }));
  }

  const payload = { source: sourcePayload, records, quarantine };

  try {
    const response = await submitIntake(env, payload, deps.fetch || fetch);
    logEvent("loadboard_email_ingested", {
      source_id: source.id,
      source_message_id: effectiveSourceMessageId,
      outcome: records.length ? `records:${records.length}` : `quarantine:${quarantine.length}`,
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
  parseCapacityListEmail,
  parseControlledForwardMetadata,
  parseFreightEmail,
  parseFreightEmailRecords,
  parseSourceConfig,
  readRawEmail,
  sourceAuthenticationPassed,
  submitIntake,
};
