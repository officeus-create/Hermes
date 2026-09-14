import { ensureLoadBoardSchema } from "./load-board-schema.mjs";

export const DAT_SEARCH_LIMITS = Object.freeze({
  searches_per_user_hour: 60,
  searches_per_user_month: 1000,
  posts_per_user_month: 250,
});

const EQUIPMENT = new Set([
  "car_hauler", "dry_van", "reefer", "flatbed", "step_deck", "hotshot", "power_only", "box_truck", "other",
]);

function text(value, max = 240) {
  return String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max);
}

function finite(value, min, max) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function validIso(value) {
  const raw = text(value, 64);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizeDatSearchIntent(input = {}) {
  const resource = String(input.resource || input.type || "loads").trim().toLowerCase() === "trucks" ? "trucks" : "loads";
  const requestedLimit = Math.trunc(finite(input.limit ?? input.requested_limit ?? 25, 1, 100) ?? 25);
  const equipmentRaw = text(input.equipment, 40).toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  const equipment = equipmentRaw && EQUIPMENT.has(equipmentRaw) ? equipmentRaw : null;
  const radiusMiles = finite(input.radius_miles ?? input.radiusMiles, 0, 1000);
  const cursor = text(input.cursor, 500) || null;

  return Object.freeze({
    resource,
    origin: text(input.origin, 180) || null,
    destination: text(input.destination, 180) || null,
    equipment,
    radius_miles: radiusMiles,
    pickup_from: validIso(input.pickup_from ?? input.pickupFrom),
    pickup_to: validIso(input.pickup_to ?? input.pickupTo),
    cursor,
    requested_limit: requestedLimit,
    purpose: "user_freight_matching",
    analytics_or_bulk_retrieval: false,
  });
}

export function evaluateDatSearchBudget({ hourlySearches = 0, monthlySearches = 0, requestedSearches = 1 } = {}) {
  const hourly = Math.max(0, Math.trunc(Number(hourlySearches) || 0));
  const monthly = Math.max(0, Math.trunc(Number(monthlySearches) || 0));
  const requested = Math.max(1, Math.trunc(Number(requestedSearches) || 1));
  const hourlyRemaining = Math.max(0, DAT_SEARCH_LIMITS.searches_per_user_hour - hourly);
  const monthlyRemaining = Math.max(0, DAT_SEARCH_LIMITS.searches_per_user_month - monthly);
  const allowed = requested <= hourlyRemaining && requested <= monthlyRemaining;
  return Object.freeze({
    allowed,
    requested_searches: requested,
    hourly_remaining: hourlyRemaining,
    monthly_remaining: monthlyRemaining,
    limit_source: "DAT Product and Delivery Schedule",
  });
}

export function normalizeDatMappedOpportunity(mapped = {}, options = {}) {
  const providerRecordId = text(mapped.provider_record_id ?? mapped.providerRecordId, 220);
  const origin = text(mapped.origin, 180);
  const destination = text(mapped.destination, 180);
  const observedAt = validIso(mapped.observed_at ?? mapped.observedAt);
  const explicitExpiresAt = validIso(mapped.expires_at ?? mapped.expiresAt);
  const approvedTtlMinutes = finite(options.approved_ttl_minutes ?? options.approvedTtlMinutes, 1, 24 * 60);
  const equipmentRaw = text(mapped.equipment || "other", 40).toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  const equipment = EQUIPMENT.has(equipmentRaw) ? equipmentRaw : "other";

  if (!providerRecordId) return { ok: false, reason: "dat_provider_record_id_required" };
  if (!origin) return { ok: false, reason: "dat_origin_required" };
  if (!destination) return { ok: false, reason: "dat_destination_required" };
  if (!observedAt) return { ok: false, reason: "dat_observed_at_required" };

  let expiresAt = explicitExpiresAt;
  if (!expiresAt && approvedTtlMinutes !== null) {
    expiresAt = new Date(new Date(observedAt).getTime() + approvedTtlMinutes * 60 * 1000).toISOString();
  }
  if (!expiresAt) return { ok: false, reason: "dat_freshness_mapping_required" };
  if (new Date(expiresAt).getTime() <= new Date(observedAt).getTime()) {
    return { ok: false, reason: "dat_expiry_must_follow_observation" };
  }

  const publicApproved = options.public_display_approved === true || options.publicDisplayApproved === true;
  const sourceVersion = text(mapped.source_version ?? mapped.sourceVersion, 80) || observedAt;
  const rateAmount = finite(mapped.rate_amount ?? mapped.rateAmount, 0, 10000000);
  const distanceMiles = finite(mapped.distance_miles ?? mapped.distanceMiles, 0, 100000);
  const deadheadMiles = finite(mapped.deadhead_miles ?? mapped.deadheadMiles, 0, 5000);
  const weightLbs = finite(mapped.weight_lbs ?? mapped.weightLbs, 0, 500000);
  const lengthFeet = finite(mapped.length_feet ?? mapped.lengthFeet, 0, 200);

  return {
    ok: true,
    record: {
      source_message_id: providerRecordId,
      fingerprint: `dat:${providerRecordId}:${sourceVersion}`.slice(0, 220),
      record_type: String(mapped.record_type || "load").toLowerCase() === "capacity" ? "capacity" : "load",
      provider_record_id: providerRecordId,
      equipment,
      origin,
      destination,
      pickup_window: text(mapped.pickup_window ?? mapped.pickupWindow, 160) || null,
      delivery_window: text(mapped.delivery_window ?? mapped.deliveryWindow, 160) || null,
      availability_text: text(mapped.availability_text ?? mapped.availabilityText, 240) || null,
      rate_amount: rateAmount,
      rate_currency: rateAmount === null ? null : (text(mapped.rate_currency ?? mapped.rateCurrency ?? "USD", 8) || "USD"),
      distance_miles: distanceMiles,
      deadhead_miles: deadheadMiles,
      weight_lbs: weightLbs,
      length_feet: lengthFeet,
      payment_terms: text(mapped.payment_terms ?? mapped.paymentTerms, 120) || null,
      received_at: validIso(mapped.received_at ?? mapped.receivedAt) || observedAt,
      observed_at: observedAt,
      expires_at: expiresAt,
      visibility: publicApproved ? "public" : "carrier_only",
      raw_evidence_ref: `dat:${providerRecordId}`,
    },
  };
}

export function shouldFailClosedDatInventory(error) {
  return new Set([
    "dat_partnership_not_approved",
    "dat_data_rights_not_approved",
    "dat_certification_required",
    "dat_credentials_not_configured",
    "dat_api_contract_not_configured",
  ]).has(String(error || ""));
}

export async function expireDatInventory(db, reason = "dat_access_revoked_or_unavailable") {
  if (!db) return { sources_disabled: false, records_expired: false };
  await ensureLoadBoardSchema(db);
  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE hermes_load_sources
    SET status = 'disabled', read_enabled = 0, ingest_enabled = 0, last_error = ?, updated_at = ?
    WHERE provider = 'dat'
  `).bind(text(reason, 160), now).run();
  await db.prepare(`
    UPDATE hermes_load_records
    SET status = 'expired', expires_at = ?, updated_at = ?
    WHERE status = 'active'
      AND source_id IN (SELECT id FROM hermes_load_sources WHERE provider = 'dat')
  `).bind(now, now).run();
  return { sources_disabled: true, records_expired: true, at: now };
}
