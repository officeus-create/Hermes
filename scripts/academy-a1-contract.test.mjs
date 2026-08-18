import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ACADEMY_ENROLLMENT_STATES,
  ACADEMY_LANGUAGES,
  ACADEMY_PARTICIPATION_MODELS,
  ACADEMY_PROGRAMS,
  cleanAcademyTimezone,
  isAcademyEnrollmentState,
  isAcademyLanguage,
  isAcademyParticipationModel,
  isAcademyProgram,
} from "../functions/api/_lib/academy.mjs";

assert.deepEqual(ACADEMY_PROGRAMS, ["us-logistics-operations", "marketing"]);
assert.deepEqual(ACADEMY_ENROLLMENT_STATES, ["applied", "approved", "enrolled", "paused", "completed", "cancelled"]);
assert.deepEqual(ACADEMY_PARTICIPATION_MODELS, ["free_practice", "paid_cohort", "unspecified"]);
assert.deepEqual(ACADEMY_LANGUAGES, ["en", "ru", "uk", "es", "it", "fr"]);
for (const program of ACADEMY_PROGRAMS) assert.equal(isAcademyProgram(program), true);
for (const invalid of ["", "sales", "leadership", "beauty", null, undefined]) assert.equal(isAcademyProgram(invalid), false);
for (const state of ACADEMY_ENROLLMENT_STATES) assert.equal(isAcademyEnrollmentState(state), true);
assert.equal(isAcademyEnrollmentState("hired"), false);
for (const model of ACADEMY_PARTICIPATION_MODELS) assert.equal(isAcademyParticipationModel(model), true);
assert.equal(isAcademyParticipationModel("paid"), false);
for (const lang of ACADEMY_LANGUAGES) assert.equal(isAcademyLanguage(lang), true);
assert.equal(isAcademyLanguage("de"), false);
assert.equal(cleanAcademyTimezone("Europe/Kyiv"), "Europe/Kyiv");
assert.equal(cleanAcademyTimezone("UTC+03:00"), "UTC+03:00");
assert.equal(cleanAcademyTimezone("<script>"), null);

const root = new URL("../", import.meta.url);
const [helper, profileApi, enrollmentApi, entry, auth, dashboard, sharedSession, publicCurriculum, application] = await Promise.all([
  readFile(new URL("functions/api/_lib/academy.mjs", root), "utf8"),
  readFile(new URL("functions/api/academy/profile.ts", root), "utf8"),
  readFile(new URL("functions/api/academy/enrollments.ts", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/index.astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/auth/index.astro", root), "utf8"),
  readFile(new URL("src/pages/services/hermes-connect/academy/dashboard/index.astro", root), "utf8"),
  readFile(new URL("functions/api/_lib/session.mjs", root), "utf8"),
  readFile(new URL("src/data/academy-subsite.ts", root), "utf8"),
  readFile(new URL("src/pages/academy/apply/index.astro", root), "utf8"),
]);

assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_learner_profiles/);
assert.match(helper, /specialist_id TEXT PRIMARY KEY/);
assert.match(helper, /CREATE TABLE IF NOT EXISTS academy_enrollments/);
assert.match(helper, /UNIQUE\(specialist_id, program_slug\)/);
assert.doesNotMatch(helper, /password|email TEXT|payment_provider|employment_status/i);

assert.match(sharedSession, /hermes_session/);
assert.match(sharedSession, /FROM sessions WHERE token = \?/);
assert.match(sharedSession, /FROM specialists WHERE id = \?/);

assert.match(profileApi, /getAuthenticatedSpecialist/);
assert.match(profileApi, /identity_or_progress_fields_not_editable_here/);
assert.match(profileApi, /WHERE specialist_id = \?/);
assert.doesNotMatch(profileApi, /searchParams\.get\(["'](?:learner|specialist|email)/);

assert.match(enrollmentApi, /getAuthenticatedSpecialist/);
assert.match(enrollmentApi, /learner_cannot_set_controlled_enrollment_fields/);
assert.match(enrollmentApi, /VALUES \(\?, \?, \?, 'applied', 'unspecified', NULL/);
assert.match(enrollmentApi, /WHERE specialist_id = \? AND program_slug = \?/);
assert.doesNotMatch(enrollmentApi, /body\.state|body\.participation_model|body\.cohort_code/);
assert.doesNotMatch(enrollmentApi, /UPDATE academy_enrollments/);

for (const page of [entry, auth, dashboard]) assert.match(page, /robots="noindex,nofollow"/);
assert.match(entry, /Application ≠ enrollment/);
assert.match(entry, /\/academy\/us-logistics-operations\//);
assert.match(entry, /\/academy\/marketing\//);
assert.match(auth, /\/api\/auth\/register/);
assert.match(auth, /\/api\/auth\/login/);
assert.match(auth, /role: "Academy Learner"/);
assert.doesNotMatch(auth, /academy_session|academy_password|\/api\/academy\/auth/);
assert.match(dashboard, /\/api\/academy\/profile/);
assert.match(dashboard, /\/api\/academy\/enrollments/);
assert.match(dashboard, /Applied · human review pending/);
assert.doesNotMatch(dashboard, /automatic admission|guaranteed employment|guaranteed income/i);

assert.match(publicCurriculum, /slug: "us-logistics-operations"/);
assert.match(publicCurriculum, /slug: "marketing"/);
assert.match(application, /Application is not enrollment/);

console.log("Academy A1 shared identity + enrollment contract passed.");
