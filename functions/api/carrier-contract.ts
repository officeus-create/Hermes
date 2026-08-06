type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type ServiceFetcher = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

type Env = {
  ASSETS?: ServiceFetcher;
  LEAD_EMAIL_SERVICE?: ServiceFetcher;
  LEAD_LIMITS?: KvNamespace;
  LEAD_SERVICE_TOKEN?: string;
  LEAD_DELIVERY_MODE?: string;
  ALLOWED_ORIGIN?: string;
  CARRIER_CONTRACT_MODE?: string;
  CARRIER_CONTRACT_APPROVED_VERSION?: string;
  CARRIER_CONTRACT_APPROVED_PDF_PATH?: string;
  CARRIER_CONTRACT_APPROVED_PDF_SHA256?: string;
};

type Context = {
  request: Request;
  env: Env;
};

type ContractInput = {
  request_id?: unknown;
  selected_plan?: unknown;
  custom_percentage?: unknown;
  custom_scope?: unknown;
  legal_company_name?: unknown;
  dba_name?: unknown;
  mc_number?: unknown;
  usdot_number?: unknown;
  business_address?: unknown;
  city?: unknown;
  state?: unknown;
  zip?: unknown;
  signer_name?: unknown;
  signer_title?: unknown;
  signer_email?: unknown;
  signer_phone?: unknown;
  fleet_size?: unknown;
  equipment_types?: unknown;
  other_equipment?: unknown;
  home_base?: unknown;
  preferred_lanes?: unknown;
  avoided_lanes?: unknown;
  max_deadhead?: unknown;
  availability_notes?: unknown;
  load_boards?: unknown;
  other_load_board?: unknown;
  access_handoff_method?: unknown;
  sales_contact?: unknown;
  typed_signature?: unknown;
  signature_jpeg?: unknown;
  signature_width?: unknown;
  signature_height?: unknown;
  consent_electronic_records?: unknown;
  consent_authority?: unknown;
  consent_document_review?: unknown;
  consent_selected_scope?: unknown;
  submitted_at?: unknown;
};

type NormalizedContract = {
  requestId: string;
  plan: "essential" | "pro" | "custom";
  planLabel: string;
  percentage: string;
  customScope: string;
  legalCompanyName: string;
  dbaName: string;
  mcNumber: string;
  usdotNumber: string;
  businessAddress: string;
  city: string;
  state: string;
  zip: string;
  signerName: string;
  signerTitle: string;
  signerEmail: string;
  signerPhone: string;
  fleetSize: string;
  equipmentTypes: string[];
  otherEquipment: string;
  homeBase: string;
  preferredLanes: string;
  avoidedLanes: string;
  maxDeadhead: string;
  availabilityNotes: string;
  loadBoards: string[];
  otherLoadBoard: string;
  accessHandoffMethod: string;
  salesContact: string;
  typedSignature: string;
  signatureBytes: Uint8Array;
  signatureWidth: number;
  signatureHeight: number;
  submittedAt: string;
};

const DEFAULT_ORIGIN = "https://hermeslogisticsus.com";
const EMAIL_SERVICE_URL = "https://lead-email.internal/v1/send-contract";
const REVIEW_DOCUMENT_VERSION = "DRAFT-2026-08-05";
const REVIEW_DOCUMENT_PATH = "/contracts/Hermes_Carrier_Dispatch_Agreement_Master_DRAFT_v2026-08-05.pdf";
const REVIEW_DOCUMENT_SHA256 = "35b14cf8e68a8cc4a0e4720157e8dd141765868a16b5db3145c94168bbf80e0b";
const CONSENT_VERSION = "carrier-electronic-records-v1-2026-08-06";
const MAX_REQUEST_BYTES = 420_000;
const MAX_SIGNATURE_BYTES = 220_000;
const RATE_LIMIT = 3;
const RATE_WINDOW_SECONDS = 60 * 60;
const RECORD_TTL_SECONDS = 24 * 60 * 60;
const DELIVERY_TIMEOUT_MS = 15_000;
const encoder = new TextEncoder();

const responseHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
  "Access-Control-Expose-Headers": "Content-Disposition, X-Hermes-Delivery, X-Hermes-Request-Id, X-Hermes-Pdf-Sha256, X-Hermes-Document-Mode",
  "Cache-Control": "no-store",
  "Vary": "Origin",
});

const json = (origin: string, status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...responseHeaders(origin), "Content-Type": "application/json; charset=utf-8" },
  });

const clean = (value: unknown, max: number) =>
  typeof value === "string"
    ? value.replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max)
    : "";

const asciiSafe = (value: string) => value.replace(/[^\x20-\x7e]/g, "?");
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value: string) => /^[+()\-\s.0-9]{7,30}$/.test(value);
const isRequestId = (value: string) => /^[a-zA-Z0-9][a-zA-Z0-9_-]{7,79}$/.test(value);
const isMcOrDot = (value: string) => value === "" || /^[0-9]{4,12}$/.test(value);
const toArray = (value: unknown, maxItems: number, maxLength: number) =>
  Array.isArray(value) ? value.map((item) => clean(item, maxLength)).filter(Boolean).slice(0, maxItems) : [];

const equipmentAllowlist = new Set([
  "Car hauler",
  "Hotshot",
  "Box truck",
  "Dry van",
  "Reefer",
  "Flatbed",
  "Step deck",
  "Sprinter / cargo van",
  "Power only",
  "Other",
]);
const loadBoardAllowlist = new Set([
  "DAT",
  "Truckstop",
  "Central Dispatch",
  "Super Dispatch",
  "123Loadboard",
  "Direct broker portals",
  "Other",
]);
const accessMethodAllowlist = new Set([
  "Provider-approved delegated access",
  "Separate secure handoff to assigned load planner",
  "Carrier will operate the load board during adaptation",
  "No load-board access is ready yet",
]);

const forbiddenKeyPattern = /(password|passcode|pin|credential|secret|token|api[_-]?key|w-?9|cdl|bank|routing|account[_-]?number|payment|credit[_-]?card|vin)/i;
const containsForbiddenKey = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsForbiddenKey);
  return Object.entries(value as Record<string, unknown>).some(([key, child]) => forbiddenKeyPattern.test(key) || containsForbiddenKey(child));
};

const base64ToBytes = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunk, bytes.length)));
  }
  return btoa(binary);
};

const concatBytes = (...parts: Uint8Array[]) => {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
};

const sha256 = async (value: string | Uint8Array) => {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
};

const normalizeInput = (input: ContractInput): NormalizedContract | null => {
  if (containsForbiddenKey(input)) return null;

  const requestId = clean(input.request_id, 80);
  const plan = clean(input.selected_plan, 20) as NormalizedContract["plan"];
  if (!isRequestId(requestId) || !["essential", "pro", "custom"].includes(plan)) return null;

  const legalCompanyName = clean(input.legal_company_name, 140);
  const signerName = clean(input.signer_name, 120);
  const signerTitle = clean(input.signer_title, 100);
  const signerEmail = clean(input.signer_email, 160).toLowerCase();
  const signerPhone = clean(input.signer_phone, 40);
  const typedSignature = clean(input.typed_signature, 120);
  const mcNumber = clean(input.mc_number, 20).replace(/\D/g, "");
  const usdotNumber = clean(input.usdot_number, 20).replace(/\D/g, "");
  const customPercentage = clean(input.custom_percentage, 8);
  const customScope = clean(input.custom_scope, 1_500);

  if (
    legalCompanyName.length < 2 ||
    signerName.length < 2 ||
    signerTitle.length < 2 ||
    !isEmail(signerEmail) ||
    !isPhone(signerPhone) ||
    typedSignature.toLowerCase() !== signerName.toLowerCase() ||
    (!mcNumber && !usdotNumber) ||
    !isMcOrDot(mcNumber) ||
    !isMcOrDot(usdotNumber)
  ) return null;

  if (
    input.consent_electronic_records !== true ||
    input.consent_authority !== true ||
    input.consent_document_review !== true ||
    input.consent_selected_scope !== true
  ) return null;

  let percentage = plan === "essential" ? "6%" : plan === "pro" ? "8%" : "Custom - pending Hermes approval";
  if (plan === "custom") {
    const numeric = Number(customPercentage);
    if (!Number.isFinite(numeric) || numeric < 1 || numeric > 15 || customScope.length < 20) return null;
    percentage = `${numeric.toFixed(2).replace(/\.00$/, "")}% proposed - not approved`;
  }

  const signatureData = clean(input.signature_jpeg, 300_000);
  const signatureMatch = signatureData.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!signatureMatch) return null;
  const signatureBytes = base64ToBytes(signatureMatch[1]);
  const signatureWidth = Number(input.signature_width);
  const signatureHeight = Number(input.signature_height);
  if (
    signatureBytes.length < 500 || signatureBytes.length > MAX_SIGNATURE_BYTES ||
    !Number.isInteger(signatureWidth) || signatureWidth < 300 || signatureWidth > 1_200 ||
    !Number.isInteger(signatureHeight) || signatureHeight < 90 || signatureHeight > 500
  ) return null;

  const equipmentTypes = toArray(input.equipment_types, 12, 60).filter((item) => equipmentAllowlist.has(item));
  const loadBoards = toArray(input.load_boards, 10, 60).filter((item) => loadBoardAllowlist.has(item));
  const accessHandoffMethod = clean(input.access_handoff_method, 120);
  if (!equipmentTypes.length || !accessMethodAllowlist.has(accessHandoffMethod)) return null;

  const submittedAtRaw = clean(input.submitted_at, 40);
  const submittedAtDate = new Date(submittedAtRaw);
  const submittedAt = Number.isNaN(submittedAtDate.getTime()) ? new Date().toISOString() : submittedAtDate.toISOString();

  return {
    requestId,
    plan,
    planLabel: plan === "essential" ? "Essential Dispatch" : plan === "pro" ? "Hermes Pro" : "Custom Cooperation Proposal",
    percentage,
    customScope,
    legalCompanyName,
    dbaName: clean(input.dba_name, 140),
    mcNumber,
    usdotNumber,
    businessAddress: clean(input.business_address, 180),
    city: clean(input.city, 80),
    state: clean(input.state, 40).toUpperCase(),
    zip: clean(input.zip, 15),
    signerName,
    signerTitle,
    signerEmail,
    signerPhone,
    fleetSize: clean(input.fleet_size, 20),
    equipmentTypes,
    otherEquipment: clean(input.other_equipment, 160),
    homeBase: clean(input.home_base, 120),
    preferredLanes: clean(input.preferred_lanes, 800),
    avoidedLanes: clean(input.avoided_lanes, 500),
    maxDeadhead: clean(input.max_deadhead, 40),
    availabilityNotes: clean(input.availability_notes, 800),
    loadBoards,
    otherLoadBoard: clean(input.other_load_board, 160),
    accessHandoffMethod,
    salesContact: clean(input.sales_contact, 120),
    typedSignature,
    signatureBytes,
    signatureWidth,
    signatureHeight,
    submittedAt,
  };
};

const pdfEscape = (value: string) => asciiSafe(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const wrap = (value: string, max = 82) => {
  const words = asciiSafe(value || "Not provided").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= max) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["Not provided"];
};

const pageStream = (title: string, sections: Array<{ label: string; value: string }>, footer: string, signature?: { bytes: Uint8Array; width: number; height: number }) => {
  const commands: string[] = [
    "0.06 0.11 0.28 rg",
    `BT /F2 18 Tf 1 0 0 1 48 748 Tm (${pdfEscape(title)}) Tj ET`,
    "0.35 0.32 0.82 RG 1.2 w 48 734 m 564 734 l S",
  ];
  let y = 708;
  for (const section of sections) {
    commands.push(`BT /F2 9 Tf 1 0 0 1 48 ${y} Tm (${pdfEscape(section.label.toUpperCase())}) Tj ET`);
    y -= 14;
    for (const line of wrap(section.value)) {
      commands.push(`BT /F1 10 Tf 1 0 0 1 58 ${y} Tm (${pdfEscape(line)}) Tj ET`);
      y -= 13;
    }
    y -= 8;
  }
  if (signature) {
    const displayWidth = 250;
    const displayHeight = Math.min(90, displayWidth * signature.height / signature.width);
    commands.push("0.75 0.78 0.88 RG 0.8 w 48 154 280 112 re S");
    commands.push(`q ${displayWidth} 0 0 ${displayHeight.toFixed(2)} 62 170 cm /Im1 Do Q`);
  }
  commands.push(`BT /F1 8 Tf 1 0 0 1 48 35 Tm (${pdfEscape(footer)}) Tj ET`);
  return encoder.encode(commands.join("\n"));
};

const createSignedAppendixPdf = (contract: NormalizedContract, mode: "review" | "live", documentVersion: string, documentSha: string, audit: { inputHash: string; ipHash: string; userAgentHash: string }) => {
  const statusText = mode === "live"
    ? "EXECUTION PACKAGE - selected plan and electronic signature record"
    : "REVIEW / ONBOARDING PACKET - not a final executed agreement";
  const page1 = pageStream(
    "Hermes Carrier Service Selection - Appendix A",
    [
      { label: "Document status", value: statusText },
      { label: "Master agreement version", value: `${documentVersion} | SHA-256 ${documentSha}` },
      { label: "Selected working model", value: `${contract.planLabel} | ${contract.percentage}` },
      { label: "Legal carrier company", value: contract.legalCompanyName },
      { label: "DBA", value: contract.dbaName || "None provided" },
      { label: "Authority identifiers", value: `MC ${contract.mcNumber || "N/A"} | USDOT ${contract.usdotNumber || "N/A"}` },
      { label: "Business address", value: [contract.businessAddress, contract.city, contract.state, contract.zip].filter(Boolean).join(", ") || "Not provided" },
      { label: "Authorized signer", value: `${contract.signerName}, ${contract.signerTitle}` },
      { label: "Signer contact", value: `${contract.signerEmail} | ${contract.signerPhone}` },
      ...(contract.plan === "custom" ? [{ label: "Custom scope proposed", value: contract.customScope }] : []),
    ],
    `Request ${contract.requestId} | Generated ${contract.submittedAt}`,
  );
  const page2 = pageStream(
    "Carrier Operating Profile and Secure Access Handoff",
    [
      { label: "Fleet and equipment", value: `Fleet size: ${contract.fleetSize || "Not provided"}. Equipment: ${[...contract.equipmentTypes, contract.otherEquipment].filter(Boolean).join(", ")}` },
      { label: "Home base", value: contract.homeBase || "Not provided" },
      { label: "Preferred lanes / operating areas", value: contract.preferredLanes || "Not provided" },
      { label: "Avoided lanes / restrictions", value: contract.avoidedLanes || "Not provided" },
      { label: "Maximum deadhead", value: contract.maxDeadhead || "Not provided" },
      { label: "Availability and adaptation notes", value: contract.availabilityNotes || "Not provided" },
      { label: "Load boards used", value: [...contract.loadBoards, contract.otherLoadBoard].filter(Boolean).join(", ") || "None selected" },
      { label: "Access handoff method", value: contract.accessHandoffMethod },
      { label: "Hermes representative referenced", value: contract.salesContact || "Not provided" },
      { label: "Security boundary", value: "No password, PIN, API token, payment credential, W-9, CDL image, VIN list, or private shipment document was collected by this form." },
    ],
    `Request ${contract.requestId} | Page 2`,
  );
  const page3 = pageStream(
    "Electronic Records, Authority, and Signature Record",
    [
      { label: "Electronic-record consent", value: "Signer affirmatively consented to use electronic records and signatures for this transaction, confirmed access to a device capable of downloading and retaining PDF records, and may request a paper copy from Hermes." },
      { label: "Authority confirmation", value: "Signer confirmed authority to act for the carrier company identified in this packet." },
      { label: "Document review confirmation", value: mode === "live" ? "Signer confirmed review of the approved master agreement and this selected-service appendix." : "Signer confirmed review of the current draft and understands that Hermes must issue an approved execution version before final contract activation." },
      { label: "Selected scope confirmation", value: `Signer confirmed the selected model: ${contract.planLabel}, ${contract.percentage}.` },
      { label: "Typed signature", value: contract.typedSignature },
      { label: "Signature timestamp", value: contract.submittedAt },
      { label: "Consent version", value: CONSENT_VERSION },
      { label: "Audit fingerprints", value: `Input ${audit.inputHash} | Network ${audit.ipHash.slice(0, 24)} | Device ${audit.userAgentHash.slice(0, 24)}` },
      { label: "Important", value: "The carrier retains final control over loads, drivers, equipment, safety, routes, and operating decisions. No load, rate, mileage, customer, revenue, or business outcome is guaranteed." },
    ],
    `Request ${contract.requestId} | Signature image below`,
    { bytes: contract.signatureBytes, width: contract.signatureWidth, height: contract.signatureHeight },
  );

  const objects: Uint8Array[] = [];
  const asBytes = (value: string) => encoder.encode(value);
  const stream = (data: Uint8Array, extra = "") => concatBytes(asBytes(`<< /Length ${data.length}${extra ? ` ${extra}` : ""} >>\nstream\n`), data, asBytes("\nendstream"));

  objects[1] = asBytes("<< /Type /Catalog /Pages 2 0 R >>");
  objects[2] = asBytes("<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>");
  objects[3] = asBytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> /Contents 8 0 R >>");
  objects[4] = asBytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> /Contents 9 0 R >>");
  objects[5] = asBytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> /XObject << /Im1 11 0 R >> >> /Contents 10 0 R >>");
  objects[6] = asBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects[7] = asBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  objects[8] = stream(page1);
  objects[9] = stream(page2);
  objects[10] = stream(page3);
  objects[11] = stream(contract.signatureBytes, `/Type /XObject /Subtype /Image /Width ${contract.signatureWidth} /Height ${contract.signatureHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`);
  objects[12] = asBytes(`<< /Title (${pdfEscape("Hermes Carrier Service Selection Appendix")}) /Author (${pdfEscape("Hermes Logistics LLC")}) /Subject (${pdfEscape(statusText)}) /Keywords (${pdfEscape(`${contract.requestId} ${documentVersion}`)}) >>`);

  const header = asBytes("%PDF-1.4\n%Hermes\n");
  const parts: Uint8Array[] = [header];
  const offsets = [0];
  let total = header.length;
  for (let number = 1; number <= 12; number += 1) {
    offsets[number] = total;
    const objectBytes = concatBytes(asBytes(`${number} 0 obj\n`), objects[number], asBytes("\nendobj\n"));
    parts.push(objectBytes);
    total += objectBytes.length;
  }
  const xrefOffset = total;
  const xrefLines = ["xref", "0 13", "0000000000 65535 f "];
  for (let number = 1; number <= 12; number += 1) xrefLines.push(`${String(offsets[number]).padStart(10, "0")} 00000 n `);
  const trailer = asBytes(`${xrefLines.join("\n")}\ntrailer\n<< /Size 13 /Root 1 0 R /Info 12 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
  parts.push(trailer);
  return concatBytes(...parts);
};

const safeFilename = (company: string, suffix: string) => {
  const base = asciiSafe(company).replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "Carrier";
  return `Hermes_${base}_${suffix}.pdf`;
};

const pdfResponse = (origin: string, status: number, bytes: Uint8Array, metadata: { filename: string; delivery: string; requestId: string; pdfSha: string; mode: string }) =>
  new Response(bytes, {
    status,
    headers: {
      ...responseHeaders(origin),
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${metadata.filename}"`,
      "X-Hermes-Delivery": metadata.delivery,
      "X-Hermes-Request-Id": metadata.requestId,
      "X-Hermes-Pdf-Sha256": metadata.pdfSha,
      "X-Hermes-Document-Mode": metadata.mode,
    },
  });

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
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json(allowedOrigin, 415, { success: false, error: "content_type_required" });
  }
  if (!env.ASSETS || !env.LEAD_EMAIL_SERVICE || !env.LEAD_LIMITS || !env.LEAD_SERVICE_TOKEN || env.LEAD_DELIVERY_MODE !== "live") {
    return json(allowedOrigin, 503, { success: false, error: "contract_delivery_not_configured" });
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_REQUEST_BYTES) return json(allowedOrigin, 413, { success: false, error: "request_too_large" });
  const raw = await request.text();
  if (encoder.encode(raw).length > MAX_REQUEST_BYTES) return json(allowedOrigin, 413, { success: false, error: "request_too_large" });

  let input: ContractInput;
  try {
    input = JSON.parse(raw) as ContractInput;
  } catch {
    return json(allowedOrigin, 400, { success: false, error: "invalid_json" });
  }
  const contract = normalizeInput(input);
  const headerRequestId = clean(request.headers.get("Idempotency-Key"), 80);
  if (!contract || headerRequestId !== contract.requestId) {
    return json(allowedOrigin, 400, { success: false, error: "invalid_contract_packet" });
  }

  const requestKeyHash = await sha256(contract.requestId);
  const requestKey = `contract:id:${requestKeyHash}`;
  const existing = await env.LEAD_LIMITS.get(requestKey);
  if (existing) {
    try {
      const record = JSON.parse(existing) as { pdf_base64: string; filename: string; delivery: string; pdf_sha: string; mode: string };
      return pdfResponse(allowedOrigin, record.delivery === "delivered" ? 200 : 202, base64ToBytes(record.pdf_base64), {
        filename: record.filename,
        delivery: record.delivery,
        requestId: contract.requestId,
        pdfSha: record.pdf_sha,
        mode: record.mode,
      });
    } catch {
      return json(allowedOrigin, 409, { success: false, error: "duplicate_record_unavailable" });
    }
  }

  const clientAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await sha256(clientAddress);
  const rateKey = `contract:rate:${ipHash}`;
  const currentRate = Number(await env.LEAD_LIMITS.get(rateKey) || "0");
  if (currentRate >= RATE_LIMIT) return json(allowedOrigin, 429, { success: false, error: "rate_limit_exceeded" });

  const requestedMode = clean(env.CARRIER_CONTRACT_MODE, 20).toLowerCase();
  const approvedVersion = clean(env.CARRIER_CONTRACT_APPROVED_VERSION, 80);
  const approvedPath = clean(env.CARRIER_CONTRACT_APPROVED_PDF_PATH, 220);
  const approvedSha = clean(env.CARRIER_CONTRACT_APPROVED_PDF_SHA256, 80).toLowerCase();
  const liveApproved = requestedMode === "live" && approvedVersion && !/draft/i.test(approvedVersion) && approvedPath.startsWith("/contracts/") && /^[a-f0-9]{64}$/.test(approvedSha) && contract.plan !== "custom";
  const mode: "review" | "live" = liveApproved ? "live" : "review";
  const documentVersion = liveApproved ? approvedVersion : REVIEW_DOCUMENT_VERSION;
  const documentPath = liveApproved ? approvedPath : REVIEW_DOCUMENT_PATH;
  const documentSha = liveApproved ? approvedSha : REVIEW_DOCUMENT_SHA256;

  const canonicalForAudit = JSON.stringify({
    ...contract,
    signatureBytes: undefined,
    signature_jpeg_sha256: await sha256(contract.signatureBytes),
    documentVersion,
    documentSha,
    mode,
  });
  const inputHash = await sha256(canonicalForAudit);
  const userAgentHash = await sha256(request.headers.get("User-Agent") || "unknown");
  const appendixPdf = createSignedAppendixPdf(contract, mode, documentVersion, documentSha, { inputHash, ipHash, userAgentHash });
  const appendixSha = await sha256(appendixPdf);
  const appendixFilename = safeFilename(contract.legalCompanyName, mode === "live" ? "Signed_Appendix_A" : "Signed_Review_Packet");

  const assetResponse = await env.ASSETS.fetch(new URL(documentPath, request.url));
  if (!assetResponse.ok || !assetResponse.headers.get("Content-Type")?.toLowerCase().includes("pdf")) {
    return json(allowedOrigin, 503, { success: false, error: "master_document_unavailable" });
  }
  const masterBytes = new Uint8Array(await assetResponse.arrayBuffer());
  const masterActualSha = await sha256(masterBytes);
  if (masterActualSha !== documentSha) {
    return json(allowedOrigin, 503, { success: false, error: "master_document_hash_mismatch" });
  }

  const emailText = [
    mode === "live" ? "Hermes carrier agreement execution package" : "Hermes carrier onboarding and review package",
    "-----------------------------------------------",
    `Request ID: ${contract.requestId}`,
    `Document mode: ${mode}`,
    `Master version: ${documentVersion}`,
    `Master SHA-256: ${documentSha}`,
    `Appendix SHA-256: ${appendixSha}`,
    `Carrier: ${contract.legalCompanyName}`,
    `DBA: ${contract.dbaName || "not provided"}`,
    `MC: ${contract.mcNumber || "not provided"}`,
    `USDOT: ${contract.usdotNumber || "not provided"}`,
    `Signer: ${contract.signerName}, ${contract.signerTitle}`,
    `Email: ${contract.signerEmail}`,
    `Phone: ${contract.signerPhone}`,
    `Selected plan: ${contract.planLabel}`,
    `Percentage: ${contract.percentage}`,
    `Fleet size: ${contract.fleetSize || "not provided"}`,
    `Equipment: ${[...contract.equipmentTypes, contract.otherEquipment].filter(Boolean).join(", ")}`,
    `Load boards: ${[...contract.loadBoards, contract.otherLoadBoard].filter(Boolean).join(", ") || "none selected"}`,
    `Access handoff: ${contract.accessHandoffMethod}`,
    `Hermes representative: ${contract.salesContact || "not provided"}`,
    "",
    mode === "live"
      ? "The attached master agreement and signed Appendix A form the execution package for the selected approved plan."
      : "The attached files are a signed review/onboarding packet and the current draft master agreement. They do not activate a final agreement until Hermes issues an approved execution version.",
    "No password, PIN, API token, payment credential, W-9, CDL image, VIN list, or private shipment document was collected by the website form.",
  ].join("\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);
  let delivery = "pending";
  try {
    const serviceResponse = await env.LEAD_EMAIL_SERVICE.fetch(EMAIL_SERVICE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.LEAD_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        request_id: contract.requestId,
        subject: "[HERMES CONTRACT] [CARRIER ONBOARDING]",
        text: emailText,
        reply_to: contract.signerEmail,
        carrier_email: contract.signerEmail,
        attachments: [
          {
            filename: appendixFilename,
            content_type: "application/pdf",
            content_base64: bytesToBase64(appendixPdf),
          },
          {
            filename: `Hermes_Master_Agreement_${asciiSafe(documentVersion).replace(/[^a-zA-Z0-9._-]+/g, "_")}.pdf`,
            content_type: "application/pdf",
            content_base64: bytesToBase64(masterBytes),
          },
        ],
      }),
      signal: controller.signal,
    });
    if (serviceResponse.ok) delivery = "delivered";
  } catch {
    delivery = "pending";
  } finally {
    clearTimeout(timeout);
  }

  const record = JSON.stringify({
    pdf_base64: bytesToBase64(appendixPdf),
    filename: appendixFilename,
    delivery,
    pdf_sha: appendixSha,
    mode,
  });
  await Promise.all([
    env.LEAD_LIMITS.put(requestKey, record, { expirationTtl: RECORD_TTL_SECONDS }),
    env.LEAD_LIMITS.put(rateKey, String(currentRate + 1), { expirationTtl: RATE_WINDOW_SECONDS }),
  ]);

  return pdfResponse(allowedOrigin, delivery === "delivered" ? 200 : 202, appendixPdf, {
    filename: appendixFilename,
    delivery,
    requestId: contract.requestId,
    pdfSha: appendixSha,
    mode,
  });
}

export async function onRequest(context: Context) {
  if (context.request.method === "OPTIONS") return onRequestOptions(context);
  if (context.request.method === "POST") return onRequestPost(context);
  const allowedOrigin = context.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  return json(allowedOrigin, 405, { success: false, error: "method_not_allowed" });
}

export { createSignedAppendixPdf, normalizeInput };
