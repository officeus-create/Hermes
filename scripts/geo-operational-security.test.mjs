import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  assertGeoOperationalBundleSecurity,
  assertGeoOperationalReportPrivacy,
  geoOperationalSecurityLimits,
  stableGeoJsonStringify,
} from "../src/data/geo-operational-security.ts";
import {
  buildSecureGeoOperationalScorecardReport,
  serializeSecureGeoOperationalScorecardReport,
} from "../src/data/geo-operational-secure-runner.ts";
import { geoOperationalScorecardInputVersion } from "../src/data/geo-operational-scorecard.ts";

const baseBundle = {
  schema_version: geoOperationalScorecardInputVersion,
  as_of: "2026-08-18T12:00:00Z",
  ai_visibility_evidence_class: "owner_provided_handoff",
  ai_observations: [],
  search_checkpoints: [],
  analytics_events: [],
  outcomes: [],
};

assert.doesNotThrow(() => assertGeoOperationalBundleSecurity(baseBundle));
assert.equal(geoOperationalSecurityLimits.maxInputBytes, 5 * 1024 * 1024);
assert.equal(geoOperationalSecurityLimits.rowLimits.ai_observations, 1000);
assert.equal(geoOperationalSecurityLimits.rowLimits.search_checkpoints, 5000);

for (const field of [
  "email",
  "phone",
  "full_name",
  "mc_number",
  "usdot_number",
  "vin",
  "account_id",
  "property_id",
  "stream_id",
  "access_token",
  "cookie",
  "password",
  "conversation",
  "raw_response",
  "query_text",
  "raw_query",
  "search_term",
  "lead_id",
  "revenue_amount",
]) {
  assert.throws(
    () => assertGeoOperationalBundleSecurity({ ...baseBundle, [field]: "private" }),
    /Private\/raw operational field is forbidden/,
    `${field} must fail preflight`,
  );
}

const polluted = JSON.parse('{"schema_version":"geo_operational_scorecard_v2","as_of":"2026-08-18T12:00:00Z","ai_visibility_evidence_class":"owner_provided_handoff","ai_observations":[],"search_checkpoints":[],"analytics_events":[],"outcomes":[],"__proto__":{"polluted":true}}');
assert.throws(() => assertGeoOperationalBundleSecurity(polluted), /Reserved object key is forbidden/);

for (const invalidTimestamp of [
  "2026-08-18T12:00:00",
  "2026-08-18 12:00:00",
  "2026-08-18",
  "not-a-date",
]) {
  assert.throws(
    () => assertGeoOperationalBundleSecurity({ ...baseBundle, as_of: invalidTimestamp }),
    /explicit timezone/,
  );
}
assert.doesNotThrow(() => assertGeoOperationalBundleSecurity({ ...baseBundle, as_of: "2026-08-18T15:00:00+03:00" }));

const badObservedAt = structuredClone(baseBundle);
badObservedAt.ai_observations.push({ observed_at: "2026-08-18T12:00:00" });
assert.throws(() => assertGeoOperationalBundleSecurity(badObservedAt), /explicit timezone/);

for (const badPath of [
  "//evil.example/path",
  "/owner/?private=1",
  "/owner/#private",
  "https://example.com/owner/",
]) {
  const bad = structuredClone(baseBundle);
  bad.search_checkpoints.push({ page_path: badPath });
  assert.throws(() => assertGeoOperationalBundleSecurity(bad), /clean site-relative path/);
}

const tooManyAiRows = { ...baseBundle, ai_observations: Array.from({ length: 1001 }, () => null) };
assert.throws(() => assertGeoOperationalBundleSecurity(tooManyAiRows), /exceeds 1000 rows/);

const oversized = { ...baseBundle, padding: "x".repeat(geoOperationalSecurityLimits.maxInputBytes + 100) };
assert.throws(() => assertGeoOperationalBundleSecurity(oversized), /exceeds .* bytes/);

let deeplyNested = {};
for (let index = 0; index < 20; index += 1) deeplyNested = { safe: deeplyNested };
assert.throws(
  () => assertGeoOperationalBundleSecurity({ ...baseBundle, extra: deeplyNested }),
  /exceeds max depth/,
);

assert.throws(
  () => assertGeoOperationalReportPrivacy({ ok: true, email: "private@example.com" }),
  /Private\/raw field leaked into GEO report/,
);
assert.throws(
  () => assertGeoOperationalReportPrivacy({ nested: { raw_response: "forbidden" } }),
  /Private\/raw field leaked into GEO report/,
);
assert.doesNotThrow(() => assertGeoOperationalReportPrivacy({ revenueReconciledWins: 2, qualifiedLeads: 3 }));

assert.equal(
  stableGeoJsonStringify({ z: 1, a: { y: 2, b: 3 } }, 0),
  '{"a":{"b":3,"y":2},"z":1}',
);

const searchA = {
  source: "google",
  page_path: "/services/seo/",
  discovery_type: "non_branded",
  start_date: "2026-08-03",
  end_date: "2026-08-18",
  impressions: 50,
  clicks: 2,
  evidence_class: "owner_provided_handoff",
};
const searchB = {
  source: "bing",
  page_path: "/logistics/car-hauling-dispatch/",
  discovery_type: "branded",
  start_date: "2026-08-03",
  end_date: "2026-08-18",
  impressions: 20,
  clicks: 1,
  evidence_class: "owner_provided_handoff",
};
const ordered = { ...baseBundle, search_checkpoints: [searchA, searchB] };
const reversed = { ...baseBundle, search_checkpoints: [searchB, searchA] };
const serializedOrdered = serializeSecureGeoOperationalScorecardReport(ordered);
const serializedReversed = serializeSecureGeoOperationalScorecardReport(reversed);
assert.equal(serializedOrdered, serializedReversed, "equivalent input row order must produce deterministic output");
assert.equal(
  createHash("sha256").update(serializedOrdered).digest("hex"),
  createHash("sha256").update(serializedReversed).digest("hex"),
  "deterministic report snapshot hashes must match",
);
assert.doesNotThrow(() => assertGeoOperationalReportPrivacy(buildSecureGeoOperationalScorecardReport(ordered)));

const temp = mkdtempSync(join(tmpdir(), "geo-ops-security-"));
try {
  const validPath = join(temp, "valid.json");
  const invalidPath = join(temp, "invalid.json");
  writeFileSync(validPath, JSON.stringify(baseBundle), "utf8");
  writeFileSync(invalidPath, JSON.stringify({ ...baseBundle, as_of: "2026-08-18T12:00:00" }), "utf8");

  const validRun = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "scripts/geo-operational-scorecard.mjs", validPath],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(validRun.status, 0, validRun.stderr);
  assert.doesNotThrow(() => JSON.parse(validRun.stdout));

  const invalidRun = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "scripts/geo-operational-scorecard.mjs", invalidPath],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.notEqual(invalidRun.status, 0, "invalid bundle must produce a non-zero CLI exit");
  assert.match(invalidRun.stderr, /explicit timezone/);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

const productionFiles = [
  "src/data/geo-operational-scorecard.ts",
  "src/data/geo-operational-security.ts",
  "src/data/geo-operational-secure-runner.ts",
  "scripts/geo-operational-scorecard.mjs",
];
for (const file of productionFiles) {
  const source = readFileSync(file, "utf8");
  assert.ok(!/\bfetch\s*\(/.test(source), `${file} must not call fetch`);
  assert.ok(!/from\s+["'](?:node:)?https?["']/.test(source), `${file} must not import HTTP clients`);
  assert.ok(!/\b(?:writeFile|appendFile|unlink|rm|rename|mkdir)(?:Sync)?\s*\(/.test(source), `${file} must not write production/local state`);
  assert.ok(!/\b(?:D1Database|KVNamespace|R2Bucket)\b/.test(source), `${file} must not bind production persistence`);
}

console.log("GEO operational security, deterministic output and fail-closed CLI passed");
