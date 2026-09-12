import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";
import {
  buildOpportunityDedupeKey,
  deriveRatePerMile,
  finiteInteger,
  finiteNumber,
  normalizeEquipment,
  parseLocation,
  scoreOpportunity,
} from "../_lib/load-board-opportunity.mjs";
import {
  canCompanyPost,
  cleanMarketText,
  ensureLoadBoardMarketPostSchema,
  getOwnedHermesCompany,
  publicPostPermissions,
  sameOriginMutation,
  specialistHasInternalOwnerCapability,
} from "../_lib/load-board-market-posts.mjs";

type Env = { DB?: any };
type PostType = "load" | "capacity";

const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const POST_TYPES = new Set<PostType>(["load", "capacity"]);

function stateCode(value: unknown, fallback: string | null) {
  const normalized = cleanMarketText(value, 2).toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : fallback;
}

function boolValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || String(value).toLowerCase() === "true") return true;
  if (value === 0 || value === "0" || String(value).toLowerCase() === "false") return false;
  return null;
}

function marketPostRow(row: any) {
  return {
    id: row.post_id,
    record_id: row.record_id,
    type: row.post_type,
    status: row.post_status,
    origin: row.origin,
    destination: row.destination || null,
    equipment: row.equipment,
    pickup_window: row.pickup_window || null,
    availability: row.availability_text || null,
    rate_amount: row.rate_amount == null ? null : Number(row.rate_amount),
    rate_currency: row.rate_currency || "USD",
    distance_miles: row.distance_miles == null ? null : Number(row.distance_miles),
    deadhead_miles: row.deadhead_miles == null ? null : Number(row.deadhead_miles),
    rate_per_mile: row.rate_per_mile == null ? null : Number(row.rate_per_mile),
    vehicle_count: row.vehicle_count == null ? null : Number(row.vehicle_count),
    payment_terms: row.payment_terms || null,
    visibility: row.visibility,
    expires_at: row.expires_at,
    created_at: row.post_created_at,
    updated_at: row.post_updated_at,
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, privateHeaders);

  await ensureLoadBoardSchema(env.DB);
  await ensureLoadBoardMarketPostSchema(env.DB);
  const company = await getOwnedHermesCompany(env.DB, specialist.id);
  if (!company || Number(company.load_board_access) !== 1) {
    return jsonResponse(403, { success: false, error: "registered_company_required" }, privateHeaders);
  }
  const ownerFullMarketplaceAccess = await specialistHasInternalOwnerCapability(env.DB, specialist.id);

  const now = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE hermes_load_market_posts
    SET status = 'expired', updated_at = ?
    WHERE company_id = ? AND status = 'active' AND record_id IN (
      SELECT id FROM hermes_load_records WHERE expires_at <= ? OR status = 'expired'
    )
  `).bind(now, company.id, now).run();

  const result = await env.DB.prepare(`
    SELECT
      p.id AS post_id, p.record_id, p.post_type, p.status AS post_status,
      p.created_at AS post_created_at, p.updated_at AS post_updated_at,
      r.origin, r.destination, r.equipment, r.pickup_window, r.availability_text,
      r.rate_amount, r.rate_currency, r.distance_miles, r.deadhead_miles,
      r.rate_per_mile, r.vehicle_count, r.payment_terms, r.visibility, r.expires_at
    FROM hermes_load_market_posts p
    JOIN hermes_load_records r ON r.id = p.record_id
    WHERE p.company_id = ?
    ORDER BY p.updated_at DESC
    LIMIT 200
  `).bind(company.id).all();

  return jsonResponse(200, {
    success: true,
    company: {
      id: company.id,
      name: company.company_name,
      catalog_status: company.catalog_status,
      ...publicPostPermissions(company.company_type, ownerFullMarketplaceAccess),
    },
    posts: (result?.results || []).map(marketPostRow),
  }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, privateHeaders);
  await ensureLoadBoardSchema(env.DB);
  await ensureLoadBoardMarketPostSchema(env.DB);

  const company = await getOwnedHermesCompany(env.DB, specialist.id);
  if (!company || Number(company.load_board_access) !== 1) {
    return jsonResponse(403, { success: false, error: "registered_company_required" }, privateHeaders);
  }
  const ownerFullMarketplaceAccess = await specialistHasInternalOwnerCapability(env.DB, specialist.id);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders); }

  const postType = cleanMarketText(body.type, 20) as PostType;
  if (!POST_TYPES.has(postType)) return jsonResponse(400, { success: false, error: "post_type_invalid" }, privateHeaders);
  if (!canCompanyPost(company.company_type, postType, ownerFullMarketplaceAccess)) {
    return jsonResponse(403, {
      success: false,
      error: postType === "load" ? "company_cannot_post_loads" : "company_cannot_post_trucks",
      permissions: publicPostPermissions(company.company_type, ownerFullMarketplaceAccess),
    }, privateHeaders);
  }
  if (body.rights_attested !== true) {
    return jsonResponse(400, { success: false, error: "posting_rights_attestation_required" }, privateHeaders);
  }

  const origin = cleanMarketText(body.origin, 180);
  const destination = cleanMarketText(body.destination, 180);
  if (!origin) return jsonResponse(400, { success: false, error: "origin_required" }, privateHeaders);
  if (postType === "load" && !destination) return jsonResponse(400, { success: false, error: "destination_required" }, privateHeaders);

  const equipment = normalizeEquipment(body.equipment || "other");
  const pickupWindow = cleanMarketText(body.pickup_window || body.available_from, 160) || null;
  const offeredRate = finiteNumber(body.rate_amount, { min: 0, max: 1000000 });
  const distanceMiles = finiteNumber(body.distance_miles, { min: 0, max: 100000 });
  const deadheadMiles = finiteNumber(body.deadhead_miles, { min: 0, max: 5000 });
  const vehicleCount = finiteInteger(body.vehicle_count, { min: 1, max: 100 }) ?? 1;
  const weightLbs = postType === "load" ? finiteNumber(body.weight_lbs, { min: 0, max: 500000 }) : null;
  const lengthFeet = postType === "load" ? finiteNumber(body.length_feet, { min: 0, max: 200 }) : null;
  const loadType = postType === "load" ? cleanMarketText(body.load_type, 30) : "";
  const notes = cleanMarketText(body.notes, 360);
  const paymentTerms = postType === "load" ? (cleanMarketText(body.payment_terms, 120) || null) : null;
  const ttlHours = Math.max(1, Math.min(168, finiteInteger(body.expires_in_hours, { min: 1, max: 168 }) ?? (postType === "load" ? 24 : 48)));
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  const postId = `hmp_${crypto.randomUUID()}`;
  const recordId = `hlr_${crypto.randomUUID()}`;
  const sourceId = `company_${String(company.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 120)}`;
  const originParts = parseLocation(origin);
  const destinationParts = destination ? parseLocation(destination) : { city: null, state: null, zip: null };
  const originState = stateCode(body.origin_state, originParts.state);
  const destinationState = stateCode(body.destination_state, destinationParts.state);
  const ratePerMile = deriveRatePerMile(offeredRate, distanceMiles, body.rate_per_mile);
  const availabilityPieces = [
    loadType ? loadType.replaceAll("_", " ") : "",
    weightLbs ? `${Math.round(weightLbs).toLocaleString("en-US")} lb` : "",
    lengthFeet ? `${lengthFeet} ft` : "",
    notes,
  ].filter(Boolean);
  const availabilityText = availabilityPieces.join(" · ").slice(0, 240) || null;
  const dedupeKey = buildOpportunityDedupeKey({
    origin,
    destination,
    origin_state: originState,
    destination_state: destinationState,
    pickup_window: pickupWindow,
    equipment,
    rate_amount: offeredRate,
    vehicle_count: vehicleCount,
  });
  const duplicate = await env.DB.prepare(`
    SELECT p.id, p.record_id
    FROM hermes_load_market_posts p
    JOIN hermes_load_records r ON r.id = p.record_id
    WHERE p.company_id = ? AND p.post_type = ? AND p.status = 'active'
      AND r.status = 'active' AND r.expires_at > ? AND r.dedupe_key = ?
    LIMIT 1
  `).bind(company.id, postType, now, dedupeKey).first();
  if (duplicate) {
    return jsonResponse(409, {
      success: false,
      error: "duplicate_active_post",
      existing_post_id: duplicate.id,
      existing_record_id: duplicate.record_id,
    }, privateHeaders);
  }

  const scoring = scoreOpportunity({
    provider_record_id: postId,
    origin,
    destination,
    origin_state: originState,
    destination_state: destinationState,
    pickup_window: pickupWindow,
    equipment,
    rate_amount: offeredRate,
    distance_miles: distanceMiles,
    deadhead_miles: deadheadMiles,
    rate_per_mile: ratePerMile,
    vehicle_count: vehicleCount,
    observed_at: now,
  });

  await env.DB.prepare(`
    INSERT INTO hermes_load_sources (
      id, provider, source_name, source_type, read_enabled, send_enabled, ingest_enabled,
      car_hauling_ingest_allowed, car_hauling_outreach_hold,
      redistribution_permission, contact_reveal_permission,
      last_successful_sync, status, created_at, updated_at
    ) VALUES (?, 'hermes_connect', ?, 'manual', 1, 0, 1, 1, 1, 'carrier_only', 'hidden', ?, 'active', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      source_name = excluded.source_name,
      last_successful_sync = excluded.last_successful_sync,
      status = 'active',
      updated_at = excluded.updated_at
  `).bind(sourceId, company.company_name, now, now, now).run();

  await env.DB.prepare(`
    INSERT INTO hermes_load_records (
      id, source_id, source_message_id, fingerprint, record_type, source_name,
      equipment, origin, destination, pickup_window, availability_text, team,
      rate_amount, rate_currency, received_at, observed_at, last_seen_at,
      expires_at, status, visibility, raw_evidence_ref,
      provider_record_id, origin_city, origin_state, origin_zip,
      destination_city, destination_state, destination_zip,
      distance_miles, deadhead_miles, vehicle_count, operable, enclosed,
      payment_terms, rate_per_mile, source_quality_score, dedupe_key, provider_url,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'carrier_only', NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
  `).bind(
    recordId, sourceId, postId, postId, postType, company.company_name,
    equipment, origin, destination || null, pickupWindow, availabilityText,
    body.team === true ? 1 : 0,
    offeredRate, offeredRate == null ? null : "USD",
    now, now, now, expiresAt,
    postId,
    originParts.city, originState, originParts.zip,
    destinationParts.city, destinationState, destinationParts.zip,
    distanceMiles, deadheadMiles, vehicleCount,
    boolValue(body.operable) == null ? null : (boolValue(body.operable) ? 1 : 0),
    boolValue(body.enclosed) == null ? null : (boolValue(body.enclosed) ? 1 : 0),
    paymentTerms, ratePerMile, scoring.score, dedupeKey,
    now, now,
  ).run();

  await env.DB.prepare(`
    INSERT INTO hermes_load_market_posts (
      id, record_id, company_id, specialist_id, post_type, status,
      rights_attested, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'active', 1, ?, ?)
  `).bind(postId, recordId, company.id, specialist.id, postType, now, now).run();

  return jsonResponse(201, {
    success: true,
    post: {
      id: postId,
      record_id: recordId,
      type: postType,
      status: "active",
      visibility: "carrier_only",
      expires_at: expiresAt,
      contact_details_exposed: false,
      booking_created: false,
      provider_write_performed: false,
      trust_state: company.catalog_status === "verified_public" ? "verified_company" : "registered_company_self_posted",
    },
  }, privateHeaders);
}
