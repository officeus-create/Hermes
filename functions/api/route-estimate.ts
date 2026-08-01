type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type Env = {
  GOOGLE_MAPS_API_KEY?: string;
  ROUTE_LIMITS?: KvNamespace;
  ROUTE_ESTIMATE_ENABLED?: string;
  ALLOWED_ORIGIN?: string;
};

export type RouteEstimateContext = {
  request: Request;
  env: Env;
};

type RouteLocationInput = {
  place_id?: unknown;
  address?: unknown;
};

type RouteEstimateInput = {
  origin?: unknown;
  destination?: unknown;
};

type GoogleRouteResponse = {
  routes?: Array<{
    distanceMeters?: unknown;
    duration?: unknown;
  }>;
};

type FetchImplementation = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const DEFAULT_ORIGIN = "https://hermeslogisticsus.com";
const GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const FIELD_MASK = "routes.distanceMeters,routes.duration";
const MAX_BODY_BYTES = 4_096;
const MAX_ADDRESS_LENGTH = 240;
const MAX_PLACE_ID_LENGTH = 255;
const RATE_LIMIT = 10;
const RATE_WINDOW_SECONDS = 60 * 60;
const METERS_PER_MILE = 1_609.344;

const US_STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
  "WI", "WY", "DC",
]);

const responseHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin",
  "X-Content-Type-Options": "nosniff",
});

const json = (origin: string, status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), { status, headers: responseHeaders(origin) });

const clean = (value: unknown, max: number) =>
  typeof value === "string"
    ? value
        .replace(/[<>\u0000-\u001f\u007f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

const hash = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
};

const hasUsLocationSignal = (address: string) => {
  const upper = address.toUpperCase();
  if (/\b(?:USA|UNITED STATES)\b/.test(upper)) return true;
  if (/\b\d{5}(?:-\d{4})?\b/.test(upper)) return true;
  return [...US_STATE_CODES].some((code) => new RegExp(`(?:^|[,\\s])${code}(?:$|[,\\s\\d])`).test(upper));
};

const waypointFrom = (value: unknown): { waypoint?: { placeId: string } | { address: string }; error?: string } => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "location_required" };
  const input = value as RouteLocationInput;
  const placeId = clean(input.place_id, MAX_PLACE_ID_LENGTH);
  const address = clean(input.address, MAX_ADDRESS_LENGTH);

  if (placeId && address) return { error: "choose_place_id_or_address" };
  if (placeId) {
    if (!/^[A-Za-z0-9_-]{10,255}$/.test(placeId)) return { error: "invalid_place_id" };
    return { waypoint: { placeId } };
  }
  if (address) {
    if (address.length < 5 || !hasUsLocationSignal(address)) return { error: "invalid_us_address" };
    return { waypoint: { address } };
  }
  return { error: "location_required" };
};

const parseDurationSeconds = (value: unknown) => {
  if (typeof value !== "string") return 0;
  const match = value.match(/^(\d+(?:\.\d+)?)s$/);
  if (!match) return 0;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
};

export async function handleRouteEstimate(
  { request, env }: RouteEstimateContext,
  fetchImpl: FetchImplementation = fetch,
) {
  const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const originHeader = request.headers.get("Origin") || "";
  if (originHeader !== allowedOrigin) {
    return json(allowedOrigin, 403, { success: false, error: "origin_not_allowed" });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders(allowedOrigin) });
  }
  if (request.method !== "POST") {
    return json(allowedOrigin, 405, { success: false, error: "method_not_allowed" });
  }
  if (env.ROUTE_ESTIMATE_ENABLED !== "true" || !env.GOOGLE_MAPS_API_KEY || !env.ROUTE_LIMITS) {
    return json(allowedOrigin, 503, { success: false, error: "route_estimate_not_configured" });
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json(allowedOrigin, 415, { success: false, error: "content_type_required" });
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return json(allowedOrigin, 413, { success: false, error: "request_too_large" });
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json(allowedOrigin, 413, { success: false, error: "request_too_large" });
  }

  let input: RouteEstimateInput;
  try {
    input = JSON.parse(raw) as RouteEstimateInput;
  } catch {
    return json(allowedOrigin, 400, { success: false, error: "invalid_json" });
  }

  const origin = waypointFrom(input.origin);
  const destination = waypointFrom(input.destination);
  if (!origin.waypoint || !destination.waypoint) {
    return json(allowedOrigin, 400, {
      success: false,
      error: "invalid_location",
      origin_error: origin.error || null,
      destination_error: destination.error || null,
    });
  }
  if (JSON.stringify(origin.waypoint) === JSON.stringify(destination.waypoint)) {
    return json(allowedOrigin, 400, { success: false, error: "origin_destination_must_differ" });
  }

  const clientAddress = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `route-estimate:rate:${await hash(clientAddress)}`;
  const currentRate = Number(await env.ROUTE_LIMITS.get(rateKey) || "0");
  if (currentRate >= RATE_LIMIT) {
    return json(allowedOrigin, 429, { success: false, error: "rate_limit_exceeded" });
  }
  await env.ROUTE_LIMITS.put(rateKey, String(currentRate + 1), { expirationTtl: RATE_WINDOW_SECONDS });

  let upstream: Response;
  try {
    upstream = await fetchImpl(GOOGLE_ROUTES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        origin: origin.waypoint,
        destination: destination.waypoint,
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
        languageCode: "en-US",
        units: "IMPERIAL",
      }),
    });
  } catch {
    return json(allowedOrigin, 503, { success: false, error: "estimate_temporarily_unavailable" });
  }

  if (!upstream.ok) {
    const status = upstream.status === 400 || upstream.status === 404 ? 422 : 503;
    const error = status === 422 ? "route_not_found" : "estimate_temporarily_unavailable";
    return json(allowedOrigin, status, { success: false, error });
  }

  let data: GoogleRouteResponse;
  try {
    data = await upstream.json() as GoogleRouteResponse;
  } catch {
    return json(allowedOrigin, 502, { success: false, error: "invalid_provider_response" });
  }

  const route = data.routes?.[0];
  const distanceMeters = typeof route?.distanceMeters === "number" ? route.distanceMeters : Number(route?.distanceMeters);
  const durationSeconds = parseDurationSeconds(route?.duration);
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0 || durationSeconds <= 0) {
    return json(allowedOrigin, 422, { success: false, error: "route_not_found" });
  }

  return json(allowedOrigin, 200, {
    success: true,
    estimate_type: "general_driving_route",
    distance_meters: Math.round(distanceMeters),
    distance_miles: Math.round((distanceMeters / METERS_PER_MILE) * 10) / 10,
    duration_seconds: durationSeconds,
    duration_minutes: Math.ceil(durationSeconds / 60),
    disclaimer: "General driving estimate for planning only. It is not truck-specific and does not confirm access, legal routing, tolls, pickup timing, delivery timing, price, or carrier availability.",
  });
}

export async function onRequest(context: RouteEstimateContext) {
  return handleRouteEstimate(context);
}
