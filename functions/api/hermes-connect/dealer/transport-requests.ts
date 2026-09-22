import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../../_lib/hermes-company-profiles.mjs";
import { ensureLoadBoardSchema } from "../../_lib/load-board-schema.mjs";
import {
  buildOpportunityDedupeKey,
  deriveRatePerMile,
  parseLocation,
  scoreOpportunity,
} from "../../_lib/load-board-opportunity.mjs";
import {
  ensureLoadBoardMarketPostSchema,
  getOwnedHermesCompany,
  sameOriginMutation,
} from "../../_lib/load-board-market-posts.mjs";
import {
  cleanDealerText,
  ensureDealerTransportRequestSchema,
  normalizeMoney,
  normalizeReadyDate,
  normalizeVehicleYear,
  normalizeVin,
  serializeDealerTransportRequest,
} from "../../_lib/dealer-transport-requests.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env };
const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

async function ownedDealer(request: Request, env: Env) {
  if (!env.DB) return { error: jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: jsonResponse(401, { success: false, error: "authentication_required" }, privateHeaders) };

  await Promise.all([
    ensureHermesCompanyProfilesSchema(env.DB),
    ensureLoadBoardSchema(env.DB),
    ensureLoadBoardMarketPostSchema(env.DB),
    ensureDealerTransportRequestSchema(env.DB),
  ]);
  const company = await getOwnedHermesCompany(env.DB, specialist.id);
  if (!company || Number(company.load_board_access) !== 1) {
    return { error: jsonResponse(403, { success: false, error: "registered_company_required" }, privateHeaders) };
  }
  if (String(company.company_type) !== "dealer") {
    return { error: jsonResponse(403, { success: false, error: "dealer_company_required" }, privateHeaders) };
  }
  return { specialist, company };
}

function parseRequestBody(body: Record<string, unknown>) {
  const vin = normalizeVin(body.vin);
  const readyDate = normalizeReadyDate(body.ready_date);
  const vehicleYear = normalizeVehicleYear(body.vehicle_year);
  const vehicleYearProvided = body.vehicle_year !== null && body.vehicle_year !== undefined && body.vehicle_year !== "";
  const targetPrice = normalizeMoney(body.target_price);
  const targetPriceProvided = body.target_price !== null && body.target_price !== undefined && body.target_price !== "";

  const value = {
    vin,
    vehicle_year: vehicleYear,
    vehicle_make: cleanDealerText(body.vehicle_make, 80),
    vehicle_model: cleanDealerText(body.vehicle_model, 100),
    origin: cleanDealerText(body.origin, 180),
    destination: cleanDealerText(body.destination, 180),
    ready_date: readyDate,
    target_price: targetPrice,
    contact_phone: cleanDealerText(body.contact_phone, 40),
    special_notes: cleanDealerText(body.special_notes, 800),
  };
  const errors: string[] = [];
  if (vin === null) errors.push("vin_invalid");
  if (vehicleYearProvided && vehicleYear === null) errors.push("vehicle_year_invalid");
  if (readyDate === null) errors.push("ready_date_invalid");
  if (targetPriceProvided && targetPrice === null) errors.push("target_price_invalid");
  if (!value.origin) errors.push("origin_required");
  if (!value.destination) errors.push("destination_required");
  if (!value.vehicle_make && !value.vehicle_model && !value.vin) errors.push("vehicle_identity_required");
  return { value, errors };
}

function requestIdFromBody(body: Record<string, unknown>) {
  const source = cleanDealerText(body.source_record_id, 120).replace(/[^a-zA-Z0-9._:-]+/g, "-");
  return source || `crm-${crypto.randomUUID()}`;
}

function publicVehicleLabel(requestRow: any) {
  const label = [requestRow.vehicle_year, requestRow.vehicle_make, requestRow.vehicle_model]
    .filter(Boolean)
    .join(" ")
    .trim();
  return label || "Vehicle transport";
}

async function publishToLoadBoard(db: any, specialist: any, company: any, requestRow: any) {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const postId = requestRow.load_post_id || `hmp_${crypto.randomUUID()}`;
  const recordId = requestRow.load_record_id || `hlr_${crypto.randomUUID()}`;
  const sourceId = `company_${String(company.id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 120)}`;
  const origin = String(requestRow.origin);
  const destination = String(requestRow.destination);
  const originParts = parseLocation(origin);
  const destinationParts = parseLocation(destination);
  const rateAmount = requestRow.target_price == null ? null : Number(requestRow.target_price);
  const ratePerMile = deriveRatePerMile(rateAmount, null, null);
  const vehicleLabel = publicVehicleLabel(requestRow).slice(0, 180);
  const baseDedupe = buildOpportunityDedupeKey({
    origin,
    destination,
    origin_state: originParts.state,
    destination_state: destinationParts.state,
    pickup_window: requestRow.ready_date || null,
    equipment: "car_hauler",
    rate_amount: rateAmount,
    vehicle_count: 1,
  });
  const dedupeKey = `${baseDedupe}|dealer-request-${String(requestRow.source_record_id).slice(0, 96)}`.slice(0, 320);
  const scoring = scoreOpportunity({
    provider_record_id: postId,
    origin,
    destination,
    origin_state: originParts.state,
    destination_state: destinationParts.state,
    pickup_window: requestRow.ready_date || null,
    equipment: "car_hauler",
    rate_amount: rateAmount,
    rate_per_mile: ratePerMile,
    vehicle_count: 1,
    observed_at: now,
  });

  const duplicate = await db.prepare(`
    SELECT p.id, p.record_id
    FROM hermes_load_market_posts p
    JOIN hermes_load_records r ON r.id = p.record_id
    WHERE p.company_id = ? AND p.post_type = 'load' AND p.status = 'active'
      AND r.status = 'active' AND r.expires_at > ? AND r.dedupe_key = ?
      AND p.id <> ?
    LIMIT 1
  `).bind(company.id, now, dedupeKey, postId).first();
  if (duplicate) {
    const error = new Error("duplicate_active_post");
    (error as any).code = "duplicate_active_post";
    throw error;
  }

  await db.prepare(`
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

  if (requestRow.load_post_id && requestRow.load_record_id) {
    const ownedPost = await db.prepare(`
      SELECT id, record_id
      FROM hermes_load_market_posts
      WHERE id = ? AND company_id = ?
      LIMIT 1
    `).bind(postId, company.id).first();
    if (!ownedPost || String(ownedPost.record_id) !== String(recordId)) {
      const error = new Error("linked_load_post_not_found");
      (error as any).code = "linked_load_post_not_found";
      throw error;
    }

    await db.prepare(`
      UPDATE hermes_load_records
      SET source_id=?, source_message_id=?, fingerprint=?, record_type='load', source_name=?,
          equipment='car_hauler', origin=?, destination=?, pickup_window=?, delivery_window=NULL,
          availability_text=?, team=0, rate_amount=?, rate_currency=?,
          received_at=?, observed_at=?, last_seen_at=?, expires_at=?, status='active',
          visibility='carrier_only', raw_evidence_ref=NULL, provider_record_id=?,
          origin_city=?, origin_state=?, origin_zip=?, destination_city=?, destination_state=?, destination_zip=?,
          distance_miles=NULL, deadhead_miles=NULL, weight_lbs=NULL, length_feet=NULL, vehicle_count=1,
          operable=NULL, enclosed=NULL, payment_terms=NULL, rate_per_mile=?, source_quality_score=?,
          risk_flags=NULL, dedupe_key=?, provider_url=NULL, updated_at=?
      WHERE id=?
    `).bind(
      sourceId, postId, postId, company.company_name,
      origin, destination, requestRow.ready_date || null, vehicleLabel,
      rateAmount, rateAmount == null ? null : "USD",
      now, now, now, expiresAt, postId,
      originParts.city, originParts.state, originParts.zip,
      destinationParts.city, destinationParts.state, destinationParts.zip,
      ratePerMile, scoring.score, dedupeKey, now, recordId,
    ).run();
    await db.prepare(`
      UPDATE hermes_load_market_posts
      SET status='active', rights_attested=1, specialist_id=?, updated_at=?
      WHERE id=? AND company_id=?
    `).bind(specialist.id, now, postId, company.id).run();
  } else {
    await db.prepare(`
      INSERT INTO hermes_load_records (
        id, source_id, source_message_id, fingerprint, record_type, source_name,
        equipment, origin, destination, pickup_window, delivery_window, availability_text, team,
        rate_amount, rate_currency, received_at, observed_at, last_seen_at,
        expires_at, status, visibility, raw_evidence_ref,
        provider_record_id, origin_city, origin_state, origin_zip,
        destination_city, destination_state, destination_zip,
        distance_miles, deadhead_miles, weight_lbs, length_feet,
        vehicle_count, operable, enclosed, payment_terms, rate_per_mile,
        source_quality_score, risk_flags, dedupe_key, provider_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'load', ?, 'car_hauler', ?, ?, ?, NULL, ?, 0, ?, ?, ?, ?, ?, ?, 'active', 'carrier_only', NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, ?, ?, NULL, ?, NULL, ?, ?)
    `).bind(
      recordId, sourceId, postId, postId, company.company_name,
      origin, destination, requestRow.ready_date || null, vehicleLabel,
      rateAmount, rateAmount == null ? null : "USD",
      now, now, now, expiresAt, postId,
      originParts.city, originParts.state, originParts.zip,
      destinationParts.city, destinationParts.state, destinationParts.zip,
      ratePerMile, scoring.score, dedupeKey, now, now,
    ).run();

    await db.prepare(`
      INSERT INTO hermes_load_market_posts (
        id, record_id, company_id, specialist_id, post_type, status,
        rights_attested, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'load', 'active', 1, ?, ?)
    `).bind(postId, recordId, company.id, specialist.id, now, now).run();
  }

  return { postId, recordId, syncedAt: now, expiresAt };
}

async function saveRequest(db: any, specialist: any, company: any, sourceRecordId: string, input: any) {
  const existing = await db.prepare(`
    SELECT * FROM hermes_dealer_transport_requests
    WHERE company_id=? AND source_record_id=?
    LIMIT 1
  `).bind(company.id, sourceRecordId).first();
  const now = new Date().toISOString();
  const id = existing?.id || `hdtr_${crypto.randomUUID()}`;

  if (existing) {
    await db.prepare(`
      UPDATE hermes_dealer_transport_requests
      SET vin=?, vehicle_year=?, vehicle_make=?, vehicle_model=?, origin=?, destination=?,
          ready_date=?, target_price=?, contact_phone=?, special_notes=?, updated_at=?, last_error=NULL
      WHERE id=? AND company_id=?
    `).bind(
      input.vin || null, input.vehicle_year, input.vehicle_make || null, input.vehicle_model || null,
      input.origin, input.destination, input.ready_date || null, input.target_price,
      input.contact_phone || null, input.special_notes || null, now, id, company.id,
    ).run();
  } else {
    await db.prepare(`
      INSERT INTO hermes_dealer_transport_requests (
        id, company_id, specialist_id, source_record_id, vin, vehicle_year, vehicle_make, vehicle_model,
        origin, destination, ready_date, target_price, contact_phone, special_notes, status,
        load_post_id, load_record_id, approved_at, approved_by_specialist_id,
        last_sync_at, last_error, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL, NULL, NULL, NULL, NULL, NULL, ?, ?)
    `).bind(
      id, company.id, specialist.id, sourceRecordId, input.vin || null, input.vehicle_year,
      input.vehicle_make || null, input.vehicle_model || null, input.origin, input.destination,
      input.ready_date || null, input.target_price, input.contact_phone || null, input.special_notes || null,
      now, now,
    ).run();
  }
  return db.prepare("SELECT * FROM hermes_dealer_transport_requests WHERE id=? AND company_id=? LIMIT 1")
    .bind(id, company.id).first();
}

export async function onRequestGet({ request, env }: Context) {
  const context = await ownedDealer(request, env);
  if (context.error) return context.error;
  const result = await env.DB.prepare(`
    SELECT *
    FROM hermes_dealer_transport_requests
    WHERE company_id=?
    ORDER BY updated_at DESC
    LIMIT 250
  `).bind(context.company.id).all();
  return jsonResponse(200, {
    success: true,
    company: { id: context.company.id, name: context.company.company_name },
    requests: (result?.results || []).map(serializeDealerTransportRequest),
    privacy: {
      vin_private: true,
      contact_phone_private: true,
      special_notes_private: true,
      load_board_receives: ["vehicle label", "origin", "destination", "ready date", "approved target price"],
    },
  }, privateHeaders);
}

export async function onRequestPost({ request, env }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const context = await ownedDealer(request, env);
  if (context.error) return context.error;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders); }

  const action = cleanDealerText(body.action, 24).toLowerCase() || "save";
  if (!["save", "publish"].includes(action)) {
    return jsonResponse(400, { success: false, error: "action_invalid" }, privateHeaders);
  }
  const sourceRecordId = requestIdFromBody(body);
  const parsed = parseRequestBody(body);
  if (parsed.errors.length) return jsonResponse(400, { success: false, errors: parsed.errors }, privateHeaders);

  const before = await env.DB.prepare(`
    SELECT * FROM hermes_dealer_transport_requests
    WHERE company_id=? AND source_record_id=?
    LIMIT 1
  `).bind(context.company.id, sourceRecordId).first();
  if (before?.status === "published" && action === "save") {
    return jsonResponse(409, {
      success: false,
      error: "published_request_requires_publish_update",
      note: "Published transport changes must be re-approved so the same Load Board post is updated instead of drifting from CRM.",
    }, privateHeaders);
  }

  let row = await saveRequest(env.DB, context.specialist, context.company, sourceRecordId, parsed.value);
  if (action === "publish") {
    if (body.owner_approval !== true || body.rights_attested !== true) {
      return jsonResponse(400, { success: false, error: "owner_approval_and_posting_rights_required" }, privateHeaders);
    }
    try {
      const synced = await publishToLoadBoard(env.DB, context.specialist, context.company, row);
      await env.DB.prepare(`
        UPDATE hermes_dealer_transport_requests
        SET status='published', load_post_id=?, load_record_id=?, approved_at=?, approved_by_specialist_id=?,
            last_sync_at=?, last_error=NULL, updated_at=?
        WHERE id=? AND company_id=?
      `).bind(
        synced.postId, synced.recordId, synced.syncedAt, context.specialist.id,
        synced.syncedAt, synced.syncedAt, row.id, context.company.id,
      ).run();
    } catch (error: any) {
      const code = cleanDealerText(error?.code || error?.message || "load_board_sync_failed", 120);
      await env.DB.prepare(`
        UPDATE hermes_dealer_transport_requests
        SET status='sync_error', last_error=?, updated_at=?
        WHERE id=? AND company_id=?
      `).bind(code, new Date().toISOString(), row.id, context.company.id).run();
      return jsonResponse(409, { success: false, error: code, request_id: row.id }, privateHeaders);
    }
  }

  row = await env.DB.prepare("SELECT * FROM hermes_dealer_transport_requests WHERE id=? AND company_id=? LIMIT 1")
    .bind(row.id, context.company.id).first();
  return jsonResponse(action === "publish" ? 201 : 200, {
    success: true,
    request: serializeDealerTransportRequest(row),
    load_board_sync: action === "publish"
      ? {
          performed: row?.status === "published",
          post_id: row?.load_post_id || null,
          same_post_updated: Boolean(before?.load_post_id && row?.load_post_id === before.load_post_id),
          public_contact_exposed: false,
          public_vin_exposed: false,
          external_provider_write_performed: false,
        }
      : { performed: false },
  }, privateHeaders);
}

export async function onRequestDelete({ request, env }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const context = await ownedDealer(request, env);
  if (context.error) return context.error;
  const url = new URL(request.url);
  const id = cleanDealerText(url.searchParams.get("id"), 140);
  if (!id) return jsonResponse(400, { success: false, error: "request_id_required" }, privateHeaders);

  const row = await env.DB.prepare(`
    SELECT * FROM hermes_dealer_transport_requests
    WHERE id=? AND company_id=?
    LIMIT 1
  `).bind(id, context.company.id).first();
  if (!row) return jsonResponse(404, { success: false, error: "transport_request_not_found" }, privateHeaders);

  const now = new Date().toISOString();
  if (row.load_post_id && row.load_record_id) {
    await env.DB.prepare(`
      UPDATE hermes_load_market_posts
      SET status='archived', updated_at=?
      WHERE id=? AND company_id=?
    `).bind(now, row.load_post_id, context.company.id).run();
    await env.DB.prepare(`
      UPDATE hermes_load_records
      SET status='archived', updated_at=?
      WHERE id=?
    `).bind(now, row.load_record_id).run();
  }
  await env.DB.prepare(`
    UPDATE hermes_dealer_transport_requests
    SET status='cancelled', last_sync_at=?, last_error=NULL, updated_at=?
    WHERE id=? AND company_id=?
  `).bind(now, now, id, context.company.id).run();

  const updated = await env.DB.prepare("SELECT * FROM hermes_dealer_transport_requests WHERE id=? AND company_id=? LIMIT 1")
    .bind(id, context.company.id).first();
  return jsonResponse(200, {
    success: true,
    request: serializeDealerTransportRequest(updated),
    load_board_archived: Boolean(row.load_post_id),
  }, privateHeaders);
}
