import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pageSource, readiness, offerSource, activation, backend] = await Promise.all([
  readFile(new URL("../src/pages/logistics/carrier-agreement/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../docs/CARRIER_AGREEMENT_EXECUTION_READINESS.md", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/logistics/carrier-offer/index.astro", import.meta.url), "utf8"),
  readFile(new URL("../docs/CARRIER_CONTRACT_ENGINE_ACTIVATION.md", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/carrier-contract.ts", import.meta.url), "utf8"),
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
  "ATTORNEY_REVIEW.pdf",
  "ATTORNEY_REVIEW.html",
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
  "allowedPercentages.has(contract.percentageKey)",
  'contract.plan!=="custom"',
  "unnecessaryPreSignatureFieldPattern",
  "company_website",
  "service_percentage",
]) assert.ok(backend.includes(required), `Contract endpoint is missing execution/data-minimization gate: ${required}`);

for (const secretLike of ["sk_live_", "api_key=", "access_token=", "private_key="])
  assert.ok(!readiness.toLowerCase().includes(secretLike));

console.log("Carrier agreement v3 offer, document, minimized signing, and production execution-readiness contracts passed.");