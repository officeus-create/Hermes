import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync("functions/api/repair-shop/profile.ts", "utf8");
const page = readFileSync("src/pages/services/hermes-connect/repair-shops/settings.astro", "utf8");
const nav = readFileSync("src/components/RepairShopOwnerNavEnhancer.astro", "utf8");

assert.match(api, /getAuthenticatedSpecialist/);
assert.match(api, /WHERE owner_specialist_id = \? LIMIT 1/);
assert.match(api, /export async function onRequestGet/);
assert.match(api, /export async function onRequestPut/);
assert.doesNotMatch(api, /onRequestPost|onRequestDelete/, "Settings must reuse the existing profile GET/PUT contract only");

assert.match(page, /robots="noindex,nofollow"/);
assert.match(page, /requestJson\("\/api\/repair-shop\/profile"\)/);
assert.match(page, /requestJson\("\/api\/repair-shop\/profile",\{method:"PUT"/);
assert.match(page, /HermesConnectAccountSwitcher current="repair" mode="menu"/);
assert.match(page, /title:"Настройки"/);
assert.match(page, /title:"Налаштування"/);
assert.match(page, /title:"Ajustes"/);
assert.match(page, /title:"Impostazioni"/);
assert.match(page, /title:"Paramètres"/);
assert.doesNotMatch(page, /CREATE TABLE|INSERT INTO repair_shops|UPDATE repair_shops/i, "Settings UI must not own storage semantics");

assert.match(nav, /`\$\{repairShopRoot\}\/settings`/);
assert.match(nav, /href:withLocale\(`\$\{repairShopRoot\}\/settings\/`\)/);
assert.match(nav, /active:normalizedPath === `\$\{repairShopRoot\}\/settings`/);
assert.doesNotMatch(nav, /settings, href:withLocale\(`\$\{repairShopRoot\}\/dashboard\/`, "#profile-title"\)/);

console.log("Repair Shop Settings contract OK");
