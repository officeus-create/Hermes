import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACADEMY_PROGRESSION_DECISIONS,
  academyProgressionStateFromDecision,
  isAcademyProgressionDecision,
} from "../functions/api/_lib/academy-progression.mjs";

assert.deepEqual(ACADEMY_PROGRESSION_DECISIONS, ["continue", "changes_requested", "completed"]);
for (const decision of ACADEMY_PROGRESSION_DECISIONS) assert.equal(isAcademyProgressionDecision(decision), true);
for (const forbidden of ["hire", "certified", "paid", "grant_access", "promoted"]) assert.equal(isAcademyProgressionDecision(forbidden), false);
assert.equal(academyProgressionStateFromDecision("continue"), "in_progress");
assert.equal(academyProgressionStateFromDecision("changes_requested"), "changes_requested");
assert.equal(academyProgressionStateFromDecision("completed"), "completed");

const root = new URL("../", import.meta.url);
const [helper, learnerApi, reviewerApi, learnerPage, reviewerPage, academyHub] = await Promise.all([
  readFile(new URL("functions/api/_lib/academy-progression.mjs", root), "utf8"),
  readFile(new URL("functions/api/academy/progression.ts", root), "utf8"),
  readFile(new URL("functions/api/academy/reviewer/progression.ts", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/progression/index.astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/reviewer/progression/index.astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/index.astro", root), "utf8"),
]);

assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_progression_reviews/);
assert.match(helper, /reviewer_specialist_id TEXT NOT NULL/);
assert.match(helper, /decision TEXT NOT NULL CHECK \(decision IN \('continue','changes_requested','completed'\)\)/);
assert.match(helper, /INSERT|SELECT/);
assert.doesNotMatch(helper, /UPDATE academy_enrollments|UPDATE academy_lesson_progress|UPDATE academy_submissions|UPDATE specialists/);
assert.match(helper, /FROM academy_submissions/);
assert.match(helper, /listAcademyLessonProgress/);
assert.doesNotMatch(helper, /text_content|evidence_url/);

assert.match(learnerApi, /getAuthenticatedSpecialist/);
assert.match(learnerApi, /specialist\.id/);
assert.match(learnerApi, /getAcademyProgressionSummary/);
assert.doesNotMatch(learnerApi, /searchParams\.get\(["'](?:learner|specialist|email)/);
assert.doesNotMatch(learnerApi, /onRequestPut|INSERT INTO|UPDATE /);

assert.match(reviewerApi, /getAcademyReviewerAccess/);
assert.match(reviewerApi, /academy_reviewer_not_authorized/);
assert.match(reviewerApi, /academyReviewerCanAccessProgram/);
assert.match(reviewerApi, /reviewer_cannot_review_own_progression/);
assert.match(reviewerApi, /INSERT INTO academy_progression_reviews/);
assert.match(reviewerApi, /progression_control_fields_not_editable_here/);
assert.match(reviewerApi, /summary\.enrollment_state !== "enrolled"/);
assert.doesNotMatch(reviewerApi, /UPDATE academy_enrollments|UPDATE academy_lesson_progress|UPDATE academy_submissions|UPDATE specialists/);
assert.doesNotMatch(reviewerApi, /specialist\.role.*reviewer|role.*Academy Reviewer/i);
assert.doesNotMatch(reviewerApi, /INSERT INTO academy_reviewer_access|UPDATE academy_reviewer_access/);

for (const page of [learnerPage, reviewerPage, academyHub]) {
  assert.match(page, /robots="noindex,nofollow"/);
  assert.doesNotMatch(page, /dataLayer|gtag\(/);
}
assert.match(learnerPage, /\/api\/academy\/progression/);
assert.match(learnerPage, /never make the progression decision automatically/i);
assert.match(learnerPage, /not employment, certification, guaranteed income, commercial entitlement, client access/i);
assert.match(reviewerPage, /\/api\/academy\/reviewer\/progression/);
assert.match(reviewerPage, /academy_reviewer_access/);
assert.match(reviewerPage, /No automatic completion/);
assert.match(reviewerPage, /Mark Academy program completed/);
assert.match(reviewerPage, /does not change enrollment, lesson progress, A3 evidence state, hiring\/candidate state, certification, payments, commercial rights, or live operational access/i);

assert.match(academyHub, /\/services\/hermes-connect\/academy\/progression\//);
assert.match(academyHub, /\/services\/hermes-connect\/academy\/submissions\//);
assert.match(academyHub, /\/services\/hermes-connect\/academy\/reviewer\//);
assert.match(academyHub, /\/services\/hermes-connect\/academy\/reviewer\/progression\//);
assert.match(academyHub, /Manually authorized reviewers only/);
assert.match(academyHub, /academy_reviewer_access/);
assert.match(academyHub, /A1 provides shared learner identity and enrollment/);
assert.match(academyHub, /A4 adds program-level human progression/);
assert.match(academyHub, /Commercial access remains a separate A5 gate/);
assert.doesNotMatch(academyHub, /A1 stores learner identity and enrollment state only/);

console.log("Academy A4 human-controlled progression contract passed.");
