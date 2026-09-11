import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";
import { specialistHasLoadBoardAccess } from "../_lib/hermes-company-profiles.mjs";
import { finiteNumber, normalizeEquipment, scoreOpportunity } from "../_lib/load-board-opportunity.mjs";

type Env = { DB?: any };

type SortMode = "score" | "rate" | "rpm" | "freshness" | "deadhead";

const ALLOWED_EQUIPMENT = new Set([
  "dry_van", "reefer", "flatbed", "step_deck", "power_only", "hotshot", "box_truck", "sprinter_van", "car_hauler", "other",
]);
const ALLOWED_PROVIDERS = new Set([
  "central_dispatch", "super_dispatch", "truckstop", "dat", "ship_cars", "direct_freight", "loadboard_123", "email", "manual", "sanitized_csv",
]);
const ALLOWED_SORT = new Set<SortMode>(["score", "rate", "rpm", "freshness", "deadhead"]);

function stateCode(value: string | null) {
  const normalized = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
}

function positiveLimit(value: string | null) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 50;
  return Math.min(parsed, 100);
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureLoadBoardSchema(env.DB);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  const carrierCandidate = await specialistHasLoadBoardAccess(env.DB, specialist);
  const url = new URL(request.url);
  const rawEquipment = String(url.searchParams.get("equipment") || "").trim();
  const equipment = rawEquipment ? normalizeEquipment(rawEquipment) : "";
  const originState = stateCode(url.searchParams.get("origin_state"));
  const destinationState = stateCode(url.searchParams.get("destination_state"));
  const rawProvider = String(url.searchParams.get("provider") || "").trim().toLowerCase();
  const provider = ALLOWED_PROVIDERS.has(rawProvider) ? rawProvider : "";
  const minRate = finiteNumber(url.searchParams.get("min_rate"), { min: 0, max: 1000000 });
  const minRpm = finiteNumber(url.searchParams.get("min_rpm"), { min: 0, max: 1000 });
  const maxDeadhead = finiteNumber(url.searchParams.get("max_deadhead"), { min: 0, max: 5000 });
  const limit = positiveLimit(url.searchParams.get("limit"));
  const requestedSort = String(url.searchParams.get("sort") || "score") as SortMode;
  const sort: SortMode = ALLOWED_SORT.has(requestedSort) ? requestedSort : "score";

  if (equipment && !ALLOWED_EQUIPMENT.has(equipment)) return jsonResponse(400, { success: false, error: "invalid_equipment" });
  if (rawProvider && !provider) return jsonResponse(400, { success: false, error: "invalid_provider" });

  const conditions = ["r.record_type = 'load'", "r.status = 'active'", "r.expires_at > ?"];
  const bindings: any[] = [new Date().toISOString()];
  if (carrierCandidate) conditions.push("r.visibility IN ('public', 'carrier_only')");
  else conditions.push("r.visibility = 'public'");
  if (equipment) { conditions.push("r.equipment = ?"); bindings.push(equipment); }
  if (originState) { conditions.push("r.origin_state = ?"); bindings.push(originState); }
  if (destinationState) { conditions.push("r.destination_state = ?"); bindings.push(destinationState); }
  if (provider) { conditions.push("s.provider = ?"); bindings.push(provider); }
  if (minRate !== null) { conditions.push("r.rate_amount >= ?"); bindings.push(minRate); }
  if (minRpm !== null) { conditions.push("r.rate_per_mile >= ?"); bindings.push(minRpm); }
  if (maxDeadhead !== null) { conditions.push("(r.deadhead_miles IS NULL OR r.deadhead_miles <= ?)"); bindings.push(maxDeadhead); }

  const result = await env.DB.prepare(`
    SELECT
      r.id, r.source_name, s.provider, r.provider_record_id, r.equipment, r.origin, r.origin_city, r.origin_state, r.origin_zip,
      r.destination, r.destination_city, r.destination_state, r.destination_zip, r.pickup_window, r.availability_text,
      r.rate_amount, r.rate_currency, r.distance_miles, r.deadhead_miles, r.vehicle_count, r.operable, r.enclosed,
      r.payment_terms, r.rate_per_mile, r.source_quality_score, r.dedupe_key, r.provider_url, r.observed_at, r.expires_at
    FROM hermes_load_records r
    LEFT JOIN hermes_load_sources s ON s.id = r.source_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY r.observed_at DESC
    LIMIT 500
  `).bind(...bindings).all();

  const context = { equipment: equipment || undefined, originState: originState || undefined, destinationState: destinationState || undefined };
  const normalized = (result?.results || []).map((row: any) => {
    const scored = scoreOpportunity(row, context);
    return {
      id: row.id, provider: row.provider || null, source: row.source_name, providerRecordId: row.provider_record_id || null,
      providerUrl: row.provider_url || null, equipment: row.equipment, origin: row.origin, originCity: row.origin_city || null,
      originState: row.origin_state || null, originZip: row.origin_zip || null, destination: row.destination || null,
      destinationCity: row.destination_city || null, destinationState: row.destination_state || null, destinationZip: row.destination_zip || null,
      pickupWindow: row.pickup_window || null, availability: row.availability_text || null,
      rateAmount: row.rate_amount == null ? null : Number(row.rate_amount), rateCurrency: row.rate_currency || "USD",
      distanceMiles: row.distance_miles == null ? null : Number(row.distance_miles), deadheadMiles: row.deadhead_miles == null ? null : Number(row.deadhead_miles),
      vehicleCount: row.vehicle_count == null ? null : Number(row.vehicle_count), operable: row.operable == null ? null : Boolean(row.operable),
      enclosed: row.enclosed == null ? null : Boolean(row.enclosed), paymentTerms: row.payment_terms || null,
      ratePerMile: scored.ratePerMile, score: scored.score, scoreReasons: scored.reasons, observedAt: row.observed_at, expiresAt: row.expires_at,
      dedupeKey: row.dedupe_key || row.id,
    };
  });

  const bestByDedupe = new Map<string, (typeof normalized)[number]>();
  for (const record of normalized) {
    const current = bestByDedupe.get(record.dedupeKey);
    if (!current || record.score > current.score || (record.score === current.score && String(record.observedAt) > String(current.observedAt))) {
      bestByDedupe.set(record.dedupeKey, record);
    }
  }

  const records = [...bestByDedupe.values()];
  records.sort((a, b) => {
    if (sort === "rate") return (b.rateAmount ?? -1) - (a.rateAmount ?? -1) || b.score - a.score;
    if (sort === "rpm") return (b.ratePerMile ?? -1) - (a.ratePerMile ?? -1) || b.score - a.score;
    if (sort === "freshness") return String(b.observedAt).localeCompare(String(a.observedAt)) || b.score - a.score;
    if (sort === "deadhead") return (a.deadheadMiles ?? Number.MAX_SAFE_INTEGER) - (b.deadheadMiles ?? Number.MAX_SAFE_INTEGER) || b.score - a.score;
    return b.score - a.score || (b.ratePerMile ?? -1) - (a.ratePerMile ?? -1);
  });

  const limited = records.slice(0, limit).map(({ dedupeKey: _dedupeKey, ...record }) => record);
  return jsonResponse(200, {
    success: true,
    audience: carrierCandidate ? "carrier_candidate" : "public",
    load_board_access: carrierCandidate,
    company_registration_unlocks_access: true,
    contact_details_exposed: false,
    deduplicated: true,
    score_version: "hermes_opportunity_v1",
    filters: { equipment: equipment || null, origin_state: originState || null, destination_state: destinationState || null, provider: provider || null, min_rate: minRate, min_rpm: minRpm, max_deadhead: maxDeadhead, sort, limit },
    count: limited.length,
    records: limited,
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
