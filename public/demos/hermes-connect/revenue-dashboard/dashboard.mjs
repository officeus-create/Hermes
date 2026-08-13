export const EVIDENCE_CLASSES = Object.freeze([
  "PLATFORM_VERIFIED",
  "PRODUCTION_RECEIVER_VERIFIED",
  "PRIVATE_OPERATIONS_VERIFIED",
  "REPOSITORY_VERIFIED",
  "UNVERIFIED",
  "DATA_PENDING",
]);

export const DIRECTION_IDS = Object.freeze([
  "logistics_carrier",
  "logistics_transport",
  "marketing_seo",
  "it_website_automation",
  "academy",
]);

const privateKeys = new Set([
  "name", "email", "phone", "company", "customer", "carrier", "contact", "message", "mc", "dot", "usdot", "vin",
  "route", "rate", "invoice", "account_id", "property_id", "stream_id", "user_id", "client_id", "token", "cookie",
]);

const operationalStages = ["delivered", "reviewed", "qualified", "opportunities", "won", "lost", "revenue"];

function finiteNonNegative(value, label) {
  if (value === null) return null;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${label} must be a non-negative number or null`);
  return number;
}

function integerOrNull(value, label) {
  const number = finiteNonNegative(value, label);
  if (number === null) return null;
  if (!Number.isInteger(number)) throw new Error(`${label} must be a whole number or null`);
  return number;
}

function evidence(value, label) {
  if (!EVIDENCE_CLASSES.includes(value)) throw new Error(`${label} has an invalid evidence class`);
  return value;
}

function ensureNoPrivateKeys(value, path = "root") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => ensureNoPrivateKeys(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (privateKeys.has(key.toLowerCase())) throw new Error(`Private or prohibited field: ${path}.${key}`);
    ensureNoPrivateKeys(child, `${path}.${key}`);
  }
}

function validateSearchCheckpoint(raw = {}) {
  const className = evidence(raw.evidence_class ?? "DATA_PENDING", "search checkpoint");
  if (!["PLATFORM_VERIFIED", "DATA_PENDING", "UNVERIFIED"].includes(className)) {
    throw new Error("Search checkpoint evidence must be PLATFORM_VERIFIED, DATA_PENDING, or UNVERIFIED");
  }

  const clicks = integerOrNull(raw.clicks ?? null, "search clicks");
  const impressions = integerOrNull(raw.impressions ?? null, "search impressions");
  const ctr = finiteNonNegative(raw.ctr ?? null, "search CTR");
  const averagePosition = finiteNonNegative(raw.average_position ?? null, "search average position");
  const hasMetric = [clicks, impressions, ctr, averagePosition].some((value) => value !== null);
  if (hasMetric && className !== "PLATFORM_VERIFIED") {
    throw new Error("Search metrics cannot be populated without PLATFORM_VERIFIED evidence");
  }
  if (className === "PLATFORM_VERIFIED" && [clicks, impressions, ctr, averagePosition].some((value) => value === null)) {
    throw new Error("PLATFORM_VERIFIED search checkpoint requires clicks, impressions, CTR, and average position");
  }
  if (ctr !== null && ctr > 1) throw new Error("Search CTR must be a decimal between 0 and 1");
  if (clicks !== null && impressions !== null && clicks > impressions) throw new Error("Search clicks cannot exceed impressions");

  return {
    evidenceClass: className,
    clicks,
    impressions,
    ctr,
    averagePosition,
    label: String(raw.label ?? "Search checkpoint").slice(0, 100),
    dateRange: String(raw.date_range ?? "unspecified").slice(0, 60),
    source: String(raw.source ?? "unspecified aggregate source").slice(0, 100),
  };
}

const stageEvidenceRules = Object.freeze({
  delivered: ["PRODUCTION_RECEIVER_VERIFIED", "PRIVATE_OPERATIONS_VERIFIED", "DATA_PENDING", "UNVERIFIED"],
  reviewed: ["PRIVATE_OPERATIONS_VERIFIED", "DATA_PENDING", "UNVERIFIED"],
  qualified: ["PRIVATE_OPERATIONS_VERIFIED", "DATA_PENDING", "UNVERIFIED"],
  opportunities: ["PRIVATE_OPERATIONS_VERIFIED", "DATA_PENDING", "UNVERIFIED"],
  won: ["PRIVATE_OPERATIONS_VERIFIED", "DATA_PENDING", "UNVERIFIED"],
  lost: ["PRIVATE_OPERATIONS_VERIFIED", "DATA_PENDING", "UNVERIFIED"],
  revenue: ["PRIVATE_OPERATIONS_VERIFIED", "DATA_PENDING", "UNVERIFIED"],
});

function validateStage(rawDirection, stage) {
  const rawValue = rawDirection[stage] ?? null;
  const rawEvidence = rawDirection[`${stage}_evidence`] ?? "DATA_PENDING";
  const className = evidence(rawEvidence, `${stage} evidence`);
  if (!stageEvidenceRules[stage].includes(className)) throw new Error(`${stage} cannot use evidence class ${className}`);
  const value = stage === "revenue"
    ? finiteNonNegative(rawValue, stage)
    : integerOrNull(rawValue, stage);
  if (value !== null && !["PRODUCTION_RECEIVER_VERIFIED", "PRIVATE_OPERATIONS_VERIFIED"].includes(className)) {
    throw new Error(`${stage} value cannot be populated without receiver/private operations evidence`);
  }
  if (["reviewed", "qualified", "opportunities", "won", "lost", "revenue"].includes(stage) && value !== null && className !== "PRIVATE_OPERATIONS_VERIFIED") {
    throw new Error(`${stage} requires PRIVATE_OPERATIONS_VERIFIED evidence when populated`);
  }
  return { value, evidenceClass: className };
}

function validateDirection(raw = {}) {
  const directionId = String(raw.direction_id ?? "");
  if (!DIRECTION_IDS.includes(directionId)) throw new Error(`Unknown direction_id: ${directionId || "missing"}`);
  const stages = Object.fromEntries(operationalStages.map((stage) => [stage, validateStage(raw, stage)]));

  const values = Object.fromEntries(operationalStages.map((stage) => [stage, stages[stage].value]));
  if (values.delivered !== null && values.reviewed !== null && values.reviewed > values.delivered) throw new Error(`${directionId}: reviewed cannot exceed delivered`);
  if (values.reviewed !== null && values.qualified !== null && values.qualified > values.reviewed) throw new Error(`${directionId}: qualified cannot exceed reviewed`);
  if (values.qualified !== null && values.opportunities !== null && values.opportunities > values.qualified) throw new Error(`${directionId}: opportunities cannot exceed qualified`);
  if (values.opportunities !== null && values.won !== null && values.lost !== null && values.won + values.lost > values.opportunities) {
    throw new Error(`${directionId}: won + lost cannot exceed opportunities`);
  }
  if (values.revenue !== null && values.revenue > 0 && (values.won === null || values.won < 1)) {
    throw new Error(`${directionId}: positive revenue requires at least one verified won outcome`);
  }

  return {
    directionId,
    label: String(raw.label ?? directionId).slice(0, 80),
    stages,
  };
}

export function parseRevenueDashboardJson(text) {
  let input;
  try {
    input = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error("Dashboard input must be valid JSON");
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Dashboard input must be one JSON object");
  ensureNoPrivateKeys(input);

  const period = input.period ?? {};
  const timezone = String(period.timezone ?? "America/Chicago").slice(0, 80);
  const dateRange = String(period.date_range ?? "unspecified").slice(0, 80);
  const attributionBasis = String(period.attribution_basis ?? "not specified").slice(0, 180);
  const testExclusion = period.synthetic_test_exclusion === true;
  if (!testExclusion) throw new Error("synthetic_test_exclusion must be true before business KPI rendering");

  if (!Array.isArray(input.directions) || input.directions.length < 1) throw new Error("At least one direction aggregate is required");
  const directions = input.directions.map(validateDirection);
  if (new Set(directions.map((item) => item.directionId)).size !== directions.length) throw new Error("direction_id values must be unique");

  return {
    period: { timezone, dateRange, attributionBasis, syntheticTestExclusion: true },
    search: validateSearchCheckpoint(input.search_checkpoint ?? {}),
    directions,
  };
}

function stageStatus(stage) {
  if (stage.value === null) return "pending";
  return "verified";
}

export function summarizeRevenueDashboard(data) {
  const totals = { delivered: 0, reviewed: 0, qualified: 0, opportunities: 0, won: 0, lost: 0, revenue: 0 };
  const pending = new Set();
  let verifiedStageCount = 0;
  let totalStageCount = 0;

  for (const direction of data.directions) {
    for (const stageName of operationalStages) {
      totalStageCount += 1;
      const stage = direction.stages[stageName];
      if (stageStatus(stage) === "verified") {
        verifiedStageCount += 1;
        totals[stageName] += stage.value;
      } else {
        pending.add(`${direction.directionId}:${stageName}`);
      }
    }
  }

  const searchVerified = data.search.evidenceClass === "PLATFORM_VERIFIED";
  const completeness = totalStageCount > 0 ? verifiedStageCount / totalStageCount : 0;
  const qualifiedRate = totals.reviewed > 0 ? totals.qualified / totals.reviewed : null;
  const opportunityRate = totals.qualified > 0 ? totals.opportunities / totals.qualified : null;
  const winRate = totals.opportunities > 0 ? totals.won / totals.opportunities : null;
  const revenuePerQualified = totals.qualified > 0 ? totals.revenue / totals.qualified : null;
  const revenuePerOpportunity = totals.opportunities > 0 ? totals.revenue / totals.opportunities : null;

  return {
    totals,
    pending: [...pending],
    evidenceCompleteness: completeness,
    searchVerified,
    qualifiedRate,
    opportunityRate,
    winRate,
    revenuePerQualified,
    revenuePerOpportunity,
  };
}

export const defaultRevenueDashboardFixture = Object.freeze({
  period: {
    timezone: "America/Chicago",
    date_range: "GSC historical checkpoint supplied 2026-08-12; private operating period pending",
    attribution_basis: "Search checkpoint is separate from private lead/revenue evidence. No search-to-revenue attribution is claimed.",
    synthetic_test_exclusion: true,
  },
  search_checkpoint: {
    evidence_class: "PLATFORM_VERIFIED",
    label: "Owner-supplied GSC Performance export",
    date_range: "Web · last 3 months export supplied 2026-08-12",
    source: "Authenticated Google Search Console aggregate export",
    clicks: 10,
    impressions: 276,
    ctr: 0.0362,
    average_position: 38.98,
  },
  directions: [
    { direction_id: "logistics_carrier", label: "Logistics · carrier / owner-operator" },
    { direction_id: "logistics_transport", label: "Logistics · dealer / auction / vehicle transport" },
    { direction_id: "marketing_seo", label: "Marketing · SEO" },
    { direction_id: "it_website_automation", label: "IT · website / automation" },
    { direction_id: "academy", label: "Academy · applications / training" },
  ],
});
