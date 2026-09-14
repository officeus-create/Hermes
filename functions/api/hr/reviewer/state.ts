import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  cleanHrText,
  ensureHrSchema,
  getHrReviewerAccess,
  isHrCandidateId,
  sameOriginMutation,
} from "../../_lib/hr.mjs";
import {
  canHrCommunicationTransition,
  ensureHrCommunicationSchema,
  getHrCommunicationEventByIdempotency,
  getHrCommunicationState,
  isHrCommunicationChannel,
  isHrCommunicationStage,
  isHrNextAction,
  isHrNextActionOwner,
  isHrTerminalCommunicationStage,
  validateHrCommunicationAction,
} from "../../_lib/hr-communication-state.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env };

const privateHeaders = { "Cache-Control": "no-store" };
const IDP_RE = /^[A-Za-z0-9:_-]{12,120}$/;
const OPAQUE_PROVIDER_REF_RE = /^[A-Za-z0-9_:./-]{3,240}$/;
const FORBIDDEN_BODY_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "telegram_handle",
  "message",
  "message_body",
  "body",
  "transcript",
  "resume",
  "cv",
  "hire",
  "reject",
  "auto_hire",
  "auto_reject",
  "readiness_score",
]);

async function requireReviewer(request: Request, env: Env) {
  if (!env.DB) {
    return { ok: false as const, response: jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders) };
  }
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) {
    return { ok: false as const, response: jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders) };
  }
  await ensureHrSchema(env.DB);
  const access = await getHrReviewerAccess(env.DB, specialist.id);
  if (!access) {
    return { ok: false as const, response: jsonResponse(403, { success: false, error: "hr_reviewer_not_authorized" }, privateHeaders) };
  }
  return { ok: true as const, specialist, access };
}

function isoTime(value: unknown) {
  const text = cleanHrText(value, 48);
  return text && !Number.isNaN(Date.parse(text)) ? text : "";
}

function opaqueRef(value: unknown) {
  const text = cleanHrText(value, 240);
  if (!text) return { value: null as string | null, invalid: false };
  return OPAQUE_PROVIDER_REF_RE.test(text)
    ? { value: text, invalid: false }
    : { value: null as string | null, invalid: true };
}

function providerRefForStage(stage: string, gmailMessageRef: string | null, telegramHandoffRef: string | null) {
  if (stage === "MOVED_TO_TELEGRAM") return telegramHandoffRef;
  return gmailMessageRef || telegramHandoffRef || null;
}

async function candidateExists(db: any, candidateId: string) {
  return db.prepare(`SELECT id,status FROM hr_candidates WHERE id=? LIMIT 1`).bind(candidateId).first();
}

export async function onRequestGet({ request, env }: Context) {
  const auth = await requireReviewer(request, env);
  if (!auth.ok) return auth.response;

  const candidateId = cleanHrText(new URL(request.url).searchParams.get("candidate_id"), 120);
  if (!isHrCandidateId(candidateId)) {
    return jsonResponse(400, { success: false, error: "candidate_id_invalid" }, privateHeaders);
  }
  const candidate = await candidateExists(env.DB, candidateId);
  if (!candidate) return jsonResponse(404, { success: false, error: "candidate_not_found" }, privateHeaders);

  const state = await getHrCommunicationState(env.DB, candidateId);
  return jsonResponse(200, {
    success: true,
    candidate_id: candidateId,
    candidate_status: candidate.status,
    communication_state: state || null,
  }, privateHeaders);
}

export async function onRequestPut({ request, env }: Context) {
  if (!sameOriginMutation(request)) {
    return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" }, privateHeaders);
  }
  const auth = await requireReviewer(request, env);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  }

  for (const key of Object.keys(body)) {
    if (FORBIDDEN_BODY_FIELDS.has(key)) {
      return jsonResponse(400, { success: false, error: "raw_candidate_data_not_accepted" }, privateHeaders);
    }
  }

  const candidateId = cleanHrText(body.candidate_id, 120);
  if (!isHrCandidateId(candidateId)) {
    return jsonResponse(400, { success: false, error: "candidate_id_invalid" }, privateHeaders);
  }
  const candidate = await candidateExists(env.DB, candidateId);
  if (!candidate) return jsonResponse(404, { success: false, error: "candidate_not_found" }, privateHeaders);

  const idempotencyKey = cleanHrText(request.headers.get("Idempotency-Key"), 120);
  if (!IDP_RE.test(idempotencyKey)) {
    return jsonResponse(400, { success: false, error: "idempotency_key_required" }, privateHeaders);
  }

  await ensureHrCommunicationSchema(env.DB);
  const replay = await getHrCommunicationEventByIdempotency(env.DB, idempotencyKey);
  if (replay) {
    if (replay.candidate_id !== candidateId) {
      return jsonResponse(409, { success: false, error: "idempotency_key_conflict" }, privateHeaders);
    }
    return jsonResponse(200, {
      success: true,
      duplicate: true,
      candidate_id: candidateId,
      communication_state: await getHrCommunicationState(env.DB, candidateId),
    }, privateHeaders);
  }

  const toStage = cleanHrText(body.current_stage || body.to_stage, 40);
  const currentChannel = cleanHrText(body.current_channel, 20);
  const sourceChannel = cleanHrText(body.source_channel, 20);
  const nextAction = cleanHrText(body.next_action, 40);
  const nextActionOwner = cleanHrText(body.next_action_owner, 40);
  const occurredAt = isoTime(body.occurred_at) || new Date().toISOString();
  const lastInboundAt = isoTime(body.last_inbound_at) || null;
  const lastOutboundAt = isoTime(body.last_outbound_at) || null;
  const gmailThread = opaqueRef(body.gmail_thread_ref);
  const gmailMessage = opaqueRef(body.gmail_message_ref);
  const telegramHandoff = opaqueRef(body.telegram_handoff_ref);

  if (gmailThread.invalid || gmailMessage.invalid || telegramHandoff.invalid) {
    return jsonResponse(400, { success: false, error: "provider_ref_invalid" }, privateHeaders);
  }
  const gmailThreadRef = gmailThread.value;
  const gmailMessageRef = gmailMessage.value;
  const telegramHandoffRef = telegramHandoff.value;

  if (!isHrCommunicationStage(toStage) || !isHrCommunicationChannel(currentChannel)) {
    return jsonResponse(400, { success: false, error: "communication_state_invalid" }, privateHeaders);
  }
  if (!isHrNextAction(nextAction) || !isHrNextActionOwner(nextActionOwner)
    || !validateHrCommunicationAction(toStage, nextAction, nextActionOwner)) {
    return jsonResponse(400, { success: false, error: "next_action_invalid" }, privateHeaders);
  }

  const existing = await getHrCommunicationState(env.DB, candidateId);
  if (!existing && isHrTerminalCommunicationStage(toStage)) {
    return jsonResponse(409, { success: false, error: "communication_initial_stage_invalid" }, privateHeaders);
  }

  const effectiveSourceChannel = existing?.source_channel || sourceChannel;
  if (!isHrCommunicationChannel(effectiveSourceChannel)) {
    return jsonResponse(400, { success: false, error: "source_channel_required" }, privateHeaders);
  }
  if (existing && sourceChannel && sourceChannel !== existing.source_channel) {
    return jsonResponse(409, { success: false, error: "source_channel_immutable" }, privateHeaders);
  }
  if (existing && !canHrCommunicationTransition(existing.current_stage, toStage)) {
    return jsonResponse(409, { success: false, error: "communication_transition_invalid", from: existing.current_stage, to: toStage }, privateHeaders);
  }

  const effectiveTelegramRef = telegramHandoffRef || existing?.telegram_handoff_ref || null;
  if (toStage === "MOVED_TO_TELEGRAM") {
    if (currentChannel !== "telegram" || !effectiveTelegramRef) {
      return jsonResponse(400, { success: false, error: "telegram_handoff_evidence_required" }, privateHeaders);
    }
    if (nextAction === "REPLY" || nextAction === "WAIT_CANDIDATE" || nextAction === "HANDOFF_TELEGRAM") {
      return jsonResponse(400, { success: false, error: "stale_email_action_after_telegram_handoff" }, privateHeaders);
    }
  }

  const terminal = isHrTerminalCommunicationStage(toStage);
  if (terminal && (nextAction !== "NONE" || nextActionOwner !== "NONE")) {
    return jsonResponse(400, { success: false, error: "terminal_state_must_clear_next_action" }, privateHeaders);
  }

  const now = new Date().toISOString();
  const merged = {
    source_channel: effectiveSourceChannel,
    current_channel: currentChannel,
    current_stage: toStage,
    next_action: nextAction,
    next_action_owner: nextActionOwner,
    last_inbound_at: lastInboundAt || existing?.last_inbound_at || null,
    last_outbound_at: lastOutboundAt || existing?.last_outbound_at || null,
    gmail_thread_ref: gmailThreadRef || existing?.gmail_thread_ref || null,
    gmail_message_ref: gmailMessageRef || existing?.gmail_message_ref || null,
    telegram_handoff_ref: effectiveTelegramRef,
    updated_at: now,
  };
  const eventId = `hr-state-${crypto.randomUUID()}`;
  const providerRef = providerRefForStage(toStage, merged.gmail_message_ref, merged.telegram_handoff_ref);

  const stateStatement = existing
    ? env.DB.prepare(`
        UPDATE hr_candidate_communication_state
        SET current_channel=?,current_stage=?,next_action=?,next_action_owner=?,last_inbound_at=?,last_outbound_at=?,
            gmail_thread_ref=?,gmail_message_ref=?,telegram_handoff_ref=?,updated_at=?
        WHERE candidate_id=?
      `).bind(
        merged.current_channel, merged.current_stage, merged.next_action, merged.next_action_owner,
        merged.last_inbound_at, merged.last_outbound_at, merged.gmail_thread_ref, merged.gmail_message_ref,
        merged.telegram_handoff_ref, merged.updated_at, candidateId,
      )
    : env.DB.prepare(`
        INSERT INTO hr_candidate_communication_state
          (candidate_id,source_channel,current_channel,current_stage,next_action,next_action_owner,last_inbound_at,last_outbound_at,
           gmail_thread_ref,gmail_message_ref,telegram_handoff_ref,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        candidateId, merged.source_channel, merged.current_channel, merged.current_stage, merged.next_action,
        merged.next_action_owner, merged.last_inbound_at, merged.last_outbound_at, merged.gmail_thread_ref,
        merged.gmail_message_ref, merged.telegram_handoff_ref, merged.updated_at,
      );

  const eventStatement = env.DB.prepare(`
    INSERT INTO hr_candidate_communication_events
      (id,candidate_id,idempotency_key,from_stage,to_stage,from_channel,to_channel,next_action,next_action_owner,
       provider_ref,occurred_at,created_by_specialist_id,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    eventId, candidateId, idempotencyKey, existing?.current_stage || null, toStage,
    existing?.current_channel || null, currentChannel, nextAction, nextActionOwner,
    providerRef, occurredAt, auth.specialist.id, now,
  );

  await env.DB.batch([stateStatement, eventStatement]);

  return jsonResponse(existing ? 200 : 201, {
    success: true,
    duplicate: false,
    candidate_id: candidateId,
    communication_state: await getHrCommunicationState(env.DB, candidateId),
    transition: {
      event_id: eventId,
      from_stage: existing?.current_stage || null,
      to_stage: toStage,
      automated: false,
    },
  }, privateHeaders);
}

export async function onRequest(context: Context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "PUT") return onRequestPut(context);
  return jsonResponse(405, { success: false, error: "method_not_allowed" }, privateHeaders);
}
