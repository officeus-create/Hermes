import { getOwnedBusinessContext } from "./service-context.mjs";
import {
  REPAIR_SHOP_SERVICE_VERTICAL,
  repairShopServiceHasUsage,
  resolveDefaultRepairShopServiceContext,
} from "./repair-shop-service-context.mjs";

export async function resolveServiceRequestContext(request, db, ownerId) {
  const requestedContextId = new URL(request.url).searchParams.get("context")?.trim() || "";
  if (requestedContextId) {
    const context = await getOwnedBusinessContext(db, ownerId, requestedContextId);
    if (!context) {
      return { ok: false, status: 404, error: "service_context_not_found" };
    }
    return {
      ok: true,
      context,
      includeLegacyUnmapped:
        context.vertical_key === REPAIR_SHOP_SERVICE_VERTICAL && Number(context.is_default) === 1,
    };
  }

  const repair = await resolveDefaultRepairShopServiceContext(db, ownerId);
  return { ok: true, context: repair.context, includeLegacyUnmapped: true };
}

export async function serviceHasUsageForContext(db, { context, ownerId, serviceId }) {
  if (context.vertical_key === REPAIR_SHOP_SERVICE_VERTICAL) {
    return repairShopServiceHasUsage(db, ownerId, serviceId);
  }
  return false;
}
