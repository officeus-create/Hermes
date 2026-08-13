import { getAuthenticatedSpecialist, jsonResponse } from "./_lib/session.mjs";

type Env = { DB: D1Database };

const MAX_CUSTOM_SERVICES = 30;
const MIN_DURATION = 5;
const MAX_DURATION = 480;

const CONTROL_CHARS = new RegExp(
  "[<>" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g",
);
const cleanText = (value: unknown, max: number) =>
  String(value ?? "").replace(CONTROL_CHARS, "").trim().slice(0, max);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const services = await env.DB
    .prepare(
      `SELECT id, name, duration_minutes as durationMinutes, owner_specialist_id as ownerSpecialistId
       FROM services WHERE owner_specialist_id IS NULL OR owner_specialist_id = ?
       ORDER BY owner_specialist_id IS NULL DESC, name ASC`,
    )
    .bind(specialist.id)
    .all();

  return jsonResponse(200, { success: true, services: services.results ?? [] });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const existingCount = await env.DB
    .prepare("SELECT COUNT(*) as n FROM services WHERE owner_specialist_id = ?")
    .bind(specialist.id)
    .first<{ n: number }>();
  if ((existingCount?.n ?? 0) >= MAX_CUSTOM_SERVICES) return jsonResponse(400, { success: false, error: "too_many_services" });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const name = cleanText(body.name, 100);
  const durationMinutes = Math.round(Number(body.durationMinutes));

  const errors: string[] = [];
  if (name.length < 2) errors.push("name_required");
  if (!Number.isFinite(durationMinutes) || durationMinutes < MIN_DURATION || durationMinutes > MAX_DURATION) errors.push("duration_invalid");
  if (errors.length) return jsonResponse(400, { success: false, errors });

  const id = `svc-${crypto.randomUUID()}`;
  await env.DB
    .prepare("INSERT INTO services (id, name, duration_minutes, owner_specialist_id) VALUES (?, ?, ?, ?)")
    .bind(id, name, durationMinutes, specialist.id)
    .run();

  return jsonResponse(201, { success: true, service: { id, name, durationMinutes, ownerSpecialistId: specialist.id } });
}
