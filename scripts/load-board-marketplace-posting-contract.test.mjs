import assert from "node:assert/strict";
import fs from "node:fs";

const schema = fs.readFileSync(new URL("../functions/api/_lib/load-board-market-posts.mjs", import.meta.url), "utf8");
const posts = fs.readFileSync(new URL("../functions/api/load-board/posts.ts", import.meta.url), "utf8");
const archive = fs.readFileSync(new URL("../functions/api/load-board/posts/[id].ts", import.meta.url), "utf8");
const ui = fs.readFileSync(new URL("../src/components/LoadBoardMarketplaceV2.astro", import.meta.url), "utf8");

assert.match(schema, /CREATE TABLE IF NOT EXISTS hermes_load_market_posts/);
for (const type of ["broker", "shipper", "dealer"]) assert.match(schema, new RegExp(`"${type}"`));
for (const type of ["carrier", "owner_operator", "fleet", "dispatcher"]) assert.match(schema, new RegExp(`"${type}"`));
assert.match(schema, /sameOriginMutation/);

assert.match(posts, /posting_rights_attestation_required/);
assert.match(posts, /company_cannot_post_loads/);
assert.match(posts, /company_cannot_post_trucks/);
assert.match(posts, /INSERT INTO hermes_load_records/);
assert.match(posts, /INSERT INTO hermes_load_market_posts/);
assert.match(posts, /'carrier_only'/);
assert.match(posts, /contact_details_exposed: false/);
assert.match(posts, /booking_created: false/);
assert.match(posts, /provider_write_performed: false/);
assert.doesNotMatch(posts, /send_enabled[^\n]*1/);

assert.match(archive, /WHERE id = \? AND company_id = \?/);
assert.match(archive, /SET status = 'archived'/);
assert.match(archive, /UPDATE hermes_load_records SET status = 'archived'/);

assert.match(ui, /data-lbv2-post="load"/);
assert.match(ui, /data-lbv2-post="capacity"/);
assert.match(ui, /data-lbv2-tab="loads"/);
assert.match(ui, /data-lbv2-tab="trucks"/);
assert.match(ui, /data-lbv2-tab="mine"/);
assert.match(ui, /hermes-load-board-saved-search/);
assert.match(ui, /rights_attested/);
assert.match(ui, /Pearl|hermes-pearl|--hermes-pearl/);

console.log("load-board-marketplace-posting-contract: company posting, rights gate, carrier-only visibility, archive ownership and marketplace controls verified");
