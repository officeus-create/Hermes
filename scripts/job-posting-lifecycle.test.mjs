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
  assert.match(record.expiresAt ?? "", ISO_DATE, `${record.id}: expiresAt must be YYYY-MM-DD`);
  assert.ok(record.datePosted <= record.reviewedAt, `${record.id}: datePosted must not be after reviewedAt`);
  assert.ok(record.reviewedAt <= record.expiresAt, `${record.id}: reviewedAt must not be after expiresAt`);
  assert.ok(record.reviewedAt <= referenceDate, `${record.id}: reviewedAt must not be in the future`);
}

const active = publicVacancyRegistry.filter((record) => record.status === "verified_open" && record.ownerApprovedForPublication);
assert.ok(active.length > 0, "At least one verified-open owner-approved vacancy is expected while JobPosting pages are published");

for (const record of active) {
  assertChronology(record);
  assert.ok(record.expiresAt >= referenceDate, `${record.id}: JobPosting lifecycle expired on ${record.expiresAt}; owner review is required before another release`);

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

console.log(`JobPosting lifecycle gate passed for ${active.length} verified-open role(s) at reference date ${referenceDate}.`);
