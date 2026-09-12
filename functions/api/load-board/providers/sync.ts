import { jsonResponse } from "../../_lib/session.mjs";
import { onRequestPost as ingestLoadBoardRecords } from "../intake";

type Env = {
  DB?: any;
  HERMES_PROVIDER_SYNC_ENABLED?: string;
  HERMES_PROVIDER_SYNC_TOKEN?: string;
  HERMES_LOADBOARD_INGEST_TOKEN?: string;
  LEAD_SERVICE_TOKEN?: string;
  HERMES_SHIP_CARS_COMMERCIAL_APPROVED?: string;
  HERMES_SHIP_CARS_DATA_RIGHTS_APPROVED?: string;
  HERMES_SHIP_CARS_PUBLIC_DISPLAY_APPROVED?: string;
  SHIP_CARS_ACCESS_TOKEN?: string;
  SHIP_CARS_CLIENT_ID?: string;
  SHIP_CARS_CLIENT_SECRET?: string;
  SHIP_CARS_USERNAME?: string;
  SHIP_CARS_PASSWORD?: string;
  SHIP_CARS_TOKEN_URL?: string;
};

const FILTER_KEYS = new Set([
  "delivery_city", "delivery_range", "delivery_state", "enclosed_trailer", "ids", "labels",
  "limit", "max_number_vehicles", "min_distance", "negotiation_state", "number_vehicles", "offset",
  "operable", "ordering", "own", "payment_terms", "pickup_city", "pickup_range", "pickup_state",
  "price_per_mile", "route_destination", "route_offset", "route_origin", "route_waypoint", "search",
  "ship_within", "total_carrier_pay", "vehicle_types",
]);

function text(value: unknown, max = 240) {
  return String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max);
}

function getPath(source: any, path: string) {
  return path.split(".").reduce((current, key) => current == null ? undefined : current[key], source);
}

function first(source: any, paths: string[]) {
  for (const path of paths) {
    const value = getPath(source, path);
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function numeric(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function locationLabel(location: any, fallback: unknown) {
  if (typeof location === "string" && location.trim()) return text(location, 180);
  const city = text(first(location, ["city", "cityName"]), 100);
  const state = text(first(location, ["state", "stateCode"]), 2).toUpperCase();
  const zip = text(first(location, ["zipCode", "zip", "postalCode"]), 10);
  const built = [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : "");
  return built.trim() || text(fallback, 180);
}

function asArray(payload: any) {
  if (Array.isArray(payload)) return payload;
  for (const path of ["results", "items", "content", "data", "postings", "records"]) {
    const value = getPath(payload, path);
    if (Array.isArray(value)) return value;
  }
  return [];
}

function vehicleList(posting: any) {
  for (const path of ["vehicles", "shippingItems", "load.vehicles", "load.shippingItems", "loadLeg.load.shippingItems"]) {
    const value = getPath(posting, path);
    if (Array.isArray(value)) return value;
  }
  return [];
}

function boolValue(value: unknown) {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "operable"].includes(normalized)) return true;
  if (["false", "0", "no", "inoperable"].includes(normalized)) return false;
  return null;
}

function carrierPay(posting: any) {
  const cents = numeric(first(posting, ["carrierPayInCents", "carrier_pay_in_cents", "loadLeg.carrierPayInCents", "posting.carrierPayInCents"]));
  if (cents !== null) return cents / 100;
  return numeric(first(posting, ["totalCarrierPay", "carrierPay", "payment.amount", "rate", "price"]));
}

function normalizeShipCarsPosting(posting: any, index: number, visibility: "carrier_only" | "public") {
  const providerId = text(first(posting, ["id", "postingId", "posting_id", "externalId", "loadLeg.id", "load.id", "shipperLoadId"]), 180) || `index-${index}`;
  const pickup = first(posting, ["route.pickupLocation", "pickupLocation", "pickup", "loadLeg.route.pickupLocation", "load.route.pickupLocation"]);
  const delivery = first(posting, ["route.deliveryLocation", "deliveryLocation", "delivery", "loadLeg.route.deliveryLocation", "load.route.deliveryLocation"]);
  const origin = locationLabel(pickup, first(posting, ["pickupAddress", "origin", "pickup"]));
  const destination = locationLabel(delivery, first(posting, ["deliveryAddress", "destination", "delivery"]));
  const vehicles = vehicleList(posting);
  const observedRaw = text(first(posting, ["lastModified", "updatedAt", "updated_at", "createdAt", "created_at"]), 64);
  const observedTime = observedRaw && !Number.isNaN(new Date(observedRaw).getTime()) ? new Date(observedRaw).getTime() : Date.now();
  const explicitVehicleCount = numeric(first(posting, ["numberVehicles", "number_vehicles", "vehicleCount"]));
  const vehicleCount = explicitVehicleCount ?? (vehicles.length > 0 ? vehicles.length : null);
  const trailerRaw = String(first(posting, ["trailerType", "load.useEnclosedTrailer", "useEnclosedTrailer", "posting.useEnclosedTrailer"]) ?? "");
  const operableRaw = first(posting, ["operable", "vehicleCondition", "vehicles.0.operableType", "shippingItems.0.operableType"]);
  const providerUrlCandidate = text(first(posting, ["url", "postingUrl", "webUrl"]), 500);
  const fingerprintVersion = text(first(posting, ["lastModified", "updatedAt", "updated_at", "version", "status"]), 80) || "current";

  return {
    source_message_id: providerId,
    fingerprint: `ship_cars:${providerId}:${fingerprintVersion}`.slice(0, 220),
    record_type: "load",
    provider_record_id: providerId,
    equipment: "car_hauler",
    origin,
    destination: destination || null,
    pickup_window: text(first(posting, ["route.pickupDateDetail.estimatedStartDate", "pickupDate", "pickup_window", "loadLeg.route.pickupDateDetail.estimatedStartDate"]), 160) || null,
    availability_text: text(first(posting, ["status", "negotiationState", "availability"]), 120) || null,
    rate_amount: carrierPay(posting),
    rate_currency: "USD",
    distance_miles: numeric(first(posting, ["route.distanceInMiles", "distanceInMiles", "distance", "loadLeg.route.distanceInMiles"])),
    vehicle_count: vehicleCount,
    operable: boolValue(operableRaw),
    enclosed: /enclosed|true|1/i.test(trailerRaw),
    payment_terms: text(first(posting, ["paymentTerms", "payment_terms", "payments.0.terms", "payment.type"]), 120) || null,
    rate_per_mile: numeric(first(posting, ["pricePerMile", "price_per_mile", "ratePerMile"])),
    received_at: new Date().toISOString(),
    observed_at: new Date(observedTime).toISOString(),
    expires_at: new Date(Math.max(Date.now(), observedTime) + 2 * 60 * 60 * 1000).toISOString(),
    visibility,
    provider_url: providerUrlCandidate.startsWith("https://") ? providerUrlCandidate : null,
    raw_evidence_ref: `ship_cars:${providerId}`,
  };
}

async function shipCarsAccessToken(env: Env) {
  if (env.SHIP_CARS_ACCESS_TOKEN) return env.SHIP_CARS_ACCESS_TOKEN;
  const required = [env.SHIP_CARS_CLIENT_ID, env.SHIP_CARS_CLIENT_SECRET, env.SHIP_CARS_USERNAME, env.SHIP_CARS_PASSWORD];
  if (required.some((value) => !value)) return null;
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: String(env.SHIP_CARS_CLIENT_ID),
    client_secret: String(env.SHIP_CARS_CLIENT_SECRET),
    username: String(env.SHIP_CARS_USERNAME),
    password: String(env.SHIP_CARS_PASSWORD),
  });
  const response = await fetch(env.SHIP_CARS_TOKEN_URL || "https://auth.ship.cars/auth/realms/master/protocol/openid-connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  if (!response.ok) throw new Error(`ship_cars_token_${response.status}`);
  const payload = await response.json() as { access_token?: string };
  return payload.access_token || null;
}

function appendFilter(params: URLSearchParams, key: string, value: any) {
  if (!FILTER_KEYS.has(key) || value === null || value === undefined || value === "") return;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 50)) params.append(key, String(item));
    return;
  }
  params.set(key, String(value));
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  if (env.HERMES_PROVIDER_SYNC_ENABLED !== "true") return jsonResponse(503, { success: false, error: "provider_sync_disabled" });

  const syncToken = String(env.HERMES_PROVIDER_SYNC_TOKEN || env.HERMES_LOADBOARD_INGEST_TOKEN || env.LEAD_SERVICE_TOKEN || "");
  if (!syncToken) return jsonResponse(503, { success: false, error: "provider_sync_token_not_configured" });
  if (request.headers.get("Authorization") !== `Bearer ${syncToken}`) return jsonResponse(401, { success: false, error: "unauthorized" });

  let body: any;
  try { body = await request.json(); } catch { body = {}; }
  const provider = text(body?.provider || "ship_cars", 80).toLowerCase();
  if (provider !== "ship_cars") {
    return jsonResponse(400, {
      success: false,
      error: "provider_not_live_yet",
      provider,
      available_live_connector: "ship_cars",
      adapter_registry_supports: ["central_dispatch", "super_dispatch", "truckstop", "dat", "ship_cars", "direct_freight", "loadboard_123"],
    });
  }
  if (env.HERMES_SHIP_CARS_COMMERCIAL_APPROVED !== "true" || env.HERMES_SHIP_CARS_DATA_RIGHTS_APPROVED !== "true") {
    return jsonResponse(403, { success: false, error: "ship_cars_rights_not_approved" });
  }

  let accessToken: string | null;
  try { accessToken = await shipCarsAccessToken(env); }
  catch (error) { return jsonResponse(502, { success: false, error: "ship_cars_auth_failed", detail: String(error) }); }
  if (!accessToken) return jsonResponse(503, { success: false, error: "ship_cars_credentials_not_configured" });

  const params = new URLSearchParams();
  const filters = body?.filters && typeof body.filters === "object" ? body.filters : {};
  for (const [key, value] of Object.entries(filters)) appendFilter(params, key, value);
  if (!params.has("limit")) params.set("limit", "100");
  const requestedLimit = Math.max(1, Math.min(250, Number.parseInt(params.get("limit") || "100", 10) || 100));
  params.set("limit", String(requestedLimit));

  const sourceResponse = await fetch(`https://ship.cars/api/loadboard/v3/postings?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!sourceResponse.ok) return jsonResponse(502, { success: false, error: "ship_cars_fetch_failed", status: sourceResponse.status });

  const sourcePayload = await sourceResponse.json();
  const rawRecords = asArray(sourcePayload).slice(0, requestedLimit);
  const visibility: "carrier_only" | "public" = env.HERMES_SHIP_CARS_PUBLIC_DISPLAY_APPROVED === "true" ? "public" : "carrier_only";
  const records = rawRecords.map((posting, index) => normalizeShipCarsPosting(posting, index, visibility)).filter((record) => record.origin);

  if (!records.length) {
    return jsonResponse(200, { success: true, provider: "ship_cars", fetched: rawRecords.length, accepted: 0, message: "No mappable active postings returned for this filter set." });
  }

  const ingestToken = String(env.HERMES_LOADBOARD_INGEST_TOKEN || env.LEAD_SERVICE_TOKEN || "");
  if (!ingestToken) return jsonResponse(503, { success: false, error: "ingest_secret_not_configured" });
  const ingestRequest = new Request(request.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${ingestToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      source: {
        id: "ship-cars-loadboard-v3",
        provider: "ship_cars",
        name: "Ship.Cars Loadboard v3",
        source_type: "api",
        credential_ref: "env:SHIP_CARS_*",
        redistribution_permission: visibility,
        contact_reveal_permission: "hidden",
        read_enabled: true,
        ingest_enabled: true,
      },
      records,
      quarantine: [],
    }),
  });
  const ingestResponse = await ingestLoadBoardRecords({ request: ingestRequest, env });
  const ingestPayload = await ingestResponse.json();
  return jsonResponse(ingestResponse.status, {
    success: ingestResponse.ok,
    provider: "ship_cars",
    source_endpoint: "/loadboard/v3/postings",
    fetched: rawRecords.length,
    mapped: records.length,
    visibility,
    ingest: ingestPayload,
    scraping_used: false,
    write_or_book_performed: false,
  });
}
