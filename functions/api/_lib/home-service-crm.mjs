import { getAuthenticatedSpecialist } from "./session.mjs";
import { ensureHermesCompanyProfilesSchema } from "./hermes-company-profiles.mjs";
import { ensureInternalAiSchema } from "./internal-ai.mjs";

const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");
export const HOME_SERVICE_SUBTYPES = new Set(["junk_removal", "cleaning", "landscaping", "moving", "handyman", "other"]);
export const HOME_SERVICE_LEAD_STATUSES = new Set(["new", "contacted", "quoted", "follow_up", "booked", "in_progress", "completed", "lost", "cancelled"]);
const PAYMENT_METHODS = new Set(["", "cash", "card", "check", "zelle", "venmo", "apple_pay", "other"]);

export const cleanHomeServiceText = (value, max = 180) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

const hasOwn = (value, key) => Boolean(value && Object.prototype.hasOwnProperty.call(value, key));

const moneyField = (body, key, existing, centsField, knownField) => {
  if (!hasOwn(body, key)) {
    return {
      cents: Number(existing?.[centsField] || 0),
      known: Number(existing?.[knownField] || 0) === 1,
      invalid: false,
    };
  }
  const raw = body[key];
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return { cents: 0, known: false, invalid: false };
  }
  const number = Number(raw);
  if (!Number.isFinite(number) || number < 0) return { cents: 0, known: false, invalid: true };
  return { cents: Math.min(Math.round(number), 100_000_000), known: true, invalid: false };
};

const nonNegativeInteger = (value, max = 100_000) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.min(Math.round(number), max);
};

const safeJsonArray = (value, maxItems = 50, maxLength = 240) => {
  const raw = Array.isArray(value) ? value : [];
  return [...new Set(raw.map((item) => cleanHomeServiceText(item, maxLength)).filter(Boolean))].slice(0, maxItems);
};

export async function ensureHomeServiceCrmSchema(db) {
  await ensureHermesCompanyProfilesSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_home_service_profiles (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL UNIQUE,
      company_id TEXT NOT NULL UNIQUE,
      service_subtype TEXT NOT NULL DEFAULT 'other',
      services_json TEXT NOT NULL DEFAULT '[]',
      service_areas_json TEXT NOT NULL DEFAULT '[]',
      public_summary TEXT,
      semantic_core_ref TEXT,
      content_status TEXT NOT NULL DEFAULT 'ready_for_clustering',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_home_service_leads (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'direct',
      search_query TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_email TEXT,
      address_line1 TEXT,
      postal_code TEXT,
      city TEXT,
      job_type TEXT,
      photo_refs_json TEXT NOT NULL DEFAULT '[]',
      approximate_volume TEXT,
      lead_cost_cents INTEGER NOT NULL DEFAULT 0,
      lead_cost_known INTEGER NOT NULL DEFAULT 0 CHECK (lead_cost_known IN (0,1)),
      lead_cost_source_ref TEXT,
      quote_cents INTEGER NOT NULL DEFAULT 0,
      quote_known INTEGER NOT NULL DEFAULT 0 CHECK (quote_known IN (0,1)),
      quote_source_ref TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      job_start_at TEXT,
      assigned_driver TEXT,
      final_amount_cents INTEGER NOT NULL DEFAULT 0,
      final_amount_known INTEGER NOT NULL DEFAULT 0 CHECK (final_amount_known IN (0,1)),
      final_amount_source_ref TEXT,
      disposal_cost_cents INTEGER NOT NULL DEFAULT 0,
      disposal_cost_known INTEGER NOT NULL DEFAULT 0 CHECK (disposal_cost_known IN (0,1)),
      disposal_cost_source_ref TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT,
      loss_reason TEXT,
      follow_up_at TEXT,
      review_requested_at TEXT,
      review_received_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();

  const columns = await db.prepare("PRAGMA table_info(hermes_home_service_leads)").all();
  const columnNames = new Set((columns?.results || []).map((row) => String(row.name || "")));
  for (const [name, definition] of [
    ["lead_cost_known", "INTEGER NOT NULL DEFAULT 0 CHECK (lead_cost_known IN (0,1))"],
    ["lead_cost_source_ref", "TEXT"],
    ["quote_known", "INTEGER NOT NULL DEFAULT 0 CHECK (quote_known IN (0,1))"],
    ["quote_source_ref", "TEXT"],
    ["final_amount_known", "INTEGER NOT NULL DEFAULT 0 CHECK (final_amount_known IN (0,1))"],
    ["final_amount_source_ref", "TEXT"],
    ["disposal_cost_known", "INTEGER NOT NULL DEFAULT 0 CHECK (disposal_cost_known IN (0,1))"],
    ["disposal_cost_source_ref", "TEXT"],
  ]) {
    if (!columnNames.has(name)) await db.prepare(`ALTER TABLE hermes_home_service_leads ADD COLUMN ${name} ${definition}`).run();
  }

  // Conservative historical migration: a non-zero stored amount could not have come from an omitted field.
  // Historical zero stays UNKNOWN because the old model could not distinguish omitted from observed zero.
  await db.prepare("UPDATE hermes_home_service_leads SET lead_cost_known=1 WHERE lead_cost_known=0 AND lead_cost_cents<>0").run();
  await db.prepare("UPDATE hermes_home_service_leads SET quote_known=1 WHERE quote_known=0 AND quote_cents<>0").run();
  await db.prepare("UPDATE hermes_home_service_leads SET final_amount_known=1 WHERE final_amount_known=0 AND final_amount_cents<>0").run();
  await db.prepare("UPDATE hermes_home_service_leads SET disposal_cost_known=1 WHERE disposal_cost_known=0 AND disposal_cost_cents<>0").run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_home_service_leads_owner_status ON hermes_home_service_leads(owner_specialist_id,status,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_home_service_leads_owner_city ON hermes_home_service_leads(owner_specialist_id,city)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_home_service_leads_owner_source ON hermes_home_service_leads(owner_specialist_id,source)").run();
}

export async function getHomeServiceContext(request, env) {
  if (!env?.DB) return { error: { status: 503, code: "database_not_configured" } };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: { status: 401, code: "authentication_required" } };
  await ensureHomeServiceCrmSchema(env.DB);

  const managedSlug = cleanHomeServiceText(new URL(request.url).searchParams.get("managed"), 120)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  if (managedSlug) {
    await ensureInternalAiSchema(env.DB);
    const access = await env.DB.prepare(`
      SELECT specialist_id
      FROM hermes_internal_owner_access
      WHERE specialist_id=? AND active=1 AND capability='HERMES_INTERNAL_OWNER'
      LIMIT 1
    `).bind(specialist.id).first();
    if (!access) return { error: { status: 403, code: "hermes_internal_owner_required" } };

    const company = await env.DB.prepare(`
      SELECT id,owner_specialist_id,company_name,slug,company_type,city,state,website,phone,address_line1,postal_code,country_code,timezone,
             catalog_opt_in,catalog_status,management_mode,catalog_publication_basis
      FROM hermes_company_profiles
      WHERE slug=? AND company_type='home_service' AND management_mode='hermes_managed'
      LIMIT 1
    `).bind(managedSlug).first();
    if (!company) return { error: { status: 404, code: "managed_home_service_not_found" } };
    return {
      specialist,
      company,
      dataOwnerId: String(company.owner_specialist_id || ""),
      accessMode: "hermes_managed",
    };
  }

  const company = await env.DB.prepare(`
    SELECT id,owner_specialist_id,company_name,slug,company_type,city,state,website,phone,address_line1,postal_code,country_code,timezone,
           catalog_opt_in,catalog_status,management_mode,catalog_publication_basis
    FROM hermes_company_profiles
    WHERE owner_specialist_id=?
    LIMIT 1
  `).bind(specialist.id).first();
  if (!company || String(company.company_type) !== "home_service") {
    return { error: { status: 403, code: "home_service_company_required" } };
  }
  return {
    specialist,
    company,
    dataOwnerId: String(specialist.id),
    accessMode: "owner_managed",
  };
}

export function normalizeHomeServiceProfile(body, existing = {}) {
  const subtypeRaw = cleanHomeServiceText(body.serviceSubtype ?? existing.service_subtype ?? "other", 40).toLowerCase().replace(/[\s-]+/g, "_");
  const serviceSubtype = HOME_SERVICE_SUBTYPES.has(subtypeRaw) ? subtypeRaw : "other";
  const services = safeJsonArray(body.services ?? (() => { try { return JSON.parse(existing.services_json || "[]"); } catch { return []; } })(), 40, 120);
  const serviceAreas = safeJsonArray(body.serviceAreas ?? (() => { try { return JSON.parse(existing.service_areas_json || "[]"); } catch { return []; } })(), 60, 120);
  const publicSummary = cleanHomeServiceText(body.publicSummary ?? existing.public_summary, 1000);
  const semanticCoreRef = cleanHomeServiceText(body.semanticCoreRef ?? existing.semantic_core_ref, 240);
  const contentStatus = cleanHomeServiceText(body.contentStatus ?? existing.content_status ?? "ready_for_clustering", 60) || "ready_for_clustering";
  return { serviceSubtype, services, serviceAreas, publicSummary, semanticCoreRef, contentStatus };
}

export function normalizeHomeServiceLead(body, existing = {}) {
  const statusRaw = cleanHomeServiceText(body.status ?? existing.status ?? "new", 30).toLowerCase().replace(/[\s-]+/g, "_");
  const status = HOME_SERVICE_LEAD_STATUSES.has(statusRaw) ? statusRaw : "new";
  const paymentRaw = cleanHomeServiceText(body.paymentMethod ?? existing.payment_method ?? "", 30).toLowerCase().replace(/[\s-]+/g, "_");
  const paymentMethod = PAYMENT_METHODS.has(paymentRaw) ? paymentRaw : "other";
  const photoFallback = (() => { try { return JSON.parse(existing.photo_refs_json || "[]"); } catch { return []; } })();
  const leadCost = moneyField(body, "leadCostCents", existing, "lead_cost_cents", "lead_cost_known");
  const quote = moneyField(body, "quoteCents", existing, "quote_cents", "quote_known");
  const finalAmount = moneyField(body, "finalAmountCents", existing, "final_amount_cents", "final_amount_known");
  const disposalCost = moneyField(body, "disposalCostCents", existing, "disposal_cost_cents", "disposal_cost_known");
  const invalidMoneyFields = [
    leadCost.invalid ? "leadCostCents" : "",
    quote.invalid ? "quoteCents" : "",
    finalAmount.invalid ? "finalAmountCents" : "",
    disposalCost.invalid ? "disposalCostCents" : "",
  ].filter(Boolean);
  return {
    source: cleanHomeServiceText(body.source ?? existing.source ?? "direct", 80) || "direct",
    searchQuery: cleanHomeServiceText(body.searchQuery ?? existing.search_query, 240),
    customerName: cleanHomeServiceText(body.customerName ?? existing.customer_name, 140),
    customerPhone: cleanHomeServiceText(body.customerPhone ?? existing.customer_phone, 50),
    customerEmail: cleanHomeServiceText(body.customerEmail ?? existing.customer_email, 160).toLowerCase(),
    addressLine1: cleanHomeServiceText(body.addressLine1 ?? existing.address_line1, 180),
    postalCode: cleanHomeServiceText(body.postalCode ?? existing.postal_code, 24),
    city: cleanHomeServiceText(body.city ?? existing.city, 100),
    jobType: cleanHomeServiceText(body.jobType ?? existing.job_type, 120),
    photoRefs: safeJsonArray(body.photoRefs ?? photoFallback, 20, 500),
    approximateVolume: cleanHomeServiceText(body.approximateVolume ?? existing.approximate_volume, 120),
    leadCostCents: leadCost.cents,
    leadCostKnown: leadCost.known,
    leadCostSourceRef: leadCost.known ? cleanHomeServiceText(body.leadCostSourceRef ?? existing.lead_cost_source_ref, 300) : "",
    quoteCents: quote.cents,
    quoteKnown: quote.known,
    quoteSourceRef: quote.known ? cleanHomeServiceText(body.quoteSourceRef ?? existing.quote_source_ref, 300) : "",
    status,
    jobStartAt: cleanHomeServiceText(body.jobStartAt ?? existing.job_start_at, 40),
    assignedDriver: cleanHomeServiceText(body.assignedDriver ?? existing.assigned_driver, 120),
    finalAmountCents: finalAmount.cents,
    finalAmountKnown: finalAmount.known,
    finalAmountSourceRef: finalAmount.known ? cleanHomeServiceText(body.finalAmountSourceRef ?? existing.final_amount_source_ref, 300) : "",
    disposalCostCents: disposalCost.cents,
    disposalCostKnown: disposalCost.known,
    disposalCostSourceRef: disposalCost.known ? cleanHomeServiceText(body.disposalCostSourceRef ?? existing.disposal_cost_source_ref, 300) : "",
    durationMinutes: nonNegativeInteger(body.durationMinutes ?? existing.duration_minutes, 7 * 24 * 60),
    paymentMethod,
    lossReason: cleanHomeServiceText(body.lossReason ?? existing.loss_reason, 300),
    followUpAt: cleanHomeServiceText(body.followUpAt ?? existing.follow_up_at, 40),
    reviewRequestedAt: cleanHomeServiceText(body.reviewRequestedAt ?? existing.review_requested_at, 40),
    reviewReceivedAt: cleanHomeServiceText(body.reviewReceivedAt ?? existing.review_received_at, 40),
    notes: cleanHomeServiceText(body.notes ?? existing.notes, 1200),
    invalidMoneyFields,
  };
}

export function homeServiceLeadErrors(value) {
  return Array.isArray(value?.invalidMoneyFields)
    ? value.invalidMoneyFields.map((field) => `invalid_money_value:${field}`)
    : [];
}

export function safeHomeServiceLead(row) {
  let photoRefs = [];
  try { photoRefs = JSON.parse(row.photo_refs_json || "[]"); } catch {}
  const leadCostKnown = Number(row.lead_cost_known || 0) === 1;
  const quoteKnown = Number(row.quote_known || 0) === 1;
  const finalAmountKnown = Number(row.final_amount_known || 0) === 1;
  const disposalCostKnown = Number(row.disposal_cost_known || 0) === 1;
  return {
    id: String(row.id),
    source: String(row.source || "direct"),
    searchQuery: row.search_query || "",
    customerName: row.customer_name || "",
    customerPhone: row.customer_phone || "",
    customerEmail: row.customer_email || "",
    addressLine1: row.address_line1 || "",
    postalCode: row.postal_code || "",
    city: row.city || "",
    jobType: row.job_type || "",
    photoRefs,
    approximateVolume: row.approximate_volume || "",
    leadCostCents: leadCostKnown ? Number(row.lead_cost_cents || 0) : null,
    leadCostKnown,
    leadCostSourceRef: leadCostKnown ? (row.lead_cost_source_ref || "") : "",
    leadCostVerified: leadCostKnown && Boolean(row.lead_cost_source_ref),
    quoteCents: quoteKnown ? Number(row.quote_cents || 0) : null,
    quoteKnown,
    quoteSourceRef: quoteKnown ? (row.quote_source_ref || "") : "",
    quoteVerified: quoteKnown && Boolean(row.quote_source_ref),
    status: row.status || "new",
    jobStartAt: row.job_start_at || null,
    assignedDriver: row.assigned_driver || "",
    finalAmountCents: finalAmountKnown ? Number(row.final_amount_cents || 0) : null,
    finalAmountKnown,
    finalAmountSourceRef: finalAmountKnown ? (row.final_amount_source_ref || "") : "",
    finalAmountVerified: finalAmountKnown && Boolean(row.final_amount_source_ref),
    disposalCostCents: disposalCostKnown ? Number(row.disposal_cost_cents || 0) : null,
    disposalCostKnown,
    disposalCostSourceRef: disposalCostKnown ? (row.disposal_cost_source_ref || "") : "",
    disposalCostVerified: disposalCostKnown && Boolean(row.disposal_cost_source_ref),
    durationMinutes: Number(row.duration_minutes || 0),
    paymentMethod: row.payment_method || "",
    lossReason: row.loss_reason || "",
    followUpAt: row.follow_up_at || null,
    reviewRequestedAt: row.review_requested_at || null,
    reviewReceivedAt: row.review_received_at || null,
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function aggregateHomeServiceLeads(rows = []) {
  const totalLeads = rows.length;
  const booked = rows.filter((row) => ["booked","in_progress","completed"].includes(String(row.status))).length;
  const completedRows = rows.filter((row) => String(row.status) === "completed");
  const completed = completedRows.length;
  const reviewed = completedRows.filter((row) => row.review_received_at).length;

  const summarizeMoney = (scopeRows) => {
    const completedScope = scopeRows.filter((row) => String(row.status) === "completed");
    const known = (row, field) => Number(row[field] || 0) === 1;
    const verified = (row, knownField, sourceField) => known(row, knownField) && Boolean(cleanHomeServiceText(row[sourceField], 300));
    const sumVerified = (list, centsField, knownField, sourceField) =>
      list.filter((row) => verified(row, knownField, sourceField)).reduce((sum, row) => sum + Number(row[centsField] || 0), 0);

    const finalKnownCount = completedScope.filter((row) => known(row, "final_amount_known")).length;
    const finalVerifiedCount = completedScope.filter((row) => verified(row, "final_amount_known", "final_amount_source_ref")).length;
    const disposalKnownCount = completedScope.filter((row) => known(row, "disposal_cost_known")).length;
    const disposalVerifiedCount = completedScope.filter((row) => verified(row, "disposal_cost_known", "disposal_cost_source_ref")).length;
    const leadCostKnownCount = scopeRows.filter((row) => known(row, "lead_cost_known")).length;
    const leadCostVerifiedCount = scopeRows.filter((row) => verified(row, "lead_cost_known", "lead_cost_source_ref")).length;
    const quoteKnownCount = scopeRows.filter((row) => known(row, "quote_known")).length;
    const quoteVerifiedCount = scopeRows.filter((row) => verified(row, "quote_known", "quote_source_ref")).length;

    const revenueComplete = completedScope.length > 0
      ? finalVerifiedCount === completedScope.length
      : scopeRows.length > 0;
    const disposalComplete = completedScope.length === 0 || disposalVerifiedCount === completedScope.length;
    const leadCostComplete = scopeRows.length > 0 && leadCostVerifiedCount === scopeRows.length;
    const quoteComplete = scopeRows.length > 0 && quoteVerifiedCount === scopeRows.length;

    const verifiedRevenueCents = sumVerified(completedScope, "final_amount_cents", "final_amount_known", "final_amount_source_ref");
    const verifiedDisposalCostCents = sumVerified(completedScope, "disposal_cost_cents", "disposal_cost_known", "disposal_cost_source_ref");
    const verifiedLeadCostCents = sumVerified(scopeRows, "lead_cost_cents", "lead_cost_known", "lead_cost_source_ref");
    const grossComplete = revenueComplete && disposalComplete && leadCostComplete;

    return {
      revenueCents: revenueComplete ? verifiedRevenueCents : null,
      disposalCostCents: disposalComplete ? verifiedDisposalCostCents : null,
      leadCostCents: leadCostComplete ? verifiedLeadCostCents : null,
      grossAfterTrackedCostsCents: grossComplete
        ? verifiedRevenueCents - verifiedDisposalCostCents - verifiedLeadCostCents
        : null,
      averageTicketCents: completedScope.length === 0
        ? null
        : revenueComplete ? Math.round(verifiedRevenueCents / completedScope.length) : null,
      verifiedRevenueCents,
      verifiedDisposalCostCents,
      verifiedLeadCostCents,
      moneyEvidence: {
        revenue: {
          knownCount: finalKnownCount,
          verifiedCount: finalVerifiedCount,
          requiredCount: completedScope.length,
          unknownCount: completedScope.length - finalKnownCount,
          unverifiedCount: finalKnownCount - finalVerifiedCount,
          complete: revenueComplete,
        },
        disposalCost: {
          knownCount: disposalKnownCount,
          verifiedCount: disposalVerifiedCount,
          requiredCount: completedScope.length,
          unknownCount: completedScope.length - disposalKnownCount,
          unverifiedCount: disposalKnownCount - disposalVerifiedCount,
          complete: disposalComplete,
        },
        leadCost: {
          knownCount: leadCostKnownCount,
          verifiedCount: leadCostVerifiedCount,
          requiredCount: scopeRows.length,
          unknownCount: scopeRows.length - leadCostKnownCount,
          unverifiedCount: leadCostKnownCount - leadCostVerifiedCount,
          complete: leadCostComplete,
        },
        quote: {
          knownCount: quoteKnownCount,
          verifiedCount: quoteVerifiedCount,
          requiredCount: scopeRows.length,
          unknownCount: scopeRows.length - quoteKnownCount,
          unverifiedCount: quoteKnownCount - quoteVerifiedCount,
          complete: quoteComplete,
        },
        grossComplete,
      },
    };
  };

  const overallMoney = summarizeMoney(rows);
  const byDimension = (field) => {
    const groups = new Map();
    for (const row of rows) {
      const key = cleanHomeServiceText(row[field], 120) || "Unknown";
      const item = groups.get(key) || { key, rows: [], leads: 0, booked: 0, completed: 0 };
      item.rows.push(row);
      item.leads += 1;
      if (["booked","in_progress","completed"].includes(String(row.status))) item.booked += 1;
      if (String(row.status) === "completed") item.completed += 1;
      groups.set(key, item);
    }
    return [...groups.values()].map((item) => {
      const money = summarizeMoney(item.rows);
      return {
        key: item.key,
        leads: item.leads,
        booked: item.booked,
        completed: item.completed,
        ...money,
        bookedRate: item.leads ? item.booked / item.leads : null,
      };
    }).sort((a,b) =>
      Number(b.revenueCents ?? b.verifiedRevenueCents ?? 0) - Number(a.revenueCents ?? a.verifiedRevenueCents ?? 0)
      || b.leads - a.leads
    );
  };

  return {
    totalLeads,
    booked,
    completed,
    ...overallMoney,
    bookedRate: totalLeads ? booked / totalLeads : null,
    reviewRate: completed ? reviewed / completed : null,
    byCity: byDimension("city"),
    bySource: byDimension("source"),
    byJobType: byDimension("job_type"),
    bySearchQuery: byDimension("search_query"),
  };
}

