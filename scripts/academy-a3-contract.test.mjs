import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACADEMY_REVIEW_DECISIONS,
  ACADEMY_SUBMISSION_STATES,
  ACADEMY_SUBMISSION_TYPES,
  academyReviewerCanAccessProgram,
  cleanAcademyEvidenceUrl,
  cleanAcademyText,
  isAcademyReviewDecision,
  isAcademySubmissionState,
  isAcademySubmissionType,
} from "../functions/api/_lib/academy.mjs";

assert.deepEqual(ACADEMY_SUBMISSION_TYPES, ["written_reflection", "evidence_link"]);
assert.deepEqual(ACADEMY_SUBMISSION_STATES, ["submitted", "changes_requested", "accepted"]);
assert.deepEqual(ACADEMY_REVIEW_DECISIONS, ["changes_requested", "accepted"]);
for (const type of ACADEMY_SUBMISSION_TYPES) assert.equal(isAcademySubmissionType(type), true);
for (const state of ACADEMY_SUBMISSION_STATES) assert.equal(isAcademySubmissionState(state), true);
for (const decision of ACADEMY_REVIEW_DECISIONS) assert.equal(isAcademyReviewDecision(decision), true);
assert.equal(isAcademySubmissionType("video_upload"), false);
assert.equal(isAcademyReviewDecision("hire"), false);
assert.equal(isAcademySubmissionState("certified"), false);
assert.equal(cleanAcademyEvidenceUrl("https://example.com/evidence?id=1"), "https://example.com/evidence?id=1");
assert.equal(cleanAcademyEvidenceUrl("http://example.com/evidence"), null);
assert.equal(cleanAcademyEvidenceUrl("javascript:alert(1)"), null);
assert.equal(cleanAcademyEvidenceUrl("https://user:pass@example.com/private"), null);
assert.equal(cleanAcademyText("  learner reflection  ", 100), "learner reflection");
assert.equal(academyReviewerCanAccessProgram({ active: 1, program_scope: null }, "marketing"), true);
assert.equal(academyReviewerCanAccessProgram({ active: 1, program_scope: "marketing" }, "marketing"), true);
assert.equal(academyReviewerCanAccessProgram({ active: 1, program_scope: "marketing" }, "us-logistics-operations"), false);
assert.equal(academyReviewerCanAccessProgram({ active: 0, program_scope: null }, "marketing"), false);

const root = new URL("../", import.meta.url);
const [helper, learnerApi, reviewerApi, learnerPage, reviewerPage, dashboard, runbook] = await Promise.all([
  readFile(new URL("functions/api/_lib/academy.mjs", root), "utf8"),
  readFile(new URL("functions/api/academy/submissions.ts", root), "utf8"),
  readFile(new URL("functions/api/academy/reviewer/submissions.ts", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/submissions/index.astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/reviewer/index.astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/dashboard/index.astro", root), "utf8"),
  readFile(new URL("docs/ACADEMY_REVIEWER_MANUAL_PROVISIONING.md", root), "utf8"),
]);

assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_reviewer_access/);
assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_submissions/);
assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_submission_reviews/);
assert.match(helper, /academy_reviewer_access[\s\S]*active INTEGER NOT NULL DEFAULT 0 CHECK \(active IN \(0,1\)\)/);
assert.match(helper, /program_scope TEXT CHECK \(program_scope IS NULL OR program_scope IN \('us-logistics-operations','marketing'\)\)/);
assert.doesNotMatch(helper, /certificate_state|employment_state|readiness_score/);

assert.match(learnerApi, /getAuthenticatedSpecialist/);
assert.match(learnerApi, /submission_control_fields_not_editable_here/);
assert.match(learnerApi, /enrollment\.state !== "enrolled"/);
assert.match(learnerApi, /cleanAcademyEvidenceUrl/);
assert.match(learnerApi, /WHERE specialist_id = \?/);
assert.doesNotMatch(learnerApi, /UPDATE academy_enrollments|UPDATE academy_lesson_progress/);
assert.doesNotMatch(learnerApi, /fetch\([^\n]*evidence/i);
assert.doesNotMatch(learnerApi, /searchParams\.get\(["'](?:learner|specialist|email)/);

assert.match(reviewerApi, /getAcademyReviewerAccess/);
assert.match(reviewerApi, /academy_reviewer_not_authorized/);
assert.match(reviewerApi, /academyReviewerCanAccessProgram/);
assert.match(reviewerApi, /reviewer_cannot_review_own_submission/);
assert.match(reviewerApi, /env\.DB\.batch\(\[insertReview, updateSubmission\]\)/);
assert.match(reviewerApi, /UPDATE academy_submissions/);
assert.doesNotMatch(reviewerApi, /UPDATE academy_enrollments|UPDATE academy_lesson_progress|UPDATE specialists/);
assert.doesNotMatch(reviewerApi, /specialist\.role.*reviewer|role.*Academy Reviewer/i);
assert.doesNotMatch(reviewerApi, /INSERT INTO academy_reviewer_access|UPDATE academy_reviewer_access/);

for (const page of [learnerPage, reviewerPage]) assert.match(page, /robots="noindex,nofollow"/);
assert.match(learnerPage, /\/api\/academy\/submissions/);
assert.match(learnerPage, /Enrolled state/);
assert.match(learnerPage, /does not automatically crawl, download or execute content from evidence links/);
assert.doesNotMatch(learnerPage, /dataLayer|gtag\(/);
assert.match(reviewerPage, /academy_reviewer_access/);
assert.match(reviewerPage, /Reviewer access is not authorized/);
assert.match(reviewerPage, /\/api\/academy\/reviewer\/submissions/);
assert.doesNotMatch(reviewerPage, /dataLayer|gtag\(/);
assert.match(dashboard, /\/services\/hermes-connect\/academy\/submissions\//);

assert.match(runbook, /no self-service provisioning/i);
assert.match(runbook, /<SPECIALIST_ID>/);
assert.match(runbook, /specialists\.role/);
assert.match(runbook, /active = 0/);
assert.doesNotMatch(runbook, /sk-[A-Za-z0-9]|Bearer\s+[A-Za-z0-9._-]+/);

console.log("Academy A3 learner evidence + manually authorized reviewer contract passed.");
