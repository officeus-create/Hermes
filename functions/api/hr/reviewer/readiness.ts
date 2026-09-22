import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  cleanHrLongText,
  cleanHrText,
  getHrCandidateSnapshot,
  getHrReviewerAccess,
  isHrCandidateId,
  sameOriginMutation,
} from "../../_lib/hr.mjs";
import {
  completeHrTeamHandoff,
  decideHrReadiness,
  ensureHrReadinessSchema,
  getHrReadinessSnapshot,
  prepareHrReadinessPacket,
  recordHrPerformanceOutcome,
  recordHrSupervisedPractice,
  resolveHrCapabilityGap,
  syncHrEvaluationGaps,
} from "../../_lib/hr-readiness.mjs";

type Env = { DB?: any };
type Context = { request: Request; env: Env };

const privateHeaders = { "Cache-Control": "no-store" };

async function requireReviewer(request: Request, env: Env) {
  if (!env.DB) {
    return { ok: false as const, response: jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders) };
  }
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) {
    return { ok: false as const, response: jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders) };
  }
  const access = await getHrReviewerAccess(env.DB, specialist.id);
  if (!access) {
    return { ok: false as const, response: jsonResponse(403, { success: false, error: "hr_reviewer_not_authorized" }, privateHeaders) };
  }
  await ensureHrReadinessSchema(env.DB);
  return { ok: true as const, specialist, access };
}

async function candidateContext(db: any, candidateId: string) {
  const snapshot = await getHrCandidateSnapshot(db, candidateId);
  if (!snapshot) return null;
  return {
    snapshot,
    candidate: snapshot.candidate,
    academyLink: snapshot.academy_link,
  };
}

function apiError(error: unknown) {
  const code = error instanceof Error ? error.message : "hr_readiness_operation_failed";
  const statusByCode: Record<string, number> = {
    academy_link_required: 409,
    academy_progression_not_found: 409,
    capability_gap_not_found: 404,
    supervised_practice_evidence_required: 400,
    readiness_decision_invalid: 400,
    readiness_reason_required: 400,
    readiness_packet_not_found: 404,
    supervised_readiness_required: 409,
    readiness_evidence_required: 409,
    bounded_scope_required: 400,
    ready_for_team_decision_required: 409,
    handoff_fields_required: 400,
    outcome_marker_invalid: 400,
    completed_handoff_required: 409,
    outcome_fields_required: 400,
  };
  return { code, status: statusByCode[code] || 400 };
}

export async function onRequestGet({ request, env }: Context) {
  const auth = await requireReviewer(request, env);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const candidateId = cleanHrText(url.searchParams.get("candidate_id"), 120);
  if (!isHrCandidateId(candidateId)) {
    return jsonResponse(400, { success: false, error: "candidate_id_invalid" }, privateHeaders);
  }
  const context = await candidateContext(env.DB, candidateId);
  if (!context) return jsonResponse(404, { success: false, error: "candidate_not_found" }, privateHeaders);
  const readiness = await getHrReadinessSnapshot(env.DB, candidateId);
  return jsonResponse(200, {
    success: true,
    candidate: {
      id: context.candidate.id,
      track: context.candidate.track,
      status: context.candidate.status,
      specialist_id: context.candidate.specialist_id || null,
    },
    academy_link: context.academyLink || null,
    readiness,
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

  const forbidden = [
    "employment_state", "hire", "reject", "auto_hire", "auto_reject", "candidate_email",
    "academy_score", "hr_score", "live_access_granted", "reviewer_specialist_id",
  ];
  if (forbidden.some((key) => Object.prototype.hasOwnProperty.call(body, key))) {
    return jsonResponse(400, { success: false, error: "readiness_control_fields_not_editable_here" }, privateHeaders);
  }

  const candidateId = cleanHrText(body.candidate_id, 120);
  const action = cleanHrText(body.action, 80);
  if (!isHrCandidateId(candidateId)) {
    return jsonResponse(400, { success: false, error: "candidate_id_invalid" }, privateHeaders);
  }
  const context = await candidateContext(env.DB, candidateId);
  if (!context) return jsonResponse(404, { success: false, error: "candidate_not_found" }, privateHeaders);

  try {
    let result: unknown;
    if (action === "sync_evaluation_gaps") {
      result = await syncHrEvaluationGaps(env.DB, context.candidate, context.academyLink, auth.specialist.id);
    } else if (action === "resolve_gap") {
      result = await resolveHrCapabilityGap(env.DB, {
        candidateId,
        code: cleanHrText(body.code, 120),
        resolutionSource: cleanHrText(body.resolution_source, 40),
        resolutionRef: cleanHrText(body.resolution_ref, 240),
        actorSpecialistId: auth.specialist.id,
      });
    } else if (action === "record_supervised_practice") {
      result = await recordHrSupervisedPractice(env.DB, {
        candidateId,
        evidenceRef: cleanHrText(body.evidence_ref, 240),
        actorSpecialistId: auth.specialist.id,
        occurredAt: cleanHrText(body.occurred_at, 64) || new Date().toISOString(),
      });
    } else if (action === "prepare_readiness_packet") {
      result = await prepareHrReadinessPacket(env.DB, context.candidate, context.academyLink, auth.specialist.id);
    } else if (action === "decide_readiness") {
      result = await decideHrReadiness(env.DB, {
        candidateId,
        packetId: cleanHrText(body.packet_id, 160),
        decision: cleanHrText(body.decision, 40),
        boundedScope: cleanHrLongText(body.bounded_scope, 1000),
        reason: cleanHrLongText(body.reason, 4000),
        reviewerSpecialistId: auth.specialist.id,
      });
    } else if (action === "complete_team_handoff") {
      result = await completeHrTeamHandoff(env.DB, {
        candidateId,
        readinessDecisionId: cleanHrText(body.readiness_decision_id, 160),
        idempotencyKey: cleanHrText(request.headers.get("Idempotency-Key") || body.idempotency_key, 180),
        channel: cleanHrText(body.channel, 40),
        destinationRef: cleanHrText(body.destination_ref, 240),
        boundedScope: cleanHrLongText(body.bounded_scope, 1000),
        actorSpecialistId: auth.specialist.id,
      });
    } else if (action === "record_outcome") {
      const qualityFlags = Array.isArray(body.quality_flags) ? body.quality_flags : [];
      result = await recordHrPerformanceOutcome(env.DB, {
        candidateId,
        handoffId: cleanHrText(body.handoff_id, 160),
        idempotencyKey: cleanHrText(request.headers.get("Idempotency-Key") || body.idempotency_key, 180),
        marker: cleanHrText(body.marker, 40),
        resultClass: cleanHrText(body.result_class, 120),
        qualityFlags,
        managerFeedback: cleanHrLongText(body.manager_feedback, 2000),
        occurredAt: cleanHrText(body.occurred_at, 64),
        actorSpecialistId: auth.specialist.id,
      });
    } else {
      return jsonResponse(400, { success: false, error: "readiness_action_invalid" }, privateHeaders);
    }

    return jsonResponse(200, {
      success: true,
      action,
      result,
      readiness: await getHrReadinessSnapshot(env.DB, candidateId),
    }, privateHeaders);
  } catch (error) {
    const failure = apiError(error);
    return jsonResponse(failure.status, { success: false, error: failure.code }, privateHeaders);
  }
}
