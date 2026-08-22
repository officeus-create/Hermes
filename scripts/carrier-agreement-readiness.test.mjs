import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pageSource, readiness, offerSource, activation, backend, protectionAddendum, protectedAccountNotice, ownerRevisions] = await Promise.all([
  readFile(new URL("../src/pages/logistics/carrier-agreement/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../docs/CARRIER_AGREEMENT_EXECUTION_READINESS.md", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/logistics/carrier-offer/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../docs/CARRIER_CONTRACT_ENGINE_ACTIVATION.md", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/carrier-contract.ts", import.meta.url), "utf8"),
  readFile(new URL("../public/contracts/Hermes_Carrier_Protection_and_Compensation_Addendum_v3_ATTORNEY_REVIEW.html", import.meta.url), "utf8"),
  readFile(new URL("../public/contracts/Hermes_Protected_Account_Notice_v3_ATTORNEY_REVIEW.html", import.meta.url), "utf8"),
  readFile(new URL("../docs/CARRIER_AGREEMENT_OWNER_REVISIONS_2026-08-06.md", import.meta.url), "utf8"),
]);

for (const required of [
  'robots="noindex,nofollow"',
  "ATTORNEY-REVIEW-V3-2026-08-06",
  "data-agreement-version",
  "Review PDF SHA-256",
  "60-second version",
  "Percentage only in Appendix A",
  "No personal guaranty or UCC lien",
  "Do not submit passwords, PINs, W-9s",
  "Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.pdf",
  "9d26436b95b63610179f3af9ac4cddf5df59a1610e402bad2162ef394951d5cb",
]) assert.ok(pageSource.includes(required), `Carrier agreement v3 review page is missing: ${required}`);

assert.doesNotMatch(pageSource, /<strong>\s*(?:5|6|8)(?:\.00)?% service fee/i, "The v3 public review page must not publish one fixed carrier fee.");
assert.match(pageSource, /blank fee/i);
assert.match(pageSource, /Appendix A/i);

for (const required of [
  'robots="noindex,nofollow"',
  'data-primary-choice="agreement"',
  'data-primary-choice="learn"',
  'href="#learn-more"',
  'const agreementPath = "/logistics/carrier-agreement/"',
  "Dispatch Support",
  "Full Partnership",
  "Carrier Proposal",
  "Your company approves every load",
  "You propose the percentage and volume of work",
  "No. The agreement promises a defined support process, not a market result.",
]) assert.ok(offerSource.includes(required), `Carrier sales handoff is missing: ${required}`);

assert.equal((offerSource.match(/data-primary-choice=/g) ?? []).length, 2);
assert.doesNotMatch(offerSource, /<form\b/i);
assert.doesNotMatch(offerSource, /(?:carrier|driver)[_-]?(?:name|email|phone|mc|usdot)=/i);
assert.doesNotMatch(offerSource, /\$\s?(?:800|1,600|1600)/);

for (const required of [
  "operating email and/or mobile number",
  "at least one of signer email or verified signer mobile is present",
  "never reuse a signer URL between carriers",
  "document_version",
  "document_sha256",
  "PRODUCTION SIGNING NOT ACTIVATED",
  "Wisconsin transportation counsel",
  "Preview environments are proven unable to access production signature bindings",
]) assert.ok(readiness.includes(required), `Execution readiness contract is missing: ${required}`);

const activationLower = activation.toLowerCase();
for (const required of [
  "attorney-review-v3-2026-08-06",
  "carrier_contract_allowed_percentages",
  "company website",
  "three-step",
  "equipment, lanes, load boards, and access details are collected after",
  "the selected percentage is present in",
  "opaque, signed, expiring",
]) assert.ok(activationLower.includes(required), `Activation runbook is missing v3 requirement: ${required}`);

for (const required of [
  "CARRIER_CONTRACT_ALLOWED_PERCENTAGES",
  "LEGAL_EXECUTION_APPROVED",
  "Issue #280 is the governing activation boundary",
  "execution_record_quarantined_pending_legal_review",
  "allowedPercentages.has(contract.percentageKey)",
  'contract.plan!=="custom"',
  "unnecessaryPreSignatureFieldPattern",
  "company_website",
  "service_percentage",
]) assert.ok(backend.includes(required), `Contract endpoint is missing execution/data-minimization gate: ${required}`);

for (const required of [
  "OWNER-APPROVED WISCONSIN REVIEW DRAFT - NOT FOR EXECUTION",
  "6% Dispatch Support",
  "8% Full Partnership",
  "Carrier Proposal",
  "Hermes-Supported Load",
  "Monday through Saturday",
  "weekly invoice on Saturday",
  "five business days",
  "Protected Account",
  "twenty-four months after termination",
  "Non-circumvention",
  "Wisconsin liquidated-damages formula",
  "Carrier is free to hire or contract with any person",
  "No arbitrary fixed minimum fine applies",
  "may not recover duplicative actual damages and liquidated damages",
  "1.5% per month (18% annually)",
  "substantially prevailing party",
  "Wis. Stat. § 814.045",
  "separately authorized and properly licensed broker",
]) assert.ok(protectionAddendum.includes(required), `Carrier protection addendum is missing: ${required}`);

for (const required of [
  "OWNER-APPROVED WISCONSIN REVIEW DRAFT - NOT FOR EXECUTION",
  "Protected Account",
  "five business days",
  "twenty-four months after termination",
  "regardless of booking or payment channel",
  "reasonable, rebuttable estimate",
  "No arbitrary fixed fine applies",
  "Carrier acknowledgment is useful evidence",
]) assert.ok(protectedAccountNotice.includes(required), `Protected Account Notice is missing: ${required}`);

for (const required of [
  "OWNER-APPROVED REVIEW TEXT / PRODUCTION EXECUTION REMAINS OFF",
  "Hermes-Supported Load",
  "24 months after termination",
  "12-month",
  "No automatic punitive fixed penalty",
  "combined execution PDF",
  "synthetic mobile signing",
]) assert.ok(ownerRevisions.includes(required), `Owner revision record is missing: ${required}`);

assert.doesNotMatch(protectionAddendum, /automatic\s+(?:\$|USD)|fixed penalty of|confession of judgment|personal guaranty|blanket lien|UCC security interest/i);
assert.doesNotMatch(protectionAddendum, /will not knowingly solicit, induce, hire|50% contractual fee/i);
assert.match(protectionAddendum, /no automatic hiring fee/i);
assert.match(protectionAddendum, /actual proven damages/i);
assert.match(protectionAddendum, /liquidated damages equal to the unpaid selected fee/i);
assert.match(protectionAddendum, /reasonable documented pre-suit collection costs/i);
assert.match(protectionAddendum, /lawful hiring without such misuse are allowed/i);

for (const secretLike of ["sk_live_", "api_key=", "access_token=", "private_key="])
  assert.ok(!readiness.toLowerCase().includes(secretLike));

console.log("Carrier agreement v3 offer, Wisconsin-aligned protection addendum, minimized review/onboarding signing, and Issue #280 containment contracts passed.");

await import("./carrier-contract-review-containment.test.mjs");
