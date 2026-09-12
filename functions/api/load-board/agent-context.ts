import { jsonResponse } from "../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any; HERMES_AI_LOGISTICS_TOKEN?: string };
type Model = "opportunities" | "lanes" | "providers" | "health";

function limitValue(value: string | null) {
  const parsed = Number.parseInt(String(value || "100"), 10);
  return Math.max(1, Math.min(500, Number.isFinite(parsed) ? parsed : 100));
}

function sourceSetup(row: any) {
  const redistribution = String(row.redistribution_permission || "internal_only");
  const contactMode = String(row.contact_reveal_permission || "hidden");
  const sourceActive = String(row.status || "") === "active";
  const readEnabled = Boolean(row.read_enabled);
  const ingestEnabled = Boolean(row.ingest_enabled);
  const canIngest = sourceActive && readEnabled && ingestEnabled;

  return {
    setup_checklist: {
      identity_configured: Boolean(row.provider && row.source_name && row.source_type),
      connection_pointer_present: Boolean(row.connection_pointer_present),
      ingestion_enabled: canIngest,
      redistribution_rule_defined: ["internal_only", "carrier_only", "public"].includes(redistribution),
      contact_rule_defined: Boolean(contactMode),
      sync_proven: Boolean(row.last_successful_sync),
      error_free: !row.last_error,
    },
    action_rules: {
      ingest_internal: canIngest,
      configured_max_visibility: redistribution,
      carrier_distribution_configured: canIngest && ["carrier_only", "public"].includes(redistribution),
      public_distribution_configured: canIngest && redistribution === "public",
      contact_reveal_mode: contactMode,
      outbound_send: false,
    },
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const token = String(env.HERMES_AI_LOGISTICS_TOKEN || "");
  if (!token) return jsonResponse(503, { success: false, error: "ai_logistics_token_not_configured" });
  if (request.headers.get("Authorization") !== `Bearer ${token}`) return jsonResponse(401, { success: false, error: "unauthorized" });

  await ensureLoadBoardSchema(env.DB);
  const url = new URL(request.url);
  const requestedModel = String(url.searchParams.get("model") || "opportunities") as Model;
  const model: Model = ["opportunities", "lanes", "providers", "health"].includes(requestedModel) ? requestedModel : "opportunities";
  const limit = limitValue(url.searchParams.get("limit"));
  const now = new Date().toISOString();

  if (model === "providers") {
    const result = await env.DB.prepare(`
      SELECT
        s.provider,
        s.source_name,
        s.source_type,
        s.redistribution_permission,
        s.contact_reveal_permission,
        s.read_enabled,
        s.ingest_enabled,
        CASE WHEN s.credential_ref IS NOT NULL AND TRIM(s.credential_ref) <> '' THEN 1 ELSE 0 END AS connection_pointer_present,
        s.last_successful_sync,
        s.last_error,
        s.status,
        COUNT(r.id) AS active_records
      FROM hermes_load_sources s
      LEFT JOIN hermes_load_records r
        ON r.source_id = s.id AND r.status = 'active' AND r.expires_at > ?
      GROUP BY s.id
      ORDER BY s.provider ASC, s.source_name ASC
      LIMIT ?
    `).bind(now, limit).all();
    return jsonResponse(200, {
      success: true,
      model,
      generated_at: now,
      raw_credentials_exposed: false,
      data: (result?.results || []).map((row: any) => ({
        provider: row.provider,
        source_name: row.source_name,
        source_type: row.source_type,
        redistribution_permission: row.redistribution_permission,
        contact_reveal_permission: row.contact_reveal_permission,
        read_enabled: Boolean(row.read_enabled),
        ingest_enabled: Boolean(row.ingest_enabled),
        last_successful_sync: row.last_successful_sync || null,
        last_error: row.last_error || null,
        status: row.status,
        active_records: Number(row.active_records || 0),
        ...sourceSetup(row),
      })),
    }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
  }

  if (model === "health") {
    const summary = await env.DB.prepare(`
      SELECT
        (SELECT COUNT(*) FROM hermes_load_sources) AS source_count,
        (SELECT COUNT(*) FROM hermes_load_sources WHERE status = 'active' AND ingest_enabled = 1) AS active_sources,
        (SELECT COUNT(*) FROM hermes_load_sources WHERE last_error IS NOT NULL AND TRIM(last_error) <> '') AS sources_with_errors,
        (SELECT COUNT(*) FROM hermes_load_records) AS records_retained,
        (SELECT COUNT(*) FROM hermes_load_records WHERE record_type = 'load') AS load_records_retained,
        (SELECT COUNT(*) FROM hermes_load_records WHERE record_type = 'capacity') AS capacity_records_retained,
        (SELECT COUNT(*) FROM hermes_load_records WHERE record_type = 'load' AND status = 'active' AND expires_at > ?) AS active_loads,
        (SELECT COUNT(*) FROM hermes_load_records WHERE record_type = 'load' AND status = 'active' AND expires_at > ? AND visibility IN ('public', 'carrier_only')) AS carrier_visible_active_loads,
        (SELECT COUNT(*) FROM hermes_load_records WHERE record_type = 'capacity' AND status = 'active' AND expires_at > ?) AS active_capacity,
        (SELECT COUNT(*) FROM hermes_load_records WHERE status = 'expired' OR expires_at <= ?) AS expired_records,
        (SELECT COUNT(*) FROM hermes_load_records WHERE status = 'active' AND expires_at > ? AND visibility = 'internal_only') AS internal_only_active_records,
        (SELECT COUNT(*) FROM hermes_load_quarantine WHERE status = 'pending_review') AS quarantine_pending,
        (SELECT COUNT(DISTINCT COALESCE(NULLIF(dedupe_key, ''), id)) FROM hermes_load_records WHERE record_type = 'load') AS unique_load_opportunities,
        (SELECT COUNT(*) - COUNT(DISTINCT COALESCE(NULLIF(dedupe_key, ''), id)) FROM hermes_load_records WHERE record_type = 'load') AS duplicate_candidates,
        (SELECT MAX(observed_at) FROM hermes_load_records) AS freshest_observed_at
    `).bind(now, now, now, now, now).first();

    const sources = await env.DB.prepare(`
      SELECT
        s.provider,
        s.source_name,
        s.source_type,
        s.redistribution_permission,
        s.contact_reveal_permission,
        s.read_enabled,
        s.ingest_enabled,
        CASE WHEN s.credential_ref IS NOT NULL AND TRIM(s.credential_ref) <> '' THEN 1 ELSE 0 END AS connection_pointer_present,
        s.status,
        s.last_successful_sync,
        s.last_error,
        (SELECT COUNT(*) FROM hermes_load_records r WHERE r.source_id = s.id) AS records_retained,
        (SELECT COUNT(*) FROM hermes_load_records r WHERE r.source_id = s.id AND r.record_type = 'load' AND r.status = 'active' AND r.expires_at > ?) AS active_loads,
        (SELECT COUNT(*) FROM hermes_load_records r WHERE r.source_id = s.id AND r.record_type = 'capacity' AND r.status = 'active' AND r.expires_at > ?) AS active_capacity,
        (SELECT COUNT(*) FROM hermes_load_records r WHERE r.source_id = s.id AND (r.status = 'expired' OR r.expires_at <= ?)) AS expired_records,
        (SELECT COUNT(*) FROM hermes_load_quarantine q WHERE q.source_id = s.id AND q.status = 'pending_review') AS quarantine_pending,
        (SELECT MAX(r.observed_at) FROM hermes_load_records r WHERE r.source_id = s.id) AS freshest_observed_at
      FROM hermes_load_sources s
      ORDER BY
        CASE WHEN s.last_error IS NOT NULL AND TRIM(s.last_error) <> '' THEN 0 ELSE 1 END,
        s.provider ASC,
        s.source_name ASC
      LIMIT ?
    `).bind(now, now, now, limit).all();

    const quarantineReasons = await env.DB.prepare(`
      SELECT reason, COUNT(*) AS record_count, MAX(observed_at) AS latest_observed_at
      FROM hermes_load_quarantine
      WHERE status = 'pending_review'
      GROUP BY reason
      ORDER BY record_count DESC, latest_observed_at DESC
      LIMIT 25
    `).all();

    const numberValue = (value: unknown) => Number(value || 0);
    return jsonResponse(200, {
      success: true,
      model,
      generated_at: now,
      data_classification: "internal-logistics-health",
      raw_credentials_exposed: false,
      contact_details_exposed: false,
      raw_evidence_exposed: false,
      summary: {
        source_count: numberValue(summary?.source_count),
        active_sources: numberValue(summary?.active_sources),
        sources_with_errors: numberValue(summary?.sources_with_errors),
        records_retained: numberValue(summary?.records_retained),
        load_records_retained: numberValue(summary?.load_records_retained),
        capacity_records_retained: numberValue(summary?.capacity_records_retained),
        active_loads: numberValue(summary?.active_loads),
        carrier_visible_active_loads: numberValue(summary?.carrier_visible_active_loads),
        active_capacity: numberValue(summary?.active_capacity),
        expired_records: numberValue(summary?.expired_records),
        internal_only_active_records: numberValue(summary?.internal_only_active_records),
        quarantine_pending: numberValue(summary?.quarantine_pending),
        unique_load_opportunities: numberValue(summary?.unique_load_opportunities),
        duplicate_candidates: numberValue(summary?.duplicate_candidates),
        freshest_observed_at: summary?.freshest_observed_at || null,
      },
      definitions: {
        records_retained: "Current normalized D1 records retained from authorized intake. This is not a raw email/message count.",
        unique_load_opportunities: "Distinct normalized load opportunities using dedupe_key when available.",
        duplicate_candidates: "Additional retained load records sharing a dedupe_key. This is a review signal, not a claim that source messages were automatically deleted.",
        quarantine_pending: "Items retained for review and excluded from actionable Load Board inventory.",
      },
      sources: (sources?.results || []).map((row: any) => ({
        provider: row.provider,
        source_name: row.source_name,
        source_type: row.source_type,
        redistribution_permission: row.redistribution_permission,
        contact_reveal_permission: row.contact_reveal_permission,
        read_enabled: Boolean(row.read_enabled),
        ingest_enabled: Boolean(row.ingest_enabled),
        status: row.status,
        last_successful_sync: row.last_successful_sync || null,
        last_error: row.last_error || null,
        records_retained: numberValue(row.records_retained),
        active_loads: numberValue(row.active_loads),
        active_capacity: numberValue(row.active_capacity),
        expired_records: numberValue(row.expired_records),
        quarantine_pending: numberValue(row.quarantine_pending),
        freshest_observed_at: row.freshest_observed_at || null,
        ...sourceSetup(row),
      })),
      quarantine_reasons: (quarantineReasons?.results || []).map((row: any) => ({
        reason: row.reason,
        record_count: numberValue(row.record_count),
        latest_observed_at: row.latest_observed_at || null,
      })),
    }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
  }

  if (model === "lanes") {
    const result = await env.DB.prepare(`
      SELECT
        origin_state,
        destination_state,
        equipment,
        COUNT(*) AS active_loads,
        AVG(rate_amount) AS avg_rate,
        AVG(rate_per_mile) AS avg_rpm,
        AVG(deadhead_miles) AS avg_known_deadhead,
        MAX(observed_at) AS freshest_observed_at
      FROM hermes_load_records
      WHERE record_type = 'load'
        AND status = 'active'
        AND expires_at > ?
        AND origin_state IS NOT NULL
        AND destination_state IS NOT NULL
      GROUP BY origin_state, destination_state, equipment
      ORDER BY active_loads DESC, freshest_observed_at DESC
      LIMIT ?
    `).bind(now, limit).all();
    return jsonResponse(200, {
      success: true,
      model,
      generated_at: now,
      data: (result?.results || []).map((row: any) => ({
        id: `${row.origin_state}-${row.destination_state}-${row.equipment}`,
        origin_state: row.origin_state,
        destination_state: row.destination_state,
        equipment: row.equipment,
        active_loads: Number(row.active_loads || 0),
        avg_rate: row.avg_rate == null ? null : Math.round(Number(row.avg_rate) * 100) / 100,
        avg_rpm: row.avg_rpm == null ? null : Math.round(Number(row.avg_rpm) * 100) / 100,
        avg_known_deadhead: row.avg_known_deadhead == null ? null : Math.round(Number(row.avg_known_deadhead) * 10) / 10,
        freshest_observed_at: row.freshest_observed_at,
      })),
    }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
  }

  const result = await env.DB.prepare(`
    SELECT
      r.id, s.provider, r.provider_record_id, r.source_name, r.record_type,
      r.equipment, r.origin, r.origin_city, r.origin_state, r.origin_zip,
      r.destination, r.destination_city, r.destination_state, r.destination_zip,
      r.pickup_window, r.availability_text, r.rate_amount, r.rate_currency,
      r.distance_miles, r.deadhead_miles, r.vehicle_count, r.operable, r.enclosed,
      r.payment_terms, r.rate_per_mile, r.source_quality_score, r.observed_at, r.expires_at
    FROM hermes_load_records r
    LEFT JOIN hermes_load_sources s ON s.id = r.source_id
    WHERE r.record_type = 'load' AND r.status = 'active' AND r.expires_at > ?
    ORDER BY COALESCE(r.source_quality_score, 0) DESC, r.observed_at DESC
    LIMIT ?
  `).bind(now, limit).all();

  return jsonResponse(200, {
    success: true,
    model,
    generated_at: now,
    data_classification: "internal-logistics-context",
    contact_details_exposed: false,
    raw_evidence_exposed: false,
    data: (result?.results || []).map((row: any) => ({
      id: row.id,
      provider: row.provider || null,
      provider_record_id: row.provider_record_id || null,
      source_name: row.source_name,
      record_type: row.record_type,
      equipment: row.equipment,
      origin: row.origin,
      origin_city: row.origin_city || null,
      origin_state: row.origin_state || null,
      origin_zip: row.origin_zip || null,
      destination: row.destination || null,
      destination_city: row.destination_city || null,
      destination_state: row.destination_state || null,
      destination_zip: row.destination_zip || null,
      pickup_window: row.pickup_window || null,
      availability: row.availability_text || null,
      rate_amount: row.rate_amount == null ? null : Number(row.rate_amount),
      rate_currency: row.rate_currency || "USD",
      distance_miles: row.distance_miles == null ? null : Number(row.distance_miles),
      deadhead_miles: row.deadhead_miles == null ? null : Number(row.deadhead_miles),
      vehicle_count: row.vehicle_count == null ? null : Number(row.vehicle_count),
      operable: row.operable == null ? null : Boolean(row.operable),
      enclosed: row.enclosed == null ? null : Boolean(row.enclosed),
      payment_terms: row.payment_terms || null,
      rate_per_mile: row.rate_per_mile == null ? null : Number(row.rate_per_mile),
      opportunity_score: row.source_quality_score == null ? null : Number(row.source_quality_score),
      observed_at: row.observed_at,
      expires_at: row.expires_at,
      mode: "road",
      status: "available",
    })),
  }, { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" });
}
