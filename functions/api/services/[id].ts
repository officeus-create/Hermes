import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { deleteServiceForContext, findServiceForContext } from "../_lib/service-context.mjs";
import {
  resolveServiceRequestContext,
  serviceHasUsageForContext,
} from "../_lib/service-request-context.mjs";

type Env = { DB?: any };

export async function onRequestDelete({ request, env, params }: { request: Request; env: Env; params: { id?: string } }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" });

  const id = String(params.id ?? "").trim();
  if (!id) return jsonResponse(400, { success: false, error: "service_id_required" });

  const resolved = await resolveServiceRequestContext(request, env.DB, specialist.id);
  if (!resolved.ok) return jsonResponse(resolved.status, { success: false, error: resolved.error });

  const service = await findServiceForContext(env.DB, {
    ownerId: specialist.id,
    contextId: resolved.context.id,
    serviceId: id,
    includeLegacyUnmapped: resolved.includeLegacyUnmapped,
  });
  if (!service) return jsonResponse(404, { success: false, error: "service_not_found" });

  const hasUsage = await serviceHasUsageForContext(env.DB, {
    context: resolved.context,
    ownerId: specialist.id,
    serviceId: id,
  });
  if (hasUsage) return jsonResponse(409, { success: false, error: "service_has_bookings" });

  await deleteServiceForContext(env.DB, { ownerId: specialist.id, serviceId: id });
  return jsonResponse(200, { success: true, deleted: id });
}
