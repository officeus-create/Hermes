import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [
  enhancer,
  customerActions,
  layout,
  repairLanding,
  paidPlan,
  activationEnhancer,
  activationRuntime,
  offerContract,
  freeLaunch,
  launchPolicy,
  registerApi,
  repairProfileApi,
] = await Promise.all([
  readFile(new URL("../src/components/RepairBookingGrowthEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairBookingCustomerActionsEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/plan.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairShopActivationEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-activation.js", import.meta.url), "utf8"),
  readFile(new URL("../src/data/hermes-connect-repair-shop-offer.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairShopFreeLaunchOffer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/data/hermes-connect-repair-shop-launch.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/auth/register.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/profile.ts", import.meta.url), "utf8"),
]);

// Public repair booking confirmation is customer-focused. Do not reuse a repair
// customer's booking contact details to create an unrelated B2B marketing lead.
assert.match(layout, /RepairBookingGrowthEnhancer/);
assert.match(enhancer, /RepairBookingCustomerActionsEnhancer/);
assert.match(enhancer, /no Hermes\/ProgressoPro B2B cross-sell/i);
assert.doesNotMatch(enhancer, /Grow My Business \/ Talk to Hermes/);
assert.doesNotMatch(enhancer, /data-growth-consent/);
assert.doesNotMatch(enhancer, /repair-booking-growth\.js/);
assert.doesNotMatch(enhancer, /\/api\/logistics-lead/);
assert.match(customerActions, /\/api\/public\/repair-shop\?slug=/);
assert.match(customerActions, /data-call-shop/);
assert.match(customerActions, /data-shop-directions/);
assert.match(customerActions, /tel:/);
assert.match(customerActions, /google\.com\/maps\/search/);
assert.doesNotMatch(customerActions, /client-name|client-email|client-phone|\/api\/logistics-lead|ProgressoPro/i);

// Revenue V1: keep the public Repair Shop path value-first and route paid intent
// through the existing private lead receiver without introducing website payment tech.
assert.match(repairLanding, /Auto repair shop software for bookings, customers, and availability\\./);
assert.match(repairLanding, /\/services\/hermes-connect\/repair-shops\/plan\//);
assert.match(repairLanding, /\\$0 during setup · \\$99\\/month after setup/);\nassert.match(repairLanding, /standard Founding Shop price after setup/);
assert.doesNotMatch(repairLanding, /Current live pilot/);

assert.match(offerContract, /REPAIR_SHOP_OFFER_STATUS\s*=\s*"current-public-offer"/);
assert.match(offerContract, /id:\s*"repair_shop_founding"/);
assert.match(offerContract, /priceMonthlyUsd:\s*99/);
assert.match(offerContract, /purchaseFlow:\s*"human-confirmation-and-invoice"/);
assert.match(offerContract, /Owner-approved Hermes Catalog listing with no listing fee/);
for (const state of ["trialing", "founding", "active", "past_due", "cancelled", "comped"]) {
  assert.match(offerContract, new RegExp(`"${state}"`));
}
const publicPrice = offerContract.match(/priceMonthlyUsd:\s*(\d+)/)?.[1];
assert.equal(publicPrice, "99");
assert.match(paidPlan, new RegExp(`\\$${publicPrice}\\/month`));
assert.match(paidPlan, /Founding Shop Plan/);
assert.match(paidPlan, /per repair shop location/);
assert.match(paidPlan, /Start free setup/);
assert.match(paidPlan, /id="plan-consent" type="checkbox" required/);
assert.match(paidPlan, /fetch\("\/api\/logistics-lead"/);
assert.match(paidPlan, /"Idempotency-Key": requestId/);
assert.match(paidPlan, /connect_paid_plan_requested/);
assert.match(paidPlan, /No payment is taken here/);
assert.match(paidPlan, /"@type": "Service"/);
assert.match(paidPlan, /"@type": "BreadcrumbList"/);
assert.match(paidPlan, /"@type": "FAQPage"/);
assert.doesNotMatch(paidPlan, /js\.stripe\.com|from\s+["']stripe["']|payment_intents|checkout\.sessions\.create|paypal\.com\/sdk/i);
assert.doesNotMatch(
  paidPlan,
  /window\.dataLayer(?:\.|\?\.)push\(\{[^}]*\b(?:email|phone|contactName|shopName|cityState|goal)\b[^}]*\}\)/s,
);

// CEO commercial decision: Repair Shop registration and software access stay free
// while Hermes configures the workspace around the business. The standard Founding
// Shop price remains $99/month after setup, with human confirmation before billing.
assert.match(launchPolicy, /REPAIR_SHOP_SETUP_ACCESS_ENABLED\s*=\s*true/);
assert.match(launchPolicy, /REPAIR_SHOP_SETUP_ACCESS_PRICE_USD\s*=\s*0/);
assert.match(launchPolicy, /REPAIR_SHOP_FOUNDING_PRICE_USD\s*=\s*99/);
assert.match(launchPolicy, /REPAIR_SHOP_CATALOG_LISTING_FEE_USD\s*=\s*0/);
assert.match(launchPolicy, /id:\s*"repair_shop_free_during_setup_2026"/);
assert.match(launchPolicy, /cardRequiredDuringSetup:\s*false/);
assert.match(launchPolicy, /catalogPublication:\s*"owner-approved-public-facts-only"/);
assert.match(launchPolicy, /discoveryScope:\s*\["seo",\s*"geo",\s*"local-search",\s*"ai-discovery"\]/);
assert.match(launchPolicy, /searchResultsGuaranteed:\s*false/);
assert.match(freeLaunch, /Use Hermes Connect free while we configure it for your shop/);
assert.match(freeLaunch, /Пользуйтесь Hermes Connect бесплатно, пока мы настраиваем систему под ваше СТО/);
assert.match(freeLaunch, /repair_shop_free_during_setup_2026/);
assert.match(freeLaunch, /free public Hermes Catalog listing/);
assert.doesNotMatch(freeLaunch, /Free-registration countdown|closeFreeRegistrationUi|free_registration_through_2026_09_15/);

// Shop Owner account creation and first Repair Shop creation use one owner-controlled
// setup-access flag. There is no hidden calendar cutoff and existing shops remain editable.
assert.match(registerApi, /REPAIR_SHOP_SETUP_ACCESS_ENABLED/);
assert.match(registerApi, /role === "Shop Owner" && !REPAIR_SHOP_SETUP_ACCESS_ENABLED/);
assert.match(registerApi, /repair_shop_setup_access_closed/);
assert.doesNotMatch(registerApi, /REPAIR_SHOP_FREE_REGISTRATION_END_MS/);
assert.match(repairProfileApi, /REPAIR_SHOP_SETUP_ACCESS_ENABLED/);
assert.match(repairProfileApi, /else \{[\s\S]*?!REPAIR_SHOP_SETUP_ACCESS_ENABLED/);
assert.match(repairProfileApi, /repair_shop_setup_access_closed/);
assert.doesNotMatch(repairProfileApi, /REPAIR_SHOP_FREE_REGISTRATION_END_MS/);
assert.match(repairProfileApi, /INSERT INTO repair_shops/);

// Activation: one Repair Shop runtime owns customer-ready copy and the six-step
// first-value loop through the first completed booking and paid-plan decision.
assert.match(layout, /RepairShopActivationEnhancer/);
assert.match(layout, /RepairShopFreeLaunchOffer/);
assert.match(activationEnhancer, /\/repair-shop-activation\.js/);
assert.match(activationEnhancer, /repair-activation-panel/);
assert.match(activationRuntime, /Get your shop ready for customers/);
assert.match(activationRuntime, /Подготовьте СТО к приёму клиентов/);
assert.match(activationRuntime, /Prepara tu taller para recibir clientes/);
assert.match(activationRuntime, /Prepara l’officina per i clienti/);
assert.match(activationRuntime, /Préparez votre atelier à recevoir des clients/);
assert.match(activationRuntime, /Підготуйте СТО до прийому клієнтів/);
assert.match(activationRuntime, /\/api\/repair-shop\/profile/);
assert.match(activationRuntime, /\/api\/services/);
assert.match(activationRuntime, /\/api\/repair-shop\/availability/);
assert.match(activationRuntime, /\/api\/repair-shop\/bookings/);
assert.match(activationRuntime, /serviceCount >= 3/);
assert.match(activationRuntime, /first_completed_booking/);
assert.match(activationRuntime, /completedCount\/6|completedCount}\s*\/\s*6|completedCount}\/6/);
assert.match(activationRuntime, /connect_shop_activation_view/);
assert.match(activationRuntime, /connect_shop_share_link/);
assert.match(activationRuntime, /connect_shop_plan_view/);
assert.match(activationRuntime, /connect_shop_paid_cta/);
assert.match(activationRuntime, /(?:\/repair-shops\/plan\/|\$\{ROOT\}\/plan\/)/);
assert.match(activationRuntime, /CURRENT PRODUCT/);
assert.match(activationRuntime, /Customer booking times are generated from these hours/);
assert.match(activationRuntime, /Repair pricing is set by the shop/);
assert.doesNotMatch(activationRuntime, /bar\\.innerHTML\\s*=/, "Repair booking share bar must not use innerHTML");
assert.doesNotMatch(activationRuntime, /panel\\.innerHTML\\s*=/, "Repair activation panel must not use innerHTML");
assert.doesNotMatch(
  activationRuntime,
  /window\.dataLayer(?:\.|\?\.)push\(\{[^}]*\b(?:email|phone|name|shopName|slug|client)\b[^}]*\}\)/s,
);

await import("./repair-shop-private-design-contract.test.mjs");

console.log("Repair Shop customer-focused booking actions, free-setup account/profile gates, revenue, Catalog discovery offer, six-step activation, multilingual UX, and zero-PII telemetry contracts passed.");