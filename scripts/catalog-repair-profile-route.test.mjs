import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { onRequestGet } from "../functions/businesses/connect/repair-shop/[slug].ts";

const catalogProfileSource = fs.readFileSync(
  path.join(process.cwd(), "src/pages/businesses/[state]/[city]/[slug].astro"),
  "utf8",
);
assert.match(catalogProfileSource, /href="\/logistics\/car-hauling-dispatch\/">Car-hauling dispatch support/);

const shop = {
  id: "shop-qa",
  owner_specialist_id: "owner-qa",
  name: 'Example & <script>alert("x")</script> Repair',
  slug: "example-repair-qa",
  address_line1: "10 Example St",
  city: "Example City",
  state: "AR",
  region: "AR",
  postal_code: "72201",
  phone: "(501) 555-0147",
  website: "https://example.com/repair",
  instagram_url: "https://instagram.com/example-repair",
  facebook_url: "https://facebook.com/example-repair",
  threads_url: "",
};
const db = {
  prepare(sql) {
    const query = sql.replace(/\s+/g, " ").trim();
    return {
      bind() { return this; },
      async run() { return {}; },
      async all() {
        if (query.startsWith("PRAGMA table_info(repair_shops)")) return { results: [] };
        if (query.includes("FROM repair_shop_availability")) {
          return { results: [{ day_of_week: 1, is_open: 1, start_time: "08:00", end_time: "17:00" }] };
        }
        if (query.includes("FROM services s")) {
          return { results: [{ id: "service-qa", name: "Brake Repair", duration_minutes: 60, owner_specialist_id: shop.owner_specialist_id }] };
        }
        return { results: [] };
      },
      async first() {
        if (query.includes("FROM repair_shops")) return shop;
        if (query.includes("FROM hermes_business_contexts")) return { id: "ctx-qa", is_default: 1 };
        return null;
      },
    };
  },
};

const response = await onRequestGet({ env: { DB: db }, params: { slug: shop.slug } });
assert.equal(response.status, 200);
const html = await response.text();
assert.match(html, /<main class="shell" id="main-content">/);
assert.match(html, /<meta name="robots" content="index,follow">/);
assert.match(html, /<link rel="canonical" href="https:\/\/hermeslogisticsus\.com\/businesses\/connect\/repair-shop\/example-repair-qa\/">/);
assert.match(html, /type=claim&amp;business=|type=claim&business=/);
assert.match(html, /type=marketing-package&amp;business=|type=marketing-package&business=/);
assert.match(html, /Business hours/);
assert.match(html, /Monday: 08:00–17:00/);
assert.match(html, /Book an appointment/);
assert.match(html, /\/services\/hermes-connect\/repair-shops\/booking\/\?shop=example-repair-qa/);
assert.match(html, /href="tel:\+?5015550147"/);
assert.match(html, /Directions on Google Maps/);
assert.match(html, /google\.com\/maps\/search\/\?api=1&amp;query=10%20Example%20St%2C%20Example%20City%2C%20AR%2C%2072201/);
assert.match(html, /"telephone":"\(501\) 555-0147"/);
assert.match(html, /https:\/\/instagram\.com\/example-repair/);
assert.match(html, /https:\/\/facebook\.com\/example-repair/);
assert.match(html, /HERMES DIGITAL AUDIT/);
assert.match(html, /Audit ≠ Funnel/);
assert.match(html, /Website/);
assert.match(html, /Google/);
assert.match(html, /Instagram/);
assert.match(html, /Facebook/);
assert.match(html, /Threads/);
assert.match(html, /TikTok/);
assert.match(html, /YouTube/);
assert.match(html, /Telegram/);
assert.match(html, /Internal analytics required/);
assert.match(html, /Owner confirmation required/);
assert.match(html, /Request a full audit/);
assert.match(html, /Organic programming \+ stable baseline/);
assert.match(html, /property="og:url" content="https:\/\/hermeslogisticsus\.com\/businesses\/connect\/repair-shop\/example-repair-qa\/"/);
assert.match(html, /does not indicate a Hermes customer relationship/);
assert.match(html, /Public availability does not establish search engine indexing/);
assert.doesNotMatch(html, /<script>alert\("x"\)<\/script>/);
assert.match(html, /Example &amp; &lt;script&gt;/);
assert.doesNotMatch(html, /client_email|client_phone|next scheduled checkpoint is/);
assert.doesNotMatch(html, /client_name|vin|mileage/);

assert.equal((await onRequestGet({ env: {}, params: { slug: shop.slug } })).status, 503);
assert.equal((await onRequestGet({ env: { DB: db }, params: { slug: "bad/slug" } })).status, 404);
console.log("Catalog Repair Shop public route and carrier handoff contract OK");
