import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACADEMY_LESSON_CONTENT,
  getAcademyLessonContent,
  hasAcademyLessonContent,
} from "../functions/api/_lib/academy-content.mjs";

const conversation = getAcademyLessonContent("us-logistics-operations", "carrier-broker-communication");
const practice = getAcademyLessonContent("us-logistics-operations", "negotiation-practice");
assert.ok(conversation);
assert.ok(practice);
assert.equal(hasAcademyLessonContent("us-logistics-operations", "carrier-broker-communication"), true);
assert.equal(hasAcademyLessonContent("us-logistics-operations", "dispatch-foundations"), false);
assert.equal(practice.assignment?.submission_type, "written_reflection");
assert.equal(practice.assignment?.max_words, 120);
assert.equal(practice.rubric?.length, 6);

const marketingLessonIds = [
  "positioning-offer",
  "website-first-content",
  "platform-distribution",
  "lead-journey",
  "sales-follow-up",
  "analytics-improvement",
];
for (const lessonId of marketingLessonIds) {
  assert.equal(hasAcademyLessonContent("marketing", lessonId), true, `Expected full Marketing lesson: ${lessonId}`);
}
assert.deepEqual(Object.keys(ACADEMY_LESSON_CONTENT.marketing), marketingLessonIds);

const positioning = getAcademyLessonContent("marketing", "positioning-offer");
const websiteFirst = getAcademyLessonContent("marketing", "website-first-content");
const distribution = getAcademyLessonContent("marketing", "platform-distribution");
const leadJourney = getAcademyLessonContent("marketing", "lead-journey");
const followUp = getAcademyLessonContent("marketing", "sales-follow-up");
const analytics = getAcademyLessonContent("marketing", "analytics-improvement");
assert.ok(positioning && websiteFirst && distribution && leadJourney && followUp && analytics);
assert.equal(websiteFirst.assignment?.submission_type, "written_reflection");
assert.equal(websiteFirst.approved_sources?.length, 5);
assert.equal(websiteFirst.rubric?.length, 10);
assert.equal(distribution.rubric?.length, 8);
assert.equal(leadJourney.rubric?.length, 7);
assert.equal(followUp.rubric?.length, 6);
assert.equal(analytics.rubric?.length, 7);
assert.equal(positioning.next?.lesson_id, "website-first-content");
assert.equal(websiteFirst.next?.lesson_id, "platform-distribution");
assert.equal(distribution.next?.lesson_id, "lead-journey");
assert.equal(leadJourney.next?.lesson_id, "sales-follow-up");
assert.equal(followUp.next?.lesson_id, "analytics-improvement");
assert.equal(analytics.next, undefined);
assert.deepEqual(Object.keys(ACADEMY_LESSON_CONTENT), ["us-logistics-operations", "marketing"]);

const root = new URL("../", import.meta.url);
const [contentSource, api, lessonPage, programPage, submissionsPage] = await Promise.all([
  readFile(new URL("functions/api/_lib/academy-content.mjs", root), "utf8"),
  readFile(new URL("functions/api/academy/lesson.ts", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/lesson/index.astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/program/[program].astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/submissions/index.astro", root), "utf8"),
]);

assert.doesNotMatch(contentSource, /\$\d|salary|commission|guaranteed income|guaranteed employment/i);
assert.doesNotMatch(contentSource, /@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|\+?1[ .()-]*\d{3}[ .()-]*\d{3}[ .-]*\d{4}/);
assert.match(contentSource, /synthetic/i);
assert.match(contentSource, /human review/i);
assert.match(contentSource, /Exactly five records/);
assert.match(contentSource, /UTM safety/);
assert.match(contentSource, /duplicate cross-posting/i);
assert.match(contentSource, /explicit human handoff/i);
assert.match(contentSource, /measure the complete path/i);

assert.match(api, /getAuthenticatedSpecialist/);
assert.match(api, /getAcademyEnrollment/);
assert.match(api, /enrollment\.state !== "enrolled"/);
assert.match(api, /lesson_content_not_ready/);
assert.match(api, /getAcademyLessonContent/);
assert.doesNotMatch(api, /INSERT INTO|UPDATE academy_|DELETE FROM/);
assert.doesNotMatch(api, /searchParams\.get\(["'](?:learner|specialist|email)/);

assert.match(lessonPage, /robots="noindex,nofollow"/);
assert.match(lessonPage, /\/api\/academy\/lesson/);
assert.match(lessonPage, /credentials: "same-origin"/);
assert.match(lessonPage, /\/academy\/submissions\/\?\$\{query\.toString\(\)\}/);
assert.match(lessonPage, /data-source-panel/);
assert.match(lessonPage, /renderSources/);
assert.doesNotMatch(lessonPage, /innerHTML|outerHTML|insertAdjacentHTML/);
assert.match(lessonPage, /employment, certification, income, client access/i);

assert.match(programPage, /data-full-lesson-link/);
assert.match(programPage, /carrier-broker-communication/);
assert.match(programPage, /negotiation-practice/);
for (const lessonId of marketingLessonIds) {
  assert.match(programPage, new RegExp(`marketing:${lessonId}`));
}
assert.match(programPage, /Full lesson content requires an existing Enrolled state/);

assert.match(submissionsPage, /requestedProgram/);
assert.match(submissionsPage, /requestedLesson/);
assert.match(submissionsPage, /requestedType/);
assert.match(submissionsPage, /enrolledPrograms\.has\(requestedProgram\)/);
assert.match(submissionsPage, /option\.dataset\.program === requestedProgram/);
assert.match(submissionsPage, /\["written_reflection", "evidence_link"\]\.includes\(requestedType\)/);
assert.doesNotMatch(submissionsPage, /requested.*(?:learner|specialist|email)/i);

console.log("Academy enrolled lesson content contract passed.");
