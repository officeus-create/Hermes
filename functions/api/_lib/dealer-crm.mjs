import { ensureHermesCompanyProfilesSchema } from "./hermes-company-profiles.mjs";

const CONTROL_CHARS = /[<>\u0000-\u001f\u007f]/g;
const LEAD_STAGES = new Set(["new", "contacted", "qualified", "appointment", "won", "lost"]);
const APPOINTMENT_STATUSES = new Set(["scheduled", "confirmed", "completed", "cancelled", "no_show"]);
const VEHICLE_STATUSES = new Set(["tracked", "inventory", "customer", "sold", "transport", "archived"]);
const TEAM_DEPARTMENTS = new Set(["sales", "service", "parts", "collision", "finance", "operations", "management", "other"]);

export function cleanDealerCrmText(value, max = 240) {
  return String(value ?? "").replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function normalizeDealerEmail(value) {
  const email = cleanDealerCrmText(value, 254).toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function normalizeDealerPhone(value) {
  return cleanDealerCrmText(value, 40);
}

export function normalizeDealerVin(value) {
  const vin = cleanDealerCrmText(value, 17).toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  return vin.length === 17 ? vin : "";
}

export function normalizeLeadStage(value) {
  const stage = cleanDealerCrmText(value, 24).toLowerCase();
  return LEAD_STAGES.has(stage) ? stage : "new";
}

export function normalizeAppointmentStatus(value) {
  const status = cleanDealerCrmText(value, 24).toLowerCase();
  return APPOINTMENT_STATUSES.has(status) ? status : "scheduled";
}

export function normalizeVehicleStatus(value) {
  const status = cleanDealerCrmText(value, 24).toLowerCase();
  return VEHICLE_STATUSES.has(status) ? status : "tracked";
}

export function normalizeTeamDepartment(value) {
  const department = cleanDealerCrmText(value, 32).toLowerCase();
  return TEAM_DEPARTMENTS.has(department) ? department : "other";
}

export function validIsoDateTime(value) {
  const text = cleanDealerCrmText(value, 40);
  if (!text) return "";
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

export async function ensureDealerCrmSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_customers (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_customers_company ON hermes_dealer_customers(company_id, updated_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_customers_email ON hermes_dealer_customers(company_id, email)").run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_vehicles (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      customer_id TEXT,
      vin TEXT,
      vehicle_year INTEGER,
      vehicle_make TEXT,
      vehicle_model TEXT,
      stock_number TEXT,
      status TEXT NOT NULL DEFAULT 'tracked',
      source TEXT NOT NULL DEFAULT 'manual',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_vehicles_company ON hermes_dealer_vehicles(company_id, updated_at DESC)").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_dealer_vehicles_vin ON hermes_dealer_vehicles(company_id, vin) WHERE vin IS NOT NULL AND vin <> ''").run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_leads (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      customer_id TEXT,
      channel TEXT NOT NULL DEFAULT 'manual',
      stage TEXT NOT NULL DEFAULT 'new',
      subject TEXT,
      message TEXT,
      next_action TEXT,
      follow_up_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_leads_company ON hermes_dealer_leads(company_id, stage, updated_at DESC)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_leads_followup ON hermes_dealer_leads(company_id, follow_up_at)").run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_team_members (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      department TEXT NOT NULL DEFAULT 'other',
      email TEXT,
      phone TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_team_company ON hermes_dealer_team_members(company_id, active, department)").run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_appointments (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      owner_specialist_id TEXT NOT NULL,
      customer_id TEXT,
      vehicle_id TEXT,
      assigned_team_member_id TEXT,
      appointment_type TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_appointments_company ON hermes_dealer_appointments(company_id, starts_at)").run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_department_hours (
      company_id TEXT NOT NULL,
      department TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      is_open INTEGER NOT NULL DEFAULT 0,
      start_time TEXT,
      end_time TEXT,
      source_ref TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (company_id, department, day_of_week)
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_activity (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      actor_specialist_id TEXT,
      event_type TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      summary TEXT,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_dealer_activity_company ON hermes_dealer_activity(company_id, created_at DESC)").run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_dealer_bootstrap_state (
      company_id TEXT PRIMARY KEY,
      pilot_key TEXT NOT NULL,
      source_ref TEXT,
      initialized_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
}

export async function requireDealerCompany(request, env) {
  if (!env?.DB) return { error: { status: 503, code: "database_not_configured" } };
  const { getAuthenticatedSpecialist } = await import("./session.mjs");
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: { status: 401, code: "authentication_required" } };
  await ensureHermesCompanyProfilesSchema(env.DB);
  await ensureDealerCrmSchema(env.DB);
  const company = await env.DB.prepare(
    "SELECT * FROM hermes_company_profiles WHERE owner_specialist_id = ? LIMIT 1",
  ).bind(specialist.id).first();
  if (!company) return { error: { status: 409, code: "dealer_company_required" } };
  if (String(company.company_type) !== "dealer") return { error: { status: 403, code: "dealer_company_required" } };
  return { specialist, company };
}

/**
 * @param {any} db
 * @param {{ companyId: any, actorId?: any, eventType: any, entityType?: any, entityId?: any, summary?: any }} options
 */
export async function recordDealerActivity(db, { companyId, actorId, eventType, entityType = null, entityId = null, summary = null }) {
  await ensureDealerCrmSchema(db);
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO hermes_dealer_activity
      (id, company_id, actor_specialist_id, event_type, entity_type, entity_id, summary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    `dact_${crypto.randomUUID()}`,
    String(companyId),
    actorId ? String(actorId) : null,
    cleanDealerCrmText(eventType, 64),
    entityType ? cleanDealerCrmText(entityType, 48) : null,
    entityId ? cleanDealerCrmText(entityId, 120) : null,
    summary ? cleanDealerCrmText(summary, 240) : null,
    now,
  ).run();
}

const LEGACY_TOYOTA_DALLAS_HOURS = {
  sales: {
    0: null,
    1: ["08:30", "20:00"],
    2: ["08:30", "20:00"],
    3: ["08:30", "20:00"],
    4: ["08:30", "20:00"],
    5: ["08:30", "20:00"],
    6: ["08:30", "20:00"],
  },
  service: {
    0: null,
    1: ["07:00", "18:00"],
    2: ["07:00", "18:00"],
    3: ["07:00", "18:00"],
    4: ["07:00", "18:00"],
    5: ["07:00", "18:00"],
    6: ["07:00", "16:00"],
  },
  parts: {
    0: null,
    1: ["07:00", "18:00"],
    2: ["07:00", "18:00"],
    3: ["07:00", "18:00"],
    4: ["07:00", "18:00"],
    5: ["07:00", "18:00"],
    6: ["07:00", "16:00"],
  },
  collision: {
    0: null,
    1: ["07:30", "18:00"],
    2: ["07:30", "18:00"],
    3: ["07:30", "18:00"],
    4: ["07:30", "18:00"],
    5: ["07:30", "18:00"],
    6: null,
  },
};

export async function bootstrapLegacyToyotaDealerCrm(db, { company, specialist, pilotKey, sourceRef }) {
  if (pilotKey !== "legacy-toyota-of-dallas") return { initialized: false, reason: "unsupported_pilot" };
  await ensureDealerCrmSchema(db);
  const now = new Date().toISOString();
  const existing = await db.prepare(
    "SELECT company_id,pilot_key,initialized_at FROM hermes_dealer_bootstrap_state WHERE company_id = ? LIMIT 1",
  ).bind(company.id).first();

  for (const [department, days] of Object.entries(LEGACY_TOYOTA_DALLAS_HOURS)) {
    for (let day = 0; day <= 6; day += 1) {
      const hours = days[day];
      await db.prepare(`
        INSERT INTO hermes_dealer_department_hours
          (company_id, department, day_of_week, is_open, start_time, end_time, source_ref, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(company_id, department, day_of_week) DO UPDATE SET
          is_open = CASE WHEN hermes_dealer_department_hours.source_ref = excluded.source_ref THEN excluded.is_open ELSE hermes_dealer_department_hours.is_open END,
          start_time = CASE WHEN hermes_dealer_department_hours.source_ref = excluded.source_ref THEN excluded.start_time ELSE hermes_dealer_department_hours.start_time END,
          end_time = CASE WHEN hermes_dealer_department_hours.source_ref = excluded.source_ref THEN excluded.end_time ELSE hermes_dealer_department_hours.end_time END,
          updated_at = excluded.updated_at
      `).bind(
        company.id,
        department,
        day,
        hours ? 1 : 0,
        hours?.[0] || null,
        hours?.[1] || null,
        cleanDealerCrmText(sourceRef, 180) || null,
        now,
      ).run();
    }
  }

  await db.prepare(`
    INSERT INTO hermes_dealer_bootstrap_state (company_id,pilot_key,source_ref,initialized_at,updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(company_id) DO UPDATE SET
      pilot_key=excluded.pilot_key,
      source_ref=excluded.source_ref,
      updated_at=excluded.updated_at
  `).bind(company.id, pilotKey, cleanDealerCrmText(sourceRef, 180) || null, existing?.initialized_at || now, now).run();

  if (!existing) {
    await recordDealerActivity(db, {
      companyId: company.id,
      actorId: specialist.id,
      eventType: "dealer_crm_bootstrapped",
      entityType: "company",
      entityId: company.id,
      summary: "Verified public department hours initialized; no private customers, vehicles, leads or staff were fabricated.",
    });
  }
  return { initialized: true, already_initialized: Boolean(existing), initialized_at: existing?.initialized_at || now };
}
