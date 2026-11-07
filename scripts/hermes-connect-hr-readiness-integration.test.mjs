import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { ensureAcademySchema } from "../functions/api/_lib/academy.mjs";
import { ensureAcademyProgressionSchema } from "../functions/api/_lib/academy-progression.mjs";
import {
  appendHrBridgeEvent,
  completeHrTeamHandoff,
  decideHrReadiness,
  ensureHrReadinessSchema,
  getHrReadinessSnapshot,
  prepareHrReadinessPacket,
  recordHrPerformanceOutcome,
  recordHrSupervisedPractice,
  resolveHrCapabilityGap,
  syncHrEvaluationGaps,
} from "../functions/api/_lib/hr-readiness.mjs";

class D1Statement {
  constructor(statement,args=[]) { this.statement=statement; this.args=args; }
  bind(...args) { return new D1Statement(this.statement,args); }
  async run() { this.statement.run(...this.args); return {success:true}; }
  async first() { return this.statement.get(...this.args) ?? null; }
  async all() { return {results:this.statement.all(...this.args)}; }
}
class MemoryD1 {
  constructor() { this.sqlite=new DatabaseSync(":memory:"); }
  prepare(sql) { return new D1Statement(this.sqlite.prepare(sql)); }
  async batch(statements) {
    const out=[];
    for (const statement of statements) out.push(await statement.run());
    return out;
  }
}

const db=new MemoryD1();
await ensureHrReadinessSchema(db);
await ensureAcademySchema(db);
await ensureAcademyProgressionSchema(db);

const candidate={id:"hr_candidate_p0c_000000000000000001",specialist_id:"specialist-p0c-001",track:"logistics"};
const academyLink={program_slug:"us-logistics-operations",enrollment_id:"academy-enrollment-p0c-001"};
const reviewer="reviewer-p0c-001";
const now="2026-09-22T10:00:00.000Z";

// The bridge event producer must acknowledge ONLY the stored row, never a
// generated ID that SQLite ignored on a repeated idempotency key.
const bridgeParams={
  candidateId:candidate.id,
  type:"academy_evidence_submitted",
  idempotencyKey:"bridge-event-replay-p0c",
  payload:{fixture:"synthetic"},
  occurredAt:now,
  actorSpecialistId:reviewer,
};
const bridgeFirst=await appendHrBridgeEvent(db,bridgeParams);
const bridgeReplay=await appendHrBridgeEvent(db,bridgeParams);
assert.equal(bridgeFirst.duplicate,false);
assert.equal(bridgeReplay.duplicate,true);
assert.equal(bridgeReplay.id,bridgeFirst.id);
const persistedBridge=await db.prepare(
  "SELECT id,candidate_id,type FROM hr_bridge_events WHERE idempotency_key=?"
).bind(bridgeParams.idempotencyKey).first();
assert.equal(persistedBridge.id,bridgeFirst.id);
await assert.rejects(
  appendHrBridgeEvent(db,{
    ...bridgeParams,candidateId:"hr_candidate_p0c_000000000000000002",
  }),
  /hr_bridge_event_idempotency_conflict/,
);
await assert.rejects(
  appendHrBridgeEvent(db,{
    ...bridgeParams,payload:{fixture:"different"},
  }),
  /hr_bridge_event_idempotency_conflict/,
);

await db.prepare(`
  INSERT INTO hr_score_snapshots
    (id,candidate_id,session_id,policy_version,interview_version,model_version,dimensions_json,missing_evidence_json,created_at)
  VALUES (?,?,?,?,?,?,?,?,?)
`).bind(
  "score-p0c-001",candidate.id,"session-p0c-001","hr-eval-policy-v1","hr-interview-v2",
  "deterministic-practice-signals-v1","{}",JSON.stringify(["negotiation practice","supervised live roleplay"]),now
).run();

await db.prepare(`
  INSERT INTO academy_enrollments
    (id,specialist_id,program_slug,state,participation_model,cohort_code,created_at,updated_at)
  VALUES (?,?,?,'enrolled','unspecified',NULL,?,?)
`).bind(academyLink.enrollment_id,candidate.specialist_id,academyLink.program_slug,now,now).run();

await db.prepare(`
  INSERT INTO academy_submissions
    (id,specialist_id,program_slug,lesson_id,submission_type,text_content,evidence_url,state,created_at,updated_at)
  VALUES (?,?,?,?,?,'Synthetic readiness evidence',NULL,'accepted',?,?)
`).bind("submission-p0c-001",candidate.specialist_id,academyLink.program_slug,"system-map","written_reflection",now,now).run();

await db.prepare(`
  INSERT INTO academy_progression_reviews
    (id,specialist_id,program_slug,reviewer_specialist_id,decision,feedback_text,created_at)
  VALUES (?,?,?,?,?,?,?)
`).bind("progress-p0c-001",candidate.specialist_id,academyLink.program_slug,reviewer,"continue","Continue supervised practice.",now).run();

const gaps=await syncHrEvaluationGaps(db,candidate,academyLink,reviewer);
assert.equal(gaps.length,2);
assert.equal(gaps.filter((gap)=>gap.state==="open").length,2);

await resolveHrCapabilityGap(db,{
  candidateId:candidate.id,
  code:gaps[0].code,
  resolutionSource:"academy",
  resolutionRef:"submission-p0c-001",
  actorSpecialistId:reviewer,
});
await recordHrSupervisedPractice(db,{
  candidateId:candidate.id,
  evidenceRef:"supervised-practice-p0c-001",
  actorSpecialistId:reviewer,
  occurredAt:"2026-09-22T11:00:00.000Z",
});

const packet=await prepareHrReadinessPacket(db,candidate,academyLink,reviewer);
assert.equal(packet.readiness_level,"SUPERVISED_LIVE");
assert.equal(packet.resolved_gap_count,1);
assert.equal(packet.open_gap_count,1);
assert.equal(packet.supervised_practice_count,1);
assert.equal(packet.accepted_evidence_count,1);

const decision=await decideHrReadiness(db,{
  candidateId:candidate.id,
  packetId:packet.id,
  decision:"READY_FOR_TEAM",
  boundedScope:"Supervised carrier discovery roleplays and manager-observed calls only.",
  reason:"Accepted Academy evidence and supervised practice justify a narrowly bounded human-approved team handoff while one capability gap remains open.",
  reviewerSpecialistId:reviewer,
});
assert.equal(decision.decision,"READY_FOR_TEAM");

const handoff=await completeHrTeamHandoff(db,{
  candidateId:candidate.id,
  readinessDecisionId:decision.id,
  idempotencyKey:"handoff-p0c-001",
  channel:"telegram",
  destinationRef:"private-team-receipt-p0c-001",
  boundedScope:decision.bounded_scope,
  actorSpecialistId:reviewer,
});
assert.equal(handoff.duplicate,false);
const replay=await completeHrTeamHandoff(db,{
  candidateId:candidate.id,
  readinessDecisionId:decision.id,
  idempotencyKey:"handoff-p0c-001",
  channel:"telegram",
  destinationRef:"private-team-receipt-p0c-001",
  boundedScope:decision.bounded_scope,
  actorSpecialistId:reviewer,
});
assert.equal(replay.duplicate,true);

// Reject reuse of a successful handoff receipt for another destination.
await assert.rejects(
  completeHrTeamHandoff(db,{
    candidateId:candidate.id,
    readinessDecisionId:decision.id,
    idempotencyKey:"handoff-p0c-001",
    channel:"telegram",
    destinationRef:"different-private-team",
    boundedScope:decision.bounded_scope,
    actorSpecialistId:reviewer,
  }),
  /handoff_idempotency_conflict/,
);

// A different approved synthetic candidate must never inherit the first one's
// idempotency receipt. The fixture is deliberately not an actual candidate.
const secondCandidateId="hr_candidate_p0c_000000000000000002";
const secondDecisionId="hr-readiness-decision-p0c-other";
await db.prepare(`
  INSERT INTO hr_readiness_decisions
    (id,packet_id,candidate_id,reviewer_specialist_id,decision,bounded_scope,reason,created_at)
  VALUES (?,?,?,?,'READY_FOR_TEAM',?,?,?)
`).bind(
  secondDecisionId,"hr-readiness-p0c-other",secondCandidateId,reviewer,
  decision.bounded_scope,"Synthetic independent human decision for idempotency isolation test.",now,
).run();

const secondHandoffFields={
  candidateId:secondCandidateId,
  readinessDecisionId:secondDecisionId,
  channel:"telegram",
  destinationRef:"private-team-receipt-p0c-other",
  boundedScope:decision.bounded_scope,
  actorSpecialistId:reviewer,
};
await assert.rejects(
  completeHrTeamHandoff(db,{
    ...secondHandoffFields,idempotencyKey:"handoff-p0c-001",
  }),
  /handoff_idempotency_conflict/,
);
const secondHandoff=await completeHrTeamHandoff(db,{
  ...secondHandoffFields,idempotencyKey:"handoff-p0c-other",
});
assert.equal(secondHandoff.duplicate,false);

for (const [marker,occurredAt] of [
  ["FIRST_LIVE_TASK","2026-09-22T12:00:00.000Z"],
  ["RETAINED_7D","2026-09-29T12:00:00.000Z"],
  ["RETAINED_30D","2026-10-22T12:00:00.000Z"],
  ["RETAINED_90D","2026-12-21T12:00:00.000Z"],
]) {
  const outcome=await recordHrPerformanceOutcome(db,{
    candidateId:candidate.id,handoffId:handoff.id,idempotencyKey:`outcome-${marker}`,
    marker,resultClass:"observed",qualityFlags:[],occurredAt,actorSpecialistId:reviewer,
  });
  assert.equal(outcome.marker,marker);
}

// Replays of the same outcome are allowed; changing the outcome or actor
// candidate/handoff under its key must fail instead of returning a false receipt.
const exactOutcomeReplay=await recordHrPerformanceOutcome(db,{
  candidateId:candidate.id,handoffId:handoff.id,idempotencyKey:"outcome-FIRST_LIVE_TASK",
  marker:"FIRST_LIVE_TASK",resultClass:"observed",qualityFlags:[],
  occurredAt:"2026-09-22T12:00:00.000Z",actorSpecialistId:reviewer,
});
assert.equal(exactOutcomeReplay.duplicate,true);
await assert.rejects(
  recordHrPerformanceOutcome(db,{
    candidateId:candidate.id,handoffId:handoff.id,idempotencyKey:"outcome-FIRST_LIVE_TASK",
    marker:"RETAINED_7D",resultClass:"observed",actorSpecialistId:reviewer,
  }),
  /outcome_idempotency_conflict/,
);
await assert.rejects(
  recordHrPerformanceOutcome(db,{
    candidateId:secondCandidateId,handoffId:secondHandoff.id,
    idempotencyKey:"outcome-FIRST_LIVE_TASK",
    marker:"FIRST_LIVE_TASK",resultClass:"observed",actorSpecialistId:reviewer,
  }),
  /outcome_idempotency_conflict/,
);

const snapshot=await getHrReadinessSnapshot(db,candidate.id);
assert.equal(snapshot.capability_gaps.filter((gap)=>gap.state==="resolved").length,1);
assert.equal(snapshot.capability_gaps.filter((gap)=>gap.state==="open").length,1);
assert.equal(snapshot.latest_packet.readiness_level,"SUPERVISED_LIVE");
assert.equal(snapshot.latest_decision.decision,"READY_FOR_TEAM");
assert.equal(snapshot.team_handoffs.length,1);
assert.deepEqual(snapshot.performance_outcomes.map((row)=>row.marker),[
  "FIRST_LIVE_TASK","RETAINED_7D","RETAINED_30D","RETAINED_90D",
]);
for (const type of [
  "hr_academy_offered","academy_capability_gap_resolved","academy_supervised_live_started",
  "academy_readiness_packet_ready","hr_readiness_decision_recorded","hr_team_handoff_completed","hr_retained_90d",
]) {
  assert.ok(snapshot.bridge_events.some((event)=>event.type===type),`missing lifecycle event ${type}`);
}

console.log("Hermes Connect HR P0C readiness integration: PASS");
