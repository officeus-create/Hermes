import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  createServiceForContext,
  findDuplicateServiceForContext,
  listServicesForContext,
} from "../_lib/service-context.mjs";
import { resolveServiceRequestContext } from "../_lib/service-request-context.mjs";

type Env = { DB?: any };

type ServiceInput = {
  name?: unknown;
  duration_minutes?: unknown;
};

const normalizeName = (value: unknown) => String(value ?? "").trim();
const normalizeDuration = (value: unknown) => Number(value);
const publicContext = (context: any) => ({ id: context.id, vertical_key: context.vertical_key });

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const resolved = await resolveServiceRequestContext(request, env.DB, specialist.id);
  if (!resolved.ok) return jsonResponse(resolved.status, { success: false, error: resolved.error });

  const services = await listServicesForContext(env.DB, {
    ownerId: specialist.id,
    contextId: resolved.context.id,
    includeLegacyUnmapped: resolved.includeLegacyUnmapped,
  });

  return jsonResponse(200, {
    success: true,
    context: publicContext(resolved.context),
    services,
  });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const resolved = await resolveServiceRequestContext(request, env.DB, specialist.id);
  if (!resolved.ok) return jsonResponse(resolved.status, { success: false, error: resolved.error });

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

  const duplicate = await findDuplicateServiceForContext(env.DB, {
    ownerId: specialist.id,
    contextId: resolved.context.id,
    name,
    includeLegacyUnmapped: resolved.includeLegacyUnmapped,
  });
  if (duplicate) return jsonResponse(409, { success: false, error: "service_already_exists" });

  let service;
  try {
    service = await createServiceForContext(env.DB, {
      ownerId: specialist.id,
      contextId: resolved.context.id,
      name,
      durationMinutes,
    });
  } catch (error) {
    if (/unique|constraint/i.test(String(error))) {
      return jsonResponse(409, { success: false, error: "service_already_exists" });
    }
    throw error;
  }

  return jsonResponse(201, {
    success: true,
    context: publicContext(resolved.context),
    service,
  });
}
