import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

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

async function assertOwnership(staffId: string, specialistId: string, db: D1Database) {
  const row = await db.prepare("SELECT id FROM staff_members WHERE id = ? AND specialist_id = ?").bind(staffId, specialistId).first();
  return !!row;
}

export async function onRequestPut({ request, params, env }: { request: Request; params: { id: string }; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const staffId = String(params.id || "").slice(0, 80);
  if (!(await assertOwnership(staffId, specialist.id, env.DB))) return jsonResponse(404, { success: false, error: "staff_not_found" });

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

  await env.DB.batch([
    env.DB.prepare("UPDATE staff_members SET name = ?, role = ? WHERE id = ?").bind(name, role, staffId),
    env.DB.prepare("DELETE FROM staff_services WHERE staff_id = ?").bind(staffId),
    env.DB.prepare("DELETE FROM staff_availability WHERE staff_id = ?").bind(staffId),
    ...serviceIds.map((sid) => env.DB.prepare("INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)").bind(staffId, sid)),
    ...availability.map((slot) => env.DB.prepare("INSERT INTO staff_availability (staff_id, slot) VALUES (?, ?)").bind(staffId, slot)),
  ]);

  return jsonResponse(200, { success: true, staffMember: { id: staffId, name, role, services: serviceIds, availability } });
}

export async function onRequestDelete({ request, params, env }: { request: Request; params: { id: string }; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const staffId = String(params.id || "").slice(0, 80);
  if (!(await assertOwnership(staffId, specialist.id, env.DB))) return jsonResponse(404, { success: false, error: "staff_not_found" });

  await env.DB.prepare("DELETE FROM staff_members WHERE id = ?").bind(staffId).run();
  return jsonResponse(200, { success: true });
}
