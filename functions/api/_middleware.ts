type PagesContext = {
  request: Request;
  next(input?: Request | string, init?: RequestInit): Promise<Response>;
};

type CarrierContractPayload = {
  selected_plan?: unknown;
  service_percentage?: unknown;
};

type GeneralLeadPayload = {
  source_path?: unknown;
  interest?: unknown;
  direction_fields?: unknown;
};

const REPAIR_SHOP_PLAN_PATH = "/services/hermes-connect/repair-shops/plan/";

const normalizePercentage = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const number = Number(String(value).trim());
  return Number.isFinite(number) ? number : null;
};

const mismatchResponse = () => new Response(
  JSON.stringify({ success: false, error: "plan_percentage_mismatch" }),
  {
    status: 400,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  },
);

const normalizeRepairShopPlanLead = async (context: PagesContext, url: URL) => {
  if (url.pathname !== "/api/logistics-lead" || context.request.method !== "POST") return null;
  if (!context.request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) return null;

  let payload: GeneralLeadPayload;
  try {
    payload = await context.request.clone().json() as GeneralLeadPayload;
  } catch {
    return null;
  }

  if (payload.source_path !== REPAIR_SHOP_PLAN_PATH) return null;

  const normalized = {
    ...payload,
    interest: "IT Development",
    direction_fields: {
      direction: "IT Development",
      fields: {
        system_or_workflow_needed: "Hermes Connect Repair Shops — Founding Shop Plan paid activation",
        number_of_users: "One repair shop location",
        budget_range: "$99/month Founding Shop Plan",
      },
    },
  };

  const headers = new Headers(context.request.headers);
  headers.delete("Content-Length");
  const request = new Request(context.request.url, {
    method: context.request.method,
    headers,
    body: JSON.stringify(normalized),
  });
  return context.next(request);
};

export async function onRequest(context: PagesContext) {
  const url = new URL(context.request.url);

  const repairShopPlanResponse = await normalizeRepairShopPlanLead(context, url);
  if (repairShopPlanResponse) return repairShopPlanResponse;

  if (url.pathname !== "/api/carrier-contract" || context.request.method !== "POST") return context.next();
  if (!context.request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) return context.next();

  let payload: CarrierContractPayload;
  try {
    payload = await context.request.clone().json() as CarrierContractPayload;
  } catch {
    return context.next();
  }

  const plan = typeof payload.selected_plan === "string" ? payload.selected_plan.trim() : "";
  const percentage = normalizePercentage(payload.service_percentage);

  if (plan === "essential" && percentage !== 6) return mismatchResponse();
  if (plan === "pro" && percentage !== 8) return mismatchResponse();

  return context.next();
}
