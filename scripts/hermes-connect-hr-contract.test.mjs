import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/demos/hermes-connect/hr.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/demos/hermes-connect/hr-interview.mjs', import.meta.url), 'utf8');

assert.match(html, /Hermes Connect · HR/);
assert.match(html, /Carrier Acquisition/);
assert.match(html, /U\.S\. Sales/);
assert.match(html, /Marketing · Training/);
assert.match(html, /Human gate/i);
assert.match(html, /must not automatically hire, reject or rank candidates/i);
assert.match(html, /\.\/academy\.html/);

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

console.log('Hermes Connect HR pilot contract: PASS');
