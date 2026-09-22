import { jsonResponse } from "../../_lib/session.mjs";
import {
  bootstrapLegacyToyotaDealerCrm,
  cleanDealerCrmText,
  ensureDealerCrmSchema,
  normalizeAppointmentStatus,
  normalizeDealerEmail,
  normalizeDealerPhone,
  normalizeDealerVin,
  normalizeLeadStage,
  normalizeTeamDepartment,
  normalizeVehicleStatus,
  recordDealerActivity,
  requireDealerCompany,
  validIsoDateTime,
} from "../../_lib/dealer-crm.mjs";
import { ensureDealerTransportRequestSchema } from "../../_lib/dealer-transport-requests.mjs";
import { ensureCompanyConnectionsSchema } from "../../_lib/company-connections.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env };

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

const sameOriginMutation = (request: Request) =>
  request.headers.get("Sec-Fetch-Site") !== "cross-site" &&
  (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);

const MODULES = new Set(["customers", "vehicles", "leads", "appointments", "team", "activity", "intelligence", "dashboard"]);
const MUTABLE_MODULES = new Set(["customers", "vehicles", "leads", "appointments", "team"]);
const CURRENT_YEAR = new Date().getUTCFullYear();

function finiteYear(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const year = Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= CURRENT_YEAR + 2 ? year : null;
}

async function parseBody(request: Request) {
  try { return await request.json() as Record<string, any>; }
  catch { return null; }
}

async function ownedRow(db: any, table: string, id: string, companyId: string) {
  if (!id) return null;
  return db.prepare(`SELECT id FROM ${table} WHERE id = ? AND company_id = ? LIMIT 1`).bind(id, companyId).first();
}

async function listCustomers(db: any, companyId: string) {
  const result = await db.prepare(`
    SELECT id,name,email,phone,source,notes,created_at,updated_at
    FROM hermes_dealer_customers
    WHERE company_id = ?
    ORDER BY updated_at DESC
    LIMIT 250
  `).bind(companyId).all();
  return result?.results || [];
}

async function listVehicles(db: any, companyId: string) {
  const result = await db.prepare(`
    SELECT id,customer_id,vin,vehicle_year,vehicle_make,vehicle_model,stock_number,status,source,notes,created_at,updated_at
    FROM hermes_dealer_vehicles
    WHERE company_id = ?
    ORDER BY updated_at DESC
    LIMIT 250
  `).bind(companyId).all();
  return result?.results || [];
}

async function listLeads(db: any, companyId: string) {
  const result = await db.prepare(`
    SELECT id,customer_id,channel,stage,subject,message,next_action,follow_up_at,created_at,updated_at
    FROM hermes_dealer_leads
    WHERE company_id = ?
    ORDER BY updated_at DESC
    LIMIT 250
  `).bind(companyId).all();
  return result?.results || [];
}

async function listAppointments(db: any, companyId: string) {
  const result = await db.prepare(`
    SELECT id,customer_id,vehicle_id,assigned_team_member_id,appointment_type,starts_at,status,notes,created_at,updated_at
    FROM hermes_dealer_appointments
    WHERE company_id = ?
    ORDER BY starts_at ASC
    LIMIT 250
  `).bind(companyId).all();
  return result?.results || [];
}

async function listTeam(db: any, companyId: string) {
  const members = await db.prepare(`
    SELECT id,name,role,department,email,phone,active,created_at,updated_at
    FROM hermes_dealer_team_members
    WHERE company_id = ?
    ORDER BY active DESC, department ASC, name ASC
    LIMIT 250
  `).bind(companyId).all();
  const hours = await db.prepare(`
    SELECT department,day_of_week,is_open,start_time,end_time,source_ref,updated_at
    FROM hermes_dealer_department_hours
    WHERE company_id = ?
    ORDER BY department ASC, day_of_week ASC
  `).bind(companyId).all();
  return {
    members: (members?.results || []).map((row: any) => ({ ...row, active: Number(row.active) === 1 })),
    department_hours: (hours?.results || []).map((row: any) => ({ ...row, is_open: Number(row.is_open) === 1 })),
  };
}

async function listActivity(db: any, companyId: string) {
  const result = await db.prepare(`
    SELECT id,event_type,entity_type,entity_id,summary,created_at
    FROM hermes_dealer_activity
    WHERE company_id = ?
    ORDER BY created_at DESC
    LIMIT 150
  `).bind(companyId).all();
  return result?.results || [];
}

async function dashboard(db: any, companyId: string) {
  await ensureDealerTransportRequestSchema(db);
  await ensureCompanyConnectionsSchema(db);
  const [
    customers, vehicles, leads, appointments, team, transport, connections,
  ] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS count FROM hermes_dealer_customers WHERE company_id = ?").bind(companyId).first(),
    db.prepare("SELECT COUNT(*) AS count FROM hermes_dealer_vehicles WHERE company_id = ?").bind(companyId).first(),
    db.prepare("SELECT COUNT(*) AS count FROM hermes_dealer_leads WHERE company_id = ? AND stage NOT IN ('won','lost')").bind(companyId).first(),
    db.prepare("SELECT COUNT(*) AS count FROM hermes_dealer_appointments WHERE company_id = ? AND status IN ('scheduled','confirmed')").bind(companyId).first(),
    db.prepare("SELECT COUNT(*) AS count FROM hermes_dealer_team_members WHERE company_id = ? AND active = 1").bind(companyId).first(),
    db.prepare(`
      SELECT
        SUM(CASE WHEN status='draft' THEN 1 ELSE 0 END) AS drafts,
        SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) AS published,
        SUM(CASE WHEN status='sync_error' THEN 1 ELSE 0 END) AS sync_errors
      FROM hermes_dealer_transport_requests
      WHERE company_id = ?
    `).bind(companyId).first(),
    db.prepare(`
      SELECT provider,state,mode,last_verified_at,last_error
      FROM hermes_company_connections
      WHERE company_id = ?
      ORDER BY provider
    `).bind(companyId).all(),
  ]);
  return {
    counts: {
      customers: Number(customers?.count || 0),
      vehicles: Number(vehicles?.count || 0),
      active_leads: Number(leads?.count || 0),
      upcoming_appointments: Number(appointments?.count || 0),
      active_team_members: Number(team?.count || 0),
      transport_drafts: Number(transport?.drafts || 0),
      published_loads: Number(transport?.published || 0),
      transport_sync_errors: Number(transport?.sync_errors || 0),
    },
    connections: connections?.results || [],
  };
}

async function intelligence(db: any, companyId: string) {
  const base = await dashboard(db, companyId);
  const overdue = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM hermes_dealer_leads
    WHERE company_id = ?
      AND stage NOT IN ('won','lost')
      AND follow_up_at IS NOT NULL
      AND follow_up_at < ?
  `).bind(companyId, new Date().toISOString()).first();
  const nextActions: Array<{ code: string; label: string }> = [];
  if (Number(overdue?.count || 0) > 0) nextActions.push({ code: "lead_follow_up_due", label: "Review overdue lead follow-ups." });
  if (base.counts.transport_drafts > 0) nextActions.push({ code: "transport_drafts_waiting", label: "Review transport drafts before owner-approved Load Board publication." });
  if (base.counts.transport_sync_errors > 0) nextActions.push({ code: "transport_sync_error", label: "Inspect Transport Request sync errors; do not create duplicate loads." });
  const socialProviders = new Set(["facebook", "instagram", "threads"]);
  const socialConnected = (base.connections || []).filter((row: any) => socialProviders.has(String(row.provider)) && /^connected_/.test(String(row.state))).length;
  if (socialConnected < 3) nextActions.push({ code: "social_owner_auth", label: "Complete owner authorization and account readback for remaining Meta channels." });
  if (base.counts.customers === 0 && base.counts.active_leads === 0) nextActions.push({ code: "crm_private_data_empty", label: "Import or enter owner-approved customer/lead data; do not synthesize private records." });
  return {
    mode: "rules_based_private_operations",
    autonomous_actions: false,
    external_ai_write: false,
    metrics: { ...base.counts, overdue_lead_followups: Number(overdue?.count || 0) },
    next_actions: nextActions,
    connection_truth: base.connections,
  };
}

async function readModule(db: any, companyId: string, module: string) {
  if (module === "customers") return { customers: await listCustomers(db, companyId) };
  if (module === "vehicles") return { vehicles: await listVehicles(db, companyId) };
  if (module === "leads") return { leads: await listLeads(db, companyId) };
  if (module === "appointments") return { appointments: await listAppointments(db, companyId) };
  if (module === "team") return { team: await listTeam(db, companyId) };
  if (module === "activity") return { activity: await listActivity(db, companyId) };
  if (module === "intelligence") return { intelligence: await intelligence(db, companyId) };
  return { dashboard: await dashboard(db, companyId) };
}

export async function onRequestGet({ request, env }: Context) {
  const auth = await requireDealerCompany(request, env);
  if (auth.error) return jsonResponse(auth.error.status, { success: false, error: auth.error.code }, privateHeaders);
  const module = cleanDealerCrmText(new URL(request.url).searchParams.get("module"), 32).toLowerCase() || "dashboard";
  if (!MODULES.has(module)) return jsonResponse(400, { success: false, error: "unsupported_module" }, privateHeaders);
  return jsonResponse(200, {
    success: true,
    company: {
      id: auth.company.id,
      company_name: auth.company.company_name,
      company_type: auth.company.company_type,
      timezone: auth.company.timezone || null,
    },
    ...(await readModule(env.DB, String(auth.company.id), module)),
  }, privateHeaders);
}

export async function onRequestPost({ request, env }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const auth = await requireDealerCompany(request, env);
  if (auth.error) return jsonResponse(auth.error.status, { success: false, error: auth.error.code }, privateHeaders);
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);

  const action = cleanDealerCrmText(body.action, 32).toLowerCase() || "create";
  if (action === "bootstrap") {
    const result = await bootstrapLegacyToyotaDealerCrm(env.DB, {
      company: auth.company,
      specialist: auth.specialist,
      pilotKey: cleanDealerCrmText(body.pilot_key, 96),
      sourceRef: auth.company.public_source_ref || cleanDealerCrmText(body.source_ref, 180),
    });
    if (!result.initialized) return jsonResponse(400, { success: false, error: result.reason || "bootstrap_failed" }, privateHeaders);
    return jsonResponse(200, { success: true, bootstrap: result, team: await listTeam(env.DB, String(auth.company.id)) }, privateHeaders);
  }

  const module = cleanDealerCrmText(body.module, 32).toLowerCase();
  if (!MUTABLE_MODULES.has(module)) return jsonResponse(400, { success: false, error: "unsupported_module" }, privateHeaders);
  const companyId = String(auth.company.id);
  const now = new Date().toISOString();
  let id = "";

  if (module === "customers") {
    const name = cleanDealerCrmText(body.name, 140);
    const email = body.email ? normalizeDealerEmail(body.email) : "";
    if (!name) return jsonResponse(400, { success: false, error: "customer_name_required" }, privateHeaders);
    if (body.email && !email) return jsonResponse(400, { success: false, error: "invalid_customer_email" }, privateHeaders);
    if (email) {
      const duplicate = await env.DB.prepare("SELECT id FROM hermes_dealer_customers WHERE company_id=? AND email=? LIMIT 1").bind(companyId, email).first();
      if (duplicate) return jsonResponse(409, { success: false, error: "customer_email_exists", id: duplicate.id }, privateHeaders);
    }
    id = `dcus_${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_dealer_customers
        (id,company_id,owner_specialist_id,name,email,phone,source,notes,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).bind(id, companyId, auth.specialist.id, name, email || null, normalizeDealerPhone(body.phone) || null, cleanDealerCrmText(body.source, 48) || "manual", cleanDealerCrmText(body.notes, 1200) || null, now, now).run();
  }

  if (module === "vehicles") {
    const vin = body.vin ? normalizeDealerVin(body.vin) : "";
    if (body.vin && !vin) return jsonResponse(400, { success: false, error: "invalid_vin" }, privateHeaders);
    const year = finiteYear(body.vehicle_year);
    if (body.vehicle_year && year == null) return jsonResponse(400, { success: false, error: "invalid_vehicle_year" }, privateHeaders);
    const make = cleanDealerCrmText(body.vehicle_make, 80);
    const model = cleanDealerCrmText(body.vehicle_model, 100);
    if (!vin && !make && !model) return jsonResponse(400, { success: false, error: "vehicle_identity_required" }, privateHeaders);
    const customerId = cleanDealerCrmText(body.customer_id, 120);
    if (customerId && !(await ownedRow(env.DB, "hermes_dealer_customers", customerId, companyId))) return jsonResponse(400, { success: false, error: "customer_not_found" }, privateHeaders);
    id = `dveh_${crypto.randomUUID()}`;
    try {
      await env.DB.prepare(`
        INSERT INTO hermes_dealer_vehicles
          (id,company_id,owner_specialist_id,customer_id,vin,vehicle_year,vehicle_make,vehicle_model,stock_number,status,source,notes,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(id, companyId, auth.specialist.id, customerId || null, vin || null, year, make || null, model || null, cleanDealerCrmText(body.stock_number, 80) || null, normalizeVehicleStatus(body.status), cleanDealerCrmText(body.source, 48) || "manual", cleanDealerCrmText(body.notes, 1200) || null, now, now).run();
    } catch (error: any) {
      if (/unique/i.test(String(error?.message || error))) return jsonResponse(409, { success: false, error: "vehicle_vin_exists" }, privateHeaders);
      throw error;
    }
  }

  if (module === "leads") {
    const customerId = cleanDealerCrmText(body.customer_id, 120);
    if (customerId && !(await ownedRow(env.DB, "hermes_dealer_customers", customerId, companyId))) return jsonResponse(400, { success: false, error: "customer_not_found" }, privateHeaders);
    const followUp = body.follow_up_at ? validIsoDateTime(body.follow_up_at) : "";
    if (body.follow_up_at && !followUp) return jsonResponse(400, { success: false, error: "invalid_follow_up_at" }, privateHeaders);
    const subject = cleanDealerCrmText(body.subject, 180);
    const message = cleanDealerCrmText(body.message, 2000);
    if (!subject && !message) return jsonResponse(400, { success: false, error: "lead_subject_or_message_required" }, privateHeaders);
    id = `dlead_${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_dealer_leads
        (id,company_id,owner_specialist_id,customer_id,channel,stage,subject,message,next_action,follow_up_at,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(id, companyId, auth.specialist.id, customerId || null, cleanDealerCrmText(body.channel, 48) || "manual", normalizeLeadStage(body.stage), subject || null, message || null, cleanDealerCrmText(body.next_action, 500) || null, followUp || null, now, now).run();
  }

  if (module === "appointments") {
    const startsAt = validIsoDateTime(body.starts_at);
    const appointmentType = cleanDealerCrmText(body.appointment_type, 100);
    if (!appointmentType) return jsonResponse(400, { success: false, error: "appointment_type_required" }, privateHeaders);
    if (!startsAt) return jsonResponse(400, { success: false, error: "invalid_starts_at" }, privateHeaders);
    const customerId = cleanDealerCrmText(body.customer_id, 120);
    const vehicleId = cleanDealerCrmText(body.vehicle_id, 120);
    const teamId = cleanDealerCrmText(body.assigned_team_member_id, 120);
    if (customerId && !(await ownedRow(env.DB, "hermes_dealer_customers", customerId, companyId))) return jsonResponse(400, { success: false, error: "customer_not_found" }, privateHeaders);
    if (vehicleId && !(await ownedRow(env.DB, "hermes_dealer_vehicles", vehicleId, companyId))) return jsonResponse(400, { success: false, error: "vehicle_not_found" }, privateHeaders);
    if (teamId && !(await ownedRow(env.DB, "hermes_dealer_team_members", teamId, companyId))) return jsonResponse(400, { success: false, error: "team_member_not_found" }, privateHeaders);
    id = `dapt_${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_dealer_appointments
        (id,company_id,owner_specialist_id,customer_id,vehicle_id,assigned_team_member_id,appointment_type,starts_at,status,notes,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(id, companyId, auth.specialist.id, customerId || null, vehicleId || null, teamId || null, appointmentType, startsAt, normalizeAppointmentStatus(body.status), cleanDealerCrmText(body.notes, 1200) || null, now, now).run();
  }

  if (module === "team") {
    const name = cleanDealerCrmText(body.name, 140);
    if (!name) return jsonResponse(400, { success: false, error: "team_member_name_required" }, privateHeaders);
    const email = body.email ? normalizeDealerEmail(body.email) : "";
    if (body.email && !email) return jsonResponse(400, { success: false, error: "invalid_team_email" }, privateHeaders);
    id = `dtm_${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_dealer_team_members
        (id,company_id,owner_specialist_id,name,role,department,email,phone,active,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).bind(id, companyId, auth.specialist.id, name, cleanDealerCrmText(body.role, 100) || null, normalizeTeamDepartment(body.department), email || null, normalizeDealerPhone(body.phone) || null, body.active === false ? 0 : 1, now, now).run();
  }

  await recordDealerActivity(env.DB, {
    companyId,
    actorId: auth.specialist.id,
    eventType: `${module}_created`,
    entityType: module,
    entityId: id,
    summary: `Private ${module} record created in dealer CRM.`,
  });
  return jsonResponse(201, { success: true, id, ...(await readModule(env.DB, companyId, module)) }, privateHeaders);
}

export async function onRequestPatch({ request, env }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const auth = await requireDealerCompany(request, env);
  if (auth.error) return jsonResponse(auth.error.status, { success: false, error: auth.error.code }, privateHeaders);
  const body = await parseBody(request);
  if (!body) return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  const module = cleanDealerCrmText(body.module, 32).toLowerCase();
  const id = cleanDealerCrmText(body.id, 120);
  if (!MUTABLE_MODULES.has(module) || !id) return jsonResponse(400, { success: false, error: "module_and_id_required" }, privateHeaders);
  const companyId = String(auth.company.id);
  const now = new Date().toISOString();

  if (module === "customers") {
    if (!(await ownedRow(env.DB, "hermes_dealer_customers", id, companyId))) return jsonResponse(404, { success: false, error: "record_not_found" }, privateHeaders);
    const name = cleanDealerCrmText(body.name, 140);
    const email = body.email ? normalizeDealerEmail(body.email) : "";
    if (!name) return jsonResponse(400, { success: false, error: "customer_name_required" }, privateHeaders);
    if (body.email && !email) return jsonResponse(400, { success: false, error: "invalid_customer_email" }, privateHeaders);
    if (email) {
      const duplicate = await env.DB.prepare("SELECT id FROM hermes_dealer_customers WHERE company_id=? AND email=? AND id<>? LIMIT 1").bind(companyId, email, id).first();
      if (duplicate) return jsonResponse(409, { success: false, error: "customer_email_exists", id: duplicate.id }, privateHeaders);
    }
    await env.DB.prepare("UPDATE hermes_dealer_customers SET name=?,email=?,phone=?,notes=?,updated_at=? WHERE id=? AND company_id=?")
      .bind(name, email || null, normalizeDealerPhone(body.phone) || null, cleanDealerCrmText(body.notes, 1200) || null, now, id, companyId).run();
  } else if (module === "vehicles") {
    if (!(await ownedRow(env.DB, "hermes_dealer_vehicles", id, companyId))) return jsonResponse(404, { success: false, error: "record_not_found" }, privateHeaders);
    const customerId = cleanDealerCrmText(body.customer_id, 120);
    if (customerId && !(await ownedRow(env.DB, "hermes_dealer_customers", customerId, companyId))) return jsonResponse(400, { success: false, error: "customer_not_found" }, privateHeaders);
    const vin = body.vin ? normalizeDealerVin(body.vin) : "";
    if (body.vin && !vin) return jsonResponse(400, { success: false, error: "invalid_vin" }, privateHeaders);
    const year = finiteYear(body.vehicle_year);
    if (body.vehicle_year && year == null) return jsonResponse(400, { success: false, error: "invalid_vehicle_year" }, privateHeaders);
    const make = cleanDealerCrmText(body.vehicle_make, 80);
    const model = cleanDealerCrmText(body.vehicle_model, 100);
    if (!vin && !make && !model) return jsonResponse(400, { success: false, error: "vehicle_identity_required" }, privateHeaders);
    try {
      await env.DB.prepare("UPDATE hermes_dealer_vehicles SET customer_id=?,vin=?,vehicle_year=?,vehicle_make=?,vehicle_model=?,stock_number=?,status=?,notes=?,updated_at=? WHERE id=? AND company_id=?")
        .bind(customerId || null, vin || null, year, make || null, model || null, cleanDealerCrmText(body.stock_number, 80) || null, normalizeVehicleStatus(body.status), cleanDealerCrmText(body.notes, 1200) || null, now, id, companyId).run();
    } catch (error: any) {
      if (/unique/i.test(String(error?.message || error))) return jsonResponse(409, { success: false, error: "vehicle_vin_exists" }, privateHeaders);
      throw error;
    }
  } else if (module === "leads") {
    if (!(await ownedRow(env.DB, "hermes_dealer_leads", id, companyId))) return jsonResponse(404, { success: false, error: "record_not_found" }, privateHeaders);
    const customerId = cleanDealerCrmText(body.customer_id, 120);
    if (customerId && !(await ownedRow(env.DB, "hermes_dealer_customers", customerId, companyId))) return jsonResponse(400, { success: false, error: "customer_not_found" }, privateHeaders);
    const followUp = body.follow_up_at ? validIsoDateTime(body.follow_up_at) : "";
    if (body.follow_up_at && !followUp) return jsonResponse(400, { success: false, error: "invalid_follow_up_at" }, privateHeaders);
    const subject = cleanDealerCrmText(body.subject, 180);
    const message = cleanDealerCrmText(body.message, 2000);
    if (!subject && !message) return jsonResponse(400, { success: false, error: "lead_subject_or_message_required" }, privateHeaders);
    await env.DB.prepare("UPDATE hermes_dealer_leads SET customer_id=?,channel=?,stage=?,subject=?,message=?,next_action=?,follow_up_at=?,updated_at=? WHERE id=? AND company_id=?")
      .bind(customerId || null, cleanDealerCrmText(body.channel, 48) || "manual", normalizeLeadStage(body.stage), subject || null, message || null, cleanDealerCrmText(body.next_action, 500) || null, followUp || null, now, id, companyId).run();
  } else if (module === "appointments") {
    if (!(await ownedRow(env.DB, "hermes_dealer_appointments", id, companyId))) return jsonResponse(404, { success: false, error: "record_not_found" }, privateHeaders);
    const startsAt = validIsoDateTime(body.starts_at);
    const appointmentType = cleanDealerCrmText(body.appointment_type, 100);
    if (!appointmentType) return jsonResponse(400, { success: false, error: "appointment_type_required" }, privateHeaders);
    if (!startsAt) return jsonResponse(400, { success: false, error: "invalid_starts_at" }, privateHeaders);
    const customerId = cleanDealerCrmText(body.customer_id, 120);
    const vehicleId = cleanDealerCrmText(body.vehicle_id, 120);
    const teamId = cleanDealerCrmText(body.assigned_team_member_id, 120);
    if (customerId && !(await ownedRow(env.DB, "hermes_dealer_customers", customerId, companyId))) return jsonResponse(400, { success: false, error: "customer_not_found" }, privateHeaders);
    if (vehicleId && !(await ownedRow(env.DB, "hermes_dealer_vehicles", vehicleId, companyId))) return jsonResponse(400, { success: false, error: "vehicle_not_found" }, privateHeaders);
    if (teamId && !(await ownedRow(env.DB, "hermes_dealer_team_members", teamId, companyId))) return jsonResponse(400, { success: false, error: "team_member_not_found" }, privateHeaders);
    await env.DB.prepare("UPDATE hermes_dealer_appointments SET customer_id=?,vehicle_id=?,assigned_team_member_id=?,appointment_type=?,starts_at=?,status=?,notes=?,updated_at=? WHERE id=? AND company_id=?")
      .bind(customerId || null, vehicleId || null, teamId || null, appointmentType, startsAt, normalizeAppointmentStatus(body.status), cleanDealerCrmText(body.notes, 1200) || null, now, id, companyId).run();
  } else {
    if (!(await ownedRow(env.DB, "hermes_dealer_team_members", id, companyId))) return jsonResponse(404, { success: false, error: "record_not_found" }, privateHeaders);
    const name = cleanDealerCrmText(body.name, 140);
    const email = body.email ? normalizeDealerEmail(body.email) : "";
    if (!name) return jsonResponse(400, { success: false, error: "team_member_name_required" }, privateHeaders);
    if (body.email && !email) return jsonResponse(400, { success: false, error: "invalid_team_email" }, privateHeaders);
    await env.DB.prepare("UPDATE hermes_dealer_team_members SET name=?,role=?,department=?,email=?,phone=?,active=?,updated_at=? WHERE id=? AND company_id=?")
      .bind(name, cleanDealerCrmText(body.role, 100) || null, normalizeTeamDepartment(body.department), email || null, normalizeDealerPhone(body.phone) || null, body.active === false ? 0 : 1, now, id, companyId).run();
  }

  await recordDealerActivity(env.DB, {
    companyId,
    actorId: auth.specialist.id,
    eventType: `${module}_updated`,
    entityType: module,
    entityId: id,
    summary: `Private ${module} record updated in dealer CRM.`,
  });
  return jsonResponse(200, { success: true, id, ...(await readModule(env.DB, companyId, module)) }, privateHeaders);
}

export async function onRequestDelete({ request, env }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const auth = await requireDealerCompany(request, env);
  if (auth.error) return jsonResponse(auth.error.status, { success: false, error: auth.error.code }, privateHeaders);
  const url = new URL(request.url);
  const module = cleanDealerCrmText(url.searchParams.get("module"), 32).toLowerCase();
  const id = cleanDealerCrmText(url.searchParams.get("id"), 120);
  if (!MUTABLE_MODULES.has(module) || !id) return jsonResponse(400, { success: false, error: "module_and_id_required" }, privateHeaders);
  const table = module === "customers" ? "hermes_dealer_customers"
    : module === "vehicles" ? "hermes_dealer_vehicles"
    : module === "leads" ? "hermes_dealer_leads"
    : module === "appointments" ? "hermes_dealer_appointments"
    : "hermes_dealer_team_members";
  const companyId = String(auth.company.id);
  const row = await ownedRow(env.DB, table, id, companyId);
  if (!row) return jsonResponse(404, { success: false, error: "record_not_found" }, privateHeaders);
  await env.DB.prepare(`DELETE FROM ${table} WHERE id = ? AND company_id = ?`).bind(id, companyId).run();
  await recordDealerActivity(env.DB, {
    companyId,
    actorId: auth.specialist.id,
    eventType: `${module}_deleted`,
    entityType: module,
    entityId: id,
    summary: `Private ${module} record deleted from dealer CRM.`,
  });
  return jsonResponse(200, { success: true, id }, privateHeaders);
}
