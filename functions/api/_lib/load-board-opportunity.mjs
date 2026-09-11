const EQUIPMENT_ALIASES = new Map([
  ["car hauler", "car_hauler"],
  ["auto transport", "car_hauler"],
  ["open car carrier", "car_hauler"],
  ["enclosed car carrier", "car_hauler"],
  ["dry van", "dry_van"],
  ["van", "dry_van"],
  ["reefer", "reefer"],
  ["refrigerated", "reefer"],
  ["flatbed", "flatbed"],
  ["step deck", "step_deck"],
  ["stepdeck", "step_deck"],
  ["power only", "power_only"],
  ["hotshot", "hotshot"],
  ["box truck", "box_truck"],
  ["sprinter", "sprinter_van"],
]);

export function finiteNumber(value, { min = -Infinity, max = Infinity } = {}) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

export function finiteInteger(value, options = {}) {
  const parsed = finiteNumber(value, options);
  return parsed === null ? null : Math.trunc(parsed);
}

export function normalizeEquipment(value) {
  const raw = String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (!raw) return "other";
  if (EQUIPMENT_ALIASES.has(raw)) return EQUIPMENT_ALIASES.get(raw);
  if (raw.includes("enclosed") && raw.includes("car")) return "car_hauler";
  if (raw.includes("car") && (raw.includes("hauler") || raw.includes("transport"))) return "car_hauler";
  return raw.replaceAll(" ", "_").slice(0, 80);
}

export function parseLocation(value) {
  const raw = String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 180);
  if (!raw) return { label: "", city: null, state: null, zip: null };
  const zipMatch = raw.match(/\b(\d{5})(?:-\d{4})?\b/);
  const stateMatch = raw.match(/(?:,|\s)\s*([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?\s*$/i);
  const state = stateMatch ? stateMatch[1].toUpperCase() : null;
  const beforeState = stateMatch ? raw.slice(0, stateMatch.index).replace(/[,\s]+$/g, "").trim() : raw;
  const city = beforeState && !/^\d{5}(?:-\d{4})?$/.test(beforeState) ? beforeState.slice(0, 100) : null;
  return { label: raw, city, state, zip: zipMatch ? zipMatch[1] : null };
}

export function deriveRatePerMile(rateAmount, distanceMiles, explicitRatePerMile) {
  const explicit = finiteNumber(explicitRatePerMile, { min: 0, max: 1000 });
  if (explicit !== null) return Math.round(explicit * 100) / 100;
  const rate = finiteNumber(rateAmount, { min: 0, max: 1000000 });
  const miles = finiteNumber(distanceMiles, { min: 1, max: 100000 });
  if (rate === null || miles === null) return null;
  return Math.round((rate / miles) * 100) / 100;
}

export function buildOpportunityDedupeKey(record) {
  const origin = String(record.origin_state || record.origin || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const destination = String(record.destination_state || record.destination || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const pickup = String(record.pickup_window || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const equipment = normalizeEquipment(record.equipment);
  const rate = finiteNumber(record.rate_amount, { min: 0, max: 1000000 });
  const roundedRate = rate === null ? "na" : String(Math.round(rate / 25) * 25);
  const vehicles = finiteInteger(record.vehicle_count, { min: 0, max: 100 }) ?? 0;
  return [origin, destination, pickup, equipment, roundedRate, vehicles].join("|").slice(0, 320);
}

export function scoreOpportunity(record, context = {}) {
  let score = 35;
  const reasons = [];
  const rate = finiteNumber(record.rate_amount, { min: 0, max: 1000000 });
  const distance = finiteNumber(record.distance_miles, { min: 1, max: 100000 });
  const rpm = deriveRatePerMile(rate, distance, record.rate_per_mile);
  const deadhead = finiteNumber(
    context.deadheadMiles ?? record.deadhead_miles,
    { min: 0, max: 5000 },
  );

  if (rate !== null) { score += 8; reasons.push("rate_available"); }
  if (distance !== null) { score += 6; reasons.push("distance_available"); }
  if (record.origin_state && record.destination_state) { score += 5; reasons.push("lane_structured"); }
  if (record.provider_record_id) { score += 3; reasons.push("provider_id_present"); }
  if (finiteInteger(record.vehicle_count, { min: 1, max: 100 }) !== null) { score += 3; reasons.push("capacity_known"); }

  if (rpm !== null) {
    if (rpm >= 3) { score += 18; reasons.push("rpm_3_plus"); }
    else if (rpm >= 2.25) { score += 13; reasons.push("rpm_2_25_plus"); }
    else if (rpm >= 1.75) { score += 7; reasons.push("rpm_1_75_plus"); }
    else if (rpm < 1.25) { score -= 12; reasons.push("rpm_below_1_25"); }
  }

  if (deadhead !== null) {
    if (deadhead <= 25) { score += 14; reasons.push("deadhead_25_or_less"); }
    else if (deadhead <= 75) { score += 9; reasons.push("deadhead_75_or_less"); }
    else if (deadhead <= 150) { score += 4; reasons.push("deadhead_150_or_less"); }
    else if (deadhead > 250) { score -= 10; reasons.push("deadhead_over_250"); }
  }

  const observed = new Date(record.observed_at || record.observedAt || 0).getTime();
  if (Number.isFinite(observed) && observed > 0) {
    const ageMinutes = Math.max(0, (Date.now() - observed) / 60000);
    if (ageMinutes <= 30) { score += 10; reasons.push("fresh_30m"); }
    else if (ageMinutes <= 120) { score += 6; reasons.push("fresh_2h"); }
    else if (ageMinutes <= 360) { score += 2; reasons.push("fresh_6h"); }
    else if (ageMinutes > 1440) { score -= 8; reasons.push("older_than_24h"); }
  }

  const requestedEquipment = context.equipment ? normalizeEquipment(context.equipment) : null;
  if (requestedEquipment) {
    const actual = normalizeEquipment(record.equipment);
    if (actual === requestedEquipment) { score += 8; reasons.push("equipment_exact"); }
    else { score -= 15; reasons.push("equipment_mismatch"); }
  }

  const requestedOriginState = String(context.originState || "").trim().toUpperCase();
  if (requestedOriginState && String(record.origin_state || "").toUpperCase() === requestedOriginState) {
    score += 5;
    reasons.push("origin_state_match");
  }
  const requestedDestinationState = String(context.destinationState || "").trim().toUpperCase();
  if (requestedDestinationState && String(record.destination_state || "").toUpperCase() === requestedDestinationState) {
    score += 5;
    reasons.push("destination_state_match");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    ratePerMile: rpm,
    deadheadMiles: deadhead,
    reasons,
  };
}
