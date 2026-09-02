import assert from 'node:assert/strict';
import { onRequestPost as candidatePost, onRequestPut as candidatePut } from '../functions/api/hr/candidate.ts';
import { onRequestPut as reviewerPut } from '../functions/api/hr/reviewer/candidates.ts';
import { onRequestPost as claimPost } from '../functions/api/hr/claim.ts';

class MemoryKv {
  constructor() { this.values = new Map(); }
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, String(value)); }
}

class Statement {
  constructor(db, sql, args = []) {
    this.db = db;
    this.sql = sql;
    this.args = args;
  }
  bind(...args) { return new Statement(this.db, this.sql, args); }
  async run() { return this.db.execute(this.sql, this.args, 'run'); }
  async first() { return this.db.execute(this.sql, this.args, 'first'); }
  async all() { return this.db.execute(this.sql, this.args, 'all'); }
}

class MemoryD1 {
  constructor() {
    this.sessions = new Map();
    this.specialists = new Map();
    this.hrCandidates = new Map();
    this.hrSessions = new Map();
    this.hrAnswers = new Map();
    this.hrEvents = new Map();
    this.hrReviewerAccess = new Map();
    this.hrReviews = new Map();
    this.hrAcademyLinks = new Map();
  }

  prepare(sql) { return new Statement(this, sql); }
  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }

  normalized(sql) { return String(sql).replace(/\s+/g, ' ').trim().toLowerCase(); }

  async execute(sql, args, mode) {
    const q = this.normalized(sql);
    if (q.startsWith('create table') || q.startsWith('create index')) return mode === 'all' ? { results: [] } : { success: true };

    if (q.includes('select specialist_id, expires_at from sessions where token = ?')) {
      return this.sessions.get(args[0]) || null;
    }
    if (q.includes('select id, email, name, role, location, bio from specialists where id = ?')) {
      return this.specialists.get(args[0]) || null;
    }

    if (q.includes('from hr_reviewer_access') && q.includes('where specialist_id = ?')) {
      const row = this.hrReviewerAccess.get(args[0]);
      return row?.active === 1 ? row : null;
    }
    if (q.includes('from hermes_internal_owner_access') && q.includes("capability = 'hermes_internal_owner'")) {
      return null;
    }

    if (q.startsWith('insert into hr_candidates')) {
      const [id, accessTokenHash, name, email, telegramHandle, country, language, source, track, attributionJson, consentAt, createdAt, updatedAt] = args;
      this.hrCandidates.set(id, {
        id, access_token_hash: accessTokenHash, name, email, telegram_handle: telegramHandle,
        country, language, source, track, attribution_json: attributionJson, consent_at: consentAt,
        specialist_id: null, status: 'interviewing', created_at: createdAt, updated_at: updatedAt,
      });
      return { success: true };
    }
    if (q.startsWith('insert into hr_interview_sessions')) {
      const [id, candidateId, track, startedAt, updatedAt] = args;
      this.hrSessions.set(candidateId, {
        id, candidate_id: candidateId, track, state: 'in_progress', started_at: startedAt,
        completed_at: null, practice_signals_json: null, recommendation_code: null, updated_at: updatedAt,
      });
      return { success: true };
    }
    if (q.includes('from hr_candidates') && (q.includes('where id = ?') || q.includes('where id=?')) && !q.includes('specialist_id=? and id<>?')) {
      return this.hrCandidates.get(args[0]) || null;
    }
    if (q.includes('select id from hr_candidates') && q.includes('where specialist_id=? and id<>?')) {
      for (const row of this.hrCandidates.values()) {
        if (row.specialist_id === args[0] && row.id !== args[1]) return { id: row.id };
      }
      return null;
    }
    if (q.includes('select id,state from hr_interview_sessions where candidate_id = ?')) {
      const row = this.hrSessions.get(args[0]);
      return row ? { id: row.id, state: row.state } : null;
    }

    if (q.startsWith('insert or ignore into hr_interview_answers')) {
      const [id, candidateId, sessionId, questionId, phase, parentQuestionId, answerText, submittedAt] = args;
      if (!this.hrAnswers.has(id)) {
        this.hrAnswers.set(id, {
          id, candidate_id: candidateId, session_id: sessionId, question_id: questionId,
          phase, parent_question_id: parentQuestionId, answer_text: answerText, submitted_at: submittedAt,
        });
      }
      return { success: true };
    }
    if (q.startsWith('insert or ignore into hr_events')) {
      const [id, candidateId, sessionId, type, occurredAt, payloadJson] = args;
      if (!this.hrEvents.has(id)) {
        this.hrEvents.set(id, {
          id, candidate_id: candidateId, session_id: sessionId, type, occurred_at: occurredAt, payload_json: payloadJson,
        });
      }
      return { success: true };
    }
    if (q.startsWith("update hr_interview_sessions set state='completed'")) {
      const [completedAt, signalsJson, recommendationCode, updatedAt, candidateId] = args;
      const row = this.hrSessions.get(candidateId);
      assert.ok(row, 'candidate interview session must exist');
      Object.assign(row, {
        state: 'completed', completed_at: completedAt, practice_signals_json: signalsJson,
        recommendation_code: recommendationCode, updated_at: updatedAt,
      });
      return { success: true };
    }
    if (q.startsWith("update hr_candidates set status=case when status='interviewing' then 'completed' else status end")) {
      const [updatedAt, candidateId] = args;
      const row = this.hrCandidates.get(candidateId);
      assert.ok(row, 'candidate must exist');
      if (row.status === 'interviewing') row.status = 'completed';
      row.updated_at = updatedAt;
      return { success: true };
    }
    if (q.startsWith('update hr_interview_sessions set updated_at=? where candidate_id=?')) {
      const [updatedAt, candidateId] = args;
      const row = this.hrSessions.get(candidateId);
      if (row) row.updated_at = updatedAt;
      return { success: true };
    }

    if (q.startsWith('insert into hr_reviews')) {
      const [id, candidateId, reviewerSpecialistId, outcome, reason, createdAt] = args;
      this.hrReviews.set(id, {
        id, candidate_id: candidateId, reviewer_specialist_id: reviewerSpecialistId,
        outcome, reason, created_at: createdAt,
      });
      return { success: true };
    }
    if (q.startsWith('update hr_candidates set status=?,updated_at=? where id=?')) {
      const [status, updatedAt, candidateId] = args;
      const row = this.hrCandidates.get(candidateId);
      assert.ok(row, 'candidate must exist for reviewer update');
      row.status = status;
      row.updated_at = updatedAt;
      return { success: true };
    }
    if (q.includes('from hr_reviews') && q.includes('where candidate_id = ?') && q.includes('order by created_at desc')) {
      const rows = [...this.hrReviews.values()]
        .filter((row) => row.candidate_id === args[0])
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      return rows[0] || null;
    }

    if (q.startsWith('update hr_candidates set specialist_id=?,updated_at=? where id=?')) {
      const [specialistId, updatedAt, candidateId] = args;
      const row = this.hrCandidates.get(candidateId);
      assert.ok(row, 'candidate must exist for identity claim');
      row.specialist_id = specialistId;
      row.updated_at = updatedAt;
      return { success: true };
    }
    if (q.startsWith('insert into hr_academy_links')) {
      const [candidateId, specialistId, createdAt, updatedAt] = args;
      this.hrAcademyLinks.set(candidateId, {
        candidate_id: candidateId, specialist_id: specialistId, program_slug: null,
        enrollment_id: null, state: 'claimed', created_at: createdAt, updated_at: updatedAt,
      });
      return { success: true };
    }

    if (mode === 'all') return { results: [] };
    throw new Error(`MemoryD1 does not implement SQL: ${q}`);
  }
}

const origin = 'https://hermeslogisticsus.com';
const candidateId = 'hr_candidate_behavioral_000001';
const candidateToken = 'candidate-token-000000000000000000000000000000000000000000000001';
const submittedAt = '2026-09-02T10:00:00.000Z';
const evidenceId = 'evidence_behavioral_000001';
const eventId = 'evt_behavioral_000001';

const db = new MemoryD1();
const rateLimits = new MemoryKv();
const env = { DB: db, HR_RATE_LIMITS: rateLimits };

const candidateRequest = (body, method = 'POST') => new Request(`${origin}/api/hr/candidate`, {
  method,
  headers: {
    Origin: origin,
    'Content-Type': 'application/json',
    'Idempotency-Key': candidateId,
    'X-HR-Candidate-Token': candidateToken,
    'CF-Connecting-IP': '192.0.2.45',
  },
  body: JSON.stringify(body),
});

const intake = {
  candidate_id: candidateId,
  name: 'Candidate Example',
  email: 'candidate@example.com',
  country: 'Ukraine',
  language: 'en',
  source: 'threads',
  track: 'logistics',
  consent: true,
  submitted_at: submittedAt,
  attribution: { utm_source: 'threads', vacancy: 'carrier-acquisition-pilot', creative: 'reel-03' },
};

const created = await candidatePost({ request: candidateRequest(intake), env });
assert.equal(created.status, 201);
const createdBody = await created.json();
assert.equal(createdBody.success, true);
assert.equal(createdBody.candidate_id, candidateId);
assert.equal(db.hrCandidates.get(candidateId).status, 'interviewing');
assert.equal(db.hrSessions.get(candidateId).state, 'in_progress');

const duplicate = await candidatePost({ request: candidateRequest(intake), env });
assert.equal(duplicate.status, 200);
assert.equal((await duplicate.json()).duplicate, true);
assert.equal(db.hrCandidates.size, 1, 'idempotent intake must not duplicate candidate');

const updateBody = {
  candidate_id: candidateId,
  answers: [{
    evidence_id: evidenceId,
    id: 'application',
    phase: 'APPLICATION',
    answer: 'I would first ask what currently works well, where service breaks down, and what result would justify changing the process.',
    answered_at: '2026-09-02T10:05:00.000Z',
  }],
  events: [{
    event_id: eventId,
    type: 'answer_submitted',
    occurred_at: '2026-09-02T10:05:00.000Z',
    payload: { question_id: 'application', evidence_id: evidenceId },
  }],
  practice_signals: { clarity: 75, evidence: 62, learning: 70, discovery: 88, application: 82 },
  development_recommendation: { code: 'REVIEW_FOR_SUPERVISED_TEST' },
  completed_at: '2026-09-02T10:06:00.000Z',
};

const updated = await candidatePut({ request: candidateRequest(updateBody, 'PUT'), env });
assert.equal(updated.status, 200);
assert.equal((await updated.json()).completed, true);
assert.equal(db.hrAnswers.size, 1);
assert.equal(db.hrEvents.size, 1);
assert.equal(db.hrCandidates.get(candidateId).status, 'completed');
assert.equal(db.hrSessions.get(candidateId).state, 'completed');

const replay = await candidatePut({ request: candidateRequest(updateBody, 'PUT'), env });
assert.equal(replay.status, 200);
assert.equal(db.hrAnswers.size, 1, 'replayed evidence_id must remain exactly once');
assert.equal(db.hrEvents.size, 1, 'replayed event_id must remain exactly once');

const futureExpiry = '2099-01-01T00:00:00.000Z';
db.specialists.set('reviewer-denied', { id: 'reviewer-denied', email: 'denied@example.com', name: 'Denied Reviewer', role: 'Reviewer', location: null, bio: null });
db.sessions.set('session-denied', { specialist_id: 'reviewer-denied', expires_at: futureExpiry });

const reviewRequest = (sessionToken, body) => new Request(`${origin}/api/hr/reviewer/candidates`, {
  method: 'PUT',
  headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: `hermes_session=${sessionToken}` },
  body: JSON.stringify(body),
});

const reviewPayload = {
  candidate_id: candidateId,
  outcome: 'MORE_EVIDENCE',
  reason: 'Candidate should provide one recorded discovery roleplay before any supervised live-work consideration.',
};

const deniedReview = await reviewerPut({ request: reviewRequest('session-denied', reviewPayload), env });
assert.equal(deniedReview.status, 403);
assert.equal((await deniedReview.json()).error, 'hr_reviewer_not_authorized');
assert.equal(db.hrReviews.size, 0, 'unauthorized reviewer must not create review evidence');

db.specialists.set('reviewer-ok', { id: 'reviewer-ok', email: 'reviewer@example.com', name: 'Authorized Reviewer', role: 'Reviewer', location: null, bio: null });
db.sessions.set('session-reviewer', { specialist_id: 'reviewer-ok', expires_at: futureExpiry });
db.hrReviewerAccess.set('reviewer-ok', { specialist_id: 'reviewer-ok', active: 1, created_at: submittedAt, updated_at: submittedAt });

const acceptedReview = await reviewerPut({ request: reviewRequest('session-reviewer', reviewPayload), env });
assert.equal(acceptedReview.status, 200);
const acceptedReviewBody = await acceptedReview.json();
assert.equal(acceptedReviewBody.success, true);
assert.equal(acceptedReviewBody.review.reviewer_specialist_id, 'reviewer-ok');
assert.equal(acceptedReviewBody.review.automated, false);
assert.equal(acceptedReviewBody.candidate_status, 'more_evidence');
assert.equal(db.hrCandidates.get(candidateId).status, 'more_evidence');
assert.equal(db.hrReviews.size, 1);

const claimRequest = (sessionToken) => new Request(`${origin}/api/hr/claim`, {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: `hermes_session=${sessionToken}` },
  body: JSON.stringify({ candidate_id: candidateId, candidate_token: candidateToken }),
});

db.specialists.set('wrong-account', { id: 'wrong-account', email: 'wrong@example.com', name: 'Wrong Account', role: 'Learner', location: null, bio: null });
db.sessions.set('session-wrong', { specialist_id: 'wrong-account', expires_at: futureExpiry });
const wrongClaim = await claimPost({ request: claimRequest('session-wrong'), env });
assert.equal(wrongClaim.status, 409);
assert.equal((await wrongClaim.json()).error, 'authenticated_email_does_not_match_candidate');
assert.equal(db.hrCandidates.get(candidateId).specialist_id, null);

db.specialists.set('candidate-specialist', { id: 'candidate-specialist', email: 'candidate@example.com', name: 'Candidate Example', role: 'Learner', location: 'Kyiv', bio: null });
db.sessions.set('session-candidate', { specialist_id: 'candidate-specialist', expires_at: futureExpiry });
const goodClaim = await claimPost({ request: claimRequest('session-candidate'), env });
assert.equal(goodClaim.status, 200);
const goodClaimBody = await goodClaim.json();
assert.equal(goodClaimBody.identity_linked, true);
assert.equal(goodClaimBody.specialist_id, 'candidate-specialist');
assert.equal(goodClaimBody.latest_review_outcome, 'MORE_EVIDENCE');
assert.equal(goodClaimBody.academy_link.state, 'claimed');
assert.equal(db.hrCandidates.get(candidateId).specialist_id, 'candidate-specialist');
assert.equal(db.hrAcademyLinks.get(candidateId).specialist_id, 'candidate-specialist');

console.log('Hermes Connect HR behavioral API integration: PASS');
