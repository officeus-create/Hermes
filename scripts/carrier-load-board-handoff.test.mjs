import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizeInput } from "../functions/api/carrier-contract.ts";
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
const syntheticSignature = `data:image/jpeg;base64,${Buffer.alloc(900, 31).toString("base64")}`;
const syntheticContract = (plan, percentage, scope = "") => ({
  request_id: "carrier_handoff_qa_01", selected_plan: plan, service_percentage: percentage, custom_scope: scope,
  legal_company_name: "Synthetic QA Carrier LLC", mc_number: "123456", signer_name: "Synthetic Signer",
  signer_title: "Owner", signer_email: "synthetic@example.com", signer_phone: "+14145550101",
  typed_signature: "Synthetic Signer", signature_jpeg: syntheticSignature, signature_width: 600, signature_height: 180,
  consent_electronic_records: true, consent_authority: true, consent_document_review: true, consent_selected_scope: true,
  submitted_at: "2026-11-02T12:00:00.000Z"
});
assert.ok(normalizeInput(syntheticContract("essential", "6")), "6% essential must remain valid");
assert.ok(normalizeInput(syntheticContract("pro", "8")), "8% full partnership must remain valid");
assert.equal(normalizeInput(syntheticContract("essential", "8")), null, "8% cannot be signed as 6% essential");
assert.equal(normalizeInput(syntheticContract("pro", "6")), null, "6% cannot be signed as 8% full partnership");
assert.equal(normalizeInput(syntheticContract("essential", "5")), null, "legacy 5% must not be mislabeled essential");
assert.equal(normalizeInput(syntheticContract("pro", "10")), null, "legacy 10% must not be mislabeled full partnership");
assert.ok(normalizeInput(syntheticContract("custom", "7.5", "Synthetic requested custom dispatch support scope.")), "valid custom proposal remains possible");
assert.equal(normalizeInput(syntheticContract("custom", "7.5")), null, "custom must include written scope");
console.log("Carrier standard rate integrity and free-access to agreement handoff is explicit; no automatic account, payment or signature implied.");
