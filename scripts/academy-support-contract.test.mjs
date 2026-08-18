import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACADEMY_SUPPORT_ACTIONS,
  ACADEMY_SUPPORT_LEARNER_MESSAGES_PER_HOUR,
  ACADEMY_SUPPORT_RESPONDER_MESSAGES_PER_HOUR,
  ACADEMY_SUPPORT_THREAD_STATES,
  academySupportCanAccessProgram,
  isAcademySupportAction,
  isAcademySupportThreadState,
} from "../functions/api/_lib/academy-support.mjs";

assert.deepEqual(ACADEMY_SUPPORT_THREAD_STATES, ["open", "answered", "closed"]);
assert.deepEqual(ACADEMY_SUPPORT_ACTIONS, ["answer", "close"]);
assert.equal(ACADEMY_SUPPORT_LEARNER_MESSAGES_PER_HOUR, 20);
assert.equal(ACADEMY_SUPPORT_RESPONDER_MESSAGES_PER_HOUR, 60);
for (const state of ACADEMY_SUPPORT_THREAD_STATES) assert.equal(isAcademySupportThreadState(state), true);
for (const action of ACADEMY_SUPPORT_ACTIONS) assert.equal(isAcademySupportAction(action), true);
for (const forbidden of ["hire", "certify", "pay", "grant_access", "accept_evidence"]) {
  assert.equal(isAcademySupportAction(forbidden), false);
}
assert.equal(academySupportCanAccessProgram({ active: 1, program_scope: null }, "marketing"), true);
assert.equal(academySupportCanAccessProgram({ active: 1, program_scope: "marketing" }, "marketing"), true);
assert.equal(academySupportCanAccessProgram({ active: 1, program_scope: "marketing" }, "us-logistics-operations"), false);
assert.equal(academySupportCanAccessProgram({ active: 0, program_scope: null }, "marketing"), false);

const root = new URL("../", import.meta.url);
const [helper, learnerApi, supportApi, learnerPage, supportPage, runbook] = await Promise.all([
  readFile(new URL("functions/api/_lib/academy-support.mjs", root), "utf8"),
  readFile(new URL("functions/api/academy/support.ts", root), "utf8"),
  readFile(new URL("functions/api/academy/reviewer/support.ts", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/support/index.astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/reviewer/support/index.astro", root), "utf8"),
  readFile(new URL("docs/HERMES_ACADEMY_SUPPORT_ACCESS_RUNBOOK.md", root), "utf8"),
]);

assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_support_access/);
assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_support_threads/);
assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_support_messages/);
assert.match(helper, /author_kind TEXT NOT NULL CHECK \(author_kind IN \('learner','authorized_support'\)\)/);
assert.match(helper, /idx_academy_support_messages_author_rate/);
assert.match(helper, /academySupportMessageRateExceeded/);
assert.match(helper, /COUNT\(\*\) AS message_count/);
assert.match(helper, /60 \* 60 \* 1000/);
assert.match(helper, /getAcademySupportAccess/);
assert.match(helper, /academySupportCanAccessProgram/);
assert.doesNotMatch(helper, /academy_reviewer_access/);
assert.doesNotMatch(helper, /UPDATE academy_enrollments|UPDATE academy_lesson_progress|UPDATE academy_submissions|UPDATE academy_progression_reviews|UPDATE specialists/);

assert.match(learnerApi, /getAuthenticatedSpecialist/);
assert.match(learnerApi, /auth\.specialist\.id/);
assert.match(learnerApi, /support_requires_enrolled_program/);
assert.match(learnerApi, /support_control_fields_not_editable_here/);
assert.match(learnerApi, /ACADEMY_SUPPORT_LEARNER_MESSAGES_PER_HOUR/);
assert.match(learnerApi, /academySupportMessageRateExceeded/);
assert.match(learnerApi, /jsonResponse\(429, \{ success: false, error: "support_rate_limited" \}\)/);
assert.match(learnerApi, /async function requireCurrentEnrollment/);
assert.equal((learnerApi.match(/requireCurrentEnrollment\(/g) || []).length, 3, "new thread and follow-up must both re-check current enrolled state");
assert.match(learnerApi, /INSERT INTO academy_support_threads/);
assert.match(learnerApi, /INSERT INTO academy_support_messages/);
assert.match(learnerApi, /author_kind, body_text/);
assert.match(learnerApi, /'learner'/);
assert.doesNotMatch(learnerApi, /INSERT INTO academy_support_access|UPDATE academy_support_access/);
assert.doesNotMatch(learnerApi, /UPDATE academy_enrollments|UPDATE academy_lesson_progress|UPDATE academy_submissions|UPDATE academy_progression_reviews|UPDATE specialists/);

assert.match(supportApi, /getAcademySupportAccess/);
assert.match(supportApi, /academy_support_not_authorized/);
assert.match(supportApi, /academySupportCanAccessProgram/);
assert.match(supportApi, /support_cannot_answer_own_thread/);
assert.match(supportApi, /'authorized_support'/);
assert.match(supportApi, /support_control_fields_not_editable_here/);
assert.match(supportApi, /ACADEMY_SUPPORT_RESPONDER_MESSAGES_PER_HOUR/);
assert.match(supportApi, /academySupportMessageRateExceeded/);
assert.match(supportApi, /jsonResponse\(429, \{ success: false, error: "support_rate_limited" \}\)/);
assert.doesNotMatch(supportApi, /specialist\.role.*support|specialist\.role.*reviewer|role.*Academy Support|role.*Academy Reviewer/i);
assert.doesNotMatch(supportApi, /INSERT INTO academy_support_access|UPDATE academy_support_access/);
assert.doesNotMatch(supportApi, /UPDATE academy_enrollments|UPDATE academy_lesson_progress|UPDATE academy_submissions|UPDATE academy_progression_reviews|UPDATE specialists/);
assert.doesNotMatch(supportApi, /s\.email\s+AS\s+learner_email/i);
assert.doesNotMatch(supportApi, /support:\s*\{[^}]*email\s*:/s);

for (const page of [learnerPage, supportPage]) {
  assert.match(page, /robots="noindex,nofollow"/);
  assert.doesNotMatch(page, /dataLayer|gtag\(/);
  assert.match(page, /support_rate_limited/);
  assert.match(page, /friendlySupportError/);
}
assert.match(learnerPage, /\/api\/academy\/support/);
assert.match(learnerPage, /Support-state only/);
assert.match(learnerPage, /does not change Academy decisions/i);
assert.match(supportPage, /\/api\/academy\/reviewer\/support/);
assert.match(supportPage, /academy_support_access/);
assert.match(supportPage, /Support-state only/);
assert.match(supportPage, /cannot change enrollment, lesson progress, evidence review, progression, hiring, certification, payment, commercial rights, or live operational access/i);
assert.match(supportPage, /Minimum-data view/);
assert.doesNotMatch(supportPage, /learner_email|data-support-review-email/);

assert.match(runbook, /no self-service provisioning/i);
assert.match(runbook, /academy_support_access/);
assert.match(runbook, /must never grant support power/i);
assert.match(runbook, /academy_reviewer_access/);
assert.match(runbook, /UPDATE academy_support_access/);
assert.match(runbook, /enrollment, lesson progress, A3 submissions, A4 progression, employment, certification, payment and operational access remain unchanged/i);

console.log("Academy A3.1 private learner support contract passed.");
