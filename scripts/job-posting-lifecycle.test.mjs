import assert from "node:assert/strict";
import { publicVacancyRegistry } from "../src/data/careers-governance.ts";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const referenceDate = process.env.JOB_POSTING_REFERENCE_DATE || new Date().toISOString().slice(0, 10);

assert.match(referenceDate, ISO_DATE, "JOB_POSTING_REFERENCE_DATE must be YYYY-MM-DD when supplied");

function daysBetween(fromIso, toIso) {
  const from = new Date(`${fromIso}T00:00:00Z`).getTime();
  const to = new Date(`${toIso}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

function assertChronology(record) {
  assert.match(record.datePosted ?? "", ISO_DATE, `${record.id}: datePosted must be YYYY-MM-DD`);
  assert.match(record.reviewedAt ?? "", ISO_DATE, `${record.id}: reviewedAt must be YYYY-MM-DD`);
  assert.ok(record.datePosted <= record.reviewedAt, `${record.id}: datePosted must not be after reviewedAt`);
  if (record.alwaysOpen) {
    assert.equal(record.expiresAt, undefined, `${record.id}: ongoing recruiting must not invent an expiration`);
    assert.ok(record.descriptionSourceIds?.includes(`owner:${record.reviewedAt}:permanent-open-recruiting`), `${record.id}: ongoing recruiting requires dated owner evidence`);
  } else {
    assert.match(record.expiresAt ?? "", ISO_DATE, `${record.id}: finite vacancy expiresAt must be YYYY-MM-DD`);
    assert.ok(record.reviewedAt <= record.expiresAt, `${record.id}: reviewedAt must not be after expiresAt`);
  }
  assert.ok(record.reviewedAt <= referenceDate, `${record.id}: reviewedAt must not be in the future`);
}

const active = publicVacancyRegistry.filter((record) => record.status === "verified_open" && record.ownerApprovedForPublication);

for (const record of active) {
  assertChronology(record);
  if (record.alwaysOpen) {
    console.log(`JobPosting ongoing (no artificial TTL): ${record.id}; last owner approval ${record.reviewedAt}`);
    continue;
  }
  if (record.expiresAt < referenceDate) {
    console.warn(`::warning title=JobPosting expired::${record.id} expired on ${record.expiresAt}; structured JobPosting must remain suppressed until a fresh owner review.`);
    continue;
  }

  const daysUntilExpiry = daysBetween(referenceDate, record.expiresAt);
  if (daysUntilExpiry <= 7) {
    console.warn(`::warning title=JobPosting review due::${record.id} expires in ${daysUntilExpiry} day(s) on ${record.expiresAt}; verify the role is still genuinely open before extending or republishing.`);
  }
}

const synthetic = {
  id: "fixture-role",
  datePosted: "2026-08-01",
  reviewedAt: "2026-08-10",
  expiresAt: "2026-09-01",
};
assert.doesNotThrow(() => assertChronology(synthetic));
assert.throws(() => assertChronology({ ...synthetic, datePosted: "2026-08-11" }), /datePosted must not be after reviewedAt/);
assert.throws(() => assertChronology({ ...synthetic, reviewedAt: "2026-09-02" }), /reviewedAt must not be after expiresAt/);
assert.throws(() => assertChronology({ ...synthetic, alwaysOpen: true }), /ongoing recruiting must not invent an expiration/);
assert.doesNotThrow(() => assertChronology({ ...synthetic, alwaysOpen: true, expiresAt: undefined, descriptionSourceIds: ["owner:2026-08-10:permanent-open-recruiting"] }));

console.log(`JobPosting lifecycle gate passed for ${active.length} owner-approved role record(s) at reference date ${referenceDate}; expired records are warning-only because publication eligibility now fails closed.`);

await import("./wisconsin-vacancy-runtime-expiry.test.mjs");
