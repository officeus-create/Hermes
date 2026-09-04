import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any };

const ALLOWED_TYPES = new Set(["load", "capacity"]);
const ALLOWED_EQUIPMENT = new Set([
  "dry_van",
  "reefer",
  "flatbed",
  "step_deck",
  "power_only",
  "hotshot",
  "box_truck",
  "sprinter_van",
  "car_hauler",
  "other",
]);

function looksLikeCarrierRole(role: unknown) {
  return /carrier|owner[- ]?operator|dispatcher/i.test(String(role ?? ""));
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureLoadBoardSchema(env.DB);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  const carrierCandidate = Boolean(specialist && looksLikeCarrierRole(specialist.role));
  const url = new URL(request.url);
  const recordType = String(url.searchParams.get("type") || "").trim();
  const equipment = String(url.searchParams.get("equipment") || "").trim();

  const conditions = ["status = 'active'", "expires_at > ?"];
  const bindings: any[] = [new Date().toISOString()];

  if (carrierCandidate) conditions.push("visibility IN ('public', 'carrier_only')");
  else conditions.push("visibility = 'public'");

  if (recordType && ALLOWED_TYPES.has(recordType)) {
    conditions.push("record_type = ?");
    bindings.push(recordType);
  }
  if (equipment && ALLOWED_EQUIPMENT.has(equipment)) {
    conditions.push("equipment = ?");
    bindings.push(equipment);
  }

  const query = `
    SELECT
      id,
      record_type,
      source_name,
      equipment,
      origin,
      destination,
      pickup_window,
      availability_text,
      team,
      rate_amount,
      rate_currency,
      observed_at,
      expires_at
    FROM hermes_load_records
    WHERE ${conditions.join(" AND ")}
    ORDER BY observed_at DESC
    LIMIT 250
  `;

  const result = await env.DB.prepare(query).bind(...bindings).all();
  const records = (result?.results || []).map((row: any) => ({
    id: row.id,
    type: row.record_type,
    source: row.source_name,
    equipment: row.equipment,
    origin: row.origin,
    destination: row.destination || null,
    pickupWindow: row.pickup_window || null,
    availability: row.availability_text || null,
    team: Boolean(row.team),
    rate: row.rate_amount == null ? null : { amount: row.rate_amount, currency: row.rate_currency || "USD" },
    observedAt: row.observed_at,
    expiresAt: row.expires_at,
  }));

  return jsonResponse(200, {
    success: true,
    audience: carrierCandidate ? "carrier_candidate" : "public",
    carrier_verification_required_for_contact: true,
    contact_details_exposed: false,
    count: records.length,
    records,
  }, {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
