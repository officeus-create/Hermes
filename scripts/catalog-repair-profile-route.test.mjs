import assert from "node:assert/strict";
import { onRequestGet } from "../functions/businesses/connect/repair-shop/[slug].ts";

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
  website: "https://example.com/repair",
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
        return { results: [] };
      },
      async first() {
        if (query.includes("FROM repair_shops")) return shop;
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
assert.match(html, /type=catalog-growth&amp;business=|type=catalog-growth&business=/);
assert.match(html, /Business hours/);
assert.match(html, /Monday: 08:00–17:00/);
assert.match(html, /does not indicate a Hermes customer relationship/);
assert.match(html, /Public availability does not establish search engine indexing/);
assert.doesNotMatch(html, /<script>alert\("x"\)<\/script>/);
assert.match(html, /Example &amp; &lt;script&gt;/);
assert.doesNotMatch(html, /client_email|client_phone|next scheduled checkpoint is/);

assert.equal((await onRequestGet({ env: {}, params: { slug: shop.slug } })).status, 503);
assert.equal((await onRequestGet({ env: { DB: db }, params: { slug: "bad/slug" } })).status, 404);
console.log("Catalog Repair Shop public route contract OK");
