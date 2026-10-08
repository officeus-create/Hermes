import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { publicVacancyRegistry } from "../src/data/careers-governance.ts";
import { hasCurrentWisconsinReview, expireWisconsinHtml, expireWisconsinCareersHub, guardedWisconsinResponse } from "../functions/_lib/wisconsin-vacancy-lifecycle.mjs";
import { onRequest } from "../functions/careers/wisconsin-owner-operators/_middleware.ts";

const record = publicVacancyRegistry.find((item) => item.slug === "wisconsin-owner-operators");
assert.ok(record);
const expiry = Date.parse(`${record.expiresAt}T23:59:59Z`);
assert.equal(hasCurrentWisconsinReview(record, new Date(expiry - 1)), true);
assert.equal(hasCurrentWisconsinReview(record, new Date(expiry)), false);
assert.equal(hasCurrentWisconsinReview(record, new Date(expiry + 86_400_000)), false);
assert.equal(hasCurrentWisconsinReview({ ...record, expiresAt: "2026-11-10" }, new Date(expiry + 1)), false, "extending TTL alone cannot renew the October 3 review");
assert.equal(hasCurrentWisconsinReview({ ...record, reviewedAt: "2026-10-11", expiresAt: "2026-10-18" }, new Date("2026-10-12")), false, "new review requires dated owner evidence");
const renewed = { ...record, reviewedAt: "2026-10-11", expiresAt: "2026-10-18", descriptionSourceIds: [...record.descriptionSourceIds, "owner:2026-10-11:synthetic-review"] };
assert.equal(hasCurrentWisconsinReview(renewed, new Date("2026-10-12")), true);
for (const delta of [{ status: "paused" }, { ownerApprovedForPublication: false }, { reviewedAt: "bad" }, { reviewedAt: "2026-10-12" }]) {
  assert.equal(hasCurrentWisconsinReview({ ...record, ...delta }, new Date("2026-10-08")), false);
}

const built = await readFile(new URL("../dist/careers/wisconsin-owner-operators/index.html", import.meta.url), "utf8");
const expired = expireWisconsinHtml(built); // same old build, later request: no rebuild
assert.doesNotMatch(expired, /"@type":"JobPosting"/);
assert.doesNotMatch(expired, /data-external-job-apply/);
assert.match(expired, /data-wi-vacancy-expired(?![^>]*\bhidden)/);
assert.match(expired, /awaiting a fresh recruiting review/);
assert.match(expired, /id="apply"/);
for (const retained of ['rel="canonical" href="https://hermeslogisticsus.com/careers/wisconsin-owner-operators/"', 'index,follow', '"@type":"BreadcrumbList"', '"@type":"FAQPage"', 'href="tel:+14142697377"', '/logistics/owner-operator-dispatch-support/']) assert.ok(expired.includes(retained), retained);
assert.equal(expireWisconsinHtml(expired), expired, "expiry is idempotent");
const graph = '<script type="application/ld+json">{"@graph":[{"@type":["Thing","JobPosting"]},{"@type":"Organization","name":"Synthetic"}]}</script>';
assert.doesNotMatch(expireWisconsinHtml(graph), /JobPosting/);
assert.match(expireWisconsinHtml(graph), /Organization/);
assert.equal(expireWisconsinHtml('<script type="application/ld+json">invalid</script>'), "");

const hub = await readFile(new URL("../dist/logistics/careers/index.html", import.meta.url), "utf8");
const expiredHub = expireWisconsinCareersHub(hub, 0);
assert.doesNotMatch(expiredHub, /Verified public vacancies are open\./);
assert.doesNotMatch(expiredHub, /href="https:\/\/100hires.com\/j\/G4ek3eN"/);
assert.match(expiredHub, /data-current-vacancy-count[^>]*>0<\/strong>/);
assert.match(expiredHub, /href="\/careers\/wisconsin-owner-operators\/"/);
assert.match(expiredHub, /href="\/logistics\/apply\/\?for=career"/);

const guarded = await guardedWisconsinResponse(new Response(built, { headers: { "content-type": "text/html", etag: "old", "last-modified": "old", "cache-control": "max-age=86400" } }), false);
assert.equal(guarded.headers.get("cache-control"), "no-store, max-age=0");
assert.equal(guarded.headers.get("etag"), null);
assert.equal(guarded.headers.get("last-modified"), null);
assert.equal(await guarded.text(), expired);
const error = new Response("Not found", { status: 404 });
assert.equal(await guardedWisconsinResponse(error, false), error);

// Exercise the real route's server clock and conditional GET/HEAD behavior.
const RealDate = globalThis.Date;
globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [expiry + 1])); } };
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
    assert.equal(await result.text(), method === "HEAD" ? "" : expired);
  }
} finally { globalThis.Date = RealDate; }
console.log("Wisconsin vacancy runtime expiry PASS: before/exact/after TTL, old HTML, dated owner renewal, JSON-LD, canonical/robots/links, cache validators, GET/HEAD.");
