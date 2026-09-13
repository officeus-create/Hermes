import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";
import { specialistHasLoadBoardAccess } from "../_lib/hermes-company-profiles.mjs";

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

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureLoadBoardSchema(env.DB);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  const carrierCandidate = await specialistHasLoadBoardAccess(env.DB, specialist);
  const url = new URL(request.url);
  const recordType = String(url.searchParams.get("type") || "").trim();
  const equipment = String(url.searchParams.get("equipment") || "").trim();

  const conditions = ["r.status = 'active'", "r.expires_at > ?"];
  const bindings: any[] = [new Date().toISOString()];

  if (carrierCandidate) conditions.push("r.visibility IN ('public', 'carrier_only')");
  else conditions.push("r.visibility = 'public'");

  if (recordType && ALLOWED_TYPES.has(recordType)) {
    conditions.push("r.record_type = ?");
    bindings.push(recordType);
  }
  if (equipment && ALLOWED_EQUIPMENT.has(equipment)) {
    conditions.push("r.equipment = ?");
    bindings.push(equipment);
  }

  const query = `
    WITH ranked AS (
      SELECT
        r.*,
        s.provider,
        COUNT(*) OVER (
          PARTITION BY r.record_type, CASE WHEN r.dedupe_key IS NOT NULL AND r.dedupe_key <> '' THEN r.dedupe_key ELSE r.id END
        ) AS duplicate_count,
        ROW_NUMBER() OVER (
          PARTITION BY r.record_type, CASE WHEN r.dedupe_key IS NOT NULL AND r.dedupe_key <> '' THEN r.dedupe_key ELSE r.id END
          ORDER BY COALESCE(r.source_quality_score, 0) DESC, r.observed_at DESC, r.id ASC
        ) AS cluster_rank
      FROM hermes_load_records r
      LEFT JOIN hermes_load_sources s ON s.id = r.source_id
      WHERE ${conditions.join(" AND ")}
    )
    SELECT
      id, record_type, source_name, provider, equipment, origin, origin_city, origin_state, origin_zip,
      destination, destination_city, destination_state, destination_zip, pickup_window, delivery_window,
      availability_text, team, rate_amount, rate_currency, distance_miles, deadhead_miles, weight_lbs,
      length_feet, vehicle_count, operable, enclosed, payment_terms, rate_per_mile, source_quality_score,
      risk_flags, provider_url, observed_at, expires_at, duplicate_count
    FROM ranked
    WHERE cluster_rank = 1
    ORDER BY COALESCE(source_quality_score, 0) DESC, observed_at DESC
    LIMIT 250
  `;

  const result = await env.DB.prepare(query).bind(...bindings).all();
  const records = (result?.results || []).map((row: any) => ({
    id: row.id,
    type: row.record_type,
    source: row.source_name,
    provider: row.provider || null,
    equipment: row.equipment,
    origin: row.origin,
    originCity: row.origin_city || null,
    originState: row.origin_state || null,
    originZip: row.origin_zip || null,
    destination: row.destination || null,
    destinationCity: row.destination_city || null,
    destinationState: row.destination_state || null,
    destinationZip: row.destination_zip || null,
    pickupWindow: row.pickup_window || null,
    deliveryWindow: row.delivery_window || null,
    availability: row.availability_text || null,
    team: Boolean(row.team),
    rateAmount: row.rate_amount == null ? null : Number(row.rate_amount),
    rateCurrency: row.rate_currency || "USD",
    rate: row.rate_amount == null ? null : { amount: Number(row.rate_amount), currency: row.rate_currency || "USD" },
    distanceMiles: row.distance_miles == null ? null : Number(row.distance_miles),
    deadheadMiles: row.deadhead_miles == null ? null : Number(row.deadhead_miles),
    weightLbs: row.weight_lbs == null ? null : Number(row.weight_lbs),
    lengthFeet: row.length_feet == null ? null : Number(row.length_feet),
    vehicleCount: row.vehicle_count == null ? null : Number(row.vehicle_count),
    operable: row.operable == null ? null : Boolean(row.operable),
    enclosed: row.enclosed == null ? null : Boolean(row.enclosed),
    paymentTerms: row.payment_terms || null,
    ratePerMile: row.rate_per_mile == null ? null : Number(row.rate_per_mile),
    score: row.source_quality_score == null ? null : Number(row.source_quality_score),
    duplicateCount: carrierCandidate ? Math.max(1, Number(row.duplicate_count || 1)) : 1,
    reviewFlags: carrierCandidate ? (() => { try { const value = JSON.parse(String(row.risk_flags || "[]")); return Array.isArray(value) ? value.map(String).slice(0, 8) : []; } catch { return []; } })() : [],
    providerUrl: row.provider_url || null,
    observedAt: row.observed_at,
    expiresAt: row.expires_at,
  }));

  return jsonResponse(200, {
    success: true,
    audience: carrierCandidate ? "carrier_candidate" : "public",
    load_board_access: carrierCandidate,
    company_registration_unlocks_access: true,
    carrier_verification_required_for_contact: true,
    contact_details_exposed: false,
    count: records.length,
    records,
  }, {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  });
}
