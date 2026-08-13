import { getAuthenticatedSpecialist, jsonResponse } from "./_lib/session.mjs";

type Env = { DB: D1Database };

const MAX_SERVICES = 6;
const MAX_AVAILABILITY_SLOTS = 12;

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const cleanText = (value: unknown, max: number) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

const unique = <T,>(values: T[]) => [...new Set(values)];

async function loadServicesAndAvailability(specialistId: string, db: D1Database) {
  const services = await db
    .prepare(
      "SELECT s.id, s.name, s.duration_minutes as durationMinutes FROM services s JOIN specialist_services ss ON ss.service_id = s.id WHERE ss.specialist_id = ?",
    )
    .bind(specialistId)
    .all();
  const availability = await db
    .prepare("SELECT slot FROM specialist_availability WHERE specialist_id = ?")
    .bind(specialistId)
    .all();
  return {
    services: services.results ?? [],
    availability: (availability.results ?? []).map((row: any) => row.slot),
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const { services, availability } = await loadServicesAndAvailability(specialist.id, env.DB);
  return jsonResponse(200, { success: true, profile: { ...specialist, services, availability } });
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const name = cleanText(body.name, 100);
  const role = cleanText(body.role, 120);
  const location = cleanText(body.location, 120);
  const bio = cleanText(body.bio, 500);
  const serviceIds = unique(Array.isArray(body.serviceIds) ? (body.serviceIds as unknown[]) : [])
    .map((id) => cleanText(id, 60))
    .slice(0, MAX_SERVICES);
  const availability = unique(Array.isArray(body.availability) ? (body.availability as unknown[]) : [])
    .map((slot) => cleanText(slot, 60))
    .slice(0, MAX_AVAILABILITY_SLOTS);

  const errors: string[] = [];
  if (name.length < 2) errors.push("name_required");
  if (role.length < 2) errors.push("role_required");
  if (location.length < 2) errors.push("location_required");
  if (bio.length < 20) errors.push("bio_too_short");
  if (!serviceIds.length) errors.push("service_required");
  if (!availability.length) errors.push("availability_required");

  if (serviceIds.length) {
    const placeholders = serviceIds.map(() => "?").join(",");
    const known = await env.DB
      .prepare(`SELECT id FROM services WHERE id IN (${placeholders}) AND (owner_specialist_id IS NULL OR owner_specialist_id = ?)`)
      .bind(...serviceIds, specialist.id)
      .all();
    if ((known.results ?? []).length !== serviceIds.length) errors.push("unknown_service");
  }
  if (availability.length) {
    const placeholders = availability.map(() => "?").join(",");
    const known = await env.DB.prepare(`SELECT slot FROM availability_slots WHERE slot IN (${placeholders})`)
      .bind(...availability)
      .all();
    if ((known.results ?? []).length !== availability.length) errors.push("unknown_availability");
  }
  if (errors.length) return jsonResponse(400, { success: false, errors });

  await env.DB.prepare("UPDATE specialists SET name = ?, role = ?, location = ?, bio = ? WHERE id = ?")
    .bind(name, role, location, bio, specialist.id)
    .run();

  await env.DB.batch([
    env.DB.prepare("DELETE FROM specialist_services WHERE specialist_id = ?").bind(specialist.id),
    env.DB.prepare("DELETE FROM specialist_availability WHERE specialist_id = ?").bind(specialist.id),
    ...serviceIds.map((id) =>
      env.DB.prepare("INSERT INTO specialist_services (specialist_id, service_id) VALUES (?, ?)").bind(specialist.id, id),
    ),
    ...availability.map((slot) =>
      env.DB.prepare("INSERT INTO specialist_availability (specialist_id, slot) VALUES (?, ?)").bind(specialist.id, slot),
    ),
  ]);

  const { services, availability: savedAvailability } = await loadServicesAndAvailability(specialist.id, env.DB);
  return jsonResponse(200, {
    success: true,
    profile: { id: specialist.id, email: specialist.email, name, role, location, bio, services, availability: savedAvailability },
  });
}
