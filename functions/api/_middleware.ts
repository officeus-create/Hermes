type PagesContext = {
  request: Request;
  next(): Promise<Response>;
};

type CarrierContractPayload = {
  selected_plan?: unknown;
  service_percentage?: unknown;
};

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

export async function onRequest(context: PagesContext) {
  const url = new URL(context.request.url);
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
