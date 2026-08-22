const requiredHeaders = ["query", "page", "clicks", "impressions", "ctr", "position"];
const optionalHeaders = ["date_range", "country_bucket", "device_bucket"];
const forbiddenHeaders = new Set([
  "email", "phone", "name", "contact", "contact_name", "company", "customer", "carrier", "mc", "dot", "usdot", "vin",
  "route", "rate", "message", "token", "cookie", "account_id", "property_id", "stream_id", "container_id", "user_id", "client_id",
]);

const ownerRules = [
  {
    id: "appleton_warehousing",
    test: (query) => /\bappleton\b.*\bwarehous(?:e|ing)\b|\bwarehous(?:e|ing)\b.*\bappleton\b/i.test(query),
    owner: null,
    commercialWeight: 2,
    supported: false,
    label: "Appleton warehousing",
  },
  {
    id: "appleton_vehicle_transport",
    test: (query) => /\bappleton\b.*\b(vehicle|auto|car)\b.*\btransport|\b(vehicle|auto|car)\b.*\btransport.*\bappleton\b/i.test(query),
    owner: "/logistics/appleton-wi-vehicle-transport/",
    commercialWeight: 3,
    supported: true,
    label: "Appleton vehicle transport",
  },
  {
    id: "hermes_connect",
    test: (query) => /\bhermes\s+connect\b/i.test(query),
    owner: "/services/hermes-connect/",
    commercialWeight: 3,
    supported: true,
    label: "Hermes Connect",
  },
  {
    id: "auction_vehicle_pickup_checklist",
    test: (query) => /\bauction\b.*\b(vehicle|auto|car)\b.*\bpickup\b.*\bchecklist\b|\bchecklist\b.*\bauction\b.*\b(vehicle|auto|car)\b.*\bpickup\b/i.test(query),
    owner: "/logistics/resources/auction-vehicle-pickup-checklist/",
    commercialWeight: 2,
    supported: true,
    label: "Auction vehicle pickup checklist",
  },
  {
    id: "car_hauler_capacity_checklist",
    test: (query) => /\bcar\s+hauler\b.*\bcapacity\b.*\bchecklist\b|\bchecklist\b.*\bcar\s+hauler\b.*\bcapacity\b/i.test(query),
    owner: "/logistics/resources/car-hauler-capacity-checklist/",
    commercialWeight: 2,
    supported: true,
    label: "Car hauler capacity checklist",
  },
  {
    id: "load_board",
    test: (query) => /\b(load boards?|car hauler loads?|car hauling loads?|auto transport load boards?|car transport load boards?|car carrier load boards?)\b/i.test(query),
    owner: "/load-board/",
    commercialWeight: 3,
    supported: true,
    label: "Car-hauler / vehicle load board",
  },
  {
    id: "logistics_seo",
    test: (query) => (
      /\b(logistics|logistic|trucking|transportation|freight|warehouse|warehousing)\b.*\bseo\b/i.test(query)
      || /\bseo\b.*\b(logistics|logistic|trucking|transportation|freight|warehouse|warehousing)\b/i.test(query)
    ),
    owner: "/services/seo-for-logistics-companies/",
    commercialWeight: 3,
    supported: true,
    label: "Logistics / trucking SEO",
  },
  {
    id: "generic_seo",
    test: (query) => /\bseo\b/i.test(query),
    owner: "/services/seo/",
    commercialWeight: 2,
    supported: true,
    label: "General SEO",
  },
];

function parseLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function normalizeHeader(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseNumber(value, field) {
  const normalized = String(value ?? "").trim().replaceAll(",", "");
  const number = Number(normalized);
  if (!Number.isFinite(number) || number < 0) throw new Error(`Invalid ${field}`);
  return number;
}

function parseCtr(value) {
  const raw = String(value ?? "").trim();
  if (raw.endsWith("%")) return parseNumber(raw.slice(0, -1), "ctr") / 100;
  const numeric = parseNumber(raw, "ctr");
  return numeric > 1 ? numeric / 100 : numeric;
}

function normalizePage(value) {
  const raw = String(value ?? "").trim();
  if (!raw) throw new Error("Missing page");
  try {
    const url = new URL(raw, "https://hermeslogisticsus.com");
    let path = url.pathname || "/";
    if (!path.endsWith("/") && !path.includes(".")) path += "/";
    return path;
  } catch {
    throw new Error("Invalid page");
  }
}

export function parseSearchRadarCsv(csv) {
  const lines = String(csv ?? "").trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) throw new Error("CSV needs a header and at least one data row");

  const headers = parseLine(lines[0]).map(normalizeHeader);
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length) throw new Error(`Duplicate header: ${duplicateHeaders[0]}`);

  const forbidden = headers.filter((header) => forbiddenHeaders.has(header));
  if (forbidden.length) throw new Error(`Private or prohibited column: ${forbidden[0]}`);

  for (const header of requiredHeaders) {
    if (!headers.includes(header)) throw new Error(`Missing required column: ${header}`);
  }
  for (const header of headers) {
    if (![...requiredHeaders, ...optionalHeaders].includes(header)) throw new Error(`Unsupported column: ${header}`);
  }

  return lines.slice(1).map((line, rowIndex) => {
    const values = parseLine(line);
    if (values.length !== headers.length) throw new Error(`Row ${rowIndex + 2} has ${values.length} values; expected ${headers.length}`);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const query = row.query.trim();
    if (!query) throw new Error(`Row ${rowIndex + 2} is missing query`);
    return {
      query,
      page: normalizePage(row.page),
      clicks: parseNumber(row.clicks, "clicks"),
      impressions: parseNumber(row.impressions, "impressions"),
      ctr: parseCtr(row.ctr),
      position: parseNumber(row.position, "position"),
      dateRange: row.date_range?.trim() || "unspecified",
      countryBucket: row.country_bucket?.trim() || "all",
      deviceBucket: row.device_bucket?.trim() || "all",
    };
  });
}

export function findApprovedOwner(query) {
  const normalized = String(query ?? "").trim();
  const rule = ownerRules.find((candidate) => candidate.test(normalized));
  return rule ? { ...rule } : null;
}

function positionPriority(position) {
  if (position <= 10) return 20;
  if (position <= 20) return 18;
  if (position <= 30) return 15;
  if (position <= 50) return 10;
  if (position <= 70) return 5;
  return 0;
}

export function classifySearchOpportunity(row) {
  const rule = findApprovedOwner(row.query);
  const page = normalizePage(row.page);
  const impressions = parseNumber(row.impressions, "impressions");
  const clicks = parseNumber(row.clicks, "clicks");
  const ctr = typeof row.ctr === "number" ? row.ctr : parseCtr(row.ctr);
  const position = parseNumber(row.position, "position");

  if (!rule) {
    return {
      primaryClass: "LOW_PRIORITY",
      secondaryClasses: [],
      expectedOwner: null,
      intentLabel: "No approved mapping",
      supported: null,
      score: Math.min(25, Math.round(Math.min(impressions, 50) / 2)),
      reason: "No approved query-owner rule matches this row. Manual intent review is required before content or page creation.",
      nextAction: "Review intent and service truth; do not auto-create a page.",
    };
  }

  const baseScore = rule.commercialWeight * 20 + Math.min(20, impressions / 2) + positionPriority(position);

  if (!rule.supported) {
    return {
      primaryClass: "INTENT_MISMATCH",
      secondaryClasses: ["NEW_PAGE_NOT_JUSTIFIED"],
      expectedOwner: null,
      intentLabel: rule.label,
      supported: false,
      score: Math.min(100, Math.round(baseScore)),
      reason: "The query matches a known but currently unsupported service intent. Search visibility is not permission to invent the service.",
      nextAction: "Keep the current service page truthful; create nothing unless the real service offer and commercial evidence change.",
    };
  }

  if (rule.owner && page !== rule.owner) {
    return {
      primaryClass: "INTENT_MISMATCH",
      secondaryClasses: ["INTERNAL_LINK_GAP"],
      expectedOwner: rule.owner,
      intentLabel: rule.label,
      supported: true,
      score: Math.min(100, Math.round(baseScore + 10)),
      reason: `The query maps to ${rule.owner}, but the observed page is ${page}.`,
      nextAction: "Review query×page attribution, titles, internal links, and canonical ownership before changing or creating content.",
    };
  }

  if (position <= 10 && impressions >= 5 && ctr < 0.02) {
    return {
      primaryClass: "CTR_PROBLEM",
      secondaryClasses: ["KEEP_OWNER"],
      expectedOwner: rule.owner,
      intentLabel: rule.label,
      supported: true,
      score: Math.min(100, Math.round(baseScore + 10)),
      reason: "The approved owner is already near page one, but CTR is below the visible 2% review threshold.",
      nextAction: "Review title/snippet fit and buyer clarity; preserve the canonical owner.",
    };
  }

  if (position <= 30 || (impressions >= 20 && rule.commercialWeight >= 2)) {
    return {
      primaryClass: "POSITION_OPPORTUNITY",
      secondaryClasses: ["KEEP_OWNER"],
      expectedOwner: rule.owner,
      intentLabel: rule.label,
      supported: true,
      score: Math.min(100, Math.round(baseScore)),
      reason: "The query has an approved owner and enough visibility to justify a bounded rank/content/internal-link review before new-page expansion.",
      nextAction: "Strengthen the existing owner, then compare 7d/28d impressions, position, CTR, and qualified actions.",
    };
  }

  return {
    primaryClass: "KEEP_OWNER",
    secondaryClasses: position > 70 && impressions < 10 ? ["LOW_PRIORITY"] : [],
    expectedOwner: rule.owner,
    intentLabel: rule.label,
    supported: true,
    score: Math.min(100, Math.round(baseScore)),
    reason: "The query maps to the approved owner, but current evidence does not justify a new page or urgent CTR intervention.",
    nextAction: "Keep ownership stable and collect more evidence before expanding.",
  };
}

export function analyzeSearchRadarRows(rows) {
  return rows
    .map((row, index) => ({ id: index + 1, ...row, analysis: classifySearchOpportunity(row) }))
    .sort((left, right) => right.analysis.score - left.analysis.score || right.impressions - left.impressions);
}

export const searchRadarContract = Object.freeze({
  requiredHeaders: Object.freeze([...requiredHeaders]),
  optionalHeaders: Object.freeze([...optionalHeaders]),
  approvedOwnerRuleIds: Object.freeze(ownerRules.map((rule) => rule.id)),
  classes: Object.freeze([
    "KEEP_OWNER",
    "CTR_PROBLEM",
    "POSITION_OPPORTUNITY",
    "INTENT_MISMATCH",
    "CONTENT_GAP",
    "INTERNAL_LINK_GAP",
    "CANONICAL_INDEX_ISSUE",
    "NEW_PAGE_JUSTIFIED",
    "NEW_PAGE_NOT_JUSTIFIED",
    "LOW_PRIORITY",
  ]),
});
