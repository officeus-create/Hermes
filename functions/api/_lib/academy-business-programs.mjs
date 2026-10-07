import { getAcademyBusinessCrmContext } from "./academy-business-crm.mjs";

const PROGRAM_STATES = new Set(["draft","active","paused"]);
const COHORT_STATES = new Set(["planned","enrolling","active","completed","cancelled"]);
const CONTROL_CHARS = new RegExp("[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

const clean = (value, max = 240) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

const enumValue = (value, allowed, fallback) => {
  const normalized = clean(value, 50).toLowerCase().replace(/[\s-]+/g, "_");
  return allowed.has(normalized) ? normalized : fallback;
};

const nullableCents = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.min(Math.round(parsed), 100_000_000_000);
};

const nullablePositiveInteger = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return Math.min(parsed, 1_000_000);
};

const cleanDate = (value) => {
  const text = clean(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
};

export async function getAcademyBusinessProgramsContext(request, env) {
  const ctx = await getAcademyBusinessCrmContext(request, env);
  if (ctx.error) return ctx;
  await ensureAcademyBusinessProgramsSchema(env.DB);
  return ctx;
}

export async function ensureAcademyBusinessProgramsSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_programs (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','archived')),
      format_text TEXT,
      duration_text TEXT,
      eligibility_text TEXT,
      price_cents INTEGER,
      currency TEXT,
      price_source_ref TEXT,
      notes TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(company_id, slug)
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_academy_business_cohorts (
      id TEXT PRIMARY KEY,
      owner_specialist_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      program_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','enrolling','active','completed','cancelled')),
      start_date TEXT,
      end_date TEXT,
      capacity INTEGER,
      timezone TEXT,
      schedule_text TEXT,
      delivery_owner_label TEXT,
      notes TEXT,
      archived_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(company_id, code)
    )
  `).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_programs_owner ON hermes_academy_business_programs(owner_specialist_id,company_id,status,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_cohorts_owner ON hermes_academy_business_cohorts(owner_specialist_id,company_id,status,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_academy_business_cohorts_program ON hermes_academy_business_cohorts(program_id,status,updated_at)").run();
}

export function academyBusinessProgramSlug(name, id = "") {
  const base = clean(name, 120)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "program";
  const suffix = clean(id, 80).replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase();
  return suffix ? `${base}-${suffix}` : base;
}

export function academyBusinessCohortCode(name, id = "") {
  const base = clean(name, 80)
    .toUpperCase()
    .normalize("NFKD")
    .replace(/[^A-Z0-9\u0400-\u04ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36) || "COHORT";
  const suffix = clean(id, 80).replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase();
  return suffix ? `${base}-${suffix}` : base;
}

export function normalizeAcademyBusinessProgram(body, existing = {}) {
  return {
    name: clean(body.name ?? existing.name, 180),
    status: enumValue(body.status ?? existing.status ?? "draft", PROGRAM_STATES, enumValue(existing.status ?? "draft", PROGRAM_STATES, "draft")),
    formatText: clean(body.formatText ?? existing.format_text, 160),
    durationText: clean(body.durationText ?? existing.duration_text, 160),
    eligibilityText: clean(body.eligibilityText ?? existing.eligibility_text, 600),
    priceCents: nullableCents(body.priceCents ?? existing.price_cents),
    currency: clean(body.currency ?? existing.currency, 3).toUpperCase(),
    priceSourceRef: clean(body.priceSourceRef ?? existing.price_source_ref, 300),
    notes: clean(body.notes ?? existing.notes, 1200),
  };
}

export function academyBusinessProgramErrors(value) {
  const errors = [];
  if (value.name.length < 2) errors.push("program_name_required");
  if (value.priceCents !== null && value.priceCents > 0) {
    if (!/^[A-Z]{3}$/.test(value.currency)) errors.push("program_currency_required");
    if (!value.priceSourceRef) errors.push("program_price_source_ref_required");
  }
  return errors;
}

export function normalizeAcademyBusinessCohort(body, existing = {}) {
  return {
    programId: clean(body.programId ?? existing.program_id, 120),
    name: clean(body.name ?? existing.name, 180),
    code: clean(body.code ?? existing.code, 80).toUpperCase(),
    status: enumValue(body.status ?? existing.status ?? "planned", COHORT_STATES, enumValue(existing.status ?? "planned", COHORT_STATES, "planned")),
    startDate: cleanDate(body.startDate ?? existing.start_date),
    endDate: cleanDate(body.endDate ?? existing.end_date),
    capacity: nullablePositiveInteger(body.capacity ?? existing.capacity),
    timezone: clean(body.timezone ?? existing.timezone, 80),
    scheduleText: clean(body.scheduleText ?? existing.schedule_text, 600),
    deliveryOwnerLabel: clean(body.deliveryOwnerLabel ?? existing.delivery_owner_label, 180),
    notes: clean(body.notes ?? existing.notes, 1200),
  };
}

export function academyBusinessCohortErrors(value) {
  const errors = [];
  if (!value.programId) errors.push("cohort_program_required");
  if (value.name.length < 2) errors.push("cohort_name_required");
  if (value.startDate && value.endDate && value.endDate < value.startDate) errors.push("cohort_date_range_invalid");
  return errors;
}

export function safeAcademyBusinessProgram(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name || "",
    slug: row.slug || "",
    status: row.status || "draft",
    formatText: row.format_text || "",
    durationText: row.duration_text || "",
    eligibilityText: row.eligibility_text || "",
    priceCents: row.price_cents === null || row.price_cents === undefined ? null : Number(row.price_cents),
    currency: row.currency || "",
    priceSourceRef: row.price_source_ref || "",
    notes: row.notes || "",
    archivedAt: row.archived_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function safeAcademyBusinessCohort(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    programId: String(row.program_id),
    programName: row.program_name || "",
    name: row.name || "",
    code: row.code || "",
    status: row.status || "planned",
    startDate: row.start_date || null,
    endDate: row.end_date || null,
    capacity: row.capacity === null || row.capacity === undefined ? null : Number(row.capacity),
    timezone: row.timezone || "",
    scheduleText: row.schedule_text || "",
    deliveryOwnerLabel: row.delivery_owner_label || "",
    notes: row.notes || "",
    archivedAt: row.archived_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
