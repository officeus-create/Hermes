import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

const [cards, carrier, sign, agreement, offer, onboarding, viewer, enhancer, middleware, routes, headers] = await Promise.all([
  "src/components/CarrierPlanCards.astro",
  "src/pages/carrier/index.astro",
  "src/pages/sign/index.astro",
  "src/pages/logistics/carrier-agreement/index.astro",
  "src/pages/logistics/carrier-offer/index.astro",
  "src/pages/logistics/carrier-onboarding/index.astro",
  "src/pages/contracts/carrier-agreement-v3/index.astro",
  "src/components/CarrierContractSafetyEnhancer.astro",
  "functions/api/_middleware.ts",
  "public/_routes.json",
  "public/_headers"
].map(read));
for (const [plan, rate] of [["essential","6%"], ["pro","8%"], ["custom","Your %"]]) {
  assert.match(cards, new RegExp('key: "' + plan + '"'), 'Missing plan ' + plan);
  assert.ok(cards.includes('rate: "' + rate + '"'), 'Missing published rate label for ' + plan);
  assert.match(cards, /carrier-onboarding\/\?plan=/);
  assert.match(middleware, /plan_percentage_mismatch/);
}
assert.match(cards, /second specialist/i);
assert.match(cards, /shipper and dealer/i);
assert.match(cards, /not guaranteed/i);
assert.match(cards, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(cards, /@media\(max-width:950px\)/);
for(const [route, content] of [["carrier", carrier],["sign", sign],["agreement", agreement]]) {
  assert.match(content, /import CarrierPlanCards from/,"No plan selector on " + route);
  assert.match(content, /<CarrierPlanCards /,"Plan selector not rendered on " + route);
  assert.match(content, /carrier-support-options|sign-support-options|agreement-support-options/);
}
assert.match(carrier, /href="\/logistics\/carrier-onboarding\/" data-commercial-primary-cta/);
assert.match(sign, /href="\/logistics\/carrier-onboarding\/" data-commercial-primary-cta/);
assert.match(agreement, /href="\/logistics\/carrier-onboarding\/" data-carrier-context-link data-contract-esign/);
assert.match(offer, /href="\/logistics\/carrier-onboarding\/" data-primary-choice="agreement"/);
assert.match(viewer, /Direct PDF download/);
assert.match(viewer, /href=\{pdfAssetPath\} download=/);
assert.match(onboarding, /selected_plan/);
assert.match(enhancer, /percentage\.readOnly\s*=\s*true/);
for (const raw of ["rate", "mc", "usdot", "signer_email"]) {
  assert.ok(!cards.includes("searchParams.get("+raw), "No sensitive URL parameter allowed");
}
const pagesRoutes=JSON.parse(routes);
assert.deepEqual(pagesRoutes.include,["/*"]);
for(const path of ["/carrier/*","/sign/*","/logistics/carrier-offer/*","/logistics/carrier-agreement/*","/logistics/carrier-onboarding/*","/contracts/*"]) {
  assert.ok(pagesRoutes.exclude.includes(path),`Missing static Pages bypass: ${path}`);
}
assert.ok(!pagesRoutes.exclude.some((path)=>path.startsWith("/api/") || path === "/*"),"Contract API and private middleware must remain active.");
assert.match(headers, /Strict-Transport-Security/);
assert.match(headers, /\/contracts\/\*/);
console.log("Carrier three-option route contract OK: 6%, 8%, custom, prominent entry points, consent flow and direct PDF fallback");
