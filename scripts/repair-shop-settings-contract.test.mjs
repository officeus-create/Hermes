import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync("functions/api/repair-shop/profile.ts", "utf8");
const schema = readFileSync("functions/api/_lib/repair-shop-schema.mjs", "utf8");
const publicApi = readFileSync("functions/api/public/repair-shop.ts", "utf8");
const page = readFileSync("src/pages/services/hermes-connect/repair-shops/settings.astro", "utf8");
const nav = readFileSync("src/components/RepairShopOwnerNavEnhancer.astro", "utf8");

assert.match(api, /getAuthenticatedSpecialist/);
assert.match(api, /WHERE owner_specialist_id = \? LIMIT 1/);
assert.match(api, /export async function onRequestGet/);
assert.match(api, /export async function onRequestPut/);
assert.match(api, /region\?: unknown/);
assert.match(api, /country_code\?: unknown/);
assert.match(api, /Intl\.DateTimeFormat\("en-US", \{ timeZone: value \}\)/);
assert.match(api, /invalid_country_code/);
assert.match(api, /region=\?,country_code=\?/);
assert.doesNotMatch(api, /US_TIMEZONES/, "Repair Shop profile must accept valid global IANA timezones");
assert.doesNotMatch(api, /onRequestPost|onRequestDelete/, "Settings must reuse the existing profile GET/PUT contract only");

assert.match(schema, /ensureOptionalColumn\(db, "region", "region TEXT"\)/);
assert.match(schema, /ensureOptionalColumn\(db, "country_code", "country_code TEXT"\)/);
assert.match(schema, /SET country_code = 'US'/, "Legacy US rows need a deterministic country backfill");
assert.match(publicApi, /city,state,region,country_code,postal_code,timezone/);

assert.match(page, /robots="noindex,nofollow"/);
assert.match(page, /requestJson\("\/api\/repair-shop\/profile"\)/);
assert.match(page, /requestJson\("\/api\/repair-shop\/profile",\{method:"PUT"/);
assert.match(page, /HermesConnectAccountSwitcher current="repair" mode="menu"/);
assert.match(page, /id="shop-region"/);
assert.match(page, /id="shop-country"/);
assert.match(page, /id="shop-timezone"/);
assert.match(page, /Europe\/Kyiv/);
assert.match(page, /country_code:/);
assert.match(page, /title:"Настройки"/);
assert.match(page, /title:"Налаштування"/);
assert.match(page, /title:"Ajustes"/);
assert.match(page, /title:"Impostazioni"/);
assert.match(page, /title:"Paramètres"/);
assert.doesNotMatch(page, /<select id="shop-timezone"/, "Timezone must not be restricted to a US-only select");
assert.doesNotMatch(page, /CREATE TABLE|INSERT INTO repair_shops|UPDATE repair_shops/i, "Settings UI must not own storage semantics");

assert.match(nav, /`\$\{repairShopRoot\}\/settings`/);
assert.match(nav, /href:withLocale\(`\$\{repairShopRoot\}\/settings\/`\)/);
assert.match(nav, /active:normalizedPath === `\$\{repairShopRoot\}\/settings`/);
assert.doesNotMatch(nav, /settings, href:withLocale\(`\$\{repairShopRoot\}\/dashboard\/`, "#profile-title"\)/);

console.log("Repair Shop Settings contract OK");
