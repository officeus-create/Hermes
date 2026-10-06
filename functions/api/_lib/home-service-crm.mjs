import { getAuthenticatedSpecialist } from "./session.mjs";
import { ensureHermesCompanyProfilesSchema } from "./hermes-company-profiles.mjs";

const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");
export const HOME_SERVICE_SUBTYPES = new Set(["junk_removal", "cleaning", "landscaping", "moving", "handyman", "other"]);
export const HOME_SERVICE_LEAD_STATUSES = new Set(["new", "contacted", "quoted", "follow_up", "booked", "in_progress", "completed", "lost", "cancelled"]);
const PAYMENT_METHODS = new Set(["", "cash", "card", "check", "zelle", "venmo", "apple_pay", "other"]);

export const cleanHomeServiceText = (value, max = 180) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

const moneyCents = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.min(Math.round(number), 100_000_000);
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
      quote_cents INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new',
      job_start_at TEXT,
      assigned_driver TEXT,
      final_amount_cents INTEGER NOT NULL DEFAULT 0,
      disposal_cost_cents INTEGER NOT NULL DEFAULT 0,
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
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_home_service_leads_owner_status ON hermes_home_service_leads(owner_specialist_id,status,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_home_service_leads_owner_city ON hermes_home_service_leads(owner_specialist_id,city)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_home_service_leads_owner_source ON hermes_home_service_leads(owner_specialist_id,source)").run();
}

export async function getHomeServiceContext(request, env) {
  if (!env?.DB) return { error: { status: 503, code: "database_not_configured" } };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: { status: 401, code: "authentication_required" } };
  await ensureHomeServiceCrmSchema(env.DB);
  const company = await env.DB.prepare(`
    SELECT id,company_name,slug,company_type,city,state,website,phone,address_line1,postal_code,country_code,timezone,catalog_opt_in,catalog_status
    FROM hermes_company_profiles
    WHERE owner_specialist_id=?
    LIMIT 1
  `).bind(specialist.id).first();
  if (!company || String(company.company_type) !== "home_service") {
    return { error: { status: 403, code: "home_service_company_required" } };
  }
  return { specialist, company };
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
    leadCostCents: moneyCents(body.leadCostCents ?? existing.lead_cost_cents),
    quoteCents: moneyCents(body.quoteCents ?? existing.quote_cents),
    status,
    jobStartAt: cleanHomeServiceText(body.jobStartAt ?? existing.job_start_at, 40),
    assignedDriver: cleanHomeServiceText(body.assignedDriver ?? existing.assigned_driver, 120),
    finalAmountCents: moneyCents(body.finalAmountCents ?? existing.final_amount_cents),
    disposalCostCents: moneyCents(body.disposalCostCents ?? existing.disposal_cost_cents),
    durationMinutes: nonNegativeInteger(body.durationMinutes ?? existing.duration_minutes, 7 * 24 * 60),
    paymentMethod,
    lossReason: cleanHomeServiceText(body.lossReason ?? existing.loss_reason, 300),
    followUpAt: cleanHomeServiceText(body.followUpAt ?? existing.follow_up_at, 40),
    reviewRequestedAt: cleanHomeServiceText(body.reviewRequestedAt ?? existing.review_requested_at, 40),
    reviewReceivedAt: cleanHomeServiceText(body.reviewReceivedAt ?? existing.review_received_at, 40),
    notes: cleanHomeServiceText(body.notes ?? existing.notes, 1200),
  };
}

export function safeHomeServiceLead(row) {
  let photoRefs = [];
  try { photoRefs = JSON.parse(row.photo_refs_json || "[]"); } catch {}
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
    leadCostCents: Number(row.lead_cost_cents || 0),
    quoteCents: Number(row.quote_cents || 0),
    status: row.status || "new",
    jobStartAt: row.job_start_at || null,
    assignedDriver: row.assigned_driver || "",
    finalAmountCents: Number(row.final_amount_cents || 0),
    disposalCostCents: Number(row.disposal_cost_cents || 0),
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
  const completed = rows.filter((row) => String(row.status) === "completed").length;
  const revenueCents = rows.reduce((sum, row) => sum + Number(row.final_amount_cents || 0), 0);
  const disposalCostCents = rows.reduce((sum, row) => sum + Number(row.disposal_cost_cents || 0), 0);
  const leadCostCents = rows.reduce((sum, row) => sum + Number(row.lead_cost_cents || 0), 0);
  const grossAfterTrackedCostsCents = revenueCents - disposalCostCents - leadCostCents;
  const reviewed = rows.filter((row) => row.review_received_at).length;
  const byDimension = (field) => {
    const groups = new Map();
    for (const row of rows) {
      const key = cleanHomeServiceText(row[field], 120) || "Unknown";
      const item = groups.get(key) || { key, leads: 0, booked: 0, completed: 0, revenueCents: 0, disposalCostCents: 0, leadCostCents: 0 };
      item.leads += 1;
      if (["booked","in_progress","completed"].includes(String(row.status))) item.booked += 1;
      if (String(row.status) === "completed") item.completed += 1;
      item.revenueCents += Number(row.final_amount_cents || 0);
      item.disposalCostCents += Number(row.disposal_cost_cents || 0);
      item.leadCostCents += Number(row.lead_cost_cents || 0);
      groups.set(key, item);
    }
    return [...groups.values()].map((item) => ({
      ...item,
      grossAfterTrackedCostsCents: item.revenueCents - item.disposalCostCents - item.leadCostCents,
      bookedRate: item.leads ? item.booked / item.leads : 0,
    })).sort((a,b) => b.revenueCents - a.revenueCents || b.leads - a.leads);
  };
  return {
    totalLeads, booked, completed, revenueCents, disposalCostCents, leadCostCents, grossAfterTrackedCostsCents,
    bookedRate: totalLeads ? booked / totalLeads : 0,
    averageTicketCents: completed ? Math.round(revenueCents / completed) : 0,
    reviewRate: completed ? reviewed / completed : 0,
    byCity: byDimension("city"),
    bySource: byDimension("source"),
    byJobType: byDimension("job_type"),
    bySearchQuery: byDimension("search_query"),
  };
}
