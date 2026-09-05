import { jsonResponse } from "../_lib/session.mjs";
import { ensureLoadBoardSchema } from "../_lib/load-board-schema.mjs";

type Env = { DB?: any; HERMES_LOADBOARD_INGEST_TOKEN?: string };

type Visibility = "internal_only" | "carrier_only" | "public";
type RecordType = "load" | "capacity";

const VISIBILITY = new Set<Visibility>(["internal_only", "carrier_only", "public"]);
const RECORD_TYPES = new Set<RecordType>(["load", "capacity"]);
const REDISTRIBUTION = new Set(["internal_only", "carrier_only", "public"]);

function text(value: unknown, max = 240) {
  return String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, max);
}

function optionalText(value: unknown, max = 240) {
  const normalized = text(value, max);
  return normalized || null;
}

function boolInt(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value ? 1 : 0;
  return fallback ? 1 : 0;
}

function validIso(value: unknown, fallback?: string) {
  const normalized = text(value, 64);
  const date = normalized ? new Date(normalized) : fallback ? new Date(fallback) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function clampVisibility(requested: Visibility, permission: string): Visibility {
  if (permission === "public") return requested;
  if (permission === "carrier_only") return requested === "public" ? "carrier_only" : requested;
  return "internal_only";
}

async function stableId(prefix: string, sourceId: string, sourceMessageId: string, fingerprint: string) {
  const input = new TextEncoder().encode(`${sourceId}|${sourceMessageId}|${fingerprint}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  const hex = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex.slice(0, 40)}`;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" });
  const configuredToken = String(env.HERMES_LOADBOARD_INGEST_TOKEN || "");
  if (!configuredToken) return jsonResponse(503, { success: false, error: "ingest_secret_not_configured" });
  if (request.headers.get("Authorization") !== `Bearer ${configuredToken}`) {
    return jsonResponse(401, { success: false, error: "unauthorized" });
  }

  let payload: any;
  try { payload = await request.json(); } catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }

  const sourceId = text(payload?.source?.id, 160);
  const provider = text(payload?.source?.provider || "email", 40);
  const sourceName = text(payload?.source?.name, 160);
  const mailboxEmail = optionalText(payload?.source?.mailbox_email, 254);
  const credentialRef = optionalText(payload?.source?.credential_ref, 240);
  const redistributionPermission = REDISTRIBUTION.has(String(payload?.source?.redistribution_permission))
    ? String(payload.source.redistribution_permission)
    : "internal_only";
  const contactRevealPermission = text(payload?.source?.contact_reveal_permission || "hidden", 60) || "hidden";
  const records = Array.isArray(payload?.records) ? payload.records : [];
  const quarantine = Array.isArray(payload?.quarantine) ? payload.quarantine : [];

  if (!sourceId || !sourceName) return jsonResponse(400, { success: false, error: "source_required" });
  if (records.length + quarantine.length < 1 || records.length + quarantine.length > 250) {
    return jsonResponse(400, { success: false, error: "items_required" });
  }

  await ensureLoadBoardSchema(env.DB);
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO hermes_load_sources (
      id, provider, mailbox_email, source_name, source_type, credential_ref,
      history_cursor, watch_expires_at, read_enabled, send_enabled, ingest_enabled,
      car_hauling_ingest_allowed, car_hauling_outreach_hold,
      redistribution_permission, contact_reveal_permission,
      last_successful_sync, last_error, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'email', ?, ?, ?, ?, 0, ?, 1, 1, ?, ?, ?, NULL, 'active', ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      provider = excluded.provider,
      mailbox_email = excluded.mailbox_email,
      source_name = excluded.source_name,
      credential_ref = excluded.credential_ref,
      history_cursor = excluded.history_cursor,
      watch_expires_at = excluded.watch_expires_at,
      read_enabled = excluded.read_enabled,
      send_enabled = 0,
      ingest_enabled = excluded.ingest_enabled,
      car_hauling_ingest_allowed = 1,
      car_hauling_outreach_hold = 1,
      redistribution_permission = excluded.redistribution_permission,
      contact_reveal_permission = excluded.contact_reveal_permission,
      last_successful_sync = excluded.last_successful_sync,
      last_error = NULL,
      status = 'active',
      updated_at = excluded.updated_at
  `).bind(
    sourceId,
    provider,
    mailboxEmail,
    sourceName,
    credentialRef,
    optionalText(payload?.source?.history_cursor, 240),
    validIso(payload?.source?.watch_expires_at),
    boolInt(payload?.source?.read_enabled, true),
    boolInt(payload?.source?.ingest_enabled, true),
    redistributionPermission,
    contactRevealPermission,
    now,
    now,
    now,
  ).run();

  let accepted = 0;
  let quarantined = 0;
  const rejected: Array<{ kind: "record" | "quarantine"; index: number; reason: string }> = [];

  for (let index = 0; index < quarantine.length; index += 1) {
    const item = quarantine[index] || {};
    const sourceMessageId = text(item.source_message_id, 220);
    const fingerprint = text(item.fingerprint, 220);
    const reason = text(item.reason, 120);
    const receivedAt = validIso(item.received_at, now);
    const observedAt = validIso(item.observed_at, receivedAt || now);
    if (!sourceMessageId || !fingerprint || !reason || !receivedAt || !observedAt) {
      rejected.push({ kind: "quarantine", index, reason: "invalid_quarantine" });
      continue;
    }
    const id = await stableId("hlq", sourceId, sourceMessageId, fingerprint);
    await env.DB.prepare(`
      INSERT INTO hermes_load_quarantine (
        id, source_id, source_message_id, fingerprint, source_name, reason,
        subject, received_at, observed_at, raw_evidence_ref, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, ?)
      ON CONFLICT(source_id, source_message_id, fingerprint) DO UPDATE SET
        source_name = excluded.source_name,
        reason = excluded.reason,
        subject = excluded.subject,
        observed_at = excluded.observed_at,
        raw_evidence_ref = excluded.raw_evidence_ref,
        status = 'pending_review',
        updated_at = excluded.updated_at
    `).bind(
      id,
      sourceId,
      sourceMessageId,
      fingerprint,
      sourceName,
      reason,
      optionalText(item.subject, 200),
      receivedAt,
      observedAt,
      optionalText(item.raw_evidence_ref, 300),
      now,
      now,
    ).run();
    quarantined += 1;
  }

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index] || {};
    const sourceMessageId = text(record.source_message_id, 220);
    const fingerprint = text(record.fingerprint, 220);
    const recordType = text(record.record_type, 20) as RecordType;
    const equipment = text(record.equipment || "other", 80);
    const origin = text(record.origin, 160);
    const destination = optionalText(record.destination, 160);
    const receivedAt = validIso(record.received_at, now);
    const observedAt = validIso(record.observed_at, receivedAt || now);
    const expiresAt = validIso(record.expires_at);

    if (!sourceMessageId || !fingerprint || !RECORD_TYPES.has(recordType) || !origin || !receivedAt || !observedAt || !expiresAt) {
      rejected.push({ kind: "record", index, reason: "invalid_record" });
      continue;
    }

    const rawVisibility = String(record.visibility ?? "");
    const requestedVisibility: Visibility = VISIBILITY.has(rawVisibility as Visibility)
      ? rawVisibility as Visibility
      : "internal_only";
    const visibility = clampVisibility(requestedVisibility, redistributionPermission);
    const status = new Date(expiresAt).getTime() > Date.now() ? "active" : "expired";
    const id = await stableId("hlr", sourceId, sourceMessageId, fingerprint);
    const rawRate = record.rate_amount;
    const rateAmount = rawRate === null || rawRate === undefined || rawRate === ""
      ? null
      : Number(rawRate);
    const safeRate = rateAmount !== null && Number.isFinite(rateAmount) && rateAmount >= 0 ? rateAmount : null;

    await env.DB.prepare(`
      INSERT INTO hermes_load_records (
        id, source_id, source_message_id, fingerprint, record_type, source_name,
        equipment, origin, destination, pickup_window, availability_text, team,
        rate_amount, rate_currency, received_at, observed_at, last_seen_at,
        expires_at, status, visibility, raw_evidence_ref, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_id, source_message_id, fingerprint) DO UPDATE SET
        record_type = excluded.record_type,
        source_name = excluded.source_name,
        equipment = excluded.equipment,
        origin = excluded.origin,
        destination = excluded.destination,
        pickup_window = excluded.pickup_window,
        availability_text = excluded.availability_text,
        team = excluded.team,
        rate_amount = excluded.rate_amount,
        rate_currency = excluded.rate_currency,
        observed_at = excluded.observed_at,
        last_seen_at = excluded.last_seen_at,
        expires_at = excluded.expires_at,
        status = excluded.status,
        visibility = excluded.visibility,
        raw_evidence_ref = excluded.raw_evidence_ref,
        updated_at = excluded.updated_at
    `).bind(
      id,
      sourceId,
      sourceMessageId,
      fingerprint,
      recordType,
      sourceName,
      equipment,
      origin,
      destination,
      optionalText(record.pickup_window, 160),
      optionalText(record.availability_text, 240),
      boolInt(record.team, false),
      safeRate,
      safeRate === null ? null : (text(record.rate_currency || "USD", 8) || "USD"),
      receivedAt,
      observedAt,
      now,
      expiresAt,
      status,
      visibility,
      optionalText(record.raw_evidence_ref, 300),
      now,
      now,
    ).run();
    accepted += 1;
  }

  return jsonResponse(202, {
    success: true,
    source_id: sourceId,
    accepted,
    quarantined,
    rejected,
    outbound_enabled: false,
    car_hauling_ingest_allowed: true,
    car_hauling_broker_outreach_hold: true,
  });
}
