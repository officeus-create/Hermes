import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { ensureAcademySchema } from "../functions/api/_lib/academy.mjs";
import { ensureAcademyProgressionSchema } from "../functions/api/_lib/academy-progression.mjs";
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
  VALUES (?,?,?,'enrolled','internal',NULL,?,?)
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
