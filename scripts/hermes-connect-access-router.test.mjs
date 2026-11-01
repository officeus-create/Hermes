import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, product, accountApi, clientApi, clientPage, membershipSource] = await Promise.all([
  readFile(new URL("../src/pages/services/hermes-connect/access/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/hermes-connect/account.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/hermes-connect/client-view.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/client-view/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/_lib/company-memberships.mjs", import.meta.url), "utf8"),
]);

test("Hermes Connect access routes one account into vertical-specific CRM", () => {
  assert.match(page, /Один вхід\. CRM — під ваш тип бізнесу\./);
  assert.match(page, /\/services\/hermes-connect\/repair-shops\/auth\/\?mode=register/);
  assert.match(page, /\/services\/hermes-connect\/academy\/business\/auth\/\?mode=register/);
  assert.match(page, /\/services\/hermes-connect\/academy\/auth\/\?mode=register/);
  assert.match(page, /accountDestination/);
  assert.match(page, /data\?\.capabilities\?\.internal_ai === true/,"only server-granted internal AI capability may route to owner Command Center");
  assert.match(page, /\/services\/hermes-connect\/internal\/command-center\//,"owner destination must reuse canonical private Command Center");
  assert.match(page, /owned_businesses/);
  assert.match(page, /owned\.length === 1/);
  assert.match(page, /String\(owned\[0\]\.href\)/);
});

test("Access page defaults to English and retains explicit Ukrainian content", () => {
  assert.match(page, /htmlLang="en"/);
  assert.match(page, /locale="en"/);
  assert.match(page, /<SiteHeader\b/);
  assert.doesNotMatch(page, /<button[^>]*data-lang=/);
  assert.match(page, /hermes-connect-language/);
  assert.match(page, /window\.location\.assign/);
  assert.match(page, /url\.searchParams\.set\("lang", lang\)/);
});

test("Access page does not pretend unreleased verticals are registrable", () => {
  assert.match(page, /Beauty & Wellness/);
  assert.match(page, /Professional Services/);
  assert.match(page, /Готується/);
  assert.doesNotMatch(page, /href="[^"]*(beauty|professional)[^"]*"[^>]*data-route/);
});

test("Catalog publication remains separate from account registration", () => {
  assert.match(page, /не публікує бізнес у Catalog автоматично/);
  assert.match(page, /окремий opt-in/);
  assert.match(page, /Приватні CRM-дані не стають публічними/);
});


test("Hermes Connect product entry routes through the business-aware access page", () => {
  assert.match(product, /href="\/services\/hermes-connect\/access\/"/);
  assert.match(product, /Choose business \/ Sign in/);
  assert.match(product, /href="\/services\/hermes-connect\/academy\/"/);
});


test("clean access source renders English before runtime translation", () => {
  const markup = page.split("<script>")[0];
  assert.doesNotMatch(markup, /[\u0400-\u04ff]/);
  assert.match(markup, /Repair Shop is the current live pilot/);
  assert.match(markup, /does not confirm activation or customer results/);
  assert.match(markup, /robots="noindex,nofollow"/);
});


test("Client View derives tenant scope from authenticated memberships only", () => {
  assert.match(accountApi, /listActiveCompanyMemberships/);
  assert.match(accountApi, /client_view/);
  assert.match(page, /capabilities\?\.client_view === true/);
  assert.match(page, /\/services\/hermes-connect\/client-view\//);
  assert.match(clientApi, /getAuthenticatedSpecialist/);
  assert.match(clientApi, /listActiveCompanyMemberships/);
  assert.match(clientApi, /parseBusinessRef\(membership\.companyId\)/,"Client View must resolve canonical business refs before company lookup");
  assert.match(clientApi, /bind\(business\.native_id\)/,"Company table lookup must use the native company id only after server-side membership resolution");
  assert.doesNotMatch(clientApi, /searchParams\.get\(["'](?:company|business|tenant|workspace)/i, "Client View must not trust a client-supplied tenant selector");
  assert.match(clientApi, /owner_command_center:\s*false/);
  assert.match(clientApi, /internal_ai:\s*false/);
  assert.match(clientApi, /cross_tenant_search:\s*false/);
  assert.match(clientApi, /write_enabled:\s*false/);
  assert.doesNotMatch(clientApi, /owner_specialist_id/,"Client View response must not expose canonical owner identity");
  assert.doesNotMatch(clientApi, /membership_id|grant_source/,"Client View response must minimize internal membership metadata");
  assert.doesNotMatch(clientApi, /specialist\.email/,"Client View response must not echo account email");
  assert.match(membershipSource, /WHERE specialist_id = \? AND active = 1 AND revoked_at IS NULL/);
  assert.match(clientPage, /robots="noindex,nofollow"/);
  assert.match(clientPage, /\/api\/hermes-connect\/client-view/);
  assert.doesNotMatch(clientPage, /company_id=/i, "Client View page must not construct arbitrary tenant selectors");
});
