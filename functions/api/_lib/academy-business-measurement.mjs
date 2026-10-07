import { getAcademyBusinessCrmContext } from "./academy-business-crm.mjs";

const EVIDENCE_KINDS = new Set(["organic_baseline","paid_spend","ltv","result_claim","business_result","retention","other"]);
const CLAIM_STATES = new Set(["evidence_only","needs_review","approved","rejected","expired"]);
const ENROLLED_STAGES = new Set(["enrolled","active","completed","renewal"]);
const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

const clean = (value, max = 240) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

const enumValue = (value, allowed, fallback) => {
  const normalized = clean(value, 60).toLowerCase().replace(/[\s-]+/g, "_");
  return allowed.has(normalized) ? normalized : fallback;
};

const currencyCode = (value) => {
  const currency = clean(value, 3).toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : "";
};

const nullableCents = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.min(Math.round(parsed), 100_000_000_000);
};

const nullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(-1_000_000_000_000, Math.min(parsed, 1_000_000_000_000));
};

const cleanDate = (value) => {
  const text = clean(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
};

const cleanObservedAt = (value) => {
  const text = clean(value, 40);
  if (!text || !Number.isFinite(Date.parse(text))) return "";
  return new Date(text).toISOString();
};

export async function ensureAcademyBusinessMeasurementSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_evidence (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      source_channel TEXT,
      content_id TEXT,
      campaign_id TEXT,
      metric_key TEXT,
      metric_value REAL,
      metric_unit TEXT,
      amount_cents INTEGER,
      currency TEXT,
      source_ref TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      period_start TEXT,
      period_end TEXT,
      definition TEXT NOT NULL,
      evidence_owner_label TEXT NOT NULL,
      claim_text TEXT,
      approved_wording TEXT,
      claim_state TEXT NOT NULL DEFAULT 'evidence_only',
      review_at TEXT,
      notes TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_evidence_owner_kind ON hermes_academy_business_evidence(owner_specialist_id,company_id,kind,observed_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_evidence_campaign ON hermes_academy_business_evidence(company_id,source_channel,campaign_id,content_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_evidence_claim_state ON hermes_academy_business_evidence(company_id,claim_state,review_at)").run();
}

export async function getAcademyBusinessMeasurementContext(request, env) {
  const ctx = await getAcademyBusinessCrmContext(request, env);
  if (ctx.error) return ctx;
  await ensureAcademyBusinessMeasurementSchema(env.DB);
  return ctx;
}

export function normalizeAcademyBusinessEvidence(body, existing = {}) {
  const kind = enumValue(body.kind ?? existing.kind ?? "other", EVIDENCE_KINDS, "other");
  const defaultClaimState = kind === "result_claim" ? "needs_review" : "evidence_only";
  return {
    kind,
    sourceChannel: clean(body.sourceChannel ?? existing.source_channel, 80).toLowerCase(),
    contentId: clean(body.contentId ?? existing.content_id, 160),
    campaignId: clean(body.campaignId ?? existing.campaign_id, 160),
    metricKey: clean(body.metricKey ?? existing.metric_key, 120),
    metricValue: nullableNumber(body.metricValue ?? existing.metric_value),
    metricUnit: clean(body.metricUnit ?? existing.metric_unit, 40),
    amountCents: nullableCents(body.amountCents ?? existing.amount_cents),
    currency: currencyCode(body.currency ?? existing.currency),
    sourceRef: clean(body.sourceRef ?? existing.source_ref, 600),
    observedAt: cleanObservedAt(body.observedAt ?? existing.observed_at),
    periodStart: cleanDate(body.periodStart ?? existing.period_start),
    periodEnd: cleanDate(body.periodEnd ?? existing.period_end),
    definition: clean(body.definition ?? existing.definition, 1200),
    evidenceOwnerLabel: clean(body.evidenceOwnerLabel ?? existing.evidence_owner_label, 180),
    claimText: clean(body.claimText ?? existing.claim_text, 1200),
    approvedWording: clean(body.approvedWording ?? existing.approved_wording, 1200),
    claimState: enumValue(body.claimState ?? existing.claim_state ?? defaultClaimState, CLAIM_STATES, defaultClaimState),
    reviewAt: cleanDate(body.reviewAt ?? existing.review_at),
    notes: clean(body.notes ?? existing.notes, 1600),
  };
}

export function academyBusinessEvidenceErrors(value) {
  const errors = [];
  if (!value.sourceRef) errors.push("evidence_source_ref_required");
  if (!value.observedAt) errors.push("evidence_observed_at_required");
  if (value.definition.length < 3) errors.push("evidence_definition_required");
  if (value.evidenceOwnerLabel.length < 2) errors.push("evidence_owner_required");
  if (value.periodStart && value.periodEnd && value.periodEnd < value.periodStart) errors.push("evidence_period_invalid");

  if (value.kind === "organic_baseline") {
    if (!value.periodStart || !value.periodEnd) errors.push("baseline_period_required");
    if (!value.metricKey || value.metricValue === null || !value.metricUnit) errors.push("baseline_metric_required");
  }

  if (value.kind === "paid_spend") {
    if (!value.sourceChannel) errors.push("spend_source_channel_required");
    if (!value.periodStart || !value.periodEnd) errors.push("spend_period_required");
    if (value.amountCents === null || value.amountCents <= 0) errors.push("spend_amount_required");
    if (!value.currency) errors.push("spend_currency_required");
  }

  if (value.kind === "ltv") {
    if (value.amountCents === null || value.amountCents <= 0) errors.push("ltv_amount_required");
    if (!value.currency) errors.push("ltv_currency_required");
  }

  if (value.kind === "result_claim") {
    if (!value.claimText) errors.push("claim_text_required");
    if (!value.reviewAt) errors.push("claim_review_at_required");
    if (value.claimState === "approved" && !value.approvedWording) errors.push("approved_wording_required");
  }

  return errors;
}

export function safeAcademyBusinessEvidence(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    kind: row.kind || "other",
    sourceChannel: row.source_channel || "",
    contentId: row.content_id || "",
    campaignId: row.campaign_id || "",
    metricKey: row.metric_key || "",
    metricValue: row.metric_value === null || row.metric_value === undefined ? null : Number(row.metric_value),
    metricUnit: row.metric_unit || "",
    amountCents: row.amount_cents === null || row.amount_cents === undefined ? null : Number(row.amount_cents),
    currency: currencyCode(row.currency),
    sourceRef: row.source_ref || "",
    observedAt: row.observed_at || "",
    periodStart: row.period_start || null,
    periodEnd: row.period_end || null,
    definition: row.definition || "",
    evidenceOwnerLabel: row.evidence_owner_label || "",
    claimText: row.claim_text || "",
    approvedWording: row.approved_wording || "",
    claimState: row.claim_state || "evidence_only",
    reviewAt: row.review_at || null,
    notes: row.notes || "",
    archivedAt: row.archived_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const matchesScope = (lead, row) => {
  if (row.source_channel && clean(lead.source_channel, 80).toLowerCase() !== clean(row.source_channel, 80).toLowerCase()) return false;
  if (row.campaign_id && clean(lead.campaign_id, 160) !== clean(row.campaign_id, 160)) return false;
  if (row.content_id && clean(lead.content_id, 160) !== clean(row.content_id, 160)) return false;
  const createdAt = Date.parse(String(lead.created_at || ""));
  if (!Number.isFinite(createdAt)) return false;
  if (row.period_start && createdAt < Date.parse(`${row.period_start}T00:00:00.000Z`)) return false;
  if (row.period_end && createdAt > Date.parse(`${row.period_end}T23:59:59.999Z`)) return false;
  return true;
};

const scopeKey = (row) => [
  currencyCode(row.currency) || "UNKNOWN",
  clean(row.source_channel, 80).toLowerCase() || "*",
  clean(row.campaign_id, 160) || "*",
  clean(row.content_id, 160) || "*",
  clean(row.period_start, 10) || "*",
  clean(row.period_end, 10) || "*",
].join("|");

export function aggregateAcademyBusinessMeasurement(evidenceRows = [], leadRows = []) {
  const evidence = evidenceRows.filter((row) => !row.archived_at);
  const leads = leadRows.filter((row) => !row.archived_at);
  const spendRows = evidence.filter((row) =>
    row.kind === "paid_spend" &&
    Number(row.amount_cents) > 0 &&
    Boolean(currencyCode(row.currency)) &&
    Boolean(clean(row.source_ref, 600))
  );

  const spendGroups = new Map();
  for (const row of spendRows) {
    const key = scopeKey(row);
    const group = spendGroups.get(key) || {
      key,
      currency: currencyCode(row.currency),
      sourceChannel: row.source_channel || "",
      campaignId: row.campaign_id || "",
      contentId: row.content_id || "",
      periodStart: row.period_start || null,
      periodEnd: row.period_end || null,
      spendCents: 0,
      evidenceCount: 0,
    };
    group.spendCents += Number(row.amount_cents || 0);
    group.evidenceCount += 1;
    spendGroups.set(key, group);
  }

  const economics = [...spendGroups.values()].map((group) => {
    const scopeRows = spendRows.filter((row) => scopeKey(row) === group.key);
    const scopedLeads = leads.filter((lead) => scopeRows.some((row) => matchesScope(lead, row)));
    const soldLeads = scopedLeads.filter((lead) => ENROLLED_STAGES.has(String(lead.business_stage)));
    const uniqueSales = new Map(soldLeads.map((lead) => [String(lead.id), lead]));
    const sales = [...uniqueSales.values()];
    const revenueRows = sales.filter((lead) =>
      lead.sale_revenue_cents !== null &&
      lead.sale_revenue_cents !== undefined &&
      currencyCode(lead.revenue_currency) === group.currency &&
      Boolean(clean(lead.revenue_source_ref, 300))
    );
    const revenueComplete = sales.length > 0 && revenueRows.length === sales.length;
    const revenueCents = revenueRows.reduce((sum, lead) => sum + Number(lead.sale_revenue_cents || 0), 0);
    return {
      key: group.key,
      currency: group.currency,
      sourceChannel: group.sourceChannel,
      campaignId: group.campaignId,
      contentId: group.contentId,
      periodStart: group.periodStart,
      periodEnd: group.periodEnd,
      spendCents: group.spendCents,
      evidenceCount: group.evidenceCount,
      attributedLeads: scopedLeads.length,
      attributedSales: sales.length,
      leadToSaleRatio: scopedLeads.length > 0 ? sales.length / scopedLeads.length : null,
      costPerLeadCents: scopedLeads.length > 0 ? Math.round(group.spendCents / scopedLeads.length) : null,
      attributedRevenueKnownCount: revenueRows.length,
      revenueCents: revenueComplete ? revenueCents : null,
      cacCents: sales.length > 0 ? Math.round(group.spendCents / sales.length) : null,
      romiRatio: revenueComplete && group.spendCents > 0 ? (revenueCents - group.spendCents) / group.spendCents : null,
      revenueComplete,
    };
  }).sort((a, b) => b.spendCents - a.spendCents);

  const organicBaselines = evidence
    .filter((row) => row.kind === "organic_baseline")
    .sort((a, b) => String(b.observed_at).localeCompare(String(a.observed_at)))
    .map(safeAcademyBusinessEvidence);

  const ltvEvidence = evidence
    .filter((row) => row.kind === "ltv" && Number(row.amount_cents) > 0 && currencyCode(row.currency))
    .sort((a, b) => String(b.observed_at).localeCompare(String(a.observed_at)))
    .map(safeAcademyBusinessEvidence);

  const claims = evidence
    .filter((row) => row.kind === "result_claim")
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
    .map(safeAcademyBusinessEvidence);
  const today = new Date().toISOString().slice(0, 10);
  const approvedClaims = claims.filter((item) => item.claimState === "approved");
  const publicReadyClaims = approvedClaims.filter((item) =>
    Boolean(item.approvedWording) &&
    Boolean(item.reviewAt) &&
    String(item.reviewAt) >= today
  );

  return {
    evidenceCount: evidence.length,
    organicBaselines,
    economics,
    ltvEvidence,
    claims,
    publicReadyClaims,
    approvedClaimCount: approvedClaims.length,
    publicReadyClaimCount: publicReadyClaims.length,
    staleApprovedClaimCount: approvedClaims.length - publicReadyClaims.length,
    needsReviewClaimCount: claims.filter((item) => item.claimState === "needs_review").length,
  };
}
