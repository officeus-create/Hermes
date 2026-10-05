import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Academy registration reuses shared auth and extends one canonical Hermes company", async () => {
  const [auth, api, schema] = await Promise.all([
    read("src/pages/services/hermes-connect/academy/business/auth/index.astro"),
    read("functions/api/hermes-connect/academy/business.ts"),
    read("functions/api/_lib/academy-business-profiles.mjs"),
  ]);
  assert.match(auth, /\/api\/auth\/register/);
  assert.match(auth, /role:"Academy Business Owner"/);
  assert.match(auth, /\/api\/hermes-connect\/academy\/business/);
  assert.match(auth, /business_academy/);
  assert.match(auth, /online_school/);
  assert.match(auth, /business_club/);
  assert.match(auth, /name="catalogOptIn" type="checkbox" \/>/);
  assert.match(auth, /name="location"/);
  assert.match(auth, /data-lang="uk"/);
  assert.match(auth, /data-lang="en"/);
  assert.match(auth, /locale="uk"/);
  assert.match(auth, /window\.location\.assign/);

  assert.match(api, /ensureHermesCompanyProfilesSchema/);
  assert.match(api, /hermes_company_profiles/);
  assert.match(api, /hermes_academy_business_profiles/);
  assert.match(api, /company_id/);
  assert.match(api, /catalogOptIn = body\.catalogOptIn === true/);
  assert.match(api, /canonicalCompany/);
  assert.match(api, /load_board_access,created_at/);
  assert.match(api, /'self_submitted',0/);
  assert.match(api, /next_url: "\/services\/hermes-connect\/academy\/business\/workspace\/"/);

  assert.match(schema, /company_id TEXT/);
  assert.match(schema, /idx_academy_business_company/);
  assert.match(schema, /catalog_opt_in INTEGER NOT NULL DEFAULT 0/);
  assert.match(schema, /corporate_academy/);
});

test("Academy owner workspace is distinct from learner and Repair Shop workflows", async () => {
  const [workspace, hub, productHub, learnerAuth] = await Promise.all([
    read("src/pages/services/hermes-connect/academy/business/workspace/index.astro"),
    read("src/pages/services/hermes-connect/academy/index.astro"),
    read("src/pages/services/hermes-connect/index.astro"),
    read("src/pages/services/hermes-connect/academy/auth/index.astro"),
  ]);
  assert.match(workspace, /Lead → consultation → program → enrollment → learning → renewal/);
  assert.match(workspace, /CAC · LTV · ROMI/);
  assert.match(workspace, /LEARNER 360/);
  assert.match(workspace, /HR \/ RECRUITING/);
  assert.match(workspace, /CANDIDATE ASSESSMENT/);
  assert.match(workspace, /Конс на Бі\$ · Marketing candidate/);
  assert.match(workspace, /Google Docs \+ MindMap/);
  assert.match(workspace, /Evidence & diagnosis/);
  assert.match(workspace, /KPI & measurement/);
  assert.match(workspace, /Pending human review/);
  assert.match(workspace, /PROGRAMS & COHORTS/);
  assert.match(workspace, /EXECUTIVE KPI DICTIONARY/);
  assert.match(workspace, /ACQUISITION CONTROL/);
  assert.match(workspace, /Organic baseline → paid learning → offer hypothesis → consultation → program/);
  assert.match(workspace, /Observed CTA \/ hypothesis/);
  assert.match(workspace, /Метод 4 колонок перед написанням контенту/);
  assert.match(workspace, /Питання → Усвідомлення → Розуміння → Застосування/);
  assert.match(workspace, /Readiness & offer hypothesis/);
  assert.match(workspace, /CLAIMS \/ PROOF REGISTRY/);
  assert.match(workspace, /observed_at/);
  assert.match(workspace, /Needs review/);
  assert.match(workspace, /Certificate 283€/);
  assert.match(workspace, /diagnostic gap/);
  assert.match(workspace, /recommended module/);
  assert.match(workspace, /not real KNB leads|не реальні leads КНБ/);
  assert.match(workspace, /repeat\(10,minmax\(150px,1fr\)\)/);
  assert.match(workspace, /Multi-level sales structure/);
  assert.match(workspace, /Average check/);
  assert.match(workspace, /Sales productivity/);
  assert.match(workspace, /Renewal \/ next program/);
  assert.match(workspace, /Applicant → Screen → Interview → Test → Offer \/ No → Adaptation/);
  assert.match(workspace, /Repair Shop.*Academy/s);
  assert.match(workspace, /demo data/);
  assert.match(hub, /Register academy \/ courses/);
  assert.match(hub, /learner account/);
  assert.match(productHub, /BUSINESS CRM \+ LEARNER ACCESS/);
  assert.match(learnerAuth, /Academy Business CRM/);
  assert.match(learnerAuth, /data-lang="uk"/);
  assert.match(learnerAuth, /data-lang="en"/);
  assert.match(learnerAuth, /locale="uk"/);
});

test("Academy Catalog projects the canonical company once and keeps private CRM data out", async () => {
  const [catalogApi, loader, publicProfile, sitemap, catalogPage] = await Promise.all([
    read("functions/api/catalog/companies.ts"),
    read("public/catalog-connect-live.v2.js"),
    read("functions/businesses/connect/academy/[slug].ts"),
    read("functions/sitemap-connect-catalog.xml.ts"),
    read("src/pages/businesses/index.astro"),
  ]);
  assert.match(catalogApi, /LEFT JOIN hermes_academy_business_profiles a ON a\.company_id=c\.id/);
  assert.match(catalogApi, /id: String\(row\.id\)/);
  assert.match(catalogApi, /companyType: isAcademy \? "academy_business"/);
  assert.match(catalogApi, /\/businesses\/connect\/academy\//);
  assert.doesNotMatch(catalogApi, /id: `academy-business:/);

  assert.match(loader, /academy_business/);
  assert.match(loader, /data-academy-catalog-grid/);
  assert.match(loader, /catalogEntityId/);
  assert.match(loader, /academyExistingIds/);
  assert.doesNotMatch(loader, /academyExistingNames|repairExistingNames/);

  assert.match(publicProfile, /JOIN hermes_academy_business_profiles a ON a\.company_id=c\.id/);
  assert.match(publicProfile, /EducationalOrganization/);
  assert.match(publicProfile, /Вхід власника в CRM/);
  assert.match(publicProfile, /Приватні учні, заявки, платежі та CRM-дані тут не показуються/);
  assert.match(publicProfile, /data-lang="uk"/);
  assert.match(publicProfile, /data-lang="en"/);
  assert.match(sitemap, /\/businesses\/connect\/academy\//);
  assert.match(catalogPage, /Request a similar audit/);
  assert.match(catalogPage, /type=marketing-package&months=3/);
  assert.match(catalogPage, /Strategy example/);
  assert.match(catalogPage, /Business Academy Growth Strategy/);
  assert.doesNotMatch(catalogPage, /<h3>Конс на Бі\$<\/h3>/);
});

test("KNB concept and demo route into real Academy business onboarding with UA EN switch", async () => {
  const [concept, demo, auth] = await Promise.all([
    read("src/pages/businesses/concepts/kons-na-bis/index.astro"),
    read("public/demos/hermes-connect/academy-knb.html"),
    read("src/pages/services/hermes-connect/academy/business/auth/index.astro"),
  ]);
  assert.match(concept, /academy\/business\/auth\/\?mode=register/);
  assert.match(concept, /business=kons-na-bis/);
  assert.match(concept, /data-lang="uk"/);
  assert.match(concept, /data-lang="en"/);
  assert.match(concept, /data-language-route/);
  assert.match(concept, /url\.searchParams\.set\("lang",\s*next\)/);
  assert.match(demo, /Зареєструвати CRM/);
  assert.match(demo, /academy\/business\/auth\/\?mode=register/);
  assert.match(demo, /data-lang="uk"/);
  assert.match(demo, /data-lang="en"/);
  assert.match(demo, /data-language-route/);
  assert.match(demo, /url\.searchParams\.set\('lang',lang\)/);
  assert.match(auth, /academyType:"business_club"/);
  assert.match(auth, /https:\/\/kons-na-bis\.com\//);
});

test("Academy business appears in the shared Hermes account portfolio through canonical company id", async () => {
  const [accountApi, switcher] = await Promise.all([
    read("functions/api/hermes-connect/account.ts"),
    read("src/components/HermesConnectAccountSwitcher.astro"),
  ]);
  assert.match(accountApi, /key: "academy_business"/);
  assert.match(accountApi, /getOwnedAcademyBusiness/);
  assert.match(accountApi, /JOIN hermes_company_profiles c ON c\.id = a\.company_id/);
  assert.match(accountApi, /academy\/business\/workspace/);
  assert.match(switcher, /item\?\.key === "academy_business"/);
  assert.match(switcher, /"academy-business": "\/services\/hermes-connect\/academy\/business\/workspace\//);
});


test("Academy owner workspace exposes bounded team-role structure without claiming active RBAC", async () => {
  const workspace = await read("src/pages/services/hermes-connect/academy/business/workspace/index.astro");
  assert.match(workspace, /TEAM ACCESS · RBAC/);
  assert.match(workspace, />OWNER</);
  assert.match(workspace, />ADMIN</);
  assert.match(workspace, />MARKETING</);
  assert.match(workspace, />SALES</);
  assert.match(workspace, />HR</);
  assert.match(workspace, />CURATOR</);
  assert.match(workspace, />REVIEWER</);
  assert.match(workspace, />READ ONLY</);
  assert.match(workspace, /permission backend pending/);
  assert.match(workspace, /not presented as fully activated multi-user RBAC/);
  assert.match(workspace, /company-scoped permissions/);
});

test("Academy business owner mutation enforces same-origin boundary", async () => {
  const api = await read("functions/api/hermes-connect/academy/business.ts");
  assert.match(api, /sameOriginMutation/);
  assert.match(api, /same_origin_required/);
  assert.match(api, /Sec-Fetch-Site/);
});
