import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";

type Env = { DB?: any };

type ServiceInput = {
  name?: unknown;
  duration_minutes?: unknown;
};

const normalizeName = (value: unknown) => String(value ?? "").trim();
const normalizeDuration = (value: unknown) => Number(value);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const result = await env.DB
    .prepare(
      "SELECT id,name,duration_minutes,owner_specialist_id FROM services WHERE owner_specialist_id = ? ORDER BY name COLLATE NOCASE ASC",
    )
    .bind(specialist.id)
    .all();

  return jsonResponse(200, { success: true, services: result?.results ?? [] });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  let body: ServiceInput;
  try {
    body = (await request.json()) as ServiceInput;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  const name = normalizeName(body.name);
  const durationMinutes = normalizeDuration(body.duration_minutes);

  if (name.length < 2 || name.length > 120) {
    return jsonResponse(400, { success: false, error: "invalid_service_name" });
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 720) {
    return jsonResponse(400, { success: false, error: "invalid_duration_minutes" });
  }

  const duplicate = await env.DB
    .prepare(
      "SELECT id FROM services WHERE owner_specialist_id = ? AND lower(name) = lower(?) LIMIT 1",
    )
    .bind(specialist.id, name)
    .first();

  if (duplicate) return jsonResponse(409, { success: false, error: "service_already_exists" });

  const id = `service-${crypto.randomUUID()}`;
  await env.DB
    .prepare("INSERT INTO services (id,name,duration_minutes,owner_specialist_id) VALUES (?,?,?,?)")
    .bind(id, name, durationMinutes, specialist.id)
    .run();

  return jsonResponse(201, {
    success: true,
    service: { id, name, duration_minutes: durationMinutes, owner_specialist_id: specialist.id },
  });
}
