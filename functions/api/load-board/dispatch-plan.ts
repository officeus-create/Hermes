import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";
import { specialistHasLoadBoardAccess } from "../_lib/hermes-company-profiles.mjs";
import { finiteNumber, normalizeEquipment, scoreOpportunity } from "../_lib/load-board-opportunity.mjs";

type Env = { DB?: any };

function stateCode(value: string | null) {
  const normalized = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
}

function legCount(value: string | null) {
  const parsed = Number.parseInt(String(value || "2"), 10);
  return Math.max(1, Math.min(3, Number.isFinite(parsed) ? parsed : 2));
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  await ensureLoadBoardSchema(env.DB);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" });
  if (!(await specialistHasLoadBoardAccess(env.DB, specialist))) {
    return jsonResponse(403, { success: false, error: "dispatcher_or_carrier_role_required", next_url: "/services/hermes-connect/load-board/access/" });
  }

  const url = new URL(request.url);
  const equipment = normalizeEquipment(url.searchParams.get("equipment") || "car_hauler");
  const originState = stateCode(url.searchParams.get("origin_state"));
  const preferredDestinationState = stateCode(url.searchParams.get("destination_state"));
  const maxLegs = legCount(url.searchParams.get("max_legs"));
  const minRpm = finiteNumber(url.searchParams.get("min_rpm"), { min: 0, max: 1000 });
  const maxDeadhead = finiteNumber(url.searchParams.get("max_deadhead"), { min: 0, max: 5000 });

  const conditions = [
    "r.record_type = 'load'", "r.status = 'active'", "r.expires_at > ?", "r.visibility IN ('public', 'carrier_only')", "r.equipment = ?",
  ];
  const bindings: any[] = [new Date().toISOString(), equipment];
  if (minRpm !== null) { conditions.push("r.rate_per_mile >= ?"); bindings.push(minRpm); }
  if (maxDeadhead !== null) { conditions.push("(r.deadhead_miles IS NULL OR r.deadhead_miles <= ?)"); bindings.push(maxDeadhead); }

  const result = await env.DB.prepare(`
    SELECT
      r.id, r.source_name, s.provider, r.provider_record_id, r.provider_url,
      r.equipment, r.origin, r.origin_city, r.origin_state, r.destination,
      r.destination_city, r.destination_state, r.pickup_window, r.availability_text,
      r.rate_amount, r.rate_currency, r.distance_miles, r.deadhead_miles,
      r.vehicle_count, r.operable, r.enclosed, r.payment_terms, r.rate_per_mile,
      r.source_quality_score, r.dedupe_key, r.observed_at, r.expires_at
    FROM hermes_load_records r
    LEFT JOIN hermes_load_sources s ON s.id = r.source_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY COALESCE(r.source_quality_score, 0) DESC, r.observed_at DESC
    LIMIT 500
  `).bind(...bindings).all();

  const candidates = (result?.results || []).map((row: any) => {
    const scored = scoreOpportunity(row, { equipment, originState: originState || undefined, destinationState: preferredDestinationState || undefined });
    return {
      id: row.id, provider: row.provider || null, source: row.source_name, providerRecordId: row.provider_record_id || null,
      providerUrl: row.provider_url || null, equipment: row.equipment, origin: row.origin, originCity: row.origin_city || null,
      originState: row.origin_state || null, destination: row.destination || null, destinationCity: row.destination_city || null,
      destinationState: row.destination_state || null, pickupWindow: row.pickup_window || null, availability: row.availability_text || null,
      rateAmount: row.rate_amount == null ? null : Number(row.rate_amount), rateCurrency: row.rate_currency || "USD",
      distanceMiles: row.distance_miles == null ? null : Number(row.distance_miles), deadheadMiles: row.deadhead_miles == null ? null : Number(row.deadhead_miles),
      vehicleCount: row.vehicle_count == null ? null : Number(row.vehicle_count), operable: row.operable == null ? null : Boolean(row.operable),
      enclosed: row.enclosed == null ? null : Boolean(row.enclosed), paymentTerms: row.payment_terms || null,
      ratePerMile: scored.ratePerMile, score: scored.score, scoreReasons: scored.reasons, observedAt: row.observed_at, expiresAt: row.expires_at,
      dedupeKey: row.dedupe_key || row.id,
    };
  });

  const bestByDedupe = new Map<string, (typeof candidates)[number]>();
  for (const candidate of candidates) {
    const current = bestByDedupe.get(candidate.dedupeKey);
    if (!current || candidate.score > current.score || (candidate.score === current.score && String(candidate.observedAt) > String(current.observedAt))) bestByDedupe.set(candidate.dedupeKey, candidate);
  }
  const unique = [...bestByDedupe.values()];

  const plan: (typeof unique)[number][] = [];
  const used = new Set<string>();
  let currentState = originState;
  for (let leg = 0; leg < maxLegs; leg += 1) {
    const eligible = unique
      .filter((candidate) => !used.has(candidate.id))
      .filter((candidate) => !currentState || candidate.originState === currentState)
      .map((candidate) => ({ candidate, chainScore: candidate.score + (leg === 0 && preferredDestinationState && candidate.destinationState === preferredDestinationState ? 8 : 0) + (leg > 0 ? 5 : 0) }))
      .sort((a, b) => b.chainScore - a.chainScore || (b.candidate.ratePerMile ?? -1) - (a.candidate.ratePerMile ?? -1));
    const best = eligible[0]?.candidate;
    if (!best) break;
    plan.push(best);
    used.add(best.id);
    currentState = best.destinationState || "";
    if (!currentState) break;
  }

  const totals = plan.reduce((acc, leg) => {
    if (leg.rateAmount !== null) acc.rate += leg.rateAmount;
    if (leg.distanceMiles !== null) acc.loadedMiles += leg.distanceMiles;
    if (leg.deadheadMiles !== null) acc.deadheadMiles += leg.deadheadMiles;
    acc.score += leg.score;
    return acc;
  }, { rate: 0, loadedMiles: 0, deadheadMiles: 0, score: 0 });

  const alternatives = unique
    .filter((candidate) => !originState || candidate.originState === originState)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ dedupeKey: _dedupeKey, ...candidate }) => candidate);

  return jsonResponse(200, {
    success: true,
    planner_version: "hermes_chain_v1",
    planning_only: true,
    booking_performed: false,
    company_registration_unlocks_access: true,
    equipment,
    requested_origin_state: originState || null,
    preferred_destination_state: preferredDestinationState || null,
    max_legs: maxLegs,
    plan: plan.map(({ dedupeKey: _dedupeKey, ...candidate }) => candidate),
    totals: {
      projectedRate: Math.round(totals.rate * 100) / 100,
      loadedMiles: Math.round(totals.loadedMiles * 10) / 10,
      knownDeadheadMiles: Math.round(totals.deadheadMiles * 10) / 10,
      averageOpportunityScore: plan.length ? Math.round(totals.score / plan.length) : 0,
      projectedLoadedRpm: totals.loadedMiles > 0 ? Math.round((totals.rate / totals.loadedMiles) * 100) / 100 : null,
    },
    alternatives,
    caveat: "This plan prioritizes currently approved normalized opportunities. It is not a booking, rate confirmation, HOS decision, route guarantee, or substitute for dispatcher verification.",
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
