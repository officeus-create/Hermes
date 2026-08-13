import { getAuthenticatedSpecialist, jsonResponse } from "./_lib/session.mjs";

type Env = { DB: D1Database };

const MAX_STAFF = 20;
const MAX_SERVICES = 6;
const MAX_AVAILABILITY_SLOTS = 12;

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const cleanText = (value: unknown, max: number) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);
const unique = <T,>(values: T[]) => [...new Set(values)];

async function loadStaffServicesAndAvailability(staffId: string, db: D1Database) {
  const services = await db
    .prepare(
      "SELECT s.id, s.name, s.duration_minutes as durationMinutes FROM services s JOIN staff_services ss ON ss.service_id = s.id WHERE ss.staff_id = ?",
    )
    .bind(staffId)
    .all();
  const availability = await db
    .prepare("SELECT slot FROM staff_availability WHERE staff_id = ?")
    .bind(staffId)
    .all();
  return {
    services: services.results ?? [],
    availability: (availability.results ?? []).map((row: any) => row.slot),
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const rows = await env.DB
    .prepare("SELECT id, name, role, created_at as createdAt FROM staff_members WHERE specialist_id = ? ORDER BY created_at ASC")
    .bind(specialist.id)
    .all();

  const staff = await Promise.all(
    (rows.results ?? []).map(async (row: any) => ({ ...row, ...(await loadStaffServicesAndAvailability(row.id, env.DB)) })),
  );

  return jsonResponse(200, { success: true, staff });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const existingCount = await env.DB
    .prepare("SELECT COUNT(*) as n FROM staff_members WHERE specialist_id = ?")
    .bind(specialist.id)
    .first<{ n: number }>();
  if ((existingCount?.n ?? 0) >= MAX_STAFF) return jsonResponse(400, { success: false, error: "too_many_staff" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const name = cleanText(body.name, 100);
  const role = cleanText(body.role, 120);
  const serviceIds = unique(Array.isArray(body.serviceIds) ? (body.serviceIds as unknown[]) : [])
    .map((id) => cleanText(id, 60))
    .slice(0, MAX_SERVICES);
  const availability = unique(Array.isArray(body.availability) ? (body.availability as unknown[]) : [])
    .map((slot) => cleanText(slot, 60))
    .slice(0, MAX_AVAILABILITY_SLOTS);

  const errors: string[] = [];
  if (name.length < 2) errors.push("name_required");
  if (role.length < 2) errors.push("role_required");
  if (!serviceIds.length) errors.push("service_required");
  if (!availability.length) errors.push("availability_required");
  if (errors.length) return jsonResponse(400, { success: false, errors });

  if (serviceIds.length) {
    const placeholders = serviceIds.map(() => "?").join(",");
    const known = await env.DB
      .prepare(`SELECT id FROM services WHERE id IN (${placeholders}) AND (owner_specialist_id IS NULL OR owner_specialist_id = ?)`)
      .bind(...serviceIds, specialist.id)
      .all();
    if ((known.results ?? []).length !== serviceIds.length) return jsonResponse(400, { success: false, error: "unknown_service" });
  }

  const id = `staff-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare("INSERT INTO staff_members (id, specialist_id, name, role, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, specialist.id, name, role, createdAt),
    ...serviceIds.map((sid) =>
      env.DB.prepare("INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)").bind(id, sid),
    ),
    ...availability.map((slot) =>
      env.DB.prepare("INSERT INTO staff_availability (staff_id, slot) VALUES (?, ?)").bind(id, slot),
    ),
  ]);

  const { services, availability: savedAvailability } = await loadStaffServicesAndAvailability(id, env.DB);
  return jsonResponse(201, { success: true, staffMember: { id, name, role, createdAt, services, availability: savedAvailability } });
}
