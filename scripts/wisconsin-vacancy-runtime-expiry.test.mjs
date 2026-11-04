import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { publicVacancyRegistry, isVacancyEligibleForJobPosting } from "../src/data/careers-governance.ts";
import { hasCurrentWisconsinReview, expireWisconsinHtml, expireWisconsinCareersHub, guardedWisconsinResponse } from "../functions/_lib/wisconsin-vacancy-lifecycle.mjs";
import { onRequest } from "../functions/careers/wisconsin-owner-operators/_middleware.ts";

const record = publicVacancyRegistry.find((item) => item.slug === "wisconsin-owner-operators");
assert.ok(record);
assert.equal(record.alwaysOpen, true, "Owner-confirmed continuing recruitment must be explicitly opted in");
assert.equal(record.expiresAt, undefined, "Do not invent a rolling expiration for an always-open position");
assert.equal(record.datePosted, "2026-10-03", "Do not refresh original datePosted for SEO");
assert.equal(record.reviewedAt, "2026-10-19", "Owner approval retains its real date");
assert.equal(record.submissionUrl, "https://hermeslogisticsus.com/careers/wisconsin-owner-operators/#apply");
for (const date of ["2026-10-19", "2027-10-19", "2036-10-19"]) {
  assert.equal(isVacancyEligibleForJobPosting(record, date), true, date);
  assert.equal(hasCurrentWisconsinReview(record, new Date(date + "T18:00:00Z")), true, date);
}
for (const delta of [
  { status: "paused" }, { status: "closed" }, { ownerApprovedForPublication: false },
  { reviewedAt: "2026-10-20" }, { alwaysOpen: false }, { expiresAt: "2026-11-10" },
  { descriptionSourceIds: record.descriptionSourceIds.filter((id) => !id.includes("permanent-open-recruiting")) },
]) {
  assert.equal(hasCurrentWisconsinReview({ ...record, ...delta }, new Date("2026-10-22T18:00:00Z")), false, JSON.stringify(delta));
}
assert.equal(isVacancyEligibleForJobPosting({ ...record, status: "paused" }, "2028-01-01"), false);
assert.equal(isVacancyEligibleForJobPosting({ ...record, ownerApprovedForPublication: false }, "2028-01-01"), false);
assert.equal(isVacancyEligibleForJobPosting({ ...record, expiresAt: "2030-01-01" }, "2028-01-01"), false);
assert.equal(isVacancyEligibleForJobPosting({ ...record, reviewedAt: "2030-01-01" }, "2028-01-01"), false);

const built = await readFile(new URL("../dist/careers/wisconsin-owner-operators/index.html", import.meta.url), "utf8");
assert.match(built, /Owner-confirmed October 19, 2026/);
assert.match(built, /data-owner-operator-apply/);
assert.match(built, /"JobPosting"/);
assert.doesNotMatch(built, /"validThrough"\s*:/);
assert.match(built, /href="mailto:officeus@hermeslogisticsus.com\?subject=Wisconsin%20Owner-Operator%20Application"/);
const paused = expireWisconsinHtml(built);
assert.doesNotMatch(paused, /"JobPosting"/);
assert.doesNotMatch(paused, /data-wi-vacancy-current[\s>]/);
assert.doesNotMatch(paused, /data-wi-vacancy-open-source/);
assert.doesNotMatch(paused, /data-owner-operator-apply-contact/);
assert.match(paused, /data-wi-vacancy-expired(?![^>]*\bhidden)/);
assert.match(paused, /data-wi-vacancy-closed-source(?![^>]*\bhidden)/);
assert.match(paused, /Recruiting temporarily unavailable/);
for (const staleClaim of [
  "continuously recruits Wisconsin owner-operators",
  "Ongoing recruiting",
  "Applications remain open",
  "Recruitment is ongoing",
  "Applications accepted continuously",
  "Yuri's interview call hours",
  "Before you contact recruiting.",
]) assert.ok(!paused.includes(staleClaim), `paused cached HTML leaked current claim: ${staleClaim}`);
assert.doesNotMatch(paused, /"@type":"FAQPage"/);
assert.match(paused, /"@type":"WebPage"/);
assert.match(paused, /Applications are temporarily unavailable/);
assert.doesNotMatch(paused, /\\n\s*<a/);
for (const retained of ['rel="canonical" href="https://hermeslogisticsus.com/careers/wisconsin-owner-operators/"', 'index,follow', '"@type":"BreadcrumbList"', 'officeus@hermeslogisticsus.com']) assert.ok(paused.includes(retained), retained);
assert.ok(built.includes("tel:+14142697377"), "Yuri accepts interviews for Wisconsin owner-operator recruitment");
assert.ok(built.includes("Yuri\'s interview call hours"), "Publish approved time window with Yuri number");
assert.ok(!paused.includes("tel:+14142697377"), "Paused vacancy cannot advertise open interview phone CTAs");
assert.equal(expireWisconsinHtml(paused), paused, "pausing remains idempotent");
const graph = '<script type="application/ld+json">{"@graph":[{"@type":["Thing","JobPosting"]},{"@type":"Organization","name":"Synthetic"}]}</script>';
assert.doesNotMatch(expireWisconsinHtml(graph), /JobPosting/);
assert.match(expireWisconsinHtml(graph), /Organization/);
assert.equal(expireWisconsinHtml('<script type="application/ld+json">invalid</script>'), "");

const hub = await readFile(new URL("../dist/logistics/careers/index.html", import.meta.url), "utf8");
assert.match(hub, /data-vacancy-slug="wisconsin-owner-operators"/);
assert.match(hub, /Verified public vacancies are open/);
assert.doesNotMatch(hub, /View on 100Hires/);
const pausedHub = expireWisconsinCareersHub(hub, 0);
assert.match(pausedHub, /No verified public vacancy is listed today/);
assert.match(pausedHub, /data-current-vacancy-count[^>]*>0<\/strong>/);
assert.match(pausedHub, /Review recruiting information/);

const guarded = await guardedWisconsinResponse(new Response(built, { headers: { "content-type": "text/html", etag: "old", "last-modified": "old", "cache-control": "max-age=86400" } }), false);
assert.equal(guarded.headers.get("cache-control"), "no-store, max-age=0");
assert.equal(guarded.headers.get("etag"), null);
assert.equal(await guarded.text(), paused);
assert.equal(await guardedWisconsinResponse(new Response("Not found", { status: 404 }), false).then((r) => r.status), 404);

const RealDate = globalThis.Date;
globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [Date.parse("2036-10-19T18:00:00Z")])); } };
try {
  for (const method of ["GET", "HEAD"]) {
    const request = new Request("https://hermeslogisticsus.com/careers/wisconsin-owner-operators/?now=2026-10-08", { method, headers: { "if-none-match": "old", "if-modified-since": "old" } });
    const result = await onRequest({ request, next: async (upstream) => {
      assert.equal(upstream.method, "GET");
      assert.equal(upstream.headers.has("if-none-match"), false);
      assert.equal(upstream.headers.has("if-modified-since"), false);
      return new Response(built, { headers: { "content-type": "text/html" } });
    } });
    assert.equal(result.status, 200);
    assert.equal(result.headers.get("cache-control"), "no-store, max-age=0");
    assert.equal(await result.text(), method === "HEAD" ? "" : built);
  }
} finally { globalThis.Date = RealDate; }
console.log("Wisconsin evergreen recruiting lifecycle PASS: owner approval, 10-year continuity, pause/closure, application CTA, no artificial expiration, canonical and GET/HEAD.");
