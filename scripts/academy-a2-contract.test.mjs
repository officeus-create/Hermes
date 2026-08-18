import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACADEMY_LESSONS,
  ACADEMY_PROGRESS_STATES,
  isAcademyLesson,
  isAcademyProgressState,
} from "../functions/api/_lib/academy.mjs";

assert.deepEqual(ACADEMY_PROGRESS_STATES, ["not_started", "in_progress", "completed"]);
assert.deepEqual(ACADEMY_LESSONS["us-logistics-operations"], [
  "dispatch-foundations",
  "carrier-broker-communication",
  "equipment-lane-logic",
  "documents-setup",
  "negotiation-practice",
  "operating-rhythm",
]);
assert.deepEqual(ACADEMY_LESSONS.marketing, [
  "positioning-offer",
  "website-first-content",
  "platform-distribution",
  "lead-journey",
  "sales-follow-up",
  "analytics-improvement",
]);
for (const state of ACADEMY_PROGRESS_STATES) assert.equal(isAcademyProgressState(state), true);
assert.equal(isAcademyProgressState("reviewed"), false);
assert.equal(isAcademyLesson("us-logistics-operations", "dispatch-foundations"), true);
assert.equal(isAcademyLesson("marketing", "analytics-improvement"), true);
assert.equal(isAcademyLesson("marketing", "dispatch-foundations"), false);
assert.equal(isAcademyLesson("sales", "lead-journey"), false);

const root = new URL("../", import.meta.url);
const [curriculum, helper, progressApi, programPage, dashboard] = await Promise.all([
  readFile(new URL("src/data/academy-subsite.ts", root), "utf8"),
  readFile(new URL("functions/api/_lib/academy.mjs", root), "utf8"),
  readFile(new URL("functions/api/academy/progress.ts", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/program/[program].astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/dashboard/index.astro", root), "utf8"),
]);

function moduleTitlesFor(block) {
  const modulesStart = block.indexOf("modules: [");
  const modulesEnd = block.indexOf("processTitle", modulesStart);
  assert.ok(modulesStart >= 0 && modulesEnd > modulesStart, "canonical module section must exist");
  return [...block.slice(modulesStart, modulesEnd).matchAll(/title: "([^"]+)"/g)].map((match) => match[1]);
}

const logisticsStart = curriculum.indexOf("logistics: {");
const marketingStart = curriculum.indexOf("marketing: {");
const methodStart = curriculum.indexOf("method: {");
assert.ok(logisticsStart >= 0 && marketingStart > logisticsStart && methodStart > marketingStart);
const logisticsBlock = curriculum.slice(logisticsStart, marketingStart);
const marketingBlock = curriculum.slice(marketingStart, methodStart);
assert.deepEqual(moduleTitlesFor(logisticsBlock), [
  "Dispatch foundations",
  "Carrier and broker communication",
  "Equipment and lane logic",
  "Documents and setup",
  "Negotiation practice",
  "Operating rhythm",
]);
assert.deepEqual(moduleTitlesFor(marketingBlock), [
  "Positioning and offer",
  "Website-first content",
  "Platform distribution",
  "Lead journey",
  "Sales follow-up",
  "Analytics and improvement",
]);

assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_lesson_progress/);
assert.match(helper, /UNIQUE\(specialist_id, program_slug, lesson_id\)/);
assert.doesNotMatch(helper, /quiz_score|reviewer_score|readiness_score|certificate_state|employment_state/);

assert.match(progressApi, /getAuthenticatedSpecialist/);
assert.match(progressApi, /enrollment\.state !== "enrolled"/);
assert.match(progressApi, /enrollment_not_active/);
assert.match(progressApi, /isAcademyLesson\(programSlug, lessonId\)/);
assert.match(progressApi, /ON CONFLICT\(specialist_id, program_slug, lesson_id\)/);
assert.match(progressApi, /WHERE specialist_id = \? AND program_slug = \? AND lesson_id = \?/);
assert.doesNotMatch(progressApi, /UPDATE academy_enrollments/);
assert.doesNotMatch(progressApi, /searchParams\.get\(["'](?:learner|specialist|email)/);

assert.match(programPage, /academySubsitePages/);
assert.match(programPage, /course\.modules\.map/);
assert.match(programPage, /robots="noindex,nofollow"/);
assert.match(programPage, /Lesson progress is personal self-tracking/);
assert.match(programPage, /enrolled = enrollment\?\.state === "enrolled"/);
assert.match(programPage, /\/api\/academy\/progress/);
assert.doesNotMatch(programPage, /guaranteed employment|guaranteed income|certificate awarded/i);

assert.match(dashboard, /\/services\/hermes-connect\/academy\/program\/\$\{encodeURIComponent\(item\.program_slug\)\}/);
assert.match(dashboard, /item\.state === "enrolled" \? "Continue learning" : "Review curriculum"/);

console.log("Academy A2 authenticated curriculum + self-tracked progress contract passed.");
