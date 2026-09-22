import { getAcademyProgressionSummary } from "./academy-progression.mjs";
import { cleanHrLongText, cleanHrText, ensureHrSchema } from "./hr.mjs";

export const HR_READINESS_LEVELS = Object.freeze([
  "HOLD",
  "OBSERVE",
  "PRACTICE",
  "SUPERVISED_LIVE",
  "INDEPENDENT_BOUNDED_WORK",
]);

export const HR_READINESS_DECISIONS = Object.freeze([
  "READY_FOR_TEAM",
  "MORE_PRACTICE",
  "HOLD",
]);

export const HR_OUTCOME_MARKERS = Object.freeze([
  "FIRST_LIVE_TASK",
  "RETAINED_7D",
  "RETAINED_30D",
  "RETAINED_90D",
  "KPI_OUTCOME",
]);

export const HR_BRIDGE_EVENT_TYPES = Object.freeze([
  "hr_academy_offered",
  "hr_academy_accepted",
  "academy_enrollment_created",
  "academy_evidence_submitted",
  "academy_capability_gap_resolved",
  "academy_supervised_live_started",
  "academy_readiness_packet_ready",
  "hr_readiness_decision_recorded",
  "hr_team_handoff_completed",
  "hr_first_live_task",
  "hr_retained_7d",
  "hr_retained_30d",
  "hr_retained_90d",
  "hr_kpi_outcome_recorded",
]);

const OUTCOME_EVENT_BY_MARKER = Object.freeze({
  FIRST_LIVE_TASK: "hr_first_live_task",
  RETAINED_7D: "hr_retained_7d",
  RETAINED_30D: "hr_retained_30d",
  RETAINED_90D: "hr_retained_90d",
  KPI_OUTCOME: "hr_kpi_outcome_recorded",
});

export function isHrReadinessDecision(value) {
  return HR_READINESS_DECISIONS.includes(String(value || ""));
}

export function isHrOutcomeMarker(value) {
  return HR_OUTCOME_MARKERS.includes(String(value || ""));
}

export function cleanCapabilityCode(value) {
  const cleaned = cleanHrText(value, 120).toLowerCase().replace(/[^a-z0-9:_-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned ? cleaned.slice(0, 120) : "";
}

export function readinessLevelFromEvidence(summary, openGapCount, supervisedPracticeCount) {
  if (!summary || summary.enrollment_state !== "enrolled") return "HOLD";
  const completedLessons = Number(summary.completed_lessons || 0);
  const acceptedEvidence = Number(summary.evidence?.accepted || 0);
  if (summary.progression_state === "completed" && openGapCount === 0 && supervisedPracticeCount > 0) {
    return "INDEPENDENT_BOUNDED_WORK";
  }
  if (supervisedPracticeCount > 0 || acceptedEvidence > 0) return "SUPERVISED_LIVE";
  if (completedLessons > 0 || Number(summary.evidence?.submitted || 0) > 0) return "PRACTICE";
  return "OBSERVE";
}

export async function ensureHrReadinessSchema(db) {
  await ensureHrSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_capability_gaps (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      specialist_id TEXT NOT NULL,
      program_slug TEXT NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('open','resolved')),
      source TEXT NOT NULL CHECK (source IN ('evaluation','academy','human')),
      resolution_source TEXT,
      resolution_ref TEXT,
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(candidate_id, code)
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_readiness_packets (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      specialist_id TEXT NOT NULL,
      program_slug TEXT NOT NULL,
      readiness_level TEXT NOT NULL CHECK (readiness_level IN ('HOLD','OBSERVE','PRACTICE','SUPERVISED_LIVE','INDEPENDENT_BOUNDED_WORK')),
      academy_progression_state TEXT NOT NULL,
      open_gap_count INTEGER NOT NULL,
      resolved_gap_count INTEGER NOT NULL,
      accepted_evidence_count INTEGER NOT NULL,
      supervised_practice_count INTEGER NOT NULL,
      summary_json TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('ready_for_review','reviewed')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_readiness_decisions (
      id TEXT PRIMARY KEY,
      packet_id TEXT NOT NULL UNIQUE,
      candidate_id TEXT NOT NULL,
      reviewer_specialist_id TEXT NOT NULL,
      decision TEXT NOT NULL CHECK (decision IN ('READY_FOR_TEAM','MORE_PRACTICE','HOLD')),
      bounded_scope TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_team_handoffs (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      candidate_id TEXT NOT NULL,
      readiness_decision_id TEXT NOT NULL,
      channel TEXT NOT NULL CHECK (channel IN ('telegram','whatsapp','other')),
      destination_ref TEXT NOT NULL,
      bounded_scope TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('prepared','completed','cancelled')),
      created_by_specialist_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_performance_outcomes (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      candidate_id TEXT NOT NULL,
      handoff_id TEXT NOT NULL,
      marker TEXT NOT NULL CHECK (marker IN ('FIRST_LIVE_TASK','RETAINED_7D','RETAINED_30D','RETAINED_90D','KPI_OUTCOME')),
      result_class TEXT NOT NULL,
      quality_flags_json TEXT NOT NULL DEFAULT '[]',
      manager_feedback TEXT,
      occurred_at TEXT NOT NULL,
      created_by_specialist_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hr_bridge_events (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      candidate_id TEXT NOT NULL,
      type TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      occurred_at TEXT NOT NULL,
      created_by_specialist_id TEXT NOT NULL
    )
  `).run();

  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_gaps_candidate_state ON hr_capability_gaps(candidate_id,state,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_readiness_candidate ON hr_readiness_packets(candidate_id,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_handoffs_candidate ON hr_team_handoffs(candidate_id,created_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_outcomes_candidate ON hr_performance_outcomes(candidate_id,occurred_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hr_bridge_events_candidate ON hr_bridge_events(candidate_id,occurred_at)").run();
}

export async function appendHrBridgeEvent(db, {
  candidateId,
  type,
  idempotencyKey,
  payload = {},
  occurredAt = new Date().toISOString(),
  actorSpecialistId,
}) {
  await ensureHrReadinessSchema(db);
  if (!HR_BRIDGE_EVENT_TYPES.includes(type)) throw new Error("hr_bridge_event_type_invalid");
  const eventId = `hr-bridge-event-${crypto.randomUUID()}`;
  await db.prepare(`
    INSERT OR IGNORE INTO hr_bridge_events
      (id,idempotency_key,candidate_id,type,payload_json,occurred_at,created_by_specialist_id)
    VALUES (?,?,?,?,?,?,?)
  `).bind(
    eventId,
    cleanHrText(idempotencyKey, 180),
    candidateId,
    type,
    JSON.stringify(payload || {}),
    occurredAt,
    actorSpecialistId,
  ).run();
  return { id: eventId, type, occurred_at: occurredAt };
}

export async function listHrCapabilityGaps(db, candidateId) {
  const result = await db.prepare(`
    SELECT id,code,title,description,state,source,resolution_source,resolution_ref,created_at,resolved_at,updated_at
    FROM hr_capability_gaps
    WHERE candidate_id=?
    ORDER BY created_at ASC
  `).bind(candidateId).all();
  return Array.isArray(result?.results) ? result.results : [];
}

export async function syncHrEvaluationGaps(db, candidate, academyLink, actorSpecialistId) {
  await ensureHrReadinessSchema(db);
  if (!candidate?.specialist_id || !academyLink?.program_slug) throw new Error("academy_link_required");
  const latestScore = await db.prepare(`
    SELECT missing_evidence_json
    FROM hr_score_snapshots
    WHERE candidate_id=?
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(candidate.id).first();
  let missing = [];
  try { missing = latestScore?.missing_evidence_json ? JSON.parse(String(latestScore.missing_evidence_json)) : []; }
  catch { missing = []; }
  const values = Array.isArray(missing) ? missing : [];
  const now = new Date().toISOString();
  for (const raw of values.slice(0, 20)) {
    const label = cleanHrText(raw, 240);
    const code = cleanCapabilityCode(`evaluation:${label}`);
    if (!label || !code) continue;
    await db.prepare(`
      INSERT INTO hr_capability_gaps
        (id,candidate_id,specialist_id,program_slug,code,title,description,state,source,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,'open','evaluation',?,?)
      ON CONFLICT(candidate_id,code) DO UPDATE SET
        title=excluded.title,
        description=excluded.description,
        updated_at=excluded.updated_at
    `).bind(
      `hr-gap-${crypto.randomUUID()}`,
      candidate.id,
      candidate.specialist_id,
      academyLink.program_slug,
      code,
      label,
      `Evidence gap carried from the versioned HR evaluation: ${label}.`,
      now,
      now,
    ).run();
  }
  const academyKey = academyLink.enrollment_id || academyLink.program_slug;
  await appendHrBridgeEvent(db, {
    candidateId: candidate.id,
    type: "hr_academy_offered",
    idempotencyKey: `academy-offered:${candidate.id}:${academyKey}`,
    payload: { program_slug: academyLink.program_slug },
    occurredAt: now,
    actorSpecialistId,
  });
  await appendHrBridgeEvent(db, {
    candidateId: candidate.id,
    type: "hr_academy_accepted",
    idempotencyKey: `academy-accepted:${candidate.id}:${academyKey}`,
    payload: { program_slug: academyLink.program_slug },
    occurredAt: now,
    actorSpecialistId,
  });
  if (academyLink.enrollment_id) {
    await appendHrBridgeEvent(db, {
      candidateId: candidate.id,
      type: "academy_enrollment_created",
      idempotencyKey: `academy-enrollment:${candidate.id}:${academyLink.enrollment_id}`,
      payload: { program_slug: academyLink.program_slug, enrollment_id: academyLink.enrollment_id },
      occurredAt: now,
      actorSpecialistId,
    });
  }
  return listHrCapabilityGaps(db, candidate.id);
}

export async function resolveHrCapabilityGap(db, {
  candidateId,
  code,
  resolutionSource,
  resolutionRef,
  actorSpecialistId,
}) {
  await ensureHrReadinessSchema(db);
  const normalizedCode = cleanCapabilityCode(code);
  const source = ["academy", "human"].includes(resolutionSource) ? resolutionSource : "human";
  const ref = cleanHrText(resolutionRef, 240);
  const gap = await db.prepare(`
    SELECT id,state FROM hr_capability_gaps WHERE candidate_id=? AND code=? LIMIT 1
  `).bind(candidateId, normalizedCode).first();
  if (!gap) throw new Error("capability_gap_not_found");
  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE hr_capability_gaps
    SET state='resolved',resolution_source=?,resolution_ref=?,resolved_at=?,updated_at=?
    WHERE candidate_id=? AND code=?
  `).bind(source, ref || null, now, now, candidateId, normalizedCode).run();
  await appendHrBridgeEvent(db, {
    candidateId,
    type: "academy_capability_gap_resolved",
    idempotencyKey: `gap-resolved:${candidateId}:${normalizedCode}`,
    payload: { code: normalizedCode, resolution_source: source },
    occurredAt: now,
    actorSpecialistId,
  });
  return { code: normalizedCode, state: "resolved", resolved_at: now };
}

export async function recordHrSupervisedPractice(db, {
  candidateId,
  evidenceRef,
  actorSpecialistId,
  occurredAt = new Date().toISOString(),
}) {
  await ensureHrReadinessSchema(db);
  const ref = cleanHrText(evidenceRef, 240);
  if (!ref) throw new Error("supervised_practice_evidence_required");
  return appendHrBridgeEvent(db, {
    candidateId,
    type: "academy_supervised_live_started",
    idempotencyKey: `supervised-practice:${candidateId}:${ref}`,
    payload: { evidence_ref: ref },
    occurredAt,
    actorSpecialistId,
  });
}

export async function countHrSupervisedPractice(db, candidateId) {
  const row = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM hr_bridge_events
    WHERE candidate_id=? AND type='academy_supervised_live_started'
  `).bind(candidateId).first();
  return Number(row?.count || 0);
}

export async function prepareHrReadinessPacket(db, candidate, academyLink, actorSpecialistId) {
  await ensureHrReadinessSchema(db);
  if (!candidate?.specialist_id || !academyLink?.program_slug) throw new Error("academy_link_required");
  const summary = await getAcademyProgressionSummary(db, candidate.specialist_id, academyLink.program_slug);
  if (!summary) throw new Error("academy_progression_not_found");
  const gaps = await listHrCapabilityGaps(db, candidate.id);
  const openGapCount = gaps.filter((gap) => gap.state === "open").length;
  const resolvedGapCount = gaps.filter((gap) => gap.state === "resolved").length;
  const supervisedPracticeCount = await countHrSupervisedPractice(db, candidate.id);
  const readinessLevel = readinessLevelFromEvidence(summary, openGapCount, supervisedPracticeCount);
  const acceptedEvidenceCount = Number(summary.evidence?.accepted || 0);
  const now = new Date().toISOString();
  const packetId = `hr-readiness-${crypto.randomUUID()}`;
  const safeSummary = {
    total_lessons: Number(summary.total_lessons || 0),
    completed_lessons: Number(summary.completed_lessons || 0),
    evidence: {
      submitted: Number(summary.evidence?.submitted || 0),
      changes_requested: Number(summary.evidence?.changes_requested || 0),
      accepted: acceptedEvidenceCount,
    },
    latest_review_decision: summary.latest_review?.decision || null,
  };
  await db.prepare(`
    INSERT INTO hr_readiness_packets
      (id,candidate_id,specialist_id,program_slug,readiness_level,academy_progression_state,
       open_gap_count,resolved_gap_count,accepted_evidence_count,supervised_practice_count,
       summary_json,state,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,'ready_for_review',?,?)
  `).bind(
    packetId,
    candidate.id,
    candidate.specialist_id,
    academyLink.program_slug,
    readinessLevel,
    summary.progression_state || "in_progress",
    openGapCount,
    resolvedGapCount,
    acceptedEvidenceCount,
    supervisedPracticeCount,
    JSON.stringify(safeSummary),
    now,
    now,
  ).run();
  const observedEvidenceCount = Number(summary.evidence?.submitted || 0)
    + Number(summary.evidence?.changes_requested || 0)
    + acceptedEvidenceCount;
  if (observedEvidenceCount > 0) {
    await appendHrBridgeEvent(db, {
      candidateId: candidate.id,
      type: "academy_evidence_submitted",
      idempotencyKey: `academy-evidence-observed:${packetId}`,
      payload: { program_slug: academyLink.program_slug, evidence_count: observedEvidenceCount },
      occurredAt: now,
      actorSpecialistId,
    });
  }
  await appendHrBridgeEvent(db, {
    candidateId: candidate.id,
    type: "academy_readiness_packet_ready",
    idempotencyKey: `readiness-packet:${packetId}`,
    payload: { packet_id: packetId, readiness_level: readinessLevel },
    occurredAt: now,
    actorSpecialistId,
  });
  return {
    id: packetId,
    candidate_id: candidate.id,
    program_slug: academyLink.program_slug,
    readiness_level: readinessLevel,
    academy_progression_state: summary.progression_state || "in_progress",
    open_gap_count: openGapCount,
    resolved_gap_count: resolvedGapCount,
    accepted_evidence_count: acceptedEvidenceCount,
    supervised_practice_count: supervisedPracticeCount,
    state: "ready_for_review",
    summary: safeSummary,
    created_at: now,
  };
}

export async function decideHrReadiness(db, {
  candidateId,
  packetId,
  decision,
  boundedScope,
  reason,
  reviewerSpecialistId,
}) {
  await ensureHrReadinessSchema(db);
  if (!isHrReadinessDecision(decision)) throw new Error("readiness_decision_invalid");
  const scope = cleanHrLongText(boundedScope, 1000);
  const why = cleanHrLongText(reason, 4000);
  if (why.length < 15) throw new Error("readiness_reason_required");
  const packet = await db.prepare(`
    SELECT id,readiness_level,open_gap_count,accepted_evidence_count,supervised_practice_count,state
    FROM hr_readiness_packets
    WHERE id=? AND candidate_id=?
    LIMIT 1
  `).bind(packetId, candidateId).first();
  if (!packet) throw new Error("readiness_packet_not_found");
  if (decision === "READY_FOR_TEAM") {
    if (!["SUPERVISED_LIVE", "INDEPENDENT_BOUNDED_WORK"].includes(String(packet.readiness_level || ""))) {
      throw new Error("supervised_readiness_required");
    }
    if (Number(packet.accepted_evidence_count || 0) < 1 && Number(packet.supervised_practice_count || 0) < 1) {
      throw new Error("readiness_evidence_required");
    }
    if (scope.length < 5) throw new Error("bounded_scope_required");
  }
  const now = new Date().toISOString();
  const id = `hr-readiness-decision-${crypto.randomUUID()}`;
  await db.batch([
    db.prepare(`
      INSERT INTO hr_readiness_decisions
        (id,packet_id,candidate_id,reviewer_specialist_id,decision,bounded_scope,reason,created_at)
      VALUES (?,?,?,?,?,?,?,?)
    `).bind(id, packetId, candidateId, reviewerSpecialistId, decision, scope, why, now),
    db.prepare("UPDATE hr_readiness_packets SET state='reviewed',updated_at=? WHERE id=?").bind(now, packetId),
  ]);
  await appendHrBridgeEvent(db, {
    candidateId,
    type: "hr_readiness_decision_recorded",
    idempotencyKey: `readiness-decision:${packetId}`,
    payload: { decision, bounded_scope: scope || null },
    occurredAt: now,
    actorSpecialistId: reviewerSpecialistId,
  });
  return { id, packet_id: packetId, decision, bounded_scope: scope, reason: why, created_at: now };
}

export async function completeHrTeamHandoff(db, {
  candidateId,
  readinessDecisionId,
  idempotencyKey,
  channel,
  destinationRef,
  boundedScope,
  actorSpecialistId,
}) {
  await ensureHrReadinessSchema(db);
  const decision = await db.prepare(`
    SELECT id,decision,bounded_scope
    FROM hr_readiness_decisions
    WHERE id=? AND candidate_id=?
    LIMIT 1
  `).bind(readinessDecisionId, candidateId).first();
  if (!decision || decision.decision !== "READY_FOR_TEAM") throw new Error("ready_for_team_decision_required");
  const normalizedChannel = ["telegram", "whatsapp", "other"].includes(channel) ? channel : "other";
  const destination = cleanHrText(destinationRef, 240);
  const scope = cleanHrLongText(boundedScope || decision.bounded_scope, 1000);
  const key = cleanHrText(idempotencyKey, 180);
  if (!key || !destination || !scope) throw new Error("handoff_fields_required");
  const existing = await db.prepare("SELECT id,state FROM hr_team_handoffs WHERE idempotency_key=? LIMIT 1").bind(key).first();
  if (existing) return { id: existing.id, state: existing.state, duplicate: true };
  const now = new Date().toISOString();
  const id = `hr-handoff-${crypto.randomUUID()}`;
  await db.prepare(`
    INSERT INTO hr_team_handoffs
      (id,idempotency_key,candidate_id,readiness_decision_id,channel,destination_ref,bounded_scope,state,created_by_specialist_id,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,'completed',?,?,?)
  `).bind(id, key, candidateId, readinessDecisionId, normalizedChannel, destination, scope, actorSpecialistId, now, now).run();
  await appendHrBridgeEvent(db, {
    candidateId,
    type: "hr_team_handoff_completed",
    idempotencyKey: `handoff-completed:${key}`,
    payload: { handoff_id: id, channel: normalizedChannel, bounded_scope: scope },
    occurredAt: now,
    actorSpecialistId,
  });
  return { id, state: "completed", duplicate: false, channel: normalizedChannel, bounded_scope: scope, created_at: now };
}

export async function recordHrPerformanceOutcome(db, {
  candidateId,
  handoffId,
  idempotencyKey,
  marker,
  resultClass,
  qualityFlags = /** @type {unknown[]} */ ([]),
  managerFeedback = "",
  occurredAt,
  actorSpecialistId,
}) {
  await ensureHrReadinessSchema(db);
  if (!isHrOutcomeMarker(marker)) throw new Error("outcome_marker_invalid");
  const handoff = await db.prepare("SELECT id,state FROM hr_team_handoffs WHERE id=? AND candidate_id=? LIMIT 1").bind(handoffId, candidateId).first();
  if (!handoff || handoff.state !== "completed") throw new Error("completed_handoff_required");
  const key = cleanHrText(idempotencyKey, 180);
  const result = cleanHrText(resultClass, 120);
  const when = cleanHrText(occurredAt, 64) || new Date().toISOString();
  const flags = Array.isArray(qualityFlags)
    ? [...new Set(qualityFlags.map((flag) => cleanHrText(flag, 120)).filter(Boolean))].slice(0, 20)
    : [];
  const feedback = cleanHrLongText(managerFeedback, 2000);
  if (!key || !result) throw new Error("outcome_fields_required");
  const existing = await db.prepare("SELECT id,marker FROM hr_performance_outcomes WHERE idempotency_key=? LIMIT 1").bind(key).first();
  if (existing) return { id: existing.id, marker: existing.marker, duplicate: true };
  const now = new Date().toISOString();
  const id = `hr-outcome-${crypto.randomUUID()}`;
  await db.prepare(`
    INSERT INTO hr_performance_outcomes
      (id,idempotency_key,candidate_id,handoff_id,marker,result_class,quality_flags_json,manager_feedback,occurred_at,created_by_specialist_id,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).bind(id, key, candidateId, handoffId, marker, result, JSON.stringify(flags), feedback || null, when, actorSpecialistId, now).run();
  await appendHrBridgeEvent(db, {
    candidateId,
    type: OUTCOME_EVENT_BY_MARKER[marker],
    idempotencyKey: `outcome-event:${key}`,
    payload: { outcome_id: id, marker, result_class: result, quality_flags: flags },
    occurredAt: when,
    actorSpecialistId,
  });
  return { id, marker, result_class: result, quality_flags: flags, occurred_at: when, duplicate: false };
}

export async function getHrReadinessSnapshot(db, candidateId) {
  await ensureHrReadinessSchema(db);
  const gaps = await listHrCapabilityGaps(db, candidateId);
  const [packetResult, decisionResult, handoffResult, outcomeResult, eventResult] = await Promise.all([
    db.prepare("SELECT * FROM hr_readiness_packets WHERE candidate_id=? ORDER BY created_at DESC LIMIT 1").bind(candidateId).first(),
    db.prepare("SELECT * FROM hr_readiness_decisions WHERE candidate_id=? ORDER BY created_at DESC LIMIT 1").bind(candidateId).first(),
    db.prepare("SELECT id,channel,destination_ref,bounded_scope,state,created_at,updated_at FROM hr_team_handoffs WHERE candidate_id=? ORDER BY created_at DESC").bind(candidateId).all(),
    db.prepare("SELECT id,handoff_id,marker,result_class,quality_flags_json,manager_feedback,occurred_at,created_at FROM hr_performance_outcomes WHERE candidate_id=? ORDER BY occurred_at ASC").bind(candidateId).all(),
    db.prepare("SELECT id,type,payload_json,occurred_at FROM hr_bridge_events WHERE candidate_id=? ORDER BY occurred_at ASC").bind(candidateId).all(),
  ]);
  const parse = (value, fallback) => {
    try { return value ? JSON.parse(String(value)) : fallback; } catch { return fallback; }
  };
  return {
    capability_gaps: gaps,
    latest_packet: packetResult ? { ...packetResult, summary: parse(packetResult.summary_json, {}), summary_json: undefined } : null,
    latest_decision: decisionResult || null,
    team_handoffs: Array.isArray(handoffResult?.results) ? handoffResult.results : [],
    performance_outcomes: (outcomeResult?.results || []).map((row) => ({
      ...row,
      quality_flags: parse(row.quality_flags_json, []),
      quality_flags_json: undefined,
    })),
    bridge_events: (eventResult?.results || []).map((row) => ({
      ...row,
      payload: parse(row.payload_json, {}),
      payload_json: undefined,
    })),
  };
}
