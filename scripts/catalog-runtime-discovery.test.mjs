import assert from "node:assert/strict";
import fs from "node:fs";
import { repairCatalogPublication } from "../functions/api/_lib/repair-catalog-publication.mjs";
import { homeServiceCatalogPublication } from "../functions/api/_lib/home-service-catalog-publication.mjs";
import { addRepairCatalogLinks, addHomeServiceCatalogLinks, onRequestGet as index } from "../functions/businesses/index.ts";
import { onRequestGet as profile } from "../functions/businesses/connect/repair-shop/[slug].ts";
import { onRequestGet as sitemap } from "../functions/sitemap-connect-catalog.xml.ts";
import { onRequestGet as companies } from "../functions/api/catalog/companies.ts";

// Public synthetic fixture only; no production CRM/contact data.
const row = { id: "fixture-shop", name: "Fixture & Repair", slug: "kittle-s-garage-a146544", catalog_opt_in: 1, city: "Fixture City", state: "AR", owner_specialist_id: "private-owner" };
const kittle = { id: "public-fixture", name: "Kittle’s Garage", slug: "kittle-s-garage-a146544", catalog_opt_in: 1 };
assert.equal(repairCatalogPublication(kittle).path, "/businesses/connect/repair-shop/kittle-s-garage-a146544/");
const path = "/businesses/connect/repair-shop/kittle-s-garage-a146544/";
const html = fs.readFileSync("dist/businesses/index.html", "utf8");
function db(candidate) {
  return { prepare(sql) {
    return { bind() { return this; }, async run() { return {}; },
      async first() { return sql.includes("FROM repair_shops") ? candidate : null; },
      async all() { return { results: sql.includes("FROM repair_shops") && candidate ? [candidate] : [] }; },
    };
  } };
}
const staticResponse = () => Promise.resolve(new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "ETag": "old", "Content-Length": "1" } }));
for (const candidate of [row, { ...row, catalog_opt_in: 0 }, { ...row, slug: "bad/slug" }, { ...row, name: "" }, { ...row, id: "" }, null]) {
  const env = { DB: db(candidate) };
  const eligible = repairCatalogPublication(candidate).eligible;
  const root = await index({ env, next: staticResponse });
  const rootHtml = await root.text();
  const xml = await sitemap({ env });
  const xmlText = await xml.text();
  const detail = await profile({ env, params: { slug: row.slug } });
  const feed = await companies({ env });
  const feedBody = await feed.json();
  assert.equal(rootHtml.includes(`href="${path}"`), eligible);
  assert.equal(xmlText.includes(path), eligible);
  assert.equal(feedBody.companies.length, eligible ? 1 : 0);
  assert.equal(detail.status, eligible ? 200 : 404);
  for (const response of [root, xml, detail, feed]) assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(root.headers.has("ETag"), false);
  assert.equal(root.headers.has("Content-Length"), false);
  assert.doesNotMatch(rootHtml, /private-owner|owner_specialist_id/);
  if (eligible) {
    assert.equal(rootHtml.match(/data-runtime-repair-links/g)?.length, 1);
    assert.equal(rootHtml.match(/href="\/businesses\/connect\/repair-shop\/kittle-s-garage-a146544\/"/g)?.length, 1);
    assert.equal(rootHtml.match(/data-catalog-card/g)?.length, html.match(/data-catalog-card/g)?.length);
    assert.equal(addRepairCatalogLinks(rootHtml, [row, row]), rootHtml);
    assert.match(rootHtml, /Fixture &amp; Repair — Fixture City, AR/);
    const detailHtml = await detail.text();
    assert.equal(detailHtml.match(/rel="canonical"/g)?.length, 1);
    assert.match(detailHtml, /<meta name="robots" content="index,follow">/);
    assert.match(detailHtml, /https:\/\/hermeslogisticsus.com\/businesses\/connect\/repair-shop\/kittle-s-garage-a146544\//);
    const schema = JSON.parse(detailHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema["@type"], "AutoRepair");
    assert.equal(schema.name, row.name);
    assert.equal("aggregateRating" in schema, false);
    assert.equal("review" in schema, false);
    assert.doesNotMatch(detailHtml, /private-owner|owner_specialist_id/);
  } else assert.match(detail.headers.get("X-Robots-Tag"), /noindex/);
}
const mzmRow = {
  company_name: "MZM Junk Removal",
  slug: "mzm-junk-removal",
  city: "Roseville",
  state: "CA",
  catalog_opt_in: 0,
  catalog_status: "verified_public",
  management_mode: "hermes_managed",
  catalog_publication_basis: "hermes_managed_client_public_facts",
};
assert.equal(homeServiceCatalogPublication(mzmRow).eligible, true);
const withMzm = addHomeServiceCatalogLinks(html, [mzmRow]);
assert.match(withMzm, /data-runtime-home-service-links/);
assert.match(withMzm, /href="\/businesses\/connect\/company\/mzm-junk-removal\/"/);
assert.match(withMzm, /MZM Junk Removal — Roseville, CA/);
assert.equal(addHomeServiceCatalogLinks(withMzm, [mzmRow, mzmRow]), withMzm);
assert.equal(addHomeServiceCatalogLinks(html, [{ ...mzmRow, catalog_status: "managed_private", catalog_publication_basis: "owner_consent_pending" }]), html);

assert.equal(addRepairCatalogLinks(html, [{ ...row, slug: "other-opted-in" }]), html);
assert.equal(repairCatalogPublication({ ...row, slug: "other-opted-in" }).eligible, true);
const escaped = addRepairCatalogLinks(html, [{ ...row, name: '</a><script>alert("x")</script>' }, row]);
assert.doesNotMatch(escaped, /<script>alert/);
assert.equal(escaped.match(/href="\/businesses\/connect\/repair-shop\/kittle-s-garage-a146544\/"/g)?.length, 1);
for (const env of [{}, { DB: { prepare() { throw new Error("test unavailable"); } } }]) {
  const response = await index({ env, next: staticResponse });
  assert.equal(await response.text(), html);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
}
const unavailable = await index({ env: {}, next: () => Promise.resolve(new Response("fail", { status: 503 })) });
assert.equal(unavailable.status, 503);
console.log("Runtime Catalog discovery: consent, shared readiness, raw HTML, withdrawal, canonical, robots, schema and privacy PASS");
