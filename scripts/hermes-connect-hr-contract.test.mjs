import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/demos/hermes-connect/hr.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/demos/hermes-connect/hr-interview.mjs', import.meta.url), 'utf8');
const queueSync = await readFile(new URL('../public/demos/hermes-connect/hr-review-queue-sync.mjs', import.meta.url), 'utf8');
const adminHtml = await readFile(new URL('../public/demos/hermes-connect/hr-admin.html', import.meta.url), 'utf8');
const adminJs = await readFile(new URL('../public/demos/hermes-connect/hr-admin.mjs', import.meta.url), 'utf8');
const carrierLanding = await readFile(new URL('../public/demos/hermes-connect/hr-carrier-acquisition.html', import.meta.url), 'utf8');

assert.match(html, /Hermes Connect · HR/);
assert.match(html, /Carrier Acquisition/);
assert.match(html, /U\.S\. Sales/);
assert.match(html, /Marketing · Training/);
assert.match(html, /Human gate/i);
assert.match(html, /must not automatically hire, reject or rank candidates/i);
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

assert.match(queueSync, /hermes-connect-hr-review-queue-v1/);
assert.match(queueSync, /syncCompletedCandidateToReviewQueue/);
assert.match(queueSync, /candidate_id/);
assert.match(queueSync, /learner_id/);
assert.match(queueSync, /answers:/);

assert.match(adminHtml, /HR · Human Review Command Center/);
assert.match(adminHtml, /No opaque auto-hiring/);
assert.match(adminHtml, /Academy practice/);
assert.match(adminHtml, /authorize a supervised test/i);
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

assert.match(carrierLanding, /Carrier Acquisition · Hermes Connect HR/);
assert.match(carrierLanding, /track=logistics&vacancy=carrier-acquisition-pilot/);
assert.match(carrierLanding, /Academy participation does not guarantee employment/i);
assert.match(carrierLanding, /no earnings guarantee/i);
assert.match(carrierLanding, /utm_source/);
assert.match(carrierLanding, /creative/);
assert.doesNotMatch(carrierLanding, /guaranteed income|guaranteed employment/i);

console.log('Hermes Connect HR pilot contract: PASS');
