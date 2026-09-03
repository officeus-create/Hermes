import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [hrLib, candidateApi, reviewerApi, claimApi, accountApi] = await Promise.all([
  read('functions/api/_lib/hr.mjs'),
  read('functions/api/hr/candidate.ts'),
  read('functions/api/hr/reviewer/candidates.ts'),
  read('functions/api/hr/claim.ts'),
  read('functions/api/hermes-connect/account.ts'),
]);

// Private persisted HR model and human-only reviewer gate.
for (const table of [
  'hr_candidates',
  'hr_interview_sessions',
  'hr_interview_answers',
  'hr_events',
  'hr_reviewer_access',
  'hr_reviews',
  'hr_academy_links',
]) {
  assert.match(hrLib, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
}
assert.match(hrLib, /export async function getHrReviewerAccess/);
assert.match(hrLib, /FROM hr_reviewer_access/);
assert.match(hrLib, /active = 1/);
assert.match(hrLib, /hermes_internal_owner_access/);
assert.match(hrLib, /HERMES_INTERNAL_OWNER/);
assert.match(hrLib, /export async function ensureHrAcademyLink/);
assert.doesNotMatch(hrLib, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

// Candidate writes are same-origin, token-bound, rate-limited and idempotent.
assert.match(candidateApi, /ALLOWED_ORIGINS/);
assert.match(candidateApi, /HR_RATE_LIMITS \|\| env\.LEAD_LIMITS/);
assert.match(candidateApi, /X-HR-Candidate-Token/);
assert.match(candidateApi, /Idempotency-Key/);
assert.match(candidateApi, /INSERT OR IGNORE INTO hr_interview_answers/);
assert.match(candidateApi, /INSERT OR IGNORE INTO hr_events/);
assert.match(candidateApi, /candidate_token_invalid/);
assert.doesNotMatch(candidateApi, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

// Reviewer actions require authenticated specialist + persisted capability.
assert.match(reviewerApi, /getAuthenticatedSpecialist/);
assert.match(reviewerApi, /getHrReviewerAccess/);
assert.match(reviewerApi, /sameOriginMutation/);
assert.match(reviewerApi, /hr_reviewer_not_authorized/);
assert.match(reviewerApi, /automated:\s*false/);
assert.match(reviewerApi, /ensureHrAcademyLink/);
assert.doesNotMatch(reviewerApi, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

// Account claim cannot silently bind a candidate to a different Hermes identity.
assert.match(claimApi, /getAuthenticatedSpecialist/);
assert.match(claimApi, /sameOriginMutation/);
assert.match(claimApi, /candidate_token_invalid/);
assert.match(claimApi, /authenticated_email_does_not_match_candidate/);
assert.match(claimApi, /specialist_already_linked_to_another_hr_candidate/);
assert.doesNotMatch(claimApi, /AUTO_HIRE|AUTO_REJECT|REJECT_CANDIDATE|HIRING_DECISION/);

// Portfolio exposure is server-truth only. No email/role/client heuristic may grant HR review.
assert.match(accountApi, /import \{ getHrReviewerAccess \} from "\.\.\/_lib\/hr\.mjs"/);
assert.match(accountApi, /getHrReviewerAccess\(env\.DB, specialist\.id\)/);
assert.match(accountApi, /if \(hrReviewerAccess\) \{/);
assert.match(accountApi, /key:\s*"hr"/);
assert.match(accountApi, /href:\s*"\/demos\/hermes-connect\/hr-admin\.html"/);
assert.match(accountApi, /hr_review:\s*Boolean\(hrReviewerAccess\)/);
assert.match(accountApi, /"Cache-Control":\s*"no-store"/);
assert.doesNotMatch(accountApi, /email\.includes|role\.includes|localStorage|sessionStorage/);

console.log('Hermes Connect HR backend authorization, persistence, identity and human-gate contract: PASS');
