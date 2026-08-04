import { onRequest as onLogisticsLeadRequest } from "./logistics-lead";

type Context = {
  request: Request;
  env: Record<string, unknown> & { ALLOWED_ORIGIN?: string };
};

const CONNECT_ORIGIN = "https://connect.hermeslogisticsus.com";
const MAIN_ORIGIN = "https://hermeslogisticsus.com";

const corsHeaders = () => ({
  "Access-Control-Allow-Origin": CONNECT_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin",
});

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status, headers: corsHeaders() });

export async function onRequest(context: Context) {
  const incomingOrigin = context.request.headers.get("Origin") || "";
  if (incomingOrigin !== CONNECT_ORIGIN) {
    return json(403, { success: false, error: "origin_not_allowed" });
  }

  const forwardedHeaders = new Headers(context.request.headers);
  forwardedHeaders.set("Origin", MAIN_ORIGIN);
  const forwardedRequest = new Request(context.request, { headers: forwardedHeaders });
  const forwardedEnv = { ...context.env, ALLOWED_ORIGIN: MAIN_ORIGIN };
  const upstream = await onLogisticsLeadRequest({ request: forwardedRequest, env: forwardedEnv } as never);
  const headers = new Headers(upstream.headers);
  headers.set("Access-Control-Allow-Origin", CONNECT_ORIGIN);
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key");
  headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Origin");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
