import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const enhancer = read("src/components/LoadBoardCapacityEnhancer.astro");
const baseLayout = read("src/layouts/BaseLayout.astro");
const accessPage = read("src/pages/services/hermes-connect/load-board/access/index.astro");
const accountApi = read("functions/api/hermes-connect/account.ts");
const accountSwitcher = read("src/components/HermesConnectAccountSwitcher.astro");
const companyHelper = read("functions/api/_lib/hermes-company-profiles.mjs");
const companyApi = read("functions/api/hermes-connect/company.ts");
const catalogApi = read("functions/api/catalog/companies.ts");
const summaryApi = read("functions/api/load-board/summary.ts");
const activeApi = read("functions/api/load-board/active.ts");
const opportunitiesApi = read("functions/api/load-board/opportunities.ts");
const dispatchPlanApi = read("functions/api/load-board/dispatch-plan.ts");
const releaseDelta = JSON.parse(read("docs/release-manifest-deltas/2026-09-11-load-board-access-funnel.json"));

assert.match(enhancer, /See the board before you create an account\./);
assert.match(enhancer, /data-live-load-count/);
assert.match(enhancer, /\/api\/load-board\/summary/);
assert.match(enhancer, /Interface preview rows are not inventory/);
assert.match(enhancer, /hlb-live-row--locked/);
assert.match(enhancer, /\/services\/hermes-connect\/load-board\/access\//);
assert.match(enhancer, /Register company &amp; unlock Load Board/);
assert.match(enhancer, /\/api\/catalog\/companies/);
assert.match(enhancer, /Self-submitted · verification pending/);
assert.match(baseLayout, /LoadBoardCapacityEnhancer/);
assert.match(baseLayout, /<LoadBoardCapacityEnhancer \/>/);
assert.match(enhancer, /const structuralCount = Math\.max\(54, 60 - Math\.min\(active\.length, 6\)\)/);
assert.match(enhancer, /PREVIEW · NOT LIVE/);
assert.match(enhancer, /Chicago, IL/);
assert.match(enhancer, /Houston, TX/);
assert.match(enhancer, /Seattle, WA/);
for (const path of [
  "/load-board/providers/ship-cars/", "/load-board/providers/central-dispatch/", "/load-board/providers/super-dispatch/",
  "/load-board/providers/dat/", "/load-board/providers/truckstop/", "/load-board/providers/123loadboard/", "/load-board/providers/direct-freight/",
  "/load-board/equipment/car-hauler/", "/load-board/equipment/dry-van/", "/load-board/equipment/reefer/", "/load-board/equipment/flatbed/",
  "/load-board/equipment/step-deck/", "/load-board/equipment/hotshot/", "/load-board/equipment/power-only/", "/load-board/equipment/box-truck/",
]) assert.ok(enhancer.includes(path), `Missing Load Board discovery link: ${path}`);

assert.match(accessPage, /robots="noindex,nofollow"/);
assert.match(accessPage, /One Hermes account\. One company profile\. Load Board unlocked\./);
assert.match(accessPage, /\/api\/auth\/register/);
assert.match(accessPage, /\/api\/auth\/login/);
assert.match(accessPage, /\/api\/auth\/me/);
assert.match(accessPage, /\/api\/hermes-connect\/company/);
assert.match(accessPage, /catalogOptIn/);
assert.match(accessPage, /Self-submitted · verification pending/);
assert.match(accessPage, /\/load-board\/\?access=unlocked#live-marketplace/);

assert.match(companyHelper, /CREATE TABLE IF NOT EXISTS hermes_company_profiles/);
assert.match(companyHelper, /owner_specialist_id TEXT NOT NULL UNIQUE/);
assert.match(companyHelper, /catalog_opt_in INTEGER NOT NULL DEFAULT 1/);
assert.match(companyHelper, /load_board_access INTEGER NOT NULL DEFAULT 1/);
assert.match(companyHelper, /specialistHasLoadBoardAccess/);

assert.match(companyApi, /getAuthenticatedSpecialist/);
assert.match(companyApi, /ON CONFLICT\(owner_specialist_id\)/);
assert.match(companyApi, /load_board_access: true/);
assert.match(companyApi, /catalog_status/);
assert.match(companyApi, /next_url: "\/load-board\/\?access=unlocked#live-marketplace"/);

assert.match(accountApi, /key: "load_board"/);
assert.match(accountApi, /kind: "company_workspace"/);
assert.match(accountApi, /href: "\/load-board\/\?access=unlocked#live-marketplace"/);
assert.match(accountApi, /load_board: Boolean/);
assert.match(accountApi, /catalog_status/);
assert.doesNotMatch(accountApi, /authority_number/);

assert.match(accountSwitcher, /data-workspace-loadboard/);
assert.match(accountSwitcher, /data-hc-workspace-link="loadboard"/);
assert.match(accountSwitcher, /item\?\.key === "load_board"/);
assert.match(accountSwitcher, /workspacePaths[\s\S]*loadboard: "\/load-board\/\?access=unlocked#live-marketplace"/);
assert.match(accountSwitcher, /if \(loadBoardWorkspace && loadboard\)/);
assert.match(accountSwitcher, /runtimeCopy\.loadboard/);

assert.match(catalogApi, /catalog_opt_in = 1/);
assert.match(catalogApi, /self_submitted/);
assert.match(catalogApi, /verified_public/);
assert.doesNotMatch(catalogApi, /authority_number|owner_specialist_id|credential|password|phone|email/i);

assert.match(summaryApi, /visibility IN \('public', 'carrier_only'\)/);
assert.match(summaryApi, /record_type IN \('load', 'capacity'\)/);
assert.match(summaryApi, /available_loads/);
assert.match(summaryApi, /Demo rows and internal-only records are excluded/);
assert.doesNotMatch(summaryApi, /SELECT \*/);

for (const api of [activeApi, opportunitiesApi, dispatchPlanApi]) {
  assert.match(api, /specialistHasLoadBoardAccess/);
  assert.match(api, /carrier_only/);
}
assert.match(activeApi, /company_registration_unlocks_access: true/);
assert.match(opportunitiesApi, /company_registration_unlocks_access: true/);
assert.match(dispatchPlanApi, /company_registration_unlocks_access: true/);

assert.equal(releaseDelta.additions?.[0]?.route, "/services/hermes-connect/load-board/access/");
assert.equal(releaseDelta.additions?.[0]?.indexability, "noindex");
assert.equal(releaseDelta.acceptance?.route_count_added, 1);
assert.equal(releaseDelta.acceptance?.indexable_route_count_added, 0);

console.log("Load Board curtain funnel contract passed: truthful aggregate count, locked preview, Hermes account + company access, account portfolio workspace, safe Catalog listing and noindex registration flow are wired.");
