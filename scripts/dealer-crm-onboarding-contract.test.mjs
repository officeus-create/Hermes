import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const preset = read("src/data/hermes-connect-dealer-pilots.ts");
const catalog = read("src/data/repair-shop-directory.ts");
const companySchema = read("functions/api/_lib/hermes-company-profiles.mjs");
const companyApi = read("functions/api/hermes-connect/company.ts");
const transportSchema = read("functions/api/_lib/dealer-transport-requests.mjs");
const transportApi = read("functions/api/hermes-connect/dealer/transport-requests.ts");
const connections = read("functions/api/hermes-connect/company-connections.ts");
const websiteSync = read("functions/api/hermes-connect/dealer/website-sync.ts");
const workspace = read("src/pages/services/hermes-connect/dealers/workspace/index.astro");
const access = read("src/pages/services/hermes-connect/load-board/access/index.astro");

assert.match(preset, /Legacy Toyota of Dallas/);
assert.match(preset, /39660 Lyndon B Johnson Fwy/);
assert.match(preset, /legacytoyotadallas\.com/);
assert.match(preset, /autoCreateTransportRequests: false/);
assert.match(preset, /autoPublishLoads: false/);
assert.match(preset, /dynamicCompanyOptIn: false/);
assert.doesNotMatch(preset, /yourfriends@legacytoyotadallas\.net/i);

assert.match(catalog, /slug:"legacy-toyota-of-dallas"/);
assert.match(catalog, /claimState:"unclaimed"/);
assert.match(catalog, /hermesCustomer:false/);
assert.match(catalog, /bookingEnabled:false/);
assert.doesNotMatch(catalog, /yourfriends@legacytoyotadallas\.net/i);

for (const column of ["phone", "address_line1", "postal_code", "country_code", "timezone", "public_source_ref"]) {
  assert.match(companySchema, new RegExp(`${column}:?`));
}
assert.match(companyApi, /companyType/);
assert.match(companyApi, /catalogOptIn/);
assert.match(companyApi, /publicSourceRef/);

assert.match(transportSchema, /CREATE TABLE IF NOT EXISTS hermes_dealer_transport_requests/);
for (const field of ["vin", "contact_phone", "special_notes", "load_post_id", "load_record_id", "approved_at", "last_sync_at"]) {
  assert.match(transportSchema, new RegExp(field));
}
assert.match(transportApi, /dealer_company_required/);
assert.match(transportApi, /owner_approval_and_posting_rights_required/);
assert.match(transportApi, /visibility='carrier_only'/);
assert.match(transportApi, /contact_phone_private: true/);
assert.match(transportApi, /vin_private: true/);
assert.match(transportApi, /external_provider_write_performed: false/);
assert.match(transportApi, /same_post_updated/);
assert.match(transportApi, /UPDATE hermes_load_market_posts/);
assert.match(transportApi, /UPDATE hermes_load_records/);
assert.match(transportApi, /SET status='archived'/);

assert.match(connections, /facebook/);
assert.match(connections, /instagram/);
assert.match(connections, /threads/);
assert.match(connections, /authorization_required: true/);
assert.match(connections, /auto_publish_enabled: false/);
assert.match(connections, /dm_automation_enabled: false/);

assert.match(websiteSync, /cross_site_redirect_blocked/);
assert.match(websiteSync, /connected_read_only/);
assert.match(websiteSync, /auto_created_transport_requests: 0/);
assert.match(websiteSync, /auto_created_load_board_posts: 0/);
assert.match(websiteSync, /transport_auto_publish: false/);

assert.match(workspace, /robots="noindex,nofollow"/);
assert.match(workspace, /Approve & post to Load Board/);
assert.match(workspace, /VIN <span>private<\/span>/);
assert.match(workspace, /Retail inventory is context, not freight/);
assert.match(workspace, /catalogOptIn: false/);
assert.match(workspace, /data-prepare-provider/);
assert.doesNotMatch(workspace, /yourfriends@legacytoyotadallas\.net/i);
assert.doesNotMatch(workspace, /\.innerHTML\s*=/);

assert.match(access, /Dealer Operations/);
assert.match(access, /<option value="dealer">Dealer<\/option>/);

console.log("dealer-crm-onboarding-contract: Legacy Toyota dealer profile, private transport CRM, Load Board sync, website read-only boundary and Meta owner-auth gates verified");
