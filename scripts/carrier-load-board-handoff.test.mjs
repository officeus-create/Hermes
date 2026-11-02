import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../src/pages/load-board.astro", import.meta.url), "utf8");
const contract = readFileSync(new URL("../functions/api/carrier-contract.ts", import.meta.url), "utf8");
const onboarding = readFileSync(new URL("../src/pages/logistics/carrier-onboarding/index.astro", import.meta.url), "utf8");
assert.match(source, /id="carrier-access"/);
assert.match(source, /data-carrier-agreement-shortcut/);
assert.match(source, /data-vehicle-agreement-next-step/);
assert.match(source, /href="\/carrier\/"/);
assert.match(source, /does not create or require a paid dispatch agreement/);
assert.match(source, /does not create an account or sign a contract/);
for (const name of ["carrier_role", "carrier_company_name", "carrier_contact_name", "authority_number", "equipment_class", "carrier_email", "carrier_phone", "capacity_units", "available_from", "origin_location", "origin_radius", "carrier_consent"]) {
  assert.match(source, new RegExp('name="' + name + '"'), name);
}
assert.match(source, /data-vehicle-form/);
assert.match(source, /data-send-vehicle-lead/);
assert.match(source, /No account, email, call, CRM write, or dispatcher assignment is created in preview mode/);
assert.match(source, /const canonicalProductionHost = /);
assert.match(source, /\/api\/logistics-lead/);
assert.match(onboarding, /name="selected_plan"/);
assert.match(onboarding, /name="service_percentage"/);
assert.match(contract, /const LEGAL_EXECUTION_APPROVED = false/);
assert.doesNotMatch(source, /name="(?:load_board_password|pin|api_token|bank_account|cdl_image)"/);
console.log("Carrier free-access to agreement handoff is explicit; no automatic account, payment or signature implied.");
