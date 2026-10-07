import { getAuthenticatedSpecialist } from "./session.mjs";
import { ensureHermesCompanyProfilesSchema } from "./hermes-company-profiles.mjs";
import {
  cleanAcademyBusinessText,
  ensureAcademyBusinessProfilesSchema,
} from "./academy-business-profiles.mjs";

export const ACADEMY_CRM_STAGES = new Set([
  "new",
  "contacted",
  "qualified",
  "consultation_booked",
  "consultation_attended",
  "program_fit",
  "decision",
  "enrolled",
  "active",
  "completed",
  "lost",
  "renewal",
]);

export const ACADEMY_CONSULTATION_STATUSES = new Set([
  "not_scheduled",
  "booked",
  "attended",
  "qualified",
  "no_show",
  "cancelled",
  "not_fit",
]);

const ORGANIC_STATES = new Set(["unknown","organic","organic_winner","not_applicable"]);
const PAID_STATES = new Set(["unknown","not_started","learning","validated","paused","not_applicable"]);
const COMPLETION_STATES = new Set(["unknown","not_started","active","completed","withdrawn"]);
const RENEWAL_STATES = new Set(["unknown","not_due","eligible","offered","renewed","declined"]);
const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

const clean = (value, max = 240) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

const normalizedEnum = (value, allowed, fallback) => {
  const normalized = clean(value, 60).toLowerCase().replace(/[\s-]+/g, "_");
  return allowed.has(normalized) ? normalized : fallback;
};

const nullableCents = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.min(Math.round(number), 100_000_000_000);
};

const currencyCode = (value) => {
  const currency = clean(value, 3).toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : "";
};

async function ensureAcademyCrmRevenueCurrencyColumn(db) {
  const existing = await db.prepare("PRAGMA table_info(hermes_academy_business_leads)").all();
  const names = new Set((existing?.results || []).map((row) => String(row.name || "")));
  if (names.has("revenue_currency")) return;
  try {
    await db.prepare("ALTER TABLE hermes_academy_business_leads ADD COLUMN revenue_currency TEXT").run();
  } catch (error) {
    const current = await db.prepare("PRAGMA table_info(hermes_academy_business_leads)").all();
    const currentNames = new Set((current?.results || []).map((row) => String(row.name || "")));
    if (!currentNames.has("revenue_currency")) throw error;
  }
}

export async function ensureAcademyBusinessCrmSchema(db) {
  await ensureHermesCompanyProfilesSchema(db);
  await ensureAcademyBusinessProfilesSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_leads (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_phone TEXT,
      contact_email TEXT,
      source_channel TEXT NOT NULL DEFAULT 'direct',
      content_id TEXT,
      content_format TEXT,
      campaign_id TEXT,
      cta_keyword TEXT,
      entry_offer TEXT,
      organic_state TEXT NOT NULL DEFAULT 'unknown',
      paid_learning_state TEXT NOT NULL DEFAULT 'unknown',
      audience_geo TEXT,
      primary_pain TEXT,
      diagnostic_primary_gap TEXT,
      diagnostic_result TEXT,
      baseline TEXT,
      recommended_module TEXT,
      reason_to_believe TEXT,
      business_stage TEXT NOT NULL DEFAULT 'new',
      manager TEXT,
      consultation_status TEXT NOT NULL DEFAULT 'not_scheduled',
      next_action TEXT,
      next_contact_at TEXT,
      promise_text TEXT,
      program_fit TEXT,
      objection TEXT,
      sale_revenue_cents INTEGER,
      revenue_currency TEXT,
      revenue_source_ref TEXT,
      outcome TEXT,
      cohort TEXT,
      completion_status TEXT NOT NULL DEFAULT 'unknown',
      renewal_status TEXT NOT NULL DEFAULT 'unknown',
      notes TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await ensureAcademyCrmRevenueCurrencyColumn(db);
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_crm_leads_owner_stage ON hermes_academy_business_leads(owner_specialist_id,business_stage,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_crm_leads_company_stage ON hermes_academy_business_leads(company_id,business_stage,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_crm_leads_owner_source ON hermes_academy_business_leads(owner_specialist_id,source_channel)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_crm_leads_owner_next ON hermes_academy_business_leads(owner_specialist_id,next_contact_at)").run();
}

export async function getAcademyBusinessCrmContext(request, env) {
  if (!env?.DB) return { error: { status: 503, code: "database_not_configured" } };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: { status: 401, code: "authentication_required" } };
  await ensureAcademyBusinessCrmSchema(env.DB);
  const company = await env.DB.prepare(`
    SELECT
      c.id,
      c.company_name,
      c.slug,
      c.city,
      c.state,
      c.country_code,
      c.website,
      c.catalog_opt_in,
      c.catalog_status,
      a.id AS academy_profile_id,
      a.academy_type
    FROM hermes_academy_business_profiles a
    JOIN hermes_company_profiles c ON c.id=a.company_id
    WHERE a.owner_specialist_id=? AND c.owner_specialist_id=?
    LIMIT 1
  `).bind(specialist.id, specialist.id).first();
  if (!company?.id) return { error: { status: 403, code: "academy_business_required" } };
  return { specialist, company };
}

export function normalizeAcademyCrmLead(body, existing = {}) {
  const stage = normalizedEnum(body.businessStage ?? existing.business_stage ?? "new", ACADEMY_CRM_STAGES, "new");
  const consultationStatus = normalizedEnum(
    body.consultationStatus ?? existing.consultation_status ?? "not_scheduled",
    ACADEMY_CONSULTATION_STATUSES,
    "not_scheduled",
  );
  const organicState = normalizedEnum(body.organicState ?? existing.organic_state ?? "unknown", ORGANIC_STATES, "unknown");
  const paidLearningState = normalizedEnum(body.paidLearningState ?? existing.paid_learning_state ?? "unknown", PAID_STATES, "unknown");
  const completionStatus = normalizedEnum(body.completionStatus ?? existing.completion_status ?? "unknown", COMPLETION_STATES, "unknown");
  const renewalStatus = normalizedEnum(body.renewalStatus ?? existing.renewal_status ?? "unknown", RENEWAL_STATES, "unknown");

  return {
    contactName: clean(body.contactName ?? existing.contact_name, 160),
    contactPhone: clean(body.contactPhone ?? existing.contact_phone, 50),
    contactEmail: clean(body.contactEmail ?? existing.contact_email, 180).toLowerCase(),
    sourceChannel: clean(body.sourceChannel ?? existing.source_channel ?? "direct", 80) || "direct",
    contentId: clean(body.contentId ?? existing.content_id, 160),
    contentFormat: clean(body.contentFormat ?? existing.content_format, 80),
    campaignId: clean(body.campaignId ?? existing.campaign_id, 160),
    ctaKeyword: clean(body.ctaKeyword ?? existing.cta_keyword, 160),
    entryOffer: clean(body.entryOffer ?? existing.entry_offer, 240),
    organicState,
    paidLearningState,
    audienceGeo: clean(body.audienceGeo ?? existing.audience_geo, 160),
    primaryPain: clean(body.primaryPain ?? existing.primary_pain, 600),
    diagnosticPrimaryGap: clean(body.diagnosticPrimaryGap ?? existing.diagnostic_primary_gap, 600),
    diagnosticResult: clean(body.diagnosticResult ?? existing.diagnostic_result, 1000),
    baseline: clean(body.baseline ?? existing.baseline, 1000),
    recommendedModule: clean(body.recommendedModule ?? existing.recommended_module, 180),
    reasonToBelieve: clean(body.reasonToBelieve ?? existing.reason_to_believe, 600),
    businessStage: stage,
    manager: clean(body.manager ?? existing.manager, 160),
    consultationStatus,
    nextAction: clean(body.nextAction ?? existing.next_action, 400),
    nextContactAt: clean(body.nextContactAt ?? existing.next_contact_at, 40),
    promise: clean(body.promise ?? existing.promise_text, 600),
    programFit: clean(body.programFit ?? existing.program_fit, 600),
    objection: clean(body.objection ?? existing.objection, 600),
    saleRevenueCents: nullableCents(body.saleRevenueCents ?? existing.sale_revenue_cents),
    revenueCurrency: currencyCode(body.revenueCurrency ?? existing.revenue_currency),
    revenueSourceRef: clean(body.revenueSourceRef ?? existing.revenue_source_ref, 300),
    outcome: clean(body.outcome ?? existing.outcome, 800),
    cohort: clean(body.cohort ?? existing.cohort, 180),
    completionStatus,
    renewalStatus,
    notes: clean(body.notes ?? existing.notes, 1600),
  };
}

export function academyCrmLeadErrors(value) {
  const errors = [];
  if (value.contactName.length < 2) errors.push("contact_name_required");
  if (value.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contactEmail)) errors.push("contact_email_invalid");
  if (value.contactPhone && value.contactPhone.length < 7) errors.push("contact_phone_invalid");
  if (value.saleRevenueCents !== null && value.saleRevenueCents > 0) {
    if (!value.revenueSourceRef) errors.push("revenue_source_ref_required");
    if (!value.revenueCurrency) errors.push("revenue_currency_required");
  }
  return errors;
}

export function safeAcademyCrmLead(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    contactName: row.contact_name || "",
    contactPhone: row.contact_phone || "",
    contactEmail: row.contact_email || "",
    sourceChannel: row.source_channel || "direct",
    contentId: row.content_id || "",
    contentFormat: row.content_format || "",
    campaignId: row.campaign_id || "",
    ctaKeyword: row.cta_keyword || "",
    entryOffer: row.entry_offer || "",
    organicState: row.organic_state || "unknown",
    paidLearningState: row.paid_learning_state || "unknown",
    audienceGeo: row.audience_geo || "",
    primaryPain: row.primary_pain || "",
    diagnosticPrimaryGap: row.diagnostic_primary_gap || "",
    diagnosticResult: row.diagnostic_result || "",
    baseline: row.baseline || "",
    recommendedModule: row.recommended_module || "",
    reasonToBelieve: row.reason_to_believe || "",
    businessStage: row.business_stage || "new",
    manager: row.manager || "",
    consultationStatus: row.consultation_status || "not_scheduled",
    nextAction: row.next_action || "",
    nextContactAt: row.next_contact_at || null,
    promise: row.promise_text || "",
    programFit: row.program_fit || "",
    objection: row.objection || "",
    saleRevenueCents: row.sale_revenue_cents === null || row.sale_revenue_cents === undefined ? null : Number(row.sale_revenue_cents),
    revenueCurrency: currencyCode(row.revenue_currency),
    revenueSourceRef: row.revenue_source_ref || "",
    outcome: row.outcome || "",
    cohort: row.cohort || "",
    completionStatus: row.completion_status || "unknown",
    renewalStatus: row.renewal_status || "unknown",
    notes: row.notes || "",
    archivedAt: row.archived_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function aggregateAcademyCrmLeads(rows = []) {
  const activeRows = rows.filter((row) => !row.archived_at);
  const consultationBookedStates = new Set(["booked","attended","qualified"]);
  const consultationAttendedStates = new Set(["attended","qualified"]);
  const qualifiedStages = new Set(["qualified","consultation_booked","consultation_attended","program_fit","decision","enrolled","active","completed","renewal"]);
  const enrolledStages = new Set(["enrolled","active","completed","renewal"]);

  const revenueRows = activeRows.filter((row) =>
    row.sale_revenue_cents !== null &&
    row.sale_revenue_cents !== undefined &&
    Number(row.sale_revenue_cents) >= 0 &&
    Boolean(currencyCode(row.revenue_currency)) &&
    Boolean(clean(row.revenue_source_ref, 300))
  );
  const revenueUnknownCurrencyCount = activeRows.filter((row) =>
    row.sale_revenue_cents !== null &&
    row.sale_revenue_cents !== undefined &&
    !currencyCode(row.revenue_currency)
  ).length;

  const revenueByCurrencyMap = new Map();
  for (const row of revenueRows) {
    const currency = currencyCode(row.revenue_currency);
    revenueByCurrencyMap.set(currency, (revenueByCurrencyMap.get(currency) || 0) + Number(row.sale_revenue_cents || 0));
  }
  const revenueByCurrency = [...revenueByCurrencyMap.entries()]
    .map(([currency, cents]) => ({ currency, cents }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
  const singleRevenueCurrency = revenueByCurrency.length === 1 ? revenueByCurrency[0] : null;

  const bySourceMap = new Map();
  for (const row of activeRows) {
    const key = clean(row.source_channel, 80) || "Unknown";
    const item = bySourceMap.get(key) || {
      key,
      leads: 0,
      qualified: 0,
      enrolled: 0,
      revenueKnownCount: 0,
      revenueByCurrencyMap: new Map(),
    };
    item.leads += 1;
    if (qualifiedStages.has(String(row.business_stage))) item.qualified += 1;
    if (enrolledStages.has(String(row.business_stage))) item.enrolled += 1;
    const currency = currencyCode(row.revenue_currency);
    if (
      row.sale_revenue_cents !== null &&
      row.sale_revenue_cents !== undefined &&
      currency &&
      clean(row.revenue_source_ref, 300)
    ) {
      item.revenueKnownCount += 1;
      item.revenueByCurrencyMap.set(
        currency,
        (item.revenueByCurrencyMap.get(currency) || 0) + Number(row.sale_revenue_cents || 0),
      );
    }
    bySourceMap.set(key, item);
  }

  const bySource = [...bySourceMap.values()].map((item) => {
    const revenueByCurrency = [...item.revenueByCurrencyMap.entries()]
      .map(([currency, cents]) => ({ currency, cents }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
    const single = revenueByCurrency.length === 1 ? revenueByCurrency[0] : null;
    return {
      key: item.key,
      leads: item.leads,
      qualified: item.qualified,
      enrolled: item.enrolled,
      revenueKnownCount: item.revenueKnownCount,
      revenueCents: single ? single.cents : null,
      revenueCurrency: single ? single.currency : null,
      revenueByCurrency,
    };
  }).sort((a, b) => b.enrolled - a.enrolled || b.qualified - a.qualified || b.leads - a.leads);

  return {
    totalLeads: activeRows.length,
    qualifiedLeads: activeRows.filter((row) => qualifiedStages.has(String(row.business_stage))).length,
    consultationsBooked: activeRows.filter((row) => consultationBookedStates.has(String(row.consultation_status))).length,
    consultationsAttended: activeRows.filter((row) => consultationAttendedStates.has(String(row.consultation_status))).length,
    consultationsQualified: activeRows.filter((row) => String(row.consultation_status) === "qualified").length,
    enrolled: activeRows.filter((row) => enrolledStages.has(String(row.business_stage))).length,
    revenueKnownCount: revenueRows.length,
    revenueUnknownCurrencyCount,
    revenueCents: singleRevenueCurrency ? singleRevenueCurrency.cents : null,
    revenueCurrency: singleRevenueCurrency ? singleRevenueCurrency.currency : null,
    revenueByCurrency,
    bySource,
  };
}
