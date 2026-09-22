import assert from 'node:assert/strict';
import { onRequestGet as stateGet, onRequestPut as statePut } from '../functions/api/hr/reviewer/state.ts';

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
    this.reviewerAccess = new Map();
    this.candidates = new Map();
    this.communicationStates = new Map();
    this.communicationEvents = new Map();
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
    if (q.startsWith('create table') || q.startsWith('create index') || q.startsWith('alter table')) {
      return mode === 'all' ? { results: [] } : { success: true };
    }

    if (q.includes('select specialist_id, expires_at from sessions where token = ?')) {
      return this.sessions.get(args[0]) || null;
    }
    if (q.includes('select id, email, name, role, location, bio from specialists where id = ?')) {
      return this.specialists.get(args[0]) || null;
    }
    if (q.includes('from hr_reviewer_access') && q.includes('where specialist_id = ?')) {
      const row = this.reviewerAccess.get(args[0]);
      return row?.active === 1 ? row : null;
    }
    if (q.includes('from hermes_internal_owner_access') && q.includes("capability = 'hermes_internal_owner'")) {
      return null;
    }

    if (q.includes('select id,status from hr_candidates where id=? limit 1')) {
      return this.candidates.get(args[0]) || null;
    }

    if (q.includes('from hr_candidate_communication_state') && q.includes('where candidate_id = ?')) {
      return this.communicationStates.get(args[0]) || null;
    }
    if (q.includes('from hr_candidate_communication_events') && q.includes('where idempotency_key = ?')) {
      return this.communicationEvents.get(args[0]) || null;
    }

    if (q.startsWith('insert into hr_candidate_communication_state')) {
      const [
        candidateId, sourceChannel, currentChannel, currentStage, nextAction, nextActionOwner,
        lastInboundAt, lastOutboundAt, gmailThreadRef, gmailMessageRef, telegramHandoffRef, updatedAt,
      ] = args;
      assert.equal(this.communicationStates.has(candidateId), false, 'communication state must be one row per candidate');
      this.communicationStates.set(candidateId, {
        candidate_id: candidateId,
        source_channel: sourceChannel,
        current_channel: currentChannel,
        current_stage: currentStage,
        next_action: nextAction,
        next_action_owner: nextActionOwner,
        last_inbound_at: lastInboundAt,
        last_outbound_at: lastOutboundAt,
        gmail_thread_ref: gmailThreadRef,
        gmail_message_ref: gmailMessageRef,
        telegram_handoff_ref: telegramHandoffRef,
        updated_at: updatedAt,
      });
      return { success: true };
    }

    if (q.startsWith('update hr_candidate_communication_state')) {
      const [
        currentChannel, currentStage, nextAction, nextActionOwner, lastInboundAt, lastOutboundAt,
        gmailThreadRef, gmailMessageRef, telegramHandoffRef, updatedAt, candidateId,
      ] = args;
      const row = this.communicationStates.get(candidateId);
      assert.ok(row, 'communication state must exist before update');
      Object.assign(row, {
        current_channel: currentChannel,
        current_stage: currentStage,
        next_action: nextAction,
        next_action_owner: nextActionOwner,
        last_inbound_at: lastInboundAt,
        last_outbound_at: lastOutboundAt,
        gmail_thread_ref: gmailThreadRef,
        gmail_message_ref: gmailMessageRef,
        telegram_handoff_ref: telegramHandoffRef,
        updated_at: updatedAt,
      });
      return { success: true };
    }

    if (q.startsWith('insert into hr_candidate_communication_events')) {
      const [
        id, candidateId, idempotencyKey, fromStage, toStage, fromChannel, toChannel,
        nextAction, nextActionOwner, providerRef, occurredAt, createdBySpecialistId, createdAt,
      ] = args;
      assert.equal(this.communicationEvents.has(idempotencyKey), false, 'idempotency key must remain unique');
      this.communicationEvents.set(idempotencyKey, {
        id,
        candidate_id: candidateId,
        idempotency_key: idempotencyKey,
        from_stage: fromStage,
        to_stage: toStage,
        from_channel: fromChannel,
        to_channel: toChannel,
        next_action: nextAction,
        next_action_owner: nextActionOwner,
        provider_ref: providerRef,
        occurred_at: occurredAt,
        created_by_specialist_id: createdBySpecialistId,
        created_at: createdAt,
      });
      return { success: true };
    }

    if (mode === 'all') return { results: [] };
    throw new Error(`MemoryD1 does not implement SQL: ${q}`);
  }
}

const origin = 'https://hermeslogisticsus.com';
const candidateId = 'hr_candidate_channel_state_000001';
const db = new MemoryD1();
const env = { DB: db };
const futureExpiry = '2099-01-01T00:00:00.000Z';

db.candidates.set(candidateId, { id: candidateId, status: 'completed' });
db.specialists.set('reviewer-denied', {
  id: 'reviewer-denied', email: 'denied@example.invalid', name: 'Denied Reviewer', role: 'Reviewer', location: null, bio: null,
});
db.sessions.set('session-denied', { specialist_id: 'reviewer-denied', expires_at: futureExpiry });
db.specialists.set('reviewer-ok', {
  id: 'reviewer-ok', email: 'reviewer@example.invalid', name: 'Authorized Reviewer', role: 'Reviewer', location: null, bio: null,
});
db.sessions.set('session-reviewer', { specialist_id: 'reviewer-ok', expires_at: futureExpiry });
db.reviewerAccess.set('reviewer-ok', {
  specialist_id: 'reviewer-ok', active: 1, created_at: '2026-09-15T00:00:00.000Z', updated_at: '2026-09-15T00:00:00.000Z',
});

const stateRequest = (sessionToken, idempotencyKey, body, method = 'PUT') => new Request(`${origin}/api/hr/reviewer/state`, {
  method,
  headers: {
    Origin: origin,
    'Content-Type': 'application/json',
    Cookie: `hermes_session=${sessionToken}`,
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
  },
  ...(method === 'GET' ? {} : { body: JSON.stringify(body) }),
});

const getRequest = (sessionToken) => new Request(`${origin}/api/hr/reviewer/state?candidate_id=${candidateId}`, {
  method: 'GET',
  headers: { Origin: origin, Cookie: `hermes_session=${sessionToken}` },
});

const needsReply = {
  candidate_id: candidateId,
  source_channel: 'email',
  current_channel: 'email',
  current_stage: 'NEEDS_REPLY',
  next_action: 'REPLY',
  next_action_owner: 'HR',
  last_inbound_at: '2026-09-15T08:00:00.000Z',
  gmail_thread_ref: 'gmail-thread-synthetic-001',
  gmail_message_ref: 'gmail-message-synthetic-001',
  occurred_at: '2026-09-15T08:01:00.000Z',
};

const denied = await statePut({ request: stateRequest('session-denied', 'hr-state-denied-0001', needsReply), env });
assert.equal(denied.status, 403);
assert.equal((await denied.json()).error, 'hr_reviewer_not_authorized');
assert.equal(db.communicationStates.size, 0);

const created = await statePut({ request: stateRequest('session-reviewer', 'hr-state-needs-reply-0001', needsReply), env });
assert.equal(created.status, 201);
const createdBody = await created.json();
assert.equal(createdBody.success, true);
assert.equal(createdBody.duplicate, false);
assert.equal(createdBody.candidate_id, candidateId);
assert.equal(createdBody.communication_state.current_stage, 'NEEDS_REPLY');
assert.equal(createdBody.communication_state.next_action_owner, 'HR');
assert.equal(db.candidates.size, 1, 'state tracking must not create another candidate identity');
assert.equal(db.communicationStates.size, 1, 'exactly one communication state row per candidate');
assert.equal(db.communicationEvents.size, 1);

const replay = await statePut({ request: stateRequest('session-reviewer', 'hr-state-needs-reply-0001', needsReply), env });
assert.equal(replay.status, 200);
assert.equal((await replay.json()).duplicate, true);
assert.equal(db.communicationEvents.size, 1, 'idempotent replay must not duplicate transition evidence');

const waiting = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-waiting-0001', {
    candidate_id: candidateId,
    current_channel: 'email',
    current_stage: 'WAITING_CANDIDATE',
    next_action: 'WAIT_CANDIDATE',
    next_action_owner: 'CANDIDATE',
    last_outbound_at: '2026-09-15T08:10:00.000Z',
    occurred_at: '2026-09-15T08:10:00.000Z',
  }),
  env,
});
assert.equal(waiting.status, 200);
assert.equal((await waiting.json()).communication_state.current_stage, 'WAITING_CANDIDATE');

const missingTelegramEvidence = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-tg-missing-0001', {
    candidate_id: candidateId,
    current_channel: 'telegram',
    current_stage: 'MOVED_TO_TELEGRAM',
    next_action: 'ASSIGN_ASSESSMENT',
    next_action_owner: 'HR',
  }),
  env,
});
assert.equal(missingTelegramEvidence.status, 400);
assert.equal((await missingTelegramEvidence.json()).error, 'telegram_handoff_evidence_required');

const moved = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-tg-handoff-0001', {
    candidate_id: candidateId,
    current_channel: 'telegram',
    current_stage: 'MOVED_TO_TELEGRAM',
    next_action: 'ASSIGN_ASSESSMENT',
    next_action_owner: 'HR',
    telegram_handoff_ref: 'telegram-chat-synthetic:message-0001',
    last_inbound_at: '2026-09-15T08:20:00.000Z',
    occurred_at: '2026-09-15T08:20:00.000Z',
  }),
  env,
});
assert.equal(moved.status, 200);
const movedBody = await moved.json();
assert.equal(movedBody.communication_state.current_channel, 'telegram');
assert.equal(movedBody.communication_state.current_stage, 'MOVED_TO_TELEGRAM');
assert.equal(movedBody.communication_state.next_action, 'ASSIGN_ASSESSMENT');
assert.notEqual(movedBody.communication_state.next_action, 'REPLY');
assert.notEqual(movedBody.communication_state.next_action, 'WAIT_CANDIDATE');
assert.equal(movedBody.communication_state.gmail_thread_ref, 'gmail-thread-synthetic-001', 'Gmail provenance stays as evidence');
assert.equal(movedBody.communication_state.telegram_handoff_ref, 'telegram-chat-synthetic:message-0001');

const staleEmailAction = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-tg-stale-email-0001', {
    candidate_id: candidateId,
    current_channel: 'telegram',
    current_stage: 'ASSESSMENT',
    next_action: 'REPLY',
    next_action_owner: 'HR',
  }),
  env,
});
assert.equal(staleEmailAction.status, 200, 'REPLY can be a generic action outside the handoff stage when explicitly chosen by reviewer');

const assessment = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-assessment-0001', {
    candidate_id: candidateId,
    current_channel: 'telegram',
    current_stage: 'TRAINING_REVIEW',
    next_action: 'REVIEW_ASSESSMENT',
    next_action_owner: 'TRAINER',
    occurred_at: '2026-09-15T09:00:00.000Z',
  }),
  env,
});
assert.equal(assessment.status, 200);
assert.equal((await assessment.json()).communication_state.current_stage, 'TRAINING_REVIEW');

const invalidSkip = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-invalid-skip-0001', {
    candidate_id: candidateId,
    current_channel: 'telegram',
    current_stage: 'ACCEPTED',
    next_action: 'NONE',
    next_action_owner: 'NONE',
  }),
  env,
});
assert.equal(invalidSkip.status, 409);
assert.equal((await invalidSkip.json()).error, 'communication_transition_invalid');

const academy = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-academy-route-0001', {
    candidate_id: candidateId,
    current_channel: 'academy',
    current_stage: 'ACADEMY_ROUTE',
    next_action: 'ROUTE_ACADEMY',
    next_action_owner: 'ACADEMY',
    occurred_at: '2026-09-15T09:10:00.000Z',
  }),
  env,
});
assert.equal(academy.status, 200);
assert.equal((await academy.json()).communication_state.current_stage, 'ACADEMY_ROUTE');

const accepted = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-accepted-0001', {
    candidate_id: candidateId,
    current_channel: 'academy',
    current_stage: 'ACCEPTED',
    next_action: 'NONE',
    next_action_owner: 'NONE',
    occurred_at: '2026-09-15T09:20:00.000Z',
  }),
  env,
});
assert.equal(accepted.status, 200);
const acceptedBody = await accepted.json();
assert.equal(acceptedBody.communication_state.current_stage, 'ACCEPTED');
assert.equal(acceptedBody.communication_state.next_action, 'NONE');
assert.equal(acceptedBody.communication_state.next_action_owner, 'NONE');

const reopenTerminal = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-reopen-0001', {
    candidate_id: candidateId,
    current_channel: 'telegram',
    current_stage: 'ASSESSMENT',
    next_action: 'REVIEW_ASSESSMENT',
    next_action_owner: 'TRAINER',
  }),
  env,
});
assert.equal(reopenTerminal.status, 409);
assert.equal((await reopenTerminal.json()).error, 'communication_transition_invalid');

const forbiddenTranscript = await statePut({
  request: stateRequest('session-reviewer', 'hr-state-private-body-0001', {
    candidate_id: candidateId,
    current_channel: 'academy',
    current_stage: 'CLOSED',
    next_action: 'NONE',
    next_action_owner: 'NONE',
    transcript: 'private text must never be accepted here',
  }),
  env,
});
assert.equal(forbiddenTranscript.status, 400);
assert.equal((await forbiddenTranscript.json()).error, 'raw_candidate_data_not_accepted');

const readback = await stateGet({ request: getRequest('session-reviewer'), env });
assert.equal(readback.status, 200);
const readbackBody = await readback.json();
assert.equal(readbackBody.candidate_id, candidateId);
assert.equal(readbackBody.communication_state.current_stage, 'ACCEPTED');
assert.equal(readbackBody.communication_state.current_channel, 'academy');
assert.equal(readbackBody.communication_state.next_action_owner, 'NONE');
assert.equal(db.candidates.size, 1);
assert.equal(db.communicationStates.size, 1);

console.log('Hermes Connect HR communication-state checks passed.');
