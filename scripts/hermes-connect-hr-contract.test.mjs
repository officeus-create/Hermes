import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/demos/hermes-connect/hr.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/demos/hermes-connect/hr-interview.mjs', import.meta.url), 'utf8');
const serverSync = await readFile(new URL('../public/demos/hermes-connect/hr-server-sync.mjs', import.meta.url), 'utf8');
const queueSync = await readFile(new URL('../public/demos/hermes-connect/hr-review-queue-sync.mjs', import.meta.url), 'utf8');
const adminHtml = await readFile(new URL('../public/demos/hermes-connect/hr-admin.html', import.meta.url), 'utf8');
const adminJs = await readFile(new URL('../public/demos/hermes-connect/hr-admin.mjs', import.meta.url), 'utf8');
const adminServer = await readFile(new URL('../public/demos/hermes-connect/hr-admin-server.mjs', import.meta.url), 'utf8');
const carrierLanding = await readFile(new URL('../public/demos/hermes-connect/hr-carrier-acquisition.html', import.meta.url), 'utf8');
const hrLib = await readFile(new URL('../functions/api/_lib/hr.mjs', import.meta.url), 'utf8');
const candidateApi = await readFile(new URL('../functions/api/hr/candidate.ts', import.meta.url), 'utf8');
const reviewerApi = await readFile(new URL('../functions/api/hr/reviewer/candidates.ts', import.meta.url), 'utf8');
const claimApi = await readFile(new URL('../functions/api/hr/claim.ts', import.meta.url), 'utf8');

assert.match(html, /Hermes Connect · HR/);
assert.match(html, /Carrier Acquisition/);
assert.match(html, /U\.S\. Sales/);
assert.match(html, /Marketing · Training/);
assert.match(html, /Human gate/i);
assert.match(html, /must not automatically hire, reject or rank candidates/i);
assert.match(html, /name="name"/);
assert.match(html, /name="email"/);
assert.match(html, /consent to Hermes storing my contact details and job-relevant interview answers/i);
assert.match(html, /hr-server-sync\.mjs/);
assert.match(html, /data-claim-hr/);
assert.match(html, /\.\/academy\.html/);
assert.match(html, /\.\/hr-admin\.html/);
assert.match(html, /hr-review-queue-sync\.mjs/);

assert.match(js, /candidate_id:\s*id/);
assert.match(js, /learner_id:\s*id/);
assert.match(js, /NON_SCORING_CONTEXT_FIELDS[\s\S]*?'country'[\s\S]*?'language'[\s\S]*?'source'[\s\S]*?'attribution'/);
assert.match(js, /PROTECTED_FIELDS_NOT_COLLECTED/);
assert.match(js, /automated_employment_decision:\s*false/);
assert.match(js, /human_review_required:\s*true/);
assert.match(js, /REVIEW_FOR_SUPERVISED_TEST/);
assert.match(js, /ACADEMY_PRACTICE_RECOMMENDED/);
assert.doesNotMatch(js, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

for (const track of ['logistics', 'sales', 'marketing']) {
  assert.match(js, new RegExp(`${track}:\\s*\\{`));
}

for (const question of ['why_now', 'future_goal', 'evidence', 'understanding', 'application']) {
  assert.match(js, new RegExp(`id:\\s*'${question}'`));
}

for (const attributionKey of ['utm_source','utm_campaign','utm_content','vacancy','creative']) {
  assert.match(js, new RegExp(`'${attributionKey}'`));
}

for (const eventType of ['candidate_started','answer_submitted','adaptive_followup_added','interview_completed','sanitized_summary_exported']) {
  assert.match(js, new RegExp(`'${eventType}'`));
}

assert.match(js, /evidence_id:evidenceId/);
assert.match(js, /event_ledger:\s*state\.events/);
assert.match(js, /referrer_host/);

assert.match(serverSync, /\/api\/hr\/candidate/);
assert.match(serverSync, /\/api\/hr\/claim/);
assert.match(serverSync, /Idempotency-Key/);
assert.match(serverSync, /X-HR-Candidate-Token/);
assert.match(serverSync, /local fallback/i);
assert.match(serverSync, /credentials:\s*'same-origin'/);
assert.match(serverSync, /candidate_token/);
assert.doesNotMatch(serverSync, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

assert.match(queueSync, /hermes-connect-hr-review-queue-v1/);
assert.match(queueSync, /syncCompletedCandidateToReviewQueue/);
assert.match(queueSync, /candidate_id/);
assert.match(queueSync, /learner_id/);
assert.match(queueSync, /answers:/);

assert.match(adminHtml, /HR · Human Review Command Center/);
assert.match(adminHtml, /No opaque auto-hiring/);
assert.match(adminHtml, /Academy practice/);
assert.match(adminHtml, /authorize a supervised test/i);
assert.match(adminHtml, /authenticated private D1 queue/i);
assert.match(adminHtml, /hr-admin-server\.mjs/);

assert.match(adminJs, /ACADEMY:\s*'Academy practice'/);
assert.match(adminJs, /MORE_EVIDENCE:\s*'Request more evidence'/);
assert.match(adminJs, /SUPERVISED_TEST:\s*'Authorize supervised test'/);
assert.match(adminJs, /automated:false/);
assert.match(adminJs, /human_review_recorded/);
assert.match(adminJs, /hermes-connect-academy-hr-handoffs-v1/);
assert.match(adminJs, /READY_FOR_ACADEMY_INTAKE/);
assert.match(adminJs, /candidate_id:\s*candidate\.candidate_id/);
assert.match(adminJs, /learner_id:\s*candidate\.learner_id \|\| candidate\.candidate_id/);
assert.match(adminJs, /capability_gaps:\s*capabilityGaps\(candidate\.practice_signals\)/);
assert.match(adminJs, /evidence_ids:/);
assert.match(adminJs, /academy_handoff_prepared/);
assert.doesNotMatch(adminJs, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

assert.match(adminServer, /\/api\/hr\/reviewer\/candidates/);
assert.match(adminServer, /response\.status===401/);
assert.match(adminServer, /response\.status===403/);
assert.match(adminServer, /Local fallback is intentionally disabled on production/i);
assert.match(adminServer, /method:'PUT'/);
assert.match(adminServer, /credentials:'same-origin'/);
assert.match(adminServer, /ACADEMY:\s*'Academy practice'/);
assert.match(adminServer, /MORE_EVIDENCE:\s*'Request more evidence'/);
assert.match(adminServer, /SUPERVISED_TEST:\s*'Authorize supervised test'/);
assert.doesNotMatch(adminServer, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

for (const table of ['hr_candidates','hr_interview_sessions','hr_interview_answers','hr_events','hr_reviewer_access','hr_reviews','hr_academy_links']) {
  assert.match(hrLib, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
}
assert.match(hrLib, /access_token_hash TEXT NOT NULL/);
assert.match(hrLib, /hermes_internal_owner_access/);
assert.match(hrLib, /HERMES_INTERNAL_OWNER/);
assert.match(hrLib, /ensureHrAcademyLink/);
assert.match(hrLib, /us-logistics-operations/);
assert.match(hrLib, /return "marketing"/);
assert.match(hrLib, /awaiting_program/);
assert.match(hrLib, /enrollment_applied/);
assert.doesNotMatch(hrLib, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

assert.match(candidateApi, /ALLOWED_ORIGINS/);
assert.match(candidateApi, /START_RATE_LIMIT/);
assert.match(candidateApi, /HR_RATE_LIMITS \|\| env\.LEAD_LIMITS/);
assert.match(candidateApi, /X-HR-Candidate-Token/);
assert.match(candidateApi, /Idempotency-Key/);
assert.match(candidateApi, /INSERT OR IGNORE INTO hr_interview_answers/);
assert.match(candidateApi, /INSERT OR IGNORE INTO hr_events/);
assert.match(candidateApi, /status='completed'/);
assert.match(candidateApi, /candidate_token_invalid/);
assert.doesNotMatch(candidateApi, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

assert.match(reviewerApi, /getAuthenticatedSpecialist/);
assert.match(reviewerApi, /getHrReviewerAccess/);
assert.match(reviewerApi, /sameOriginMutation/);
assert.match(reviewerApi, /hr_reviewer_not_authorized/);
assert.match(reviewerApi, /ACADEMY:\s*"academy_pending"/);
assert.match(reviewerApi, /MORE_EVIDENCE:\s*"more_evidence"/);
assert.match(reviewerApi, /SUPERVISED_TEST:\s*"supervised_test"/);
assert.match(reviewerApi, /ensureHrAcademyLink/);
assert.match(reviewerApi, /automated:\s*false/);
assert.doesNotMatch(reviewerApi, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

assert.match(claimApi, /getAuthenticatedSpecialist/);
assert.match(claimApi, /sameOriginMutation/);
assert.match(claimApi, /candidate_token_invalid/);
assert.match(claimApi, /authenticated_email_does_not_match_candidate/);
assert.match(claimApi, /specialist_already_linked_to_another_hr_candidate/);
assert.match(claimApi, /ensureHrAcademyLink/);
assert.doesNotMatch(claimApi, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

assert.match(carrierLanding, /Carrier Acquisition · Hermes Connect HR/);
assert.match(carrierLanding, /track=logistics&vacancy=carrier-acquisition-pilot/);
assert.match(carrierLanding, /Academy participation does not guarantee employment/i);
assert.match(carrierLanding, /no earnings guarantee/i);
assert.match(carrierLanding, /utm_source/);
assert.match(carrierLanding, /creative/);
assert.doesNotMatch(carrierLanding, /guaranteed income|guaranteed employment/i);

console.log('Hermes Connect HR private persistence + human review contract: PASS');
